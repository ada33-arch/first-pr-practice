# Favourite Designs

A second reference set, added after the original 32 deck templates. These are
**web landing pages**, and they behave differently enough to warrant their own
layer (`css/web.css`) rather than being folded into the deck rules.

Where the deck set is flat, printed, and photography-led, the favourites set is
screen-native: gradients, glow, and **product UI as the hero visual**.

---

## The 12 references

| # | Subject | Accent | What it contributes |
|---|---|---|---|
| 1 | App landing page (FR) | Violet gradient | Gradient hero + **wave divider**, dotted matrices, icon-circle trio, stat cards |
| 2 | Fintech WordPress theme (FR) | **Lime on cream** | Dark UI cards on a pale ground, **underlined accent word**, FAQ accordion, CTA slab |
| 3 | Flowora — SaaS productivity | Indigo/violet | Two-tone headline, **tinted feature cards**, stat strip, pricing with "Most Popular" |
| 4 | Nexora — product/e-commerce | Indigo→violet | Laptop + phone mockups, floating price card, **trust icons row**, oversized display type |
| 5 | Swix — developer portfolio | Violet | **Marquee strip**, floating label pins over a portrait, service list rows |
| 6 | Alex — portfolio, **dark** | Violet on near-black | Full dark variant, glow orb, numbered work grid, dark stat cards |
| 7 | Aaron Reed — portfolio | Blue | Eyebrow labels throughout, stat row, 01–04 process with arrows |
| 8 | Education landing | Pink/violet | **Ghost numerals on a dotted rail**, alternating sides, quote card with tail |
| 9 | SwiftTechBuy — how it works | Red | `STEP 01/02/03` rail with dotted connectors, circular image masks |
| 10 | Ezypay — fintech transfer | Indigo | Numbered feature sections, full-page + thumbnail presentation |
| 11 | Paynt — e-wallet | Violet | Alternating light/violet section bands, logo wall, feature card grid |
| 12 | Payment gateway | Violet | Dark violet feature band, KPI row, testimonial grid |

**Violet is the signature of this set** — six of twelve. It is now the default
recommendation for web work, as amber is for decks.

---

## What this set adds to the system

New accent themes: `theme-violet`, `theme-indigo`, `theme-lime`.

New components in `css/web.css`:

| Pattern | Class |
|---|---|
| Gradient hero + soft glow orb | `.hero-gradient`, `.orb` |
| Curved section transition | `.wave` |
| "NEW · Introducing X" pill | `.badge-pill` |
| Accent-underlined headline word | `.underlined` |
| Gradient-filled headline word | `.gradient-text` |
| Phone / browser mockup frames | `.device--phone`, `.device--browser` |
| Floating stat card over a mockup | `.float-card` |
| Label chip pinned to a portrait | `.pin` |
| Logo / trust row | `.trustbar` |
| Tinted feature cards | `.tint-grid`, `.tint-card`, `.tint-1…4` |
| Ghost numerals on a dotted rail | `.rail`, `.rail__num` |
| Pricing with a featured tier | `.price-card`, `.checklist` |
| FAQ accordion | `.faq` |
| Scrolling keyword band | `.marquee` |
| CTA slab + newsletter field | `.cta-band`, `.field-group` |
| Dark page variant | `.on-dark` overrides |

---

## Rules specific to this set

The core brief still governs — one accent, ink anchor, eyebrow labels, two-tone
headlines, 20px card radius. These are the additions and the exceptions:

1. **Gradients are allowed here, in three places only:** the hero surface, a CTA
   band, and a soft glow orb. Never on a card, a button, or a logo. The gradient
   runs within one accent ramp — `accent-600 → accent-500 → accent-300` — so it
   is still one hue, not two.

2. **Product UI is the hero image.** A dashboard or app screen in a device frame
   replaces stock photography. Screens are cropped to the top and never
   letterboxed.

3. **Tints are supports, not second accents.** The four card tints are
   desaturated far enough that the accent still owns every point of emphasis. If
   a tint starts competing, it is too saturated.

4. **The step rail replaces the deck's `.steps`** for long-form web pages:
   oversized ghost numerals down a dotted spine, copy and visual alternating
   sides. The deck's compact three-column version stays for slides.

5. **Dark pages are permitted on this set only** — portfolios and product pages.
   Decks stay light-ground. Use `.on-dark` on a near-black surface; the web layer
   carries cards, rails and fields across.

6. **One motion element per page maximum.** The marquee is the usual choice.
   Everything honours `prefers-reduced-motion`.

---

## Choosing between the two sets

| Deliverable | Start from | Default accent |
|---|---|---|
| Presentation, PPT template, report | deck layer (`slides.css`) | amber |
| Landing page, SaaS site, portfolio | web layer (`web.css`) | violet |
| Corporate website for a deck client | web layer, deck's accent | match the deck |

Both layers share the same tokens, so a deck and a site for the same client stay
in family — swap the theme class and the whole system follows.
