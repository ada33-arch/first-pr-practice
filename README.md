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

## Pinterest

`scripts/pinterest.ts` wraps the Pinterest API v5. Create an app at
<https://developers.pinterest.com/apps/>, register a redirect URI, and fill in
the `PINTEREST_*` values in `.env`. Then:

```bash
npm run pinterest -- auth-url          # open it, approve, copy ?code= from the redirect
npm run pinterest -- token <code>      # put access_token / refresh_token in .env
npm run pinterest -- boards            # find a board ID
npm run pinterest -- pin <board_id> <image_url> "Title" [link] [description]
```

Apps on trial access can only create pins in the sandbox; set
`PINTEREST_API_BASE=https://api-sandbox.pinterest.com/v5` until standard access
is approved.

### Rentstore pins

`scripts/rentstore-pins.ts` turns the rentstore catalogue into pins. The
products have no photos yet, so each pin is drawn from the product's own
colours in `content/data.js`: the store's bottle at poster size (1000×1500),
Arabic name first, English under it, notes, the real price, and the
`rentstore.ae/@handle` it came from.

```bash
npm run pins -- render                   # out/pins/*.png + out/pins/index.html contact sheet
npm run pins -- post <board_id> --dry-run
npm run pins -- post <board_id>          # posts the next product not yet on that board
npm run pins -- post <board_id> --all    # posts all remaining
```

`post` does one pin per run by default, so it is meant to be run on a
daily schedule, not all at once. Each pin links back to
`product.html?id=<id>` under `RENTSTORE_URL`, tagged with `utm_content=<id>`
so analytics show which scent brought the visit. Posted pins go in
`.pinterest-posted.json` (gitignored, per API host and board), so re-runs never
double-post. Rendering needs a Chromium: `CHROME_PATH`, a
`npx playwright install chromium` browser, or an installed Google Chrome.

## OmniRoute

[OmniRoute](https://omniroute.online) is pinned as a devDependency, so a plain
`npm install` sets it up alongside everything else — no global install needed.

```bash
npm run omniroute        # or: npx omniroute
```
