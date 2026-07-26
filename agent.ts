// agent.ts — Claude Agents SDK + Composio

import { query } from "@anthropic-ai/claude-agent-sdk";
import { Composio } from "@composio/core";

const composio = new Composio();
const userId = "user_54u8o";

// Create a tool router session (mcp: true surfaces session.mcp in the type)
const session = await composio.create(userId, { mcp: true });

// Query Claude with MCP tools
const stream = await query({
  prompt: "Star the composiohq/composio repo on GitHub",
  options: {
    permissionMode: "bypassPermissions",
    mcpServers: {
      composio: session.mcp,
    },
  },
});

for await (const event of stream) {
  if (event.type === "result" && event.subtype === "success") {
    process.stdout.write(event.result);
  }
}
