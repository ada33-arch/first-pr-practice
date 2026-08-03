# Corporate Deck Design System

A codified version of my house style, so that a website, a PowerPoint template,
or anything I commission from a designer comes back looking like it belongs to
the same family.

Distilled from a 32-template reference set of corporate presentation and web
designs. The system captures what those files have in common — one saturated
accent hue, a near-black anchor, heavy geometric headline type, generous rounded
corners, oversized section numerals, and soft geometric ornament.

---

## What's here

```
design-system/
├── DESIGN-BRIEF.md        ← hand this to any designer or AI tool
├── tokens/
│   ├── tokens.json        ← platform-agnostic tokens (Figma, Style Dictionary, builds)
│   └── tokens.css         ← CSS custom properties + the six accent themes
├── css/
│   ├── base.css           ← reset + typographic primitives
│   ├── components.css     ← cards, stats, steps, timelines, SWOT, buttons, media
│   └── slides.css         ← 16:9 slide surfaces and slide archetypes
├── powerpoint/
│   └── SPEC.md            ← pt sizes and inch positions for a 13.333" × 7.5" slide
└── examples/
    ├── index.html         ← web landing page built from the system
    └── deck.html          ← 14-slide deck built from the system
```

Open either example file directly in a browser — no build step, no dependencies,
no network requests.

---

## Using it on the web

```html
<html class="theme-amber">
  <head>
    <link rel="stylesheet" href="design-system/tokens/tokens.css">
    <link rel="stylesheet" href="design-system/css/base.css">
    <link rel="stylesheet" href="design-system/css/components.css">
    <!-- only if you are building slides -->
    <link rel="stylesheet" href="design-system/css/slides.css">
  </head>
```

Then compose from the existing classes:

```html
<section class="section">
  <div class="container stack stack-6">
    <div class="stack stack-3">
      <span class="eyebrow">What we do</span>
      <h2 class="h2">Four practices, one <em>rhythm</em></h2>
      <hr class="rule">
    </div>
    <div class="grid grid--4">
      <article class="card card--raised stack stack-4">
        <span class="icon-chip"><!-- inline svg --></span>
        <h3 class="card__title">Planning</h3>
        <p class="card__body">Plans that survive the calendar.</p>
      </article>
      <!-- … -->
    </div>
  </div>
</section>
```

### Re-theming

Six accent families ship with the system. Swap the class on `<html>` — or on any
container for a scoped change — and everything downstream follows, including
charts, buttons, icon chips and section panels.

```html
<html class="theme-electric">   <!-- amber · electric · navy · teal · green · coral -->
```

Both example files include a live theme switcher so you can see this happen.

### Dark blocks

Add `on-dark` alongside a dark surface and the foreground roles flip. Components
need no dark-specific variants of their own.

```html
<section class="section section--dark on-dark"> … </section>
```

---

## Building slides

A `.slide` is a self-contained 16:9 canvas. Everything inside sizes in container
query units, so a slide is identical full-screen or as a thumbnail in a grid.

```html
<div class="slide slide--chromed">
  <div class="slide__logo">Northbrook</div>
  <div class="slide__kicker">Who we are</div>
  <div class="slide__pagenum">04</div>
  <div class="slide__inner">
    <div class="split">
      <div class="stack stack-4">
        <span class="eyebrow">About us</span>
        <h2 class="h2">Let's talk about <em>who we are</em></h2>
        <hr class="rule">
        <p class="small">…</p>
      </div>
      <div class="media media--notched"><img src="…" alt="…"></div>
    </div>
  </div>
</div>
```

Printing `examples/deck.html` gives one slide per landscape page.

Slide archetypes provided: cover (split / bleed), agenda, section divider, split
with media, card grids, numbered steps, stat row, timeline, SWOT, chart, team,
testimonial, closing.

---

## Building a PowerPoint template

`powerpoint/SPEC.md` has everything needed to build a `.potx`:

- theme colour slot mapping for all six accent families
- the type scale in points, with pre-computed tracking values
- corner radii as PowerPoint `adj` values
- the single approved shadow preset
- the 14 slide-master layouts and where the furniture sits
- chart formatting rules

---

## The rules, in brief

The full brief is in [`DESIGN-BRIEF.md`](DESIGN-BRIEF.md). The short version:

- **One accent hue per document.** Never two. It carries every point of emphasis.
- **White or off-white dominates** — 55–70% of the page.
- **Uppercase tracked eyebrow labels** above headlines. The most recognisable tic.
- **Two-tone headlines** — one word flips to the accent, or from regular to black.
- **Headlines tight and negatively tracked; body roomy and untracked.**
- **20px card radius**, 32px on media. Sharp corners only on full-bleed colour.
- **Photos are always masked** — rounded, circular, or notched. Never bare.
- **Chart series 1 is the accent**, everything after it is grey.
- **Oversized numerals** on section dividers and process steps.

And the negatives, which save revision rounds: not brutalist, not neumorphic, not
glassmorphic, not dark-mode-first, no texture or noise, no gradients as brand
colour, no hard shadows, no mixed icon styles.

---

## Handing this to someone

For a human designer: send `DESIGN-BRIEF.md`, plus `powerpoint/SPEC.md` if the
deliverable is a deck template. The checklist in §9 of the brief is the
acceptance criteria.

For an AI tool, the prompt at the end of the brief works as-is:

> Build this using the Corporate Deck Design System. Single accent hue
> (`{amber|electric|navy|teal|green|coral}`), near-black ink anchor, white ground.
> Poppins display / Inter body. Uppercase tracked eyebrow labels above headlines,
> one two-tone headline on the cover, 20px card radius, oversized section
> numerals, accent-filled icon chips, masked photography, charts with the accent
> as series 1 and greys after. Follow the standard deck sequence. Import
> `tokens/tokens.css` and use the existing component classes rather than writing
> new CSS.

---

## Notes

- **Fonts.** Poppins and Inter are the intended families; the stacks in
  `tokens.css` fall back through Montserrat and Segoe UI to system sans, so
  nothing breaks if they are unavailable. Load the real fonts in production.
- **Accessibility.** `--accent-on` is set per theme to the text colour that
  clears 4.5:1 on that accent. Use it rather than hard-coding white or black.
  Decorative geometry is `aria-hidden` throughout.
- **No dependencies.** Plain CSS, no build step, no framework, no network calls.
