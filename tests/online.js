// The online journey, in a browser, against the running Worker.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const DIR = __dirname;
const BASE = process.env.BASE || 'http://127.0.0.1:8787';

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n}${d ? '  → ' + d : ''}`)); };
const head = t => console.log(`\n=== ${t} ===`);

const EMAIL = `journey-${Date.now()}@example.com`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    const u = (m.location() || {}).url || '';
    // Step 6 asks the API for briefs after signing out on purpose — that 401
    // is the assertion, not a defect.
    if (!/favicon\.ico/.test(u) && !/401/.test(m.text())) errs.push(`${m.text()} (${u})`);
  });

  head('1. SIGNED OUT — the page works, but the files do not');
  {
    await p.goto(`${BASE}/start`);
    await p.waitForTimeout(600);
    ok('the brief page is served', /Tell us about your project/.test(await p.title()), await p.title());
    ok('no account strip when signed out', await p.evaluate(() => document.getElementById('acct').hidden));

    await p.click('.opt[data-v="website"]');
    await p.fill('#brandName', 'Northbrook Studio');
    await p.click('#qPal .pal:nth-child(1)');
    await p.click('.opt[data-v="none"]');
    await p.waitForTimeout(150);
    await p.click('.opt[data-v="answer"]');
    await p.fill('#cName', 'Northbrook Studio');
    await p.fill('#cWhat', 'We plan quarters that survive contact with reality');
    await p.fill('#cWho', 'operations leads');
    await p.fill('#cWhy', 'We stay through delivery');
    await p.fill('#cOffer', 'Planning\nAnalytics\nDelivery');
    await p.fill('#cAction', 'Book a call');
    await p.fill('#cContact', 'hello@northbrook.example');
    await p.waitForTimeout(200);

    await p.check('#agree');
    await p.waitForTimeout(150);
    await p.click('#pack');
    await p.waitForTimeout(800);
    const note = await p.textContent('#payNote');
    ok('download asks them to sign in first', /sign in/i.test(note), note.trim().slice(0, 90));
    ok('and offers a route to do it', await p.evaluate(() =>
      Boolean(document.querySelector('#payNote a[href*="/signin"]'))));
  }

  head('2. SIGN IN — the emailed link');
  {
    await p.click('#payNote a');
    await p.waitForURL(/\/signin/);
    await p.waitForTimeout(500);
    ok('sign-in page offers the email route', await p.isVisible('#emailForm'));
    ok('hides providers with no credentials', await p.evaluate(() =>
      document.getElementById('pGoogle').hidden && document.getElementById('pApple').hidden));

    await p.fill('#email', EMAIL);
    await p.click('#sendBtn');
    await p.waitForTimeout(900);
    ok('says a link is on its way', /on its way/i.test(await p.textContent('#sent')));

    const link = await p.evaluate(() => { const a = document.querySelector('#sent a'); return a && a.href; });
    ok('a link is available to follow', Boolean(link));
    await p.goto(link);
    await p.waitForTimeout(800);
    ok('lands back on the brief page', /\/(brief|start)/.test(p.url()), p.url());
  }

  head('3. SIGNED IN — the account is visible and the allowance is real');
  {
    await p.waitForTimeout(400);
    ok('account strip appears', !(await p.evaluate(() => document.getElementById('acct').hidden)));
    ok('shows who is signed in', (await p.textContent('#acctWho')) === EMAIL, await p.textContent('#acctWho'));

    const me = await p.evaluate(() => fetch('/api/me').then(r => r.json()));
    ok('server agrees they are signed in', me.signedIn === true);
    ok('starts with the full free allowance', me.usage.free === 2 && me.usage.used === 0,
      JSON.stringify(me.usage));
  }

  head('4. THE DOWNLOAD COMES FROM THE SERVER');
  {
    // Re-answer: this is a fresh page load after the redirect.
    await p.click('.opt[data-v="website"]');
    await p.fill('#brandName', 'Northbrook Studio');
    await p.click('#qPal .pal:nth-child(1)');
    await p.click('.opt[data-v="none"]');
    await p.waitForTimeout(120);
    await p.click('.opt[data-v="answer"]');
    await p.fill('#cName', 'Northbrook Studio');
    await p.fill('#cWhat', 'We plan quarters that survive contact with reality');
    await p.fill('#cAction', 'Book a call');
    await p.fill('#cContact', 'hello@northbrook.example');
    await p.waitForTimeout(200);
    await p.check('#agree');
    await p.waitForTimeout(200);

    let servedFrom = null;
    p.on('response', r => { if (/\/download$/.test(r.url())) servedFrom = r.status(); });

    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.click('#pack')]);
    const zip = `${DIR}/online.zip`;
    await dl.saveAs(zip);

    ok('the zip came from the API, not the page', servedFrom === 200, `status ${servedFrom}`);
    ok('named after the client', /northbrook/i.test(dl.suggestedFilename()), dl.suggestedFilename());
    ok('archive is intact', /No errors detected/.test(execSync(`unzip -t "${zip}"`, { encoding: 'utf8' })));

    const list = execSync(`unzip -Z1 "${zip}"`, { encoding: 'utf8' }).trim().split('\n');
    ok('carries all four files', ['index.html', 'copy.md', 'BRIEF.md', 'README.md']
      .every(f => list.includes(f)), list.join(','));

    const out = `${DIR}/online-unzipped`;
    fs.rmSync(out, { recursive: true, force: true });
    execSync(`unzip -q "${zip}" -d "${out}"`);
    const idx = fs.readFileSync(`${out}/index.html`, 'utf8');
    ok('server-built page carries their words', /Northbrook Studio/.test(idx));
    ok('server-built page is self-contained', !/(src|href)="https?:/.test(idx));
    ok('server-built page carries the fixed colours', /--accent-on-600/.test(idx));

    await p.waitForTimeout(600);
    ok('allowance ticked down in the UI', /1 of 2|1 downloaded/.test(await p.textContent('#acctUse')),
      await p.textContent('#acctUse'));
  }

  head('5. THE PROJECT WAS SAVED, NOT JUST DOWNLOADED');
  {
    const list = await p.evaluate(() => fetch('/api/briefs').then(r => r.json()));
    ok('the project is on the account', (list.briefs || []).length >= 1, JSON.stringify(list).slice(0, 120));
    ok('it kept their name', (list.briefs[0].title || '') === 'Northbrook Studio', list.briefs[0].title);

    const id = list.briefs[0].id;
    const preview = await p.evaluate(i => fetch(`/api/briefs/${i}/preview`).then(r => r.text()), id);
    ok('the saved answers still render a page', /Northbrook Studio/.test(preview) && preview.length > 20000,
      `${preview.length} bytes`);
  }

  head('5b. THE PROJECTS PAGE');
  {
    await p.goto(`${BASE}/projects`);
    await p.waitForTimeout(900);
    ok('projects page loads for a signed-in person', /projects/i.test(await p.title()), await p.title());
    ok('lists the saved project', /Northbrook Studio/.test(await p.evaluate(() => document.body.innerText)));
    const [dl2] = await Promise.all([
      p.waitForEvent('download', { timeout: 20000 }),
      p.click('[data-dl]'),
    ]);
    ok('can re-download from the list', /\.zip$/.test(dl2.suggestedFilename()), dl2.suggestedFilename());
    const shown = await p.evaluate(() => document.body.innerText);
    ok('shows a real date, not "Invalid Date"', !/Invalid Date/.test(shown),
      (shown.match(/started [^\n]*/) || [''])[0]);
    await p.goto(`${BASE}/brief`);
    await p.waitForTimeout(700);
  }

  head('6. SIGNING OUT ACTUALLY REVOKES');
  {
    const before = await p.evaluate(() => fetch('/api/briefs').then(r => r.status));
    await p.click('#acctOut');
    await p.waitForTimeout(1200);
    const after = await p.evaluate(() => fetch('/api/briefs').then(r => r.status));
    ok('was authorised before', before === 200, String(before));
    ok('is refused after', after === 401, String(after));
    ok('account strip gone', await p.evaluate(() => document.getElementById('acct').hidden));
  }

  head('7. NO PAGE ERRORS');
  ok('zero page errors across the whole journey', errs.length === 0, errs.slice(0, 3).join(' | '));

  console.log(`\n${'-'.repeat(46)}\n  ${pass} passed, ${fail} failed\n`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
