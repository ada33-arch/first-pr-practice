# Link-in-bio + storefront

A static, dependency-free site in the shape of a creator link page (like nzmly.com):
an elegant profile page of links, a product store, and a product page that closes
the sale over WhatsApp.

Bilingual Arabic/English with full RTL, dark and light themes, and a cart that
survives a reload. No build step, no framework, no backend — open `index.html` and
it runs.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The link-in-bio page: avatar, bio, socials, link cards, featured products, optional newsletter block |
| `store.html` | The store: search, category chips, product grid |
| `product.html?id=<id>` | One product: art, price, what's included, quantity, buy |

The topbar (language, theme, cart) and the cart drawer are injected by
`assets/js/site.js`, so every page stays a few lines of HTML.

## Editing your content

**Everything you change day-to-day is in [`assets/js/data.js`](assets/js/data.js).**
Every piece of text is a pair — `{ ar: "…", en: "…" }` — and the site picks the side
matching the current language.

```js
window.SITE = {
  handle: "Abdullrhman",
  name: { ar: "عبدالرحمن", en: "Abdullrhman" },
  whatsapp: "9665XXXXXXXX",     // digits only, country code first, no + and no spaces
  currency: { ar: "ر.س", en: "SAR" },
  ...
}
```

- **Profile** — `name`, `bio`, `handle`, `verified`. Set `avatar: "assets/img/me.jpg"`
  to use a photo; leave it empty and the `initials` are drawn instead.
- **Links** — the `links` array, top to bottom. `url` can be a page (`store.html`),
  an external URL, or the literal `"wa"` to build a WhatsApp link from your number.
  Add `tag: { ar: "الأهم", en: "Top" }` for the little highlight pill.
- **Products** — the `products` array. `id` must be unique (it's the `?id=` in the
  product URL). `featured: true` puts it in the home rail. `oldPrice` renders the
  struck-through price, `badge` the corner label.
- **Product art** — set `image: "assets/img/course.jpg"` for a real photo. With no
  image it falls back to `art: { emoji, from, to }` — an emoji on a gradient.
- **Interface wording** — `window.I18N` at the bottom of the same file.

## Taking payment

Checkout builds a formatted order and hands it off:

1. `whatsapp` set → opens WhatsApp with the order pre-written. **Recommended.**
2. Otherwise `email` set → opens a pre-filled mail draft.
3. Otherwise → copies the order to the clipboard and tells the buyer to send it.

This is deliberate: it needs no server and no merchant account, and it matches how
most creator storefronts actually take orders. When you want card payments, replace
the `checkout()` function in `assets/js/site.js` with a redirect to a payment link
(Stripe Payment Links, Tap, Moyasar, PayLink) and pass the cart total to it.

The newsletter block only appears once `newsletterAction` (a form POST endpoint from
Mailchimp, Buttondown, Formspree…) or `email` is set. It stays hidden rather than
pretending to collect addresses that go nowhere. Same for the WhatsApp link card,
which hides until a number exists.

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve site      # or: python3 -m http.server -d site 8000
```

## One file instead of three

`node site/bundle.mjs` inlines the CSS and JS and swaps the page links for hash
routes (`#/store`, `#/product?id=…`), producing a single `site/standalone.html`
you can email, drop on any host, or open offline. The multi-page version stays
the source of truth — rebuild after editing `data.js`.

## Publishing

Any static host works. For GitHub Pages: Settings → Pages → deploy from a branch,
pick the branch and the `/site` folder. Then point your domain at it and put the
link in your Instagram bio.

Two things to change before you go live:
- the `<title>`, `description`, and `og:` tags in each HTML file
- `favicon` — the inline SVG in each `<head>`

## Notes

- Fonts come from Google Fonts (Tajawal for Arabic, Plus Jakarta Sans for Latin) and
  fall back to system fonts offline.
- Language, theme, and cart live in `localStorage` under the `nzm.*` keys.
- Product data is rendered through an HTML-escaper, and outbound links carry
  `rel="noopener"`.
- `prefers-reduced-motion` disables the reveal and hover motion.
