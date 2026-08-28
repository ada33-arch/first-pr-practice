/* Bundles the site into one self-contained HTML file.
   The multi-page version stays the source of truth; this build inlines the
   CSS and JS and swaps page navigation for hash routes, so the whole site can
   be hosted, shared, or previewed as a single file.

   Usage: node projects/rentstore/code/bundle.mjs [outfile]
              (default: projects/rentstore/standalone.html)   */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, p), "utf8");
const out = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(here, "../standalone.html");

const router = `
/* hash router: index.html -> #/ , demo.html -> #/demo , product.html?id=x -> #/product?id=x */
(function () {
  /* hash segment -> the body\'s data-page value */
  var ROUTES = {
    "": "landing",
    signup: "signup",
    setup: "setup",
    demo: "home",
    store: "store",
    product: "product",
  };

  function route() {
    var hash = window.location.hash.replace(/^#\\/?/, "");
    var page = hash.split("?")[0];
    document.body.dataset.page = ROUTES[page] || "landing";
    if (window.SiteApp) window.SiteApp.render();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (ev) {
    var link = ev.target.closest && ev.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href.indexOf(".html") === -1 || /^(https?:|mailto:)/.test(href)) return;
    ev.preventDefault();
    window.location.hash = "#/" + href.replace("index.html", "").replace(".html", "");
  });

  window.addEventListener("hashchange", route);

  /* set the starting page synchronously — site.js reads body.dataset.page
     in its own DOMContentLoaded handler, which is registered before this one */
  var initial = window.location.hash.replace(/^#\\/?/, "").split("?")[0];
  document.body.dataset.page = ROUTES[initial] || "landing";
})();
`;

const html = `<title>RentStore</title>
<meta name="description" content="منصّة عربية: صفحة روابط مجانية، ومتجر باشتراك شهري بسيط.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${read("../design/styles.css")}
</style>
<script>
  /* the site carries its own theme + language switch, applied before first paint */
  try {
    var th = JSON.parse(localStorage.getItem("nzm.theme") || '"dark"');
    var lg = JSON.parse(localStorage.getItem("nzm.lang") || '"ar"');
    document.documentElement.setAttribute("data-theme", th === "light" ? "light" : "dark");
    document.documentElement.setAttribute("lang", lg === "en" ? "en" : "ar");
    document.documentElement.setAttribute("dir", lg === "en" ? "ltr" : "rtl");
  } catch (e) {}
</script>

<div class="page" data-page-root></div>

<script>
${read("../content/data.js")}
</script>
<script>
${read("./site.js")}
</script>
<script>
${router}
</script>
`;

writeFileSync(out, html, "utf8");
console.log(`wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
