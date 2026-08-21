# The five automations

Everything the platform does between "someone taps a button" and "money arrives"
runs here. Five workflows, importable into any n8n (cloud or self-hosted).

| File | Runs when | Who it talks to |
| --- | --- | --- |
| `01-signup-free.json` | Someone submits the signup form | Seller, owner |
| `02-store-activation.json` | A seller asks for a store, and again when Stripe confirms payment | Seller, owner |
| `03-subscription-renewal.json` | Every morning at 09:00 Dubai | Seller, owner |
| `04-customer-order.json` | A customer checks out on a seller's store | Seller, customer |
| `05-setup-and-licence.json` | Someone buys the full setup, and again each time you move their case forward | Customer, owner |

Each workflow carries sticky notes on the canvas explaining its own logic — open
one in n8n and read it there.

## Import

n8n → **Workflows** → **Import from file** → pick the JSON. Do all four, then
work through the setup below before switching any of them **Active**.

Node parameters move slightly between n8n versions. If a node opens with an empty
dropdown after import, pick the value again from the list — the wiring between
nodes survives regardless.

## What you need first

**1. A Google Sheet with two tabs.** Create it, then paste its id (the long
string in the sheet URL) into every Google Sheets node — they all currently say
`YOUR_SHEET_ID`.

`sellers` tab — one row per person who signs up:

| created_at | name | handle | phone | email | sells | plan | status | store_status | page_url | payment_link | next_renewal | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

`setups` tab — one row per setup-and-licence case:

| case_id | created_at | name | handle | phone | emirate | activity | licence_type | stage | fee | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

`orders` tab — one row per order:

| order_id | created_at | seller_handle | seller_phone | customer_name | customer_phone | items_text | items_json | item_count | total | currency | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Type the headers exactly — the workflows map fields to columns by name.

**2. Credentials.**

- *Google Sheets OAuth2* — for the Sheets nodes.
- *Header Auth* named *WhatsApp Cloud* — Name `Authorization`, Value
  `Bearer <your permanent WhatsApp token>`. Used by every WhatsApp node.
- *Header Auth* named *Stripe* — Name `Authorization`, Value `Bearer sk_live_…`.
  Only workflow 2 uses it.

**3. Environment variables** (n8n Settings → Variables, or your `.env`):

| Variable | Example | What it is |
| --- | --- | --- |
| `WA_PHONE_ID` | `123456789012345` | WhatsApp Cloud phone number id |
| `OWNER_PHONE` | `971508400886` | Where owner alerts go |
| `MATJARI_DOMAIN` | `matjari.ae` | Builds each seller's page URL |
| `MATJARI_PRICE` | `29` | Monthly price, in the messages |
| `MATJARI_GRACE_DAYS` | `7` | Days late before a store switches off |
| `MATJARI_SETUP_FEE` | `1500` | Your one-time setup fee, in the messages |
| `STRIPE_PRICE_ID` | `price_1AbC…` | A **recurring** monthly price in Stripe |

## Connect the website

Each workflow's Webhook node shows a Production URL. Copy them into
`site/assets/js/data.js`:

```js
window.PLATFORM = {
  signupWebhook: "https://<your-n8n>/webhook/matjari-signup",
  setupWebhook:  "https://<your-n8n>/webhook/matjari-setup-request",
  …
}
window.SITE = { orderWebhook: "https://<your-n8n>/webhook/matjari-order", … }
```

A signup with the **full setup** plan selected goes to `setupWebhook` instead of
`signupWebhook` — one form, two different flows behind it.

Leave either empty and that form keeps working exactly as before — it just opens
WhatsApp and skips n8n. The site never waits on the webhook, so a broken
automation can't cost you a sale.

Stripe needs the third one: Stripe → Developers → Webhooks → add the
`matjari-stripe` URL, sending `checkout.session.completed` and `invoice.paid`.

## The WhatsApp rule that catches everyone

WhatsApp only lets you send free text to someone **within 24 hours of their last
message to you**. Outside that window you may send approved templates only.

These workflows send plain text, and that works because of the order things
happen in: the site's buttons open a WhatsApp chat *from the seller to you*,
which opens the window, and the automation replies inside it.

Where that doesn't hold — the renewal reminders in workflow 3, which fire weeks
later — create templates in Meta Business Manager and swap the node body from
`type: 'text'` to `type: 'template'`. Until you do, expect reminders to fail
silently for anyone who hasn't messaged you recently. The alerts to your own
number are unaffected.

## Test each one before going live

1. **Signup** — Execute Workflow, then submit the real form. Check: a row appears,
   the seller gets the welcome, you get the alert. Submit the same handle twice —
   the second must come back `409 handle_taken`.
2. **Store activation** — POST `{"handle":"ahmed"}` to the request webhook. A
   Stripe link should arrive on WhatsApp. Pay it in Stripe test mode and confirm
   `store_status` flips to `active` and `next_renewal` fills in.
3. **Renewal** — put a test row's `next_renewal` at today, yesterday-minus-3, and
   yesterday-minus-8, then Execute Workflow. Each should take a different branch.
4. **Setup** — POST a name and phone to `matjari-setup-request`; a case id comes back and both
   messages go out. Then POST `{"case_id":"…","phone":"…","stage":"filed"}` to
   `matjari-setup-stage` and check the customer gets the matching update.
5. **Order** — check out on the demo store. The seller alert must carry the
   customer's number; leave the cart's name and phone empty and the customer
   confirmation should be skipped, not fail.

## The setup flow has a rule the others don't

Workflow 5 promises the customer a **confirmed government fee before any payment**, and says
in every message that the authority issues the licence, not you. Both lines are deliberate:
government fees differ by emirate, licence type, and activity and change over time, and
promising an outcome you don't control is what gets setup agents complaints. Keep both when you
edit the copy.

## What still isn't automated

Creating the seller's actual page. Workflow 1 records them and welcomes them; you
build the page by hand from the row. Automating that means a real backend with
per-seller storage — see the note at the end of `site/README.md`.
