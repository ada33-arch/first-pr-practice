# -*- coding: utf-8 -*-
"""Draws the business as n8n canvases. These are maps, not automations:
every step is a No-Op node carrying its description, so the canvas reads like a
diagram and can still be executed to walk the path."""
import json, pathlib

OUT = pathlib.Path("/home/user/first-pr-practice/projects/matjari/automation/maps")
PER_ROW, DX, DY, X0, Y0 = 5, 260, 300, -700, 0


def step(name, note, pos, colorless=True):
    return {
        "parameters": {},
        "id": name.split(" ")[0].lower().replace("·", ""),
        "name": name,
        "type": "n8n-nodes-base.noOp",
        "typeVersion": 1,
        "position": list(pos),
        "notes": note,
        "notesInFlow": True,
    }


def trigger(name, pos):
    return {
        "parameters": {},
        "id": "start",
        "name": name,
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": list(pos),
        "notes": "Press Execute to walk this path. Nothing is sent — every node is a No-Op.",
        "notesInFlow": True,
    }


def sticky(content, pos, w=460, h=240, color=4, tag=""):
    return {
        "parameters": {"content": content, "width": w, "height": h, "color": color},
        "id": "note-" + str(abs(hash(content + tag)) % 100000),
        "name": "Note " + str(abs(hash(content + tag)) % 100000),
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": list(pos),
    }


def chain(names):
    conns = {}
    for a, b in zip(names, names[1:]):
        conns[a] = {"main": [[{"node": b, "type": "main", "index": 0}]]}
    return conns


def merge(*dicts):
    out = {}
    for d in dicts:
        for k, v in d.items():
            if k in out:
                out[k]["main"][0].extend(v["main"][0])
            else:
                out[k] = v
    return out


def wrapped(steps, y_base, x0=X0):
    """Lay a list of (name, note) along rows of PER_ROW, return nodes + names."""
    nodes, names = [], []
    for i, (name, note) in enumerate(steps):
        row, col = divmod(i, PER_ROW)
        x = x0 + col * DX if row % 2 == 0 else x0 + (PER_ROW - 1 - col) * DX  # snake, so lines don't fly back
        nodes.append(step(name, note, (x, y_base + row * DY)))
        names.append(name)
    return nodes, names


def save(filename, name, nodes, connections, notes_tag=""):
    wf = {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1", "timezone": "Asia/Dubai"},
        "pinData": {},
        "tags": [{"name": "matjari-map"}],
    }
    (OUT / filename).write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{filename}: {len(nodes)} nodes")


HEADER = ("## ⚠️ This is a map, not an automation\n\n"
          "Every node here is a **No-Op**: it does nothing, sends nothing, and charges nobody. "
          "It exists so the business can be read on a canvas instead of in a document.\n\n"
          "Press **Execute Workflow** to walk the path — each step lights up in order, and "
          "clicking one shows its description.\n\n"
          "**Never set these Active.** The workflows that actually run are the numbered ones "
          "in the folder above (01–05).")

# ============================================================ 01 · merchant ==
merchant = [
    ("M1 · They hear about us", "An ad, another merchant's referral, a QR sticker on a shop or a delivery bag."),
    ("M2 · They see a real souq", "The homepage shows working stores like theirs. Proof before any pitch."),
    ("M3 · They tap افتح متجرك", "The merchant page: build, market, secure, support — and what it costs."),
    ("M4 · They register free", "Name, handle, WhatsApp number. No card, no commitment."),
    ("M5 · Their page exists", "matjari.ae/@handle — links, socials, WhatsApp button. Ready for their bio today."),
    ("M6 · We message them", "Welcome, their link, and exactly what to send us to finish the page."),
    ("M7 · They decide to sell", "They pick المتجر. A payment link arrives on WhatsApp: 55 AED / month, cancel any time."),
    ("M8 · Payment clears", "ONLY NOW does the store switch on and enter the marketplace directory. Asking is never paying."),
    ("M9 · We build their store", "Products, photos, categories, prices — done by us in days. This is what they are buying."),
    ("M10 · Featured 14 days", "Front page placement, and their store goes out on our social accounts."),
    ("M11 · Orders reach their phone", "Items, total, and the customer's number on WhatsApp. They deliver and are paid directly."),
    ("M12 · Month two onward", "Reminder 3 days before, link on the day, warning if late. Unpaid = store off, page and products stay."),
]
nodes, names = wrapped(merchant, 0)
t = trigger("A merchant appears", (X0 - 240, 0))
save("map-01-merchant-journey.json", "MAP · The merchant's journey",
     [t] + nodes + [
         sticky(HEADER, (X0 - 260, -320), 520, 280, 3, "m"),
         sticky("### Free, and useful immediately\n\nM1–M6 cost the merchant nothing. They walk away with a page "
                "they can use in their Instagram bio the same day.\n\n**Why give it away:** a free page keeps them "
                "somewhere we can reach them, and it is the cheapest proof that we do what we say.",
                (X0 + 3 * DX + 60, -320), 420, 250, 5, "m1"),
         sticky("### Where the money starts\n\nM7–M10 is the whole business: they pay, we build, we feature them.\n\n"
                "**The rule that protects you:** the store only opens on a cleared payment, never on a request.",
                (X0 + 60, DY - 320), 420, 250, 4, "m2"),
         sticky("### What keeps them\n\nM11–M12: orders arriving on their phone is the habit. The renewal cycle runs "
                "itself, and suspension takes the store — never the page, the links, or the products.",
                (X0 + 3 * DX, 2 * DY - 320), 420, 230, 6, "m3"),
     ],
     merge({t["name"]: {"main": [[{"node": names[0], "type": "main", "index": 0}]]}}, chain(names)))

# ============================================================= 02 · shopper ==
shopper = [
    ("S1 · They arrive", "From search, a merchant's bio link, our social accounts, or a QR sticker in a real shop."),
    ("S2 · They browse the souq", "Featured stores, categories, every store with search. Many merchants in one place is the reason to return."),
    ("S3 · They open a store", "That merchant's store, inside our website, carrying our chrome and their brand."),
    ("S4 · They open a product", "Photos, price, what's included, quantity."),
    ("S5 · They add to cart", "Optionally leave a name and WhatsApp number so the merchant can reply."),
    ("S6 · They pay the merchant", "Checkout opens WhatsApp to THE MERCHANT. Delivery and payment agreed there. No account, no card on our site."),
]
nodes, names = wrapped(shopper, 0)
t = trigger("A shopper arrives", (X0 - 240, 0))
save("map-02-shopper-journey.json", "MAP · The shopper's journey",
     [t] + nodes + [
         sticky(HEADER, (X0 - 260, -320), 520, 280, 3, "s"),
         sticky("### The shopper never meets the platform\n\nNo login, no password, no saved card. They browse, "
                "they message a merchant, they pay that merchant.\n\n**What this costs us:** we cannot see their "
                "orders, chase abandoned carts, or email them later.\n\n**What it buys us:** no card data, no "
                "refunds, no payment licence, and no liability for a sale we were not part of.",
                (X0 + DX, DY - 300), 460, 280, 5, "s1"),
     ],
     merge({t["name"]: {"main": [[{"node": names[0], "type": "main", "index": 0}]]}}, chain(names)))

# ============================================================= 03 · licence ==
licence = [
    ("L1 · No trade licence", "Selling from an Instagram account, or wanting to start, and unable to do it legally."),
    ("L2 · They pick تأسيس كامل", "1,500 AED once: licence, built store, first products, training, and a full year of Store."),
    ("L3 · Free 20-minute call", "Emirate, licence type, activity — and the CONFIRMED government fee before they pay anything."),
    ("L4 · Documents and name", "Passport, photo, three proposed trade names, activity description. We reserve the name."),
    ("L5 · We file it", "Through a LICENSED SETUP PARTNER. They pay government fees to the authority directly."),
    ("L6 · Licence issued", "Usually 3–10 working days once documents are complete. The AUTHORITY issues it, not us."),
    ("L7 · We build everything", "Page, store, first 20 products, then an hour of training on running it."),
    ("L8 · A year before the next payment", "The monthly clock starts after that year — and only starts once the licence exists."),
]
nodes, names = wrapped(licence, 0)
t = trigger("Someone with no licence", (X0 - 240, 0))
save("map-03-licence-journey.json", "MAP · The licence customer's journey",
     [t] + nodes + [
         sticky(HEADER, (X0 - 260, -320), 520, 280, 3, "l"),
         sticky("### Two promises that must never be edited out\n\n**1. We do not issue licences.** The government "
                "authority does. We prepare, file, and chase — through a licensed partner.\n\n**2. No fee number "
                "before the call.** Government fees differ by emirate, licence type and activity, and they change. "
                "The confirmed figure comes on the first call, before any payment.\n\nPromising an outcome you do "
                "not control is how setup agents collect complaints.",
                (X0 + DX, DY - 320), 500, 300, 3, "l1"),
         sticky("### This path is blocked until you have a partner\n\nL5 is the gate. Without a licensed setup "
                "partner you cannot legally file for anyone, so the 1,500 service cannot be sold — while the 55 "
                "store can be sold today.", (X0 + 2 * DX, -320), 420, 220, 6, "l2"),
     ],
     merge({t["name"]: {"main": [[{"node": names[0], "type": "main", "index": 0}]]}}, chain(names)))

# =============================================================== 04 · owner ==
owner = [
    ("O1 · Signups land on your phone", "You build each free page from the sheet row. Minutes each."),
    ("O2 · Store requests handle themselves", "The payment link goes out automatically. You do nothing until money lands."),
    ("O3 · You build the paid store", "THE REAL WORK. Hours per merchant, and the reason they pay you instead of doing it themselves."),
    ("O4 · Setup cases", "The call, the documents, the filing, and four stage updates that send themselves once you post each stage."),
    ("O5 · Marketing", "Rotate who is featured, post each new store, run the seasonal campaigns."),
    ("O6 · Support", "Order questions, product help, pricing advice — in working hours, which is what we promise."),
    ("O7 · Renewals run without you", "Reminders, warnings and suspensions are automatic. You step in only for the ones that go quiet."),
]
nodes, names = wrapped(owner, 0)
t = trigger("Your week starts", (X0 - 240, 0))
save("map-04-owner-week.json", "MAP · Your week",
     [t] + nodes + [
         sticky(HEADER, (X0 - 260, -320), 520, 280, 3, "o"),
         sticky("### The one that does not scale\n\n**O3 is the bottleneck.** Every paid store costs you hours of "
                "hand-building. Ten merchants is a good week; fifty is not a person's job.\n\nThat single node is "
                "the argument for building the real backend — not features, not design. When O3 stops fitting in "
                "your week, self-serve editing pays for itself.",
                (X0 + 2 * DX, -320), 460, 260, 4, "o1"),
         sticky("### What the automations already carry\n\nO2 and O7 are done by workflows 02 and 03. You are not "
                "chasing payments or watching dates — you are building stores and answering merchants.",
                (X0 + DX, DY - 300), 440, 220, 5, "o2"),
     ],
     merge({t["name"]: {"main": [[{"node": names[0], "type": "main", "index": 0}]]}}, chain(names)))
