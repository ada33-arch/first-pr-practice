# Multi-vendor marketplace

A static, dependency-free marketplace: many sellers, each with their own storefront
inside one site. Buyers browse across every store or step into one; a cart that spans
several stores splits into one order per seller.

Bilingual Arabic/English with full RTL, dark and light themes, and a cart that survives
a reload. No build step, no framework, no backend — open `index.html` and it runs.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Marketplace home: brand, quick links, featured stores, featured products |
| `vendors.html` | The store directory: search and filter every seller by what they do |
| `vendor.html?id=<id>` | One seller's storefront: their header, their products, contact them |
| `store.html` | Every product from every store, filterable by category **and** by store |
| `product.html?id=<id>` | One product: art, price, what's included, and the store selling it |
| `apply.html` | The store builder: a seller fills a form and watches their storefront build itself |
| `404.html` | Standalone not-found page — renders even if the JS fails to load |
| `robots.txt`, `sitemap.xml` | Crawler basics. The domain in them is set by `scripts/set-domain.sh` |
| `CNAME` | Written by `scripts/set-domain.sh`; not committed until you pick a domain |

`store.html?vendor=<id>` opens the all-products grid pre-filtered to one store.

The topbar (stores, products, language, theme, cart) and the cart drawer are injected by
`assets/js/site.js`, so every page stays a few lines of HTML.

## Editing your content

**Everything you change day-to-day is in [`assets/js/data.js`](assets/js/data.js).**
Every piece of text is a pair — `{ ar: "…", en: "…" }` — and the site picks the side
matching the current language. The file holds three lists:

### `window.SITE` — the marketplace

Your brand, your bio, your support number, the currency, the quick links on the home
page, and `orderRouting` (below).

### `window.VENDORS` — the sellers

One entry per store. `id` is what appears in `vendor.html?id=`, so keep it stable once
a store is live.

```js
{
  id: "nova-systems",
  name:     { ar: "أنظمة نوفا", en: "Nova Systems" },
  tagline:  { ar: "…", en: "…" },
  category: { ar: "أنظمة", en: "Systems" },   // groups the store in the directory
  whatsapp: "9715XXXXXXXX",                    // this seller's own number
  verified: true,     // shows the check next to their name
  featured: true,     // puts them in the home-page rail
  since: 2023,
  art: { emoji: "🧾", from: "#3a2f5f", to: "#0f0d1a" },
}
```

### `window.PRODUCTS` — what they sell

Same shape as before, plus one required field: **`vendor`**, matching an `id` in
`VENDORS`. A product whose `vendor` doesn't match any store still renders, but it
loses its "sold by" line and its orders fall back to the marketplace number.

- `id` must be unique (it's the `?id=` in the product URL)
- `featured: true` puts it in the home rail
- `oldPrice` renders the struck-through price, `badge` the corner label
- `image: "assets/img/x.jpg"` for a photo; with none, `art: { emoji, from, to }` is drawn

**Interface wording** lives in `window.I18N` at the bottom of the same file. Both
languages must carry the same keys.

## Taking orders

A cart can hold products from several stores at once, which raises the question of who
receives the order. `SITE.orderRouting` decides:

**`"vendor"` (default)** — each seller gets their own order on their own WhatsApp number.
The cart drawer groups lines by store, shows a subtotal per store, and gives each one its
own send button. Three stores in the cart means three orders. Use this when sellers
fulfil and get paid directly.

**`"owner"`** — every order comes to you as one message, labelled by store with a subtotal
for each, and you settle with the sellers afterwards. Use this when you take a commission
or handle fulfilment centrally.

Either way, if a number is missing the order falls back: seller's number → marketplace
number → a pre-filled mail draft → copy-to-clipboard. It never silently drops an order.

This is deliberate: it needs no server and no merchant account, and it matches how most
Gulf marketplaces actually start. When you want card payments, replace `checkout()` and
`checkoutGroup()` in `assets/js/site.js` with a redirect to a payment link, and pass each
group's total to it.

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve site      # or: python3 -m http.server -d site 8000
```

Serve over HTTP rather than `file://` if you're testing the cart — `localStorage` is
restricted on file URLs in some browsers.

## Publishing

`.github/workflows/pages.yml` deploys this folder to GitHub Pages on every push to
`main` — set Settings → Pages → Source to **GitHub Actions** once and it's automatic.
Any other static host works too; Cloudflare Pages is the better choice for a Gulf
audience because it has UAE edge locations.

The custom domain is **`rentstore.ae`** — set in `CNAME`, the canonical tags, the
`og:url` tags, `robots.txt`, and `sitemap.xml`. To move to a different domain, one
command rewrites all of them:

```bash
scripts/set-domain.sh newdomain.ae
```

The full walkthrough, including the DNS records that have to exist at the registrar
before the domain resolves, is in
[`docs/ae-domain-and-launch.md`](../docs/ae-domain-and-launch.md).

Two things to change before you go live:
- the `<title>`, `description`, and `og:` tags in each HTML file
- `favicon` — the inline SVG in each `<head>`

## How sellers get in

`apply.html` is the intake. A seller fills it in on their phone and the right-hand
panel renders their storefront live — the same `storefront`, `vendorCard`, and
`productCard` components the real site uses, so what they see is what customers get.
It teaches a good listing while they write one: a thin description visibly looks thin.

They pick an icon and a colour from fixed sets rather than uploading a logo. That is
deliberate — a static site has nowhere to receive an upload, and fixed palettes keep
every store looking like it belongs to the same marketplace. When a seller has real
product photography, they send it over WhatsApp and you drop it in `assets/img/`.

Pressing **Send my store** produces a JSON block:

```json
{ "vendor": { "id": "…", "name": {…}, … }, "products": [ … ] }
```

Where it goes depends on `SITE.applyAction`:

- **Set** to a form endpoint that accepts JSON (Formspree, Getform, Basin) → the
  builder POSTs it and the submission lands in your inbox.
- **Empty** → the payload is copied to the seller's clipboard and WhatsApp opens on
  your number for them to paste. The JSON is deliberately *not* stuffed into the
  `wa.me` link: a real store's payload is far longer than a URL can carry.

Either way it arrives as data, not prose. Paste `vendor` into `VENDORS` and the
`products` array into `PRODUCTS`, commit, and the store is live. Nothing the seller
submits reaches the site until you do that — the review step is the whole point.

The builder validates before it will send: a store name, a category, a WhatsApp number
to receive orders, and at least one product with a name and a price.

## Where this stops being enough

Everything here is static, which means **you** paste each submission into `data.js` and
commit. That's the right trade for the first couple of dozen stores — no backend, no
hosting bill, nothing to break, and the review step is what keeps the marketplace worth
browsing.

Two things will eventually push past it. When pasting becomes the bottleneck, split
`data.js` into per-seller JSON files and have a GitHub Action turn a submission into a
pull request you merge. When sellers start asking to change **their own** prices — the
one request static hosting simply cannot answer — it is time for real accounts and an
API. The storefront markup, the cart splitting, and the order routing all survive that
move; only where the data lives changes.

## Notes

- Fonts come from Google Fonts (Tajawal for Arabic, Plus Jakarta Sans for Latin) and
  fall back to system fonts offline.
- Language, theme, and cart live in `localStorage` under the `nzm.*` keys.
- Product and vendor data is rendered through an HTML-escaper, and outbound links carry
  `rel="noopener"`.
- `prefers-reduced-motion` disables the reveal and hover motion.
