#!/usr/bin/env node
/**
 * Builds the version of the brief that goes out as a shared link.
 *
 * It is the standalone file with two changes, both forced by where it runs:
 * a shared page is embedded, so nothing may depend on a pop-up or on a
 * download the host might block; and the people opening it are testers, so it
 * has to say what it is and give them a way to send an opinion back.
 *
 *   node design-system/tools/build-shareable.js
 *
 * Output is a fragment, not a document — whatever hosts it supplies the
 * <head> and <body>.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SRC = path.join(ROOT, 'brief-standalone.html');
const OUT = path.join(ROOT, 'brief-shareable.html');

const html = fs.readFileSync(SRC, 'utf8');

/* The shared build is opened by testers, not customers, so it gets its own
 * title rather than inheriting "Tell us about your project". */
const title = 'Try it — build your page in four questions';
const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];

const bodyStart = html.indexOf('<body>') + '<body>'.length;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyStart < 6 || bodyEnd < 0) {
  console.error('Could not locate <body> in', SRC);
  process.exit(1);
}
let body = html.slice(bodyStart, bodyEnd);

/* ---- What testers see before they start --------------------------------- */
const banner = `
<div class="trybar">
  <div class="trybar__in">
    <span class="trybar__tag">Try it</span>
    <p>
      Answer four questions and you'll have a real page to look at. Nothing you
      type or upload leaves your computer — there's no account and no server
      behind this.
    </p>
  </div>
</div>
`;

/* ---- How they send an opinion back ---------------------------------------
   No form, because there is nothing to receive it. Instead it assembles what
   they chose plus what they wrote, and puts it on the clipboard for them to
   send back however they already talk to you. ------------------------------ */
const feedback = `
<section class="card qs stack stack-4" id="fbBox">
  <div>
    <div class="qs__head"><span class="qs__n">?</span><h2 class="h3">What did you think?</h2></div>
    <p class="qs__hint">Honest answers are more useful than kind ones. Nothing here is sent anywhere — you'll get a summary to copy and send back.</p>
  </div>

  <div class="fb-grid">
    <div class="field">
      <label for="fbEasy">Was anything confusing or annoying?</label>
      <textarea id="fbEasy" rows="3" placeholder="A question that didn't make sense, a step that felt slow…"></textarea>
    </div>
    <div class="field">
      <label for="fbLook">Did the page look like something you'd use?</label>
      <textarea id="fbLook" rows="3" placeholder="Too plain, too busy, wrong for my line of work…"></textarea>
    </div>
    <div class="field">
      <label for="fbPay">Would you pay for this? What feels fair?</label>
      <textarea id="fbPay" rows="3" placeholder="Be blunt — including &quot;no, because…&quot;"></textarea>
    </div>
    <div class="field">
      <label for="fbMissing">What's missing?</label>
      <textarea id="fbMissing" rows="3" placeholder="The one thing that would make you actually use it"></textarea>
    </div>
  </div>

  <div class="bar">
    <button class="btn btn--primary" type="button" id="fbCopy">Copy my feedback</button>
    <span class="caption" id="fbNote"></span>
  </div>

  <div class="field" id="fbOutWrap" hidden>
    <label for="fbOut">Copy this and send it back</label>
    <textarea id="fbOut" rows="10" readonly></textarea>
  </div>
</section>
`;

/* ---- Handing over the files in a hosted viewer -----------------------------
   A shared page runs in a viewer that grants no download permission, so the
   blob link the offline build uses is silently inert — the button appears to
   work and nothing arrives. The viewer's own save mechanism is the only route,
   and its allowlist has no `.zip` in it, so the package cannot go over as one
   archive. What it can hand over is the two things a person actually wants:
   the finished page, and their words. --------------------------------------- */
const capabilityDownload = `
const packBtn = document.getElementById('pack');
const note = document.getElementById('payNote');

/* null means this view cannot save at all — say so rather than leaving a
   button that quietly does nothing. */
const downloads = await (window.claude?.use?.('downloads') ?? Promise.resolve(null));

function explain(err) {
  switch (err?.code) {
    case 'declined':          return '';                 // their choice; say nothing
    case 'rate_limited':      return 'One at a time — try that again in a moment.';
    case 'too_large':         return 'That file is too big to hand over here.';
    case 'extension_not_enabled':
    case 'rejected_extension':
      return 'This viewer will not accept that file type. Ask for the one-file version and everything works.';
    default:
      return 'That did not work here. Ask for the one-file version and everything works.';
  }
}

async function offer(filename, data) {
  try {
    await downloads.save({ filename, data });
    return true;
  } catch (err) {
    const msg = explain(err);
    if (msg) note.textContent = msg;
    return false;
  }
}

if (packBtn) {
  /* Always take the click, never rely on \`disabled\`: the page's own approval
     logic re-enables this button whenever the checkbox changes, which would
     hand control back to the original blob-download handler — the one that is
     silently inert here. Owning the handler is the only way to be sure the
     button cannot quietly do nothing. */
  packBtn.textContent = downloads ? SAVE_LABEL : SAVE_UNAVAILABLE_LABEL;
  if (!downloads) {
    packBtn.onclick = () => { note.textContent = SAVE_UNAVAILABLE_NOTE; };
  } else {
    packBtn.onclick = async () => {
      const label = packBtn.textContent;
      packBtn.disabled = true;
      packBtn.textContent = SAVE_WORKING;
      note.textContent = '';
      try {
        const page = await buildPage();
        if (!page) { note.textContent = SAVE_NO_PAGE; return; }

        const a = answersOf();
        const base = packageName(a).replace(/-files\.zip$/, '');
        const files = packageFiles(a, page, { contact: SHOP.CONTACT${'{{LANG}}'} });
        const words = files.find(f => f.name === 'copy.md');

        if (await offer(base + '.html', page)) {
          if (words) await offer(base + '-copy.md', words.text);
          note.textContent = SAVE_DONE;
        }
      } finally {
        packBtn.disabled = false;
        packBtn.textContent = label;
      }
    };
  }
}
<\/script>
`;

const SAVE_STRINGS_EN = `
const SAVE_LABEL = 'Save my page';
const SAVE_WORKING = 'Preparing…';
const SAVE_DONE = 'Saved. Open the .html file in any browser — your words are in the .md beside it.';
const SAVE_NO_PAGE = 'Answer the questions first, then this will have something to save.';
const SAVE_UNAVAILABLE_LABEL = 'Saving is off here';
const SAVE_UNAVAILABLE_NOTE = 'This viewer will not let a page save files. Ask for the one-file version and everything works.';
`;

/* Put the banner at the very top and the feedback box at the very end. */
body = banner + body + feedback;

/* The save code has to run inside the page's own module: buildPage, answersOf,
 * packageFiles, packageName and SHOP are declared there, and a second
 * <script type="module"> gets its own scope and cannot see any of them. A
 * separate script would parse fine and then throw on the first click. */
const moduleEnd = body.lastIndexOf('<\/script>');
if (moduleEnd < 0) {
  console.error('Could not find the end of the page module to inject the save code into.');
  process.exit(1);
}
body = body.slice(0, moduleEnd) + SAVE_STRINGS_EN + capabilityDownload.replace('{{LANG}}', '') + '\n' + body.slice(moduleEnd);

const extraStyle = `
/* ===== shared-link build only ===== */
.trybar { background: var(--ink-900); color: #fff; }
.trybar__in { max-width: 980px; margin-inline: auto; padding: var(--space-4) var(--space-5);
              display: flex; gap: var(--space-4); align-items: flex-start; }
.trybar__tag { flex: none; font-family: var(--font-display); font-size: var(--fs-caption);
               font-weight: var(--fw-bold); letter-spacing: .14em; text-transform: uppercase;
               background: var(--accent-500); color: var(--accent-on);
               padding: .25rem .7rem; border-radius: var(--radius-pill); }
.trybar p { margin: 0; font-size: var(--fs-small); line-height: 1.55; color: rgba(255,255,255,.82); max-width: 70ch; }
#fbBox { margin-top: var(--space-6); }
.fb-grid { display: grid; gap: var(--space-4); }
@media (min-width: 760px) { .fb-grid { grid-template-columns: 1fr 1fr; } }
#fbOut { font-family: var(--font-mono, ui-monospace, monospace); font-size: .82rem; }
`;

const script = `
<script>
/* Assembles what they chose and what they wrote into one block of text. The
   page has nowhere to send it, so the clipboard is the honest mechanism —
   testers paste it into whatever they already use to reach you. */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function chosen() {
    var rows = [];
    document.querySelectorAll('#sum .sum-row').forEach(function (row) {
      var dt = row.querySelector('dt'), dd = row.querySelector('dd');
      if (dt && dd) rows.push(dt.textContent.trim() + ': ' + dd.textContent.trim());
    });
    return rows.length ? rows.join('\\n') : '(did not finish the questions)';
  }

  var QUESTIONS = [
    ['fbEasy', 'Confusing or annoying'],
    ['fbLook', 'How the page looked'],
    ['fbPay', 'Would they pay'],
    ['fbMissing', "What's missing"]
  ];

  $('fbCopy').onclick = function () {
    var parts = ['FEEDBACK ON THE DESIGN SYSTEM', new Date().toLocaleString(), '', 'WHAT THEY CHOSE', chosen(), ''];
    var said = false;

    QUESTIONS.forEach(function (q) {
      var v = ($(q[0]).value || '').trim();
      if (v) { parts.push(q[1].toUpperCase(), v, ''); said = true; }
    });

    if (!said) {
      $('fbNote').textContent = 'Write something in at least one box first.';
      return;
    }

    var text = parts.join('\\n');
    $('fbOut').value = text;
    $('fbOutWrap').hidden = false;

    /* Clipboard access is refused in plenty of embedded contexts, so the text
       is on screen either way and the message says which happened. */
    var done = function () { $('fbNote').textContent = 'Copied. Paste it wherever you like.'; };
    var fell = function () {
      $('fbOut').select();
      $('fbNote').textContent = 'Select the text below and copy it.';
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fell);
    } else {
      fell();
    }
  };
})();
<\/script>
`;


const out = `<title>${title}</title>
<style>
${style}
${extraStyle}
</style>
${body}
${script}
`;

const external = out.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
if (external.length) {
  console.error('External references found — a shared build must be self-contained:');
  external.forEach(e => console.error('  ' + e));
  process.exit(1);
}
/* Only the *outer* document matters. The generator's own page template
 * legitimately contains the strings </style> and </body> as text, so a
 * whole-file search reports a problem that isn't there — check the ends. */
const head = out.trimStart().slice(0, 200).toLowerCase();
if (head.startsWith('<!doctype') || head.startsWith('<html')) {
  console.error('Output still opens a document — it must be a fragment.');
  process.exit(1);
}
if (/<\/html>\s*$/i.test(out)) {
  console.error('Output still closes a document — it must be a fragment.');
  process.exit(1);
}

fs.writeFileSync(OUT, out);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${(out.length / 1024).toFixed(0)}KB, self-contained fragment.`);
