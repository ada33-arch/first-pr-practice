/* Every statement that touches D1 lives here, so the routes read as intent
 * rather than SQL and there is one place to check when the schema moves. */

export const now = () => Date.now();
export const uuid = () => crypto.randomUUID();

/* Tokens are compared by hash, never stored raw: a leaked backup then yields
 * nothing a caller could present as a valid session. */
export async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(bytes = 32) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const normaliseEmail = email => String(email || '').trim().toLowerCase();

/* ---- Users and identities ------------------------------------------------- */

/* Resolve a sign-in to an account. The provider identity wins if we have seen
 * it before; otherwise the verified email address decides, which is what makes
 * "sign in with Google, then later with a magic link" one account and one free
 * allowance rather than two.
 *
 * Only call this with an email the provider actually verified — matching on an
 * unverified address would let anyone claim an existing account by asserting
 * its address at a provider that never checked. */
export async function findOrCreateUser(db, { provider, subject, email, name, emailVerified }) {
  const emailNorm = normaliseEmail(email);

  const existing = await db.prepare(
    'SELECT user_id FROM identities WHERE provider = ? AND subject = ?')
    .bind(provider, subject).first();

  if (existing) {
    await db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?')
      .bind(now(), existing.user_id).run();
    return getUser(db, existing.user_id);
  }

  let user = emailNorm && emailVerified
    ? await db.prepare('SELECT * FROM users WHERE email_norm = ?').bind(emailNorm).first()
    : null;

  if (!user) {
    const id = uuid();
    await db.prepare(
      `INSERT INTO users (id, email, email_norm, name, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, email || '', emailNorm, name || null, now(), now()).run();
    user = await getUser(db, id);
  } else {
    await db.prepare('UPDATE users SET last_seen_at = ?, name = COALESCE(name, ?) WHERE id = ?')
      .bind(now(), name || null, user.id).run();
  }

  await db.prepare(
    `INSERT OR IGNORE INTO identities (id, user_id, provider, subject, email, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(uuid(), user.id, provider, subject, email || null, now()).run();

  return getUser(db, user.id);
}

export const getUser = (db, id) =>
  db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();

/* ---- Sessions ------------------------------------------------------------- */

export async function createSession(db, userId, { userAgent, days = 30 } = {}) {
  const token = randomToken();
  await db.prepare(
    `INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent)
     VALUES (?, ?, ?, ?, ?)`)
    .bind(await sha256(token), userId, now(), now() + days * 86400_000,
          (userAgent || '').slice(0, 200)).run();
  return token;
}

export async function userForSession(db, token) {
  if (!token) return null;
  const row = await db.prepare(
    `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?
        AND u.blocked_at IS NULL`)
    .bind(await sha256(token), now()).first();
  return row || null;
}

export async function revokeSession(db, token) {
  if (!token) return;
  await db.prepare('UPDATE sessions SET revoked_at = ? WHERE id = ?')
    .bind(now(), await sha256(token)).run();
}

/* ---- One-shot login tokens ------------------------------------------------ */

export async function storeLoginToken(db, { token, kind, emailNorm, payload, minutes = 15 }) {
  await db.prepare(
    `INSERT INTO login_tokens (id, kind, email_norm, payload, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(await sha256(token), kind, emailNorm || null,
          payload ? JSON.stringify(payload) : null, now(), now() + minutes * 60_000).run();
}

/* Consume is deliberately one call: reading and burning a one-shot secret in
 * separate steps leaves a window where the same link works twice. */
export async function consumeLoginToken(db, { token, kind }) {
  const id = await sha256(token);
  const row = await db.prepare(
    `SELECT * FROM login_tokens
      WHERE id = ? AND kind = ? AND consumed_at IS NULL AND expires_at > ?`)
    .bind(id, kind, now()).first();
  if (!row) return null;

  const burned = await db.prepare(
    'UPDATE login_tokens SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL')
    .bind(now(), id).run();
  // If another request burned it between the read and here, it is not ours.
  if (!burned.meta.changes) return null;

  return { ...row, payload: row.payload ? JSON.parse(row.payload) : null };
}

/* ---- Briefs --------------------------------------------------------------- */

export async function saveBrief(db, { id, userId, title, kind, palId, answers }) {
  const json = JSON.stringify(answers);
  if (id) {
    const res = await db.prepare(
      `UPDATE briefs SET title = ?, kind = ?, pal_id = ?, answers = ?, updated_at = ?
        WHERE id = ? AND user_id = ? AND deleted_at IS NULL AND status <> 'released'`)
      .bind(title || null, kind || null, palId || null, json, now(), id, userId).run();
    if (res.meta.changes) return getBrief(db, id, userId);
  }
  const newId = uuid();
  await db.prepare(
    `INSERT INTO briefs (id, user_id, title, kind, pal_id, answers, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(newId, userId, title || null, kind || null, palId || null, json, now(), now()).run();
  return getBrief(db, newId, userId);
}

export const getBrief = (db, id, userId) =>
  db.prepare('SELECT * FROM briefs WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .bind(id, userId).first();

export const listBriefs = (db, userId) =>
  db.prepare(
    `SELECT id, title, kind, pal_id, status, created_at, updated_at, approved_at, released_at
       FROM briefs WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 50`)
    .bind(userId).all();

export const approveBrief = (db, id, userId) =>
  db.prepare(
    `UPDATE briefs SET status = 'approved', approved_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ? AND deleted_at IS NULL AND status = 'draft'`)
    .bind(now(), now(), id, userId).run();

/* ---- Downloads and the allowance ------------------------------------------ */

export const countDownloads = async (db, userId) =>
  (await db.prepare('SELECT COUNT(*) AS n FROM downloads WHERE user_id = ?')
    .bind(userId).first()).n;

/* Has this brief already been paid for or taken? A second copy of something
 * they already have should never consume another allowance. */
export const alreadyDownloaded = async (db, userId, briefId) =>
  Boolean(await db.prepare(
    'SELECT 1 FROM downloads WHERE user_id = ? AND brief_id = ? LIMIT 1')
    .bind(userId, briefId).first());

export async function recordDownload(db, { userId, briefId, bytes, basis }) {
  await db.prepare(
    `INSERT INTO downloads (id, user_id, brief_id, created_at, bytes, basis)
     VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(uuid(), userId, briefId, now(), bytes || null, basis || 'free').run();
}

/* An active subscription, or a purchase of this particular brief. Nothing
 * writes these rows yet — the paywall is off — but the download check asks
 * here first, so switching payment on is a matter of filling this table. */
export async function entitlementFor(db, userId, briefId) {
  const sub = await db.prepare(
    `SELECT * FROM entitlements
      WHERE user_id = ? AND kind IN ('subscription','grant') AND cancelled_at IS NULL
        AND starts_at <= ? AND (ends_at IS NULL OR ends_at > ?) LIMIT 1`)
    .bind(userId, now(), now()).first();
  if (sub) return { basis: 'included', entitlement: sub };

  const one = await db.prepare(
    `SELECT * FROM entitlements
      WHERE user_id = ? AND kind = 'purchase' AND brief_id = ? AND cancelled_at IS NULL LIMIT 1`)
    .bind(userId, briefId).first();
  if (one) return { basis: 'purchase', entitlement: one };

  return null;
}

/* ---- Rate limiting -------------------------------------------------------- */

/* A fixed window, which is coarse but honest: it is here to stop someone
 * pumping the email sender or guessing codes, not to shape traffic. */
export async function hitRateLimit(db, bucket, { limit, windowMs }) {
  const start = now() - windowMs;
  const row = await db.prepare('SELECT * FROM rate_limits WHERE bucket = ?').bind(bucket).first();

  if (!row || row.window_start < start) {
    await db.prepare(
      `INSERT INTO rate_limits (bucket, count, window_start) VALUES (?, 1, ?)
       ON CONFLICT(bucket) DO UPDATE SET count = 1, window_start = excluded.window_start`)
      .bind(bucket, now()).run();
    return { allowed: true, remaining: limit - 1 };
  }

  if (row.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((row.window_start + windowMs - now()) / 1000) };
  }

  await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE bucket = ?').bind(bucket).run();
  return { allowed: true, remaining: limit - row.count - 1 };
}

/* ---- Audit ---------------------------------------------------------------- */

export async function audit(db, { userId, action, detail }) {
  await db.prepare(
    'INSERT INTO audit_log (id, at, user_id, action, detail) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), now(), userId || null, action,
          typeof detail === 'string' ? detail : JSON.stringify(detail || null)).run();
}
