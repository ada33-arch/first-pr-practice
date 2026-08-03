# Photography — sourcing and treatment

Two routes into the system: **your own photo**, or **one sourced to brief**. Both
end in the same place — masked to a house treatment, never dropped in raw.

Run either from `examples/picker.html` (question 5 → "Upload my own" or "Find one
for me").

---

## Route 1 — your own photo

Drop it into the picker and it renders immediately in the four house treatments,
in your accent theme. The file is read with `FileReader` in the browser and is
never uploaded anywhere.

Before it ships, confirm two things:

- **You hold the rights.** A photo taken by a contractor is usually theirs unless
  the contract assigns it. Commissioned ≠ owned.
- **Anyone recognisable has signed a release**, if the page is advertising. This
  covers staff photos used on a sales page, not just models.

### Size floor

| Use | Minimum width |
|---|---|
| Card / thumbnail | 800px |
| Section media panel | 1200px |
| Full-bleed web hero | 1600px |
| Projected slide | 2400px |

Below the floor the image softens on retina displays. The picker flags this
automatically once it can read the dimensions.

---

## Route 2 — sourced to brief

The picker builds a search query from your other answers — subject from what
you're making, mood from what the audience should feel, plus composition
constraints the system needs:

> *creative professional at work, studio desk, portrait — natural light, neutral
> muted tones, calm, unposed, landscape 16:9, negative space on the right for a
> headline, no text or logos in frame, no heavy filter*

The last three clauses matter more than people expect. Headlines sit **over**
imagery in this system, so a photo with a busy centre has nowhere for type to go,
and a photo with baked-in text or a heavy colour filter fights the accent.

### Where to source

| Library | Licence |
|---|---|
| [Unsplash](https://unsplash.com) | Unsplash Licence — free, commercial use, no attribution required (give it anyway) |
| [Pexels](https://www.pexels.com) | Pexels Licence — free, commercial use |
| [Pixabay](https://pixabay.com) | Pixabay Content Licence — free, commercial use |

Paid stock (Getty, Adobe Stock, Stocksy) is fine when the licence is bought and
the deliverable falls inside it.

### Where **not** to source

This is the part that causes real trouble, so it is stated plainly:

- **Not** from an image search results page. Those results are indexed from
  sites that own them; the search engine is not licensing them to you.
- **Not** from a competitor's site, a press page, or a social feed.
- **Not** a paid-stock preview with the watermark removed or AI-inpainted.
- **Not** an AI upscale of a low-res image you found somewhere.

A takedown notice lands on the client, not the designer who sourced it. One
minute checking a licence is cheaper than the alternative.

### Check the photo, not the site

Free libraries carry a small number of **editorial-only** images — recognisable
people, branded products, trademarked buildings. Those cannot be used to sell
anything. The licence is stated on the individual photo page.

### Record what you used

Keep this line next to every asset, in the repo or the asset folder:

```
hero-workspace.jpg — Unsplash — © Jane Okonkwo — unsplash.com/photos/XXXXXXX — Unsplash Licence — 2026-08-03
```

If a photo's provenance cannot be reconstructed later, it cannot be defended
later either.

---

## Treatment — how a photo enters the system

Photos are **always masked**. A bare rectangle is the single most common way this
style gets broken.

| Class | Use |
|---|---|
| `.media--notched` | Rounded on three corners, square on one. The default section panel. |
| `.media--circle` | People. Team grids, testimonials, avatars. |
| `.media--wash` | Accent multiplied at ~55%. Section covers and dividers. |
| `.media--dim` | Dark bottom-up scrim. **Required** whenever type sits over the image. |
| `.media--xl` | Plain 32px radius, for a hero panel with no type over it. |

### Rules

1. **Type over a photo always gets `.media--dim`.** Carry the contrast in the
   scrim, never by lightening the type — light-grey headlines fail on a
   projector and fail WCAG.
2. **Crop people torso-up, eyes on the upper third.** Full-body shots read as
   stock; tight crops read as real.
3. **One treatment per section.** Mixing a wash and a scrim in the same block
   makes two photos look like an accident.
4. **No filters beyond the two above.** No duotone beyond `.media--wash`, no
   vignettes, no grain.
5. **Object-fit is `cover`, object-position is `top`** for screenshots, `center`
   for people. Never letterbox.

---

## If you have no photo yet

Answer "Nothing yet" and design type-led with geometry — `.deco-circle`,
`.deco-dots`, `.offset-block`, big display type on tinted grounds. This is a
first-class route in the system, not a fallback, and the reference set includes
pages that work this way.

Designing around imagery that never arrives is the one imagery mistake that
cannot be recovered cheaply.
