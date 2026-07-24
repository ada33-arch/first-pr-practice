---
description: Walk through connecting apps (MCP servers / connectors) to Claude Code
---

You are running the connect-apps setup wizard. Guide the user through
connecting external apps and services to Claude Code. Follow these steps in
order, and keep each step short and conversational.

## Step 1 — Take stock of what's already connected

Run `claude mcp list` with the Bash tool and summarize the result for the
user in one or two sentences: which MCP servers are already configured, and
whether any are failing to connect. If the command reports none, say so
plainly.

## Step 2 — Ask what they want to connect

Use the AskUserQuestion tool to ask which kinds of apps they want to hook
up. Offer these options (multiSelect enabled):

- **Dev tools** — GitHub, GitLab, Sentry, Linear
- **Data & docs** — Google Drive, Notion, Slack
- **Databases** — Postgres, SQLite, or another database via an MCP server
- **Something else** — let them name any app or service

## Step 3 — Connect each selection

For each app the user picked, do the appropriate thing:

- If a well-known MCP server exists for it, give the exact
  `claude mcp add <name> ...` command, explain the scope choice
  (`--scope user` for all projects vs. project-local), and offer to run it
  for them.
- If it's a claude.ai connector (Google Drive, Slack, and similar OAuth
  connectors), explain that authorization happens in the claude.ai
  connector settings or via `/mcp` in an interactive session — it cannot be
  completed non-interactively — and point them there.
- If you don't recognize the app, search for an MCP server for it before
  concluding one doesn't exist.

Never ask the user to paste API keys, tokens, or OAuth codes into the chat.
If a server needs credentials, have the user put them in the environment or
config file themselves, and tell them exactly which variable or field the
server expects.

## Step 4 — Verify

After adding servers, run `claude mcp list` again and confirm each new
server shows as connected. For anything failing, read the error and help
debug it (missing binary, missing env var, wrong URL) before finishing.

## Step 5 — Wrap up

End with a one-paragraph summary: what got connected, what still needs the
user's action (e.g., OAuth in claude.ai settings), and remind them that
`/mcp` shows live server status any time.
