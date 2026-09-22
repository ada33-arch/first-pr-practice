# -*- coding: utf-8 -*-
"""Merges the four real n8n workflow files into ONE importable workflow,
stacked as four independent lanes on a single canvas, plus a note marking
where the (non-n8n) Claude-mediated auto-edit step sits in the pipeline.

They stay four *independent* trigger chains inside that one file — n8n runs
each trigger on its own schedule/webhook. They hand off to each other only
through the status column in the shared Google Sheet, never through a wire
on the canvas, so no fake connections are drawn between lanes — and the
auto-edit step doesn't appear as nodes at all, since it isn't n8n; it's
Claude, processing on request.

    python3 build_combined.py
"""
import json, pathlib

HERE = pathlib.Path(__file__).resolve().parent

FILES = [
    "workflow-01-intake.json",
    "workflow-02-request-approval.json",
    "workflow-03-handle-approval.json",
    "workflow-04-scheduled-publish.json",
]

# Vertical offset applied to every node in each file, computed from each
# file's own bounding box, plus a 400px shift so the overview stickies fit
# above lane 1.
OFFSETS = [400, 1190, 1980, 2930]

OVERVIEW = (
    "## 🗺️ How the four lanes fit together\n\n"
    "This is **one file, four independent triggers** — not one long chain. Each lane starts on "
    "its own (a schedule, a Drive event, a Telegram tap) and they only ever talk to each other "
    "through the **status** column of the shared \"Content Calendar\" Google Sheet:\n\n"
    "**Lane 1** logs a new file as `Needs edit` → **[you ping Claude to auto-edit it — see the "
    "note below, this step is not in this file]** → `Ready to schedule` → you fill in the title/date "
    "and set it to `Scheduled` → **Lane 2** asks for approval, marking it `Awaiting Approval` → "
    "**Lane 3** reacts to your tap: `Approved` or back to `Needs edit` → **Lane 4** publishes "
    "anything `Approved` once its scheduled time arrives, marking it `Published`.\n\n"
    "Import this whole file once. All four triggers activate together when you turn the workflow Active."
)

SETUP_CHECKLIST = (
    "## 🚦 Do this first — nothing runs without these\n\n"
    "**1. Google Drive** — create two folders: `Raw Uploads` (drop new footage here) and `Edited` "
    "(Claude writes finished cuts here). Copy each folder's ID from its URL "
    "(`drive.google.com/drive/folders/<ID>`) into the `REPLACE_WITH_RAW_UPLOADS_FOLDER_ID` / "
    "`REPLACE_WITH_EDITED_FOLDER_ID` fields below.\n\n"
    "**2. Google Sheet** — create one sheet named `Content Calendar` with these exact column "
    "headers, in this order: `date_added` `pillar` `format` `raw_file_link` `edited_file_link` "
    "`title` `description` `tags` `thumbnail_link` `scheduled_datetime` `status` "
    "`telegram_message_id` `youtube_url`. Copy the Sheet's ID from its URL into every "
    "`REPLACE_WITH_SHEET_ID` below.\n\n"
    "**3. n8n credentials** — add one Google OAuth2 credential covering Drive + Sheets scopes, "
    "and select it in every Drive/Sheets node.\n\n"
    "**4. Telegram** — message @BotFather to create a bot and get its token; message @userinfobot "
    "to get your own numeric chat id. Add both to the Telegram credential and to the "
    "`REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID` fields.\n\n"
    "**5. YouTube Data API v3** — see the dedicated note in lane 4.\n\n"
    "**6. Claude's Google connector + Creatomate** — see the standalone note between lanes 1 and 2."
)

CLAUDE_STEP_NOTE = (
    "## 🤖 Claude does this step — it is NOT in this file\n\n"
    "Between `Needs edit` and `Ready to schedule`, nothing here runs automatically. **You ping "
    "Claude** (in chat) to process pending rows: it generates a soundtrack and upscales via "
    "Higgsfield, assembles the cut via a Creatomate template, then reads/writes the row directly "
    "through a Google Drive + Sheets connector. No n8n workflow calls Higgsfield or Creatomate — "
    "there's no confirmed public endpoint for Higgsfield reachable from n8n, and this step runs "
    "on request rather than on a schedule."
)


def shift(node, dy):
    node = json.loads(json.dumps(node))  # deep copy
    node["position"][1] += dy
    return node


all_nodes = []
for idx, (fname, dy) in enumerate(zip(FILES, OFFSETS), start=1):
    data = json.loads((HERE / fname).read_text(encoding="utf-8"))
    for n in data["nodes"]:
        shifted = shift(n, dy)
        if shifted["type"] == "n8n-nodes-base.stickyNote":
            shifted["id"] = f"L{idx}-{shifted['id']}"
            shifted["name"] = f"L{idx} {shifted['name']}"
            content = shifted["parameters"]["content"]
            shifted["parameters"]["content"] = content.replace("## Workflow", "## LANE")
        all_nodes.append(shifted)

merged_connections = {}
for fname in FILES:
    data = json.loads((HERE / fname).read_text(encoding="utf-8"))
    merged_connections.update(data["connections"])

overview_sticky = {
    "parameters": {"content": OVERVIEW, "width": 620, "height": 380, "color": 7},
    "id": "overview", "name": "Overview", "type": "n8n-nodes-base.stickyNote",
    "typeVersion": 1, "position": [-280, -400],
}
setup_sticky = {
    "parameters": {"content": SETUP_CHECKLIST, "width": 700, "height": 380, "color": 1},
    "id": "setup-checklist", "name": "Setup checklist", "type": "n8n-nodes-base.stickyNote",
    "typeVersion": 1, "position": [380, -400],
}
claude_sticky = {
    "parameters": {"content": CLAUDE_STEP_NOTE, "width": 1600, "height": 130, "color": 5},
    "id": "claude-step", "name": "Claude does this step", "type": "n8n-nodes-base.stickyNote",
    "typeVersion": 1, "position": [-280, 800],
}

combined = {
    "name": "YouTube Plan · 4 n8n workflows combined",
    "nodes": [overview_sticky, setup_sticky, claude_sticky] + all_nodes,
    "connections": merged_connections,
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


check_overlap(combined)
out = HERE / "youtube-automation-ALL-IN-ONE.json"
out.write_text(json.dumps(combined, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{out.name}: {len(combined['nodes'])} nodes total")
