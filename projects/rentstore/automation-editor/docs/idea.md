# The idea

Same spirit as `projects/workflowbuilder/`: install a real third-party SDK
and prove it runs — but this time pointed at one of this repo's own
automations instead of a blank canvas, to see whether the SDK is actually
useful for something rentstore has, not just a hello-world.

## Why one automation, hand-mapped

`../automation/` has five n8n JSON exports. Writing a generic n8n → workflowbuilder
converter would mean handling n8n's open-ended node-type/parameter space
generically — a much bigger, riskier undertaking than this repo's "worked
example" pattern calls for. Hand-mapping `01-signup-free.json` (the simplest
of the five) onto seven purpose-built node types in `src/nodeTypes.ts` is
smaller, fully verifiable, and still demonstrates the real thing: a
faithful, editable, branch-aware visual graph, not just an empty editor.

`src/graph.ts` reuses that JSON file's own node ids, so the two are easy to
cross-reference by eye. Extending this to `02`–`05` would mean adding node
types for what those introduce beyond this one (a manual-trigger, a
cron/schedule trigger, and more googleSheets/httpRequest variants) — no new
mechanism, just more of the same mapping work.

## Two real bugs, found by testing rather than assumed away

Reading the SDK's own `dist/index.d.ts` (the docs site was blocked by this
environment's egress proxy) got the graph structure and types right on the
first build. But typechecking is not the same as running, and a
headless-Chromium render caught two things types couldn't:

1. **The default node template renders nothing.** A plain node (no
   `nodeTemplates` override) showed only its two bare connection handles —
   no icon, label, or description — confirmed by dumping the rendered
   DOM. Every node type here now has an explicit template
   (`SimpleNodeTemplate.tsx` for six of them, `DecisionNodeTemplate.tsx` for
   the branch points), rather than relying on the SDK's undocumented
   default.
2. **`{ type: 'Control', scope }` isn't a real uischema element.** Without
   an explicit `uischema`, the properties panel rendered four
   "No renderer provided for type: Control" errors — plausible-looking
   JsonForms code that just doesn't match this SDK's own closed union of
   control types (`'Text'`, `'TextArea'`, `'Switch'`, `'Select'`,
   `'DatePicker'`, …; there is no generic `'Control'`). Switching to
   `{ type: 'Text', scope }` fixed it, verified by re-opening the panel and
   confirming the "No renderer" text was gone and the fields were editable.

Both were caught by looking at the actual rendered page and DOM in headless
Chromium, not by trusting the build succeeding.

## What it deliberately skips

- **`02`–`05`** — see above.
- **No live n8n connection.** This is a read/edit surface for the *shape*
  of the automation, not a runtime — no webhook actually fires, no Sheet
  actually gets written. `../automation/01-signup-free.json` stays what you'd
  import into n8n to run it for real.
- **No round-trip export back to n8n JSON.** Editing a node here changes
  this editor's own in-browser state (persisted to `localStorage`, same as
  `projects/workflowbuilder/`); it doesn't write back to the `.json` file.
