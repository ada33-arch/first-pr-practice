# Design Brief — House Style

**Hand this document to any designer, agency, or AI tool.** It defines the format
to keep. Anything not specified here is open to interpretation; anything
specified here is not.

> **Before designing anything, run the intake.** Six questions in
> [`INTAKE.md`](INTAKE.md) (or click through `examples/picker.html`) decide the
> layer, accent, ground, CTA, imagery and mode — and produce a *scope* naming the
> exact files and classes for the job, so nobody re-reads the whole system to
> build one page.

This brief was distilled from a 32-template reference set of corporate
presentation and web designs. It describes what those designs have in common —
the rules that make them read as one house style rather than 32 unrelated files.

---

## 1. The one-sentence version

> Clean corporate layouts on white, driven by **a single saturated accent colour**
> and **one dark anchor**, with heavy geometric headline type, generous rounded
> corners, oversized section numerals, and soft geometric ornament in the corners.

If a deliverable does not read that way at a glance, it is off-brief.

---

## 2. Colour

### The rule: one accent, one anchor, lots of white

Every document commits to **exactly one accent hue**. That hue does all the
emphasis work — buttons, icon chips, section panels, the first chart series, the
highlighted word in a headline. A second accent hue is never introduced.

| Role | What it does | Share of the page |
|---|---|---|
| **Accent** | Every point of emphasis. The brand signal. | 10–20% |
| **Ink** (near-black / deep navy) | Headlines, dark-fill slides, gravity. | 15–25% |
| **White / off-white** | The default ground. Space to breathe. | 55–70% |
| **Grey** | Body copy, hairlines, receded chart series. | remainder |

### Approved accent families

Pick one per document. All nine are equally house-correct.

| Theme | Signature | Notes |
|---|---|---|
| **Amber** | `#F5B21A` | **Default for decks.** Warmest, most-used. Dark text on top. |
| **Violet** | `#7C4DFF` | **Default for web.** Signature of the favourites set. White text on top. |
| **Electric** | `#2B50EE` | Tech, SaaS, product. White text on top. |
| **Indigo** | `#4059F0` | Fintech, payments, product. White text on top. |
| **Navy** | `#2B4A8B` | Finance, consulting, formal. White text on top. |
| **Teal** | `#22BCCE` | Product, startup, healthcare. Dark text on top. |
| **Green** | `#17A673` | Sustainability, wellness. White text on top. |
| **Lime** | `#C3DE4A` | Pairs with a cream ground, not white. Dark text on top. |
| **Coral** | `#E85D33` | Marketing, creative, retail. White text on top. |

Full ramps (50 → 700) live in `tokens/tokens.json`.

### Ink and surfaces

- Ink: `#14181F` (near-black) or `#1B2333` / `#233049` for a navy-leaning anchor.
- Ground: pure `#FFFFFF`, or `#F7F8FA` / `#FAF6EC` (cream) for a softer document.
- Never grey-on-grey. Body copy sits at `#3A4761`, not lighter.

### Hard rules

- **Never** put two accent families in one document.
- **Never** use a gradient as a brand colour. In decks, gradients are permitted
  only as a photo scrim. On web pages they may additionally fill a hero surface,
  a CTA band, or a glow orb — and must run *within one accent ramp*
  (`accent-600 → accent-500 → accent-300`), so it is still one hue. See
  [`FAVORITES.md`](FAVORITES.md) §"Rules specific to this set".
- Accent-on-accent text must clear 4.5:1 — use `--accent-on` from the tokens,
  which is already set correctly per theme.

---

## 3. Typography

### The rule: one family, heavy display over quiet body

**One geometric-grotesque family** across the whole document. Poppins or
Montserrat for display; Inter for long body copy is an acceptable pairing. Never
more than two families total, never a serif, never a script.

| Level | Weight | Tracking | Use |
|---|---|---|---|
| Display | 800 | −0.03em | Cover titles only |
| H1 | 800 | −0.025em | Section and slide titles |
| H2 | 700 | −0.02em | Sub-heads |
| H3 | 700 | −0.01em | Card titles |
| H4 | 600 | 0 | Feature labels |
| Body | 400 | 0 | Paragraphs, 1.65 line-height |
| Small | 400 | 0 | Card copy, captions |
| **Eyebrow** | 600 | **+0.18em, UPPERCASE** | The label above a headline |
| Numeral | 800 | −0.04em | Oversized `01` `02` `03` |

### Signature moves

1. **The eyebrow.** A short uppercase, wide-tracked, accent-coloured label sits
   above nearly every headline. This is the single most recognisable tic of the
   style. Use it constantly.

2. **The two-tone headline.** One word in the headline flips to the accent
   colour, or from regular to black weight:
   `Doing Everything **Right**` · `Business **Report**` · `Vision & **Mission**`

3. **The light/heavy pair.** Cover titles stack a thin line over a black line:
   `CORPORATE` (regular) over `PRESENTATION` (black).

4. **Tabular numerals** everywhere figures appear — stats, tables, timelines.

### Hard rules

- Headlines are **tight** (line-height ≤ 1.12) and **negatively tracked**.
- Body is **roomy** (line-height 1.6–1.65) and never tracked.
- Body copy never exceeds ~62 characters per line.
- Never centre a paragraph longer than two lines.

---

## 4. Layout & space

- **4px base grid.** Every measurement lands on it.
- **12-column** structure for web; slides use a **6.5% safe margin** on all sides.
- The workhorse layout is the **asymmetric split** — roughly 5:7 or 7:5, headline
  block on one side, content or media on the other. Rarely 50:50.
- Content sits in **cards** with 20px radius and a 32px inner pad.
- White space is a feature, not waste. When a slide feels crowded, cut content —
  do not shrink the type.

---

## 5. Shape language

**Generous rounding is a signature.** Sharp corners are the exception, reserved
for full-bleed colour blocks.

| Radius | Use |
|---|---|
| 6px | Inputs, small chips |
| 12px | Icon chips, buttons (square variant) |
| 20px | **Cards — the default** |
| 32px | Media panels, large feature blocks |
| 48px | Hero media |
| pill | Buttons, tags, avatars, meter bars |

Recurring shape motifs, all of them ornamental and `aria-hidden`:

- **Circles and quarter-circles** bleeding off a corner
- **Organic blobs** in accent-50 or accent-100 behind content
- **Dotted matrices** tucked into slide corners
- **Offset blocks** — a solid accent rectangle peeking out from behind a card or
  photo (the "stacked paper" look)
- **The notched panel** — rounded on three corners, square on one

---

## 6. Imagery

- **Real photography** of people at work, cities, and product. No cartoon
  clip-art in business decks. Flat vector illustration is acceptable only for
  education and children's material.
- Photos are **masked**: rounded rectangles (32px), circles for people, or the
  notched panel. Never a bare square photo dropped on a slide.
- Two permitted colour treatments:
  - **Accent wash** — accent multiplied over the photo at ~55% for section covers
  - **Bottom scrim** — dark gradient bottom-up when type sits over the image
- People photos are cropped to torso-up, eyes on the upper third.
- Icons are **line or solid, single weight, one style throughout**, placed in an
  accent-filled chip. Never mix icon styles.

---

## 7. Data & charts

- **Series 1 is always the accent.** Everything after it recedes into greys, so
  one bar or line reads as "the point".
- Gridlines are `#ECEFF3` hairlines. No chart borders, no 3D, no drop shadows.
- Label data directly on the marks where possible; a legend is a fallback.
- Big figures get the **stat treatment**: accent-coloured value at 3× the label
  size, uppercase tracked label beneath.
- Percentage rings, meter bars and progress tracks all use the accent at full
  saturation on an `--ink-100` track.

---

## 8. Standard deck sequence

A complete presentation follows this order. Drop sections that do not apply;
never reorder them.

1. **Cover** — title, subtitle, presenter, date, logo
2. **Contents / agenda** — numbered, two columns
3. **Section divider** — oversized numeral + section title on an accent panel
4. **About / who we are** — split layout, photo + copy
5. **Vision & mission** — two-up cards
6. **Services / what we do** — 3 or 4 icon cards
7. **Process / how it works** — numbered steps `01 02 03`
8. **Team** — circular avatars, name + role
9. **Numbers** — stat row on a dark or accent slide
10. **Timeline / roadmap** — horizontal milestone track
11. **SWOT** — 2×2, strengths on accent, weaknesses on ink
12. **Charts / financials** — accent + grey series
13. **Testimonials** — quote mark, avatar, name + company
14. **Pricing / comparison table** — if applicable
15. **Contact / thank you** — closing, details, socials

Section dividers reset the numeral count. Every non-cover slide carries logo
top-left, section kicker top-right, page number bottom-right.

---

## 9. Deliverable checklist

Before accepting work, verify:

- [ ] Exactly one accent hue used throughout
- [ ] White or off-white is the dominant ground (>55%)
- [ ] Eyebrow labels present above headlines
- [ ] At least one two-tone headline on the cover
- [ ] Headline tracking is negative, body tracking is zero
- [ ] Card radius is consistent at 20px (or 32px for media)
- [ ] All photos are masked, none are bare rectangles
- [ ] Chart series 1 is the accent; the rest are grey
- [ ] Slide furniture (logo / kicker / page number) on every content slide
- [ ] Section numerals are oversized and present on dividers
- [ ] Nothing crosses the 6.5% safe margin
- [ ] Body copy ≤ 62 characters per line
- [ ] Accent-on-accent text passes 4.5:1 contrast

---

## 10. What this style is not

Stating the negative space saves rounds of revision:

- Not brutalist, not neumorphic, not glassmorphic
- Not dark-mode-first — the ground is light
- Not maximalist; no texture, no noise, no pattern fills
- No drop shadows harder than `0 12px 32px rgba(20,24,31,0.09)`
- No outlined display type, no letterpress, no bevels
- No stock illustration of the "corporate Memphis" blob-people variety in
  business material
- No more than one accent hue, ever

---

## 11. Machine-readable assets

| File | What it is |
|---|---|
| `FAVORITES.md` | The second reference set — web landing pages — and the rules specific to it |
| `tokens/tokens.json` | Platform-agnostic tokens — import into Figma, Style Dictionary, or a build |
| `tokens/tokens.css` | CSS custom properties + the nine accent themes |
| `css/base.css` | Reset and typographic primitives |
| `css/components.css` | Cards, stats, steps, timelines, SWOT, buttons, media |
| `css/slides.css` | 16:9 slide surfaces and slide archetypes |
| `css/web.css` | Web-only: gradient heroes, device mockups, rails, pricing, FAQ, marquee |
| `powerpoint/SPEC.md` | Point sizes and inch positions for a 13.333″ × 7.5″ slide |
| `examples/index.html` | Corporate web page built from the deck layer |
| `examples/deck.html` | Full slide deck built from the system |
| `examples/landing.html` | SaaS landing page built from the web layer |

**Which layer to start from:** presentations and reports use the deck layer and
default to amber; landing pages, SaaS sites and portfolios use the web layer and
default to violet. Both share the same tokens, so a deck and a site for the same
client stay in family.

### Prompt to hand an AI tool

> Build this using the Corporate Deck Design System. Single accent hue
> (`{amber|violet|electric|indigo|navy|teal|green|lime|coral}`), near-black ink
> anchor, white ground. Poppins display / Inter body. Uppercase tracked eyebrow
> labels above headlines, one two-tone headline at the top, 20px card radius,
> oversized section numerals, accent-filled icon chips, masked photography,
> charts with the accent as series 1 and greys after. Import `tokens/tokens.css`
> and use the existing component classes rather than writing new CSS.
>
> For a **deck**: also import `css/slides.css`, follow the standard deck
> sequence, default to amber.
> For a **web page**: also import `css/web.css`, default to violet, use a
> gradient hero with a device mockup, a trust bar, tinted feature cards, a step
> rail, pricing with a featured tier, an FAQ, and a CTA band.
