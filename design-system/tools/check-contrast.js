#!/usr/bin/env node
/* Every accent pairing the CSS actually uses as text must clear WCAG AA (4.5:1).
   Runs off the token file alone — no browser — so it is cheap enough to gate a
   build on. See DESIGN-BRIEF.md §2 for which token pairs with which surface. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TOKENS = join(dirname(fileURLToPath(import.meta.url)), '..', 'tokens', 'tokens.css');
const PAPER = '#FFFFFF';

const channel = v => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
const luminance = hex => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const css = readFileSync(TOKENS, 'utf8');
const themes = [...css.matchAll(/(?:\.theme-([a-z]+)|(:root))\s*\{([^}]*)\}/g)]
  .map(([, name, root, body]) => ({ name: name || (root && 'root'), body }))
  .filter(t => t.name && /--accent-500\s*:/.test(t.body));

const globalOn600 = (css.match(/--accent-on-600:\s*(#[0-9A-Fa-f]{6})/) || [])[1];

let failures = 0;
for (const { name, body } of themes) {
  const token = k => (body.match(new RegExp(`--accent-${k}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
  const c500 = token(500), c600 = token(600);
  const on = token('on'), on600 = token('on-600') || globalOn600;

  // [label, foreground, background] — every pair the stylesheets set as text.
  const pairs = [
    ['--accent-on on --accent-500 (button label)', on, c500],
    ['--accent-on-600 on --accent-600 (button hover)', on600, c600],
    ['--accent-600 on white (links, eyebrows, .text-accent)', c600, PAPER],
  ];

  for (const [label, fg, bg] of pairs) {
    if (!fg || !bg) continue;
    const r = ratio(fg, bg);
    if (r < 4.5) {
      failures++;
      console.error(`FAIL  ${name.padEnd(9)} ${r.toFixed(2)}:1  ${label}  (${fg} on ${bg})`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} accent pairing(s) below 4.5:1. See DESIGN-BRIEF.md §2.`);
  process.exit(1);
}
console.log(`All accent text pairings clear 4.5:1 across ${themes.length} themes.`);
