# The platform: free profile, paid store

A static, dependency-free site for a small storefront platform. Anyone signs up
free and gets a link-in-bio page under their name; adding a store — products,
cart, orders — is a monthly subscription. Perfume is only the example seller;
the store doesn't care what you sell.

Bilingual Arabic/English with full RTL, dark and light themes. No build step, no
framework, no backend — open `index.html` and it runs.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The platform landing page: hero, what you can sell, how it works, pricing, FAQ |
| `signup.html` | Free signup. `?plan=store` preselects the paid plan |
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
plans: { free: {...}, store: { price: 29, ... } },
sells: [...], steps: [...], faq: [...],
```

Change `plans.store.price` and the number updates on the landing page, the plan
cards, and the signup form together.

**`window.SITE`** — the example seller (name, links, socials, products). Swapping
this swaps the demo; the product list is where `id`, `price`, `badge`,
`featured`, and the bottle colours live.

**`window.I18N`** — every piece of interface wording.

## What actually happens when someone signs up

There is no backend, no accounts, and no payment processing. Both flows compose a
message and hand it off:

- **Signup** → opens WhatsApp to `PLATFORM.whatsapp` with the name, handle,
  number, and chosen plan. You reply and set the page up by hand.
- **An order in the store** → opens WhatsApp to that seller's number with the
  cart contents and total.

Each falls back to email, then to copying the text to the clipboard. The signup
page says this in plain words rather than implying an account was created.

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

## Notes

- Fonts come from Google Fonts (Tajawal, Plus Jakarta Sans) with system fallbacks.
- Language, theme, and cart persist in `localStorage` under the `nzm.*` keys.
- All rendered data goes through an HTML escaper; outbound links carry `rel="noopener"`.
- `prefers-reduced-motion` disables the reveal and hover motion.
