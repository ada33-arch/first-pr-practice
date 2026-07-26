# Getting Started with Claude Agents SDK (TypeScript)

This project pairs the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk) with
[Composio](https://docs.composio.dev)'s tool router so the agent can call MCP tools
(e.g. GitHub actions) from a `query()` call.

## Step 1: Install Dependencies

```bash
npm install @composio/core @anthropic-ai/claude-agent-sdk
```

## Step 2: Set Environment Variables

Copy `.env.example` and fill in your key:

```
COMPOSIO_API_KEY=<your-api-key>
```

## Step 3: Run the Agent

The agent lives in [`agent.ts`](./agent.ts). It creates a Composio tool router
session (with `{ mcp: true }` to surface the session's hosted MCP endpoint),
passes it to the Claude Agent SDK's `query()` as an MCP server, and streams the
result:

```bash
npm run agent
```

To type-check without running:

```bash
npm run typecheck
```

## Documentation

- [Composio Documentation](https://docs.composio.dev)
- [Tool Router Guide](https://docs.composio.dev/tool-router/overview)
- [Managing Multiple Accounts](https://docs.composio.dev/tool-router/managing-multiple-accounts)
