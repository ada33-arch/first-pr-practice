# RentStore.ae — Phase 1B status against the master specification

Source of truth: `RentStore_Codex_Master_Specification.md` (26 Sept 2026).
Visual source of truth: the seven-panel reference sheet, kept read-only at
`sources/reference-master.webp`.

Acceptance criterion §14.7 requires that every element which could not be
built from the available sources is named, with its status and the reason its
decision is missing. That is what this file is.

---

## 1. What is built

Phase 1B — the seven public pages, in the locked story order.

| # | Page | Route | Status |
|---|---|---|---|
| 01 | Home | `/` | Built |
| 02 | Stores | `/stores` | Built |
| 03 | How It Works | `/how-it-works` | Built |
| 04 | Success Stories | `/success-stories` | Built |
| 05 | Resources | `/resources` | Built |
| 06 | About | `/about` | Built |
| 07 | List Your Space | see §3 | Built, route unresolved |

One header across all seven, over the hero rather than in a white bar of its
own (§4). Locked copy is reproduced verbatim in `content/data.js` and marked
`LOCKED`. Section counts the spec fixes are respected exactly: four Home
pillars, six How It Works steps, six location cards, three featured spaces,
six resource cards, four listing-form fields.

## 2. What is blocked, and why

### 2.1 Photography — blocked, nothing invented

§8 requires the reference or approved project images and forbids substitutes:
*"لو تعذر الوصول إلى ملف صورة لازم للتنفيذ، اذكر ذلك؛ لا تولّد بديلاً."*

The only asset supplied is the 1536×1024 contact sheet. Each of its seven
panels is roughly 500 px wide, so the photographs inside them are about
460×300 px — far below what a full-bleed hero needs, and they are pictures of
mockups rather than the source images.

Every image slot therefore renders as a marked pending state that keeps the
composition, aspect ratio and navy wash, and says what is missing. No stock
image, no generated image, no crop of the contact sheet is used anywhere.
`assets/IMAGE-MANIFEST.md` lists all 32 slots, counted from the rendered
pages rather than from the source.

### 2.2 Deployment and DNS — not done, cannot be done from here

§12 supplies no registrar, DNS records, hosting account or TLS status, and
states: *"لا تغيّر DNS أو تنشر إلى الإنتاج اعتماداً على هذا الملف وحده."*
Phase 4's DoD requires access to the domain and hosting settings, which this
environment does not have.

Status: **Not Yet Implemented.** The build is static, has no dependencies and
no build step, so it can be served from any static host as-is. `README.md`
records exactly what is needed to proceed.

The `https://rentstore.higgsfield.app` link named in §12 was not verified;
nothing here treats it as production.

### 2.3 Arabic — present as a control, absent as content

§10: the العربية control in the header is locked, but no approved Arabic
translation of the page copy exists. The control is therefore wired to a
notice rather than to a half-translated site. The Arabic slogan
*مشروعك عليك والستور علينا* is locked and recorded in `content/data.js`.

## 3. Open questions that block a decision

| Item | Spec ref | Status |
|---|---|---|
| List Your Space route: `/sell` vs `/list-your-space` | §4, §15 | **Needs the owner.** Implemented via a single constant (`RS.routes.list`) so the whole site rewires from one line. No page carries both paths. |
| Mobile menu behaviour, Login destination, language-toggle behaviour | §4 | Not Yet Defined. The menu restacks the same links; Login and العربية answer with a notice instead of a dead control or an invented screen. |
| Option lists for Property Type and Availability | §5 | Not Yet Defined. The selects render disabled rather than filled with invented types or dates. |
| Where the listing form submits | §5 | Not Yet Defined. The form does not submit and says so. No fake success. |
| Body copy for the six Resources cards | §5 | The reference's body text is not legible at the resolution supplied. One-line summaries stand in and are marked for review. |
| Name behind the Success Stories quote | §5 | Left unattributed. §5 forbids inventing a person or brand. |

## 4. Decisions taken, and the basis for each

The spec records colour values, type and spacing as Not Yet Defined, and says
to read the appearance off the image rather than invent values (§3). So:

**Colour — extracted, not chosen.** `scripts/extract-palette.py` samples the
reference sheet. Every token in `design/styles.css` carries the measurement
that produced it.

| Token | Value | Basis |
|---|---|---|
| `--navy` | `#08192C` | most frequent hero ground, n=3612 |
| `--navy-deep` | `#05182F` | second navy field, n=2570 |
| `--navy-raised` | `#082448` | lifted panels, n=1172 |
| `--gold` | `#F1CB81` | every CTA and accent headline, H39 S78 L73 |
| `--ivory` | `#F5E7DC` | panel 07 ground, 12% of panel |
| `--ivory-warm` | `#F3E4E0` | panel 06 ground, 12% |
| `--ivory-pale` | `#F1EEE3` | panel 03 ground, 11% |

**Typography — provisional, and not a brand decision.** No letterform is
identifiable at ~500 px per panel. `Plus Jakarta Sans` with a system fallback
is a placeholder chosen to sit close to the reference's weight and width. It
must be replaced once a brand typeface is chosen, and it is not recorded
anywhere as approved.

**No framework.** §9 lists the front-end framework as Not Yet Defined, so
choosing one would promote an undecided item into an implicit specification.
This is plain HTML, CSS and JavaScript with no build step and no dependency,
which also matches the repository's own convention.

## 5. Verification performed

Rendered in headless Chromium, not inspected as source.

- Seven pages at 390 px, 768 px and 1440 px: no horizontal overflow, every
  interactive target at least 44 px. Two real failures were found this way and
  fixed: a 219 px overflow from the header tools row, and an inline
  `grid-template-columns` on Resources that defeated the mobile stacking rule.
- Contrast sampled from rendered pixels behind each element, 111 elements
  across the seven pages. All pass. Worst directly-measured pairing is
  `--ink-mute` on ivory at **4.89:1**, which is the floor this palette allows.
- Measured separately because the element's own fill had to be hidden to
  sample it: navy on the gold chip and button fill, **11.47:1**; navy on the
  gold hover shade, **8.21:1**.
- **Gold on ivory is 1.28:1.** Gold may fill a control on an ivory ground but
  must never set type there. `design/styles.css` enforces this by switching
  `.link-gold` to ink inside `.on-ivory`.
- No console errors on any page.

## 6. Not claimed

Per §14.8, none of the following is asserted as done: the platform, merchant
dashboard, admin, payments, delivery, RentStore Studio, Coming Soon, the
Arabic site, DNS, TLS, or production. Phase 1B is the public pages only, and
the footer says so on every page.
