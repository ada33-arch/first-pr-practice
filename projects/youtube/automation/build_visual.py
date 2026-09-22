# -*- coding: utf-8 -*-
"""Re-lays out the real, functioning YouTube automation using the house
visual grammar: numbered Step containers, colour-coded groups inside them,
one node per box — the same shape as canvas.py's maps, but wrapping REAL
nodes (real types, real parameters) instead of No-Ops.

This does not change what the workflow does — every node, connection and
parameter is identical to the source files. It only changes where things
sit on the canvas. The auto-edit step (soundtrack/Creatomate/upscale) is
NOT an n8n workflow — it's Claude, processing on request through a Google
Drive+Sheets connector — so it's drawn as a note between Step 1 and Step 2,
not as fake nodes.

    python3 build_visual.py
"""
import json, pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, "/home/user/first-pr-practice/.claude/skills/workflow-canvas")
from canvas import ROLE, DIGITS, NODE_DX, GROUP_PAD_X, GROUP_TOP, GROUP_BOT, STEP_PAD_X, STEP_TOP, STEP_BOT, STEP_GAP, GROUP_GAP  # noqa: E402

SOURCE_FILES = [
    "workflow-01-intake.json",
    "workflow-02-request-approval.json",
    "workflow-03-handle-approval.json",
    "workflow-04-scheduled-publish.json",
]

# ---------------------------------------------------------------- load real nodes
nodes_by_name = {}
all_connections = {}
for fname in SOURCE_FILES:
    data = json.loads((HERE / fname).read_text(encoding="utf-8"))
    for n in data["nodes"]:
        if n["type"] != "n8n-nodes-base.stickyNote":
            nodes_by_name[n["name"]] = json.loads(json.dumps(n))  # deep copy
    all_connections.update(data["connections"])

# ---------------------------------------------------------- the three numbered n8n steps
# (number, title, note, [ (role, group_title, [node_name, ...]) ])
STEPS = [
    (1, "Bring footage in", "A new file dropped in Drive becomes a tracked row — nothing edited yet.", [
        ("input", "📥 Watch & guess", ["New file in Raw Uploads", "Guess pillar & format from filename"]),
        ("prepare", "📝 Log it", ["Log into Content Calendar"]),
    ]),
    (2, "Confirm before publish", "The mandatory human checkpoint — nothing reaches Step 3 without a tap here.", [
        ("prepare", "🗓️ Daily check", ["Every day 9am", "Find items due for review"]),
        ("input", "✅ Ask for approval", ["Send approval request", "Mark Awaiting Approval"]),
        ("input", "👆 Handle the tap", ["Approval button tapped", "Read the tap", "Approved?"]),
        ("create", "🔀 Apply the decision", ["Mark Approved", "Send back for editing", "Acknowledge the tap"]),
    ]),
    (3, "Publish on schedule", "Runs on its own once an item is Approved — no one has to click publish.", [
        ("prepare", "🔍 Find due now", ["Every 15 minutes", "Find items due now", "Scheduled time reached?"]),
        ("create", "🚀 Publish it", ["Download edited file", "Upload to YouTube", "Mark Published", "Notify it went live"]),
    ]),
]

OVERVIEW = (
    "## 🗺️ How to read this canvas\n\n"
    "Three numbered n8n steps, left to right, plus one step that ISN'T n8n (see the note below "
    "Step 1). Inside each step, colour tells you what a box does: 🟩 green = something a person "
    "gives it or approves · 🟦 blue = finding/deciding what's due · 🟪 purple = automated work · "
    "🟥 red = the irreversible action (writing, publishing) · 🟨 yellow = a safety branch.\n\n"
    "Steps are separate n8n triggers under the hood (a Drive watch, two schedules, a Telegram "
    "webhook) — they hand off to each other only through the **status** column of the shared "
    "\"Content Calendar\" Google Sheet, never through a wire on the canvas."
)

SETUP_CHECKLIST = (
    "## 🚦 Do this first — nothing runs without these\n\n"
    "**1. Google Drive** — folders `Raw Uploads` and `Edited`; copy each ID from its URL into the "
    "matching `REPLACE_WITH_..._FOLDER_ID` field.\n\n"
    "**2. Google Sheet** `Content Calendar` with headers: `date_added pillar format raw_file_link "
    "edited_file_link title description tags thumbnail_link scheduled_datetime status "
    "telegram_message_id youtube_url`. Copy its ID into every `REPLACE_WITH_SHEET_ID`.\n\n"
    "**3. n8n credentials** — one Google OAuth2 (Drive+Sheets scopes), one Telegram bot (via "
    "@BotFather) plus your chat id (via @userinfobot).\n\n"
    "**4. YouTube Data API v3** — Google Cloud Console → new project → enable the API → OAuth "
    "consent screen → OAuth client → connect it as a YouTube credential in n8n, signed in as the "
    "channel's own account. See Step 3's note for the full sequence.\n\n"
    "**5. Claude's own Google connector + Creatomate** — see the note below Step 1."
)

CLAUDE_STEP_NOTE = (
    "## 🤖 Between Step 1 and Step 2 — Claude does this, not n8n\n\n"
    "`Needs edit` rows aren't picked up automatically. **You ping Claude** to process them: it "
    "generates a soundtrack and upscales via Higgsfield, assembles the cut via a Creatomate "
    "template, then reads/writes the row directly through a Google Drive + Sheets connector, "
    "setting status to `Ready to schedule`. No n8n node calls Higgsfield — there's no confirmed "
    "public endpoint for it reachable from n8n — and this runs on request, not on a schedule."
)


def sticky(content, x, y, w, h, color):
    return {
        "parameters": {"content": content, "width": w, "height": h, "color": color},
        "id": f"sticky-{x}-{y}", "name": f"Note {x}-{y}",
        "type": "n8n-nodes-base.stickyNote", "typeVersion": 1, "position": [round(x), round(y)],
    }


all_nodes, all_stickies = [], []
x_cursor = 0
step_edges = []  # (left, right, top, bottom) per step, for placing the Claude note
for number, title, note, groups in STEPS:
    left = x_cursor
    gx = x_cursor + STEP_PAD_X
    gy = STEP_TOP
    for role, gtitle, item_names in groups:
        gw = len(item_names) * NODE_DX - (NODE_DX - 210) + GROUP_PAD_X * 2
        gh = GROUP_TOP + GROUP_BOT + 60
        all_stickies.append(sticky(f"### {gtitle}", gx, gy, gw, gh, ROLE[role]))
        for i, name in enumerate(item_names):
            n = nodes_by_name[name]
            n["position"] = [round(gx + GROUP_PAD_X + i * NODE_DX), round(gy + GROUP_TOP)]
            all_nodes.append(n)
        gy += gh + GROUP_GAP
    step_w = max(len(g[2]) * NODE_DX - (NODE_DX - 210) + GROUP_PAD_X * 2 for g in groups) + STEP_PAD_X * 2
    step_h = gy - GROUP_GAP + STEP_BOT
    digits = "".join(DIGITS[int(d)] for d in str(number))
    all_stickies.append(sticky(f"## Step {digits} {title}\n\n{note}", x_cursor, 0, step_w, step_h, ROLE["step"]))
    step_edges.append((left, x_cursor + step_w, 0, step_h))
    x_cursor += step_w + STEP_GAP

# The Claude-mediated note sits directly below Step 1, kept to Step 1's own
# horizontal span so it can't overlap Step 2/3's boxes (which start at y=0
# too, and are taller — check_overlap only checks nodes, not stickies, so
# this has to be gotten right by construction).
step1_left, step1_right, _, step1_bottom = step_edges[0]
claude_y = step1_bottom + GROUP_GAP
all_stickies.append(sticky(CLAUDE_STEP_NOTE, step1_left, claude_y, step1_right - step1_left, 260, ROLE["optional"]))

overview_h, setup_h = 320, 340
all_stickies.append(sticky(OVERVIEW, -400, -overview_h - 40, 640, overview_h, ROLE["note"]))
all_stickies.append(sticky(SETUP_CHECKLIST, 260, -setup_h - 40, 700, setup_h, ROLE["note"]))

combined = {
    "name": "YouTube Plan · Visual (numbered steps)",
    "nodes": all_stickies + all_nodes,
    "connections": all_connections,
    "active": False,
    "settings": {"executionOrder": "v1"},
    "pinData": {},
    "tags": [{"name": "youtube-automation"}],
}


def check_overlap(workflow):
    seen = {}
    for n in workflow["nodes"]:
        if n["type"] == "n8n-nodes-base.stickyNote":
            continue
        key = tuple(p // 60 for p in n["position"])
        if key in seen:
            raise SystemExit(f'{n["name"]} overlaps {seen[key]}')
        seen[key] = n["name"]
    names = [n["name"] for n in workflow["nodes"]]
    assert len(names) == len(set(names)), "duplicate node names"


check_overlap(combined)
out = HERE / "youtube-automation-VISUAL.json"
out.write_text(json.dumps(combined, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{out.name}: {len(all_nodes)} real nodes, {len(all_stickies)} panels")
