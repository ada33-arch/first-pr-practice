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

/* Put the banner at the very top and the feedback box at the very end. */
body = banner + body + feedback;

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
