# First PR Practice

This is a small practice repo for shipping my first pull request.

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

## OmniRoute

[OmniRoute](https://omniroute.online) is pinned as a devDependency, so a plain
`npm install` sets it up alongside everything else — no global install needed.

```bash
npm run omniroute        # or: npx omniroute
```
