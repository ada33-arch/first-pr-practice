#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# Every web session starts from a fresh container, so node_modules is missing on
# arrival and `npm run typecheck` — the repo's verification step per CLAUDE.md —
# fails until someone installs dependencies by hand. Install them up front.
set -euo pipefail

# Local checkouts already have whatever the developer chose to install.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# Not `npm ci`: the container is cached once the hook completes, and npm install
# reuses an existing node_modules rather than deleting and refetching it.
npm install --no-audit --no-fund
echo "project dependencies ready"
