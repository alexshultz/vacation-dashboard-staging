# Codemaster Task: Quick Pick Mode Switch Is Broken -- Full Diagnosis and Fix Required
# Branson '26 Dashboard
# Date: 2026-04-23

## The Problem (Confirmed by User Screenshot)

When the user taps the "🎴 Quick Pick" button (which turns green/active), the page does NOT switch to swipe mode. The 2x2 browse card grid remains fully visible. The swipe deck does not appear. The toggle visual state (button turns green) works, but the actual view switch does not happen.

This has been "fixed" three times without result. Do NOT apply another patch on top of existing code. Diagnose from the actual current file state and fix it correctly.

## File to Fix

`web/attractions.html`

**CRITICAL: Do NOT run `scripts/generate_dashboard.py` -- it will destroy all Quick Pick code.**

## What Should Happen When Quick Pick is Tapped

1. The `catalogGrid` element (id="catalog-grid") should be hidden -- `display: none`
2. The `deckWrap` element (id="deck-wrap") should become visible
3. `document.body` should have class `qp-mode` added
4. The swipe deck should render cards from the catalog

## Diagnosis Steps Required (do these first, fix second)

1. Open `web/attractions.html` and find the Quick Pick `<script>` block (search for "Quick Pick mode")
2. Check whether the script block has a guard clause that might be aborting early (`required elements missing; aborting init`) -- if any of the required element IDs are missing from the HTML, the entire script returns early and NOTHING works
3. Check the order of `<script>` tags -- if the Quick Pick script runs before `picks.js` is loaded, `picks` will be undefined and may throw, aborting the IIFE
4. Check the `setMode` function -- does it actually set `catalogGrid.hidden = true` and `deckWrap.hidden = false`? Print the actual code.
5. Check the HTML: does `<section id="deck-wrap" hidden ...>` exist? Does `<div id="catalog-grid">` exist?
6. Check for any JavaScript errors that would prevent the event listeners from being registered (look for syntax errors, missing closing braces, etc.)
7. Check if `picks.js` is loaded BEFORE the Quick Pick script. If not, that's the bug.

## Most Likely Causes (check these in order)

**Cause A: Script load order.** `picks.js` must be loaded before the Quick Pick script. If the Quick Pick IIFE references `picks` and `picks` isn't defined yet, the entire IIFE throws and the button event listeners are never registered. The buttons render but do nothing when clicked.

**Cause B: Guard clause abort.** The script checks `if (!modeBrowseBtn || !modeQpBtn || !deckWrap || !deckStage || !catalogGrid)` and returns early. If any one of these IDs is wrong or missing from the HTML, nothing works. Verify every ID exists.

**Cause C: CSS conflict.** `deckWrap.hidden = false` in JS removes the `hidden` attribute, but if a CSS rule re-adds `display: none` via a selector other than `[hidden]`, the element stays invisible. Check all CSS rules that target `#deck-wrap` or `.deck-wrap`.

**Cause D: Event listeners never attached.** If the script throws before reaching `modeBrowseBtn.addEventListener(...)`, the buttons never get listeners. The fix is finding the throw.

## The Fix

After diagnosing the root cause:

1. Fix the actual cause (don't just patch around it)
2. If it's a script load order issue, move `picks.js` script tag before the Quick Pick script tag
3. If it's a missing element ID, fix the ID mismatch
4. If it's a CSS conflict, fix the CSS rule
5. Add a visible console.log at the TOP of the Quick Pick IIFE: `console.log('[QP] script init');` and at the bottom of setMode: `console.log('[QP] setMode called:', mode, 'catalogGrid hidden:', catalogGrid.hidden, 'deckWrap hidden:', deckWrap.hidden);` -- this lets us verify execution in browser devtools

## Quality Gates

1. `grep -c "addEventListener" web/attractions.html | grep "deck-mode"` -- verify the click listeners are present
2. `grep -n "picks.js" web/attractions.html` -- verify picks.js loads BEFORE the Quick Pick script block (lower line number)
3. `grep -c "console.log.*QP" web/attractions.html` -- must return >= 2 (the debug logs added)
4. `grep -c "deck-mode-toggle" web/attractions.html` -- must return 1

## Completion Report

When done:
1. State the root cause you found
2. List exactly what you changed and why
3. Confirm quality gates
4. STOP. Do not commit, push, or run the generator.
Hermes will verify and push only after Alex confirms it works.
