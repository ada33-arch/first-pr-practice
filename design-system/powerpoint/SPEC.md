# PowerPoint Implementation Spec

Concrete numbers for building the system as a `.potx` template. All values assume
the **16:9 widescreen** slide size: **13.333″ × 7.5″** (33.87 cm × 19.05 cm).

To convert to the older 10″ × 5.625″ canvas, multiply every length by `0.75`.

---

## Slide setup

| Setting | Value |
|---|---|
| Slide size | Widescreen 16:9 — 13.333″ × 7.5″ |
| Safe margin | 0.87″ all sides (6.5%) |
| Grid | 12 columns, 0.87″ outer margin, 0.17″ gutter → column width 0.93″ |
| Baseline | 0.042″ (4px at 96 DPI) |

Content never crosses the safe margin. Full-bleed photos and colour blocks are
the only exception.

---

## Theme colours

Map these into **Design → Variants → Colors → Customize Colors**. Slots are named
by PowerPoint's own labels.

| Slot | Amber (default) | Electric | Navy | Teal | Green | Coral |
|---|---|---|---|---|---|---|
| Text/Background – Dark 1 | `14181F` | `14181F` | `14181F` | `14181F` | `14181F` | `14181F` |
| Text/Background – Light 1 | `FFFFFF` | `FFFFFF` | `FFFFFF` | `FFFFFF` | `FFFFFF` | `FFFFFF` |
| Text/Background – Dark 2 | `233049` | `233049` | `152547` | `233049` | `233049` | `233049` |
| Text/Background – Light 2 | `F7F8FA` | `F7F8FA` | `F7F8FA` | `F7F8FA` | `F7F8FA` | `FAF6EC` |
| **Accent 1** (the accent) | `F5B21A` | `2B50EE` | `2B4A8B` | `22BCCE` | `17A673` | `E85D33` |
| Accent 2 (accent light) | `FFD24D` | `8DA5FF` | `8095C4` | `63D6E2` | `63CFA1` | `F29B80` |
| Accent 3 (accent pale) | `FFF8E6` | `EDF1FF` | `EEF2F9` | `E6F8FA` | `E7F7EF` | `FDEEEA` |
| Accent 4 (ink mid) | `3A4761` | `3A4761` | `3A4761` | `3A4761` | `3A4761` | `3A4761` |
| Accent 5 (grey) | `8993A6` | `8993A6` | `8993A6` | `8993A6` | `8993A6` | `8993A6` |
| Accent 6 (hairline) | `ECEFF3` | `ECEFF3` | `ECEFF3` | `ECEFF3` | `ECEFF3` | `ECEFF3` |
| Hyperlink | `E09A00` | `1D3ACC` | `1F3768` | `1897A6` | `11855C` | `C64720` |
| Followed hyperlink | `B87A00` | `152B99` | `152547` | `11707B` | `0B6244` | `993518` |

**Chart series order** must be set on the theme so charts inherit it:
Accent 1 → Dark 2 → Accent 2 → Accent 5 → Accent 3 → Accent 6.

---

## Theme fonts

| Slot | Font | Fallback if unavailable |
|---|---|---|
| Headings | Poppins SemiBold / Bold | Montserrat → Segoe UI Semibold |
| Body | Inter Regular | Poppins Regular → Segoe UI |

Embed fonts in the `.potx` (**File → Options → Save → Embed fonts in the file →
Embed only the characters used**) so the deck survives being opened elsewhere.

---

## Type scale in points

Slide-native sizes. These are the cqw values from `css/slides.css` resolved
against a 13.333″ canvas.

| Style | Size | Weight | Tracking | Line spacing |
|---|---|---|---|---|
| Cover title | 66 pt | Black (800) | −0.03em ≈ −2.0 pt | 0.95 |
| Slide title (H1) | 50 pt | Black (800) | −0.025em ≈ −1.25 pt | 1.0 |
| Sub-head (H2) | 37 pt | Bold (700) | −0.02em ≈ −0.75 pt | 1.05 |
| Card title (H3) | 24 pt | Bold (700) | −0.01em | 1.15 |
| Feature label (H4) | 18 pt | SemiBold (600) | 0 | 1.25 |
| Body | 15 pt | Regular (400) | 0 | 1.5 |
| Small / card copy | 13 pt | Regular (400) | 0 | 1.45 |
| Caption | 11 pt | Medium (500) | 0 | 1.4 |
| **Eyebrow** | 12 pt | SemiBold (600) | **+0.18em ≈ +2.2 pt**, ALL CAPS | 1.15 |
| Section numeral | 100 pt | Black (800) | −0.04em ≈ −4 pt | 0.9 |
| Stat value | 46 pt | Black (800) | −0.035em | 1.0 |
| Stat label | 11 pt | SemiBold (600) | +0.06em, ALL CAPS | 1.3 |

PowerPoint expresses tracking in points via **Format Text → Character Spacing →
Spacing: Expanded/Condensed By**. The pt equivalents above are pre-computed.

---

## Shape geometry

| Element | Size | Corner radius |
|---|---|---|
| Card | column-spanning, min 2.8″ × 1.9″ | 0.21″ (20px) |
| Media panel | varies | 0.33″ (32px) |
| Hero media | varies | 0.50″ (48px) |
| Icon chip | 0.55″ × 0.55″ | 0.125″ (12px) |
| Icon chip (large) | 0.75″ × 0.75″ | 0.21″ |
| Button | height 0.42″, pad 0.36″ horizontal | fully rounded |
| Accent rule | 0.58″ × 0.042″ | fully rounded |
| Meter bar | height 0.085″ | fully rounded |

PowerPoint's rounded rectangle uses a *proportional* corner handle, so set radius
by dragging until the numeric adjustment reads the fraction below, or edit the
shape's `adj` value in the XML:

| Target radius | On a 1.9″-tall shape | `adj` value |
|---|---|---|
| 0.21″ | 11% of the short side | `11000` |
| 0.33″ | 17% | `17000` |
| 0.50″ | 26% | `26000` |

---

## Shadows

One shadow preset only, applied to cards and floating panels:

- **Outer shadow**, colour `14181F` at **9% opacity**
- Blur **24 pt**, Distance **9 pt**, Angle **90°**, Size 100%

Never use PowerPoint's default shadow presets — they are far too heavy.

---

## Slide layouts to build in the Slide Master

Build these 14 layouts. Every one except Cover and Closing carries the furniture
described below.

| # | Layout name | Structure |
|---|---|---|
| 1 | **Cover — split** | Type block left 52%, full-bleed photo right 48% |
| 2 | **Cover — bleed** | Full-bleed photo, dark scrim, type block over the left 62% |
| 3 | **Agenda** | Two columns × up to 4 numbered rows, hairline under each |
| 4 | **Section divider** | Accent panel left 50% with numeral + title; photo right |
| 5 | **Title + body** | H1 top-left, body block 7 columns |
| 6 | **Split — media right** | 5:7 type/media |
| 7 | **Split — media left** | 7:5 media/type |
| 8 | **Three cards** | 3 equal cards, icon chip + title + copy |
| 9 | **Four cards** | 4 equal cards |
| 10 | **Numbered steps** | 3–4 columns, ghost numeral above each |
| 11 | **Stat row** | Dark or accent fill, 3–4 stats, hairline dividers |
| 12 | **Timeline** | Horizontal rule with 4–6 accent dots |
| 13 | **SWOT** | 2×2 — S on accent, W on ink, O on accent-pale, T on light-2 |
| 14 | **Closing** | Centred display type, contact block, socials |

### Furniture (place on the Slide Master, not per-slide)

| Item | Position | Style |
|---|---|---|
| Logo | 0.87″ from left, 0.53″ from top | 12–16 pt, display SemiBold |
| Section kicker | right-aligned to 0.87″ from right, 0.58″ from top | 10 pt, +0.16em, CAPS, grey `8993A6` |
| Page number | right-aligned to 0.87″ from right, 0.53″ from bottom | 12 pt Bold, `B4BCC9`, tabular |

Content placeholders on furnished layouts start at **1.47″ from the top** and end
**1.2″ from the bottom** so nothing collides with the chrome.

---

## Picture placeholders

Set every picture placeholder to **fill** (not fit) so photos crop rather than
letterbox. Apply the corner radius by using a rounded-rectangle *picture
placeholder*, not by cropping to shape after the fact — the latter breaks when
the user swaps the image.

Two permitted photo treatments:

1. **Accent wash** — place a rectangle of Accent 1 over the photo, set to
   **Multiply** blend at **55%** transparency. Group it with the picture.
2. **Bottom scrim** — a rectangle filled with a linear gradient, `14181F` at 15%
   opacity (top) → `14181F` at 72% opacity (bottom), 90°.

---

## Charts

- Delete: chart border, gridline major/minor on the category axis, tick marks,
  chart area fill.
- Value-axis gridlines: `ECEFF3`, 0.75 pt.
- Axis labels: 11 pt, `8993A6`.
- Data labels: 11 pt SemiBold, `14181F`, positioned outside end.
- Bar gap width: **60%**. Bar corner radius: 0.06″ on the outer end only.
- Line charts: 2.5 pt line, no markers unless there are fewer than 8 points; then
  circular markers 6 pt in Accent 1 with a white 1.5 pt outline.
- Pie/doughnut: doughnut hole **68%**, first slice Accent 1, remainder greys.

---

## Export and handoff

- Ship as **`.potx`** (template), not `.pptx`. Users then get a clean
  New-from-template flow with all layouts available.
- Include a **`.thmx`** theme file so the colour and font set can be applied to
  existing decks.
- Verify in **Slide Master view** that no layout has stray placeholders, and that
  every layout's name matches the table above — designers pick layouts by name.
- Test at 100% zoom and as a printed handout (3-per-page) before sign-off.
