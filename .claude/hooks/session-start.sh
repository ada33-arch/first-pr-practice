#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# Every web session starts from a fresh container, so two things have to be in
# place before the first turn:
#
#   1. This repo's npm dependencies. `npm run typecheck` is the repo's
#      verification step and needs node_modules present.
#   2. The opencode CLI. The upstream installer
#      (curl -fsSL https://opencode.ai/install | bash) does not work here:
#      opencode.ai is not on the remote environment's egress allowlist, so the
#      download gets a 403 from the proxy. The npm registry is reachable and
#      opencode publishes the same release there, so we install it from npm.
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

# The same caching means this check short-circuits on later sessions.
if command -v opencode >/dev/null 2>&1; then
  echo "opencode $(opencode --version) already installed"
  exit 0
fi

npm install -g --no-audit --no-fund opencode-ai
echo "installed opencode $(opencode --version)"
