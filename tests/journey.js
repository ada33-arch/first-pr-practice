// End-to-end client journey through brief.html: the path a paying customer walks.
const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');
const DIR = __dirname;
const DS = process.env.DS_BASE || 'file:///home/user/first-pr-practice/design-system/';

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n}${d ? '  → ' + d : ''}`)); };
const head = t => console.log(`\n=== ${t} ===`);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    // favicon.ico is missing from the throwaway static server, and headless
    // Chromium logs the mailto: hand-off as an error. Neither is the page's doing.
    const t = m.text(), u = (m.location() || {}).url || '';
    // /api/me 404s here on purpose: it is how the page discovers there is no
    // account layer behind it and falls back to building files locally.
    if (!/favicon\.ico|\/api\/me/.test(u) && !/Launched external handler/.test(t)) errs.push(`${t} (${u})`);
  });
  p.on('response', r => { if (r.status() >= 400) console.log('   HTTP', r.status(), r.url()); });

  // Fixtures: a logo and a Word file, as a real client would arrive with.
  fs.writeFileSync(DIR + '/j-logo.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="64"><rect x="4" y="8" width="48" height="48" rx="14" fill="#123"/><text x="66" y="42" font-family="sans-serif" font-size="26" font-weight="700" fill="#123">Halevy</text></svg>`);

  await p.goto(DS + 'brief.html');
  await p.waitForTimeout(400);

  head('1. FRONT DOOR — nothing technical is shown');
  {
    const txt = await p.evaluate(() => document.body.innerText);
    ok('no code shown to the client', !/<div|class=|--accent-500|function\s*\(/.test(txt));
    ok('approval hidden before any choice', await p.evaluate(() => document.getElementById('approve').hidden));
    const s0 = await p.evaluate(() => document.getElementById('sum').innerText.trim());
    ok('summary starts empty', /appears here|Answer the questions/i.test(s0) || s0 === '', s0.slice(0, 60));
  }

  head('2. QUESTION ONE — what do you need');
  {
    await p.click('.opt[data-v="website"]');
    await p.fill('#brandName', 'Halevy Partners');
    await p.waitForTimeout(120);
    ok('choice registers', await p.getAttribute('.opt[data-v="website"]', 'aria-pressed') === 'true');
  }

  head('3. QUESTION TWO — the colours are chosen by looking');
  {
    const n = await p.evaluate(() => document.querySelectorAll('#qPal .pal').length);
    ok('a real choice is offered', n >= 6, `${n} palettes`);
    // Every palette must be legible: button text against button fill.
    const bad = await p.evaluate(() => {
      const lum = c => {
        const [r, g, bl] = c.match(/\d+/g).slice(0, 3).map(Number).map(v => {
          v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
        });
        return .2126 * r + .7152 * g + .0722 * bl;
      };
      const out = [];
      document.querySelectorAll('#qPal .pal__btn').forEach((el, i) => {
        const s = getComputedStyle(el);
        const a = lum(s.backgroundColor), c = lum(s.color);
        const ratio = (Math.max(a, c) + .05) / (Math.min(a, c) + .05);
        if (ratio < 4.5) out.push(`#${i} ${ratio.toFixed(2)}:1`);
      });
      return out;
    });
    ok('every palette button clears 4.5:1', bad.length === 0, bad.join(', '));

    await p.click('#qPal .pal:nth-child(3)');
    await p.waitForTimeout(150);
    ok('palette selection sticks', await p.evaluate(() => document.querySelectorAll('#qPal .pal[aria-pressed="true"]').length) === 1);
  }

  head('4. QUESTION THREE — logo, uploaded not described');
  {
    await p.click('.opt[data-v="have"]');
    await p.waitForTimeout(100);
    await p.setInputFiles('#fileLogo', DIR + '/j-logo.svg');
    await p.waitForTimeout(300);
    const src = await p.evaluate(() => { const i = document.querySelector('#logoOut img'); return i && i.src; });
    ok('logo previews back to the client', !!src && src.startsWith('data:'), src ? src.slice(0, 24) : 'no img');
    ok('the upload never leaves the browser', !!src && !/^https?:/.test(src));
  }

  head('5. QUESTION FOUR — content from a Word file');
  {
    // Build a real .docx: a ZIP whose word/document.xml holds the copy.
    const mk = await p.evaluate(async () => {
      const enc = new TextEncoder();
      const xml = enc.encode(`<?xml version="1.0"?><w:document xmlns:w="x"><w:body>` +
        ['Halevy Partners', 'We keep quarterly plans honest', 'Operations leads at growing firms',
         'We stay through delivery, not just the pitch', 'Book a call'].map(t => `<w:p><w:r><w:t>${t}</w:t></w:r></w:p>`).join('') +
        `</w:body></w:document>`);
      const cs = new CompressionStream('deflate-raw');
      const w = cs.writable.getWriter(); w.write(xml); w.close();
      const comp = new Uint8Array(await new Response(cs.readable).arrayBuffer());
      // CRC-32 of the uncompressed bytes
      let t = []; for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c >>> 0; }
      let crc = 0xFFFFFFFF; for (const byte of xml) crc = t[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
      crc = (crc ^ 0xFFFFFFFF) >>> 0;
      const name = enc.encode('word/document.xml');
      const put = (a, o, v, n) => { for (let i = 0; i < n; i++) a[o + i] = (v >>> (8 * i)) & 0xFF; };
      const lh = new Uint8Array(30 + name.length);
      put(lh, 0, 0x04034b50, 4); put(lh, 4, 20, 2); put(lh, 8, 8, 2);
      put(lh, 14, crc, 4); put(lh, 18, comp.length, 4); put(lh, 22, xml.length, 4);
      put(lh, 26, name.length, 2); lh.set(name, 30);
      const cd = new Uint8Array(46 + name.length);
      put(cd, 0, 0x02014b50, 4); put(cd, 6, 20, 2); put(cd, 10, 8, 2);
      put(cd, 16, crc, 4); put(cd, 20, comp.length, 4); put(cd, 24, xml.length, 4);
      put(cd, 28, name.length, 2); cd.set(name, 46);
      const off = lh.length + comp.length;
      const eo = new Uint8Array(22);
      put(eo, 0, 0x06054b50, 4); put(eo, 8, 1, 2); put(eo, 10, 1, 2);
      put(eo, 12, cd.length, 4); put(eo, 16, off, 4);
      const all = new Uint8Array(off + cd.length + eo.length);
      all.set(lh, 0); all.set(comp, lh.length); all.set(cd, off); all.set(eo, off + cd.length);
      return [...all];
    });
    fs.writeFileSync(DIR + '/j-copy.docx', Buffer.from(mk));

    await p.click('.opt[data-v="file"]');
    await p.waitForTimeout(100);
    await p.setInputFiles('#fileCopy', DIR + '/j-copy.docx');
    await p.waitForTimeout(600);
    const note = await p.textContent('#copyNote');
    ok('the Word file is read', /word|read|found|\d+\s*word/i.test(note), note.trim().slice(0, 80));
    const prev = await p.inputValue('#copyPreview');
    ok('their actual words come back', /Halevy Partners/.test(prev), prev.trim().slice(0, 60));
    ok('word count is a real number, not "1 words"', !/\b1 words\b/.test(note), note.trim());
  }

  head('6. THE SUMMARY SITS AT THE END, not following the page down');
  {
    const s = await p.evaluate(() => {
      const el = document.getElementById('sum').closest('.summary') || document.getElementById('sum');
      return { pos: getComputedStyle(el).position, top: getComputedStyle(el).top };
    });
    ok('summary is not sticky', s.pos !== 'sticky' && s.pos !== 'fixed', s.pos);
    // It must actually scroll away with the page.
    await p.evaluate(() => window.scrollTo(0, 0));
    const a = await p.evaluate(() => document.getElementById('sum').getBoundingClientRect().top);
    await p.evaluate(() => window.scrollBy(0, 600));
    await p.waitForTimeout(150);
    const c = await p.evaluate(() => document.getElementById('sum').getBoundingClientRect().top);
    ok('summary moves with the page', Math.abs(a - c) > 400, `${a.toFixed(0)} → ${c.toFixed(0)}`);
  }

  head('7. SEE THE PAGE, then approve');
  {
    ok('approval now offered', !(await p.evaluate(() => document.getElementById('approve').hidden)));
    ok('order names the item', (await p.textContent('#ordItem')).length > 2, await p.textContent('#ordItem'));
    ok('order shows a price', /[£$€]\s?\d+/.test(await p.textContent('#ordPrice')), await p.textContent('#ordPrice'));
    ok('download locked before approval', await p.evaluate(() => document.getElementById('pack').disabled));

    const [pg] = await Promise.all([ctx.waitForEvent('page'), p.click('#see')]);
    await pg.waitForLoadState('domcontentloaded');
    await pg.waitForTimeout(400);
    const seen = await pg.evaluate(() => ({
      txt: document.body.innerText,
      styled: getComputedStyle(document.documentElement).getPropertyValue('--accent-500').trim(),
      logo: !!document.querySelector('img[src^="data:"]'),
      h: document.body.scrollHeight,
    }));
    ok('their page opens and is styled', !!seen.styled, seen.styled || 'no accent token');
    ok('their words are on their page', /Halevy Partners/.test(seen.txt));
    ok('their logo is on their page', seen.logo);
    ok('the page is a full page, not a stub', seen.h > 1500, `${seen.h}px`);
    await pg.screenshot({ path: DIR + '/journey-page.png', fullPage: true });
    await pg.close();

    await p.check('#agree');
    await p.waitForTimeout(200);
    ok('approving unlocks delivery', !(await p.evaluate(() => document.getElementById('pack').disabled)));
  }

  head('8. THE PACKAGE — verified with a real unzip');
  {
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#pack')]);
    const zip = DIR + '/journey.zip';
    await dl.saveAs(zip);
    const kb = (fs.statSync(zip).size / 1024).toFixed(0);
    console.log(`  saved → ${dl.suggestedFilename()} (${kb}KB)`);
    ok('named after the client', /halevy/i.test(dl.suggestedFilename()), dl.suggestedFilename());

    let integrity = '';
    try { integrity = execSync(`unzip -t "${zip}"`, { encoding: 'utf8' }); } catch (e) { integrity = 'FAILED: ' + e.message; }
    ok('zip passes an integrity check', /No errors detected/.test(integrity), integrity.split('\n').pop());

    const list = execSync(`unzip -Z1 "${zip}"`, { encoding: 'utf8' }).trim().split('\n');
    console.log('  contents:', list.join(', '));
    for (const f of ['index.html', 'copy.md', 'BRIEF.md', 'README.md'])
      ok(`package contains ${f}`, list.some(x => x.endsWith(f)));

    const outDir = DIR + '/journey-unzipped';
    fs.rmSync(outDir, { recursive: true, force: true });
    execSync(`unzip -q "${zip}" -d "${outDir}"`);
    const idx = fs.readFileSync(execSync(`find "${outDir}" -name index.html`, { encoding: 'utf8' }).trim(), 'utf8');
    ok('delivered page is self-contained', !/(src|href)="https?:/.test(idx) && !/(src|href)="\.\.?\//.test(idx));
    ok('delivered page carries their copy', /Halevy Partners/.test(idx));
    ok('delivered page carries their logo', /data:image/.test(idx));
    const brief = fs.readFileSync(execSync(`find "${outDir}" -name BRIEF.md`, { encoding: 'utf8' }).trim(), 'utf8');
    ok('brief records who it is for and when', /Halevy Partners/.test(brief) && /20\d\d/.test(brief), brief.slice(0, 120));

    // The delivered file must actually render on its own, offline.
    const dp = await ctx.newPage();
    const derr = [];
    dp.on('pageerror', e => derr.push(e.message));
    await dp.route(/^https?:/, r => r.abort());   // prove it needs no network
    await dp.goto('file://' + execSync(`find "${outDir}" -name index.html`, { encoding: 'utf8' }).trim());
    await dp.waitForTimeout(500);
    const rendered = await dp.evaluate(() => ({
      h: document.body.scrollHeight,
      bg: getComputedStyle(document.body).backgroundColor,
      words: document.body.innerText.trim().split(/\s+/).length,
    }));
    ok('delivered page renders with no network at all', rendered.h > 1500 && rendered.words > 60,
      `${rendered.h}px, ${rendered.words} words`);
    await dp.screenshot({ path: DIR + '/journey-delivered.png', fullPage: true });
    await dp.close();
  }

  head('9. PAYMENT — no card form, no pretending');
  {
    ok('no card fields anywhere', await p.evaluate(() =>
      !document.querySelector('input[autocomplete*="cc-"],input[name*="card"],input[placeholder*="4242"],input[inputmode="numeric"][maxlength="16"]')));
    await p.click('#pay');
    await p.waitForTimeout(150);
    const n = await p.textContent('#payNote');
    ok('says plainly that checkout is not configured', /isn'?t set up|invoice|email/i.test(n), n.trim().slice(0, 80));
  }

  head('10. START AGAIN clears everything');
  {
    p.on('dialog', d => d.accept());
    await p.click('#reset');
    await p.waitForTimeout(400);
    const sr = await p.evaluate(() => document.getElementById('sum').innerText.trim());
    ok('back to an empty summary', /appears here|Answer the questions/i.test(sr) || sr === '', sr.slice(0, 60));
    ok('approval hidden again', await p.evaluate(() => document.getElementById('approve').hidden));
  }

  head('11. NO ERRORS, and the standalone build matches');
  {
    ok('zero page errors across the whole journey', errs.length === 0, errs.slice(0, 2).join(' | '));
    const live = fs.readFileSync('/home/user/first-pr-practice/design-system/brief.html', 'utf8');
    const alone = fs.readFileSync('/home/user/first-pr-practice/design-system/brief-standalone.html', 'utf8');
    ok('standalone has no external references', !/(src|href)="(https?:|\.\.?\/)/.test(alone));
    const sig = live.match(/summary\s*\{[^}]*\}/);
    ok('standalone is rebuilt from the current source', !sig || alone.includes(sig[0]),
      'summary rule missing from bundle — run tools/build-standalone.js');
  }

  console.log(`\n${'-'.repeat(46)}\n  ${pass} passed, ${fail} failed\n`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
