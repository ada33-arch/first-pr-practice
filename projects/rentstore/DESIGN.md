# DESIGN.md — رنت ستور / RentStore

Direction for anyone — person or agent — designing a RentStore page.

**What this file is.** antislop is a filter: it removes what shouldn't be there
and refuses to invent a replacement. This file is the replacement. It supplies
identity, palette, type, and mood; antislop enforces honesty and craft on top of
it. Neither works alone.

**Where it came from.** Nothing here was invented for this document. Every value
is transcribed from what the project already committed to:

| Source | What it supplied |
|---|---|
| `design/styles.css` | the token values, the champagne accent, dark-first |
| `content/data.js`, `docs/idea.md` | the offerings, the real numbers, the voice |
| `README.md` | the content/design/code split |
| `../../design-system/DESIGN-BRIEF.md` | the house rules this project inherits |

The one thing the house brief does **not** govern here is the palette. The brief
is a white-ground, one-saturated-accent system built for decks and corporate
web. RentStore is dark-ground and champagne. That divergence is deliberate and
predates this file — see §2.

---

## 1. Identity

An Arabic-first UAE marketplace where small merchants rent a storefront. The
merchant is a person with a phone, not a company with a procurement process.
They join free, and pay 55 AED a month only when they want to sell.

**The page has one job:** make a merchant believe that opening a store is a
small, reversible decision. Not an exciting one. A small one.

**Right-to-left is the default, not a mode.** Arabic is the source language and
English is the translation. Every layout is authored RTL-first: use logical
properties (`margin-inline`, `inset-inline-end`, `padding-block`), never `left`
/`right`. An asymmetric layout must survive the mirror.

### The swap test

> If the logo and name were replaced with another brand's, would this still look
> like itself?

For RentStore the answer has to come from three things, in this order:
1. **Arabic type set properly** — at a size and line-height that respects it,
   never as a Latin layout with Arabic poured in.
2. **Champagne on near-black.** Warm, not gold-rush. One hue.
3. **Real numbers in the copy.** 55 AED. 1,500 AED. Never a commission.

## 2. Palette

One accent, one ground. The house brief's "one accent hue, never two" rule holds
(`DESIGN-BRIEF.md` §2); the hue itself does not come from the brief's nine.

| Role | Dark (default) | Light | Notes |
|---|---|---|---|
| Ground | `#0c0a09` | `#f8f5ef` | near-black with a warm bias; never pure `#000` |
| Raised | `#17130f` | `#ffffff` | cards, the topbar when stuck |
| Ink | `#f7f2e8` | `#17140e` | 17.7:1 / 16.9:1 |
| Ink soft | `#aca396` | `#5d574c` | 7.9:1 / 6.6:1 — body copy floor |
| Accent (fills, rules, focus ring) | `#d8b475` | `#9a7433` | champagne; non-text use only in light |
| Accent as text | `#d8b475` | `#7d5d24` | 10.1:1 / 5.6:1 |
| Accent as a CTA surface | `#d8b475` | `#8a6728` | carries `--accent-ink` on top |
| On accent | `#1a1508` | `#fffaf0` | 9.3:1 dark / 5.0:1 light |

### Why champagne needs three tokens, not one

Measured with `.claude/skills/antislop-human/contrast-check.py`. One champagne
value cannot do all three jobs in light mode, so the palette splits it:

| Was | Ratio | Verdict |
|---|---|---|
| `#9a7433` as text on `#f8f5ef` | 3.92:1 | fails AA |
| `--accent-ink` `#fffaf0` on `#9a7433` | **4.10:1** | fails AA |
| `#9a7433` as a rule or focus ring | 3.92:1 | passes the 3:1 non-text bar |

An earlier draft of this file claimed `#9a7433` was safe as a fill with
`--accent-ink` on top. It is not — that is the 4.10:1 row, and it was failing
on every primary button, the brand mark and the cart badge in light mode.
Hence `--accent-text` `#7d5d24` (5.6:1) and `--accent-solid` `#8a6728` (5.0:1
under `--accent-ink`). `--accent` itself stays, for fills and rules only.

`--ink-mute` was also colouring text at **3.71:1** dark and **3.40:1** light.
It is now a control-edge colour only, which is the one job it clears 3:1 for in
all four states. Do not colour text with it, and do not add a fourth grey to
dodge this.

### Hard palette rules

- Never a second accent hue. `--spark` `#b8657a` exists for one thing (the
  favourite/heart state) and is not a brand colour.
- Never a blue-violet gradient, a neon palette, or a full-page coloured glow.
- A gradient may run **within the champagne ramp only** (`--accent` →
  `--accent-deep`), and only where it does a job: a CTA surface, the brand mark.
  Not as section decoration.
- The ambient radial glows currently behind the hero (`body::before`) are the
  single most generic thing on the page. Either give them a stated job or
  remove them.

## 3. Typography

| Role | Face | Why |
|---|---|---|
| Arabic, everything | IBM Plex Sans Arabic | the only face here that sets Arabic properly |
| Latin body | IBM Plex Sans | same skeleton, so AR/EN pages don't shift character |
| Latin display | Bricolage Grotesque | the one voice; Arabic falls through to Plex Arabic |

- Arabic needs more line-height than Latin. Body is `1.65`; do not drop it below
  `1.55` for Arabic at any size.
- Headlines are tight (`1.22`, `-0.015em`), body is loose. That gap is the
  typographic rhythm — it is doing the work a second font would otherwise do.
- Uppercase and wide tracking belong to the eyebrow label and nowhere else.
  Arabic has no uppercase; an `.eyebrow` in Arabic gets weight and colour, not
  `text-transform`.
- Never set Arabic below `0.9rem`.

## 4. Voice

The full copy rules are in `skills/antislop-copywriting`. What is specific here:

- **Gulf Arabic, spoken register.** `وش أقدر أبيع؟` not `ما هي المنتجات المتاحة`.
  The existing strings in `data.js` are the reference — match them.
- **The numbers are the argument.** 55 AED/month, 1,500 AED once, 0%
  commission, no bank card to sign up. A sentence that could run without a
  number probably should not run.
- **State the limits.** `docs/idea.md` names them: there is a queue because
  stores are built by hand; ad budget is the merchant's; support is one person
  on working hours, not 24/7. A landing page that hides these is writing a
  cheque the business can't cash.
- Forbidden outright: invented counts ("2,000+ merchants"), invented ratings,
  fake testimonials, countdown timers, "trusted by", emoji as bullets.

## 5. Mood and dials

Warm, quiet, and confident. A good shop at night with the lights still on — not
a SaaS dashboard, not a luxury boutique.

Per antislop's Liveliness Toolkit, the landing page runs:

- **ENERGY 2/3** — the hero may be loud. Below it, restraint.
- **RHYTHM 3/3** — this is where the page is weakest today. Six sections in a
  row of identically-sized rounded cards on the same ground reads as a template.
  Sections must differ in ground, width, and density, not just in content.
- **MOTION 1/3** — reveal on scroll, hover lifts, nothing else. Motion respects
  `prefers-reduced-motion`. Nothing loops forever; the current double marquee is
  the exception to kill.

## 6. Structural rules

- **Content, design, and code do not reach into each other.** Words, prices and
  plans live in `content/data.js`. Colour, type and layout live in
  `design/styles.css`. Rendering lives in `code/site.js`. A redesign that
  hard-codes an Arabic string into `site.js` has broken the project, however
  good it looks.
- No build step, no framework, no dependency. `node code/bundle.mjs` must keep
  producing a working single file.
- Both themes and both languages are first-class. A change is done when it
  holds in all four combinations.
- Tap targets ≥ 44px. Visible focus everywhere — `:focus-visible` already has an
  accent ring; do not remove it for looks.

## 7. The hero art

Decided, not open. The hero carries a full-bleed original landscape: layered
dune ridges, a distant range, warm haze, a low sun. It is drawn in SVG —
a gradient mesh sky, `feTurbulence` for cloud and haze — and reads its colours
from `--art-*` tokens, so it themes with the page instead of being a fixed
picture.

**No recognizable buildings. This is a rule, not a preference.** Not the Burj
Khalifa, not the Burj Al Arab, not the Museum of the Future, not a skyline
that resolves into any of them. Two reasons, both binding:

1. The UAE has no broad freedom-of-panorama exception, and the obvious
   candidates are actively enforced marks. A marketplace taking merchants'
   money should not put that on its front page.
2. A famous-landmark hero is the most reused image in UAE marketing. It is
   the opposite of distinctive. The horizon belongs to nobody, which is
   exactly why it can belong to this.

The art's purpose, per the filter's purpose test: the hero was a flat ground
with a phone floating on it and nothing saying where any of this happens. The
landscape puts the product somewhere without naming a city, and gives the
phone mock something to stand in front of.

### The scrims are a contrast device, not decoration

Five text elements sit on this art. No honest set of art values clears 4.5:1
for all of them unaided, so `--scene-veil-1/2/3` pull the art back toward the
page ground under the copy column and let it run clear across the rest.
Measured worst cases, sampled from the rendered pixels behind each element
rather than estimated:

| State | Tightest element | Ratio |
|---|---|---|
| Arabic dark, 1440 | lede | 5.63:1 |
| English dark, 1440 | lede | 6.41:1 |
| Arabic dark, 390 | eyebrow | 7.93:1 |
| **Arabic light, 1440** | **lede** | **4.72:1** |

**4.72:1 is the binding constraint on the whole design.** It is what stops the
veils being loosened further to show more of the picture. Any change to
`--scene-veil-*`, `--art-*`, or `--ink-soft` has to re-measure that number, and
it may not go below 4.5:1.

### Two things that will break it

- **Enlarging the art on mobile.** The SVG viewBox is 16:9 and the element is
  16:9, so nothing is cropped. Scaling it up turns a wide landscape into a
  centre crop of about a fifth of the picture, which is mush. Fit by width.
- **Dropping in a raster sky carelessly.** `.scene__raster` exists for that and
  is documented in `design/styles.css`. It sits above the drawn sky and behind
  the land, and it is masked at the horizon. Set it per theme — a dusk
  photograph under the light theme breaks every number in the table above.

## 8. What this file does not decide

Left open on purpose: section order, how the plan cards are laid out, and
whether the category band stays a sentence. Those are design decisions. This
file constrains them; it does not make them.
