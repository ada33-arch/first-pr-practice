# Intake — Ask Before You Design

Nobody starts a design in this system until these questions are answered. The
point is not paperwork: **every question below changes a concrete setting**, and
the mapping is fixed, so two different designers given the same answers produce
the same starting point.

Run it as a conversation, not a form. Six questions, two minutes.

> Interactive version: [`examples/picker.html`](examples/picker.html) — answer on
> screen, get a filled brief and a live preview to paste into a designer's or an
> AI tool's prompt.

---

## The six questions

### 1. What are you making?

> *Deck · Landing page · Report · Portfolio · Pitch deck · Product site*

**Decides: which layer, and the section set.**

| Answer | Layer | Starting sections |
|---|---|---|
| Presentation / deck | `slides.css` | The 14-step deck sequence (brief §8) |
| Report / whitepaper | `slides.css`, print styles | Cover, contents, sections, charts, closing |
| Pitch deck | `slides.css` | Cover, problem, solution, market, model, traction, team, ask |
| Landing page | `web.css` | Hero, trust bar, features, how-it-works, stats, pricing, FAQ, CTA |
| Product site | `web.css` | Hero with device mockup, features, integrations, pricing, FAQ, CTA |
| Portfolio | `web.css` | Hero with portrait, selected work, services, process, testimonials, contact |

---

### 2. Who is the audience, and what should they feel in the first five seconds?

> *Trusted · Energised · Reassured · Impressed · Curious*

**Decides: the accent family and the ground.**

| Feeling | Accent | Ground |
|---|---|---|
| Trusted, established, safe | navy or indigo | white |
| Serious about money | indigo or lime | white / cream |
| Energised, optimistic, warm | amber or coral | white |
| Modern, technical, premium | violet or electric | white, or ink for a dark page |
| Calm, healthy, sustainable | green or teal | off-white |
| Bold, creative, unmissable | coral or lime | cream |

If the answer is "I don't know", ask what their closest competitor looks like and
go one step away from it.

---

### 3. Do you already have brand colours, a logo, or fonts?

> *Yes, locked · Yes, but flexible · No, choose for me*

**Decides: whether Q2's answer is a recommendation or a rule.**

- **Locked** — map the brand colour to the nearest accent family and override the
  `--accent-*` ramp with the real values. Keep every other token.
- **Flexible** — use Q2's recommendation, show the brand colour as an alternate.
- **None** — Q2 decides outright.

Answering "locked" or "flexible" opens **3a — your colours** in the picker. Type
or pick any hex and it generates the full 50→700 ramp, derives the gradient, and
checks contrast, applying it to the page live so you can see it before you commit.

The contrast check matters more than it sounds. A custom accent is the most
common way this system gets broken: a mid-tone brand colour often clears 4.5:1
against *neither* white nor near-black, which means no text can legally sit on
it. The picker says so and tells you to use it for fills and ornament only.

Output is a `:root` block to paste into the **project's** stylesheet.
`tokens.css` is never edited for one project.

Whichever applies, one accent only. A brand with two colours gets the dominant
one as the accent and the second demoted to a neutral support tint.

---

### 4. What is the one thing you want the reader to do?

> *Book a call · Buy · Sign up / trial · Approve the plan · Get in touch · Just understand*

**Decides: the CTA treatment and how often it repeats.**

| Action | Treatment |
|---|---|
| Book a call / Get in touch | `.btn--primary` in the hero, `.cta-band` before the footer |
| Buy / Sign up / trial | Hero CTA + `.price-grid` with a featured tier + closing `.cta-band` |
| Approve the plan | No CTA band. Closing slide states the decision and the date needed. |
| Just understand | No CTA. Ends on a summary or contact slide. |

One primary action per document. A second competing action halves both.

---

### 5. What imagery do you actually have?

> *Photography · Upload my own · Find one for me · Product screenshots ·
> Illustration · Logos only · Nothing yet*

**Decides: media treatment — and this is the question most often skipped, then
regretted.**

| Have | Use |
|---|---|
| Photography | `.media--notched` / `.media--circle`, accent wash on section covers |
| **Upload my own** | Drop it into `picker.html` and see it in all four house treatments instantly. Read in-browser; nothing is uploaded. |
| **Find one for me** | The picker builds a search brief from your other answers and links to free-licence libraries. |
| Product screenshots | `.device--phone` / `.device--browser` with `.float-card` |
| Illustration | Flat vector on `.tint-card` grounds; no photo masks |
| Logos only | `.trustbar`, big type, `.deco` geometry carrying the visual load |
| Nothing yet | Type-led layout + geometry. **Do not** design around placeholders you cannot fill. |

Either photo route adds a **sourcing line** to the spec — rights confirmation for
your own photo, licence and attribution for sourced stock. Full rules, size
floors and treatment guidance are in [`PHOTOS.md`](PHOTOS.md).

---

### 6. Light or dark — and where does this live?

> *Light · Dark · Both · Screen only · Printed · Projected*

**Decides: surface, contrast floor, and export.**

- **Dark** is available on web only (portfolio, product). Decks stay light.
- **Projected** → raise contrast, no hairlines under 2px, no body text under 15pt.
- **Printed** → light ground, CMYK-safe accent, hairlines at 0.75pt minimum.
- **Both** → build light first, then apply `.on-dark`; never design them separately.

---

---

## 6a. Anything else to hand? *(optional)*

> *Logo · Copy / content · Existing material*

Three separate slots in the picker, on purpose. A combined "upload your stuff"
box loses what makes each one different.

### Logo

Previewed on **white, on ink, and on your accent** simultaneously — because the
usual failure is a logo that looks fine in the navbar and vanishes in the dark
footer. The picker flags:

- **JPG** — no transparency, so it sits in a white box on every dark surface.
  SVG, or PNG with an alpha channel.
- **Aspect** — a wide wordmark works in the navbar and slide furniture but not in
  a square avatar slot; a square mark is the opposite. Most brands need both.
- **Resolution** — under 400px raster will blur on retina and badly when
  projected. 800px+, or SVG.
- **A light (knockout) variant** — if the logo disappears on the ink or accent
  preview, you need one. Most brands have it and forget to send it.

### Copy / content

Paste the real words or drop a `.txt` / `.md`. **Designing against real copy
instead of lorem ipsum is the cheapest quality win available** — placeholder text
hides every length problem, and length problems are what break layouts.

The picker flags lines over 62 characters (the body measure), and headings over
~45 characters, which stop working as display lines at this weight and tracking.

### Existing material

Current site, old deck, brand guidelines. Filenames are listed only — nothing is
read or uploaded. This exists so the material lands in the project folder instead
of a chat thread.

---

## Three more, only if it is a deck

7. **How long, and how long do you have to present it?** — roughly one slide per
   minute of talking. If the answers don't reconcile, cut sections now, not later.
8. **Who presents it, and do they need speaker notes?**
9. **Will anyone edit it after you?** — if yes, ship a `.potx` with proper slide
   master layouts, not a finished `.pptx`.

---

## The output is a *scope*, not a restatement

The answers collapse into a targeted work order that names the exact files and
classes for this one job — and explicitly rules out everything else.

This matters for cost as much as for quality. The system is already written; a
handover that re-reads or regenerates the tokens and components on every job
pays for the same work repeatedly. **The intake output exists to stop that.**

> **Deliverable:** landing page · **Layer:** web · **Accent:** violet (flexible) ·
> **Ground:** white · **Primary action:** start free trial → hero CTA + featured
> pricing tier + closing CTA band · **Imagery:** product screenshots in browser and
> phone frames · **Mode:** light, screen · **Sections:** hero, trust bar, features,
> how-it-works, stats, pricing, FAQ, CTA.
>
> **━━ SCOPE — touch only what is listed ━━**
>
> **Import (already written, do not modify):**
> `tokens/tokens.css`, `css/base.css`, `css/components.css`, `css/web.css`
>
> **Write exactly one new file:** the page markup.
> **Do not** re-read, regenerate or restate the tokens, the components, or the
> rest of the system. They exist and they work.
>
> **Classes to compose from:** `.hero-gradient` `.orb` `.wave` `.badge-pill`
> `.trustbar` `.tint-grid` `.rail` `.stat-row` `.price-grid` `.faq` `.cta-band`
> `.device--browser` `.device--phone` `.float-card`
>
> **Theme:** `<html class="theme-violet">`
>
> **Read only:** `FAVORITES.md` §"Rules specific to this set". Skip the rest of
> the docs — that line is the whole brief needed.
>
> **Rules that still apply:** one accent hue; eyebrow label above each headline;
> one two-tone headline at the top; 20px card radius; charts use the accent as
> series 1 and greys after.

### Why the scope block is worded that way

| Line | What it prevents |
|---|---|
| "already written, do not modify" | Rewriting tokens that other work depends on |
| "write exactly one new file" | Sprawl across the system for a single page |
| "do not re-read … the rest of the system" | Re-processing thousands of lines to build one page |
| "classes to compose from" | Inventing parallel CSS that drifts from the house style |
| "read only §X" | Consuming the full brief when six lines would do |

A designer who needs more than this list should ask for it, rather than reading
everything by default on the chance it matters.

---

## Why refuse to start without this

Every one of these questions maps to a decision that is expensive to reverse
late. Choosing an accent after the photography is picked, or discovering at
handover that the deck will be projected, means redoing work that was already
approved. Two minutes here is the cheapest part of the project.

If someone will not answer Q5, assume "nothing yet" and design type-led. That
assumption is recoverable. Designing around imagery that never arrives is not.
