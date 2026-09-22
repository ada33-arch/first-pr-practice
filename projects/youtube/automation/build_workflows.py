# -*- coding: utf-8 -*-
"""Generates the four real n8n workflows that implement the growth plan:
intake/log new footage, request Telegram approval, handle the approval
reply, and publish approved items to YouTube on schedule. All four share
one Google Sheet ("Content Calendar") as their common state.

The auto-edit / enhance / soundtrack step (Step 2 of the plan) is
deliberately NOT an n8n workflow. It uses vidIQ's generation tools
(vidiq_generate_music, vidiq_compose, vidiq_generate_thumbnail/titles),
which only exist through Claude's own MCP connection in chat, and it's
processed on request rather than on a schedule — so it's Claude doing that
step directly (via a Google Drive + Sheets connector), not a fifth file
here. See SHEET_NOTE below for exactly how the hand-off works.

    python3 build_workflows.py
"""
import json, pathlib

HERE = pathlib.Path(__file__).resolve().parent

SHEET_NOTE = (
    "### 📋 Shared state: the \"Content Calendar\" Google Sheet\n\n"
    "Every workflow below reads/writes ONE sheet. Create it first with these "
    "column headers, in this order:\n\n"
    "`date_added` `pillar` `format` `raw_file_link` `edited_file_link` `title` "
    "`description` `tags` `thumbnail_link` `scheduled_datetime` `status` "
    "`telegram_message_id` `youtube_url`\n\n"
    "**status** moves through: `Needs edit` → **[you ping Claude — not an n8n "
    "workflow — to generate a soundtrack and assemble the cut with vidIQ]** → "
    "`Ready to schedule` → (you fill in title, description, tags, "
    "thumbnail_link, scheduled_datetime, set status to `Scheduled`) → "
    "`Awaiting Approval` → `Approved` or `Rejected` → `Published`.\n\n"
    "The auto-edit step isn't here because it needs vidIQ's generation tools, "
    "which only exist through Claude's chat connection — no n8n node calls them."
)

CREDS_NOTE = (
    "### 🔑 Credentials this workflow needs\n\n"
    "Set these up once in n8n → Credentials, then select them in the nodes below."
)

TRIGGER_POS = (-280, 260)


def sticky(content, x, y, w, h, color=7):
    return {
        "parameters": {"content": content, "width": w, "height": h, "color": color},
        "id": f"note-{x}-{y}",
        "name": f"Note {x}-{y}",
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": [x, y],
    }


def node(id_, name, ntype, params, pos, notes="", typeVersion=1, disabled=False):
    n = {
        "parameters": params,
        "id": id_,
        "name": name,
        "type": ntype,
        "typeVersion": typeVersion,
        "position": list(pos),
    }
    if notes:
        n["notes"] = notes
        n["notesInFlow"] = True
    if disabled:
        n["disabled"] = True
    return n


def chain(*names):
    conns = {}
    for a, b in zip(names, names[1:]):
        conns.setdefault(a, {"main": [[]]})["main"][0].append({"node": b, "type": "main", "index": 0})
    return conns


def wf(name, nodes, stickies, connections, tag="youtube-automation"):
    return {
        "name": name,
        "nodes": stickies + nodes,
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1"},
        "pinData": {},
        "tags": [{"name": tag}],
    }


# ============================================================ Workflow 1 ==
# Watch a local "Raw Uploads" Google Drive folder, log every new file into
# the calendar with status "Needs edit". This is Step 2 of the plan made real.

n1 = [
    node("g1trig", "New file in Raw Uploads", "n8n-nodes-base.googleDriveTrigger",
         {"pollTimes": {"item": [{"mode": "everyMinute"}]}, "triggerOn": "specificFolder",
          "folderToWatch": {"mode": "list", "value": "REPLACE_WITH_RAW_UPLOADS_FOLDER_ID"},
          "event": "fileCreated"},
         TRIGGER_POS,
         "Fires when a new video or photo lands in the 'Raw Uploads' Drive folder. "
         "Replace the folder ID with your own once the folder exists."),
    node("set1", "Guess pillar & format from filename", "n8n-nodes-base.set",
         {"assignments": {"assignments": [
             {"name": "pillar", "type": "string",
              "value": "={{ $json.name.split('_')[0] }}"},
             {"name": "format", "type": "string",
              "value": "={{ $json.mimeType.includes('video') ? ($json.name.toLowerCase().includes('short') ? 'short' : 'long') : 'photo' }}"},
             {"name": "raw_file_link", "type": "string", "value": "={{ $json.webViewLink }}"},
         ]}},
         (0, 260),
         "Cheap first guess only — assumes files are named like 'pillarname_2026-09-08_topic.mp4'. "
         "Rename the row's pillar/format by hand in the Sheet if the guess is wrong."),
    node("append1", "Log into Content Calendar", "n8n-nodes-base.googleSheets",
         {"operation": "append", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "columns": {"mappingMode": "defineBelow", "value": {
              "date_added": "={{ $now.toISODate() }}",
              "pillar": "={{ $json.pillar }}",
              "format": "={{ $json.format }}",
              "raw_file_link": "={{ $json.raw_file_link }}",
              "status": "Needs edit",
          }}},
         (280, 260),
         "One new row per raw file, status 'Needs edit'. From here it's picked up by Claude "
         "(you ping to trigger it — see the sheet note) rather than by another n8n workflow."),
]
s1 = [
    sticky(CREDS_NOTE + "\n\n**Google Drive** — OAuth2, read access to the Raw Uploads folder.\n\n"
           "**Google Sheets** — OAuth2, edit access to the Content Calendar sheet.",
           -280, -260, 380, 260, color=7),
    sticky(SHEET_NOTE, 140, -260, 460, 320, color=7),
    sticky("## Workflow 1 · Intake & log\n\nStep 2 of the plan: turn a dropped-in file into a "
           "tracked row, automatically.", -280, 60, 920, 160, color=4),
]
wf1 = wf("YouTube Plan · 1 - Intake and log", n1, s1, chain(
    "New file in Raw Uploads", "Guess pillar & format from filename", "Log into Content Calendar"))


# ============================================================ Workflow 2 ==
# Daily: find rows that are "Scheduled" and due soon, send a Telegram
# approval request with Approve/Reject buttons. Step 4 of the plan, the ask.

n2req = [
    node("cron2", "Every day 9am", "n8n-nodes-base.scheduleTrigger",
         {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}},
         TRIGGER_POS, "Runs once a day. Change the cron expression for a different review time."),
    node("read2", "Find items due for review", "n8n-nodes-base.googleSheets",
         {"operation": "readRows", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "filtersUI": {"values": [{"lookupColumn": "status", "lookupValue": "Scheduled"}]}},
         (0, 260),
         "Rows you moved to 'Scheduled' in the Sheet — Claude-edited, then titled and dated by you, "
         "just not yet approved."),
    node("tg2", "Send approval request", "n8n-nodes-base.telegram",
         {"chatId": "REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID",
          "text": "=🎬 *{{ $json.title }}*\\nPillar: {{ $json.pillar }} · Format: {{ $json.format }}\\n"
                  "Scheduled: {{ $json.scheduled_datetime }}\\n\\n{{ $json.edited_file_link }}",
          "additionalFields": {"parse_mode": "Markdown"},
          "replyMarkup": "inlineKeyboard",
          "inlineKeyboard": {"rows": [{"row": {"buttons": [
              {"text": "✅ Approve", "additionalFields": {"callback_data": "=approve|{{ $json.row_number }}"}},
              {"text": "❌ Reject", "additionalFields": {"callback_data": "=reject|{{ $json.row_number }}"}},
          ]}}]}},
         (280, 260),
         "The confirm-before-publish gate from Step 4. Exact field names for the inline keyboard can "
         "shift between n8n versions — check the Telegram node's own UI if this doesn't match."),
    node("update2", "Mark Awaiting Approval", "n8n-nodes-base.googleSheets",
         {"operation": "update", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "columns": {"mappingMode": "defineBelow", "matchingColumns": ["row_number"], "value": {
              "row_number": "={{ $('Find items due for review').item.json.row_number }}",
              "status": "Awaiting Approval",
              "telegram_message_id": "={{ $json.message_id }}",
          }}},
         (560, 260),
         "So this row is not asked about twice tomorrow, and workflow 3 can find it again by message id."),
]
s2req = [
    sticky(CREDS_NOTE + "\n\n**Google Sheets** — same credential as workflow 1.\n\n"
           "**Telegram** — a bot token from @BotFather, plus your own chat id (message @userinfobot to get it).",
           -280, -260, 380, 260, color=7),
    sticky("## Workflow 2 · Request approval\n\nStep 4, the ask: once a day, ping you on Telegram for every "
           "item that's Claude-edited, titled and dated but not yet confirmed.", -280, 60, 940, 160, color=4),
]
wf2req = wf("YouTube Plan · 2 - Request approval", n2req, s2req, chain(
    "Every day 9am", "Find items due for review", "Send approval request", "Mark Awaiting Approval"))


# ============================================================ Workflow 3 ==
# Telegram button tap comes back here. Approve -> status Approved.
# Reject -> status back to Needs edit, so Claude re-does the edit.

n3rep = [
    node("tgtrig3", "Approval button tapped", "n8n-nodes-base.telegramTrigger",
         {"updates": ["callback_query"]}, TRIGGER_POS,
         "Fires the instant you tap Approve or Reject on the Telegram message from workflow 2."),
    node("set3", "Read the tap", "n8n-nodes-base.set",
         {"assignments": {"assignments": [
             {"name": "decision", "type": "string",
              "value": "={{ $json.callback_query.data.split('|')[0] }}"},
             {"name": "row_number", "type": "number",
              "value": "={{ Number($json.callback_query.data.split('|')[1]) }}"},
         ]}},
         (0, 260), "Splits the callback_data 'approve|7' or 'reject|7' back into a decision and a row."),
    node("if3rep", "Approved?", "n8n-nodes-base.if",
         {"conditions": {"options": {"caseSensitive": True}, "conditions": [
             {"leftValue": "={{ $json.decision }}", "rightValue": "approve", "operator": {"type": "string", "operation": "equals"}}]}},
         (280, 260), "", typeVersion=2),
    node("upd3a", "Mark Approved", "n8n-nodes-base.googleSheets",
         {"operation": "update", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "columns": {"mappingMode": "defineBelow", "matchingColumns": ["row_number"], "value": {
              "row_number": "={{ $json.row_number }}", "status": "Approved"}}},
         (560, 160), "Workflow 4 picks this up at the row's scheduled_datetime and publishes it."),
    node("upd3b", "Send back for editing", "n8n-nodes-base.googleSheets",
         {"operation": "update", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "columns": {"mappingMode": "defineBelow", "matchingColumns": ["row_number"], "value": {
              "row_number": "={{ $json.row_number }}", "status": "Needs edit"}}},
         (560, 380),
         "Rejected items go back to 'Needs edit' — the next time you ping Claude to process pending "
         "rows, this one gets another auto-edit pass."),
    node("ack3", "Acknowledge the tap", "n8n-nodes-base.telegram",
         {"resource": "callback", "operation": "answerQuery",
          "queryId": "={{ $('Approval button tapped').item.json.callback_query.id }}",
          "text": "Got it."},
         (840, 260), "Stops Telegram showing a spinner on the button forever."),
]
s3rep = [
    sticky(CREDS_NOTE + "\n\n**Telegram** — same bot as workflow 2. This workflow needs a public webhook URL "
           "(n8n cloud has one; self-hosted needs a reachable HTTPS endpoint or n8n's tunnel for testing).",
           -280, -260, 400, 280, color=7),
    sticky("## Workflow 3 · Handle the reply\n\nThe other half of Step 4's gate: what happens the instant "
           "you tap the button.", -280, 60, 1180, 160, color=4),
]
wf3rep = wf("YouTube Plan · 3 - Handle approval reply", n3rep, s3rep, {
    **chain("Approval button tapped", "Read the tap", "Approved?"),
    "Approved?": {"main": [
        [{"node": "Mark Approved", "type": "main", "index": 0}],
        [{"node": "Send back for editing", "type": "main", "index": 0}],
    ]},
    "Mark Approved": {"main": [[{"node": "Acknowledge the tap", "type": "main", "index": 0}]]},
    "Send back for editing": {"main": [[{"node": "Acknowledge the tap", "type": "main", "index": 0}]]},
})


# ============================================================ Workflow 4 ==
# Every 15 minutes, publish anything Approved whose scheduled_datetime has
# arrived. This is Step 5 of the plan, the actual auto-publish.

n4pub = [
    node("cron4", "Every 15 minutes", "n8n-nodes-base.scheduleTrigger",
         {"rule": {"interval": [{"field": "minutes", "minutesInterval": 15}]}},
         TRIGGER_POS, "How close to the scheduled minute a video actually goes live depends on this interval."),
    node("read4", "Find items due now", "n8n-nodes-base.googleSheets",
         {"operation": "readRows", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "filtersUI": {"values": [{"lookupColumn": "status", "lookupValue": "Approved"}]}},
         (0, 260), "Approved rows only. A second check below drops anything not due yet."),
    node("if4", "Scheduled time reached?", "n8n-nodes-base.if",
         {"conditions": {"options": {"caseSensitive": True}, "conditions": [
             {"leftValue": "={{ new Date($json.scheduled_datetime) <= new Date() }}", "rightValue": "true",
              "operator": {"type": "boolean", "operation": "true"}}]}},
         (280, 260), "", typeVersion=2),
    node("dl4", "Download edited file", "n8n-nodes-base.googleDrive",
         {"operation": "download", "fileId": {"mode": "id", "value": "={{ $json.edited_file_link }}"}},
         (560, 160), "Pulls the finished, Claude-enhanced cut from Drive, ready to hand to YouTube."),
    node("yt4", "Upload to YouTube", "n8n-nodes-base.youTube",
         {"resource": "video", "operation": "upload", "title": "={{ $json.title }}",
          "regionCode": "US",
          "categoryId": "22",
          "options": {"description": "={{ $json.description }}", "tags": "={{ $json.tags }}",
                      "privacyStatus": "public"}},
         (840, 160),
         "Needs a Google Cloud project with the YouTube Data API v3 enabled and OAuth2 credentials "
         "in n8n — see the setup note. Not set up yet, so this node will fail until it is."),
    node("upd4", "Mark Published", "n8n-nodes-base.googleSheets",
         {"operation": "update", "documentId": {"mode": "list", "value": "REPLACE_WITH_SHEET_ID"},
          "sheetName": {"mode": "list", "value": "Content Calendar"},
          "columns": {"mappingMode": "defineBelow", "matchingColumns": ["row_number"], "value": {
              "row_number": "={{ $('Find items due now').item.json.row_number }}",
              "status": "Published", "youtube_url": "=https://youtu.be/{{ $json.id }}"}}},
         (1120, 160), "Closes the loop — this row is done, and watching the numbers starts here."),
    node("tg4", "Notify it went live", "n8n-nodes-base.telegram",
         {"chatId": "REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID",
          "text": "=✅ Published: {{ $json.title }}\\nhttps://youtu.be/{{ $json.id }}"},
         (1400, 160), ""),
]
s4pub = [
    sticky(CREDS_NOTE +
           "\n\n**YouTube Data API v3** — Google Cloud Console → new project → enable 'YouTube Data API v3' → "
           "OAuth consent screen → OAuth2 credentials → add to n8n as a YouTube credential, authorize with "
           "the channel's own Google account.\n\n"
           "**Google Drive / Sheets / Telegram** — same credentials as workflows 1-3.",
           -280, -300, 420, 320, color=7),
    sticky("## Workflow 4 · Auto-publish\n\nStep 5 of the plan: nothing here needs a person once an item is "
           "Approved — it goes live on its own at the scheduled time.", -280, 60, 1900, 160, color=4),
]
wf4pub = wf("YouTube Plan · 4 - Scheduled publish", n4pub, s4pub, {
    **chain("Every 15 minutes", "Find items due now", "Scheduled time reached?"),
    "Scheduled time reached?": {"main": [
        [{"node": "Download edited file", "type": "main", "index": 0}], []]},
    **chain("Download edited file", "Upload to YouTube", "Mark Published", "Notify it went live"),
})


def check_overlap(workflow):
    seen = {}
    for n in workflow["nodes"]:
        if n["type"] == "n8n-nodes-base.stickyNote":
            continue
        key = tuple(p // 60 for p in n["position"])
        if key in seen:
            raise SystemExit(f'{workflow["name"]}: {n["name"]} overlaps {seen[key]}')
        seen[key] = n["name"]


for filename, workflow in [
    ("workflow-01-intake.json", wf1),
    ("workflow-02-request-approval.json", wf2req),
    ("workflow-03-handle-approval.json", wf3rep),
    ("workflow-04-scheduled-publish.json", wf4pub),
]:
    check_overlap(workflow)
    p = HERE / filename
    p.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{filename}: {len(workflow['nodes'])} nodes")
