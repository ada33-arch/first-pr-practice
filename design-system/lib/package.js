/* Turning a brief into a deliverable package.
 *
 * This module is the single source of truth for what a customer receives, and
 * it runs unchanged in two places: in the browser, so they can preview their
 * page instantly, and in the Worker, so the copy we actually deliver is built
 * by the server. That split is the point — a download the browser assembles
 * can never be gated, because the browser already has everything it needs.
 *
 * Nothing here touches the DOM, the network, or any global. Give it answers
 * and stylesheet text; get back files.
 */

/* ---- Escaping -------------------------------------------------------------
   Everything below interpolates customer text into HTML. In a single-user page
   that was harmless — the only person you could attack was yourself. As a
   multi-user service it is not: a brief is stored, and later rendered where
   someone else (an admin reviewing it, or a teammate) is signed in. So every
   value that reaches markup goes through here first. -------------------------- */
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}

/* A logo arrives as a data: URL read from the customer's own disk. Anything
   else in that slot — javascript:, or a remote URL — is either an attack or a
   silent external dependency, and the package promises to have neither. */
export function safeImageSrc(src) {
  return /^data:image\/(png|jpeg|gif|webp|svg\+xml|avif);base64,[A-Za-z0-9+/=]+$/.test(String(src || ''))
    ? src
    : null;
}

/* ---- Themes ---------------------------------------------------------------
   Read straight out of tokens.css so the stylesheet stays the one place a
   colour is defined. The browser used to probe a hidden element for computed
   styles; that has no meaning in a Worker, and this works in both. ----------- */
export function parseRamps(tokensCss) {
  const ramps = {};
  for (const [, name, body] of tokensCss.matchAll(/\.theme-([a-z]+)\s*\{([^}]*)\}/g)) {
    const read = key => (body.match(new RegExp(`--accent-${key}:\\s*(#[0-9A-Fa-f]{3,8})`)) || [])[1];
    const ramp = { 100: read(100), 300: read(300), 500: read(500), 600: read(600), on: read('on') };
    if (ramp[500]) ramps[name] = ramp;
  }
  return ramps;
}

export const PALETTES = [
  { id:'warm',     theme:'amber',  name:'Warm and confident', tag:'Most popular', ground:'#FFFFFF', dark:false, mood:'Approachable, energetic, human' },
  { id:'trusted',  theme:'navy',   name:'Calm and trusted',   tag:'Classic',      ground:'#FFFFFF', dark:false, mood:'Established, safe, serious' },
  { id:'modern',   theme:'violet', name:'Modern and sharp',   tag:'Tech',         ground:'#FFFFFF', dark:false, mood:'Current, technical, premium' },
  { id:'natural',  theme:'green',  name:'Fresh and natural',  tag:'',             ground:'#F7F8FA', dark:false, mood:'Healthy, sustainable, calm' },
  { id:'bold',     theme:'coral',  name:'Bold and lively',    tag:'',             ground:'#FAF6EC', dark:false, mood:'Creative, warm, unmissable' },
  { id:'clean',    theme:'teal',   name:'Clean and clear',    tag:'',             ground:'#FFFFFF', dark:false, mood:'Precise, clinical, open' },
  { id:'money',    theme:'indigo', name:'Sharp and precise',  tag:'Finance',      ground:'#FFFFFF', dark:false, mood:'Exact, dependable, quiet' },
  { id:'darkprem', theme:'violet', name:'Dark and premium',   tag:'Dark',         ground:'#14181F', dark:true,  mood:'Striking, high-end, confident' },
  { id:'darkgold', theme:'amber',  name:'Dark and warm',      tag:'Dark',         ground:'#14181F', dark:true,  mood:'Rich, considered, editorial' },
];

export const KIND_LABEL = {
  website: 'A website',
  landing: 'A page to sell something',
  deck: 'A presentation',
  portfolio: 'A portfolio',
};

export const paletteById = id => PALETTES.find(p => p.id === id) || PALETTES[0];

/* ---- Reading the answers -------------------------------------------------- */

/* The shape every function here expects. Answers arrive from a form in the
   browser and from JSON in the Worker; normalising once means neither caller
   can hand the generator a half-built object. */
export function normalise(input = {}) {
  const fields = input.fields || {};
  return {
    kind: KIND_LABEL[input.kind] ? input.kind : null,
    palId: paletteById(input.palId).id,
    logoMode: ['have', 'describe', 'none'].includes(input.logoMode) ? input.logoMode : null,
    logoStyle: input.logoStyle || null,
    logo: input.logo && safeImageSrc(input.logo.src)
      ? { name: String(input.logo.name || 'logo'), src: input.logo.src }
      : null,
    copyMode: ['file', 'answer', 'none'].includes(input.copyMode) ? input.copyMode : null,
    copyText: String(input.copyText || ''),
    fields: Object.fromEntries(
      ['brandName', 'logoWords', 'cName', 'cWhat', 'cWho', 'cWhy', 'cOffer', 'cAction', 'cContact']
        .map(k => [k, String(fields[k] || '')])),
  };
}

export function brandOf(a) {
  return (a.fields.cName || a.fields.brandName || '').trim();
}

export function logoSummary(a) {
  if (a.logoMode === 'have') return a.logo ? `Supplied — ${a.logo.name}` : 'Ready to upload';
  if (a.logoMode === 'describe') {
    const bits = [a.fields.brandName, a.logoStyle].filter(Boolean);
    return bits.length ? bits.join(' · ') : 'To be described';
  }
  if (a.logoMode === 'none') return a.fields.cName || a.fields.brandName || 'Name only, for now';
  return null;
}

export function copySummary(a) {
  if (a.copyMode === 'file') {
    const w = a.copyText.trim() ? a.copyText.trim().split(/\s+/).length : 0;
    return w ? `Your document — ${w} words` : 'Ready to upload';
  }
  if (a.copyMode === 'answer') {
    const filled = ['cName', 'cWhat', 'cWho', 'cWhy', 'cOffer', 'cAction']
      .filter(k => (a.fields[k] || '').trim()).length;
    return `We'll draft it — ${filled} of 6 answered`;
  }
  if (a.copyMode === 'none') return "We'll draft it from scratch";
  return null;
}

/* Enough answered to be worth generating anything. */
export const isReady = a => Boolean(a.kind && a.palId);

/* ---- Turning answers into real copy ---------------------------------------
   No model runs here, so this composes a first draft from the customer's own
   words rather than inventing prose. It is labelled as a draft everywhere it
   appears, because that is what it is. -------------------------------------- */
export function draftCopy(a) {
  const f = a.fields;
  const name = (f.cName || f.brandName || 'Your name here').trim();
  const what = (f.cWhat || '').trim();
  const who  = (f.cWho  || '').trim();
  const why  = (f.cWhy  || '').trim();
  const act  = (f.cAction || 'Get in touch').trim();
  const contact = (f.cContact || '').trim();
  const offers = (f.cOffer || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3);

  let headline = '', sub = '';
  if (a.copyMode === 'file' && a.copyText.trim()) {
    const lines = a.copyText.trim().split('\n').map(s => s.trim()).filter(Boolean);
    headline = lines[0] || what || name;
    sub = lines.slice(1).join(' ').slice(0, 220) || '';
  } else {
    headline = why || what || name;
    sub = [what && why ? what : '', who ? `Made for ${who.toLowerCase()}.` : '']
      .filter(Boolean).join(' ') || 'A line about what you do and who it helps.';
  }
  return { name, headline, sub, offers, act, contact, who, what, why };
}

/* ---- Build the page -------------------------------------------------------
   `css` is the concatenated stylesheet text. The caller supplies it because
   the two environments obtain it differently: the browser reads its own
   <style> blocks, the Worker reads the files off disk. ---------------------- */
export function buildPage(answers, css) {
  const a = normalise(answers);
  const d = draftCopy(a);
  const p = paletteById(a.palId);
  const dark = p.dark;

  const logoSrc = a.logo && safeImageSrc(a.logo.src);
  const logoImg = logoSrc
    ? `<img src="${esc(logoSrc)}" alt="${esc(d.name)}" style="max-height:34px;width:auto">`
    : `<span>${esc(d.name)}</span>`;

  const offers = d.offers.length ? d.offers : ['Something you offer', 'Something else', 'A third thing'];
  const tint = dark ? '' : ' tint-1';

  const darkVars = dark ? `
:root {
  --surface-page:#14181F; --surface-muted:#1B2333; --surface-sunken:#10141A; --surface-cream:#1B2333;
  --fg-strong:#FFFFFF; --fg-body:rgba(255,255,255,.76); --fg-muted:rgba(255,255,255,.52);
  --ink-100:rgba(255,255,255,.10); --ink-200:rgba(255,255,255,.17); --ink-300:rgba(255,255,255,.30); --ink-400:rgba(255,255,255,.48);
}
body { background: var(--surface-page); }` : `
:root { --surface-page:${p.ground}; }
body { background: var(--surface-page); }`;

  const brief = [
    brandOf(a) ? `For        : ${brandOf(a)}` : '',
    `You need   : ${KIND_LABEL[a.kind] || '—'}`,
    `The look   : ${p.name} (${p.mood})`,
    `Logo       : ${logoSummary(a) || '—'}`,
    a.logoMode === 'describe' && a.fields.logoWords ? `Logo notes : ${a.fields.logoWords}` : '',
    `Words      : ${copySummary(a) || '—'}`,
  ].filter(Boolean).join('\n  ')
    // The brief sits inside an HTML comment; a stray "--" would close it early.
    .replace(/--+/g, '–');

  const body = a.kind === 'deck' ? `
<div class="deck deck--wide">
  <div class="deck__slide">
    <div class="slide">
      <div class="slide-cover">
        <div class="slide-cover__type">
          <span class="eyebrow">${esc(d.who || 'Presentation')}</span>
          <h1 class="display">${esc(d.headline)}</h1>
          <hr class="rule">
          <p class="small text-muted">${esc(d.name)}${d.contact ? ' · ' + esc(d.contact) : ''}</p>
        </div>
        <div class="slide-cover__media" style="background:var(--accent-50)"></div>
      </div>
    </div>
    <p class="deck__caption">Cover</p>
  </div>
  <div class="deck__slide">
    <div class="slide slide--chromed">
      <div class="slide__logo">${esc(d.name)}</div><div class="slide__pagenum">02</div>
      <div class="slide__inner"><div class="stack stack-5">
        <div class="stack stack-2"><span class="eyebrow">What we do</span><h2 class="h2">${esc(d.what || 'What we do')}</h2></div>
        <div class="grid grid--3">
          ${offers.map(o => `<article class="card stack stack-3"><span class="icon-chip"></span><h3 class="card__title">${esc(o)}</h3><p class="card__body">A sentence about this.</p></article>`).join('')}
        </div>
      </div></div>
    </div>
    <p class="deck__caption">What we do</p>
  </div>
  <div class="deck__slide">
    <div class="slide slide--accent">
      <div class="slide-close">
        <h2 class="display">${esc(d.act)}</h2>
        <p class="small">${esc(d.contact || 'your@email.com')}</p>
      </div>
    </div>
    <p class="deck__caption">Closing</p>
  </div>
</div>` : `
<header class="container">
  <nav class="navbar">
    <span class="navbar__brand">${logoImg}</span>
    <a class="btn btn--primary" href="#contact">${esc(d.act)}</a>
  </nav>
</header>

<section class="hero-gradient">
  <div class="container" style="padding-block:var(--space-11) var(--space-9)">
    <div class="split" style="align-items:center">
      <div class="stack stack-5">
        ${d.who ? `<span class="badge-pill">For ${esc(d.who)}</span>` : ''}
        <h1 class="h1">${esc(d.headline)}</h1>
        <p class="body-lg measure" style="color:rgba(255,255,255,.85)">${esc(d.sub)}</p>
        <div><a class="btn btn--ink btn--lg" href="#contact">${esc(d.act)}</a></div>
      </div>
      <div style="position:relative;display:grid;place-items:center;isolation:isolate">
        <div class="orb" style="width:340px;height:340px;top:-40px;right:-30px" aria-hidden="true"></div>
        <div class="device device--browser" style="width:100%;max-width:500px">
          <div class="device__screen" style="aspect-ratio:16/10;background:var(--surface-muted)"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="wave" aria-hidden="true"><svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0,45 C240,95 480,0 720,25 C960,50 1200,90 1440,55 L1440,90 L0,90 Z"/></svg></div>
</section>

<section class="section section--muted">
  <div class="container stack stack-6">
    <div class="stack stack-3" style="max-width:52ch">
      <span class="eyebrow">What we offer</span>
      <h2 class="h2">${esc(d.what || 'What we do')}</h2>
      <hr class="rule">
    </div>
    <div class="grid grid--3">
      ${offers.map(o => `<article class="card${tint} stack stack-3"><span class="icon-chip"></span><h3 class="card__title">${esc(o)}</h3><p class="card__body">A sentence about this. Replace it with the real thing when you're ready.</p></article>`).join('')}
    </div>
  </div>
</section>

${d.why ? `<section class="section">
  <div class="container split">
    <div class="stack stack-4">
      <span class="eyebrow">Why us</span>
      <h2 class="h2">${esc(d.why)}</h2>
      <hr class="rule">
    </div>
    <p class="body measure">${esc(d.sub)}</p>
  </div>
</section>` : ''}

<section class="section" id="contact">
  <div class="container">
    <div class="cta-band cta-band--gradient">
      <div class="stack stack-2">
        <h3 class="h3">${esc(d.act)}</h3>
        ${d.contact ? `<p class="small" style="color:rgba(255,255,255,.85)">${esc(d.contact)}</p>` : ''}
      </div>
      <a class="btn btn--ink btn--lg" href="#">${esc(d.act)}</a>
    </div>
  </div>
</section>

<footer class="section section--dark on-dark" style="padding-block:var(--space-8)">
  <div class="container stack stack-2">
    <span class="navbar__brand" style="color:#fff">${esc(d.name)}</span>
    ${d.contact ? `<p class="small">${esc(d.contact)}</p>` : ''}
  </div>
</footer>`;

  return `<!doctype html>
<html lang="en" class="theme-${p.theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.name)}</title>
<!--
  Your brief
  ${brief}

  The wording below is a first draft built from your answers.
  Change anything you like — it is a starting point, not the final copy.
-->
<style>
${css}
${darkVars}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/* ---- The package ---------------------------------------------------------- */

export function packageFiles(answers, pageHtml, { contact = 'hello@example.com', date = new Date() } = {}) {
  const a = normalise(answers);
  const d = draftCopy(a);
  const p = paletteById(a.palId);
  const offers = d.offers.length ? d.offers : ['—', '—', '—'];

  const copyMd = a.copyMode === 'file' && a.copyText.trim()
    ? `# Your words\n\nThis is what we read from your document. Edit freely.\n\n---\n\n${a.copyText.trim()}\n`
    : `# Your words

A first draft, written from your answers. Change anything.

## Headline
${d.headline}

## Underneath it
${d.sub}

## What you offer
${offers.map(o => '- ' + o).join('\n')}

## What you want people to do
${d.act}

## Contact
${d.contact || '(add your contact details)'}
`;

  const briefMd = `# Your brief

| | |
|---|---|
${brandOf(a) ? `| For | ${brandOf(a)} |\n` : ''}| You needed | ${KIND_LABEL[a.kind] || '—'} |
| The look | ${p.name} — ${p.mood.toLowerCase()} |
| Logo | ${logoSummary(a) || '—'} |
| Words | ${copySummary(a) || '—'} |
${a.logoMode === 'describe' && a.fields.logoWords ? `\n**Logo notes:** ${a.fields.logoWords}\n` : ''}
${a.logoStyle ? `**Logo type:** ${a.logoStyle}\n` : ''}
Approved on ${date.toLocaleDateString('en-GB')}.
`;

  const readme = `# ${d.name}

Everything here is yours to keep.

## The files

| File | What it is |
|---|---|
| \`index.html\` | Your page. Double-click it to open in any browser. |
| \`copy.md\` | Your words on their own, so you can edit them without touching the page. |
| \`BRIEF.md\` | What you chose, for your records. |

## Changing the words

Open \`index.html\` in any text editor and edit the text between the tags. The
wording in it is a first draft — replace it with your own.

## Putting it online

The page is a single file with nothing else to install, so almost anywhere works:

- **Netlify Drop** — drag the folder onto netlify.com/drop
- **GitHub Pages** — put \`index.html\` in a repository and turn Pages on
- **Your own host** — upload \`index.html\` by FTP

## Making changes later

Nothing here expires and nothing phones home. If you'd rather we made the
changes, get in touch: ${contact}
`;

  return [
    { name: 'index.html', text: pageHtml },
    { name: 'copy.md', text: copyMd },
    { name: 'BRIEF.md', text: briefMd },
    { name: 'README.md', text: readme },
  ];
}

/* A filename that is safe on every platform and still recognisably theirs. */
export function packageName(answers) {
  const a = normalise(answers);
  const slug = (brandOf(a) || 'my-project')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `${slug || 'my-project'}-files.zip`;
}

/* ---- Building the .zip -----------------------------------------------------
   Written by hand so there is no dependency on either side: CRC-32, per-file
   headers, a central directory and an end record. Entries are deflated with
   the platform's own CompressionStream — present in both browsers and Workers
   — and fall back to stored if that isn't available or doesn't actually help.
   Returns bytes rather than a Blob, because a Worker has to stream them into
   a Response and a Blob is the browser's concern. --------------------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

async function deflateRaw(u8) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(u8);
    writer.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
  } catch {
    return null;
  }
}

export async function makeZip(files) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;

  for (const f of files) {
    const data = enc.encode(f.text);
    const crc = crc32(data);
    let comp = await deflateRaw(data), method = 8;
    if (!comp || comp.length >= data.length) { comp = data; method = 0; }
    const name = enc.encode(f.name);

    const lh = new Uint8Array(30 + name.length);
    const dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true);
    dv.setUint16(8, method, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, comp.length, true); dv.setUint32(22, data.length, true);
    dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true);
    lh.set(name, 30);
    parts.push(lh, comp);

    const cd = new Uint8Array(46 + name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, method, true);
    cv.setUint16(12, 0, true); cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, comp.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    cd.set(name, 46);
    central.push(cd);
    offset += lh.length + comp.length;
  }

  const cdSize = central.reduce((n, c) => n + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);

  const all = [...parts, ...central, eocd];
  const total = all.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of all) { out.set(chunk, at); at += chunk.length; }
  return out;
}

/* Everything a delivery needs, in one call. */
export async function buildPackage(answers, css, opts) {
  const page = buildPage(answers, css);
  const files = packageFiles(answers, page, opts);
  return { page, files, zip: await makeZip(files), filename: packageName(answers) };
}
