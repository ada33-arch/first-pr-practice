# 001 — Portfolio, Marin Ellis

Produced by `examples/picker.html` on 2026-08-03.

## Intake answers

| Question | Answer |
|---|---|
| What are you making? | Portfolio site |
| What should they feel in five seconds? | Trusted, established, safe |
| Brand colours / logo / fonts? | None — system chose |
| The one thing they should do? | Buy or sign up |
| Imagery available? | Illustration |
| Light or dark, where does it live? | Light, on screen |

## Resolved spec

| Setting | Value |
|---|---|
| **Deliverable** | Portfolio site |
| **Layer** | web |
| **Accent** | indigo `#4059F0` |
| **Ground** | white |
| **Primary action** | Hero CTA + pricing grid with a featured tier + closing CTA band |
| **Imagery** | Flat vector on tinted card grounds; no photo masks |
| **Mode** | Light, screen |
| **Sections** | Hero, trust bar, selected work, services, process rail, packages, testimonial, FAQ, CTA |

**Accent note.** "Trusted, established" maps to navy *or* indigo. Indigo was
chosen because the page sells fixed-price packages — navy reads more
formal-consultant, indigo more modern-trustworthy. Swap by changing one class on
`<html>`.

## Conflict resolved at intake

The portfolio archetype normally opens on a **portrait hero with floating label
pins** (`.pin`, `.media--blob`). The imagery answer was *illustration, no
photography*.

**Imagery wins.** No portrait, no photo masks anywhere on the page. Inline SVG
illustration on tinted grounds carries the visual load instead.

Caught before anything was drawn. Left to the build, it would have surfaced as a
revision round.

## Scope

**Import (already written, do not modify):**
`tokens/tokens.css`, `css/base.css`, `css/components.css`, `css/web.css`

**Files written:** `index.html` only.

**Classes composed from:**
`.hero-sheen` `.badge-pill` `.orb` `.offset-block` `.stat-row` `.trustbar`
`.grid--2` `.card--raised` `.tint-grid` `.tint-card` `.rail` `.rail__num`
`.price-grid` `.price-card--featured` `.checklist` `.quote` `.faq`
`.cta-band--gradient` `.field-group` `.media--xl`

**Theme:** `<html class="theme-indigo">`

**Read only:** `FAVORITES.md` §"Rules specific to this set"

## Deviations from stock components

Five lines of scoped CSS in `index.html`, no changes under `css/` or `tokens/`:

- `.hero .stat-row` pinned to three columns. The hero column is narrower than
  `.stat-row`'s auto-fit minimum, so the third figure wrapped. Pinned locally
  rather than loosening the component for every other page that uses it.
- `.work-card` / `.illo` — padding and sizing for the illustration cards.

## Imagery

Inline SVG, authored for this project. No third-party assets, so no licence or
attribution obligations.

If photography is added later, it goes through `PHOTOS.md` — and note that
adding it contradicts the intake answer, so re-run question 5 rather than
bolting photos onto an illustration-led layout.
