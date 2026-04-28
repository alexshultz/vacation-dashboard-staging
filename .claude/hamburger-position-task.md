# Task: Hamburger Button -- Far Right Positioning

## Context

Grill-me review complete. See `grill-me docs/hamburger-position-grillme.md`.

Alex's requirement: the hamburger ☰ must always be in the far-right corner of the header,
not next to the logo. Currently it renders between the logo and the nav (HTML source order).

## Target File

**One file only:** `web/js/site.js`

Do NOT touch any HTML files, components.css, or any other file.
Do not modify any HTML element not explicitly named in this task.

---

## Change 1: Reorder buildHeader() HTML

In `buildHeader()`, the current return string is:
```
logo → hamburger → nav
```

Change it to:
```
logo → nav → hamburger
```

Specifically, in the template string inside `buildHeader()`, move the `hamburger` variable
reference to AFTER the `<nav class="site-nav">...</nav>` string, not before it.

The resulting HTML structure must be:
```html
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-logo" href="index.html">Branson '26</a>
    <nav class="site-nav" aria-label="Main">...links...</nav>
    <button class="hamburger-btn" id="site-hamburger" ...>☰</button>
  </div>
</header>
```

---

## Change 2: Add `margin-left: auto` to `.hamburger-btn` injected CSS

In the `site-hamburger-styles` injected CSS block, add `margin-left: auto;` to the
`.hamburger-btn` rule. This pushes the hamburger to the far right when it is the last
flex item and the nav is hidden.

Final `.hamburger-btn` rule must include:
```css
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
  margin-left: auto;
}
```

---

## What Must NOT Change

- NAV_LINKS, BOTTOM_TABS, NAV_ALIASES, icons
- buildTabs(), buildHamburgerPanel()
- All JS handlers (hamburger click, outside-click, Escape, checkNavFit, syncBadge, dark mode)
- The injected CSS block content (other than adding margin-left: auto to .hamburger-btn)

---

## Verification Steps

```bash
# nav comes before hamburger in buildHeader output
grep -A8 'buildHeader' web/js/site.js | grep -c 'site-nav.*hamburger\|nav.*burger'
# (visual check -- confirm site-nav string appears before hamburger variable in source)

# margin-left: auto in hamburger-btn rule
grep -c 'margin-left: auto' web/js/site.js
# Must return >= 1

# Only site.js modified
git diff --name-only HEAD
# Must show only web/js/site.js (grill-me doc pre-existing change is fine)
```

## Handback Format

1. Files modified
2. Confirm the exact order of elements in the buildHeader return string
3. Grep results
4. Any items flagged as unused/redundant

Do not commit, push, or rsync. PM handles handback.
