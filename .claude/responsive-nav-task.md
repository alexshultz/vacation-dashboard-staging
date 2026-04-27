# Task: Responsive Nav -- Fix iPad hamburger / full nav conflict

## Context

Grill-me review is complete and approved. See `grill-me docs/responsive-nav-grillme.md` for full Q&A.

## Problem

On iPad-width viewports, both `.hamburger-btn` AND `.site-nav` (full desktop nav links) are simultaneously visible. The hamburger button also does nothing when tapped because the existing `@media (min-width: 720px) { #hamburger-panel { display: none !important } }` overrides the JS click handler.

Root cause: `.site-nav` has no `display: none` default rule. Both elements show at all widths with no hide logic for the other's breakpoint.

## Target File

**One file only:** `web/js/site.js`

Do NOT touch: any HTML files, components.css, tokens.css, trail.css, or any other CSS file. Do NOT modify any JS logic outside the injected CSS string in `buildHamburger` / the `site-hamburger-styles` style block.

Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.

## Exact Changes Required

All changes are inside the injected `site-hamburger-styles` CSS string (lines 140-178 in the current file).

### 1. Add `.site-nav { display: none; }` as a mobile-first default

Insert this rule into the injected CSS block alongside the existing `.hamburger-btn` rules:

```css
.site-nav { display: none; }
```

This is the key missing rule. Without it, `.site-nav` shows at all widths.

### 2. Replace the 720px breakpoint entirely

**Remove:**
```css
@media (min-width: 720px) {
  #hamburger-panel { display: none !important; }
}
```

**Replace with:**
```css
@media (min-width: 960px) {
  .hamburger-btn   { display: none; }
  #hamburger-panel { display: none !important; }
  .site-nav        { display: flex; gap: 4px; }
  .bottom-tabs     { display: none; }
}
```

### 3. Check components.css for `.site-nav` conflicts

Before implementing, check `web/css/components.css` for any rule that sets `display` on `.site-nav`. If found:
- If it sets `display: flex` unconditionally, increase specificity of the injected rule to `.site-header .site-nav { display: none; }` (mobile default) so it wins
- Document what you found in the handback report regardless

## What Must NOT Change

- No changes to hamburger toggle JS logic (click handler, outside-click handler, Escape handler)
- No changes to `syncBadge()` or profile badge logic
- No changes to `buildHeader()`, `buildTabs()`, `buildHamburgerPanel()` HTML output
- No changes to NAV_LINKS, BOTTOM_TABS, NAV_ALIASES constants
- No changes to dark mode toggle logic
- No changes to any HTML page files

## Verification Steps (run before handback)

```bash
# Injected CSS must contain the new default rule
grep -c 'site-nav.*display.*none' web/js/site.js
# Must return >= 1

# Old 720px breakpoint must be gone
grep -c '720px' web/js/site.js
# Must return 0

# New 960px breakpoint must be present
grep -c '960px' web/js/site.js
# Must return >= 1

# hamburger-btn display:none must be in the 960px block
grep -A5 '960px' web/js/site.js | grep -c 'hamburger-btn'
# Must return >= 1

# No other files modified
git diff --name-only HEAD
# Must show only: web/js/site.js
```

## Handback Format

List:
1. Files modified (must be only `web/js/site.js`)
2. What you found in `components.css` for `.site-nav` and how you resolved any conflict
3. The exact CSS string content of `site-hamburger-styles` after your changes (full block)
4. Results of all verification grep commands above
5. Any elements flagged as unused/redundant (do not remove -- flag only)

Do not commit, push, or rsync. PM handles handback.
