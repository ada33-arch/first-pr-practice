# The platform: free profile, paid store

A static, dependency-free site for a small storefront platform. Three ways in:
a free link-in-bio page under your name, a monthly subscription that adds a store
(products, cart, orders), or a one-time setup service that includes a UAE trade
licence and a store built for you. Perfume is only the example seller; the store
doesn't care what you sell.

Bilingual Arabic/English with full RTL, dark and light themes. No build step, no
framework, no backend — open `index.html` and it runs.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The platform landing page: hero, what you can sell, how it works, pricing, FAQ |
| `signup.html` | Signup. `?plan=store` or `?plan=setup` preselects that plan |
| `setup.html` | The setup-and-licence service: what's on us, what's on you, the stages, the fees, licence FAQ |
| `demo.html` | The example seller's link page — what a customer's page looks like |
| `store.html` | The example seller's store: search, categories, product grid |
| `product.html?id=<id>` | One product: art, price, details, quantity, buy |

Seller pages carry a ribbon marking them as an example, and their own brand in
the topbar; platform pages carry the platform's brand and a signup button. The
topbar, ribbon, and cart drawer are all injected by `assets/js/site.js`.

## Editing your content

Everything lives in [`assets/js/data.js`](assets/js/data.js), split in two.
Every string is a pair — `{ ar: "…", en: "…" }`.

**`window.PLATFORM`** — the business.

```js
name: { ar: "متجري", en: "Matjari" },   // your brand
domain: "matjari.ae",                    // shown in the @handle preview
whatsapp: "971508400886",                // where signups arrive
plans: { free: {...}, store: { price: 29 }, setup: { price: 1500 } },
setup: { ours: [...], yours: [...], steps: [...], fees: [...], faq: [...] },
sells: [...], steps: [...], faq: [...],
```

Change `plans.store.price` or `plans.setup.price` and the number updates on the
landing page, the plan cards, the setup page, and the signup form together.

`PLATFORM.setup` holds the service itself: what you do, what the customer brings,
the stage-by-stage timeline, and the fee breakdown. Two lines in there are load
bearing and should survive any rewrite — the licence is issued by the government
authority and not by you, and the confirmed government fee is quoted on the first
call, before any payment.

**`window.SITE`** — the example seller (name, links, socials, products). Swapping
this swaps the demo; the product list is where `id`, `price`, `badge`,
`featured`, and the bottle colours live.

**`window.I18N`** — every piece of interface wording.

## What actually happens when someone signs up

There is no backend, no accounts, and no payment processing. Both flows compose a
message and hand it off:

- **Signup** → opens WhatsApp to `PLATFORM.whatsapp` with the name, handle,
  number, and chosen plan. You reply and set the page up by hand.
- **The setup plan** → the same form, routed to `PLATFORM.setupWebhook` instead,
  because it opens a case that runs for days rather than a signup that finishes
  in a second.
- **An order in the store** → opens WhatsApp to that seller's number with the
  cart contents and total.

Each falls back to email, then to copying the text to the clipboard. The signup
page says this in plain words rather than implying an account was created.

Both also POST to an n8n webhook when one is configured — `PLATFORM.signupWebhook`
and `SITE.orderWebhook`. That's where the automation lives: see [`../n8n/`](../n8n/)
for the four workflows and what each one sends. The POST is fire-and-forget, so a
webhook that is down or unset costs nothing; the WhatsApp handoff still runs.

That's enough to launch and take your first subscribers. Real accounts, hosted
per-seller pages, and card payments need a server — that's the next build, not
this one.

## One file instead of five

`node bundle.mjs` inlines the CSS and JS and swaps page links for hash routes
(`#/`, `#/signup`, `#/demo`, `#/store`, `#/product?id=…`), producing a single
`standalone.html` you can host anywhere or open offline. The multi-page version
stays the source of truth — rebuild after editing `data.js`.

## Running it

```bash
npx serve site      # or: python3 -m http.server -d site 8000
```

## Publishing

Any static host works. For GitHub Pages: Settings → Pages → deploy from a branch,
pick the branch and the `/site` folder.

Before going live, change the `<title>`, `description`, and `og:` tags in each
HTML file, and the inline SVG favicon in each `<head>`.

## The motion

All of it is drawn in the browser — no GIFs, no video, no animation library, nothing
to download. It lives in the motion section at the end of `styles.css` and the
`motion()` block in `site.js`:

- a drifting aurora behind the hero, plus film grain and a hairline grid so the
  background isn't a flat gradient
- the headline arrives word by word
- the phone floats, and a cursor taps through its links on a loop
- the categories run as two marquees going opposite ways
- the connector behind the three steps draws itself on arrival
- prices roll up from zero when their card scrolls in
- the bottles bob out of sync, with a shimmer crossing the glass
- primary buttons lean toward the cursor, on devices that have one

`prefers-reduced-motion: reduce` turns off every one of them, and the page stays
complete and readable without any of it.

## Notes

- Fonts come from Google Fonts (Bricolage Grotesque for Latin display, IBM Plex
  Sans and IBM Plex Sans Arabic for text) with system fallbacks.
- Language, theme, and cart persist in `localStorage` under the `nzm.*` keys.
- All rendered data goes through an HTML escaper; outbound links carry `rel="noopener"`.
- `prefers-reduced-motion` disables the reveal and hover motion.
