# Selling from the brief page

The client answers four questions, looks at their page, approves it, and gets
their files. This is how that last step actually works — and the one thing it
deliberately does not do.

---

## The flow

1. **Four questions** — `brief.html`
2. **See my page** — opens their real page in a new tab
3. **Approve** — they confirm they're happy, which unlocks the rest
4. **Continue** — goes to your payment provider
5. **Files** — a `.zip` containing the page, the copy, the brief and a guide

---

## What's in the package

Built in the browser, no server involved. A `.zip` written by hand — CRC-32,
per-file headers, central directory — so the page keeps its no-dependency
promise. Verified against `unzip -t` and Python's `zipfile`.

| File | What it is |
|---|---|
| `index.html` | The finished page. Self-contained; opens anywhere. |
| `copy.md` | The words on their own, so they can edit without touching markup. |
| `BRIEF.md` | What they chose, dated. Their record and yours. |
| `README.md` | Plain-English guide: changing words, putting it online. |

---

## Payment: there is no card form, on purpose

**A static page cannot take card details safely and cannot verify a payment.**
It has no server, so there is nothing to validate a charge against and nothing
to keep a secret in. A card form here would be, at best, theatre — and at worst
it would put you inside PCI scope for handling card numbers you have no
infrastructure to protect.

So checkout hands off to a provider that does this properly:

```js
const SHOP = {
  currency: '£',
  prices: { website: 450, landing: 350, deck: 250, portfolio: 400 },
  CHECKOUT: '',                    // ← your payment link
  CONTACT: 'hello@example.com',
};
```

Set `CHECKOUT` to a payment link from any of these — all of them work from a
static page and all handle tax, receipts and refunds for you:

| Provider | Good for |
|---|---|
| **Stripe Payment Links** | Cheapest per transaction; you handle delivery |
| **Gumroad** | Simplest; hosts the file and delivers it automatically |
| **Lemon Squeezy** / **Paddle** | Merchant of record — they handle VAT and sales tax |

**Leave `CHECKOUT` empty and nothing pretends.** The button starts an email to
you with their brief in it, and says plainly that payment isn't set up yet.

---

## The honest limitation

**A download in a static page cannot be gated behind a payment.** Anyone who
can open the page can reach the file. The approval checkbox is a confirmation
step, not a lock.

Three ways to handle that, in order of effort:

### 1. Let the provider deliver (simplest, recommended)
Gumroad and Lemon Squeezy host the file and release it only after payment. Turn
off the in-page download and let checkout do the work. No code needed.

### 2. Send it yourself
Keep the in-page download for *your* use. The client's "Continue" emails you the
brief; you reply with an invoice, then send the zip. Fine at low volume and it
gives you a moment of human contact before delivery.

### 3. Add a small backend
A function that verifies a Stripe webhook and returns a signed, expiring link.
Worth it only once volume makes options 1 and 2 annoying.

Whichever you pick, don't add a fake lock in the page. It stops nobody who
looks, and it misleads everyone who doesn't.

---

## Pricing

`SHOP.prices` is keyed by what they chose:

```js
prices: { website: 450, landing: 350, deck: 250, portfolio: 400 }
```

Two things worth saying out loud in the order summary, because both remove a
common hesitation:

- **One payment, not a subscription.** The files are theirs.
- **Nothing phones home.** Plain files that keep working whether or not you do.

---

## Before you take money for this

- **Say what a revision costs**, or how many are included. It's the first thing
  clients ask and the first thing that sours a job.
- **Be clear the copy is a draft.** The package says so; make sure your terms do
  too, so nobody expects a copywriter.
- **Sort out the logo case.** If they described a logo rather than supplying
  one, someone has to draw it. Either price that in or exclude it explicitly.
- **Check the imagery rules** in [`PHOTOS.md`](PHOTOS.md). Selling a page with an
  unlicensed photo in it makes their problem your problem.
