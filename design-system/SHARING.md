# Sharing this system

Three ways someone other than you can use it. They differ in what the other
person has to install — which is the only thing that matters when you're trying
to get a designer or a client to actually use something.

| Route | They need | Best for |
|---|---|---|
| **1. A link** | A browser | Clients, one-off collaborators, anyone you don't want to onboard |
| **2. A file** | A browser | Sending in an email; working offline; no internet at all |
| **3. The repo** | git | Designers and developers building with the system repeatedly |

---

## 1. A link — the website

`design-system/` is a complete static site. `index.html` routes three audiences
(commissioning / designing / using AI) to the right starting point.

### Publish it with GitHub Pages

`.github/workflows/pages.yml` deploys it on every push to `main`. **One switch is
needed first**, and only you can flip it:

> Repo **Settings → Pages → Source → "GitHub Actions"**

After that the site is live at:

```
https://<owner>.github.io/<repo>/
```

The workflow also gates the build: it fails if any HTML picks up an external
`src`/`href`, because the whole point is that this works offline and behind a
strict CSP.

### Or host it anywhere

It's static files with no build step. Drag `design-system/` onto Netlify, Vercel,
Cloudflare Pages, S3, or any web server. Nothing to configure.

---

## 2. A file — the standalone intake

`examples/intake-standalone.html` is the entire intake in **one file**, every
stylesheet inlined, no network requests. Email it, put it on a shared drive, open
it from a USB stick. It works.

Regenerate it after changing any CSS:

```bash
node tools/build-standalone.js
```

### And what they get out of it

The intake's **"Download starter file"** button is the piece that makes this
useful to someone without the repo. Instead of a scope that says *"import
`tokens/tokens.css`"* — which they don't have — it hands them a single
self-contained HTML file with:

- every stylesheet inlined
- their chosen accent baked in as a `:root` override
- a scaffold of the sections their answers selected
- a comment header recording the spec that produced it

They open it in a browser and start editing. No clone, no build, no npm.

> The button needs the stylesheets readable, so it works on the **hosted site**
> and in the **standalone file**. Opening `examples/picker.html` directly from
> disk (`file://`) blocks `fetch`, and the button will say so rather than fail
> silently.

---

## 3. The repo — for people building with it

Designers and developers who'll use the system repeatedly should clone it and
read [`DESIGN-BRIEF.md`](DESIGN-BRIEF.md).

Their working loop:

1. Run the intake, save the output as `projects/NNN-name/SPEC.md`
2. Write `index.html` against the scope in that file — **and nothing beyond it**
3. Never edit `css/` or `tokens/` for one project

That third rule is what keeps the system a system. A project that genuinely needs
a new component is a change to the system, made deliberately and separately — not
a side effect of one page.

---

## What to send whom

**A client, or someone commissioning work**
Send the link to `index.html`, or the standalone intake file. They answer six
questions and send you back a spec. That's the whole ask.

**A designer or agency**
Send `DESIGN-BRIEF.md` plus the filled-in spec. Add `powerpoint/SPEC.md` if the
deliverable is a deck template. §9 of the brief is your acceptance checklist.

**An AI tool**
Paste the scope block the intake produces. It names the exact files, the exact
classes, and instructs the tool not to regenerate the system — which keeps output
consistent and stops it burning context re-deriving what already exists.

---

## Licensing, if you share it publicly

The system itself is your work. Two things to keep straight if it goes public:

- **Fonts.** Poppins and Inter are both SIL Open Font License — free to bundle
  and serve. The stacks fall back to system fonts, so nothing breaks if you
  don't ship them.
- **Photography.** No images are bundled. Anything a user adds is theirs, under
  the rules in [`PHOTOS.md`](PHOTOS.md).
