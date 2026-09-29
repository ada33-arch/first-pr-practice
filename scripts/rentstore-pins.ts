// Turn the rentstore catalogue into Pinterest pins.
//
// None of the products has a photo yet (`image: ""` in content/data.js), and
// Pinterest will not take a pin without one, so each pin is drawn here from the
// product's own `art` colours: the same bottle the store renders, at poster
// size, with the Arabic name first, the English under it, and the real price.
//
// Usage:
//   npm run pins -- render                        # out/pins/<id>.png + out/pins/index.html contact sheet
//   npm run pins -- post <board_id>               # post the next product not yet on that board
//   npm run pins -- post <board_id> --all         # post every remaining product
//   npm run pins -- post <board_id> --dry-run     # print the payloads, call nothing
//
// `post` defaults to one pin per run on purpose: run it daily (cron, n8n, a
// Routine) and the board fills at the steady pace Pinterest's feed rewards,
// instead of six near-identical pins landing in the same minute.
//
// Each pin links to product.html?id=<id> under RENTSTORE_URL (or --site),
// tagged utm_source=pinterest&utm_content=<id>, so your analytics can say
// which scent the traffic came for. Posted pins are recorded in
// .pinterest-posted.json, keyed by API host + board, so a re-run never
// double-posts and sandbox posts never block the real board.
//
// Rendering needs a Chromium: CHROME_PATH, a `npx playwright install chromium`
// browser, or an installed Google Chrome, tried in that order.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { join } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { API, bearer, call } from "./pinterest.js";

type Text = { ar: string; en: string };
type Product = {
  id: string;
  category: Text;
  title: Text;
  desc: Text;
  notes: Text;
  price: number;
  badge: Text | null;
  art: { oil: string; cap: string; from: string; to: string };
};

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "out", "pins");
const LEDGER = join(ROOT, ".pinterest-posted.json");

// data.js assigns to window.*; run it against a stub instead of parsing it.
const win: { PLATFORM?: { domain: string }; SITE?: { handle: string; currency: Text; products: Product[] } } = {};
runInNewContext(readFileSync(join(ROOT, "projects/rentstore/content/data.js"), "utf8"), { window: win });
const SITE = win.SITE!;
const DOMAIN = win.PLATFORM?.domain ?? "";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const arDigits = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]!);

// The store's bottle (code/site.js bottleSVG), same geometry, drawn larger.
function bottle(p: Product): string {
  const { oil, cap } = p.art;
  return `<svg viewBox="0 0 120 172" width="488" height="700" fill="none" aria-hidden="true">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${oil}" stop-opacity=".95"/><stop offset="1" stop-color="${oil}" stop-opacity=".6"/>
    </linearGradient></defs>
    <rect x="50" y="6" width="20" height="20" rx="6" fill="${cap}"/>
    <rect x="55" y="24" width="10" height="16" fill="${cap}" opacity=".8"/>
    <path d="M46 36h28a14 14 0 0 1 14 14v96a14 14 0 0 1-14 14H46a14 14 0 0 1-14-14V50a14 14 0 0 1 14-14z"
      fill="url(#g)" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>
    <rect x="39" y="58" width="6" height="56" rx="3" fill="#fff" opacity=".18"/>
    <rect x="32" y="112" width="56" height="1.5" fill="#fff" opacity=".16"/>
  </svg>`;
}

// 1000x1500 is Pinterest's 2:3. Palette and type are projects/rentstore/DESIGN.md:
// champagne on warm near-black, Plex Arabic first, Bricolage for the Latin display.
const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=IBM+Plex+Sans:wght@500&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap";
const CSS = `
  :root { --ground:#0c0a09; --ink:#f7f2e8; --soft:#aca396; --accent:#d8b475; --on-accent:#1a1508; }
  * { margin:0; box-sizing:border-box; }
  body { background:var(--ground); }
  .pin { width:1000px; height:1500px; display:flex; flex-direction:column; background:var(--ground);
         color:var(--ink); font-family:"IBM Plex Sans Arabic","IBM Plex Sans",sans-serif; overflow:hidden; }
  .stage { position:relative; height:880px; display:grid; place-items:center; }
  .stage svg { filter:drop-shadow(0 40px 60px rgba(0,0,0,.55)); }
  .badge { position:absolute; inset-block-start:56px; inset-inline-start:56px; background:var(--accent);
           color:var(--on-accent); font-weight:700; font-size:30px; padding:10px 26px; border-radius:999px; }
  .words { flex:1; padding:56px 72px 0; display:flex; flex-direction:column; }
  .cat { color:var(--accent); font-weight:500; font-size:30px; }
  h1 { font-weight:700; font-size:112px; line-height:1.22; letter-spacing:-.015em; margin-block-start:6px; }
  .en { font-family:"Bricolage Grotesque",sans-serif; font-weight:700; font-size:52px; color:var(--soft);
        line-height:1.1; direction:ltr; text-align:end; }
  .notes { font-size:34px; line-height:1.65; color:var(--soft); margin-block-start:24px; }
  .foot { margin-block-start:auto; padding:32px 0 56px; border-block-start:1.5px solid rgba(216,180,117,.35);
          display:flex; justify-content:space-between; align-items:baseline; }
  .price { font-size:64px; font-weight:700; color:var(--accent); }
  .price small { font-size:30px; font-weight:500; color:var(--soft); }
  .where { font-family:"IBM Plex Sans",sans-serif; font-weight:500; font-size:30px; color:var(--soft); direction:ltr; }`;

function pinHTML(p: Product): string {
  return `<section class="pin" id="${esc(p.id)}" dir="rtl" lang="ar">
    <div class="stage" style="background:linear-gradient(150deg,${p.art.from},${p.art.to})">
      ${p.badge ? `<span class="badge">${esc(p.badge.ar)}</span>` : ""}
      ${bottle(p)}
    </div>
    <div class="words">
      <p class="cat">${esc(p.category.ar)}</p>
      <h1>${esc(p.title.ar)}</h1>
      <p class="en" lang="en">${esc(p.title.en)}</p>
      <p class="notes">${esc(p.notes.ar)}</p>
      <div class="foot">
        <p class="price">${arDigits(p.price)} ${esc(SITE.currency.ar)} <small>· اطلبه واتساب</small></p>
        <p class="where" lang="en">${esc(DOMAIN)}/@${esc(SITE.handle)}</p>
      </div>
    </div>
  </section>`;
}

const page = (body: string, head = "") => `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>RentStore pins</title>
  ${head}</head><body>${body}</body></html>`;

// Fetch the web fonts once and inline them, so the browser renders offline and
// never screenshots a pin before its Arabic face has arrived.
async function inlineFonts(): Promise<string> {
  const get = async (url: string, headers: Record<string, string> = {}) => {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res;
  };
  // Google serves woff2 only to a browser it recognises.
  let css = await (await get(FONTS, { "User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36" })).text();
  for (const url of new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) ?? [])) {
    const b64 = Buffer.from(await (await get(url)).arrayBuffer()).toString("base64");
    css = css.replaceAll(url, `data:font/woff2;base64,${b64}`);
  }
  return css;
}

async function launch(): Promise<Browser> {
  const tries = [
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : null,
    {},
    { channel: "chrome" },
  ].filter((o) => o !== null);
  for (const opts of tries) {
    try {
      return await chromium.launch(opts);
    } catch {
      // try the next browser
    }
  }
  console.error("no Chromium found: set CHROME_PATH, run `npx playwright install chromium`, or install Google Chrome");
  process.exit(2);
}

async function render(products: Product[]): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  let fonts: string;
  try {
    fonts = await inlineFonts();
  } catch (err) {
    // A pin in a fallback face would go out under the brand; stop instead.
    console.error(`could not fetch the pin fonts (${(err as Error).message}); nothing rendered`);
    process.exit(1);
  }
  const browser = await launch();
  const tab = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
  for (const p of products) {
    await tab.setContent(page(pinHTML(p), `<style>${fonts}${CSS}</style>`));
    await tab.evaluate("document.fonts.ready");
    await tab.locator(".pin").screenshot({ path: join(OUT, `${p.id}.png`) });
    console.log(`rendered out/pins/${p.id}.png`);
  }
  await browser.close();

  // A contact sheet: every pin at a third of its size, to eyeball the set before posting.
  const sheet = `.sheet{display:flex;flex-wrap:wrap;gap:24px;padding:24px;justify-content:center}
    .sheet img{width:min(333px,100%);height:auto;border-radius:16px}`;
  const imgs = products.map((p) => `<img src="${esc(p.id)}.png" alt="${esc(p.title.en)} pin">`).join("");
  writeFileSync(join(OUT, "index.html"), page(`<main class="sheet">${imgs}</main>`, `<style>body{background:#0c0a09}${sheet}</style>`));
  console.log("contact sheet: out/pins/index.html");
}

function pinPayload(p: Product, boardId: string, site: string | undefined) {
  const link = site
    ? `${site.replace(/\/$/, "")}/product.html?${new URLSearchParams({
        id: p.id, utm_source: "pinterest", utm_medium: "social", utm_campaign: "rentstore-pins", utm_content: p.id,
      })}`
    : undefined;
  return {
    board_id: boardId,
    title: `${p.title.ar} · ${p.title.en}`,
    description: `${p.desc.ar}\n\n${p.desc.en}\n\n${p.notes.en} · ${p.price} AED · order on WhatsApp`,
    alt_text: `${p.title.en}: an illustrated ${p.category.en.toLowerCase()} perfume-oil bottle. Notes: ${p.notes.en.replaceAll(" · ", ", ")}. ${p.price} AED.`,
    ...(link ? { link } : {}),
  };
}

type Ledger = Record<string, { pin_id: string; posted_at: string }>;

async function post(boardId: string, flags: Set<string>, site: string | undefined): Promise<void> {
  const ledger: Ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : {};
  const key = (p: Product) => `${new URL(API).host}/${boardId}/${p.id}`;
  const waiting = SITE.products.filter((p) => !ledger[key(p)]);
  const batch = flags.has("--all") ? waiting : waiting.slice(0, 1);

  if (batch.length === 0) {
    console.log(`all ${SITE.products.length} products are already on board ${boardId}`);
    return;
  }
  if (!site) console.warn("no RENTSTORE_URL or --site: pins will go up without a link back to the store");

  const missing = batch.filter((p) => !existsSync(join(OUT, `${p.id}.png`)));
  if (missing.length) await render(missing);

  for (const p of batch) {
    const payload = pinPayload(p, boardId, site);
    if (flags.has("--dry-run")) {
      console.log(JSON.stringify({ ...payload, media_source: `<out/pins/${p.id}.png>` }, null, 2));
      continue;
    }
    const pin = (await call("/pins", {
      method: "POST",
      headers: { ...bearer(), "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        media_source: {
          source_type: "image_base64",
          content_type: "image/png",
          data: readFileSync(join(OUT, `${p.id}.png`)).toString("base64"),
        },
      }),
    })) as { id: string };
    ledger[key(p)] = { pin_id: pin.id, posted_at: new Date().toISOString() };
    writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n");
    console.log(`pinned ${p.id} -> https://www.pinterest.com/pin/${pin.id}/`);
  }
  const left = waiting.length - batch.length;
  if (!flags.has("--dry-run")) console.log(left ? `${left} still to post` : "board is complete");
}

const usage = "usage: npm run pins -- render | post <board_id> [--all] [--dry-run] [--site https://your-store]";

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  const siteAt = rest.indexOf("--site");
  const site = siteAt >= 0 ? rest.splice(siteAt, 2)[1] : process.env.RENTSTORE_URL;
  const flags = new Set(rest.filter((a) => a.startsWith("--")));
  const [boardId] = rest.filter((a) => !a.startsWith("--"));

  if (cmd === "render") return render(SITE.products);
  if (cmd === "post" && boardId) return post(boardId, flags, site);
  console.error(usage);
  process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
