# Workspace

## Projects

| Project | What it is |
| --- | --- |
| [`projects/rentstore`](projects/rentstore) | **رنت ستور** — an Arabic-first UAE marketplace: many merchants' stores on one website, free personal pages, paid stores, and a setup-and-licence service. Site, automations, and the written idea all live in that folder. |

Each project keeps everything it owns in its own folder, split the same way:
`content/` (the words and numbers), `design/` (the look), `pages/` (the screens),
`code/` (the logic), `automation/` (the workflows), `docs/` (the thinking).

---

# First PR Practice

The rest of this repo is the original practice ground for the GitHub workflow.

## About

This repo exists to try out the full GitHub workflow: cloning, branching,
committing, and opening a pull request.

## Remote control

    This change was made from a remote Claude Code session to confirm that
kicking off work from outside the terminal (web/mobile) works end to end.

## Agent

A minimal Claude Agent SDK (TypeScript) starter lives in `agent.ts`.

```bash
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
npm run agent          # or: npm run agent "your prompt here"
npm run typecheck
```

`agent.ts` calls `query()` from `@anthropic-ai/claude-agent-sdk` and streams the
response, printing assistant text and logging tool calls to stderr. Set
`COMPOSIO_MCP_URL` to attach the Composio tool router as an HTTP MCP server;
leave it unset to run with the built-in tools only.
