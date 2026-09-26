/* ==========================================================================
   RentStore.ae — rendering only. No copy lives here; every string comes
   from content/data.js. No colour lives here; every colour is a token in
   design/styles.css.

   Phase 1B: the seven public pages. There is no backend. The spec (§5, and
   the Phase 1B DoD in §13) requires that search, filters and the listing
   form do not pretend to do work that no service performs, so each of them
   answers with a plain notice instead of a fake result or a fake success.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.RS;
  if (!D) return;

  /* ------------------------------------------------------------ utils -- */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    shop: '<path d="M4 9h16l-1 11H5L4 9z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6l8-3z"/><path d="m9 12 2 2 4-4"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.8"/>',
    heart: '<path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7-1.2c0 4.9-7 9.2-7 9.2z"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M17 11a3 3 0 1 0-1.5-5.6"/>',
    lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  /* An image slot with nothing approved to put in it. The spec forbids
     generating or substituting imagery, so the slot keeps the composition
     and says what is missing rather than showing something invented. */
  function mediaSlot(note) {
    return '<div class="media-pending"></div>' +
      '<span class="pending-chip">' + icon("layers") + esc(note || D.notices.imagePending) + "</span>";
  }

  function toast(msg) {
    var t = qs(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add("is-on"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 5200);
  }

  /* ----------------------------------------------------------- header --
     One header, identical on all seven pages (spec §4). */
  function header(active) {
    var links = D.nav.map(function (item) {
      var cur = item.key === active ? ' aria-current="page"' : "";
      return '<a class="hdr__link" href="' + D.routes[item.key] + '"' + cur + ">" +
        esc(item.label) + "</a>";
    }).join("");

    return '<header class="hdr">' +
      '<div class="hdr__in">' +
        '<a class="brand" href="' + D.routes.home + '">' +
          '<span class="brand__mark">' + esc(D.brand.mark) + "</span>" +
          '<span class="brand__text">' +
            '<span class="brand__name">' + esc(D.brand.name) + "</span>" +
            '<span class="brand__tag">' + esc(D.brand.taglineEn) + "</span>" +
          "</span>" +
        "</a>" +
        '<button class="hdr__icon hdr__burger" type="button" data-burger ' +
          'aria-expanded="false" aria-controls="rs-nav" aria-label="Menu">' +
          icon("menu") + "</button>" +
        '<nav class="hdr__nav" id="rs-nav">' + links +
          /* Shown only inside the mobile panel; on desktop these same two
             controls sit in the tools bar. See styles.css .hdr__nav-extra. */
          '<span class="hdr__nav-extra">' +
            '<button class="hdr__link" type="button" data-lang>' + esc(D.navArabic) + "</button>" +
            '<button class="hdr__link" type="button" data-login>' + esc(D.navLogin) + "</button>" +
          "</span>" +
        "</nav>" +
        '<div class="hdr__tools">' +
          '<button class="hdr__icon" type="button" data-search-open aria-label="Search">' +
            icon("search") + "</button>" +
          '<button class="hdr__plain" type="button" data-lang>' + esc(D.navArabic) + "</button>" +
          '<button class="hdr__plain" type="button" data-login>' + esc(D.navLogin) + "</button>" +
          '<a class="btn btn--gold btn--sm" href="' + D.routes.list + '">' +
            esc(D.navCta) + icon("arrow") + "</a>" +
        "</div>" +
      "</div>" +
    "</header>";
  }

  function footer() {
    return '<footer class="ft"><div class="shell ft__in">' +
      "<span>" + esc(D.footer.line) + "</span>" +
      '<span class="ft__note">' + esc(D.footer.note) + "</span>" +
    "</div></footer>";
  }

  /* --------------------------------------------------------- fragments -- */
  function searchBar(locLabel, placeholder) {
    return '<form class="searchbar" data-search novalidate>' +
      '<button class="searchbar__loc" type="button" data-loc>' +
        icon("pin") + esc(locLabel) + "</button>" +
      '<label class="sr-only" for="rs-q">' + esc(placeholder) + "</label>" +
      '<input id="rs-q" name="q" type="search" placeholder="' + esc(placeholder) + '">' +
      '<button class="arrow-btn" type="submit" aria-label="Search">' + icon("arrow") + "</button>" +
    "</form>";
  }

  function chips(list, pressedFirst) {
    return '<div class="chips" role="group">' + list.map(function (label, i) {
      var on = pressedFirst && i === 0 ? "true" : "false";
      return '<button class="chip" type="button" data-chip aria-pressed="' + on + '">' +
        esc(label) + "</button>";
    }).join("") + "</div>";
  }

  function sampleNote() {
    return '<p class="sample-note">' + esc(D.notices.sample) +
      " <span>" + esc(D.notices.sampleExplain) + "</span></p>";
  }

  function heroTitle(white, gold) {
    return "<h1>" + esc(white) + '<span class="gold">' + esc(gold) + "</span></h1>";
  }

  /* ============================================================ 01 Home == */
  function renderHome(root) {
    var h = D.home;
    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          '<p class="hero__eyebrow">' + esc(h.eyebrow) + "</p>" +
          heroTitle(h.titleWhite, h.titleGold) +
          '<p class="hero__lede">' + esc(h.lede) + "</p>" +
          searchBar(h.locationLabel, h.searchPlaceholder) +
          chips(h.categories, false) +
          '<div class="explore-cue">' +
            "<span>" + esc(h.explore) + "</span>" +
            '<a class="arrow-btn" href="#platform" aria-label="' + esc(h.explore) + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M12 5v14M6 13l6 6 6-6"/></svg></a>' +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="band band--navy-deep" id="platform"><div class="shell split">' +
        "<div>" +
          "<h2>" + esc(h.platformTitleWhite) +
            '<span class="gold">' + esc(h.platformTitleGold) + "</span></h2>" +
          '<a class="btn btn--gold" href="' + D.routes.stores + '" style="margin-top:1.4rem">' +
            esc(h.platformCta) + icon("arrow") + "</a>" +
        "</div>" +
        '<div class="pillars">' + h.pillars.map(function (p, i) {
          var ic = ["shop", "map", "shield", "spark"][i];
          return '<div class="pillar">' +
            '<div class="pillar__icon">' + icon(ic) + "</div>" +
            "<h3>" + esc(p.title) + "</h3><p>" + esc(p.body) + "</p></div>";
        }).join("") + "</div>" +
      "</div></section>";
  }

  /* ========================================================== 02 Stores == */
  function renderStores(root) {
    var s = D.stores;
    var title = s.titleLines.map(function (l) {
      return l.gold ? '<span class="gold">' + esc(l.text) + "</span>" : esc(l.text) + "<br>";
    }).join("");

    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          '<p class="hero__eyebrow">' + esc(s.eyebrow) + "</p>" +
          "<h1>" + title + "</h1>" +
          '<p class="hero__lede">' + esc(s.lede) + "</p>" +
          searchBar(s.locationLabel, s.searchPlaceholder) +
          chips(s.filters, true) +
          '<div class="stats">' + s.stats.map(function (st) {
            return '<div class="stat"><div class="stat__v">' + esc(st.value) + "</div>" +
              '<div class="stat__l">' + esc(st.label) + "</div></div>";
          }).join("") + "</div>" +
          sampleNote() +
        "</div>" +
      "</section>" +

      '<section class="band band--white on-ivory"><div class="shell">' +
        '<div class="sect-head"><div><h2>' + esc(s.locationsTitle) + "</h2>" +
          "<p>" + esc(s.locationsLede) + "</p></div>" +
          '<a class="link-gold" href="#">' + esc(s.locationsCta) + icon("arrow") + "</a></div>" +
        '<div class="grid grid--6">' + s.locations.map(function (l) {
          return '<a class="loc" href="#">' + mediaSlot("Photo pending") +
            '<span class="loc__scrim"></span>' +
            '<span class="loc__label"><span class="loc__name">' + esc(l.name) + "</span><br>" +
            '<span class="loc__count">' + esc(l.count) + "</span></span></a>";
        }).join("") + "</div>" +
      "</div></section>" +

      '<section class="band band--ivory on-ivory"><div class="shell">' +
        '<div class="sect-head"><div><h2>' + esc(s.featuredTitle) + "</h2>" +
          "<p>" + esc(s.featuredLede) + "</p></div>" +
          '<a class="link-gold" href="#">' + esc(s.featuredCta) + icon("arrow") + "</a></div>" +
        '<div class="grid grid--3">' + s.featured.map(function (f) {
          return '<article class="card">' +
            '<div class="card__media">' + mediaSlot("Photo pending") + "</div>" +
            '<div class="card__body">' +
              '<h3 class="card__title">' + esc(f.type) + "</h3>" +
              '<p class="card__where">' + esc(f.where) + "</p>" +
              '<div class="card__meta">' + f.meta.map(function (m) {
                return '<span class="card__tag">' + esc(m) + "</span>";
              }).join("") + "</div>" +
              '<div class="card__foot">' +
                '<span class="card__price">' + esc(f.price) +
                  "<small>" + esc(f.period) + "</small></span>" +
                '<button class="arrow-btn arrow-btn--sm" type="button" data-nofunc ' +
                  'aria-label="View ' + esc(f.type) + '">' + icon("arrow") + "</button>" +
              "</div>" +
            "</div></article>";
        }).join("") + "</div>" +
        sampleNote() +
      "</div></section>";
  }

  /* ==================================================== 03 How It Works == */
  function renderHow(root) {
    var h = D.how;
    root.innerHTML =
      '<section class="hero hero--center">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          '<p class="hero__eyebrow">' + esc(h.eyebrow) + "</p>" +
          heroTitle(h.titleWhite, h.titleGold) +
          '<p class="hero__lede">' + esc(h.lede) + "</p>" +
        "</div>" +
      "</section>" +

      '<section class="band band--ivory-pale on-ivory"><div class="shell">' +
        '<div class="steps">' + h.steps.map(function (st) {
          return '<div class="step">' +
            '<div class="step__media">' + mediaSlot("Photo pending") + "</div>" +
            '<div class="step__n">' + esc(st.n) + "</div>" +
            "<h3>" + esc(st.title) + "</h3><p>" + esc(st.body) + "</p></div>";
        }).join("") + "</div>" +
      "</div></section>" +

      '<section class="band band--navy"><div class="shell closing">' +
        "<h2>" + esc(h.closingTitle) + "</h2>" +
        "<p>" + esc(h.closingBody) + "</p>" +
        '<a class="btn btn--gold" href="' + D.routes.stores + '">' +
          esc(h.closingCta) + icon("arrow") + "</a>" +
      "</div></section>";
  }

  /* ================================================= 04 Success Stories == */
  function renderSuccess(root) {
    var s = D.success;
    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          '<p class="hero__eyebrow">' + esc(s.eyebrow) + "</p>" +
          heroTitle(s.titleWhite, s.titleGold) +
          '<p class="hero__lede">' + esc(s.lede) + "</p>" +
          chips(s.filters, true) +
        "</div>" +
      "</section>" +

      '<section class="band band--ivory-warm on-ivory"><div class="shell quote">' +
        '<div class="quote__media">' + mediaSlot("Portrait pending") + "</div>" +
        "<div><blockquote>&ldquo;" + esc(s.quote) + "&rdquo;</blockquote>" +
        '<p class="quote__who">' +
          (s.quoteAttribution
            ? esc(s.quoteAttribution)
            : "Attribution pending. No name is shown until the person it belongs to has approved it.") +
        "</p></div>" +
      "</div></section>" +

      '<section class="band band--white on-ivory"><div class="shell">' +
        '<div class="grid grid--3">' + s.stories.map(function (st) {
          return '<article class="card">' +
            '<div class="card__media">' + mediaSlot("Photo pending") + "</div>" +
            '<div class="card__body"><h3 class="card__title">' + esc(st.title) + "</h3></div>" +
          "</article>";
        }).join("") + "</div>" +
      "</div></section>" +

      '<section class="band band--navy"><div class="shell closing">' +
        "<h2>" + esc(s.closingTitle) + "</h2>" +
        '<a class="btn btn--gold" href="' + D.routes.list + '">' +
          esc(s.closingCta) + icon("arrow") + "</a>" +
      "</div></section>";
  }

  /* ======================================================= 05 Resources == */
  function renderResources(root) {
    var r = D.resources;
    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          heroTitle(r.titleWhite, r.titleGold) +
          '<p class="hero__lede">' + esc(r.lede) + "</p>" +
          '<form class="searchbar" data-search novalidate>' +
            '<label class="sr-only" for="rs-qa">' + esc(r.searchPlaceholder) + "</label>" +
            '<input id="rs-qa" name="q" type="search" placeholder="' +
              esc(r.searchPlaceholder) + '">' +
            '<button class="arrow-btn" type="submit" aria-label="Search">' +
              icon("arrow") + "</button></form>" +
          chips(r.filters, false) +
        "</div>" +
      "</section>" +

      '<section class="band band--ivory-pale on-ivory">' +
        '<div class="shell split split--rail">' +
        '<div class="grid grid--3">' + r.articles.map(function (a) {
          return '<article class="card">' +
            '<div class="card__media">' + mediaSlot("Photo pending") + "</div>" +
            '<div class="card__body">' +
              '<h3 class="card__title">' + esc(a.title) + "</h3>" +
              '<p class="card__where">' + esc(a.body) + "</p>" +
              '<p class="card__meta" style="margin-bottom:0">' +
                '<span class="card__tag">' + esc(a.read) + "</span></p>" +
            "</div></article>";
        }).join("") + "</div>" +
        "<div><h2 style=\"font-size:1.15rem;margin-bottom:.9rem\">" +
          esc(r.helpfulTitle) + "</h2>" +
          '<nav class="rail">' + r.helpful.map(function (x) {
            return '<a href="#" data-nofunc>' + esc(x) + icon("arrow") + "</a>";
          }).join("") + "</nav></div>" +
      "</div></section>";
  }

  /* =========================================================== 06 About == */
  function renderAbout(root) {
    var a = D.about;
    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell hero__body">' +
          heroTitle(a.titleWhite, a.titleGold) +
          '<p class="hero__lede">' + esc(a.lede) + "</p>" +
          '<a class="btn btn--ghost" href="#mvv" style="margin-top:1.5rem">' +
            esc(a.cta) + icon("arrow") + "</a>" +
        "</div>" +
      "</section>" +

      '<section class="band band--ivory-warm on-ivory" id="mvv"><div class="shell mvv">' +
        "<div>" + '<div class="mvv__icon">' + icon("target") + "</div>" +
          "<h3>" + esc(a.mission.title) + "</h3><p>" + esc(a.mission.body) + "</p></div>" +
        "<div>" + '<div class="mvv__icon">' + icon("eye") + "</div>" +
          "<h3>" + esc(a.vision.title) + "</h3><p>" + esc(a.vision.body) + "</p></div>" +
        "<div>" + '<div class="mvv__icon">' + icon("heart") + "</div>" +
          "<h3>" + esc(a.valuesTitle) + "</h3><ul>" + a.values.map(function (v) {
            return "<li>" + esc(v) + "</li>";
          }).join("") + "</ul></div>" +
      "</div></section>" +

      '<section class="band band--navy"><div class="shell closing">' +
        "<h2>" + esc(a.closingTitle) + "</h2>" +
        "<p>" + esc(a.closingBody) + "</p>" +
        '<a class="btn btn--gold" href="' + D.routes.stores + '">' +
          esc(a.closingCta) + icon("arrow") + "</a>" +
      "</div></section>";
  }

  /* ================================================= 07 List Your Space == */
  function renderList(root) {
    var l = D.list;
    root.innerHTML =
      '<section class="hero">' +
        mediaSlot("Hero photograph pending") +
        '<div class="hero__wash"></div>' +
        '<div class="shell split" style="align-items:center">' +
          '<div class="hero__body">' +
            heroTitle(l.titleWhite, l.titleGold) +
            '<p class="hero__lede">' + esc(l.lede) + "</p>" +
            '<div class="benefits" style="margin-top:2rem">' + l.benefits.map(function (b, i) {
              var ic = ["users", "layers", "lock"][i];
              return '<div class="benefit"><div class="benefit__icon">' + icon(ic) + "</div>" +
                "<div><h3>" + esc(b.title) + "</h3><p>" + esc(b.body) + "</p></div></div>";
            }).join("") + "</div>" +
          "</div>" +

          '<form class="form-card on-ivory" data-listing novalidate>' +
            "<h2>" + esc(l.formTitle) + "</h2>" +
            l.fields.map(function (f) {
              var id = "rs-" + f.name;
              var control = f.kind === "select"
                /* The option lists are Not Yet Defined (spec §5), so the
                   control is present and disabled rather than filled with
                   invented types, emirates or dates. */
                ? '<select id="' + id + '" name="' + f.name + '" disabled>' +
                    '<option>' + esc(f.placeholder) + "</option></select>"
                : '<input id="' + id + '" name="' + f.name + '" type="text" placeholder="' +
                    esc(f.placeholder) + '">';
              return '<div class="field"><label for="' + id + '">' + esc(f.label) +
                "</label>" + control + "</div>";
            }).join("") +
            '<button class="btn btn--gold" type="submit" style="width:100%">' +
              esc(l.submit) + icon("arrow") + "</button>" +
            '<p class="form-note">' + esc(l.noBackendNotice) + "</p>" +
          "</form>" +
        "</div>" +
      "</section>";
  }

  /* ---------------------------------------------------------- wiring -- */
  var PAGES = {
    home: renderHome,
    stores: renderStores,
    how: renderHow,
    success: renderSuccess,
    resources: renderResources,
    about: renderAbout,
    list: renderList,
  };

  function wire() {
    /* Chips select visually. They do not filter, because there is no
       inventory to filter and a chip that silently changes nothing is
       worse than one that says so. */
    document.addEventListener("click", function (ev) {
      var chip = ev.target.closest("[data-chip]");
      if (chip) {
        var group = chip.parentElement;
        Array.prototype.forEach.call(group.querySelectorAll("[data-chip]"), function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        toast("Filtering is not connected yet. No listing service has been defined.");
        return;
      }

      if (ev.target.closest("[data-burger]")) {
        var burger = ev.target.closest("[data-burger]");
        var nav = qs("#rs-nav");
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
        return;
      }

      if (ev.target.closest("[data-lang]")) { toast(D.notices.arabicPending); return; }
      if (ev.target.closest("[data-login]")) {
        toast("Login is not built yet. Accounts have not been specified.");
        return;
      }
      if (ev.target.closest("[data-loc]")) {
        toast("Location list is not connected yet.");
        return;
      }
      if (ev.target.closest("[data-search-open]")) {
        var q = qs('input[type="search"]');
        if (q) { q.focus(); q.scrollIntoView({ block: "center" }); }
        else { toast("Search is not connected yet."); }
        return;
      }
      if (ev.target.closest("[data-nofunc]")) {
        ev.preventDefault();
        toast("This page has not been built yet.");
      }
    });

    /* Search never fakes a result set. */
    document.addEventListener("submit", function (ev) {
      if (ev.target.matches("[data-search]")) {
        ev.preventDefault();
        toast("Search is not connected yet. No space inventory has been defined.");
        return;
      }
      /* And the listing form never fakes a success. Spec §5 forbids it
         outright: there is no endpoint to receive this. */
      if (ev.target.matches("[data-listing]")) {
        ev.preventDefault();
        toast(D.list.noBackendNotice);
      }
    });
  }

  function boot() {
    var page = document.body.getAttribute("data-page");
    var root = qs("[data-root]");
    if (!root || !PAGES[page]) return;

    document.body.insertAdjacentHTML("afterbegin", header(page));
    PAGES[page](root);
    document.body.insertAdjacentHTML("beforeend", footer());
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
