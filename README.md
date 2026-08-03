# First PR Practice

This is a small practice repo for shipping my first pull request.

## About

This repo exists to try out the full GitHub workflow: cloning, branching,
committing, and opening a pull request.

## Remote control

    This change was made from a remote Claude Code session to confirm that
kicking off work from outside the terminal (web/mobile) works end to end.

## Design system

`design-system/` holds my house style, codified so a website, a PowerPoint
template, or anything I commission comes back in the same format.

- [`design-system/DESIGN-BRIEF.md`](design-system/DESIGN-BRIEF.md) — the spec to
  hand a designer or an AI tool
- [`design-system/tokens/`](design-system/tokens) — colour, type, space and
  radius tokens as JSON and CSS custom properties
- [`design-system/css/`](design-system/css) — the component and slide layer
- [`design-system/powerpoint/SPEC.md`](design-system/powerpoint/SPEC.md) — point
  sizes and inch positions for building a `.potx`
- [`design-system/examples/`](design-system/examples) — a web landing page and a
  14-slide deck, both built from the system; open either in a browser

Six accent themes ship with it (amber, electric, navy, teal, green, coral) and
swap with a single class on `<html>`.

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
