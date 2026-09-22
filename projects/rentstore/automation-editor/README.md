# RentStore signup automation — visual editor

A [`@workflowbuilder/sdk`](https://github.com/synergycodes/workflowbuilder) editor
for [`../automation/01-signup-free.json`](../automation/01-signup-free.json), the
free-signup n8n automation. It's a companion way to see and edit that flow's
shape without opening n8n — the JSON file stays the source of truth you'd
actually import into n8n; this renders the same eleven steps as an editable
graph, with the branch points (the two `if` nodes) as real two-output decision
nodes rather than a flat list.

Like `projects/workflowbuilder/`, this needs a build step (Vite + TypeScript,
since the SDK ships as JSX) — unlike the rest of `rentstore/`, which has none.

## Run it

```bash
cd projects/rentstore/automation-editor
npm install
npm run dev       # http://localhost:4310
```

## Verify

```bash
npm run build      # tsc --noEmit, then a production build into dist/
npm run preview    # serve that build locally
```

Click any node to open its properties panel on the right — every field
(label, description, plus a type-specific field like "Sheet name" or "HTTP
status") is live-editable, backed by a JSON-schema per node type.

## What's here

```
automation-editor/
├── README.md            ← you are here
├── docs/idea.md           what this proves, what it skips, and the two bugs found and fixed
├── package.json
├── src/
│   ├── nodeTypes.ts        the 7 node schemas + palette (trigger, transform, decision, lookup, sheet-write, message, respond)
│   ├── graph.ts             01-signup-free.json hand-mapped onto those 7 types (11 nodes, 10 edges)
│   ├── DecisionNodeTemplate.tsx   custom node template for the two branch points (true/false handles)
│   ├── SimpleNodeTemplate.tsx     custom node template for the other 6 types
│   ├── nodes.css
│   ├── App.tsx              mounts <WorkflowBuilder.Root> with all of the above
│   └── main.tsx
```

## Scope

Covers `01-signup-free.json` only. The other four automations
(`02`–`05` in `../automation/`) aren't mapped — see
[`docs/idea.md`](docs/idea.md) for why a hand-mapped graph was chosen over a
generic n8n-JSON importer, and what extending this to the rest would need.
