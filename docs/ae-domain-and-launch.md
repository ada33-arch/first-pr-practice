# Buying a `.ae` domain and putting the store online

Two decisions, in this order: **which `.ae` name and where to buy it**, then **where the
site is hosted and how the domain points at it**. Everything below is doable in an
afternoon; the only step that costs money is the domain.

Prices checked August 2026. They move — treat them as a shortlist to verify at checkout,
not as quotes.

---

## 1. Which kind of `.ae` to buy

| Form | Example | Who can register |
| --- | --- | --- |
| **Second level** | `yourbrand.ae` | Anyone, anywhere. **No UAE trade licence, no Emirates ID, no residency, no paperwork.** |
| Third level | `yourbrand.co.ae`, `.com.ae`, `.net.ae` | Restricted. Requires a UAE-based accredited registrar **and** proof of eligibility — trade licence, registration certificate, or a letter from a UAE authority. |

**Go with the second-level `yourbrand.ae`.** It is the shorter, stronger name, it is what
customers type, and it is the one you can actually register today without a UAE company
behind it. Only reach for `.co.ae` if the `.ae` you want is already taken and you have a
trade licence.

Policy is set by the **TDRA** (Telecommunications and Digital Government Regulatory
Authority) through **.aeDA**, which accredits the registrars.

---

## 2. Where to buy it — the shortlist

| Registrar | First year | Renewal | Why you'd pick it |
| --- | --- | --- | --- |
| **Dynadot** | ~$32 | **~$32.68** | Cheapest *renewal*, and the renewal is the number that matters. Best multi-year deals: ~$98 for 3 years, ~$163 for 5. |
| **IONOS** | **$30.00** | ~$60 | Cheapest first year — then the price doubles. Only worth it if you plan to transfer out after year one. |
| **AEserver** (Dubai) | AED 125 (~$34) | AED 149 (~$41) | TDRA-accredited, UAE-based, bills in AED, local support. The one to use if you later want `.co.ae` or a UAE invoice for accounting. |
| **Hostinger** | $49.00 | $59.00 | Bundles `.ae` + `.com` + `.online` for ~$59.98 first year. Convenient, not cheap. |

### The recommendation

**Buy `yourbrand.ae` at Dynadot for 3 years (~$98 total, ~$33/year).**

Reasoning:
- It has the lowest renewal price on the market, and a domain is a renewal cost forever,
  not a purchase. The `$30 first year → $60 after` offers cost more from year two onward.
- Paying 3 years up front locks the low rate and removes the single most common way to
  lose a live store: a missed renewal.
- Nothing about the second-level `.ae` requires a local registrar, so there is no
  functional reason to pay the UAE premium.

**Pick AEserver instead if** you want an AED invoice for UAE bookkeeping, or you think
you'll add `.co.ae`/`.com.ae` later — those need a UAE-accredited registrar anyway, and
keeping one account is simpler than two.

### Before you pay

- Buy the **`.com` of the same name too** if it's free and cheap (~$12/yr). It is the
  standard defensive registration and it costs less than the `.ae`.
- Turn **auto-renew on** and put a calendar reminder 30 days before expiry.
- Turn on **WHOIS privacy** if the registrar offers it for `.ae`.
- Check the name is free at the registrar itself — third-party availability checkers are
  often stale, and some short `.ae` names are priced as premium (four to six figures).
- Register in your own name, with your own email, on your own account. Never let a
  developer or agency hold the registration.

> I can't complete the purchase for you — it needs your payment details and identity.
> Everything up to the checkout button is decided above.

---

## 3. Where the site is hosted

The store in `site/` is static: HTML, CSS, one JS file, no backend, no build step. That
means free hosting, and the choice is only about speed and convenience.

| Host | Cost | Notes |
| --- | --- | --- |
| **Cloudflare Pages** | Free | **Recommended.** Has edge locations in the UAE, so the site loads fast for Gulf customers. Free SSL, free unlimited bandwidth, deploys straight from this GitHub repo. |
| GitHub Pages | Free | Simplest — already wired up in `.github/workflows/pages.yml`. But its CDN has no Middle East presence, so UAE visitors are served from Europe. Fine to start; noticeable on mobile data. |

Both are set up for you. Use GitHub Pages to go live today, move to Cloudflare Pages when
traffic is real.

---

## 4. Launch runbook

### Step 1 — set the domain in the repo

```bash
scripts/set-domain.sh yourbrand.ae
```

That writes `site/CNAME`, and fills the real domain into the canonical tags, the Open
Graph URLs, `robots.txt`, and `sitemap.xml`. Commit the result.

### Step 2 — turn on hosting

**GitHub Pages:** repo → Settings → Pages → Source: **GitHub Actions**. The
`Deploy site to GitHub Pages` workflow publishes `site/` on every push to `main`.

**Cloudflare Pages:** dashboard → Workers & Pages → Create → Pages → connect this repo →
build command: *(none)* → build output directory: `site`.

### Step 3 — point the domain at it

At your registrar's DNS panel:

**For GitHub Pages** — apex `yourbrand.ae`:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<your-github-username>.github.io` |

**For Cloudflare Pages** — move the domain's nameservers to Cloudflare (they give you
two), then add the custom domain in the Pages project. DNS is then automatic.

DNS takes 10 minutes to a few hours. Then in Settings → Pages, tick **Enforce HTTPS**
once the certificate is issued.

### Step 4 — fill in your content

Everything customers see lives in **`site/assets/js/data.js`**:

- `whatsapp` — your number, digits only, country code first, no `+`. **Checkout does not
  work until this is set** — it falls back to copy-to-clipboard.
- `name`, `bio`, `handle`, `socials` — your profile.
- `products` — the catalogue. The entries in there now are shaped for systems and books
  but the copy is placeholder; replace the titles, descriptions, prices, and `features`
  with the real products.
- `currency` — set to AED for a UAE store.

Then swap the `<title>` and `description` in the three HTML files for your real brand.

### Step 5 — check it

```bash
npx serve site
```

Click through: language toggle (AR/EN), theme toggle, add to cart, remove, checkout.
Then do the same on a phone.

---

## 5. Taking money

Checkout currently opens WhatsApp with the order pre-written, which is how most Gulf
creator stores actually sell, and it needs no merchant account. When you want card
payments, the swap is one function — `checkout()` in `site/assets/js/site.js` — pointed at
a payment link. UAE-friendly options: **Stripe** (supports UAE), **Tap Payments**,
**Telr**, **Network International**. Each gives you a hosted link you redirect to with the
cart total.

Note that selling commercially in the UAE generally needs a trade licence — that's a
business-setup question, separate from the domain, and worth asking an accountant about
before you scale past informal sales.
