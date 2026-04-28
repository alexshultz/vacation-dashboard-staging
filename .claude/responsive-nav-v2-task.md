# Task: Responsive Nav v2 -- ResizeObserver + Icon Alignment

## Context

Grill-me review complete and approved. This replaces the previous 960px fixed-breakpoint
implementation that is currently in `web/js/site.js`. The previous approach used a hardcoded
media query; the approved approach is dynamic ResizeObserver.

## Target File

**One file only:** `web/js/site.js`

Do NOT touch any HTML files, components.css, tokens.css, trail.css, or any other file.
Do not modify any HTML element not explicitly named in this task. If you encounter anything
that looks unused or redundant, flag it in the handback report. Do not remove it.

---

## Change 1: Add `icon` field to NAV_LINKS

Replace the current NAV_LINKS definition with this exact version:

```js
var NAV_LINKS = [
  { href: 'index.html',           label: 'Home',       icon: '🏠' },
  { href: 'attractions.html',     label: 'Activities', icon: '🎡' },
  { href: 'quick-pick.html',      label: 'Quick Pick', icon: '🃏' },
  { href: 'wishlist.html',        label: 'Wishlist',   icon: '♥'  },
  { href: 'suggested.html',       label: 'Suggested',  icon: '✨' },
  { href: 'event-timeline.html',  label: 'Timeline',   icon: '📅' },
  { href: 'people-timeline.html', label: 'People',     icon: '👥' },
  { href: 'help.html',            label: 'Help',       icon: '❓' },
];
```

The desktop nav (`buildHeader`) must NOT render icons -- label text only, same as before.

---

## Change 2: Update buildHamburgerPanel to render icon + label with alignment

Each nav link in the hamburger panel must render as:

```html
<a href="..." class="hamburger-link" ...>
  <span class="nav-icon">🏠</span><span class="nav-label">Home</span>
</a>
```

The `.nav-icon` span must be a fixed-width column so all labels align vertically.
The Profile and theme-toggle links at the bottom of the panel are NOT nav items and do NOT
get the icon/label treatment -- leave their HTML output exactly as it is.

---

## Change 3: Replace the current injected CSS block entirely

The current `site-hamburger-styles` block contains a 960px media query from the previous
implementation. Replace the ENTIRE block content (everything inside `styleEl.textContent = ...`)
with this:

```css
/* Hamburger button */
.hamburger-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--color-ink);
  padding: 6px 10px;
  border-radius: var(--radius-btn);
  line-height: 1;
}

/* Default: hamburger mode (nav links hidden) */
.site-header .site-nav { display: none; }

/* Full nav mode (when JS adds nav-fits class to body) */
body.nav-fits .site-header .site-nav {
  display: flex;
  gap: 4px;
}
body.nav-fits .hamburger-btn { display: none; }
body.nav-fits .bottom-tabs   { display: none; }

/* Hamburger panel */
#hamburger-panel {
  position: fixed;
  top: var(--header-h, 56px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-bottom: 1.5px solid var(--color-line);
  z-index: 999;
  padding: 8px 0;
  box-shadow: var(--shadow-2, 0 4px 16px rgba(0,0,0,.15));
}

/* Hamburger links */
.hamburger-link {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  text-decoration: none;
}
.hamburger-link:hover,
.hamburger-link:focus { background: var(--color-bg); }
.hamburger-link[aria-current="page"] { color: var(--accent-moss, var(--moss)); }

/* Icon + label alignment inside hamburger links */
.nav-icon {
  display: inline-block;
  width: 2em;
  text-align: center;
  flex-shrink: 0;
  font-style: normal;
}
.nav-label {
  flex: 1;
}
```

---

## Change 4: Add ResizeObserver logic

After the hamburger toggle handlers (after the existing click, outside-click, and Escape
handlers), add a ResizeObserver that dynamically adds/removes the `nav-fits` class on `<body>`.

The logic:

```js
/* ── Responsive nav: show full links if they fit, hamburger if not ──────── */
function checkNavFit() {
  var nav = document.querySelector('.site-nav');
  var inner = document.querySelector('.site-header__inner');
  if (!nav || !inner) return;

  // Temporarily reveal nav to measure its natural width
  var wasHidden = nav.style.display === 'none' || !document.body.classList.contains('nav-fits');
  if (wasHidden) {
    nav.style.visibility = 'hidden';
    nav.style.display = 'flex';
  }
  var navWidth = nav.scrollWidth;
  if (wasHidden) {
    nav.style.display = '';
    nav.style.visibility = '';
  }

  // Available width = header inner width minus logo and hamburger button budget
  var logo = document.querySelector('.site-logo');
  var btn  = document.querySelector('.hamburger-btn');
  var logoWidth = logo ? logo.offsetWidth : 120;
  var btnWidth  = btn  ? btn.offsetWidth  : 48;
  var available = inner.clientWidth - logoWidth - btnWidth - 32; // 32px padding buffer

  if (navWidth <= available) {
    document.body.classList.add('nav-fits');
  } else {
    document.body.classList.remove('nav-fits');
    // Close panel if open when switching to hamburger mode
    var panel = document.getElementById('hamburger-panel');
    if (panel && panel.style.display !== 'none') {
      panel.style.display = 'none';
      var hBtn = document.getElementById('site-hamburger');
      if (hBtn) hBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

// Run on load
checkNavFit();

// Run on every resize
if (typeof ResizeObserver !== 'undefined') {
  var navObserver = new ResizeObserver(function() { checkNavFit(); });
  var observeTarget = document.querySelector('.site-header__inner');
  if (observeTarget) navObserver.observe(observeTarget);
} else {
  // Fallback for browsers without ResizeObserver (rare)
  window.addEventListener('resize', checkNavFit);
}
```

Place this block AFTER the existing Escape key handler and BEFORE the dark mode toggle handler.

---

## What Must NOT Change

- `buildHeader()` HTML output (structure unchanged -- no icons in desktop nav)
- `buildTabs()` HTML output
- The hamburger click handler, outside-click handler, Escape handler
- `syncBadge()` and profile badge logic
- `modeLabel()` and dark mode toggle logic
- `BOTTOM_TABS`, `NAV_ALIASES`, `SITE_NAME`, `MODE_KEY`, `USER_KEY` constants
- Cross-tab storage sync handler

---

## Verification Steps (run before handback)

```bash
# ResizeObserver logic present
grep -c 'ResizeObserver' web/js/site.js
# Must return >= 1

# Old 720px and 960px media queries gone
grep -c '720px\|960px' web/js/site.js
# Must return 0

# nav-fits class used
grep -c 'nav-fits' web/js/site.js
# Must return >= 2

# Icon field in NAV_LINKS
grep -c "icon:" web/js/site.js
# Must return >= 8

# nav-icon span in buildHamburgerPanel
grep -c 'nav-icon' web/js/site.js
# Must return >= 2

# Only site.js modified
git diff --name-only HEAD
# Must show only: web/js/site.js
```

---

## Handback Format

1. Files modified (must be only `web/js/site.js`)
2. What you found in `components.css` for `.site-nav` -- and whether the `body.nav-fits` selector approach avoids the specificity conflict from the previous attempt (document your finding)
3. Full content of the final `site-hamburger-styles` CSS string
4. Results of all 6 verification greps
5. Any items flagged as unused/redundant (do not remove -- flag only)

Do not commit, push, or rsync. PM handles handback.
