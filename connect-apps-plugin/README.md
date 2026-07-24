# connect-apps-plugin

A small Claude Code plugin that adds a guided wizard for connecting apps
and services (MCP servers and claude.ai connectors) to Claude Code.

## Usage

From the directory containing this folder, launch Claude Code with the
plugin loaded:

```bash
claude --plugin-dir ./connect-apps-plugin
```

Then, inside the session, run:

```
/connect-apps:setup
```

The wizard will list your currently configured MCP servers, ask which apps
you want to connect, walk you through adding each one, and verify the
connections at the end.

## Structure

```
connect-apps-plugin/
├── .claude-plugin/
│   └── plugin.json      # plugin manifest — the "name" field sets the /connect-apps: command prefix
├── commands/
│   └── setup.md         # the /connect-apps:setup command
└── README.md
```

## Notes

- The slash-command prefix comes from `name` in `plugin.json`, not from the
  folder name. Rename it there if you want a different prefix.
- `--plugin-dir` applies only to the session you launch with it. To make the
  plugin permanent, install it via a plugin marketplace or your `.claude`
  settings.
