# Grill-Me: Search Bar for attractions.html
**Task:** Replace chip filter strip with live search bar (phrase + `tag:` + `-tag:` operators)
**Date:** 2026-05-04
**Brief:** `.claude/search-bar-task.md`

---

## Q0 -- Musk Existence Check
**What is the version of this task that doesn't need to exist? What can be deleted instead of added?**

Answer: The chip filter strip can be deleted with zero replacement (just show all cards by default). But without any filter mechanism, discovery is harder for new users. The search bar adds ~60 lines of JS in exchange for dramatically better UX -- that trade is worth it. The grill-me check confirms: build the search bar, not "nothing."

Alex's Thoughts:

---

## Q1 -- localStorage migration
**The old key is `vacdash:v1:filter`. The new key is `vacdash:v1:search`. What happens to users who have a chip filter saved in localStorage when they load the new version?**

Answer: The old key stores a tag string like "free" or "outdoor". On first load after the update, the new code reads `vacdash:v1:search` (which won't exist yet) and defaults to empty query -- all 310 cards show. The old `vacdash:v1:filter` key sits in localStorage orphaned but harmless. No migration needed. The user just starts fresh with the search bar empty.

Alex's Thoughts:

---

## Q2 -- `data-search` attribute encoding
**The search blob will be stored as a `data-search` HTML attribute. Should it be escaped (HTMLencoded) or raw? Could special characters in attraction names (apostrophes, ampersands) cause problems?**

Answer: `escAttr()` already exists in the render loop and handles this correctly. The `data-search` value should be set as a JS property assignment (`cardEl.dataset.search = ...`) NOT injected as raw HTML -- JS property assignment bypasses HTML encoding entirely, so apostrophes and ampersands in names are stored as-is and matched as-is. No encoding issue.

Alex's Thoughts:

---

## Q3 -- `data-search` lowercase timing
**Should the blob be lowercased at storage time (in renderCatalog) or at query time (in applySearch)?**

Answer: Lowercase at storage time inside `renderCatalog()`. This means `applySearch()` just does `blob.includes(phrase)` with both already lower -- cleaner and faster. One-time cost at render, not repeated per keystroke.

Alex's Thoughts:

---

## Q4 -- Card selector in `applySearch()`
**The filter function needs to query all rendered card elements. What selector does `renderCatalog()` actually use for card elements?**

Answer: Looking at the render loop in attractions.html, the card div has class `card--light`. The brief instructs lazlo to read the file first and use the actual class. The correct selector will be `.card--light` inside `#catalog-grid`. The brief correctly says "read the file, don't guess."

Alex's Thoughts:

---

## Q5 -- Operator parsing edge cases
**What happens with malformed queries like `tag:` (no value), `-tag:` (no value), or `tag:free-tag:outdoor` (no space)?**

Answer: These are edge cases worth handling defensively. `tag:` with no value should be ignored (empty string tag match would match everything -- skip it). `-tag:` with no value -- same, ignore. `tag:free-tag:outdoor` with no space -- the parser splits on whitespace so this would parse as one token `tag:free-tag:outdoor` and fail to match anything. Users won't type this in practice. The brief's spec doesn't require edge-case hardening; implement the happy path and let edge cases fall through gracefully (worst case: no results, user rephrases).

Alex's Thoughts:

---

## Q6 -- Playwright test coverage gap
**The existing Playwright spec only tests that 1 card renders -- it doesn't test chip logic or search. Should we add a new Playwright test for search behavior as part of this task?**

Answer: No -- out of scope for this brief. The brief's scope is UI replacement only. Adding new Playwright tests would expand scope and could delay the task. Post-launch, a search test is worth adding. For now, the 20 existing tests passing is the gate.

Alex's Thoughts:

---

## Q7 -- Mobile UX: search bar placement
**The chip strip was inside a popover (hidden behind a "Filter" toggle button). The new search bar will be always-visible. Does this change the page layout enough to cause a visual problem on mobile?**

Answer: Yes, slightly -- always-visible search bar takes ~56px of vertical space that the collapsed Filter button previously didn't. This is a net improvement: users don't have to discover the toggle to filter. The inline style in the brief (`width:100%; box-sizing:border-box`) handles the mobile case correctly. No layout breakage expected.

Alex's Thoughts:

---

## Q8 -- "Showing N of M" counter
**The current counter says "Showing 132 of 132" (the visible count after blacklist filtering). Should "M" (total) reflect all 310 visible cards, or just the cards currently in the DOM after render?**

Answer: The counter reflects the DOM card count (whatever `renderCatalog()` put into `#catalog-grid`). That's already how it works. `applySearch()` reads `cards.length` from `document.querySelectorAll('.card--light')` -- which is the post-render, post-blacklist count. The denominator stays fixed; the numerator changes with the query. This is correct behavior.

Alex's Thoughts: 

---

## Q9 -- Does this task need to be broken into smaller independently-verifiable chunks?
**Can the HTML removal, the JS replacement, and the data-search addition be verified independently?**

Answer: They're tightly coupled in one file -- HTML and JS changes both need to land together for the page to work at all. Not worth splitting. Single atomic change, verified by: (1) page loads with all cards visible, (2) typing narrows cards, (3) `tag:free` works, (4) all 20 Playwright tests pass.

Alex's Thoughts:

---

**Summary:** No blocking issues. Brief is solid. Lazlo can proceed on silence.
