# RentStore.ae

**مشروعك عليك والستور علينا** · YOUR SPACE TO GROW

The public site for RentStore.ae: renting retail spaces, pop-up stores and
kiosks across the UAE. Built from `sources/RentStore_Codex_Master_Specification.md`
and the approved reference sheet.

> This is **not** `projects/rentstore/`. That is a different product — an
> online storefront where merchants pay AED 55/month for a store page. This
> one rents physical space. They share a name and nothing else.

## Running it

No build step, no framework, no dependency. Open a page, or serve the folder:

```bash
npx serve projects/rentstore-ae/pages
```

## Where things live

```
projects/rentstore-ae/
├── sources/        read-only: the spec and the reference sheet
├── content/data.js every word on the site; LOCKED strings are verbatim
├── design/         the look; every colour sampled from the reference
├── code/site.js    rendering only, no copy and no colour
├── pages/          seven files, one per page
├── scripts/        extract-palette.py, which produced the colour tokens
├── assets/         IMAGE-MANIFEST.md — the 32 photographs still needed
└── SPEC-STATUS.md  what is built, what is blocked, what is undecided
```

The split is the repository's own convention: change a price in `content/`
without touching `code/`, restyle in `design/` without touching either.

## State of play

**Phase 1B is built** — the seven public pages, in the locked story order,
with the unified header.

**Three things are not done, and none of them should be guessed:**

1. **Photography.** 32 slots render a marked pending state. The spec forbids
   stock or generated substitutes, and the only supplied asset is a contact
   sheet whose panels are ~500 px wide. See `assets/IMAGE-MANIFEST.md`.
2. **Deployment and DNS.** Not done. See below.
3. **The seventh route** — `/sell` or `/list-your-space` — is undecided.
   It is set in one place, `RS.routes.list` in `content/data.js`.

Full detail, including every open question and the basis for every decision
taken, is in [`SPEC-STATUS.md`](SPEC-STATUS.md).

## Deploying, when you are ready

The build is static, so any static host serves it unchanged. What is missing
is access, not code. To proceed, someone with the account needs to supply:

- the registrar for `rentstore.ae` and access to its DNS records
- the hosting target (a static host, an existing server, or a CDN bucket)
- whether TLS is issued by the host or needs to be provisioned
- whether `https://rentstore.higgsfield.app` is meant to remain, and what it
  currently serves — it was named in an earlier conversation and has not been
  verified

Then: publish `pages/` with `design/`, `code/`, `content/` and `assets/`
alongside, point the apex and `www` at the host, and confirm the production
domain serves this build rather than a preview.

Do not change DNS on the strength of the specification alone — §12 says so
explicitly, and nothing here has verified the current state of the domain.

## Honesty rules this site keeps

Search, filters, login, the language toggle and the listing form all answer
with a plain notice rather than pretending to work. There is no backend, and
the spec forbids implying one. The figures on the Stores page — 500+ spaces,
AED 120,000/year — are design examples from the reference and carry a visible
"sample data" marker until real inventory replaces them.
