# Tests

Both suites drive a real browser against a really running server. Every defect
worth having found in this project was found this way rather than by reading
the code — an unreadable colour, a squashed layout, a download that silently
built nothing.

| File | Covers | Needs |
|---|---|---|
| `journey.js` | The offline path: answer, preview, approve, build the zip in the browser | a static server |
| `online.js` | The account path: register, save, download from the API, sign out | the Worker |

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

Both need Playwright (`npm i playwright`) and resolve Chromium from
`PLAYWRIGHT_BROWSERS_PATH`.
