# The one automation

Everything that happens between "someone presses send" and "you know about it"
runs here. One workflow, importable into any n8n (cloud or self-hosted).

| File | Runs when | Who it talks to |
| --- | --- | --- |
| `01-brief-submitted.json` | Someone finishes the brief and presses send | You (the owner) |

The workflow carries sticky notes on its own canvas explaining its logic —
open it in n8n and read it there.

## Import

n8n → **Workflows** → **Import from file** → pick the JSON. Work through the
setup below before switching it **Active**.

Node parameters move slightly between n8n versions. If a node opens with an
empty dropdown after import, pick the value again from the list — the wiring
between nodes survives regardless.

## What you need first

**1. A Google Sheet with one tab**, named `briefs`:

| created_at | name | kind | palette | lang | what | who | why | offer | action | contact | used_before | free_count | billable | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Paste the sheet's id (the long string in its URL) into the Google Sheets node
— it currently says `YOUR_SHEET_ID`. Type the headers exactly; the workflow
maps fields to columns by name.

**2. A credential.** *Header Auth* named *WhatsApp Cloud* — Name
`Authorization`, Value `Bearer <your permanent WhatsApp token>`.

**3. Environment variables** (n8n Settings → Variables, or your `.env`):

| Variable | Example | What it is |
| --- | --- | --- |
| `WA_PHONE_ID` | `123456789012345` | WhatsApp Cloud phone number id |
| `OWNER_PHONE` | `971508400886` | Where the brief alert goes |

## Connect the website

The webhook node shows a Production URL. Copy it into `../content/data.js`:

```js
window.PLATFORM = {
  briefWebhook: "https://<your-n8n>/webhook/quicksite-brief",
  …
}
```

Leave it empty and the brief page keeps working exactly as before — sending
still opens WhatsApp with the customer's own summary; it just skips n8n. The
page never waits on the webhook, so a broken automation can't cost a page.

## What "billable" means here

There is no backend and no accounts, so the free-page count lives in the
customer's own browser (`localStorage`), the same honest limit as everywhere
else in this project: a cleared browser or a second device resets it. The
`billable` flag this workflow logs is a signal for you to follow up on, not an
enforced paywall — the brief page never blocks a submission because of it.

## Test it before going live

Execute Workflow, then submit the real form on the brief page with fewer than
two prior submissions in that browser and again after two. Check: a row
appears each time, `billable` reads `false` then `true`, and you get the
WhatsApp alert both times.

## What still isn't automated

Building the actual page from the row and sending it back. The workflow
records the brief and tells you about it; turning that into a delivered file
is still a human step — see the note at the end of [`../docs/idea.md`](../docs/idea.md).
