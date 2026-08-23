#!/bin/bash
# SessionStart hook: make the `opencode` CLI available in Claude Code on the web.
#
# The upstream installer (curl -fsSL https://opencode.ai/install | bash) cannot be
# used here: opencode.ai is not on the remote environment's egress allowlist, so the
# download gets a 403 from the proxy. The npm registry is reachable, and opencode
# publishes the same release there, so we install from npm instead.
set -euo pipefail

# Local checkouts already have whatever the developer chose to install.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# The container image is cached once the hook completes, so on later sessions this
# check short-circuits and the hook costs nothing.
if command -v opencode >/dev/null 2>&1; then
  echo "opencode $(opencode --version) already installed"
  exit 0
fi

npm install -g opencode-ai
echo "installed opencode $(opencode --version)"
