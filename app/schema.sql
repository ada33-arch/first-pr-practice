-- Schema for the design system service (Cloudflare D1 / SQLite).
--
-- Apply with:
--   npx wrangler d1 execute design-system --local  --file=app/schema.sql
--   npx wrangler d1 execute design-system --remote --file=app/schema.sql
--
-- Two things shape this file. First, one person is one account no matter how
-- many ways they sign in — so identities hang off users rather than replacing
-- them. Second, payment is deliberately not built yet, but the tables that
-- record entitlement and usage are, because retrofitting a usage count after
-- the fact means you cannot answer "how many did this person already take?"
-- for anyone who signed up before you started counting.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,           -- uuid
  email         TEXT NOT NULL,
  email_norm    TEXT NOT NULL,              -- lowercased+trimmed; the identity key
  name          TEXT,
  created_at    INTEGER NOT NULL,           -- epoch ms
  last_seen_at  INTEGER,
  -- Set by hand for the people who review deliveries. No self-service path to
  -- it, so an ordinary sign-in can never escalate into one.
  is_admin      INTEGER NOT NULL DEFAULT 0,
  blocked_at    INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_norm ON users(email_norm);

-- One row per way a person can sign in. Google, Apple and email magic link all
-- land here, so signing in with Google and later with the same address by link
-- is the same account rather than a duplicate with a separate free allowance.
CREATE TABLE IF NOT EXISTS identities (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,              -- 'google' | 'apple' | 'email'
  subject       TEXT NOT NULL,              -- provider's stable user id
  email         TEXT,
  created_at    INTEGER NOT NULL,
  UNIQUE (provider, subject)
);

CREATE INDEX IF NOT EXISTS identities_user ON identities(user_id);

-- ---------------------------------------------------------------------------
-- Sessions and sign-in tokens
-- ---------------------------------------------------------------------------

-- Only a hash is stored. A leaked database backup then yields no usable
-- session cookie, which is the whole reason not to store the token itself.
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,           -- sha-256 of the cookie value
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  user_agent    TEXT,
  revoked_at    INTEGER
);

CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

-- Magic links and OAuth state, same table because both are one-shot secrets
-- with a short life that must not be replayable.
CREATE TABLE IF NOT EXISTS login_tokens (
  id            TEXT PRIMARY KEY,           -- sha-256 of the token
  kind          TEXT NOT NULL,              -- 'magic' | 'oauth_state'
  email_norm    TEXT,                       -- magic links only
  payload       TEXT,                       -- oauth: JSON {provider, redirect, verifier, nonce}
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  consumed_at   INTEGER,
  -- Cheap brute-force ceiling for the six-digit fallback code.
  attempts      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS login_tokens_expiry ON login_tokens(expires_at);
CREATE INDEX IF NOT EXISTS login_tokens_email ON login_tokens(email_norm);

-- ---------------------------------------------------------------------------
-- The work
-- ---------------------------------------------------------------------------

-- A brief is the customer's answers. The generated files are not stored: they
-- are rebuilt from the answers on demand, so a fix to the generator improves
-- every past project rather than only new ones.
CREATE TABLE IF NOT EXISTS briefs (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT,                       -- the customer's own name for it
  kind          TEXT,                       -- website | landing | deck | portfolio
  pal_id        TEXT,
  answers       TEXT NOT NULL,              -- JSON, exactly what the generator takes
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  -- 'draft' while they are still answering, 'approved' once they confirm the
  -- page is right, 'released' once we have checked it needs no further work.
  status        TEXT NOT NULL DEFAULT 'draft',
  approved_at   INTEGER,
  released_at   INTEGER,
  released_by   TEXT REFERENCES users(id),
  review_note   TEXT,
  deleted_at    INTEGER
);

CREATE INDEX IF NOT EXISTS briefs_user ON briefs(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS briefs_status ON briefs(status, updated_at DESC);

-- Every completed download, one row. This is what the free allowance is
-- counted from, and it is written inside the same transaction that authorises
-- the download so a burst of parallel requests cannot each see an old count.
CREATE TABLE IF NOT EXISTS downloads (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brief_id      TEXT NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  bytes         INTEGER,
  -- How this one was paid for: 'free' while the allowance lasts, later
  -- 'included' (subscription) or 'purchase' (one-off).
  basis         TEXT NOT NULL DEFAULT 'free'
);

CREATE INDEX IF NOT EXISTS downloads_user ON downloads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS downloads_brief ON downloads(brief_id);

-- ---------------------------------------------------------------------------
-- Entitlement — the shape payment will fill in
-- ---------------------------------------------------------------------------

-- Nothing writes 'subscription' or 'purchase' rows yet. The table exists so
-- that when a provider is chosen, its webhook has somewhere to land and the
-- download check does not have to change: it already asks this table first and
-- falls back to the free allowance.
CREATE TABLE IF NOT EXISTS entitlements (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,              -- 'subscription' | 'purchase' | 'grant'
  brief_id      TEXT REFERENCES briefs(id) ON DELETE SET NULL,  -- purchases only
  provider      TEXT,                       -- 'stripe' | 'lemonsqueezy' | null
  provider_ref  TEXT,                       -- their id, for reconciliation
  starts_at     INTEGER NOT NULL,
  ends_at       INTEGER,                    -- null = does not expire
  cancelled_at  INTEGER,
  created_at    INTEGER NOT NULL,
  UNIQUE (provider, provider_ref)
);

CREATE INDEX IF NOT EXISTS entitlements_user ON entitlements(user_id, kind);

-- ---------------------------------------------------------------------------
-- Operational
-- ---------------------------------------------------------------------------

-- Rate limiting for the endpoints that send email or mint sessions. Keyed by
-- whatever the route decides to bucket on (IP, email), swept by expiry.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket        TEXT PRIMARY KEY,
  count         INTEGER NOT NULL,
  window_start  INTEGER NOT NULL
);

-- A plain record of things worth being able to reconstruct later: who signed
-- in, what was released, what was refused.
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY,
  at            INTEGER NOT NULL,
  user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  detail        TEXT
);

CREATE INDEX IF NOT EXISTS audit_at ON audit_log(at DESC);
