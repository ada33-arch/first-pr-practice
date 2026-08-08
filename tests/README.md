# Tests

Both suites drive a real browser against a really running server. Every defect
worth having found in this project was found this way rather than by reading
the code — an unreadable colour, a squashed layout, a download that silently
built nothing.

| File | Covers | Needs |
|---|---|---|
| `journey.js` | The offline path: answer, preview, approve, build the zip in the browser | a static server |
| `online.js` | The account path: register, save, download from the API, sign out | the Worker |
| `sandbox.js` | The shared link, in a sandboxed frame with no pop-ups and no clipboard | nothing |

## Running them

```bash
# offline path
cd design-system && python3 -m http.server 8899 &
DS_BASE=http://127.0.0.1:8899/ node tests/journey.js

# account path
cd app && npm run dev &
node tests/online.js
```

`journey.js` also runs against the Worker origin, but the download assertions
will not pass there: served by the Worker, the page requires an account and
fetches its files from the API. That is the point of the split.

`sandbox.js` is the one that matters for anything shared or embedded. It runs
the page inside `sandbox="allow-scripts allow-forms"`, which is why the preview
renders inline instead of opening a tab and why the feedback box puts its text
on screen as well as on the clipboard — a pop-up and the Clipboard API are both
refused there, and a feature that only works outside a frame is not shareable.

All suites need Playwright (`npm i playwright`) and resolve Chromium from
`PLAYWRIGHT_BROWSERS_PATH`.
