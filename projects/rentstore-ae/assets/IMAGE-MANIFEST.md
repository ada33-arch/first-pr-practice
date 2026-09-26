# Image manifest — what the build needs before it can ship

32 image slots render a marked pending state today. Counted from the rendered
pages, not from the source, so the number is what a browser actually shows.

Specification §8 forbids substituting stock or generated imagery, so none of
these is filled with a stand-in. Supply the originals and the pending markers
disappear.

## What is needed

| Page | Slot | Count | Aspect | Subject, per the reference |
|---|---|---:|---|---|
| Home | Hero | 1 | full-bleed | Emirati terrace at sunset: arches, lanterns, majlis seating, a figure in Emirati dress, Dubai skyline |
| Stores | Hero | 1 | full-bleed | Dubai skyline at dusk, figures in the foreground |
| Stores | Location cards | 6 | 3:4 | Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah |
| Stores | Featured space cards | 3 | 4:3 | Mall retail interior, pop-up store, kiosk |
| How It Works | Hero | 1 | full-bleed | Evening Emirati/Dubai scene |
| How It Works | Step images | 6 | 16:10 | One per step, matching the reference's circular/oval crops |
| Success Stories | Hero | 1 | full-bleed | Night scene, warm architectural lighting, a person present |
| Success Stories | Testimonial portrait | 1 | 4:3 | The entrepreneur quoted |
| Success Stories | Story cards | 3 | 4:3 | One per story |
| Resources | Hero | 1 | full-bleed | Cinematic Emirati scene |
| Resources | Article cards | 6 | 4:3 | One per article |
| About | Hero | 1 | full-bleed | Palms, architecture, people |
| List Your Space | Hero | 1 | full-bleed | Evening commercial scene |
| **Total** | | **32** | | |

## Format

- Hero images: 2400 px wide minimum. They sit under a navy wash, so detail in
  the shadows survives better than detail in the highlights.
- Cards and steps: 1200 px wide minimum.
- WebP or AVIF preferred, JPEG accepted.
- Drop them in `assets/` and point the slot at them; the pending state is a
  single helper in `code/site.js` (`mediaSlot`), so replacing it is one change
  per slot, not a rebuild.

## What must not happen

Do not fill these from a stock library or an image generator. The reference
establishes a specific place and a specific register, and §8 makes the
approved images the only source. If a particular image cannot be obtained,
that slot stays marked rather than filled with something approximate.

## Rights

The reference is built on recognisable Dubai landmarks, including the Burj
Khalifa, and names real malls. Confirm you hold the rights to the photographs
and that naming those venues reflects real commercial arrangements before the
site goes public. The UAE has no broad freedom-of-panorama exception.
