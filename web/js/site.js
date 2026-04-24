/* =============================================================================
 * site.js -- Branson '26 shared site chrome
 *
 * Loaded as a SYNCHRONOUS <script> as the FIRST child of <body> on all pages.
 * Injects <header> and <nav class="bottom-tabs"> into the DOM during body
 * parsing, before any <main> content renders -- no flash of missing nav.
 *
 * Owns:
 *   - Header injection (logo, 7-link desktop nav, profile-btn, theme-toggle)
 *   - Bottom tab bar injection (6 mobile tabs)
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
    { href: 'wishlist.html',        label: 'Wishlist'   },
    { href: 'suggested.html',       label: 'Suggested'  },
    { href: 'event-timeline.html',  label: 'Timeline'   },
    { href: 'people-timeline.html', label: 'People'     },
    { href: 'help.html',            label: 'Help'       },
  ];

  var BOTTOM_TABS = [
    { href: 'index.html',           label: 'Home',       emoji: '🏠' },
    { href: 'attractions.html',     label: 'Activities', emoji: '🎡' },
    { href: 'wishlist.html',        label: 'Wishlist',   emoji: '♡'  },
    { href: 'suggested.html',       label: 'Suggested',  emoji: '💡' },
    { href: 'event-timeline.html',  label: 'Timeline',   emoji: '📅' },
    { href: 'people-timeline.html', label: 'People',     emoji: '👥' },
  ];

  /* Sub-page aliases: these filenames highlight a parent nav/tab entry */
  var NAV_ALIASES = {
    'quick-pick.html': 'attractions.html',
    'shows.html':      'attractions.html',
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

    var profCur = isProfile ? ' aria-current="page"' : '';
    var profileBtn =
      '<a class="header-profile-btn" href="profile.html"' +
      ' aria-label="Profile"' + profCur + ' id="profile-btn">' +
      '<span aria-hidden="true">\uD83D\uDC64</span>' +
      '<span class="profile-nudge-dot" aria-hidden="true"></span></a>';

    var toggle =
      '<button class="theme-toggle" id="site-theme-toggle"' +
      ' aria-label="Toggle dark mode">\u2600\uFE0F</button>';

    return (
      '<header class="site-header"><div class="site-header__inner">' +
      '<a class="site-logo" href="index.html">' + SITE_NAME + '</a>' +
      '<nav class="site-nav" aria-label="Main">' + links + '</nav>' +
      toggle + profileBtn +
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

  /* ── Inject chrome (synchronous -- runs during body parsing) ─────────────── */
  var cs = document.currentScript;
  if (cs && !document.querySelector('.site-header')) {
    cs.insertAdjacentHTML('afterend', buildHeader() + buildTabs());
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
