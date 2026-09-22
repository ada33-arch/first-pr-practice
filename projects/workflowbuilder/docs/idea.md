# The idea

This isn't a product idea like `projects/rentstore/` — it's a worked example,
same as `.github/actions/`: install a real third-party SDK and prove it runs,
so the pattern is there to copy.

## What "install" means here

[`synergycodes/workflowbuilder`](https://github.com/synergycodes/workflowbuilder)
is a monorepo. Its README offers three onboarding paths — embed the SDK in your
own app, run their demo, or run their full reference stack (editor + Temporal +
Postgres via Docker). This project takes the first path: add
`@workflowbuilder/sdk` as an npm dependency of a small app of our own, rather
than cloning or vendoring their repo. That's the "install" a consuming project
actually does; the rest of their monorepo (demo app, docs site, reference
backend) is their tooling for developing the SDK itself, not something a
consumer needs.

## What it proves

- `npm install @workflowbuilder/sdk @xyflow/react zustand` resolves and
  installs cleanly against Node 22 / npm 10.
- `<WorkflowBuilder.Root name="..." />` mounts and renders its default layout
  with no further configuration.
- The result typechecks and produces a working Vite production build.

Verified by loading the built preview in headless Chromium: the editor mounts
with its top bar, node palette, canvas, and properties panel, and localStorage
persistence works (a "Saved data has been restored" toast appears on reload).

## What it deliberately skips

- **No custom nodes.** The node palette is empty by design — populating it
  means passing `nodeTypes`, which is a decision about what workflows this app
  would actually run, not part of "does the install work."
- **No backend.** No Hono server, no Temporal worker, no Postgres. The SDK
  persists to `localStorage` on its own; a real execution engine is the
  reference stack's job, not the SDK's.
- **No Docker.** Path C (their full-stack "AI Studio" reference) needs it;
  Path A doesn't.

## If this grows into something real

The upstream repo's own advice applies: their bundled reference backend "has
no authentication, no authorization, no user/tenant isolation, and no CORS
restrictions" — fine for `localhost`, not for anything exposed. A real next
step would be defining actual `nodeTypes` for whatever this app's workflows
are, before touching a backend at all.
