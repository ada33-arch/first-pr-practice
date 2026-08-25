# -*- coding: utf-8 -*-
"""One definition of the business, two outputs: the n8n canvases in this folder
and docs/journeys.html. Defining them once is what stops the drawing and the
readable page from drifting apart.

    python3 projects/matjari/automation/maps/build-maps.py
"""
import html, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[3] / ".claude" / "skills" / "workflow-canvas"))
from canvas import Canvas                                    # noqa: E402

DOCS = HERE.parents[1] / "docs"

# ============================================================ the business ==
# (file, title, subtitle, lane, trigger, [steps], [panels])
# step  = (number, title, note, [groups])
# group = (role, title, [(name, note[, optional])])
MAPS = [
 ("map-01-merchant-journey.json", "MAP · The merchant's journey", "merchant",
  "From first hearing about us to their second month.",
  ("A merchant appears", "Press Execute to walk the path. Every node is a No-Op — nothing is sent."),
  [
   (1, "They join, free",
    "Costs them nothing, and they walk away with a page they can put in their Instagram bio the same day.",
    [("input", "👤 They find us", [
        ("M1 · They hear about us", "An ad, another merchant's referral, or a QR sticker on a shop or delivery bag."),
        ("M2 · They see a real souq", "The homepage shows working stores like theirs. Proof before any pitch."),
        ("M3 · They tap افتح متجرك", "The merchant page: build, market, secure, support — and what it costs.")]),
     ("input", "✍️ They register", [
        ("M4 · They register free", "Name, handle, WhatsApp number. No card, no commitment."),
        ("M5 · Their page exists", "matjari.ae/@handle — links, socials, WhatsApp button. Usable today."),
        ("M6 · We message them", "Welcome, their link, and exactly what to send us to finish the page.")])]),
   (2, "They open a store",
    "The whole business lives in this step: they pay, we build, we put them in front of shoppers.",
    [("prepare", "💳 They decide to sell", [
        ("M7 · They pick المتجر", "A payment link arrives on WhatsApp: 55 AED / month, cancel any time."),
        ("M8 · Payment clears", "ONLY NOW does the store open and enter the directory. Asking is never paying.")]),
     ("create", "🛠️ We build it for them", [
        ("M9 · We build their store", "Products, photos, categories, prices — done by us in days. This is what they buy."),
        ("M10 · Featured 14 days", "Front page placement and a post on our social accounts.", True)]),
     ("optional", "🎁 Offers you may run", [
        ("First month free", "Highest-converting offer for a 55 AED subscription. Costs a page you were building anyway.", True),
        ("Founding price", "First 50 stores keep 55 AED for as long as they stay.", True),
        ("Referral month", "A free month each when a referred store's first payment clears.", True)])]),
   (3, "They sell, and they stay",
    "Orders arriving on their phone is the habit. The renewal cycle runs without you.",
    [("engine", "🛒 Their customers", [
        ("M11 · Orders reach their phone", "Items, total, and the customer's number on WhatsApp. They deliver and are paid directly.")]),
     ("prepare", "🔁 The month turns", [
        ("M12 · Renewal or suspension", "Reminder 3 days before, link on the day, warning if late. Unpaid = store off, page and products stay.")])]),
  ],
  [("📌 The numbers on this canvas",
    "**Store** — 55 AED / month\n**Setup + licence** — 1,500 AED once, a year of Store included\n"
    "**Featured** — 14 days for every new store\n**Grace period** — 7 days late before the store switches off\n\n"
    "Change them in `content/data.js` and `MATJARI_PRICE`, not here.", 320),
   ("⚠️ The rule that protects you",
    "A store opens on a **cleared payment**, never on a request. Workflow 02 enforces it: the "
    "request only creates a payment link, and Stripe's callback is what flips the store on.", 240)]),

 ("map-02-shopper-journey.json", "MAP · The shopper's journey", "shopper",
  "From arriving at the souq to paying a merchant.",
  ("A shopper arrives", "Press Execute to walk the path. Every node is a No-Op — nothing is sent."),
  [
   (1, "They arrive and browse",
    "Many merchants in one place is the whole reason to come back — a single store never gets a second visit.",
    [("input", "🚪 They arrive", [
        ("S1 · They arrive", "From search, a merchant's bio link, our social accounts, or a QR sticker in a real shop."),
        ("S2 · They browse the souq", "Featured stores, categories, and every store with search.")])]),
   (2, "They choose",
    "From here they are inside one merchant's store, carrying our chrome and their brand.",
    [("prepare", "🛍️ Inside a store", [
        ("S3 · They open a store", "That merchant's store, inside our website."),
        ("S4 · They open a product", "Photos, price, what's included, quantity."),
        ("S5 · They add to cart", "Optionally leave a name and WhatsApp number so the merchant can reply.")])]),
   (3, "They pay the merchant",
    "The one step that defines the business: the money goes to the merchant, not to us.",
    [("create", "💬 Checkout", [
        ("S6 · They message the merchant", "The full order opens in WhatsApp with THE MERCHANT. Delivery and payment agreed there.")])]),
  ],
  [("🔒 What the shopper never does",
    "No account. No password. No card on our site.\n\n**We lose:** their contact details, abandoned-cart chasing, and any email list.\n\n"
    "**We gain:** no card data, no refunds, no payment licence, and no liability for a sale we were never part of.", 300)]),

 ("map-03-licence-journey.json", "MAP · The licence customer's journey", "merchant",
  "From no trade licence to a store that is legally selling.",
  ("Someone with no licence", "Press Execute to walk the path. Every node is a No-Op — nothing is sent."),
  [
   (1, "They decide",
    "They are selling from an Instagram account, or want to start, and cannot do it legally.",
    [("input", "🧾 The problem", [
        ("L1 · No trade licence", "Trading in the UAE needs a valid licence, including selling through social media."),
        ("L2 · They pick تأسيس كامل", "1,500 AED once: licence, built store, first products, training, a full year of Store.")])]),
   (2, "The call, then the papers",
    "Nothing is charged before they know the real number.",
    [("prepare", "☎️ First call — free", [
        ("L3 · Twenty minutes", "Emirate, licence type, activity — and the CONFIRMED government fee before they pay anything.")]),
     ("input", "📄 What they send", [
        ("L4 · Documents and name", "Passport, photo, three proposed trade names, activity description. We reserve the name.")])]),
   (3, "Filing",
    "This is the step you cannot do without a partner.",
    [("create", "🏛️ With the authority", [
        ("L5 · We file it", "Through a LICENSED SETUP PARTNER. They pay government fees to the authority directly."),
        ("L6 · Licence issued", "Usually 3–10 working days once documents are complete. The AUTHORITY issues it, not us.")])]),
   (4, "They open",
    "Everything they were paying for, delivered at once.",
    [("engine", "🏪 We build it all", [
        ("L7 · Page, store, products", "First 20 products uploaded, then an hour of training on running it."),
        ("L8 · A year before the next payment", "The monthly clock starts after that year, and only starts once the licence exists.")])]),
  ],
  [("⚠️ Two promises that must never be edited out",
    "**1. We do not issue licences.** The government authority does. We prepare, file, and chase — through a licensed partner.\n\n"
    "**2. No fee number before the call.** Government fees differ by emirate, licence type and activity, and they change.\n\n"
    "Promising an outcome you do not control is how setup agents collect complaints.", 320),
   ("🚧 This path is blocked today",
    "**L5 is the gate.** Without a licensed setup partner you cannot legally file for anyone, so the 1,500 service "
    "cannot be sold yet — while the 55 store can be sold today.", 220)]),

 ("map-04-owner-week.json", "MAP · Your week", "owner",
  "What lands on you, what runs without you, and where it stops scaling.",
  ("Your week starts", "Press Execute to walk the path. Every node is a No-Op — nothing is sent."),
  [
   (1, "The inbox",
    "Everything arrives on WhatsApp. Most of it needs minutes, not hours.",
    [("input", "📥 What arrives", [
        ("O1 · Signups", "You build each free page from the sheet row. Minutes each."),
        ("O2 · Store requests", "The payment link goes out by itself. You do nothing until money lands.")])]),
   (2, "The build",
    "The part that is genuinely your job — and the part that will eventually break.",
    [("create", "🛠️ Hand work", [
        ("O3 · You build the paid store", "THE BOTTLENECK. Hours per merchant, and the reason they pay you rather than doing it themselves."),
        ("O4 · Setup cases", "The call, the documents, the filing, and four stage updates that send themselves once you post each stage.")])]),
   (3, "Growing it",
    "The promises you made on the merchant page come due here.",
    [("engine", "📣 Marketing", [
        ("O5 · Feature and post", "Rotate who is featured, post each new store, run the seasonal campaigns.")]),
     ("prepare", "💬 Support", [
        ("O6 · Answer merchants", "Order questions, product help, pricing advice — in working hours, which is what we promise.")])]),
   (4, "What you never touch",
    "Already automated. Do not spend your week here.",
    [("prepare", "🤖 Runs itself", [
        ("O7 · Renewals and suspensions", "Reminders, warnings and suspensions are automatic. You step in only for the ones that go quiet.")])]),
  ],
  [("📈 When to stop doing this by hand",
    "**O3 is the ceiling.** Ten merchants is a good week. Fifty is not a person's job.\n\n"
    "When O3 stops fitting in your week, self-serve product editing pays for itself — that, not features "
    "or design, is the moment to build the real backend.", 280)]),
]

HEADER = ("## ⚠️ This is a map, not an automation\n\nEvery node here is a **No-Op**: it does nothing, sends "
          "nothing, charges nobody. It exists so the business can be read on a canvas.\n\nPress **Execute "
          "Workflow** to walk the path.\n\n**Never set this Active.** The workflows that actually run are the "
          "numbered ones in the folder above.")


def build():
    lines, page_sections = [], []
    for fn, title, lane, sub, trig, steps, panels in MAPS:
        c = Canvas(title, sub)
        c.note("⚠️ Map, not automation", HEADER.split("\n\n", 1)[1], at_step=-280, color="note",
               height=300, width=300)
        start = c.trigger(*trig)
        order = [start]
        for number, stitle, snote, groups in steps:
            order += c.step(number, stitle, snote, groups)
        for ptitle, pbody, pheight in panels:
            c.note(ptitle, pbody, height=pheight, width=360,
                   color="note" if ptitle.startswith("📌") or ptitle.startswith("📈") else "optional")
        c.link(*order)
        lines.append(c.save(HERE / fn, tag="matjari-map"))

        # --- the same content, as a readable page ---------------------------
        e = html.escape
        blocks = []
        for number, stitle, snote, groups in steps:
            cards = []
            for role, gtitle, items in groups:
                rows = "".join(
                    f'<li class="step step--{lane}{" is-off" if len(it) > 2 and it[2] else ""}">'
                    f'<span class="step__n">{e(it[0].split(" · ")[0])}</span>'
                    f'<div class="step__b"><h3>{e(it[0].split(" · ")[-1])}</h3>'
                    f"<p>{e(it[1])}</p></div></li>" for it in items)
                cards.append(f'<div class="group group--{role}"><h4>{e(gtitle)}</h4>'
                             f'<ol class="flow">{rows}</ol></div>')
            blocks.append(f'<div class="phase"><div class="phase__head"><span class="phase__n">Step {number}</span>'
                          f"<h3>{e(stitle)}</h3></div><p class=\"phase__note\">{e(snote)}</p>"
                          f'<div class="groups">{"".join(cards)}</div></div>')
        asides = "".join(
            f'<div class="aside"><h4>{e(t)}</h4><p>{e(b.replace("**", ""))}</p></div>' for t, b, _ in panels)
        page_sections.append(
            f'<section><div class="wrap"><div class="head"><h2>{e(title.split("· ")[1])}</h2>'
            f'<span class="tag tag--{lane}">{len([i for _,_,_,gs in steps for _,_,its in gs for i in its])} steps</span></div>'
            f'<p class="sub">{e(sub)}</p>{"".join(blocks)}<div class="asides">{asides}</div></div></section>')

    (DOCS / "journeys.html").write_text(PAGE.replace("<!--SECTIONS-->", "".join(page_sections)), encoding="utf-8")
    lines.append("journeys.html rebuilt from the same definitions")
    return lines


PAGE = pathlib.Path(HERE / "page-template.html").read_text(encoding="utf-8") if (HERE / "page-template.html").exists() else ""

if __name__ == "__main__":
    for line in build():
        print(line)
