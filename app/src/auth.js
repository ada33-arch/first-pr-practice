/* The three ways in: Google, Apple, and an emailed link.
 *
 * All three converge on findOrCreateUser, so the account is the person rather
 * than the button they happened to press.
 */

import { verifyIdToken, appleClientSecret, pkcePair } from './jwt.js';
import {
  findOrCreateUser, createSession, revokeSession, storeLoginToken, consumeLoginToken,
  normaliseEmail, randomToken, hitRateLimit, audit, now,
} from './db.js';
import { sendMagicLink } from './email.js';

const SESSION_COOKIE = 'ds_session';

export function sessionCookie(token, { secure, maxAgeDays = 30 } = {}) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',                       // script must never be able to read it
    'SameSite=Lax',                   // survives the OAuth redirect back to us
    `Max-Age=${maxAgeDays * 86400}`,
  ];
  if (secure) parts.push('Secure');   // omitted only for http://localhost in dev
  return parts.join('; ');
}

export const clearCookie = ({ secure }) =>
  `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;

export function readCookie(request, name = SESSION_COOKIE) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const isSecure = url => url.protocol === 'https:';

const redirect = (to, headers = {}) =>
  new Response(null, { status: 302, headers: { Location: to, ...headers } });

/* Only ever send people back inside this site. An open redirect here would let
 * a phishing link borrow our domain and land the visitor somewhere else. */
function safeReturnTo(value) {
  const v = String(value || '/');
  return /^\/(?!\/)/.test(v) ? v : '/';
}

/* ---- Google ---------------------------------------------------------------
   Authorization code + PKCE. We ask only for the identity scopes; there is
   nothing in a Google account this service needs beyond who they are. ------- */

const GOOGLE = {
  auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  jwks: 'https://www.googleapis.com/oauth2/v3/certs',
  issuers: ['https://accounts.google.com', 'accounts.google.com'],
};

export async function googleStart(request, env, url) {
  if (!env.GOOGLE_CLIENT_ID) return providerUnavailable('Google');

  const { verifier, challenge } = await pkcePair();
  const state = randomToken(16);
  const nonce = randomToken(16);

  await storeLoginToken(env.DB, {
    token: state, kind: 'oauth_state', minutes: 10,
    payload: { provider: 'google', verifier, nonce, returnTo: safeReturnTo(url.searchParams.get('returnTo')) },
  });

  const authorise = new URL(GOOGLE.auth);
  authorise.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state, nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();

  return redirect(authorise.toString());
}

export async function googleCallback(request, env, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return signInFailed(url, 'Google did not return a sign-in code.');

  const stored = await consumeLoginToken(env.DB, { token: state, kind: 'oauth_state' });
  if (!stored || stored.payload?.provider !== 'google') {
    return signInFailed(url, 'That sign-in link has expired. Please try again.');
  }

  const res = await fetch(GOOGLE.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/auth/google/callback`,
      grant_type: 'authorization_code',
      code_verifier: stored.payload.verifier,
    }),
  });
  if (!res.ok) return signInFailed(url, 'Google would not complete the sign-in.');

  const { id_token } = await res.json();
  let claims;
  try {
    claims = await verifyIdToken(id_token, {
      jwksUrl: GOOGLE.jwks, issuer: GOOGLE.issuers,
      audience: env.GOOGLE_CLIENT_ID, nonce: stored.payload.nonce,
    });
  } catch (err) {
    await audit(env.DB, { action: 'signin.rejected', detail: { provider: 'google', reason: err.message } });
    return signInFailed(url, 'We could not verify that sign-in.');
  }

  // An unverified address must not be allowed to claim an existing account.
  if (claims.email && claims.email_verified !== true && claims.email_verified !== 'true') {
    return signInFailed(url, 'Google has not verified that email address.');
  }

  return completeSignIn(request, env, url, {
    provider: 'google', subject: claims.sub, email: claims.email,
    name: claims.name, emailVerified: true, returnTo: stored.payload.returnTo,
  });
}

/* ---- Apple ----------------------------------------------------------------
   Apple posts the result back as a form rather than a query string, and only
   ever sends the person's name on the very first authorisation — so it is
   taken from the form when present and never expected again. --------------- */

const APPLE = {
  auth: 'https://appleid.apple.com/auth/authorize',
  token: 'https://appleid.apple.com/auth/token',
  jwks: 'https://appleid.apple.com/auth/keys',
  issuer: 'https://appleid.apple.com',
};

export async function appleStart(request, env, url) {
  if (!env.APPLE_CLIENT_ID) return providerUnavailable('Apple');

  const state = randomToken(16);
  const nonce = randomToken(16);
  await storeLoginToken(env.DB, {
    token: state, kind: 'oauth_state', minutes: 10,
    payload: { provider: 'apple', nonce, returnTo: safeReturnTo(url.searchParams.get('returnTo')) },
  });

  const authorise = new URL(APPLE.auth);
  authorise.search = new URLSearchParams({
    client_id: env.APPLE_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/apple/callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',       // required once scopes are requested
    scope: 'name email',
    state, nonce,
  }).toString();

  return redirect(authorise.toString());
}

export async function appleCallback(request, env, url) {
  const form = await request.formData();
  const state = form.get('state');
  const code = form.get('code');
  if (!state || !code) return signInFailed(url, 'Apple did not return a sign-in code.');

  const stored = await consumeLoginToken(env.DB, { token: String(state), kind: 'oauth_state' });
  if (!stored || stored.payload?.provider !== 'apple') {
    return signInFailed(url, 'That sign-in link has expired. Please try again.');
  }

  let secret;
  try {
    secret = await appleClientSecret({
      teamId: env.APPLE_TEAM_ID, clientId: env.APPLE_CLIENT_ID,
      keyId: env.APPLE_KEY_ID, privateKeyPem: env.APPLE_PRIVATE_KEY,
    });
  } catch (err) {
    await audit(env.DB, { action: 'signin.misconfigured', detail: { provider: 'apple', reason: err.message } });
    return signInFailed(url, 'Apple sign-in is not configured correctly.');
  }

  const res = await fetch(APPLE.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: String(code),
      client_id: env.APPLE_CLIENT_ID,
      client_secret: secret,
      redirect_uri: `${url.origin}/auth/apple/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) return signInFailed(url, 'Apple would not complete the sign-in.');

  const { id_token } = await res.json();
  let claims;
  try {
    claims = await verifyIdToken(id_token, {
      jwksUrl: APPLE.jwks, issuer: APPLE.issuer,
      audience: env.APPLE_CLIENT_ID, nonce: stored.payload.nonce,
    });
  } catch (err) {
    await audit(env.DB, { action: 'signin.rejected', detail: { provider: 'apple', reason: err.message } });
    return signInFailed(url, 'We could not verify that sign-in.');
  }

  if (claims.email && claims.email_verified !== true && claims.email_verified !== 'true') {
    return signInFailed(url, 'Apple has not verified that email address.');
  }

  // Sent once, on first authorisation only. Miss it and it is gone for good.
  let name = null;
  try {
    const raw = form.get('user');
    if (raw) {
      const parsed = JSON.parse(String(raw));
      name = [parsed?.name?.firstName, parsed?.name?.lastName].filter(Boolean).join(' ') || null;
    }
  } catch { /* a malformed extra is not a reason to fail the sign-in */ }

  return completeSignIn(request, env, url, {
    provider: 'apple', subject: claims.sub, email: claims.email,
    name, emailVerified: Boolean(claims.email), returnTo: stored.payload.returnTo,
  });
}

/* ---- Magic link -----------------------------------------------------------
   No password to store, forget, reset, or leak. The link carries a one-shot
   token; the six-digit code is the same token by another route, for people
   who open their mail on a different device. ------------------------------- */

export async function magicRequest(request, env, url) {
  const body = await request.json().catch(() => ({}));
  const email = normaliseEmail(body.email);
  const returnTo = safeReturnTo(body.returnTo);

  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'That does not look like an email address.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  for (const [bucket, limit, windowMs] of [
    [`magic:ip:${ip}`, 10, 15 * 60_000],
    [`magic:email:${email}`, 5, 15 * 60_000],
  ]) {
    const gate = await hitRateLimit(env.DB, bucket, { limit, windowMs });
    if (!gate.allowed) {
      return json({ error: 'Too many sign-in emails. Try again shortly.' }, 429,
        { 'Retry-After': String(gate.retryAfter || 60) });
    }
  }

  const token = randomToken(24);
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
  await storeLoginToken(env.DB, { token, kind: 'magic', emailNorm: email, minutes: 15, payload: { code, returnTo } });
  await storeLoginToken(env.DB, { token: `${email}:${code}`, kind: 'magic', emailNorm: email, minutes: 15, payload: { returnTo } });

  const link = `${url.origin}/auth/magic/callback?token=${token}`;
  const sent = await sendMagicLink(env, { to: email, link, code });

  /* The same answer either way. Telling callers which addresses exist, or
   * which sends failed, hands them an account-enumeration oracle. */
  await audit(env.DB, { action: 'signin.magic.requested', detail: { email, delivered: sent.ok } });

  return json({
    ok: true,
    message: 'If that address can receive mail, a sign-in link is on its way.',
    // In development there is no mail provider, so surface the link rather
    // than making it undiscoverable. Never enabled in production.
    devLink: env.ENVIRONMENT === 'development' ? link : undefined,
    devCode: env.ENVIRONMENT === 'development' ? code : undefined,
  });
}

export async function magicCallback(request, env, url) {
  const token = url.searchParams.get('token');
  const stored = await consumeLoginToken(env.DB, { token: String(token || ''), kind: 'magic' });
  if (!stored) return signInFailed(url, 'That link has expired or has already been used.');

  return completeSignIn(request, env, url, {
    provider: 'email', subject: stored.email_norm, email: stored.email_norm,
    emailVerified: true, returnTo: stored.payload?.returnTo,
  });
}

export async function magicVerifyCode(request, env, url) {
  const body = await request.json().catch(() => ({}));
  const email = normaliseEmail(body.email);
  const code = String(body.code || '').trim();

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const gate = await hitRateLimit(env.DB, `code:${ip}:${email}`, { limit: 8, windowMs: 15 * 60_000 });
  if (!gate.allowed) return json({ error: 'Too many attempts. Try again shortly.' }, 429);

  const stored = await consumeLoginToken(env.DB, { token: `${email}:${code}`, kind: 'magic' });
  if (!stored) return json({ error: 'That code is wrong or has expired.' }, 400);

  const user = await findOrCreateUser(env.DB, {
    provider: 'email', subject: email, email, emailVerified: true,
  });
  const session = await createSession(env.DB, user.id, { userAgent: request.headers.get('User-Agent') });
  await audit(env.DB, { userId: user.id, action: 'signin', detail: { provider: 'email', via: 'code' } });

  return json({ ok: true, user: publicUser(user) }, 200,
    { 'Set-Cookie': sessionCookie(session, { secure: isSecure(url) }) });
}

/* ---- Shared tail ---------------------------------------------------------- */

async function completeSignIn(request, env, url, { provider, subject, email, name, emailVerified, returnTo }) {
  const user = await findOrCreateUser(env.DB, { provider, subject, email, name, emailVerified });
  if (user.blocked_at) return signInFailed(url, 'That account is not available.');

  const session = await createSession(env.DB, user.id, { userAgent: request.headers.get('User-Agent') });
  await audit(env.DB, { userId: user.id, action: 'signin', detail: { provider } });

  return redirect(safeReturnTo(returnTo), {
    'Set-Cookie': sessionCookie(session, { secure: isSecure(url) }),
  });
}

export async function signOut(request, env, url) {
  const token = readCookie(request);
  await revokeSession(env.DB, token);
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie({ secure: isSecure(url) }) });
}

export const publicUser = user => ({
  id: user.id, email: user.email, name: user.name, isAdmin: Boolean(user.is_admin),
});

const providerUnavailable = which =>
  json({ error: `${which} sign-in is not configured on this deployment.` }, 501);

/* Failures land back on the sign-in page with something a person can read,
 * never with the underlying reason — which would only help someone probing. */
const signInFailed = (url, message) =>
  redirect(`/signin?error=${encodeURIComponent(message)}`);

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
