/* ==========================================================================
   Shared runtime: language, theme, the four-question brief, and the page it
   builds. No build step, no dependencies — open the HTML files directly.
   ========================================================================== */
(function () {
  "use strict";

  var PALETTES = window.PALETTES || [];
  var KINDS = window.KINDS || [];
  var PLATFORM = window.PLATFORM || {};
  var DICT = window.I18N || { ar: {}, en: {} };

  var KEY = { lang: "qs.lang", theme: "qs.theme", used: "qs.used" };

  var store = {
    get: function (k, fallback) {
      try {
        var raw = localStorage.getItem(k);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    },
  };

  var lang = store.get(KEY.lang, "ar") === "en" ? "en" : "ar";
  var theme = store.get(KEY.theme, "dark") === "light" ? "light" : "dark";

  /* ------------------------------------------------------------ helpers -- */
  function t(key) {
    return (DICT[lang] && DICT[lang][key]) || (DICT.ar && DICT.ar[key]) || key;
  }
  /* Some dictionary entries are functions of one argument (a count baked into
     the sentence) rather than plain strings — this calls through either. */
  function tf(key, arg) {
    var v = (DICT[lang] && DICT[lang][key]) || (DICT.ar && DICT.ar[key]) || "";
    return typeof v === "function" ? v(arg) : String(v);
  }
  function tx(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.ar || value.en || "";
  }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function findPalette(id) { return PALETTES.filter(function (p) { return p.id === id; })[0] || null; }
  function findKind(id) { return KINDS.filter(function (k) { return k.id === id; })[0] || null; }

  /* Fire the same event at n8n. Fire-and-forget: the WhatsApp handoff must not
     wait on it, and a dead webhook must never cost the customer their page. */
  function postHook(url, payload) {
    if (!url) return;
    try {
      fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), keepalive: true, mode: "cors",
      }).catch(function () {});
    } catch (e) { /* offline, blocked, whatever — WhatsApp still works */ }
  }
  function waLink(text) {
    if (!PLATFORM.whatsapp) return "";
    return "https://wa.me/" + String(PLATFORM.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  }
  function usedCount() { return Math.max(0, parseInt(store.get(KEY.used, 0), 10) || 0); }
  function bumpUsed() { store.set(KEY.used, usedCount() + 1); }

  /* ---------------------------------------------------------- chrome ----- */
  function applyHtmlAttrs() {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "en" ? "ltr" : "rtl");
    document.documentElement.setAttribute("data-theme", theme);
  }

  function renderChrome() {
    var root = qs("[data-navbar]");
    if (!root) return;
    root.innerHTML =
      '<div class="shell navbar__in">' +
        '<a class="navbar__brand" href="' + (document.body.dataset.page === "brief" ? "index.html" : "#") + '">' +
          '<span class="navbar__mark">' + esc(tx(PLATFORM.mark)) + "</span>" + esc(tx(PLATFORM.name)) +
        "</a>" +
        '<span class="navbar__spacer"></span>' +
        '<div class="navbar__utility">' +
          '<button class="icon-btn" type="button" data-lang-toggle title="' + esc(t("nav.lang")) + '">' + (lang === "ar" ? "EN" : "AR") + "</button>" +
          '<button class="icon-btn" type="button" data-theme-toggle title="' + esc(t("nav.theme")) + '">' + (theme === "dark" ? "☀" : "☾") + "</button>" +
          '<a class="btn btn--primary btn--sm" href="brief.html">' + esc(t("nav.brief")) + "</a>" +
        "</div>" +
      "</div>";
    var langBtn = qs("[data-lang-toggle]", root);
    if (langBtn) langBtn.onclick = function () { lang = lang === "ar" ? "en" : "ar"; store.set(KEY.lang, lang); applyHtmlAttrs(); renderPage(); };
    var themeBtn = qs("[data-theme-toggle]", root);
    if (themeBtn) themeBtn.onclick = function () { theme = theme === "dark" ? "light" : "dark"; store.set(KEY.theme, theme); applyHtmlAttrs(); renderPage(); };
  }

  /* --------------------------------------------------------- landing ----- */
  function renderLanding() {
    var root = qs("[data-page-root]");
    if (!root) return;
    var free = PLATFORM.plans.free, paid = PLATFORM.plans.template;

    var howCards = [1, 2, 3, 4].map(function (n) {
      return '<div class="how-card"><span class="how-card__n">' + n + "</span><h3>" + esc(t("landing.how." + n + ".t")) +
             "</h3><p>" + esc(t("landing.how." + n + ".d")) + "</p></div>";
    }).join("");

    var freeLines = free.lines.map(function (l) { return "<li>" + esc(tx(l)) + "</li>"; }).join("");
    var paidLines = paid.lines.map(function (l) { return "<li>" + esc(tx(l)) + "</li>"; }).join("");

    root.innerHTML =
      '<section class="hero shell">' +
        '<div class="hero__stack">' +
          '<span class="eyebrow">' + esc(t("landing.eyebrow")) + "</span>" +
          "<h1>" + esc(t("landing.h1")) + "</h1>" +
          '<p class="hero__sub muted">' + esc(t("landing.sub")) + "</p>" +
          '<div class="hero__cta">' +
            '<a class="btn btn--primary btn--lg" href="brief.html">' + esc(t("landing.cta")) + "</a>" +
            '<a class="btn btn--outline btn--lg" href="brief.html">' + esc(t("landing.cta2")) + "</a>" +
          "</div>" +
          '<span class="free-tag">' + esc(t("landing.free.tag")) + "</span>" +
        "</div>" +
      "</section>" +

      '<section class="section section--muted">' +
        '<div class="shell">' +
          '<div class="section__head">' +
            '<span class="eyebrow">' + esc(t("landing.how.eyebrow")) + "</span>" +
            "<h2>" + esc(t("landing.how.h2")) + "</h2>" +
          "</div>" +
          '<div class="grid grid--4">' + howCards + "</div>" +
        "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="shell">' +
          '<div class="section__head">' +
            '<span class="eyebrow">' + esc(t("landing.pricing.eyebrow")) + "</span>" +
            "<h2>" + esc(t("landing.pricing.h2")) + "</h2>" +
          "</div>" +
          '<div class="grid grid--2">' +
            '<div class="price-card">' +
              "<h3>" + esc(tx(free.name)) + "</h3>" +
              '<div class="price-card__amount"><b>0</b><span class="muted">' + esc(tx(free.note)) + "</span></div>" +
              "<ul>" + freeLines + "</ul>" +
              '<a class="btn btn--outline btn--block" href="brief.html">' + esc(t("landing.pricing.free.cta")) + "</a>" +
            "</div>" +
            '<div class="price-card price-card--accent">' +
              "<h3>" + esc(tx(paid.name)) + "</h3>" +
              '<div class="price-card__amount"><b>' + paid.price + "</b><span class=\"muted\">" + esc(tx(paid.once)) + "</span></div>" +
              '<p class="muted" style="font-size:.84rem">' + esc(tx(paid.note)) + "</p>" +
              "<ul>" + paidLines + "</ul>" +
              '<a class="btn btn--primary btn--block" href="brief.html">' + esc(t("landing.pricing.paid.cta")) + "</a>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  /* ------------------------------------------------------------ brief ---- */
  var A = { kind: null, palId: null, fields: { name: "", what: "", who: "", why: "", offer: "", action: "", contact: "" } };

  function isReady() { return Boolean(A.kind && A.palId); }

  function draftCopy() {
    var f = A.fields;
    var name = (f.name || "").trim() || (lang === "ar" ? "اسمك هنا" : "Your name here");
    var what = (f.what || "").trim();
    var who = (f.who || "").trim();
    var why = (f.why || "").trim();
    var action = (f.action || "").trim() || (lang === "ar" ? "تواصل معنا" : "Get in touch");
    var contact = (f.contact || "").trim();
    var offers = (f.offer || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);

    var headline = why || what || name;
    var sub;
    if (who) {
      sub = (lang === "ar" ? "مصمّم من أجل " : "Made for ") + who + (lang === "ar" ? "." : ".");
    } else if (what && what !== headline) {
      sub = /[.!?…]$/.test(what) ? what : what + ".";
    } else {
      sub = lang === "ar" ? "سطر يشرح ما تقوم به ومَن يستفيد منه." : "A line about what you do and who it helps.";
    }
    return { name: name, headline: headline, sub: sub, offers: offers, action: action, contact: contact, who: who };
  }

  /* Builds the customer's own page as a full, self-contained document —
     right-to-left and in Arabic typography when that's the language chosen,
     never Arabic words poured into a left-to-right layout. Used for both the
     live preview (srcdoc) and the downloadable file, so they can never drift
     apart from each other. */
  function buildCustomerPage() {
    var pal = findPalette(A.palId);
    if (!pal) return null;
    var d = draftCopy();
    var rtl = lang === "ar";
    var offers = d.offers.length ? d.offers : (lang === "ar" ? ["ما تقدّمه", "شيء آخر", "شيء ثالث"] : ["Something you offer", "Something else", "A third thing"]);
    var fontStack = rtl
      ? '"Noto Kufi Arabic","Noto Naskh Arabic","Segoe UI",Tahoma,sans-serif'
      : '"Bricolage Grotesque","Segoe UI",system-ui,sans-serif';

    var css = "" +
      ":root{--a50:" + pal.c50 + ";--a100:" + pal.c100 + ";--a300:" + pal.c300 + ";--a500:" + pal.c500 +
      ";--a600:" + pal.c600 + ";--a700:" + pal.c700 + ";--on:" + pal.on + ";}" +
      "*{box-sizing:border-box}" +
      "body{margin:0;font-family:" + fontStack + ";background:" + (pal.dark ? "#14181F" : "#FFFFFF") + ";" +
        "color:" + (pal.dark ? "#F4F6F9" : "#14181F") + ";line-height:1.6;" + (rtl ? "letter-spacing:0" : "") + "}" +
      "a{color:inherit}" +
      "header{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 5vw;" +
        "border-bottom:1px solid " + (pal.dark ? "rgba(255,255,255,.12)" : "rgba(20,24,31,.10)") + "}" +
      ".brand{font-weight:800;font-size:1.05rem}" +
      ".btn{display:inline-block;padding:.75rem 1.4rem;border-radius:999px;font-weight:700;text-decoration:none;background:var(--a500);color:var(--on)}" +
      ".hero{padding:6vw 5vw;text-align:" + (rtl ? "right" : "left") + ";background:var(--a50)}" +
      ".eyebrow{display:inline-block;font-size:.72rem;font-weight:700;color:var(--a600);margin-bottom:.6rem;" +
        (rtl ? "" : "letter-spacing:.1em;text-transform:uppercase;") + "}" +
      "h1{font-size:clamp(1.8rem,1.2rem+2.6vw,3rem);font-weight:800;line-height:1.15;margin:0 0 .8rem;max-width:18ch;" +
        (rtl ? "" : "letter-spacing:-.02em;") + "}" +
      ".sub{font-size:1.05rem;max-width:56ch;opacity:.82;margin-bottom:1.4rem}" +
      "section.offers{padding:5vw}" +
      ".offers h2{font-size:1.6rem;margin:0 0 1.6rem}" +
      ".cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}" +
      "@media(max-width:760px){.cards{grid-template-columns:1fr}}" +
      ".card{border:1px solid " + (pal.dark ? "rgba(255,255,255,.14)" : "rgba(20,24,31,.10)") + ";border-radius:14px;padding:1.4rem}" +
      ".card b{display:block;font-size:1.02rem;margin-bottom:.4rem}" +
      ".cta{padding:5vw;text-align:center;background:var(--a600);color:var(--on)}" +
      ".cta h2{margin:0 0 .3rem}" +
      "footer{padding:2rem 5vw;font-size:.84rem;opacity:.65}";

    var body = "" +
      "<header><span class=\"brand\">" + esc(d.name) + "</span><a class=\"btn\" href=\"#contact\">" + esc(d.action) + "</a></header>" +
      "<section class=\"hero\">" +
        (d.who ? "<span class=\"eyebrow\">" + esc(d.who) + "</span><br>" : "") +
        "<h1>" + esc(d.headline) + "</h1>" +
        "<p class=\"sub\">" + esc(d.sub) + "</p>" +
        "<a class=\"btn\" href=\"#contact\">" + esc(d.action) + "</a>" +
      "</section>" +
      "<section class=\"offers\"><h2>" + (lang === "ar" ? "ما الذي نقدّمه" : "What we offer") + "</h2><div class=\"cards\">" +
        offers.map(function (o) { return "<div class=\"card\"><b>" + esc(o) + "</b>" +
          (lang === "ar" ? "جملة عن هذا." : "A sentence about this.") + "</div>"; }).join("") +
      "</div></section>" +
      "<section class=\"cta\" id=\"contact\"><h2>" + esc(d.action) + "</h2>" +
        (d.contact ? "<p>" + esc(d.contact) + "</p>" : "") +
      "</section>" +
      "<footer>" + esc(d.name) + (d.contact ? " · " + esc(d.contact) : "") + "</footer>";

    return "<!doctype html><html lang=\"" + lang + "\" dir=\"" + (rtl ? "rtl" : "ltr") + "\">" +
      "<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
      "<title>" + esc(d.name) + "</title><style>" + css + "</style></head><body>" + body + "</body></html>";
  }

  function slug(str) {
    return String(str || "page").toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "") || "page";
  }

  function renderPaletteGrid() {
    var host = qs("[data-pal-grid]");
    if (!host) return;
    host.innerHTML = PALETTES.map(function (p) {
      var pressed = A.palId === p.id;
      return '<button class="pal" type="button" data-pal="' + p.id + '" aria-pressed="' + pressed + '" ' +
        'style="--pal-500:' + p.c500 + ";--pal-600:" + p.c600 + ";--pal-on:" + p.on + ";--pal-ground:" + p.ground +
        (p.dark ? ";--pal-ink:#F4F6F9" : ";--pal-ink:#14181F") + '">' +
        '<div class="pal__demo">' +
          '<span class="pal__eyebrow">' + esc(t("brief.pal.heading")) + "</span>" +
          '<div class="pal__title">' + esc(t("brief.pal.line")) + "</div>" +
          '<div class="pal__sub">' + esc(t("brief.pal.sub")) + "</div>" +
          '<span class="pal__btn">' + esc(t("brief.pal.btn")) + "</span>" +
        "</div>" +
        '<div class="pal__strip"><span style="background:' + p.c500 + '"></span><span style="background:' + p.c600 + '"></span><span style="background:' + p.c700 + '"></span></div>' +
        '<div class="pal__name"><span>' + esc(tx(p.name)) + "</span>" + (p.tag ? '<span class="pal__tag">' + esc(tx(p.tag)) + "</span>" : "") + "</div>" +
      "</button>";
    }).join("");
    qsa("[data-pal]", host).forEach(function (btn) {
      btn.onclick = function () { A.palId = btn.getAttribute("data-pal"); renderBriefState(); };
    });
  }

  function updatePreview() {
    var frame = qs("[data-preview-frame]");
    var empty = qs("[data-preview-empty]");
    if (!frame || !empty) return;
    if (!isReady()) {
      frame.setAttribute("hidden", "");
      empty.removeAttribute("hidden");
      empty.textContent = t("brief.preview.empty");
      return;
    }
    var doc = buildCustomerPage();
    empty.setAttribute("hidden", "");
    frame.removeAttribute("hidden");
    frame.srcdoc = doc;
  }

  function updateUsageBar() {
    var bar = qs("[data-usage]");
    if (!bar) return;
    var used = usedCount();
    var free = PLATFORM.freeCount || 2;
    var remaining = Math.max(0, free - used);
    var price = PLATFORM.plans.template.price;
    bar.innerHTML = "<span>" + esc(remaining > 0 ? tf("brief.usage.free", remaining) : t("brief.usage.paid")) + "</span>" +
      (remaining > 0 ? "" : '<span class="usage-bar__price">' + price + "</span>");
  }

  function renderBriefState() {
    // Refresh only the parts that change with an answer, so focus and scroll
    // position in the open text fields are never disturbed by a full re-render.
    qsa("[data-kind-opt]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-kind-opt") === A.kind)); });
    renderPaletteGrid();
    updatePreview();
    updateUsageBar();
    var sendBtn = qs("[data-send]"), dlBtn = qs("[data-download]");
    if (sendBtn) sendBtn.disabled = !isReady();
    if (dlBtn) dlBtn.disabled = !isReady();
  }

  function renderBrief() {
    var root = qs("[data-page-root]");
    if (!root) return;

    var kindOpts = KINDS.map(function (k) {
      return '<button class="opt" type="button" data-kind-opt="' + k.id + '" aria-pressed="' + (A.kind === k.id) + '">' + esc(tx(k.name)) + "</button>";
    }).join("");

    root.innerHTML =
      '<div class="shell brief">' +
        '<div class="brief__head">' +
          '<span class="eyebrow">' + esc(t("brief.eyebrow")) + "</span>" +
          "<h1>" + esc(t("brief.h1")) + "</h1>" +
          '<p class="muted measure" style="margin-inline:auto">' + esc(t("brief.sub")) + "</p>" +
        "</div>" +
        '<div class="brief__grid">' +

          '<section class="qs">' +
            '<div class="qs__head"><span class="qs__n">' + t("brief.q1.n") + '</span><div><h3>' + esc(t("brief.q1.h")) + "</h3>" +
              '<p class="qs__hint">' + esc(t("brief.q1.hint")) + "</p></div></div>" +
            '<div class="opts">' + kindOpts + "</div>" +
            '<div class="field"><label for="f-name">' + esc(t("brief.name.label")) + '</label>' +
              '<input id="f-name" type="text" placeholder="' + esc(t("brief.name.ph")) + '" value="' + esc(A.fields.name) + '"></div>' +
          "</section>" +

          '<section class="qs">' +
            '<div class="qs__head"><span class="qs__n">' + t("brief.q2.n") + '</span><div><h3>' + esc(t("brief.q2.h")) + "</h3>" +
              '<p class="qs__hint">' + esc(t("brief.q2.hint")) + "</p></div></div>" +
            '<div class="pal-grid" data-pal-grid></div>' +
          "</section>" +

          '<section class="qs">' +
            '<div class="qs__head"><span class="qs__n">' + t("brief.q3.n") + '</span><div><h3>' + esc(t("brief.q3.h")) + "</h3>" +
              '<p class="qs__hint">' + esc(t("brief.q3.hint")) + "</p></div></div>" +
            '<div class="field--row">' +
              '<div class="field"><label for="f-what">' + esc(t("brief.what.label")) + '</label><input id="f-what" type="text" placeholder="' + esc(t("brief.what.ph")) + '" value="' + esc(A.fields.what) + '"></div>' +
              '<div class="field"><label for="f-who">' + esc(t("brief.who.label")) + '</label><input id="f-who" type="text" placeholder="' + esc(t("brief.who.ph")) + '" value="' + esc(A.fields.who) + '"></div>' +
            "</div>" +
            '<div class="field"><label for="f-why">' + esc(t("brief.why.label")) + '</label><input id="f-why" type="text" placeholder="' + esc(t("brief.why.ph")) + '" value="' + esc(A.fields.why) + '"></div>' +
            '<div class="field"><label for="f-offer">' + esc(t("brief.offer.label")) + '</label><textarea id="f-offer" rows="3" placeholder="' + esc(t("brief.offer.ph")) + '">' + esc(A.fields.offer) + "</textarea></div>" +
          "</section>" +

          '<section class="qs">' +
            '<div class="qs__head"><span class="qs__n">' + t("brief.q4.n") + '</span><div><h3>' + esc(t("brief.q4.h")) + "</h3>" +
              '<p class="qs__hint">' + esc(t("brief.q4.hint")) + "</p></div></div>" +
            '<div class="field--row">' +
              '<div class="field"><label for="f-action">' + esc(t("brief.action.label")) + '</label><input id="f-action" type="text" placeholder="' + esc(t("brief.action.ph")) + '" value="' + esc(A.fields.action) + '"></div>' +
              '<div class="field"><label for="f-contact">' + esc(t("brief.contact.label")) + '</label><input id="f-contact" type="text" placeholder="' + esc(t("brief.contact.ph")) + '" value="' + esc(A.fields.contact) + '"></div>' +
            "</div>" +
          "</section>" +

          '<div class="preview-wrap">' +
            '<div class="preview-wrap__bar"><span class="eyebrow">' + esc(t("brief.preview.eyebrow")) + '</span><span class="muted" style="font-size:.82rem">' + esc(t("brief.preview.hint")) + "</span></div>" +
            '<p class="preview-empty" data-preview-empty>' + esc(t("brief.preview.empty")) + "</p>" +
            '<iframe class="preview-frame" data-preview-frame title="preview" hidden></iframe>' +
          "</div>" +

          '<div class="usage-bar" data-usage></div>' +

          '<div class="brief__actions">' +
            '<button class="btn btn--primary btn--lg" type="button" data-send>' + esc(t("brief.send")) + "</button>" +
            '<button class="btn btn--outline" type="button" data-download>' + esc(t("brief.download")) + "</button>" +
          "</div>" +
          '<p class="brief__note" data-note></p>' +
        "</div>" +
      "</div>";

    // Kind buttons
    qsa("[data-kind-opt]").forEach(function (btn) {
      btn.onclick = function () { A.kind = btn.getAttribute("data-kind-opt"); renderBriefState(); };
    });
    // Text fields — read on every keystroke so the preview tracks live typing
    [["f-name", "name"], ["f-what", "what"], ["f-who", "who"], ["f-why", "why"], ["f-offer", "offer"], ["f-action", "action"], ["f-contact", "contact"]]
      .forEach(function (pair) {
        var el = qs("#" + pair[0]);
        if (el) el.oninput = function () { A.fields[pair[1]] = el.value; updatePreview(); };
      });

    qs("[data-send]").onclick = function () {
      var note = qs("[data-note]");
      if (!isReady()) { note.textContent = t("brief.incomplete"); return; }
      var btn = qs("[data-send]");
      btn.disabled = true;
      btn.textContent = t("brief.sending");

      var d = draftCopy();
      var pal = findPalette(A.palId);
      var kind = findKind(A.kind);
      var summary = (lang === "ar" ? "طلب صفحة جديدة من كويك سايت" : "New QuickSite page request") + "\n\n" +
        (lang === "ar" ? "الاسم: " : "Name: ") + d.name + "\n" +
        (lang === "ar" ? "النوع: " : "Kind: ") + (kind ? tx(kind.name) : A.kind) + "\n" +
        (lang === "ar" ? "المظهر: " : "Look: ") + (pal ? tx(pal.name) : A.palId) + "\n" +
        (lang === "ar" ? "يفعل: " : "What: ") + (A.fields.what || "—") + "\n" +
        (lang === "ar" ? "لمن: " : "Who: ") + (A.fields.who || "—") + "\n" +
        (lang === "ar" ? "التواصل: " : "Contact: ") + (A.fields.contact || "—");

      postHook(PLATFORM.briefWebhook, {
        created_at: new Date().toISOString(), lang: lang, kind: A.kind, palette: A.palId, fields: A.fields,
        used_before: usedCount(), free_count: PLATFORM.freeCount,
      });
      bumpUsed();
      updateUsageBar();

      var link = waLink(summary);
      if (link) window.open(link, "_blank", "noopener");
      note.textContent = t("brief.sent");
      btn.disabled = false;
      btn.textContent = t("brief.send");
    };

    qs("[data-download]").onclick = function () {
      var note = qs("[data-note]");
      if (!isReady()) { note.textContent = t("brief.incomplete"); return; }
      var doc = buildCustomerPage();
      var blob = new Blob([doc], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = slug(A.fields.name) + ".html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    };

    renderBriefState();
  }

  /* --------------------------------------------------------- dispatch ---- */
  function renderFooter() {
    var root = qs("[data-footer]");
    if (!root) return;
    root.innerHTML =
      "<small>" + esc(tx(PLATFORM.name)) + " — " + esc(t("landing.footer.rights")) + "</small>" +
      "<small>&copy; " + new Date().getFullYear() + "</small>";
  }

  function renderPage() {
    applyHtmlAttrs();
    renderChrome();
    renderFooter();
    var page = document.body.dataset.page;
    if (page === "brief") renderBrief();
    else renderLanding();
  }

  window.SiteApp = { render: renderPage };

  document.addEventListener("DOMContentLoaded", renderPage);
})();
