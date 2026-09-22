# Workflow Builder demo

A minimal embed of [`@workflowbuilder/sdk`](https://github.com/synergycodes/workflowbuilder) —
the Apache-2.0 React SDK for visual workflow editors — following the SDK's own
"Path A: embed the SDK" quick start (npm install, no clone, no Docker).

Unlike the other `projects/` folders in this repo, this one needs a build step:
the SDK ships as React/JSX, so it's wired up with Vite + TypeScript rather than
plain HTML/JS.

## Run it

```bash
cd projects/workflowbuilder
npm install
npm run dev       # http://localhost:4300
```

## Verify

```bash
npm run build      # tsc --noEmit, then a production build into dist/
npm run preview    # serve that build locally
```

`npm run build` is the closest thing to a test here — it typechecks and
produces a working bundle. There's no backend: the editor persists to
`localStorage` in the browser, exactly as the upstream quick start describes.

## What's here

```
projects/workflowbuilder/
├── README.md        ← you are here
├── package.json      @workflowbuilder/sdk + its peer deps (react, @xyflow/react, zustand)
├── index.html         Vite entry page
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx        mounts <App />
│   └── App.tsx          renders <WorkflowBuilder.Root />
└── docs/
    └── idea.md         what this demo is for, and what it deliberately skips
```

## Scope

This mounts the SDK's default layout (top bar, node palette, canvas, properties
panel) with no custom node types, so the palette is empty — extending it with
real nodes and a backend is the SDK's "Path C: full stack demo"
(editor + Hono backend + Temporal worker), which this repo doesn't attempt.
See [`docs/idea.md`](docs/idea.md) and the
[upstream quick start](https://www.workflowbuilder.io/docs/get-started/quick-start/wb-as-react-component/)
for that path.
