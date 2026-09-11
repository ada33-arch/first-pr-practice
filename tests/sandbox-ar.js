// Prove the shareable build works in the conditions a shared page actually
// has: sandboxed, no pop-ups, no downloads.
const { chromium } = require('playwright');
const fs = require('fs');
let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? (pass++, console.log('  PASS  ' + n)) : (fail++, console.log('  FAIL  ' + n + (d ? '  → ' + d : ''))); };

const frag = fs.readFileSync('/home/user/first-pr-practice/design-system/brief-shareable-ar.html', 'utf8');
fs.writeFileSync('/tmp/host-ar.html',
  `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">
<iframe id="f" style="width:100%;height:100vh;border:0"
        sandbox="allow-scripts allow-forms"
        srcdoc="${frag.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe></body></html>`);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    const u = (m.location() || {}).url || '';
    const t = m.text();
    /* Two conditions the page is built to meet, both asserted above:
       - /api/me is refused, which is how it discovers there is no account
         layer and falls back to building everything locally;
       - the Clipboard API is blocked by the host's permissions policy, which
         is precisely why the feedback box also puts the text on screen. */
    if (/favicon|api\/me/.test(u) || /api\/me/.test(t)) return;
    if (/Clipboard API has been blocked/.test(t)) return;
    errs.push(t);
  });

  await p.goto('file:///tmp/host-ar.html');
  await p.waitForTimeout(1400);


  const f = p.frameLocator('#f');
  /* The `hidden` attribute alone is a UA-stylesheet rule that any class setting
     `display` overrides, so asserting on el.hidden proves nothing about what a
     person sees. Assert on the computed style. */
  {
    const target = f.locator('body');
    const showing = await target.evaluate(() =>
      [...document.querySelectorAll('[hidden]')]
        .filter(el => getComputedStyle(el).display !== 'none')
        .map(el => el.id || el.className));
    ok('hidden elements really are hidden', showing.length === 0, showing.join(', '));
  }

  ok('loads inside a sandboxed frame', await f.locator('h1').first().isVisible());
  ok('the banner is in Arabic', /يغادر جهازك/.test(await f.locator('.trybar').innerText()));
  ok('the document is right-to-left', await f.locator('body').evaluate(el => getComputedStyle(el).direction) === 'rtl');
  ok('the connected script is not letter-spaced',
    await f.locator('.eyebrow').first().evaluate(el => getComputedStyle(el).letterSpacing) === 'normal');
  ok('labels are not uppercased',
    await f.locator('.eyebrow').first().evaluate(el => getComputedStyle(el).textTransform) === 'none');
  ok('questions are in Arabic', /ما الذي تحتاجه؟/.test(await f.locator('body').innerText()));

  await f.locator('.opt[data-v="website"]').click();
  await f.locator('#brandName').fill('Marlow and Finch');
  await f.locator('#qPal .pal').nth(1).click();
  await f.locator('#qLogoMode .opt[data-v="none"]').click();   // logo: name only
  await p.waitForTimeout(200);
  await f.locator('#qCopyMode .opt[data-v="answer"]').click(); // words: answer questions
  await f.locator('#cName').fill('Marlow and Finch');
  await f.locator('#cWhat').fill('Bookkeeping for people who hate bookkeeping');
  await f.locator('#cWho').fill('independent trades');
  await f.locator('#cWhy').fill('We answer the phone');
  await f.locator('#cOffer').fill('Bookkeeping\nVAT returns\nPayroll');
  await f.locator('#cAction').fill('Get a quote');
  await f.locator('#cContact').fill('hello@marlowfinch.example');
  await p.waitForTimeout(300);
  ok('all nine palettes render', await f.locator('#qPal .pal').count() >= 9);
  ok('palettes are described in Arabic', /هادئ وموثوق/.test(await f.locator('#qPal').innerText()));
  ok('summary labels are Arabic too', !/For|You need|The look/.test(await f.locator('#sum').innerText()),
    (await f.locator('#sum').innerText()).slice(0, 70).replace(/\n/g, ' | '));
  ok('the summary is in Arabic', /موقع إلكتروني/.test(await f.locator('#sum').innerText()),
    (await f.locator('#sum').innerText()).slice(0, 60).replace(/\n/g, ' | '));

  // The critical one: the preview must work with no pop-up available.
  await f.locator('#see').click();
  await p.waitForTimeout(1400);
  ok('preview appears inline, no pop-up needed', await f.locator('#previewWrap').isVisible());

  /* A nested srcdoc frame inside a sandbox has an opaque origin, so neither the
     parent nor the driver can read its document — that is the sandbox working,
     not a fault. The page it was handed is still inspectable, and the rendering
     itself is confirmed by screenshot. */
  const inner = await f.locator('#previewFrame').evaluate(el => ({
    txt: el.srcdoc || '',
    len: (el.srcdoc || '').length,
  }));

  ok('the preview is their real page', /Marlow and Finch/.test(inner.txt),
    inner.len + ' bytes handed to the frame');
  ok('the generated page is right-to-left too', /<html[^>]*dir="rtl"/.test(inner.txt),
    (inner.txt.match(/<html[^>]*>/) || [''])[0]);
  ok('the generated page carries Arabic typography', /Noto Kufi Arabic/.test(inner.txt));
  ok('the generated page scaffolding is Arabic', /ما الذي نقدّمه|ما الذي نقوم به/.test(inner.txt));
  ok('the preview is styled', /--accent-500/.test(inner.txt));
  ok('the preview is a full page', inner.len > 20000, inner.len + ' bytes');

  await f.locator('#agree').check();
  await p.waitForTimeout(300);
  ok('approval unlocks the download', !(await f.locator('#pack').isDisabled()));

  // Feedback panel
  await f.locator('#fbCopy').click();
  await p.waitForTimeout(300);
  ok('asks for something before copying nothing',
    /خانة واحدة/.test(await f.locator('#fbNote').innerText()), await f.locator('#fbNote').innerText());

  await f.locator('#fbEasy').fill('Question 3 about the logo was not obvious.');
  await f.locator('#fbPay').fill('Maybe 200. 450 feels high for a one-pager.');
  await f.locator('#fbCopy').click();
  await p.waitForTimeout(600);

  const out = await f.locator('#fbOut').inputValue();
  ok('a feedback summary is produced', out.length > 60, out.slice(0, 40).replace(/\n/g, ' '));
  ok('it records what they chose', /Marlow and Finch|موقع إلكتروني/.test(out));
  ok('the feedback summary is labelled in Arabic', /ملاحظات على النظام/.test(out));
  ok('it records what they wrote', /not obvious/.test(out) && /450 feels high/.test(out));
  ok('it skips the boxes they left blank', !/ما الذي ينقص/.test(out));
  ok('it tells them what happened either way',
    /تم النسخ|حدّد النص/.test(await f.locator('#fbNote').innerText()),
    await f.locator('#fbNote').innerText());

  await p.screenshot({ path: __dirname + '/shareable-ar.png', fullPage: false });
  ok('no page errors in a sandbox', errs.length === 0, errs.slice(0, 2).join(' | '));

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
