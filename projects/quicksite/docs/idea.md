# The idea

## In one paragraph

A bilingual, self-serve page builder. Anyone answers four plain questions —
what they're building, which look, what they offer, how people reach them —
and gets a real, working page built from their own words, in Arabic or
English. The first two pages are **free**, no account and no card. After
that it's a fair **one-time fee per page** — never a subscription, because the
file is theirs the moment it's built and nothing about it depends on this
service staying online.

## Why a one-time fee, not a subscription

The deliverable is a single static file. It doesn't get hosted here, doesn't
phone home, and doesn't stop working if this project disappears tomorrow.
Charging monthly for something with no ongoing cost to us would be renting
back what we already handed over — so the second and every later page is
priced once, and that's the whole transaction.

## The two offerings

| | Price | What it is |
| --- | --- | --- |
| **الباقة المجانية** | Free, first two pages | Four questions, nine looks, a real downloadable page |
| **كل صفحة بعدها** | A fair one-time fee, per page | The same four questions, no limit on how many, still no subscription |

## Why someone answers four questions instead of writing a page themselves

Not because they can't. It's that most people trying to describe their own
work stare at a blank page longer than they'd like to admit. Four narrow
questions — what, who, why, how to reach you — are easier to answer than
"write your homepage," and the system turns those answers into something
that already looks considered: a chosen palette, a clear headline, an offer
grid, a way to get in touch.

## Three people

- **Owner** — every finished brief arrives on WhatsApp (see
  `../automation/01-brief-submitted.json`); builds nothing by hand unless a
  customer asks for more than the generated page.
- **Customer** — answers the four questions, sees their page build live in
  front of them, downloads it or sends it and gets it back by hand for now.
- Nobody else touches the system. There is no login, no dashboard, no third
  party in the loop.

## Where a real page could still let someone down

Named on purpose, the same way `../automation/README.md` names what a
webhook can't guarantee:

- **The free count lives in the browser**, not a server. It resets if someone
  clears their storage or switches devices. That's an honest trade for
  needing no account at all — say so if anyone asks, rather than pretending
  it's enforced.
- **The wording is a first draft from their own answers**, not written copy.
  Nobody proofreads or improves it before it reaches the page.
- **No logo upload.** The generated page is text and colour only; a customer
  who wants their mark on it edits the downloaded file themselves or asks for
  help by hand.
- **Nine looks, not a custom one.** Someone who wants a colour outside the
  nine palettes needs a person, not this flow.

## What would come before charging for real

1. **A payment link** for the per-page fee (Stripe Payment Links, or a
   provider that also handles VAT — see the parent repo's other projects for
   the reasoning on merchant-of-record vs. card processor).
2. **A way to actually deliver** the second-and-later page once it's paid
   for, rather than relying on the same WhatsApp handoff every time.
3. **A logo slot**, if customer feedback says the text-only page isn't enough
   — kept out of the first version deliberately, so file uploads and their
   security surface (what's a safe image, where it's read, that it never
   leaves the browser) aren't a problem to solve before there's evidence
   anyone wants it.

None of that blocks the free path. The four questions, the nine looks, and a
downloadable page work today, in both languages, with nothing to configure.
