# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A practice repository for the GitHub workflow — cloning, branching, committing, and opening pull requests. Alongside that it has accumulated a Claude Agent SDK starter and a set of small, self-contained demos of GitHub and Claude Code machinery, each meant to be read as a worked example.

## Layout

- `agent.ts` — Claude Agent SDK (TypeScript) starter. Streams a `query()` loop with the `claude_code` system-prompt preset, read-only tools (`Read`/`Glob`/`Grep`), and an optional [Composio](https://composio.dev) tool-router MCP server.
- `.env.example` — copy to `.env` (gitignored) and fill in. `ANTHROPIC_API_KEY` is required; `AGENT_MODEL`, `COMPOSIO_MCP_URL`, and `COMPOSIO_API_KEY` are optional.
- `.github/actions/` — three local actions, one per action type:
  - `lifecycle-demo/` — JS action (`node24`) wiring the `pre`/`main`/`post` lifecycle, no dependencies
  - `greet-and-check/` — composite action that calls `lifecycle-demo` and asserts its output
  - `docker-demo/` — container action (`debian:12-slim`) that echoes `GITHUB_SHA` and its args
- `.github/workflows/ci.yml` — runs the composite and docker actions on push to `main` and on every PR
- `scripts/slack-upload.sh` — uploads a file to Slack via the three-step external-upload flow
- `connect-apps-plugin/` — a Claude Code plugin providing `/connect-apps:setup`
- `.claude/skills/ui-ux-pro-max/` — UI/UX design-guidance skill (definition only; the `search.py` CLI and CSV data it references are not vendored here)
- `.mcp.json` — configures the GitHub MCP server for this repo

## Commands

```bash
npm install          # first run only
npm run typecheck    # tsc --noEmit — the verification step for TypeScript changes
npm run agent        # tsx agent.ts — runs the agent; needs ANTHROPIC_API_KEY
npm run agent "your prompt here"
```

There is no test suite. `npm run typecheck` is the closest thing to one — run it after touching any `.ts` file.

## Verifying Other Changes

- **Docs and content** — verified by reading.
- **Actions and workflow** — CI exercises these on every PR. To check locally first, emulate the runner contract: inputs arrive as `INPUT_<NAME>`, and outputs/state are *appended* to the files named by `$GITHUB_OUTPUT` / `$GITHUB_STATE`.

  ```bash
  export GITHUB_OUTPUT=$(mktemp) GITHUB_STATE=$(mktemp)
  INPUT_WHO=world node .github/actions/lifecycle-demo/index.js
  cat "$GITHUB_OUTPUT"   # greeting=hello, world!
  ```

- **`slack-upload.sh`** — `bash -n` checks syntax; invoking it with no args should print usage and exit 2. A real run needs a `SLACK_TOKEN` with the `files:write` scope and a `C...` channel ID the app has been invited to.

### Gotchas

- `lifecycle-demo`'s `pre` step is skipped for local `uses: ./...` references — the runner resolves pre-steps before checkout. `post` still runs, without the state `pre` would have written; `cleanup.js` handles both paths.
- Building `docker-demo` needs a running Docker daemon. Some sandboxes ship the `docker` CLI without one — the entrypoint is a plain shell script and can be run directly when that happens.
- In `run:` blocks, pass values in through `env:` rather than splicing `${{ }}` into the script text; a fork-controlled expression inside `run:` is code execution. `greet-and-check/action.yml` follows this.

## Conventions

- The default branch is `main`. Following the repo's purpose, make changes on a feature branch and propose them via pull request rather than committing directly to `main`.
