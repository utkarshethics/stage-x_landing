/*!
 * site-enhance.js - shared UX layer for Stage-X brand sites.
 * Smooth scrolling, scroll-reveal + press/hover microinteractions,
 * exit-intent popup, browser-language suggestion, lazy-loading fallback.
 * No dependencies. Respects prefers-reduced-motion. Safe to load with `defer`.
 *
 * Per-site settings: define window.SITE_ENHANCE = {...} before this script,
 * or edit DEFAULTS below.
 */
(function () {
  "use strict";
  if (window.__siteEnhanceLoaded) return;
  window.__siteEnhanceLoaded = true;

  var DEFAULTS = {
    brand: document.title.split(/[|–—-]/).pop().trim(),
    accent: "",                 // CSS color; empty = read from page (--accent / --primary / link color)
    exitIntent: {
      enabled: true,
      title: "Before you go…",
      text: "Get a free quote in minutes — talk to our team directly.",
      ctaText: "Chat on WhatsApp",
      ctaHref: "",              // empty = first wa.me / tel: / contact link on the page
      secondaryText: "No thanks",
      daysBetween: 7,
      minSecondsOnPage: 8,
      skipPaths: ["/contact", "/book", "/checkout", "/privacy", "/terms"]
    },
    language: {
      enabled: true,
      // map of language code -> path prefix, e.g. { hi: "/hi/", kn: "/kn/" }
      // leave empty to auto-detect from <link rel="alternate" hreflang> tags.
      prefixes: {},
      labels: { hi: "हिन्दी", kn: "ಕನ್ನಡ", ta: "தமிழ்", te: "తెలుగు", mr: "मराठी",
                gu: "ગુજરાતી", bn: "বাংলা", ml: "മലയാളം", pa: "ਪੰਜਾਬੀ", en: "English",
                es: "Español", fr: "Français", de: "Deutsch", ar: "العربية" }
    },
    reveal: true,
    microinteractions: true,
    smoothScroll: true,
    lazyImages: true,
    spa: false                  // true for React/Vue single-page apps
  };

  var cfg = merge(DEFAULTS, window.SITE_ENHANCE || {});
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = safeStorage();

  ready(function () {
    injectStyles();
    if (cfg.lazyImages) lazyImages();
    if (cfg.smoothScroll) smoothScroll();
    if (cfg.reveal && !reduceMotion && !cfg.spa) reveal();
    if (cfg.microinteractions) microinteractions();
    if (cfg.language.enabled) languageSuggest();
    if (cfg.exitIntent.enabled) exitIntent();
    if (cfg.spa && "MutationObserver" in window) {
      // single-page apps: re-apply to content rendered after navigation
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () {
          if (cfg.lazyImages) lazyImages();
          if (cfg.microinteractions) microinteractions();
        }, 250);
      }).observe(document.body, { childList: true, subtree: true });
    }
  });

  /* ---------- helpers ---------- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  function merge(a, b) {
    var out = {}, k;
    for (k in a) out[k] = a[k];
    for (k in b) {
      out[k] = (a[k] && typeof a[k] === "object" && !Array.isArray(a[k]) && b[k] && typeof b[k] === "object")
        ? merge(a[k], b[k]) : b[k];
    }
    return out;
  }
  function safeStorage() {
    try { var t = "__se"; localStorage.setItem(t, "1"); localStorage.removeItem(t); return localStorage; }
    catch (e) { var m = {}; return { getItem: function (k) { return m[k] || null; }, setItem: function (k, v) { m[k] = String(v); } }; }
  }
  function accentColor() {
    if (cfg.accent) return cfg.accent;
    var cs = getComputedStyle(document.documentElement);
    var names = ["--accent", "--primary", "--brand", "--color-primary", "--c-accent"];
    for (var i = 0; i < names.length; i++) {
      var v = cs.getPropertyValue(names[i]).trim();
      if (v) return v;
    }
    var a = document.querySelector("a[href]");
    return a ? getComputedStyle(a).color : "#2563eb";
  }
  function onPath(list) {
    var p = location.pathname.replace(/\.html$/, "");
    return list.some(function (s) { return p === s || p.indexOf(s + "/") === 0; });
  }

  /* ---------- styles ---------- */
  function injectStyles() {
    var c = accentColor();
    var css =
      (cfg.smoothScroll ? "@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}" : "") +
      "[data-se-reveal]{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}" +
      "[data-se-reveal].se-in{opacity:1;transform:none}" +
      (cfg.microinteractions ?
        "@media (hover:hover) and (prefers-reduced-motion:no-preference){" +
          ".se-lift{transition:transform .2s ease,box-shadow .2s ease}" +
          ".se-lift:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.10)}}" +
        ".se-press{transition:transform .12s ease}.se-press:active{transform:scale(.97)}" +
        "a:focus-visible,button:focus-visible{outline:2px solid " + c + ";outline-offset:2px}" : "") +
      ".se-overlay{position:fixed;inset:0;background:rgba(10,12,16,.55);display:flex;align-items:center;justify-content:center;z-index:2147483000;padding:16px;opacity:0;transition:opacity .25s ease}" +
      ".se-overlay.se-show{opacity:1}" +
      ".se-modal{background:#fff;color:#111;max-width:420px;width:100%;border-radius:14px;padding:28px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,.3);position:relative;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;transform:translateY(12px);transition:transform .25s ease}" +
      ".se-show .se-modal{transform:none}" +
      ".se-modal h2{margin:0 0 8px;font-size:1.35rem;line-height:1.25;color:#111}" +
      ".se-modal p{margin:0 0 18px;color:#444;line-height:1.5}" +
      ".se-cta{display:block;text-align:center;background:" + c + ";color:#fff !important;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600}" +
      ".se-cta:hover{filter:brightness(1.07)}" +
      ".se-skip{display:block;margin:12px auto 0;background:none;border:0;color:#666;cursor:pointer;font-family:inherit;font-size:.9rem}" +
      ".se-x{position:absolute;top:8px;right:10px;background:none;border:0;font-size:24px;line-height:1;color:#888;cursor:pointer;padding:4px 8px}" +
      ".se-lang{font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans',Helvetica,Arial,sans-serif;position:fixed;left:16px;right:16px;bottom:16px;max-width:460px;margin:0 auto;background:#111;color:#fff;border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:center;z-index:2147482000;box-shadow:0 12px 30px rgba(0,0,0,.25);font-size:.95rem}" +
      ".se-lang a{color:#fff;background:" + c + ";padding:6px 12px;border-radius:8px;text-decoration:none;white-space:nowrap;font-weight:600}" +
      ".se-lang button{background:none;border:0;color:#bbb;font-size:20px;cursor:pointer;margin-left:auto}";
    var s = document.createElement("style");
    s.id = "site-enhance-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- lazy loading (fallback for images without the attribute) ---------- */
  function lazyImages() {
    var vh = window.innerHeight || 800;
    Array.prototype.forEach.call(document.querySelectorAll("img"), function (img) {
      if (!img.hasAttribute("decoding")) img.decoding = "async";
      if (img.hasAttribute("loading")) return;
      var r = img.getBoundingClientRect();
      if (r.top > vh * 1.5) img.loading = "lazy";
    });
    Array.prototype.forEach.call(document.querySelectorAll("iframe:not([loading])"), function (f) {
      f.loading = "lazy";
    });
  }

  /* ---------- smooth scrolling for in-page anchors (offset for sticky headers) ---------- */
  function smoothScroll() {
    var header = document.querySelector("header");
    var sticky = header && /sticky|fixed/.test(getComputedStyle(header).position);
    if (sticky && !document.documentElement.style.scrollPaddingTop) {
      document.documentElement.style.scrollPaddingTop = (header.offsetHeight + 8) + "px";
    }
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    if (!("IntersectionObserver" in window)) return;
    var sel = "main section, section, .card, [class*='card'], .feature, [class*='feature'], .faq-item, article";
    var vh = window.innerHeight || 800;
    var nodes = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
      if (el.closest("header, nav, footer, .se-overlay")) return false;
      if (el.querySelector("[data-se-reveal]") && el.tagName === "SECTION") return false;
      var r = el.getBoundingClientRect();
      return r.top > vh * 0.9 && r.height > 0 && r.height < vh * 2.5; // only below-the-fold blocks
    }).slice(0, 80);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("se-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    nodes.forEach(function (el) { el.setAttribute("data-se-reveal", ""); io.observe(el); });
    // safety: never leave content hidden
    setTimeout(function () { nodes.forEach(function (el) { el.classList.add("se-in"); }); }, 6000);
  }

  /* ---------- microinteractions ---------- */
  function microinteractions() {
    Array.prototype.forEach.call(
      document.querySelectorAll("button, .btn, [class*='btn'], a[class*='button'], input[type=submit]"),
      function (el) { el.classList.add("se-press"); });
    Array.prototype.forEach.call(
      document.querySelectorAll(".card, [class*='card']:not([class*='cards']), .pricing-card, .feature-card"),
      function (el) { if (!el.closest("header, nav")) el.classList.add("se-lift"); });
  }

  /* ---------- language suggestion (never auto-redirects: safe for SEO) ---------- */
  function languageSuggest() {
    if (store.getItem("se_lang_dismissed")) return;
    var htmlLang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
      .map(function (l) { return String(l).slice(0, 2).toLowerCase(); });

    // collect available versions of THIS page
    var alts = {};
    Array.prototype.forEach.call(document.querySelectorAll("link[rel=alternate][hreflang]"), function (l) {
      var code = l.getAttribute("hreflang").slice(0, 2).toLowerCase();
      if (code !== "x-") alts[code] = l.href;
    });
    var prefixes = cfg.language.prefixes || {};
    Object.keys(prefixes).forEach(function (code) {
      if (!alts[code]) {
        var path = location.pathname.replace(/^\/(hi|kn|ta|te|mr|gu|bn|ml|pa)\//, "/");
        alts[code] = prefixes[code].replace(/\/$/, "") + path;
      }
    });

    var pick = null;
    for (var i = 0; i < langs.length; i++) {
      if (langs[i] === htmlLang) return;          // visitor already reads this language
      if (alts[langs[i]]) { pick = langs[i]; break; }
    }
    if (!pick) return;
    var url = alts[pick];

    function show() {
      var label = cfg.language.labels[pick] || pick.toUpperCase();
      var bar = document.createElement("div");
      bar.className = "se-lang";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Language suggestion");
      bar.innerHTML = '<span>Also available in <strong></strong></span><a></a><button aria-label="Dismiss">×</button>';
      bar.querySelector("strong").textContent = label;
      var a = bar.querySelector("a"); a.href = url; a.textContent = label + " →";
      a.addEventListener("click", function () { store.setItem("se_lang_dismissed", "1"); });
      bar.querySelector("button").addEventListener("click", function () {
        store.setItem("se_lang_dismissed", "1"); bar.remove();
      });
      document.body.appendChild(bar);
    }
    // only offer links that actually exist
    if (url.indexOf(location.origin) === 0 || url.charAt(0) === "/") {
      fetch(url, { method: "HEAD" }).then(function (r) { if (r.ok) show(); }).catch(function () {});
    } else show();
  }

  /* ---------- exit-intent popup ---------- */
  function exitIntent() {
    var ex = cfg.exitIntent;
    if (onPath(ex.skipPaths)) return;
    var last = +store.getItem("se_exit_shown") || 0;
    if (Date.now() - last < ex.daysBetween * 864e5) return;

    var href = ex.ctaHref;
    if (!href) {
      var link = document.querySelector("a[href*='wa.me'], a[href*='api.whatsapp.com']") ||
                 document.querySelector("a[href^='tel:']") ||
                 document.querySelector("a[href*='contact']");
      href = link ? link.getAttribute("href") : "/contact.html";
      if (!ex.ctaHrefTextLocked && link && /^tel:/.test(href)) ex.ctaText = "Call us now";
    }

    var armed = false, shown = false;
    setTimeout(function () { armed = true; }, ex.minSecondsOnPage * 1000);

    function open() {
      if (!armed || shown || document.querySelector(".se-overlay")) return;
      shown = true;
      store.setItem("se_exit_shown", String(Date.now()));
      var prev = document.activeElement;
      var ov = document.createElement("div");
      ov.className = "se-overlay";
      ov.innerHTML =
        '<div class="se-modal" role="dialog" aria-modal="true" aria-labelledby="se-exit-title">' +
        '<button class="se-x" aria-label="Close">×</button>' +
        '<h2 id="se-exit-title"></h2><p></p>' +
        '<a class="se-cta" rel="noopener"></a>' +
        '<button class="se-skip"></button></div>';
      ov.querySelector("h2").textContent = ex.title;
      ov.querySelector("p").textContent = ex.text;
      var cta = ov.querySelector(".se-cta");
      cta.textContent = ex.ctaText; cta.href = href;
      if (/^https?:/.test(href) && href.indexOf(location.host) === -1) cta.target = "_blank";
      ov.querySelector(".se-skip").textContent = ex.secondaryText;
      function close() {
        ov.classList.remove("se-show");
        setTimeout(function () { ov.remove(); }, 250);
        document.removeEventListener("keydown", onKey);
        if (prev && prev.focus) prev.focus();
      }
      function onKey(e) { if (e.key === "Escape") close(); }
      ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
      ov.querySelector(".se-x").addEventListener("click", close);
      ov.querySelector(".se-skip").addEventListener("click", close);
      cta.addEventListener("click", function () { setTimeout(close, 100); });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(ov);
      requestAnimationFrame(function () { ov.classList.add("se-show"); cta.focus(); });
    }

    // desktop: pointer leaves through the top of the window
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget && e.clientY <= 8) open();
    });
    // mobile: quick upward scroll after reading at least 40% of the page
    if (matchMedia("(pointer:coarse)").matches) {
      var maxY = 0, lastY = scrollY, lastT = Date.now();
      addEventListener("scroll", function () {
        var y = scrollY, t = Date.now();
        maxY = Math.max(maxY, y);
        var depth = maxY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
        var speed = (lastY - y) / Math.max(1, t - lastT); // px per ms, upward positive
        if (depth > 0.4 && speed > 1.2 && y > 200) open();
        lastY = y; lastT = t;
      }, { passive: true });
    }
  }
})();
