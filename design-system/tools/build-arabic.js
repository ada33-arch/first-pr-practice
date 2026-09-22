#!/usr/bin/env node
/**
 * Builds the Arabic edition of the shareable intake.
 *
 *   node design-system/tools/build-arabic.js
 *
 * Takes the English shareable fragment and applies three things: the
 * translated interface, the RTL direction, and the Arabic typography layer.
 * It also switches the generator into Arabic, so the page the customer is
 * shown — and the files they download — come out in Arabic and right-to-left
 * too, rather than Arabic words poured into a left-to-right layout.
 *
 * Every source string must still be present. If an English edit moves one, the
 * build fails rather than shipping a page that is half translated.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UI_AR, UI_RTL_CSS } from './i18n-ui.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SRC = path.join(ROOT, 'brief-shareable.html');
const OUT = path.join(ROOT, 'brief-shareable-ar.html');

let doc = fs.readFileSync(SRC, 'utf8');

/* ---- Translate ------------------------------------------------------------
   Longest first, so a short phrase cannot consume part of a longer one that
   contains it. Each string must appear at least once. */
const missing = [];
for (const [en, ar] of [...UI_AR].sort((a, b) => b[0].length - a[0].length)) {
  if (!doc.includes(en)) { missing.push(en); continue; }
  doc = doc.split(en).join(ar);
}

if (missing.length) {
  console.error(`${missing.length} source string(s) no longer match — the Arabic build would be incomplete:`);
  missing.forEach(m => console.error('  · ' + JSON.stringify(m.slice(0, 72))));
  console.error('\nUpdate tools/i18n-ui.js to match the English source, then rebuild.');
  process.exit(1);
}

/* ---- Direction and typography -------------------------------------------- */
doc = doc.replace('<title>', '<title>');
doc = doc.replace(/^<title>.*<\/title>/m, '<title>جرّبه — ابنِ صفحتك في أربعة أسئلة</title>');
doc = doc.replace('</style>', `${UI_RTL_CSS}\n</style>`);

/* The fragment has no <html> of its own — the host supplies it — so the page
   sets its own direction as soon as it parses, before anything is painted. */
const dirScript = `
<script>
/* Set on the document the host gave us, since this build ships as a fragment
   and cannot write its own <html dir>. Runs at parse time so nothing is ever
   laid out left-to-right first and then flipped. */
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');
<\/script>
`;
doc = dirScript + doc;

/* ---- Switch the generator into Arabic ------------------------------------
   The intake being in Arabic while the page it produces comes out in English
   would be the worst of both. */
doc = doc.replace('return css === null ? null : buildPageFrom(answersOf(), css);',
                  "return css === null ? null : buildPageFrom(answersOf(), css, { lang: 'ar' });");
doc = doc.replace('packageFiles(answersOf(), page, { contact: SHOP.CONTACT })',
                  "packageFiles(answersOf(), page, { contact: SHOP.CONTACT, lang: 'ar' })");
doc = doc.replace('logoSummary(a)', "logoSummary(a, 'ar')");
doc = doc.replace('copySummary(a)', "copySummary(a, 'ar')");
doc = doc.replace('logoSummary(answersOf())', "logoSummary(answersOf(), 'ar')");
doc = doc.replace('copySummary(answersOf())', "copySummary(answersOf(), 'ar')");

/* The summary's row labels. These are array literals in the page script, not
   markup, so they are matched in that exact form — distinctive enough that the
   short ones ("Logo", "Words") cannot collide with prose elsewhere. */
for (const [en, ar] of [
  ["['For',", "['الجهة',"],
  ["['You need',", "['ما تحتاجه',"],
  ["['The look',", "['المظهر',"],
  ["['Logo',", "['الشعار',"],
  ["['Words',", "['النصوص',"],
]) {
  if (!doc.includes(en)) {
    console.error(`Summary row label ${en} no longer matches — the brief would show English labels beside Arabic values.`);
    process.exit(1);
  }
  doc = doc.split(en).join(ar);
}

/* Palette cards describe the look in Arabic too. */
doc = doc.replace('const r = ramp(p.theme);', "const r = ramp(p.theme);\n    const pTx = paletteText(p, 'ar');");
doc = doc.replace('${p.name}</span>${p.tag ?', '${pTx.name}</span>${pTx.tag ?');
doc = doc.replace('<span class="pal__tag">${p.tag}</span>', '<span class="pal__tag">${pTx.tag}</span>');
doc = doc.replace("`${A.pal.name} — ${A.pal.mood.toLowerCase()}`", "`${paletteText(A.pal, 'ar').name} — ${paletteText(A.pal, 'ar').mood}`");
doc = doc.replace("A.kind ? KIND_LABEL[A.kind] : null", "A.kind ? kindLabel(A.kind, 'ar') : null");
doc = doc.replace('`Look: ${A.pal.name}\\n`', "`المظهر: ${paletteText(A.pal, 'ar').name}\\n`");

/* The order line and the feedback summary. */
doc = doc.replace("document.getElementById('ordItem').textContent = KIND_LABEL[A.kind]",
                  "document.getElementById('ordItem').textContent = kindLabel(A.kind, 'ar')");
doc = doc.replace("'FEEDBACK ON THE DESIGN SYSTEM'", "'ملاحظات على النظام'");
doc = doc.replace("'WHAT THEY CHOSE'", "'ما الذي اختاره'");
doc = doc.replace("['fbEasy', 'Confusing or annoying']", "['fbEasy', 'ما كان مربكًا أو مزعجًا']");
doc = doc.replace("['fbLook', 'How the page looked']", "['fbLook', 'كيف بدت الصفحة']");
doc = doc.replace("['fbPay', 'Would they pay']", "['fbPay', 'هل سيدفع']");
doc = doc.replace('["fbMissing", "What\'s missing"]', "['fbMissing', 'ما الذي ينقص']");
doc = doc.replace(`['fbMissing', "What's missing"]`, "['fbMissing', 'ما الذي ينقص']");

/* The save affordance and its messages, in Arabic — and the package files it
   hands over must be generated in Arabic too. */
doc = doc.replace("packageFiles(a, page, { contact: SHOP.CONTACT })",
                  "packageFiles(a, page, { contact: SHOP.CONTACT, lang: 'ar' })");
for (const [en, ar] of [
  ["const SAVE_LABEL = 'Save my page';", "const SAVE_LABEL = 'احفظ صفحتي';"],
  ["const SAVE_WORKING = 'Preparing…';", "const SAVE_WORKING = 'جارٍ التجهيز…';"],
  ["const SAVE_DONE = 'Saved. Open the .html file in any browser — your words are in the .md beside it.';",
   "const SAVE_DONE = 'تم الحفظ. افتح ملف ‎.html‎ في أي متصفح — ونصوصك في ملف ‎.md‎ بجانبه.';"],
  ["const SAVE_NO_PAGE = 'Answer the questions first, then this will have something to save.';",
   "const SAVE_NO_PAGE = 'أجب عن الأسئلة أولًا، عندها سيكون هناك ما يُحفظ.';"],
  ["const SAVE_UNAVAILABLE_LABEL = 'Saving is off here';", "const SAVE_UNAVAILABLE_LABEL = 'الحفظ غير متاح هنا';"],
  ["const SAVE_UNAVAILABLE_NOTE = 'This viewer will not let a page save files. Ask for the one-file version and everything works.';",
   "const SAVE_UNAVAILABLE_NOTE = 'هذا العارض لا يسمح للصفحة بحفظ الملفات. اطلب النسخة ذات الملف الواحد وسيعمل كل شيء.';"],
  ["'One at a time — try that again in a moment.'", "'واحدة تلو الأخرى — أعد المحاولة بعد قليل.'"],
  ["'That file is too big to hand over here.'", "'هذا الملف أكبر من أن يُسلَّم هنا.'"],
  ["'This viewer will not accept that file type. Ask for the one-file version and everything works.'",
   "'هذا العارض لا يقبل هذا النوع من الملفات. اطلب النسخة ذات الملف الواحد وسيعمل كل شيء.'"],
  ["'That did not work here. Ask for the one-file version and everything works.'",
   "'لم ينجح ذلك هنا. اطلب النسخة ذات الملف الواحد وسيعمل كل شيء.'"],
]) {
  if (!doc.includes(en)) {
    console.error(`Save-affordance string no longer matches: ${en.slice(0, 60)}`);
    process.exit(1);
  }
  doc = doc.split(en).join(ar);
}

const external = doc.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
if (external.length) {
  console.error('External references found — a shared build must be self-contained:');
  external.forEach(e => console.error('  ' + e));
  process.exit(1);
}

/* Guard against the obvious failure: an "Arabic" page with no Arabic in it. */
const arabicChars = (doc.match(/[؀-ۿ]/g) || []).length;
if (arabicChars < 2000) {
  console.error(`Only ${arabicChars} Arabic characters in the output — the translation did not apply.`);
  process.exit(1);
}

fs.writeFileSync(OUT, doc);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${(doc.length / 1024).toFixed(0)}KB, ${arabicChars} Arabic characters.`);
