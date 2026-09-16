// Drive it the way a viewer would, and stub window.claude the way the real one behaves.
const { chromium } = require('playwright');
const fs = require('fs');
let pass=0,fail=0;
const ok=(n,c,d='')=>{c?(pass++,console.log('  PASS  '+n)):(fail++,console.log('  FAIL  '+n+(d?'  → '+d:'')));};
const frag = fs.readFileSync('/home/user/first-pr-practice/design-system/brief-shareable.html','utf8');

async function run(label, claudeStub) {
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1100,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  fs.writeFileSync('/tmp/cap-host.html', `<!doctype html><meta charset="utf-8">${frag}`);
  await p.addInitScript(claudeStub);
  await p.goto('file:///tmp/cap-host.html');
  await p.waitForTimeout(1200);

  await p.click('.opt[data-v="website"]');
  await p.fill('#brandName','Marlow and Finch');
  await p.locator('#qPal .pal').nth(0).click();
  await p.click('#qLogoMode .opt[data-v="none"]');
  await p.waitForTimeout(150);
  await p.click('#qCopyMode .opt[data-v="answer"]');
  await p.fill('#cName','Marlow and Finch');
  await p.fill('#cWhat','Bookkeeping for people who hate bookkeeping');
  await p.fill('#cAction','Get a quote');
  await p.waitForTimeout(250);
  await p.check('#agree');
  await p.waitForTimeout(250);

  console.log('\n--- ' + label);
  await p.click('#pack');
  await p.waitForTimeout(900);
  const saved = await p.evaluate(()=>window.__saved||[]);
  const note = (await p.textContent('#payNote')).trim();
  const disabled = await p.locator('#pack').isDisabled();
  /* Declining is the viewer's own decision — the right response is silence,
     not a message telling them what they just chose. Every other outcome must
     leave visible evidence that the button did something. */
  if (/declines/.test(label)) {
    ok('says nothing when the viewer declines', saved.length === 0 && note.length === 0,
      `saved=${saved.length} note="${note.slice(0,50)}"`);
  } else {
    ok('button is not silently inert', saved.length > 0 || note.length > 0,
      `saved=${saved.length} note="${note.slice(0,50)}"`);
  }
  if (saved.length) {
    console.log('    offered:', saved.map(s=>s.filename+' ('+s.bytes+'B)').join(', '));
    ok('offers the page as .html', saved.some(s=>/\.html$/.test(s.filename)));
    ok('offers the words as .md', saved.some(s=>/\.md$/.test(s.filename)));
    ok('names the files after the client', saved.every(s=>/marlow/i.test(s.filename)), saved[0].filename);
    ok('the html it offers is the real page', /Marlow and Finch/.test(saved[0].data));
  } else {
    console.log('    note:', JSON.stringify(note.slice(0,80)));
  }
  ok('no page errors', errs.length===0, errs[0]);
  await b.close();
}

(async()=>{
  await run('viewer grants downloads', () => {
    window.__saved = [];
    window.claude = { use: async n => n === 'downloads' ? {
      save: async ({filename, data}) => { window.__saved.push({filename, bytes: (data||'').length, data: String(data).slice(0,200)}); return {status:'saved'}; }
    } : null };
  });
  await run('viewer declines the save', () => {
    window.__saved = [];
    window.claude = { use: async () => ({ save: async () => { throw { code:'declined', message:'no' }; } }) };
  });
  await run('viewer forbids .html (extended types off)', () => {
    window.__saved = [];
    window.claude = { use: async () => ({ save: async () => { throw { code:'extension_not_enabled', message:'no' }; } }) };
  });
  await run('no capability at all', () => { window.__saved = []; });
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail?1:0);
})();
