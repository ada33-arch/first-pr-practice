# The idea

> Every path through this — merchant, shopper, licence customer, and your own week —
> is drawn step by step in [`idea-map.html`](idea-map.html), with the twenty
> assumptions I made numbered for correction. Read that first if you want to
> check the idea rather than the plan.

## In one paragraph

An Arabic-first UAE marketplace. Shoppers land on one website and browse many
merchants' stores in one place. Merchants join **free** and get a personal page;
when they want to sell they pay **55 AED a month** to open a store inside the
marketplace — and we do the work they can't or shouldn't do alone: build the
store, market it, secure it, support it. For merchants with no licence, **1,500
AED once** adds a UAE trade licence, a fully built store, and a year of
subscription. We never take a commission on their sales.

## Why a merchant pays

Not for software. A merchant can technically build a store alone — it just takes
months, costs them evenings, and pulls them away from the thing they are actually
good at. We sell them that time back.

| Pillar | What we do | The honest limit |
| --- | --- | --- |
| **نبني متجرك** | Store built, products uploaded, categories and images sorted — ready in days | We build by hand, so there is sometimes a queue |
| **نسوّق لك** | The marketplace's own audience, featured placement, our social accounts, seasonal campaigns | Paid ad budget is theirs, not part of the fee |
| **نأمّن متجرك** | Hosting and maintenance, HTTPS, backups, verified stores, fake-order filtering | No card data is stored anywhere — never claim certifications we don't hold |
| **ندعمك** | WhatsApp support, an alert on every order, help writing and pricing products | One person answering — promise working hours, not 24/7 |

## The three offerings

| | Price | What it is |
| --- | --- | --- |
| **الملف الشخصي** | Free forever | Link page, unlimited links and socials, WhatsApp button, AR/EN + light/dark |
| **المتجر** | **55 AED / month** | Everything above + products, product pages, categories, search, cart, orders to WhatsApp, a place in the marketplace |
| **تأسيس كامل** | **1,500 AED once** | A UAE e-commerce trade licence in their name, store built for them, first 20 products, 1 hour training, **a full year of Store included** |

## Three people

- **Owner** — every signup, store request, payment, and setup case arrives on
  WhatsApp; builds each merchant's store by hand for now.
- **Merchant** — joins free, optionally pays monthly, receives their own
  customers' orders directly.
- **Customer** — browses the marketplace, buys from a merchant, talks to that
  merchant. Never deals with the platform.

## Getting merchants to open a store

Ordered by cost to run against how strongly they pull:

1. **First month free** — highest-converting offer for a 55 AED subscription.
2. **Founding price** — first 50 stores keep 55 AED for as long as they stay.
3. **Featured for 14 days** — free for us, and it makes the marketplace look alive.
4. **First 5 products uploaded free** — the real barrier is the evening of work, not the fee.
5. **WhatsApp catalogue migration** — most UAE small sellers already sell in chats.
6. **Referral: a free month each** when the referred store's first payment clears.
7. **The licence wait is free** — the subscription clock starts on issue, not on payment.
8. **A QR sticker** for their shop or delivery bags — their foot traffic becomes store visits.
9. **Seasonal campaigns** (Ramadan, National Day) that require an active store to join.
10. **A free account audit** — an honest hour on their Instagram buys trust.
11. **Show real traffic** — only once the number is true.

## Decided

- The name is **رنت ستور / RentStore**, on **rentstore.ae** — the domain is owned
- Free / **55 AED monthly** / **1,500 AED one-time**, in AED
- The setup package includes **a full year** of Store
- **No commission**, ever — subscription only
- WhatsApp is the channel for everything
- Merchants are paid by their customers **directly**; money never passes through
  the platform, which is what keeps this runnable without a payment licence
- Suspension never deletes a page, its links, or its products

## Open

| Decision | Placeholder today | Why it matters |
| --- | --- | --- |
| Licensed setup partner | Assumed | Without one you cannot legally file a licence — gates the 1,500 AED service |
| Payment gateway | Stripe | Tap or Telr may suit the UAE better; one HTTP node in workflow 02 |
| Emirates and licence types served | "we recommend the right one" | Only true once you decide the range |
| Government fee figures | Deliberately absent | They vary by emirate, licence type, and activity |
| Which offers to run | None yet | Recommended: first month free + founding price + 14 days featured |
| Real photography | Drawn art and initials | The biggest visual gap in a marketplace |

## Honest limits

1. **No backend.** No accounts, no login, no hosted per-merchant pages, no card
   payments in the product. Signups and orders are WhatsApp messages, and each
   store is built by hand from a sheet row.
2. **WhatsApp's 24-hour rule.** Free text only reaches someone within 24 hours of
   *their* last message. Workflows 01, 02, 04 and 05 are safe because the site
   makes the person message first. **Workflow 03's renewal reminders fire weeks
   later and will fail silently** until Meta-approved templates exist.
3. **We do not issue licences.** The authority does. Every message says so, and
   the confirmed government fee is promised on the first call, before any
   payment. Both lines should survive any copy rewrite.

## Roadmap

**Now — the marketplace shell.** A `stores` list in `content/data.js`, a
marketplace home listing merchants, an all-stores page with search and category
filters, and a merchant-facing page built on the four pillars and the offers
above. Empty slots read as "your place here", not as a dead souq.

**Next — three more workflows.** `06-store-listing` (a paid store enters the
directory and is featured for 14 days), `07-marketing-request` (campaign briefs
run as cases, not from memory), `08-referral` (a free month credited to both
merchants by moving `next_renewal`, the column workflow 03 already reads).

**Then — the real product.** Accounts and login, hosted pages at `domain/@handle`,
self-serve product editing, card payments, an owner dashboard. This needs a
database, auth, and hosting: weeks, not hours. Worth starting the moment the
manual version has paying merchants.

**Before any of it — the business side.** The setup partner, your own licence,
the gateway, the brand. Monthly store customers can be signed today; a 1,500 AED
setup customer cannot, until the partner exists.
