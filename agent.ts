import { query, type McpServerConfig, type Options } from "@anthropic-ai/claude-agent-sdk";

const MODEL = process.env.AGENT_MODEL ?? "claude-opus-5";

// The Composio tool router exposes its tools over a single streamable-HTTP MCP
// endpoint. Generate the URL from the Composio dashboard and put it in .env as
// COMPOSIO_MCP_URL; the agent falls back to its built-in tools when it is unset.
function composioServer(): Record<string, McpServerConfig> {
  const url = process.env.COMPOSIO_MCP_URL;
  if (!url) return {};
  return {
    composio: {
      type: "http",
      url,
      // Composio embeds auth in the generated URL. Set COMPOSIO_API_KEY only if
      // your endpoint is configured to expect a bearer token instead.
      ...(process.env.COMPOSIO_API_KEY
        ? { headers: { Authorization: `Bearer ${process.env.COMPOSIO_API_KEY}` } }
        : {}),
    },
  };
}

async function main(): Promise<void> {
  const prompt = process.argv.slice(2).join(" ").trim() || "List the files here and summarize what this repo is for.";

  const mcpServers = composioServer();
  if (Object.keys(mcpServers).length === 0) {
    console.error("[setup] COMPOSIO_MCP_URL not set — running with built-in tools only.\n");
  }

  const options: Options = {
    model: MODEL,
    systemPrompt: { type: "preset", preset: "claude_code" },
    allowedTools: ["Read", "Glob", "Grep"],
    permissionMode: "default",
    maxTurns: 10,
    mcpServers,
  };

  for await (const message of query({ prompt, options })) {
    switch (message.type) {
      case "assistant":
        for (const block of message.message.content) {
          if (block.type === "text") process.stdout.write(block.text);
          else if (block.type === "tool_use") console.error(`\n[tool] ${block.name}`);
        }
        break;
      case "result":
        if (message.subtype === "success") {
          console.log(`\n\n[done] ${message.num_turns} turns, $${message.total_cost_usd.toFixed(4)}`);
        } else {
          console.error(`\n\n[failed] ${message.subtype}`);
          process.exitCode = 1;
        }
        break;
      default:
        break;
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
