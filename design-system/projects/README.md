# Projects

One folder per request. `examples/` holds reference demos of the system itself
and does not change; **everything actually commissioned lives here.**

```
projects/
└── NNN-short-name/
    ├── SPEC.md          ← the intake answers and the scope they produced
    ├── index.html       ← the deliverable
    └── assets/          ← only the subfolders the project actually has
        ├── logo/        ← SVG preferred; keep the light/knockout variant too
        ├── photos/      ← with a LICENCES.md line per file (see ../../PHOTOS.md)
        ├── content/     ← copy.md — the real words the design was built against
        └── reference/   ← current site, old deck, brand guidelines
```

Assets are separated by kind because the rules differ by kind. A logo needs
transparency and a knockout variant; a photo needs a licence record; copy needs
to be the real words. A single flat `assets/` folder loses all of that.

The picker prints this tree for you once you've answered — copy the structure it
shows rather than inventing one.

## The convention

| Part | Rule |
|---|---|
| `NNN` | Three digits, sequential, never reused — `001`, `002`, `017` |
| `short-name` | Two or three words, lowercase, hyphenated. Client or subject first |
| `SPEC.md` | **Required.** Paste the picker output here before writing any markup |
| `index.html` | The page or deck. One file unless the project genuinely needs more |
| `assets/` | Only create it if the project has real assets. No empty folders |

Examples: `001-portfolio-marin`, `002-kestrel-pitch-deck`, `003-aven-landing`.

## Why SPEC.md is required

It records *why* the design looks the way it does — which accent, which layer,
which sections, and the constraints that produced them. Six months later that is
the difference between editing a page and re-deriving it from scratch.

It also carries the sourcing line for any imagery, so licence and attribution
stay attached to the project rather than living in someone's memory.

## Starting a new project

1. Run [`../examples/picker.html`](../examples/picker.html) — answer the six questions.
2. `mkdir projects/NNN-short-name`, paste the picker output into `SPEC.md`.
3. Write `index.html` against the scope in that file, and nothing beyond it.

The scope names the exact files to import and classes to use. **Do not modify
anything under `css/` or `tokens/` for a single project** — if a project truly
needs a new component, that is a change to the system, made deliberately and
separately, not a side effect of one page.

## Index

| # | Project | Deliverable | Layer | Accent | Date |
|---|---|---|---|---|---|
| 001 | [portfolio-marin](001-portfolio-marin/) | Portfolio site | web | indigo | 2026-08-03 |
