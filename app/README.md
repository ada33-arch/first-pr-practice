# The online service

Accounts, saved projects and server-built downloads for the design system.

Registration is live. **Downloads are free** — payment is deliberately not
built yet. Every download is counted from day one, because a usage count is the
one thing that cannot be added retrospectively: turn charging on in six months
and you still need to know what everyone already took.

---

## What runs where

| | |
|---|---|
| **Pages** | `design-system/` served as static assets |
| **API** | A Cloudflare Worker owning `/auth/*` and `/api/*` |
| **Data** | D1 (SQLite) — users, projects, downloads |
| **Files** | Built on demand from the stored answers; nothing is kept |

Files are rebuilt rather than stored, so improving the generator improves every
past project, not only new ones.

---

## Running it locally

```bash
cd app
npm install
npm run db:local        # create the tables
npm run dev             # http://localhost:8787
```

With no mail provider configured, the sign-in route returns the link in its own
response and the page shows it. That happens **only** when `ENVIRONMENT` is
`development` — never in production.

---

## Going live

### 1. A Cloudflare account

```bash
npx wrangler login
npx wrangler d1 create design-system
```

Put the printed `database_id` into `wrangler.toml`, then create the tables:

```bash
npm run db:remote
npm run deploy
```

That is already a working site: people can register by email, build a project
and download it.

### 2. Email, so sign-in links arrive

Without this, nobody can sign in — the link is generated but never sent.

1. Create a [Resend](https://resend.com) account (free tier is ample) and verify
   your sending domain.
2. `npx wrangler secret put RESEND_API_KEY`
3. Set `MAIL_FROM` in `wrangler.toml` to an address on that domain.

### 3. Google sign-in *(optional)*

1. Google Cloud console → APIs & Services → Credentials → **OAuth client ID**,
   type *Web application*.
2. Authorised redirect URI: `https://yourdomain.com/auth/google/callback`
3. `npx wrangler secret put GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 4. Apple sign-in *(optional, and the fiddly one)*

Apple needs a **paid Apple Developer account (~$99/year)**. Worth knowing before
you start, because nothing here works without it.

1. Register an **App ID**, then a **Services ID** (this is your `APPLE_CLIENT_ID`,
   e.g. `com.yourcompany.designsystem.web`).
2. Configure the Services ID: domain `yourdomain.com`, return URL
   `https://yourdomain.com/auth/apple/callback`.
3. Create a **Sign in with Apple key** and download the `.p8`. **You can only
   download it once.**
4. Set four secrets:
   ```bash
   npx wrangler secret put APPLE_CLIENT_ID    # the Services ID
   npx wrangler secret put APPLE_TEAM_ID      # Membership page
   npx wrangler secret put APPLE_KEY_ID       # the key's ID
   npx wrangler secret put APPLE_PRIVATE_KEY  # the whole .p8 contents
   ```

Apple only ever sends someone's **name on their first authorisation** — miss it
and it is gone permanently. That is handled, but it is why an Apple user may
have no name where a Google user does.

**A provider with no credentials simply does not appear on the sign-in page.**
A button that leads to a configuration error is worse than no button.

---

## Turning charging on later

The check is already written. Switching it on is configuration, not a rewrite.

```toml
PAYWALL = "on"      # in wrangler.toml
```

That alone enforces the free allowance: `FREE_DOWNLOADS` in `src/index.js` (2),
then `402 payment_required`. What is still missing is the part that takes money:

1. **Pick a provider.** For selling internationally, a merchant of record
   (Lemon Squeezy, Paddle) is the seller of record and handles VAT in every
   country. Stripe is cheaper but leaves tax registration and filing to you.
2. **Add a checkout route** that sends people to the provider's hosted page.
   Do not build a card form — see [`SELLING.md`](../design-system/SELLING.md).
3. **Add a webhook** that verifies the provider's signature and writes one row
   into `entitlements`:
   - a subscription → `kind='subscription'` with `ends_at`
   - a single template → `kind='purchase'` with the `brief_id`

The download check already reads that table first and falls back to the free
allowance, so nothing else changes. This has been tested: with the paywall on
and the allowance spent, inserting a subscription row lets the download through
and records it as `included`.

### Holding files until you have checked them

You mentioned confirming a job needs no further work before the files go out.
That is built and off by default:

```toml
REVIEW_BEFORE_RELEASE = "on"
```

Downloads then return `409` with "we're checking your files over" until a brief
reaches `status = 'released'`. **The admin screen to do the releasing is not
built yet** — today you would set it in SQL. Leave this `off` until it is.

---

## Configuration

| Setting | Where | Default | What it does |
|---|---|---|---|
| `PAYWALL` | `wrangler.toml` | `off` | Enforce the free-download allowance |
| `REVIEW_BEFORE_RELEASE` | `wrangler.toml` | `off` | Hold files until released |
| `SUPPORT_EMAIL` | `wrangler.toml` | — | Printed in the delivered README |
| `RESEND_API_KEY` | secret | — | Sends the sign-in email |
| `GOOGLE_CLIENT_ID` / `_SECRET` | secret | — | Enables Google |
| `APPLE_CLIENT_ID` / `_TEAM_ID` / `_KEY_ID` / `_PRIVATE_KEY` | secret | — | Enables Apple |

Secrets never go in `wrangler.toml` — it is committed.

---

## How the security holds up

Each of these is verified by a test against a running Worker, not by argument:

- **The download is server-only.** It is a `POST`, it assembles the package from
  stored answers, and it is the only place a package exists. A page that builds
  its own zip can never be gated, which is why generation moved server-side.
- **Sessions and sign-in tokens are stored as SHA-256 hashes.** A leaked backup
  yields nothing presentable.
- **One-shot tokens are read and burned in one statement**, so the same link
  cannot be used twice — including by two requests racing.
- **ID tokens are fully verified**: signature against the provider's JWKS,
  issuer, audience, expiry and nonce. A decoded JWT proves nothing on its own.
- **Email matching requires the provider to have verified it**, so asserting
  someone's address at a lax provider cannot claim their account.
- **Customer text is escaped** wherever it reaches markup, and a logo `src` must
  be a `data:image` URL. Briefs are stored and later rendered where someone else
  is signed in, so this is a real boundary rather than self-inflicted.
- **Cross-origin state changes are rejected** on `Origin`, backing up
  `SameSite=Lax`.
- **Another account's project returns 404**, not 403 — no confirmation that an
  id exists.

---

## Still to build

Named honestly, because they are the difference between this and a finished
product:

- **Taking money.** Everything around it is in place; the provider is not.
- **An admin screen** for releasing files, needed before
  `REVIEW_BEFORE_RELEASE` is any use.
- **Account deletion.** People can sign up, so they must be able to leave and
  take their data with them. `ON DELETE CASCADE` is in the schema; the route is
  not.
- **A privacy policy and terms**, before real customers — you are storing
  personal data the moment someone registers.
