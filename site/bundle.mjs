/* Bundles the site into one self-contained HTML file.
   The multi-page version stays the source of truth; this build inlines the
   CSS and JS and swaps page navigation for hash routes, so the whole site can
   be hosted, shared, or previewed as a single file.

   Usage: node site/bundle.mjs [outfile]     (default: site/standalone.html)   */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, p), "utf8");
const out = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(here, "standalone.html");

const router = `
/* hash router: index.html -> #/ , store.html -> #/store , product.html?id=x -> #/product?id=x */
(function () {
  var PAGES = ["home", "store", "product"];

  function route() {
    var hash = window.location.hash.replace(/^#\\/?/, "");
    var page = hash.split("?")[0];
    document.body.dataset.page = PAGES.indexOf(page) === -1 ? "home" : page;
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
  document.body.dataset.page = PAGES.indexOf(initial) === -1 ? "home" : initial;
})();
`;

const html = `<title>Ahmed Alameri Storefront</title>
<meta name="description" content="صفحة روابط ومتجر منتجات رقمية — Arabic-first link-in-bio page and product store.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
${read("assets/css/styles.css")}
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
${read("assets/js/data.js")}
</script>
<script>
${read("assets/js/site.js")}
</script>
<script>
${router}
</script>
`;

writeFileSync(out, html, "utf8");
console.log(`wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
