# Codemaster Task: Replace Quick Pick Toggle with Separate Page Navigation
# Branson '26 Dashboard
# Date: 2026-04-23
# Priority: HIGH -- multiple previous CSS/JS toggle attempts have failed

## Background

The Quick Pick mode toggle (Browse/Quick Pick on attractions.html) has been broken through multiple fix attempts. The CSS and JS appear correct when inspected statically, but the toggle does not visually switch modes on the user's iPhone in Safari. The root cause is unclear and further debugging is not productive.

## Decision: Scrap the toggle approach. Use separate pages instead.

This is simpler, more reliable, and eliminates ALL the CSS specificity / JS execution / hidden attribute issues that have plagued this feature.

## What to Build

### 1. Create `web/quick-pick.html` -- a standalone page

This page contains ONLY the Quick Pick swipe experience:
- Standard site-header (same as all other pages -- copy from attractions.html)
- Standard bottom-tabs nav (same 6 tabs -- copy from attractions.html)
- Filter row: Filter button + "← Back to Browse" link (styled as a pill button, links back to attractions.html)
- Deck count text ("X remaining of Y")
- The swipe stack (deck-stage, action buttons, end state) -- copy the full Quick Pick JS and HTML from the existing attractions.html Quick Pick script block
- NO browse card grid at all -- this page has zero `.card--light` elements

**Data source change (critical):** The current Quick Pick JS reads card data from `.catalog-grid .card--light` DOM elements on the page. Since quick-pick.html has no catalog grid, the deck must instead be built from an **inline data array**. 

Pull the attraction data from the existing `data.json` file (already in the web directory). The quick-pick.html page should `fetch('../data.json')` (or `fetch('data.json')` depending on path) on load, build the deck from that JSON, and render swipe cards directly. Each card needs: slug, name, category, duration_hours, price_adult, description, image (path: `assets/thumbs/{slug}-thumb.jpg`), tags (array).

**Filter integration:** The filter chips from attractions.html should also appear on quick-pick.html (same chip set). When a chip is selected, it narrows the deck. The filter state should be stored in sessionStorage key `vacdash:qp:filter` so navigating back and forth preserves it.

**Picks integration:** Right-swipe calls `picks.set(slug, 'wishlist')` exactly as before. Load `js/picks.js`.

**End state:** "Review wishlist" goes to `wishlist.html`. "Back to Browse" goes to `attractions.html`.

### 2. Modify `web/attractions.html`

- Remove the entire Quick Pick feature from this file:
  - Remove the `deck-mode-toggle` div (Browse/Quick Pick pill toggle)
  - Remove the `deck-wrap` section (the hidden deck HTML)
  - Remove the Quick Pick `<script>` block (the large IIFE starting with `/* Quick Pick mode`)
  - Remove the `deck-toast-wrap` and `deck-announce` elements
  - Remove the `filter-row` wrapper div -- the Filter button should go back to standalone (just `<div class="filter-popover-wrap">` with the filter button directly inside, same as before the Quick Pick addition)
  - Remove the `qp-mode` body class toggle from any remaining JS
  
- Add a **"Quick Pick" button** near the filter button that navigates to `quick-pick.html`. Style it as a green filled pill button (use `--status-yes` / `--moss` color). Text: "🎴 Quick Pick". This replaces the toggle -- it's just a link/button that goes to the separate page.

- The filter button and "Quick Pick" link sit on the same line (flex row), just like the current filter-row layout.

### 3. Update `web/css/components.css`

- Remove the `body.qp-mode` rule block entirely (it's no longer needed)
- Keep `.deck-*` classes (they'll be used on quick-pick.html)
- Keep `.filter-row` class (still used for the Filter + Quick Pick button row on attractions.html)
- Add a `.qp-nav-btn` class for the green Quick Pick navigation button:
  ```css
  .qp-nav-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--radius-pill);
    background: var(--status-yes); color: white;
    font-family: var(--font-display); font-weight: 700; font-size: 13px;
    border: none; cursor: pointer; text-decoration: none;
    min-height: 44px; white-space: nowrap;
  }
  .qp-nav-btn:hover { opacity: 0.9; }
  ```

## File Structure After This Change

```
web/
  attractions.html     -- Browse mode only, with a "🎴 Quick Pick" button that links to quick-pick.html
  quick-pick.html      -- NEW: standalone swipe page, no browse grid
  css/components.css   -- Updated: remove qp-mode rules, add qp-nav-btn
  data.json            -- Existing: quick-pick.html fetches from this
  js/picks.js          -- Existing: loaded by quick-pick.html
```

## CRITICAL: Do NOT run generate_dashboard.py

It will overwrite attractions.html and destroy work.

## Navigation Updates

- Bottom tabs on quick-pick.html: the Activities tab (🎡) should link to `attractions.html` (not quick-pick.html itself). quick-pick.html is accessed only via the Quick Pick button on attractions.html.
- The 👤 profile button goes in the header of quick-pick.html too.
- `aria-current="page"` on the Activities tab (since this is part of the Activities section).

## Quality Gates

1. `ls web/quick-pick.html` -- must exist
2. `grep -c "deck-mode-toggle" web/attractions.html` -- must return 0 (removed)
3. `grep -c "Quick Pick" web/attractions.html` -- must return >= 1 (the nav button)
4. `grep -c "qp-mode" web/css/components.css` -- must return 0 (removed)
5. `grep -c "picks.set" web/quick-pick.html` -- must return >= 1
6. `grep -c "data.json" web/quick-pick.html` -- must return >= 1 (fetches data)

## Completion Report

When done:
1. State every file created and modified with one-line descriptions.
2. Note any judgment calls (e.g., filter chip placement, data.json path).
3. Confirm quality gate results.
4. STOP. Do not commit, push, or run the generator.
Hermes will get user confirmation before pushing anything.
