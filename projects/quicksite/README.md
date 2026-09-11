# كويك سايت · QuickSite

A bilingual, self-serve page builder. Answer four plain questions and watch a
real page get built from your own words — in Arabic or English. The first two
pages are free; every one after that is a fair one-time fee, never a
subscription.

This folder is the whole project. Nothing here needs a build step, a
framework, or a server: open a page and it runs.

## Where everything lives

```
projects/quicksite/
├── README.md        ← you are here: what it is, how to run it
├── content/         THE WORDS AND NUMBERS — edit this daily
│   └── data.js         brand, prices, the four kinds, the nine palettes, every UI string
├── design/          THE LOOK — colours, type, layout
│   └── styles.css
├── pages/           THE PAGES — one file per screen, all markup
│   ├── index.html      landing
│   └── brief.html      the four-question flow and its live preview
├── code/            THE LOGIC — nothing visual, nothing editorial
│   ├── site.js         rendering, language, theme, the page generator
│   └── bundle.mjs      builds the whole site into one file
├── automation/      THE WORKFLOW — n8n JSON, importable as-is
│   ├── 01-brief-submitted.json
│   └── README.md       credentials, sheet schema, what it doesn't do
└── docs/            THE THINKING
    └── idea.md         the offering, the honest limits, what comes before charging
```

The split is deliberate: **content** is what you change every week, **design**
is what a designer touches, **code** is what a developer touches, and none of
them reach into each other. Change a price in `content/data.js` and it updates
the landing page and the usage note on the brief page at once — no code edit.

## Running it

```bash
npx serve projects/quicksite/pages          # or open pages/index.html directly
node projects/quicksite/code/bundle.mjs     # → standalone.html, the whole site in one file
```

`bundle.mjs` inlines the CSS and JS and swaps page links for hash routes
(`#/`, `#/brief`), producing a single file you can host anywhere or open
offline. The pages stay the source of truth — rebuild after editing.

## What to edit for what

| You want to change | Open |
| --- | --- |
| A price, a palette, a kind, any Arabic or English wording | `content/data.js` |
| Colours, spacing, type | `design/styles.css` |
| How the brief flow or the generated page behaves | `code/site.js` |
| A page's title, description, or social preview | that file in `pages/` |
| What happens after someone sends a brief | `automation/` |

## The generated page, and what it can't do yet

`buildCustomerPage()` in `code/site.js` is the one function that produces both
the live preview (an `<iframe srcdoc>` that updates as you type) and the
downloaded file — so they can never say two different things. It writes a
full, self-contained HTML document, right-to-left and in Arabic typography
when Arabic is chosen, from the chosen palette's accent ramp.

It does not accept a logo upload or let someone write their own copy from
scratch — see [`docs/idea.md`](docs/idea.md) for why that's deliberate for now,
and what would need to change first.

## Money, and what actually happens

There is no backend, no accounts, and no card processing in the site itself.
Sending a brief composes a WhatsApp message to `PLATFORM.whatsapp` with what
the customer chose, and — when `PLATFORM.briefWebhook` holds an n8n URL — also
POSTs the same event there, fire-and-forget, so a dead webhook can never cost
a page. See [`automation/README.md`](automation/README.md).

The "first two free" count lives in the customer's own browser
(`localStorage`), not a server — an honest trade for needing no account, and
not an enforced paywall. `docs/idea.md` says so plainly rather than pretending
otherwise.

## Publishing

Any static host. For GitHub Pages: Settings → Pages → deploy from a branch,
and point it at `projects/quicksite/pages`. Before going live, change the
`<title>`, description, and `og:` tags in each page, and the inline SVG
favicon.

## Notes

- Fonts: Bricolage Grotesque (Latin display), IBM Plex Sans, IBM Plex Sans
  Arabic.
- Language, theme, and the free-page count persist in `localStorage`
  (`qs.*`).
- All rendered data passes through an HTML escaper, both in the app's own
  chrome and inside the generated customer page.
