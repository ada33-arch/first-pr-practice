/* ==========================================================================
   Shared runtime: language, theme, cart, chrome, page renderers.
   No build step, no dependencies — open the HTML files directly.
   ========================================================================== */
(function () {
  "use strict";

  /* One static site, many merchants: MERCHANTS holds every store (SITE is
     always MERCHANTS[0], kept for pages that predate the marketplace). Any
     page picks its merchant from ?m=<id> — mHref() below carries that param
     forward on every internal link so navigating within one merchant's pages
     never falls back to the default. */
  var MERCHANTS = (window.MERCHANTS && window.MERCHANTS.length) ? window.MERCHANTS : (window.SITE ? [window.SITE] : []);
  function findMerchant(id) {
    return MERCHANTS.filter(function (m) { return m.id === id; })[0];
  }
  function requestedMerchantId() {
    var hashQuery = (window.location.hash.split("?")[1] || "");
    return new URLSearchParams(window.location.search).get("m") ||
           new URLSearchParams(hashQuery).get("m");
  }
  var DEFAULT_MERCHANT_ID = MERCHANTS[0] && MERCHANTS[0].id;
  var S = findMerchant(requestedMerchantId()) || MERCHANTS[0] || window.SITE || {};
  var P = window.PLATFORM || {};
  var DICT = window.I18N || { ar: {}, en: {} };

  // A relative page link (store.html, product.html?id=…) that carries the
  // active merchant forward. Left untouched for "wa", hashes, and http(s)
  // links — those never take an ?m= param.
  function mHref(url) {
    if (!url || url === "wa" || url.charAt(0) === "#" || /^https?:/.test(url)) return url;
    if (!S.id || S.id === DEFAULT_MERCHANT_ID) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "m=" + encodeURIComponent(S.id);
  }

  var KEY = {
    lang: "nzm.lang", theme: "nzm.theme",
    // Scoped per merchant: a cart built on one store's page must not surface
    // as another store's cart, or as fictional stock on either one.
    cart: "nzm.cart." + (S.id || "default"),
    buyerName: "nzm.buyer.name", buyerPhone: "nzm.buyer.phone",
  };

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
  var cart = sanitizeCart(store.get(KEY.cart, []));

  /* ------------------------------------------------------------ helpers -- */
  function sanitizeCart(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (l) { return l && findProduct(l.id); })
      .map(function (l) { return { id: l.id, qty: Math.min(99, Math.max(1, parseInt(l.qty, 10) || 1)) }; });
  }
  function findProduct(id) {
    return (S.products || []).filter(function (p) { return p.id === id; })[0];
  }
  function t(key) { return (DICT[lang] && DICT[lang][key]) || (DICT.ar && DICT.ar[key]) || key; }
  function tx(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.ar || value.en || "";
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(amount) {
    var num = Number(amount).toLocaleString("en-US");
    var cur = tx(S.currency) || "SAR";
    return lang === "ar" ? num + " " + cur : cur + " " + num;
  }
  /* Hand the same event to n8n. Fire-and-forget: the WhatsApp handoff must not
     wait on it, and a dead webhook must never block a sale. */
  function postHook(url, payload) {
    if (!url) return;
    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
        mode: "cors",
      }).catch(function () {});
    } catch (e) { /* offline, blocked, whatever — the WhatsApp path still runs */ }
  }

  function buyer() {
    return {
      name: String(store.get(KEY.buyerName, "") || "").trim(),
      phone: String(store.get(KEY.buyerPhone, "") || "").trim(),
    };
  }

  function waLink(text) {
    if (!S.whatsapp) return "";
    return "https://wa.me/" + String(S.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* -------------------------------------------------------------- icons -- */
  var ICONS = {
    chevron: '<path d="M9 6l6 6-6 6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.55L21 8H6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6l8-3z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>',
    verified: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.8 12.3l2.7 2.7 5.7-5.9" stroke="var(--bg)" stroke-width="2.4"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    tiktok: '<path d="M15.5 3c.4 2.3 1.9 3.7 4.2 3.9v2.7c-1.6.1-3-.4-4.2-1.3v5.9c0 3.6-2.7 5.9-5.7 5.7-2.8-.2-4.9-2.5-4.8-5.4.1-2.9 2.6-5.1 5.5-4.8v2.9c-1.5-.4-2.8.6-2.8 2 0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.5V3h3.2z" fill="currentColor" stroke="none"/>',
    x: '<path d="M4 4l7 8.6L4.4 20h1.9l5.7-6.3L17 20h3l-7.4-9 6.2-7h-1.9l-5.2 5.9L8 4H4z" fill="currentColor" stroke="none"/>',
    youtube: '<rect x="2.5" y="5" width="19" height="14" rx="4.5"/><path d="M10.3 9.2l5 2.8-5 2.8V9.2z" fill="currentColor" stroke="none"/>',
    snapchat: '<path d="M12 3c2.7 0 4.3 2 4.3 4.6 0 .8-.1 1.6-.1 1.9.4.2.9.2 1.4 0 .6-.2 1.1.5.6 1-.5.4-1.5.7-1.7 1.1-.2.5 1.3 3 3.2 3.5.5.1.5.7 0 .9-.7.3-1.7.4-2 .7-.2.3-.1 1-.6 1.1-.6.2-1.7-.3-2.7 0-1 .3-1.6 1.2-2.4 1.2s-1.4-.9-2.4-1.2c-1-.3-2.1.2-2.7 0-.5-.1-.4-.8-.6-1.1-.3-.3-1.3-.4-2-.7-.5-.2-.5-.8 0-.9 1.9-.5 3.4-3 3.2-3.5-.2-.4-1.2-.7-1.7-1.1-.5-.5 0-1.2.6-1 .5.2 1 .2 1.4 0 0-.3-.1-1.1-.1-1.9C7.7 5 9.3 3 12 3z" fill="currentColor" stroke="none"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.6c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.3 0 .6.5.8 1.2 1.4 2 1.8.3.1.4.1.6-.1l.5-.6c.2-.2.3-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .6-.5 1.5-1.6 1.6-1 .1-2.6-.4-4.2-2S8.6 9.6 9 8.6z" fill="currentColor" stroke="none"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    truck: '<path d="M3 7a1 1 0 0 1 1-1h9v10H4a1 1 0 0 1-1-1V7z"/><path d="M13 9h4.3l2.7 3v4h-7V9z"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/>',
    droplet: '<path d="M12 3.2C16.4 8.2 18 10.6 18 13.2A6 6 0 0 1 6 13.2C6 10.6 7.6 8.2 12 3.2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L10.6 5"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20l1.3-1.3"/>',
  };
  function icon(name, cls) {
    var body = ICONS[name] || ICONS.link;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  }

  /* ---------------------------------------------------- language + theme -- */
  function applyLang() {
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    qsa("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    qsa("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    qsa("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    var toggle = qs("[data-lang-toggle]");
    if (toggle) toggle.textContent = lang === "ar" ? "EN" : "ع";
    var owner = document.body.dataset.brand === "platform" ? P : S;
    var mark = qs("[data-brand-mark]");
    if (mark) mark.textContent = tx(owner.mark || owner.initials) || "M";
    var brandName = qs("[data-brand-name]");
    if (brandName) brandName.textContent = tx(owner.name);
  }
  function setLang(next) {
    lang = next;
    store.set(KEY.lang, lang);
    applyLang();
    renderPage();
    renderCart();
  }
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = qs("[data-theme-toggle]");
    if (btn) btn.innerHTML = icon(theme === "dark" ? "sun" : "moon");
  }
  function setTheme(next) {
    theme = next;
    store.set(KEY.theme, theme);
    applyTheme();
  }

  /* --------------------------------------------------------------- cart -- */
  function cartCount() {
    return cart.reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function cartTotal() {
    return cart.reduce(function (sum, l) {
      var p = findProduct(l.id);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  }
  function addToCart(id, qty) {
    var product = findProduct(id);
    if (!product) return;
    var line = cart.filter(function (l) { return l.id === id; })[0];
    if (line) line.qty = Math.min(99, line.qty + (qty || 1));
    else cart.push({ id: id, qty: qty || 1 });
    store.set(KEY.cart, cart);
    renderCart();
    toast(t("product.added") + " · " + tx(product.title));
  }
  function setQty(id, qty) {
    cart = cart
      .map(function (l) { return l.id === id ? { id: id, qty: qty } : l; })
      .filter(function (l) { return l.qty > 0; });
    store.set(KEY.cart, cart);
    renderCart();
  }
  function removeFromCart(id) { setQty(id, 0); }

  function orderText() {
    var lines = cart.map(function (l) {
      var p = findProduct(l.id);
      return l.qty + "× " + tx(p.title) + " — " + money(p.price * l.qty);
    });
    var who = buyer();
    var tail = [t("order.total") + ": " + money(cartTotal())];
    if (who.name || who.phone) {
      tail.push(t("order.from") + ": " + [who.name, who.phone].filter(Boolean).join(" · "));
    }
    return [
      t("order.title") + " · " + tx(S.name),
      "————————————",
      lines.join("\n"),
      "————————————",
    ].concat(tail).join("\n");
  }
  function checkout() {
    if (!cart.length) return;
    var who = buyer();
    postHook(S.orderWebhook, {
      handle: S.handle,
      seller_phone: S.whatsapp,
      currency: tx(S.currency),
      customer_name: who.name,
      customer_phone: who.phone,
      items: cart.map(function (l) {
        var p = findProduct(l.id);
        return { id: p.id, title: tx(p.title), qty: l.qty, price: p.price };
      }),
      total: cartTotal(),
      source: "storefront",
    });
    var text = orderText();
    var url = waLink(text);
    if (url) { window.open(url, "_blank", "noopener"); return; }
    if (S.email) {
      window.location.href = "mailto:" + S.email + "?subject=" +
        encodeURIComponent(t("order.title")) + "&body=" + encodeURIComponent(text);
      return;
    }
    copy(text).then(function () { toast(t("cart.copied")); });
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      resolve();
    });
  }

  /* -------------------------------------------------------------- toast -- */
  var toastTimer;
  function toast(message) {
    var el = qs("#toast");
    if (!el) return;
    el.innerHTML = icon("check") + "<span></span>";
    qs("span", el).textContent = message;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 2600);
  }

  /* ------------------------------------------------------------- chrome -- */
  var PLATFORM_PAGES = ["landing", "signup", "setup", "marketplace"];

  function mountChrome() {
    var ribbon = document.createElement("div");
    ribbon.className = "ribbon";
    ribbon.hidden = true;
    document.body.prepend(ribbon);

    var header = document.createElement("header");
    header.className = "topbar";
    document.body.insertBefore(header, ribbon.nextSibling);

    var extras = document.createElement("div");
    extras.innerHTML =
      '<div class="scrim" data-cart-close></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">' +
        '<div class="drawer__head">' +
          '<h2 id="cart-title" class="section__title" data-i18n="cart.title"></h2>' +
          '<button class="icon-btn" data-cart-close data-i18n-aria="cart.close">' + icon("close") + "</button>" +
        "</div>" +
        '<div class="drawer__body" data-cart-body></div>' +
        '<div class="drawer__foot" data-cart-foot></div>' +
      "</aside>" +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';
    while (extras.firstChild) document.body.appendChild(extras.firstChild);

    document.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-cart-open],[data-cart-close],[data-theme-toggle],[data-lang-toggle],[data-checkout],[data-copy-order]");
      if (!el) return;
      if (el.hasAttribute("data-cart-open")) openCart(true);
      else if (el.hasAttribute("data-cart-close")) openCart(false);
      else if (el.hasAttribute("data-theme-toggle")) setTheme(theme === "dark" ? "light" : "dark");
      else if (el.hasAttribute("data-lang-toggle")) setLang(lang === "ar" ? "en" : "ar");
      else if (el.hasAttribute("data-checkout")) checkout();
      else if (el.hasAttribute("data-copy-order")) copy(orderText()).then(function () { toast(t("cart.copied")); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") openCart(false);
    });
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }, { passive: true });
  }

  /* the platform wears its own brand; a seller page wears the seller's */
  function renderChrome() {
    var page = document.body.dataset.page;
    var onPlatform = PLATFORM_PAGES.indexOf(page) !== -1;
    document.body.dataset.brand = onPlatform ? "platform" : "seller";

    var sideLink = onPlatform
      ? '<a class="icon-btn icon-btn--text" href="demo.html" data-i18n="nav.example"></a>'
      : (page === "home"
          ? '<a class="icon-btn icon-btn--text" href="' + mHref("store.html") + '" data-i18n="nav.store"></a>'
          : '<a class="icon-btn icon-btn--text" href="' + mHref("demo.html") + '" data-i18n="nav.links"></a>');
    // Present on every page: the one way in from a seller's page (or the
    // platform's own pages) to see every other store in the marketplace.
    var marketLink = '<a class="icon-btn icon-btn--text" href="marketplace.html" data-i18n="nav.marketplace"></a>';

    qs(".topbar").innerHTML =
      '<div class="topbar__inner">' +
        '<a class="brand" href="' + (onPlatform ? "index.html" : mHref("demo.html")) + '">' +
          '<span class="brand__mark" data-brand-mark></span>' +
          "<span data-brand-name></span>" +
        "</a>" +
        '<div class="topbar__tools">' +
          sideLink +
          marketLink +
          '<button class="icon-btn icon-btn--text" data-lang-toggle data-i18n-aria="a11y.lang"></button>' +
          '<button class="icon-btn" data-theme-toggle data-i18n-aria="a11y.theme"></button>' +
          (onPlatform
            ? '<a class="btn btn--primary btn--sm" href="signup.html" data-i18n="nav.start"></a>'
            : '<button class="icon-btn" data-cart-open data-i18n-aria="a11y.cart">' + icon("cart") +
              '<span class="cart-count" data-cart-count>0</span></button>') +
        "</div>" +
      "</div>";

    var ribbon = qs(".ribbon");
    ribbon.hidden = onPlatform;
    ribbon.innerHTML = onPlatform ? "" :
      '<span data-i18n="demo.ribbon"></span>' +
      '<a href="signup.html" data-i18n="demo.ribbonCta"></a>';

    applyTheme();
  }

  function openCart(open) {
    var drawer = qs(".drawer");
    var scrim = qs(".scrim");
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  function renderCart() {
    var badge = qs("[data-cart-count]");
    if (badge) {
      var n = cartCount();
      badge.textContent = n;
      badge.classList.toggle("is-on", n > 0);
    }
    var body = qs("[data-cart-body]");
    var foot = qs("[data-cart-foot]");
    if (!body || !foot) return;

    if (!cart.length) {
      body.innerHTML =
        '<div class="empty"><span>🧺</span>' +
        "<strong>" + esc(t("cart.empty")) + "</strong>" +
        '<p class="tiny">' + esc(t("cart.emptyHint")) + "</p>" +
        '<a class="btn btn--ghost btn--sm" href="' + mHref("store.html") + '">' + esc(t("cart.browse")) + "</a></div>";
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = cart.map(function (l) {
      var p = findProduct(l.id);
      return '<div class="line">' +
          artHTML(p, "line__art") +
          '<div class="line__body">' +
            '<div class="line__title">' + esc(tx(p.title)) + "</div>" +
            '<div class="line__meta">' + l.qty + " × " + esc(money(p.price)) + "</div>" +
          "</div>" +
          '<div class="stepper">' +
            '<button data-qty="' + esc(p.id) + '" data-delta="-1" aria-label="-">−</button>' +
            "<span>" + l.qty + "</span>" +
            '<button data-qty="' + esc(p.id) + '" data-delta="1" aria-label="+">+</button>' +
          "</div>" +
          '<button class="line__remove" data-remove="' + esc(p.id) + '" aria-label="remove">✕</button>' +
        "</div>";
    }).join("");

    var who = buyer();
    var waReady = !!S.whatsapp;
    foot.innerHTML =
      '<div class="buyer">' +
        '<input data-buyer="name" value="' + esc(who.name) + '" data-i18n-ph="cart.name">' +
        '<input data-buyer="phone" class="ltr" type="tel" inputmode="tel" value="' +
          esc(who.phone) + '" data-i18n-ph="cart.phone">' +
      "</div>" +
      '<div class="totals"><span>' + esc(t("cart.total")) + "</span><span>" + esc(money(cartTotal())) + "</span></div>" +
      '<button class="btn btn--block ' + (waReady ? "btn--wa" : "btn--primary") + '" data-checkout>' +
        (waReady ? icon("whatsapp") : icon("bolt")) +
        "<span>" + esc(waReady ? t("cart.checkout") : t("cart.copy")) + "</span>" +
      "</button>" +
      (waReady ? '<button class="btn btn--ghost btn--block btn--sm" data-copy-order>' + esc(t("cart.copy")) + "</button>" : "");

    qsa("[data-qty]", body).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-qty");
        var delta = parseInt(btn.getAttribute("data-delta"), 10);
        var line = cart.filter(function (l) { return l.id === id; })[0];
        if (line) setQty(id, Math.min(99, line.qty + delta));
      });
    });
    qsa("[data-remove]", body).forEach(function (btn) {
      btn.addEventListener("click", function () { removeFromCart(btn.getAttribute("data-remove")); });
    });
    qsa("[data-buyer]", foot).forEach(function (input) {
      input.addEventListener("input", function () {
        store.set(input.getAttribute("data-buyer") === "name" ? KEY.buyerName : KEY.buyerPhone, input.value);
      });
    });
  }

  /* ---------------------------------------------------------- fragments -- */
  /* a bottle drawn from the product's own oil colour — one silhouette, six scents */
  function bottleSVG(p) {
    var art = p.art || {};
    var oil = art.oil || "#c9a24a";
    var cap = art.cap || "#d8b475";
    var gid = "oil-" + p.id;
    return '<svg class="bottle" viewBox="0 0 120 172" fill="none" role="img" aria-label="' + esc(tx(p.title)) + '">' +
        "<defs>" +
          '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="' + oil + '" stop-opacity=".95"/>' +
            '<stop offset="1" stop-color="' + oil + '" stop-opacity=".6"/>' +
          "</linearGradient>" +
        "</defs>" +
        '<rect x="50" y="6" width="20" height="20" rx="6" fill="' + cap + '"/>' +
        '<rect x="55" y="24" width="10" height="16" fill="' + cap + '" opacity=".8"/>' +
        '<path d="M46 36h28a14 14 0 0 1 14 14v96a14 14 0 0 1-14 14H46a14 14 0 0 1-14-14V50a14 14 0 0 1 14-14z" ' +
          'fill="url(#' + gid + ')" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>' +
        '<rect x="39" y="58" width="6" height="56" rx="3" fill="#fff" opacity=".18"/>' +
        '<rect x="32" y="112" width="56" height="1.5" fill="#fff" opacity=".16"/>' +
      "</svg>";
  }

  function artHTML(p, cls) {
    var bg = "background:linear-gradient(150deg," + (p.art ? p.art.from : "#2a2a35") + "," + (p.art ? p.art.to : "#101017") + ")";
    var inner = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(tx(p.title)) + '" loading="lazy">'
      : (p.art && p.art.motif === "bottle")
        ? bottleSVG(p)
        : '<span aria-hidden="true">' + ((p.art && p.art.emoji) || "🛍️") + "</span>";
    return '<div class="' + cls + '" style="' + bg + '">' +
      (p.badge && cls === "product__art" ? '<span class="product__badge">' + esc(tx(p.badge)) + "</span>" : "") +
      inner + "</div>";
  }

  function productCard(p) {
    return '<article class="product reveal">' +
        '<a href="' + mHref("product.html?id=" + encodeURIComponent(p.id)) + '" aria-label="' + esc(tx(p.title)) + '">' +
          artHTML(p, "product__art") +
        "</a>" +
        '<div class="product__body">' +
          '<div class="product__cat">' + esc(tx(p.category)) + "</div>" +
          '<a class="product__title" href="' + mHref("product.html?id=" + encodeURIComponent(p.id)) + '">' + esc(tx(p.title)) + "</a>" +
          '<p class="product__desc">' + esc(tx(p.desc)) + "</p>" +
          '<div class="product__foot">' +
            '<div class="price"><span class="price__now">' + esc(money(p.price)) + "</span>" +
              (p.oldPrice ? '<span class="price__was">' + esc(money(p.oldPrice)) + "</span>" : "") +
            "</div>" +
            '<button class="btn btn--primary btn--sm" data-add="' + esc(p.id) + '">' + esc(t("product.add")) + "</button>" +
          "</div>" +
        "</div>" +
      "</article>";
  }

  /* ---------------------------------------------------------- merchants -- */
  function merchantArt(m, cls) {
    var art = m.art || {};
    var bg = "background:linear-gradient(150deg," + (art.from || "#2a2a35") + "," + (art.to || "#101017") + ")";
    return '<div class="' + cls + '" style="' + bg + '">' +
      '<span aria-hidden="true">' + (art.emoji || "🛍️") + "</span></div>";
  }

  function merchantCard(m) {
    var count = (m.products || []).length;
    return '<a class="merchant reveal" href="' + mHrefFor(m, "demo.html") + '">' +
        merchantArt(m, "merchant__art") +
        '<div class="merchant__body">' +
          '<div class="merchant__cat">' + esc(tx(m.category)) + "</div>" +
          '<div class="merchant__title">' + esc(tx(m.name)) +
            (m.verified ? icon("verified", "verified") : "") + "</div>" +
          '<p class="merchant__tagline">' + esc(tx(m.tagline || m.bio)) + "</p>" +
          '<div class="merchant__meta">' + count + " " + esc(t("market.products")) + "</div>" +
        "</div>" +
        icon("chevron", "link-card__arrow") +
      "</a>";
  }

  // Like mHref, but for a specific merchant rather than the active one — the
  // marketplace directory links into stores it isn't currently showing.
  function mHrefFor(m, url) {
    if (!m.id || m.id === DEFAULT_MERCHANT_ID) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "m=" + encodeURIComponent(m.id);
  }

  function footerHTML() {
    var year = new Date().getFullYear();
    var onPlatform = document.body.dataset.brand === "platform";
    var owner = onPlatform ? P : S;
    var second = onPlatform
      ? '<span class="ltr">' + esc(P.domain || "") + "</span>"
      : '<a href="index.html">' + esc(t("footer.built")) + " " + esc(tx(P.name)) + "</a>";
    return '<footer class="footer"><div class="shell">' +
      "<div>© " + year + " " + esc(tx(owner.name)) + " · <span>" + esc(t("footer.rights")) + "</span></div>" +
      '<div class="tiny">' + second + "</div>" +
      "</div></footer>";
  }

  function bindAddButtons(root) {
    qsa("[data-add]", root).forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        addToCart(btn.getAttribute("data-add"), 1);
      });
    });
  }

  function revealAll() {
    var items = qsa(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px 12% 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 45, 320) + "ms";
      io.observe(el);
    });
  }

  /* ======================================================== motion layer ==
     Drawn in the browser, not imported: no GIFs, no video, no libraries.
     Everything here checks prefers-reduced-motion before it runs. */

  var loops = [];
  function clearLoops() {
    loops.forEach(clearTimeout);
    loops = [];
  }
  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* the headline arrives word by word, not as a block */
  function splitHeadline(el) {
    if (!el || reduced()) return;
    var words = el.textContent.trim().split(/\s+/);
    if (words.length > 14) return;
    el.innerHTML = words.map(function (w, i) {
      return '<span class="word" style="--d:' + (90 + i * 60) + 'ms">' + esc(w) + "</span>";
    }).join(" ");
  }

  /* the phone in the hero runs a loop of someone using it */
  function livePhone() {
    var phone = qs(".phone");
    if (!phone || reduced()) return;
    var rows = qsa(".phone__links span", phone);
    var tiles = qsa(".phone__grid i", phone);
    if (!rows.length) return;

    var cursor = document.createElement("span");
    cursor.className = "phone__cursor";
    phone.appendChild(cursor);

    var i = 0;
    function beat() {
      rows.forEach(function (r) { r.classList.remove("is-focus"); });
      tiles.forEach(function (t) { t.classList.remove("is-pop"); });

      var row = rows[i % rows.length];
      row.classList.add("is-focus");

      var pr = phone.getBoundingClientRect();
      var rr = row.getBoundingClientRect();
      cursor.classList.add("is-on");
      cursor.style.transform = "translate(" +
        (rr.left - pr.left + rr.width * 0.16) + "px," +
        (rr.top - pr.top + rr.height / 2 - 11) + "px)";
      cursor.classList.remove("is-tap");
      void cursor.offsetWidth;
      cursor.classList.add("is-tap");

      if (i % rows.length === rows.length - 1) {
        tiles.forEach(function (t, n) {
          loops.push(setTimeout(function () { t.classList.add("is-pop"); }, 320 + n * 140));
        });
      }
      i++;
      loops.push(setTimeout(beat, 2600));
    }
    loops.push(setTimeout(beat, 900));
  }

  /* the connector behind the three steps draws itself once, on arrival.
     A plain scroll check, not an observer: jumping straight past an element
     crosses no threshold, so an observer would never fire and the line would
     sit at zero width forever. */
  function drawSteps() {
    var steps = qs(".steps");
    if (!steps) return;
    if (reduced()) { steps.classList.add("is-in"); return; }
    function check() {
      if (steps.getBoundingClientRect().top < window.innerHeight * 0.85) {
        steps.classList.add("is-in");
        window.removeEventListener("scroll", check);
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  /* prices roll up from zero when their card arrives */
  function rollPrices() {
    if (reduced() || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var text = el.textContent;
        var match = text.match(/[\d,]+/);
        if (!match) return;
        var target = Number(match[0].replace(/,/g, ""));
        if (!target) return;
        var head = text.slice(0, match.index);
        var tail = text.slice(match.index + match[0].length);
        var started = null;
        function frame(now) {
          if (!started) started = now;
          var k = Math.min(1, (now - started) / 850);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = head + Math.round(target * eased).toLocaleString("en-US") + tail;
          if (k < 1) requestAnimationFrame(frame);
        }
        el.textContent = head + "0" + tail;
        requestAnimationFrame(frame);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    qsa(".plan__price").forEach(function (el) { io.observe(el); });
  }

  /* primary buttons lean toward the cursor — only where there is a real cursor */
  function magnetise() {
    if (reduced() || !window.matchMedia("(pointer: fine)").matches) return;
    qsa(".btn--primary").forEach(function (b) {
      b.classList.add("btn--magnetic");
      b.addEventListener("pointermove", function (ev) {
        var r = b.getBoundingClientRect();
        b.style.transform =
          "translate(" + ((ev.clientX - (r.left + r.width / 2)) / r.width * 8).toFixed(2) + "px," +
          ((ev.clientY - (r.top + r.height / 2)) / r.height * 6).toFixed(2) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* stagger the bottles so six of them never bob in unison */
  function stagger() {
    qsa(".product").forEach(function (card, i) {
      card.style.setProperty("--bob", (i % 5) * 0.7 + "s");
    });
  }

  function scrollProgress() {
    var bar = document.createElement("div");
    bar.className = "progress";
    document.body.appendChild(bar);
    var ticking = false;
    function paint() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  function motion() {
    var root = qs("[data-page-root]");
    if (root) {
      root.classList.remove("is-entering");
      void root.offsetWidth;
      root.classList.add("is-entering");
    }
    splitHeadline(qs(".hero--landing h1"));
    livePhone();
    drawSteps();
    rollPrices();
    magnetise();
    stagger();
  }

  /* ------------------------------------------------------------- pages -- */
  /* ------------------------------------------------------------ landing -- */
  /* a live sketch of the seller page, built from the demo profile's own data */
  function phoneMock() {
    var links = (S.links || []).slice(0, 3);
    var picks = (S.products || []).filter(function (x) { return x.featured; }).slice(0, 2);
    return '<div class="phone" aria-hidden="true">' +
        '<div class="phone__screen">' +
          '<div class="phone__avatar">' + esc(tx(S.initials)) + "</div>" +
          '<div class="phone__name">' + esc(tx(S.name)) + "</div>" +
          '<div class="phone__handle ltr">@' + esc(S.handle) + "</div>" +
          '<div class="phone__links">' +
            links.map(function (l) {
              return '<span><i>' + l.icon + "</i>" + esc(tx(l.title)) + "</span>";
            }).join("") +
          "</div>" +
          '<div class="phone__grid">' +
            picks.map(function (x) {
              return '<i style="background:linear-gradient(150deg,' + x.art.from + "," + x.art.to + ')"></i>';
            }).join("") +
          "</div>" +
        "</div>" +
      "</div>";
  }

  /* one row of categories, doubled so the loop has no seam */
  function marqueeRow(items, extra) {
    var cells = items.map(function (item) {
      return '<span class="sell"><i>' + item.icon + "</i>" + esc(tx(item.label)) + "</span>";
    }).join("");
    return '<div class="marquee' + extra + '"><div class="marquee__track">' + cells + cells + "</div></div>";
  }

  function planCard(plan, key) {
    var isStore = key === "store";
    var isSetup = key === "setup";
    var price;
    if (isStore) {
      price = '<span class="plan__price">' + esc(money(plan.price)) + "</span>" +
              '<span class="plan__period">' + esc(tx(plan.period)) + "</span>";
    } else if (isSetup) {
      price = '<span class="plan__price">' + esc(money(plan.price)) + "</span>" +
              '<span class="plan__period">' + esc(tx(plan.once)) + "</span>";
    } else {
      price = '<span class="plan__price">' + esc(t("plan.freePrice")) + "</span>" +
              '<span class="plan__period">' + esc(tx(plan.note)) + "</span>";
    }
    var cta = isStore ? "plan.ctaStore" : isSetup ? "plan.ctaSetup" : "plan.ctaFree";
    var href = isStore ? "signup.html?plan=store" : isSetup ? "setup.html" : "signup.html";
    return '<article class="plan' + (isStore ? " plan--lead" : "") + (isSetup ? " plan--setup" : "") + ' reveal">' +
        (plan.badge ? '<span class="plan__badge">' + esc(tx(plan.badge)) + "</span>" : "") +
        '<h3 class="plan__name">' + esc(tx(plan.name)) + "</h3>" +
        '<div class="plan__cost">' + price + "</div>" +
        "<ul>" + (plan.lines || []).map(function (line) {
          return "<li>" + icon("check") + "<span>" + esc(tx(line)) + "</span></li>";
        }).join("") + "</ul>" +
        '<a class="btn ' + (isStore ? "btn--primary" : "btn--ghost") + ' btn--block" href="' + href +
          '" data-i18n="' + cta + '"></a>' +
        (isStore || isSetup ? '<p class="plan__note tiny muted">' + esc(tx(plan.note)) + "</p>" : "") +
      "</article>";
  }

  function renderLanding() {
    var root = qs("[data-page-root]");
    if (!root) return;

    root.innerHTML =
      '<section class="hero hero--landing shell shell--wide">' +
        '<div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="hero__copy">' +
          '<div class="eyebrow reveal" data-i18n="land.eyebrow"></div>' +
          '<h1 class="reveal" data-i18n="land.title"></h1>' +
          '<p class="reveal" data-i18n="land.sub"></p>' +
          '<div class="hero__cta reveal">' +
            '<a class="btn btn--primary" href="signup.html" data-i18n="land.ctaMain"></a>' +
            '<a class="btn btn--ghost" href="demo.html" data-i18n="land.ctaDemo"></a>' +
          "</div>" +
          '<p class="tiny muted reveal">' + icon("check", "inline-tick") + '<span data-i18n="land.noCard"></span></p>' +
        "</div>" +
        '<div class="hero__art reveal">' + phoneMock() + "</div>" +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="land.sells"></h2>' +
        '<span class="tiny muted" data-i18n="land.sellsSub"></span></div>' +
        marqueeRow(P.sells || [], "") +
        marqueeRow((P.sells || []).slice().reverse(), " marquee--back") +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="land.steps"></h2></div>' +
        '<ol class="steps">' +
          (P.steps || []).map(function (step, i) {
            return '<li class="step reveal"><span class="step__num">' + (i + 1) + "</span>" +
              "<div><h3>" + esc(tx(step.title)) + "</h3><p class=\"muted\">" + esc(tx(step.body)) + "</p></div></li>";
          }).join("") +
        "</ol>" +
      "</section>" +

      '<section class="section shell shell--wide" id="pricing">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="land.pricing"></h2>' +
        '<span class="tiny muted" data-i18n="land.pricingSub"></span></div>' +
        '<div class="plans">' +
          planCard(P.plans.free, "free") +
          planCard(P.plans.store, "store") +
          planCard(P.plans.setup, "setup") +
        "</div>" +
      "</section>" +

      '<section class="section shell">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="land.faq"></h2></div>' +
        '<div class="faq">' +
          (P.faq || []).map(function (item) {
            return "<details class=\"reveal\"><summary>" + esc(tx(item.q)) + icon("chevron", "faq__arrow") +
              "</summary><p>" + esc(tx(item.a)) + "</p></details>";
          }).join("") +
        "</div>" +
      "</section>" +

      '<section class="section shell">' +
        '<div class="final reveal">' +
          '<h2 data-i18n="land.finalTitle"></h2>' +
          '<p class="muted" data-i18n="land.finalSub"></p>' +
          '<a class="btn btn--primary" href="signup.html" data-i18n="land.ctaMain"></a>' +
        "</div>" +
      "</section>" +
      footerHTML();
  }

  /* -------------------------------------------------------------- setup -- */
  function renderSetup() {
    var root = qs("[data-page-root]");
    if (!root) return;
    var d = P.setup || {};
    var plan = P.plans.setup;

    root.innerHTML =
      '<section class="hero hero--landing shell shell--wide">' +
        '<div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="hero__copy">' +
          '<div class="eyebrow reveal" data-i18n="setup.eyebrow"></div>' +
          '<h1 class="reveal" data-i18n="setup.title"></h1>' +
          '<p class="reveal" data-i18n="setup.sub"></p>' +
          '<div class="hero__cta reveal">' +
            '<a class="btn btn--primary" href="signup.html?plan=setup" data-i18n="setup.cta"></a>' +
            '<span class="price-chip">' + esc(money(plan.price)) + " · " +
              '<span data-i18n="plan.once"></span></span>' +
          "</div>" +
          '<p class="tiny muted reveal">' + icon("check", "inline-tick") +
            "<span>" + esc(tx(plan.note)) + "</span></p>" +
        "</div>" +
        '<div class="hero__art reveal">' +
          '<ul class="plan__list">' +
            (plan.lines || []).map(function (line) {
              return "<li>" + icon("check") + "<span>" + esc(tx(line)) + "</span></li>";
            }).join("") +
          "</ul>" +
        "</div>" +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="callout reveal">' +
          '<h3 data-i18n="setup.legalTitle"></h3>' +
          '<p data-i18n="setup.legal"></p>' +
        "</div>" +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="split">' +
          '<div class="box reveal"><h3 data-i18n="setup.ours"></h3><ul class="features">' +
            (d.ours || []).map(function (x) {
              return "<li>" + icon("check") + "<span>" + esc(tx(x)) + "</span></li>";
            }).join("") + "</ul></div>" +
          '<div class="box reveal"><h3 data-i18n="setup.yours"></h3><ul class="features features--plain">' +
            (d.yours || []).map(function (x) {
              return "<li>" + icon("chevron") + "<span>" + esc(tx(x)) + "</span></li>";
            }).join("") + "</ul></div>" +
        "</div>" +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="setup.steps"></h2></div>' +
        '<ol class="stages">' +
          (d.steps || []).map(function (step) {
            return '<li class="stage reveal">' +
                '<span class="stage__when">' + esc(tx(step.days)) + "</span>" +
                "<div><h3>" + esc(tx(step.title)) + "</h3>" +
                '<p class="muted">' + esc(tx(step.body)) + "</p></div>" +
              "</li>";
          }).join("") +
        "</ol>" +
      "</section>" +

      '<section class="section shell shell--wide">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="setup.fees"></h2></div>' +
        '<div class="fees">' +
          (d.fees || []).map(function (f) {
            return '<div class="fee reveal"><span class="fee__label">' + esc(tx(f.label)) + "</span>" +
              "<span>" + esc(tx(f.value)) + "</span></div>";
          }).join("") +
        "</div>" +
      "</section>" +

      '<section class="section shell">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="setup.faq"></h2></div>' +
        '<div class="faq">' +
          (d.faq || []).map(function (item) {
            return "<details class=\"reveal\"><summary>" + esc(tx(item.q)) + icon("chevron", "faq__arrow") +
              "</summary><p>" + esc(tx(item.a)) + "</p></details>";
          }).join("") +
        "</div>" +
      "</section>" +

      '<section class="section shell">' +
        '<div class="final reveal">' +
          '<h2 data-i18n="setup.title"></h2>' +
          '<p class="muted" data-i18n="setup.finalSub"></p>' +
          '<a class="btn btn--primary" href="signup.html?plan=setup" data-i18n="setup.cta"></a>' +
        "</div>" +
      "</section>" +
      footerHTML();
  }

  /* ------------------------------------------------------------- signup -- */
  function renderSignup() {
    var root = qs("[data-page-root]");
    if (!root) return;
    var asked = new URLSearchParams(
      window.location.search || (window.location.hash.split("?")[1] || "")
    ).get("plan");
    var wanted = ["free", "store", "setup"].indexOf(asked) === -1 ? "free" : asked;

    function choice(key, label) {
      var on = wanted === key;
      return '<label class="choice' + (on ? " is-on" : "") + '">' +
        '<input type="radio" name="plan" value="' + key + '"' + (on ? " checked" : "") + ">" +
        "<span>" + label + "</span></label>";
    }

    root.innerHTML =
      '<section class="shell signup">' +
        '<div class="eyebrow" data-i18n="land.eyebrow"></div>' +
        '<h1 data-i18n="signup.title"></h1>' +
        '<p class="muted" data-i18n="signup.sub"></p>' +
        '<div class="signup-grid">' +
          '<form class="form" novalidate>' +
            '<label class="field"><span data-i18n="signup.name"></span>' +
              '<input name="name" autocomplete="name" required></label>' +
            '<label class="field"><span data-i18n="signup.handle"></span>' +
              '<input name="handle" class="ltr" inputmode="latin" placeholder="ahmed" required>' +
              '<small class="field__hint ltr" data-handle-preview>' + esc(P.domain || "") + "/@</small></label>" +
            '<label class="field"><span data-i18n="signup.contact"></span>' +
              '<input name="phone" class="ltr" type="tel" inputmode="tel" placeholder="+971 50 000 0000" required></label>' +
            '<label class="field"><span data-i18n="signup.what"></span>' +
              '<input name="sells" placeholder="' + esc(tx((P.sells && P.sells[0] && P.sells[0].label) || "")) + '"></label>' +
            '<fieldset class="field">' +
              '<legend data-i18n="signup.plan"></legend>' +
              '<div class="choices">' +
                choice("free", esc(tx(P.plans.free.name)) + " · " + esc(t("plan.freePrice"))) +
                choice("store", esc(tx(P.plans.store.name)) + " · " + esc(money(P.plans.store.price)) +
                       " " + esc(tx(P.plans.store.period))) +
                choice("setup", esc(tx(P.plans.setup.name)) + " · " + esc(money(P.plans.setup.price)) +
                       " " + esc(tx(P.plans.setup.once))) +
              "</div>" +
            "</fieldset>" +
            '<button class="btn btn--primary btn--block" type="submit">' + icon("whatsapp") +
              '<span data-i18n="signup.submit"></span></button>' +
            '<button class="btn btn--ghost btn--block btn--sm" type="button" data-copy-signup ' +
              'data-i18n="signup.copy"></button>' +
            '<p class="tiny muted" data-i18n="signup.note"></p>' +
          "</form>" +
          '<aside class="signup-preview">' +
            '<div class="signup-preview__label">' +
              '<span data-i18n="signup.previewTitle"></span>' +
              '<span data-i18n="signup.previewHint"></span>' +
            "</div>" +
            '<div data-preview></div>' +
          "</aside>" +
        "</div>" +
      "</section>" +
      footerHTML();

    var form = qs(".form", root);
    var handle = qs('[name="handle"]', form);
    var preview = qs("[data-handle-preview]", form);

    function paintPreview() {
      var clean = handle.value.trim().replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
      handle.value = clean;
      preview.textContent = (P.domain || "") + "/@" + clean;
      paintProfilePreview();
    }
    handle.addEventListener("input", paintPreview);

    // A live sketch of the free profile page the person is about to get —
    // built entirely from what they've typed so far, nothing invented.
    function paintProfilePreview() {
      var host = qs("[data-preview]", root);
      if (!host) return;
      var name = qs('[name="name"]', form).value.trim();
      var sells = qs('[name="sells"]', form).value.trim();
      var initial = (name.charAt(0) || tx({ ar: "؟", en: "?" })).toUpperCase();
      host.innerHTML =
        '<div class="profile" style="padding:0">' +
          '<div class="avatar" style="margin:0 auto"><div class="avatar__inner">' + esc(initial) + "</div></div>" +
          '<h1 class="profile__name" style="margin-top:.6rem;font-size:1.1rem">' +
            esc(name || t("signup.previewPlaceholderName")) + "</h1>" +
          '<div class="profile__handle"><span class="ltr">' + esc(P.domain || "") + "/@" +
            esc(handle.value || "…") + "</span></div>" +
          '<p class="profile__bio" style="font-size:.85rem">' +
            esc(sells || t("signup.previewPlaceholderBio")) + "</p>" +
        "</div>";
    }
    qs('[name="name"]', form).addEventListener("input", paintProfilePreview);
    qs('[name="sells"]', form).addEventListener("input", paintProfilePreview);
    paintProfilePreview();

    qsa(".choice input", form).forEach(function (radio) {
      radio.addEventListener("change", function () {
        qsa(".choice", form).forEach(function (c) { c.classList.remove("is-on"); });
        radio.closest(".choice").classList.add("is-on");
      });
    });

    function signupText() {
      var data = new FormData(form);
      var plan = P.plans[data.get("plan")] || P.plans.free;
      return [
        t("signup.request") + " · " + tx(P.name),
        "————————————",
        tx({ ar: "الاسم", en: "Name" }) + ": " + (data.get("name") || "—"),
        tx({ ar: "الرابط", en: "Handle" }) + ": " + (P.domain || "") + "/@" + (data.get("handle") || ""),
        tx({ ar: "واتساب", en: "WhatsApp" }) + ": " + (data.get("phone") || "—"),
        tx({ ar: "يبيع", en: "Sells" }) + ": " + (data.get("sells") || "—"),
        tx({ ar: "الباقة", en: "Plan" }) + ": " + tx(plan.name),
      ].join("\n");
    }

    function valid() {
      var data = new FormData(form);
      return ["name", "handle", "phone"].every(function (k) { return String(data.get(k) || "").trim(); });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!valid()) { toast(t("signup.required")); return; }
      var data = new FormData(form);
      // the full-setup plan is a different job, so it goes to its own workflow
      postHook(data.get("plan") === "setup" ? (P.setupWebhook || P.signupWebhook) : P.signupWebhook, {
        name: data.get("name"),
        handle: data.get("handle"),
        phone: data.get("phone"),
        sells: data.get("sells"),
        plan: data.get("plan"),
        source: "website",
      });
      var text = signupText();
      var url = P.whatsapp
        ? "https://wa.me/" + String(P.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(text)
        : "";
      if (url) { window.open(url, "_blank", "noopener"); return; }
      if (P.email) {
        window.location.href = "mailto:" + P.email + "?subject=" +
          encodeURIComponent(t("signup.request")) + "&body=" + encodeURIComponent(text);
        return;
      }
      copy(text).then(function () { toast(t("signup.copied")); });
    });

    qs("[data-copy-signup]", form).addEventListener("click", function () {
      if (!valid()) { toast(t("signup.required")); return; }
      copy(signupText()).then(function () { toast(t("signup.copied")); });
    });
  }

  function renderHome() {
    var root = qs("[data-page-root]");
    if (!root) return;

    var links = (S.links || []).filter(function (l) {
      if (l.url === "wa") return !!S.whatsapp;
      if (l.url === "#newsletter") return !!(S.newsletterAction || S.email);
      return true;
    });

    var featured = (S.products || []).filter(function (p) { return p.featured; });

    root.innerHTML =
      '<section class="profile shell">' +
        '<div class="avatar reveal"><div class="avatar__inner">' +
          (S.avatar ? '<img src="' + esc(S.avatar) + '" alt="' + esc(tx(S.name)) + '">' : esc(tx(S.initials))) +
        "</div></div>" +
        '<h1 class="profile__name reveal">' + esc(tx(S.name)) +
          (S.verified ? icon("verified", "verified") : "") + "</h1>" +
        '<div class="profile__handle reveal"><span class="ltr">@' + esc(S.handle) + "</span></div>" +
        '<p class="profile__bio reveal">' + esc(tx(S.bio)) + "</p>" +
        '<nav class="socials reveal" aria-label="social links">' +
          (S.socials || []).map(function (s) {
            return '<a class="icon-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' +
              icon(s.icon) + "</a>";
          }).join("") +
        "</nav>" +
      "</section>" +

      '<section class="section shell">' +
        '<div class="section__head"><h2 class="section__title" data-i18n="profile.links"></h2></div>' +
        '<div class="links">' +
          links.map(function (l) {
            var href = l.url === "wa" ? waLink(t("order.title") + " · @" + S.handle) : mHref(l.url);
            var external = /^https?:/.test(href);
            return '<a class="link-card reveal" href="' + esc(href) + '"' +
              (external ? ' target="_blank" rel="noopener"' : "") + ">" +
              '<span class="link-card__icon" aria-hidden="true">' + l.icon + "</span>" +
              '<span class="link-card__body">' +
                '<span class="link-card__title">' + esc(tx(l.title)) + "</span>" +
                '<span class="link-card__sub">' + esc(tx(l.sub)) + "</span>" +
              "</span>" +
              (l.tag ? '<span class="pill">' + esc(tx(l.tag)) + "</span>" : "") +
              icon("chevron", "link-card__arrow") +
            "</a>";
          }).join("") +
        "</div>" +
      "</section>" +

      (featured.length
        ? '<section class="section shell">' +
            '<div class="section__head">' +
              '<h2 class="section__title" data-i18n="profile.featured"></h2>' +
              '<a class="section__link" href="' + mHref("store.html") + '" data-i18n="profile.all"></a>' +
            "</div>" +
            '<div class="grid grid--rail">' + featured.map(productCard).join("") + "</div>" +
          "</section>"
        : "") +

      ((S.newsletterAction || S.email)
        ? '<section class="section shell" id="newsletter">' +
            '<form class="link-card reveal" style="flex-wrap:wrap;gap:.75rem" ' +
              (S.newsletterAction ? 'action="' + esc(S.newsletterAction) + '" method="post" target="_blank"' : "") + ">" +
              '<span class="link-card__icon" aria-hidden="true">📮</span>' +
              '<span class="link-card__body">' +
                '<span class="link-card__title" data-i18n="newsletter.title"></span>' +
                '<span class="link-card__sub" data-i18n="newsletter.sub"></span>' +
              "</span>" +
              '<span class="search" style="flex-basis:100%">' + icon("mail") +
                '<input type="email" name="email" required data-i18n-ph="newsletter.placeholder">' +
                '<button class="btn btn--primary btn--sm" type="submit" data-i18n="newsletter.cta"></button>' +
              "</span>" +
            "</form>" +
          "</section>"
        : "") +

      footerHTML();

    var form = qs("#newsletter form");
    if (form && !S.newsletterAction && S.email) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var value = qs("input", form).value;
        window.location.href = "mailto:" + S.email + "?subject=" +
          encodeURIComponent(t("newsletter.title")) + "&body=" + encodeURIComponent(value);
        toast(t("newsletter.done"));
      });
    }
    bindAddButtons(root);
  }

  function renderStore() {
    var root = qs("[data-page-root]");
    if (!root) return;
    var products = S.products || [];
    var categories = [];
    products.forEach(function (p) {
      var c = tx(p.category);
      if (categories.indexOf(c) === -1) categories.push(c);
    });

    root.innerHTML =
      '<section class="hero shell--wide shell">' +
        '<div class="eyebrow" data-i18n="store.eyebrow"></div>' +
        '<h1 data-i18n="store.title"></h1>' +
        '<p data-i18n="store.sub"></p>' +
        '<div class="trust">' +
          ['<span class="trust__item">' + icon("truck") + '<span data-i18n="trust.delivery"></span></span>',
           '<span class="trust__item">' + icon("droplet") + '<span data-i18n="trust.oil"></span></span>',
           '<span class="trust__item">' + icon("whatsapp") + '<span data-i18n="trust.order"></span></span>'].join("") +
        "</div>" +
      "</section>" +
      '<section class="shell shell--wide">' +
        '<div class="toolbar">' +
          '<label class="search">' + icon("search") +
            '<input type="search" data-search data-i18n-ph="store.search">' +
            '<span class="sr-only">search</span>' +
          "</label>" +
          '<div class="chips">' +
            '<button class="chip is-active" data-cat="">' + esc(t("store.all")) + "</button>" +
            categories.map(function (c) {
              return '<button class="chip" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +
        '<div class="grid" data-grid></div>' +
      "</section>" +
      footerHTML();

    var state = { cat: "", q: "" };
    function paint() {
      var list = products.filter(function (p) {
        var haystack = (tx(p.title) + " " + tx(p.desc) + " " + tx(p.category)).toLowerCase();
        var matchQ = !state.q || haystack.indexOf(state.q.toLowerCase()) !== -1;
        var matchC = !state.cat || tx(p.category) === state.cat;
        return matchQ && matchC;
      });
      var grid = qs("[data-grid]");
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : '<div class="empty" style="grid-column:1/-1"><span>🔍</span><strong>' + esc(t("store.empty")) + "</strong></div>";
      bindAddButtons(grid);
      revealAll();
    }
    qs("[data-search]").addEventListener("input", function (ev) {
      state.q = ev.target.value.trim();
      paint();
    });
    qsa(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        qsa(".chip").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        state.cat = chip.getAttribute("data-cat");
        paint();
      });
    });
    paint();
  }

  /* --------------------------------------------------------- marketplace -- */
  function renderMarketplace() {
    var root = qs("[data-page-root]");
    if (!root) return;

    var categories = [];
    MERCHANTS.forEach(function (m) {
      var c = tx(m.category);
      if (c && categories.indexOf(c) === -1) categories.push(c);
    });

    root.innerHTML =
      '<section class="hero shell--wide shell">' +
        '<div class="eyebrow" data-i18n="market.eyebrow"></div>' +
        '<h1 data-i18n="market.title"></h1>' +
        '<p data-i18n="market.sub"></p>' +
      "</section>" +
      '<section class="shell shell--wide">' +
        '<div class="toolbar">' +
          '<label class="search">' + icon("search") +
            '<input type="search" data-search data-i18n-ph="market.search">' +
            '<span class="sr-only">search</span>' +
          "</label>" +
          '<div class="chips">' +
            '<button class="chip is-active" data-cat="">' + esc(t("market.all")) + "</button>" +
            categories.map(function (c) {
              return '<button class="chip" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +
        '<div class="merchants" data-grid></div>' +
      "</section>" +
      footerHTML();

    var state = { cat: "", q: "" };
    function paint() {
      var list = MERCHANTS.filter(function (m) {
        var haystack = (tx(m.name) + " " + tx(m.tagline || m.bio) + " " + tx(m.category)).toLowerCase();
        var matchQ = !state.q || haystack.indexOf(state.q.toLowerCase()) !== -1;
        var matchC = !state.cat || tx(m.category) === state.cat;
        return matchQ && matchC;
      });
      var grid = qs("[data-grid]");
      grid.innerHTML = list.length
        ? list.map(merchantCard).join("")
        : '<div class="empty" style="grid-column:1/-1"><span>🔍</span><strong>' + esc(t("market.empty")) + "</strong></div>";
      revealAll();
    }
    qs("[data-search]").addEventListener("input", function (ev) {
      state.q = ev.target.value.trim();
      paint();
    });
    qsa(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        qsa(".chip").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        state.cat = chip.getAttribute("data-cat");
        paint();
      });
    });
    paint();
  }

  function renderProduct() {
    var root = qs("[data-page-root]");
    if (!root) return;
    var hashQuery = (window.location.hash.split("?")[1] || "");
    var id = new URLSearchParams(window.location.search).get("id") ||
             new URLSearchParams(hashQuery).get("id");
    var p = findProduct(id) || (S.products || [])[0];

    if (!p) {
      root.innerHTML = '<section class="shell empty"><span>🔍</span><strong>' + esc(t("product.missing")) +
        '</strong><a class="btn btn--ghost btn--sm" href="' + mHref("store.html") + '">' + esc(t("product.back")) + "</a></section>";
      return;
    }
    document.title = tx(p.title) + " · " + tx(S.name);

    var others = (S.products || []).filter(function (o) { return o.id !== p.id; }).slice(0, 3);

    root.innerHTML =
      '<div class="shell shell--wide">' +
        '<a class="section__link backlink" href="' + mHref("store.html") + '">' + icon("chevron") + "<span>" + esc(t("product.back")) + "</span></a>" +
        '<div class="detail">' +
          '<div class="reveal">' + artHTML(p, "detail__art") + "</div>" +
          '<div class="detail__buy reveal">' +
            '<div class="eyebrow">' + esc(tx(p.category)) + "</div>" +
            "<h1>" + esc(tx(p.title)) + "</h1>" +
            '<p class="muted">' + esc(tx(p.desc)) + "</p>" +
            (p.notes
              ? '<p class="notes"><span class="notes__label">' + esc(t("product.notes")) + "</span>" +
                "<span>" + esc(tx(p.notes)) + "</span></p>"
              : "") +
            '<div class="detail__price">' +
              '<span class="price__now">' + esc(money(p.price)) + "</span>" +
              (p.oldPrice ? '<span class="price__was">' + esc(money(p.oldPrice)) + "</span>" : "") +
              (p.badge ? '<span class="pill">' + esc(tx(p.badge)) + "</span>" : "") +
            "</div>" +
            '<h2 class="section__title">' + esc(t("product.includes")) + "</h2>" +
            '<ul class="features">' +
              (p.features || []).map(function (f) {
                return "<li>" + icon("check") + "<span>" + esc(tx(f)) + "</span></li>";
              }).join("") +
            "</ul>" +
            '<div class="buy-box">' +
              '<div class="qty"><span class="muted">' + esc(t("product.qty")) + "</span>" +
                '<div class="stepper">' +
                  '<button data-step="-1" aria-label="-">−</button><span data-qty-value>1</span>' +
                  '<button data-step="1" aria-label="+">+</button>' +
                "</div>" +
              "</div>" +
              '<button class="btn btn--primary btn--block" data-buy>' + icon("bolt") +
                "<span>" + esc(t("product.buy")) + "</span></button>" +
              '<button class="btn btn--ghost btn--block" data-add-detail>' + icon("cart") +
                "<span>" + esc(t("product.add")) + "</span></button>" +
              '<div class="trust" style="justify-content:flex-start">' +
                '<span class="trust__item">' + icon("truck") + '<span data-i18n="trust.delivery"></span></span>' +
                '<span class="trust__item">' + icon("droplet") + '<span data-i18n="trust.oil"></span></span>' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        (others.length
          ? '<section class="section">' +
              '<div class="section__head"><h2 class="section__title" data-i18n="profile.featured"></h2>' +
              '<a class="section__link" href="' + mHref("store.html") + '" data-i18n="profile.all"></a></div>' +
              '<div class="grid">' + others.map(productCard).join("") + "</div>" +
            "</section>"
          : "") +
      "</div>" +
      footerHTML();

    var qty = 1;
    var out = qs("[data-qty-value]");
    qsa("[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qty = Math.min(99, Math.max(1, qty + parseInt(btn.getAttribute("data-step"), 10)));
        out.textContent = qty;
      });
    });
    qs("[data-add-detail]").addEventListener("click", function () { addToCart(p.id, qty); });
    qs("[data-buy]").addEventListener("click", function () {
      addToCart(p.id, qty);
      openCart(true);
    });
    bindAddButtons(root);
  }

  function renderPage() {
    var page = document.body.dataset.page;
    clearLoops();
    renderChrome();
    if (page === "landing") renderLanding();
    else if (page === "setup") renderSetup();
    else if (page === "signup") renderSignup();
    else if (page === "home") renderHome();
    else if (page === "store") renderStore();
    else if (page === "product") renderProduct();
    else if (page === "marketplace") renderMarketplace();
    applyLang();
    revealAll();
    renderCart();
    motion();
  }

  /* hooks for a host page (used by the single-file build's hash router) */
  window.SiteApp = { render: renderPage, openCart: openCart, refreshCart: renderCart };

  /* ---------------------------------------------------------------- go -- */
  document.addEventListener("DOMContentLoaded", function () {
    mountChrome();
    scrollProgress();
    /* renderPage() owns the order from here: chrome, page, language, motion.
       Anything called after it would undo the word-splitting in the headline. */
    renderPage();
  });
})();
