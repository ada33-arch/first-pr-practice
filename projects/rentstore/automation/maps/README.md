# The business, drawn on a canvas

Four n8n workflows that **draw** the business instead of running it. Import one,
open it, and the journey is laid out as boxes you can pan around — each carrying
its own description, with sticky notes explaining why each phase exists.

| File | Draws | Steps |
| --- | --- | --- |
| `map-01-merchant-journey.json` | A merchant from first hearing about us to their second month | M1–M12 |
| `map-02-shopper-journey.json` | A shopper from arrival to paying the merchant | S1–S6 |
| `map-03-licence-journey.json` | A licence customer from no licence to selling | L1–L8 |
| `map-04-owner-week.json` | Your own week, and where it stops scaling | O1–O7 |

## Can't open a .json file?

Nothing is wrong with your machine — a `.json` is not a document, so tapping it
opens nothing useful. It is an import file. Either use **Import from File** in
n8n, or open it in a text editor, copy everything, and **paste onto an empty n8n
canvas** — it draws itself.

To simply *read* the maps with no n8n at all, open
[`../../docs/journeys.html`](../../docs/journeys.html), which is generated from
these same files by `build-maps.py`'s output, so the two cannot drift apart.

## These do nothing

Every step is a **No-Op** node: it does nothing, sends nothing, charges nobody.
The point is to read the business on a canvas rather than in a document.

- Press **Execute Workflow** and the path lights up in order — a way to walk it.
- Click any box to read what happens at that step.
- **Never set a map Active.** The workflows that actually run are the numbered
  ones in the folder above (`01`–`05`).

The two are deliberately separate: `01`–`05` are what the business *does*, these
are what the business *is*.

## Reading them

Steps run left to right, then snake back on the next row, so no connector ever
flies across the canvas. Sticky notes sit above the row they describe:

- **Merchant map** — what's free and why, where the money starts, what keeps them.
- **Shopper map** — the cost and the benefit of the shopper never meeting the platform.
- **Licence map** — the two promises that must never be edited out, and the
  partner that gates the whole service.
- **Owner map** — which node is the bottleneck, and what the automations already
  carry for you.

## Do you need to pay for n8n?

No. **n8n self-hosted is free** — run it yourself with Docker and there is no
subscription and no workflow limit. **n8n Cloud is paid** after its trial, and
what it really buys is that someone else keeps it running and your webhook URLs
are reachable without any setup of your own.

For *these maps* you need no paid plan at all — any n8n, including one on your
own laptop, will open them. The five real automations do need an n8n that is
always on and reachable from the internet, because webhooks have to arrive:
that means either n8n Cloud, or self-hosted n8n on a small always-on server.
