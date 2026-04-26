# Codemaster Task: Quick Pick Card Auto-Sizing + Description Bug Fix
# Branson '26 Dashboard
# Date: 2026-04-23

## Context

- Vault: `/Users/alex/vaults/Vacation/Branson 2026/`
- File to edit: `web/attractions.html` and `web/css/components.css`
- DO NOT run `scripts/generate_dashboard.py` -- it will overwrite hand-edited Quick Pick code

## Problem 1: Card doesn't fit the screen in Quick Pick mode

On iPhone Safari (viewport ~844px), Quick Pick mode shows:
- Header (Branson '26): ~60px
- Filter row (Filter / Browse / Quick Pick): ~70px
- "X remaining of Y" count: ~35px
- `.deck-stage` fixed height: 480px (mobile) / 560px (desktop)
- Action buttons (Skip/Undo/Wishlist circles): ~80px
- Bottom tabs: ~50px
- Safari browser bar: ~50px

Total = exceeds viewport. The action buttons are nearly hidden -- only their top arc is visible. The user cannot easily tap Skip or Wishlist without scrolling.

## Fix 1: Dynamic height via flex

**The approach:** In `body.qp-mode`, convert the layout to a flex column that fills the available viewport height. The `.deck-stage` gets `flex: 1` and grows to fill whatever space remains after the filter row, count text, and action buttons take their natural heights. No magic numbers needed.

### CSS changes in `web/css/components.css`:

1. **Replace** the existing `body.qp-mode` rule block:
```css
/* Current (REMOVE/REPLACE): */
body.qp-mode .page-hero,
body.qp-mode .test-banner,
body.qp-mode #live-count { display: none !important; }
body.qp-mode { overflow: hidden; }

/* New (REPLACE WITH): */
body.qp-mode .page-hero,
body.qp-mode .test-banner { display: none !important; }
body.qp-mode {
  overflow: hidden;
}
body.qp-mode .page-main {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 56px - 56px); /* 56px header + 56px bottom tabs */
  overflow: hidden;
  padding-bottom: 0;
}
body.qp-mode .deck-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin-bottom: 0;
}
body.qp-mode .deck-stage {
  flex: 1;
  min-height: 0;
  height: auto !important; /* override the fixed 480px/560px */
}
```

2. **Keep** the existing `#live-count` hidden rule -- but move it into the block above (it should stay hidden in QP mode). Add:
```css
body.qp-mode #live-count { display: none !important; }
```

**Do NOT change** `.deck-stage` base rule (keep `height: 480px/560px` for Browse mode -- those still work there). The `body.qp-mode .deck-stage` override only applies in Quick Pick mode.

**Also:** The `page-main` selector needs a `padding-bottom: 0` override because the standard `.page-main` likely has bottom padding that wastes space in QP mode. Verify by reading the existing `.page-main` rule first.

---

## Problem 2: Description shows raw markdown URL syntax

In the swipe card, the description field renders like:
`"America's Top Country Hits brings the hi… ] (https://www.branson.com/shows/...)"`

This is because descriptions in `data/attractions.json` may contain markdown link syntax: `[text](url)`. The card template renders them as raw strings.

### Fix 2: Strip markdown links in the card rendering JS

In `web/attractions.html`, find the `buildCard()` or `cardHTML()` function that reads `desc` from the attraction data. Add a helper to strip markdown links before rendering:

```javascript
function stripMarkdown(text) {
  if (!text) return '';
  // Strip [label](url) -> label
  return text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
             // Strip bare URLs
             .replace(/https?:\/\/\S+/g, '')
             .trim();
}
```

Apply it: wherever `dp.textContent = desc` or similar renders the description in the swipe card, wrap with `stripMarkdown(desc)`.

**Do NOT** apply this to the full detail modal (the modal should show proper description text from the browse grid, which is already rendered correctly there).

---

## Files to Modify

- `web/css/components.css` -- QP mode flex layout overrides
- `web/attractions.html` -- `stripMarkdown` helper + apply to deck card description only

## Files NOT to Touch

- `scripts/generate_dashboard.py` -- NEVER run this
- `data/attractions.json` -- read only
- `web/js/picks.js` -- read only
- Any other HTML files

---

## Quality Gates (run before stopping)

1. `grep -c "flex: 1" web/css/components.css` -- must return >= 2 (deck-wrap and deck-stage overrides)
2. `grep -c "stripMarkdown" web/attractions.html` -- must return >= 2 (definition + at least one usage)
3. `grep -c "height: auto" web/css/components.css` -- must return >= 1
4. `grep -c "100dvh" web/css/components.css` -- must return >= 1

---

## Completion Report

When all code changes are done:
1. List every file modified with a one-line description.
2. Note any judgment calls (e.g., if `.page-main` had no padding-bottom, or if dvh isn't supported and you used fallback).
3. Note anything that could NOT be done as specified.
4. STOP. Do not commit, push, or run the generator.
