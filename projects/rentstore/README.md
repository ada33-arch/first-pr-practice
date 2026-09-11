# رنت ستور · RentStore

An Arabic-first UAE marketplace. One website holding many merchants' stores.
Shoppers browse everything in one place; merchants join free, then pay monthly to
open a store inside it — and we do the work they can't do alone: build the store,
market it, secure it, support it.

This folder is the whole project. Nothing here needs a build step, a framework,
or a server: open a page and it runs.

## Where everything lives

```
projects/rentstore/
├── README.md        ← you are here: what it is, how to run it
├── content/         THE WORDS AND NUMBERS — edit this daily
│   └── data.js        brand, prices, plans, stores, the demo seller, every string
├── design/          THE LOOK — colours, type, layout, motion
│   ├── styles.css
│   └── img/           logos and photos go here
├── pages/           THE PAGES — one file per screen, all markup
│   ├── index.html       landing
│   ├── marketplace.html every store, searchable — the "browse many merchants" page
│   ├── signup.html      free signup, ?plan= preselects
│   ├── setup.html       the licence + setup service
│   ├── demo.html        a merchant's link page
│   ├── store.html       that merchant's store
│   └── product.html     one product
├── code/            THE LOGIC — nothing visual, nothing editorial
│   ├── site.js        rendering, language, theme, cart, motion
│   └── bundle.mjs     builds the whole site into one file
├── automation/      THE WORKFLOWS — n8n JSON, importable as-is
│   ├── 01-signup-free.json
│   ├── 02-store-activation.json
│   ├── 03-subscription-renewal.json
│   ├── 04-customer-order.json
│   ├── 05-setup-and-licence.json
│   ├── README.md      credentials, sheet schema, the WhatsApp 24-hour rule
│   └── maps/          the business drawn on an n8n canvas — maps, not automations
└── docs/            THE THINKING
    ├── idea.md        the business: offerings, promises, roadmap, open decisions
    ├── idea-map.html  every path through the idea, numbered for correction
    ├── journeys.html  the four journey maps, readable without n8n
    └── timeline.html  every workflow traced step by step
```

The split is deliberate: **content** is what you change every week, **design** is
what a designer touches, **code** is what a developer touches, and none of them
reach into each other. Change a price in `content/data.js` and it updates the
landing page, the plan cards, and the signup form at once — no code edit.

## Adding a real store to the marketplace

`content/data.js` exports one merchant as `SITE` (the flagship demo) and every
merchant, including that one, as `MERCHANTS`. `marketplace.html` lists all of
them; visiting any of `demo.html`, `store.html`, or `product.html` with
`?m=<id>` switches the whole page to that merchant — same code, same markup,
just a different entry in the array. Add a new merchant by copying one of the
existing `MERCHANTS` entries (own `id`, `handle`, products, `whatsapp`) — no
other file needs to change. Each merchant's cart is stored separately
(`nzm.cart.<id>`), so a customer's cart on one store never appears on another.

## Running it

```bash
npx serve projects/rentstore                # then open /pages/index.html
node projects/rentstore/code/bundle.mjs     # → standalone.html, the whole site in one file
```

Serve `projects/rentstore` itself, not `projects/rentstore/pages` — the pages load
`../content/data.js` and `../code/site.js` by relative path, which a dev server
resolves as outside its root (and refuses) if `pages/` is the served directory.
Opening `pages/index.html` directly as a `file://` URL works either way, since
there's no server root to escape.

`bundle.mjs` inlines the CSS and JS and swaps page links for hash routes
(`#/`, `#/signup`, `#/setup`, `#/demo`, `#/store`, `#/product?id=…`), producing a
single file you can host anywhere or open offline. The pages stay the source of
truth — rebuild after editing.

## What to edit for what

| You want to change | Open |
| --- | --- |
| A price, a plan, a product, any Arabic or English wording | `content/data.js` |
| Colours, spacing, type, animation | `design/styles.css` |
| What a page contains or how it behaves | `code/site.js` |
| A page's title, description, or social preview | that file in `pages/` |
| What happens after a signup or an order | `automation/` |

## Money, and what actually happens

There is no backend, no accounts, and no card processing in the site itself.
Both flows compose a message and hand it off:

- **Signup** → WhatsApp to `PLATFORM.whatsapp` with name, handle, number, plan.
  The full-setup plan routes to its own workflow instead.
- **An order** → WhatsApp to that merchant's number with the cart and total.

Each falls back to email, then to the clipboard. When `PLATFORM.signupWebhook`,
`PLATFORM.setupWebhook`, or `SITE.orderWebhook` hold an n8n URL, the same event
is also POSTed there — fire-and-forget, so a webhook that is down can never cost
a sale. See [`automation/README.md`](automation/README.md).

Merchants take payment from their customers directly. We charge a subscription
and take no commission — which is also what keeps this runnable without a
payment licence.

## The motion

Every animation is drawn in the browser: no GIFs, no video, no libraries. A
drifting aurora over film grain and a hairline grid; the headline arriving word
by word; the hero phone floating while a cursor taps through it; two marquees
of categories; a connector that draws itself; prices rolling up from zero;
bottles bobbing out of sync. All of it switches off under
`prefers-reduced-motion`, and the page stays complete without any of it.

## Publishing

Any static host. For GitHub Pages: Settings → Pages → deploy from a branch, and
point it at `projects/rentstore/pages`. Before going live, change the `<title>`,
description, and `og:` tags in each page, and the inline SVG favicon.

## Notes

- Fonts: Bricolage Grotesque (Latin display), IBM Plex Sans, IBM Plex Sans Arabic.
- Language, theme, cart, and buyer details persist in `localStorage` (`nzm.*`).
- All rendered data passes through an HTML escaper; outbound links carry `rel="noopener"`.
