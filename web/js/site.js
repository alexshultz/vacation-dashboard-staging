/* =============================================================================
 * site.js -- Branson '26 shared site chrome
 *
 * Loaded as a SYNCHRONOUS <script> as the FIRST child of <body> on all pages.
 * Injects <header>, <nav class="bottom-tabs">, and #hamburger-panel into the
 * DOM during body parsing, before any <main> content renders -- no flash of
 * missing nav.
 *
 * Owns:
 *   - Header injection (logo, hamburger-btn, 7-link desktop nav, profile-btn, theme-toggle)
 *   - Bottom tab bar injection (3 mobile tabs)
 *   - Hamburger panel injection (7-link mobile dropdown)
 *   - aria-current="page" auto-detection from window.location.pathname
 *   - Dark mode toggle click handler
 *   - Cross-tab storage sync for vacdash:v1:mode and vacdash:v1:user
 *   - Profile button badge (data-unset) on all pages
 *
 * To add a nav item: edit NAV_LINKS and/or BOTTOM_TABS below. One file, done.
 * To add a new sub-page alias: edit NAV_ALIASES below.
 * To rename the site: edit SITE_NAME below.
 *
 * DO NOT:
 *   - Copy-paste static <header> or <nav class="bottom-tabs"> into any page
 *   - Add a storage listener for vacdash:v1:mode or :user anywhere else
 *   - Put the dark mode onclick inline on any theme-toggle button
 * ============================================================================= */
(function () {
  'use strict';

  /* ── Constants ───────────────────────────────────────────────────────────── */
  var SITE_NAME = "Branson \u201926";   /* Branson '26 — U+2019 RIGHT SINGLE QUOTATION MARK */
  var MODE_KEY  = 'vacdash:v1:mode';
  var USER_KEY  = 'vacdash:v1:user';

  /* ── Nav definition (single source of truth) ─────────────────────────────── */
  var NAV_LINKS = [
    { href: 'index.html',           label: 'Home'       },
    { href: 'attractions.html',     label: 'Activities' },
    { href: 'quick-pick.html',      label: 'Quick Pick' },
    { href: 'wishlist.html',        label: 'Wishlist'   },
    { href: 'suggested.html',       label: 'Suggested'  },
    { href: 'event-timeline.html',  label: 'Timeline'   },
    { href: 'people-timeline.html', label: 'People'     },
    { href: 'help.html',            label: 'Help'       },
  ];

  var BOTTOM_TABS = [
    { href: 'index.html',       label: 'Home',       emoji: '🏠' },
    { href: 'attractions.html', label: 'Activities',  emoji: '🎡' },
    { href: 'wishlist.html',    label: 'Wishlist',    emoji: '♡'  },
  ];

  /* Sub-page aliases: these filenames highlight a parent nav/tab entry */
  var NAV_ALIASES = {
    'shows.html': 'attractions.html',
  };

  /* ── Active page detection ───────────────────────────────────────────────── */
  var pageFile = window.location.pathname.split('/').pop() || 'index.html';

  function getActiveHref() {
    /* Escape hatch: <html data-nav-current="attractions.html"> overrides auto-detection */
    var override = document.documentElement.getAttribute('data-nav-current');
    if (override) return override;
    return NAV_ALIASES[pageFile] || pageFile;
  }

  var activeHref = getActiveHref();
  var isProfile  = (pageFile === 'profile.html');

  /* ── HTML builders ───────────────────────────────────────────────────────── */
  function buildHeader() {
    var links = NAV_LINKS.map(function (l) {
      var cur = (l.href === activeHref) ? ' aria-current="page"' : '';
      return '<a href="' + l.href + '" class="nav-link"' + cur + '>' + l.label + '</a>';
    }).join('');

    var hamburger =
      '<button class="hamburger-btn" id="site-hamburger"' +
      ' aria-label="Menu" aria-expanded="false">&#9776;</button>';

    return (
      '<header class="site-header"><div class="site-header__inner">' +
      '<a class="site-logo" href="index.html">' + SITE_NAME + '</a>' +
      hamburger +
      '<nav class="site-nav" aria-label="Main">' + links + '</nav>' +
      '</div></header>'
    );
  }

  function buildTabs() {
    var tabs = BOTTOM_TABS.map(function (t) {
      var cur = (t.href === activeHref) ? ' aria-current="page"' : '';
      return (
        '<a href="' + t.href + '" class="tab" aria-label="' + t.label + '"' +
        cur + '>' + t.emoji + '</a>'
      );
    }).join('');
    return '<nav class="bottom-tabs" aria-label="Main navigation">' + tabs + '</nav>';
  }

  function buildHamburgerPanel() {
    var links = NAV_LINKS.map(function (l) {
      var cur = (l.href === activeHref) ? ' aria-current="page"' : '';
      return '<a href="' + l.href + '" class="hamburger-link"' + cur + '>' + l.label + '</a>';
    }).join('');
    var profCur = isProfile ? ' aria-current="page"' : '';
    return (
      '<div id="hamburger-panel" role="navigation" aria-label="Menu" style="display:none">' +
      links +
      '<hr style="margin: 8px 24px; border-color: var(--color-line)">' +
      '<button class="hamburger-link hamburger-theme-toggle" id="site-theme-toggle" aria-label="Toggle dark mode">\u2699\uFE0F System</button>' +
      '<a class="hamburger-link" href="profile.html" id="profile-btn" aria-label="Profile"' + profCur + '>\uD83D\uDC64 Profile<span class="profile-nudge-dot" aria-hidden="true"></span></a>' +
      '</div>'
    );
  }

  function modeLabel(m) {
    if (m === 'light') return '\u2600\uFE0F Light';
    if (m === 'dark')  return '\uD83C\uDF19 Dark';
    return '\u2699\uFE0F System';
  }

  /* ── Inject chrome (synchronous -- runs during body parsing) ─────────────── */
  var cs = document.currentScript;
  if (cs && !document.querySelector('.site-header')) {
    cs.insertAdjacentHTML('afterend', buildHeader() + buildTabs() + buildHamburgerPanel());

    /* Set initial theme-toggle label from stored mode */
    var initToggle = document.getElementById('site-theme-toggle');
    if (initToggle) {
      var initMode = 'system';
      try { initMode = localStorage.getItem(MODE_KEY) || 'system'; } catch (e) {}
      initToggle.textContent = modeLabel(initMode);
    }

    if (!document.getElementById('site-hamburger-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'site-hamburger-styles';
      styleEl.textContent =
        '.hamburger-btn {\n' +
        '  display: flex;\n' +
        '  align-items: center;\n' +
        '  background: none;\n' +
        '  border: none;\n' +
        '  font-size: 22px;\n' +
        '  cursor: pointer;\n' +
        '  color: var(--color-ink);\n' +
        '  padding: 6px 10px;\n' +
        '  border-radius: var(--radius-btn);\n' +
        '  line-height: 1;\n' +
        '}\n' +
        '#hamburger-panel {\n' +
        '  position: fixed;\n' +
        '  top: var(--header-h, 56px);\n' +
        '  left: 0;\n' +
        '  right: 0;\n' +
        '  background: var(--color-surface);\n' +
        '  border-bottom: 1.5px solid var(--color-line);\n' +
        '  z-index: 999;\n' +
        '  padding: 8px 0;\n' +
        '  box-shadow: var(--shadow-2, 0 4px 16px rgba(0,0,0,.15));\n' +
        '}\n' +
        '.hamburger-link {\n' +
        '  display: block;\n' +
        '  padding: 14px 24px;\n' +
        '  font-family: var(--font-display);\n' +
        '  font-size: var(--text-base);\n' +
        '  font-weight: 700;\n' +
        '  color: var(--color-ink);\n' +
        '  text-decoration: none;\n' +
        '}\n' +
        '.hamburger-link:hover,\n' +
        '.hamburger-link:focus { background: var(--color-bg); }\n' +
        '.hamburger-link[aria-current="page"] { color: var(--accent-moss, var(--moss)); }\n' +
        '@media (min-width: 720px) {\n' +
        '  #hamburger-panel { display: none !important; }\n' +
        '}';
      document.head.appendChild(styleEl);
    }
  }

  /* ── Hamburger toggle ────────────────────────────────────────────────────── */
  var hamburgerBtn   = document.getElementById('site-hamburger');
  var hamburgerPanel = document.getElementById('hamburger-panel');
  if (hamburgerBtn && hamburgerPanel) {
    hamburgerBtn.addEventListener('click', function () {
      var isOpen = hamburgerPanel.style.display !== 'none';
      hamburgerPanel.style.display = isOpen ? 'none' : 'block';
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
    // B. Outside click — close panel
    document.addEventListener('click', function (e) {
      if (hamburgerPanel.style.display === 'none') return;
      if (hamburgerPanel.contains(e.target) || hamburgerBtn.contains(e.target)) return;
      hamburgerPanel.style.display = 'none';
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
    // C. Escape key — close panel
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && hamburgerPanel.style.display !== 'none') {
        hamburgerPanel.style.display = 'none';
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Dark mode toggle ────────────────────────────────────────────────────── */
  var toggleBtn = document.getElementById('site-theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var modes = ['system', 'light', 'dark'];
      var m     = document.documentElement.getAttribute('data-mode') || 'system';
      var next  = modes[(modes.indexOf(m) + 1) % 3];
      document.documentElement.setAttribute('data-mode', next);
      try { localStorage.setItem(MODE_KEY, next); } catch (e) {}
      toggleBtn.textContent = modeLabel(next);
    });
  }

  /* ── Profile badge sync ──────────────────────────────────────────────────── */
  function syncBadge() {
    var btn = document.getElementById('profile-btn');
    if (!btn) return;
    var u = '';
    try { u = localStorage.getItem(USER_KEY) || ''; } catch (e) {}
    btn.setAttribute('data-unset', u ? 'false' : 'true');
  }
  syncBadge();   /* set initial badge state on every page load */

  /* ── Cross-tab storage sync ──────────────────────────────────────────────── */
  window.addEventListener('storage', function (e) {
    if (e.key === MODE_KEY) {
      document.documentElement.setAttribute('data-mode', e.newValue || 'system');
    }
    if (e.key === USER_KEY) {
      syncBadge();
    }
  });

})();
