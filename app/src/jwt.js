/* Verifying the identity tokens Google and Apple hand back, and signing the
 * one Apple demands in return.
 *
 * The verification here is the security boundary of the whole sign-in: a token
 * that is merely *decoded* proves nothing at all, because anyone can write a
 * JWT claiming to be anyone. So each check below — signature, issuer,
 * audience, expiry, nonce — is load-bearing, and a token failing any one of
 * them is rejected rather than repaired.
 */

const b64urlToBytes = s => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - pad.length % 4) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};

const bytesToB64url = bytes =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const decodeJson = part => JSON.parse(new TextDecoder().decode(b64urlToBytes(part)));

/* JWKS changes rarely and fetching it on every sign-in adds a round trip to
 * the slowest part of the flow, so keep it for a few minutes. */
const jwksCache = new Map();

async function fetchJwks(url) {
  const hit = jwksCache.get(url);
  if (hit && hit.expires > Date.now()) return hit.keys;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const { keys } = await res.json();
  jwksCache.set(url, { keys, expires: Date.now() + 10 * 60_000 });
  return keys;
}

const ALGS = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  ES256: { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' },
};

/* Verify a provider's ID token and return its claims.
 *
 * `nonce` is required for the providers we use: it ties the token to the
 * sign-in attempt that started in this browser, so a token lifted from another
 * flow cannot be replayed into ours. */
export async function verifyIdToken(idToken, { jwksUrl, issuer, audience, nonce, leewaySec = 60 }) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new Error('malformed token');

  const header = decodeJson(parts[0]);
  const claims = decodeJson(parts[1]);
  const alg = ALGS[header.alg];
  if (!alg) throw new Error(`unsupported alg: ${header.alg}`);

  const keys = await fetchJwks(jwksUrl);
  const jwk = keys.find(k => k.kid === header.kid && (!k.alg || k.alg === header.alg));
  if (!jwk) throw new Error('signing key not found');

  const key = await crypto.subtle.importKey(
    'jwk', jwk,
    header.alg === 'ES256' ? { name: 'ECDSA', namedCurve: 'P-256' }
                           : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']);

  const ok = await crypto.subtle.verify(
    header.alg === 'ES256' ? { name: 'ECDSA', hash: 'SHA-256' } : 'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw new Error('bad signature');

  const nowSec = Math.floor(Date.now() / 1000);
  const issuers = Array.isArray(issuer) ? issuer : [issuer];
  if (!issuers.includes(claims.iss)) throw new Error(`unexpected issuer: ${claims.iss}`);

  // aud may be a string or an array; either way ours has to be in it.
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(audience)) throw new Error('token was not issued for this application');

  if (typeof claims.exp !== 'number' || claims.exp + leewaySec < nowSec) throw new Error('token expired');
  if (typeof claims.iat === 'number' && claims.iat - leewaySec > nowSec) throw new Error('token issued in the future');
  if (nonce && claims.nonce !== nonce) throw new Error('nonce mismatch');
  if (!claims.sub) throw new Error('token carries no subject');

  return claims;
}

/* Apple does not issue a client secret. You register a key, download a .p8
 * once, and sign a short-lived ES256 JWT with it on every token exchange —
 * which is why this exists and Google needs no equivalent. */
export async function appleClientSecret({ teamId, clientId, keyId, privateKeyPem }) {
  const pkcs8 = b64urlToBytes(
    privateKeyPem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '')
      .replace(/\+/g, '-').replace(/\//g, '_'));

  const key = await crypto.subtle.importKey(
    'pkcs8', pkcs8, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = {
    iss: teamId,
    iat: nowSec,
    exp: nowSec + 3600,        // Apple caps this at six months; an hour is plenty
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };

  const enc = new TextEncoder();
  const signingInput =
    `${bytesToB64url(enc.encode(JSON.stringify(header)))}.${bytesToB64url(enc.encode(JSON.stringify(payload)))}`;

  const sig = new Uint8Array(await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(signingInput)));

  return `${signingInput}.${bytesToB64url(sig)}`;
}

/* PKCE. Without it, an authorization code intercepted on the redirect can be
 * exchanged by whoever holds it; with it, the exchange also needs the verifier
 * that never left this server. */
export async function pkcePair() {
  const verifier = bytesToB64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: bytesToB64url(new Uint8Array(digest)) };
}
