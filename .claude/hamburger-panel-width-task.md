# Task: Hamburger Panel -- Right-Anchored, Content-Width

## Context

Grill-me complete. Alex's requirement: the hamburger panel must be only as wide as its
content and anchored to the right edge of the screen. Currently it spans full viewport
width (left: 0; right: 0), forcing the user to reach across the screen to tap items
that opened from the upper-right corner.

## Target File

**One file only:** `web/js/site.js` -- injected CSS block only.

Do NOT touch any JS logic, HTML builders, constants, or any other file.
Do not modify any HTML element not explicitly named in this task.

---

## Exact Changes to `#hamburger-panel` CSS Rule

Find the `#hamburger-panel` rule in the `site-hamburger-styles` injected CSS block and
apply these changes:

**Remove:**
```css
left: 0;
border-bottom: 1.5px solid var(--color-line);
```

**Add:**
```css
width: max-content;
max-width: calc(100vw - 16px);
border: 1.5px solid var(--color-line);
border-radius: 0 0 0 var(--radius-btn);
```

The final `#hamburger-panel` rule must be:
```css
#hamburger-panel {
  position: fixed;
  top: var(--header-h, 56px);
  right: 0;
  width: max-content;
  max-width: calc(100vw - 16px);
  background: var(--color-surface);
  border: 1.5px solid var(--color-line);
  border-radius: 0 0 0 var(--radius-btn);
  z-index: 999;
  padding: 8px 0;
  box-shadow: var(--shadow-2, 0 4px 16px rgba(0,0,0,.15));
}
```

---

## What Must NOT Change

- `right: 0` must remain
- All other rules in the injected CSS block unchanged
- All JS handlers, HTML builders, constants, NAV_LINKS, icons -- unchanged
- No other files touched

---

## Verification Steps

```bash
# left: 0 is gone from hamburger-panel
grep -A15 '#hamburger-panel' web/js/site.js | grep -c 'left: 0'
# Must return 0

# width: max-content present
grep -c 'max-content' web/js/site.js
# Must return 1

# border (not border-bottom) present
grep -A15 '#hamburger-panel' web/js/site.js | grep -c "border: 1.5px"
# Must return 1

# Only site.js modified
git diff --name-only HEAD
# Must show only web/js/site.js
```

## Handback Format

1. Files modified
2. The exact final `#hamburger-panel` rule as it appears in the file
3. Grep results
4. Any flags

Do not commit, push, or rsync. PM handles handback.
