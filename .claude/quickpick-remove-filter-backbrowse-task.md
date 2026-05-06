<role>
You are a precise surgical code editor working on a hand-crafted HTML file for the Branson 2026 vacation dashboard. Your sole job is to make exactly five enumerated changes to one file -- no more, no less.
</role>

<background>
Project: Branson 2026 vacation dashboard. Static multi-page site.
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
Working directory: /Users/alex/vaults/Vacation/Branson 2026

File to edit: web/quick-pick.html
This file is hand-edited. It must NEVER be regenerated from any script.

FROZEN scripts -- do not run, do not mention:
- generate_dashboard.py
- generate_attractions.py

Design system: LOCKED. You may only remove the two dead CSS rules explicitly listed below. Do not add, rename, or alter any CSS token or style rule.

If you encounter any element, style, or script that looks unused or redundant but is NOT listed in the five changes below, do NOT remove it. Flag it in your handback report and leave it untouched.
</background>

<task>
Make exactly the following five changes to web/quick-pick.html. Apply them in order.

---

CHANGE 1 — Remove the filter-popover-wrap div block (approx. lines 61–111)

Remove the entire element:
```
<div class="filter-popover-wrap" id="filter-popover-wrap">
```
...through and including its closing `</div>`.

This block contains:
- A `<div class="filter-row">` holding the filter-toggle button and the `.qp-back-link` "Back to Browse" anchor
- A `<div class="filter-popover">` containing all chip buttons

Remove the entire block. None of its children are used elsewhere.

---

CHANGE 2 — Remove the Back to Browse anchor inside `.deck-end__btns` (approx. line 146)

Inside `<div class="deck-end__btns">`, remove this specific element:
```
<a href="attractions.html">Back to Browse</a>
```
This is a plain anchor with no class. Leave its two siblings untouched:
- The "Review wishlist" button/link
- The "Restart deck" button/link

---

CHANGE 3 — Remove the `.qp-back-link` CSS rules (approx. lines 46–55, inside `<style>` in `<head>`)

Remove both of the following rule blocks in their entirety:
```
.qp-back-link {
  ...
}
.qp-back-link:hover {
  ...
}
```
Both rules are dead code once the element is removed in Change 1. Remove only these two rule blocks. Do not touch any surrounding CSS.

---

CHANGE 4 — Remove the filter-toggle script block (approx. lines 155–213)

Remove the entire `<script>` block that immediately follows `<script src="js/picks.js"></script>`.

It begins with:
```
<script>
/* Filter popover open/close + chip selection */
```
And ends with:
```
  })();
</script>
```

Remove the opening `<script>` tag, all content inside, and the closing `</script>` tag. The `<script src="js/picks.js"></script>` line before it stays. Any script tags after it stay.

---

CHANGE 5 — Update the deck-empty message text (approx. line 137)

Inside `<div class="deck-empty" id="deck-empty" hidden>`, find the `<p>` element with this exact text:
```
Either the active filter has no matches, or you've already wishlisted them all. Try clearing filters.
```
Replace that text with:
```
You've already wishlisted everything -- great choices!
```
Do not alter the `<p>` tag itself, any surrounding elements, or the `hidden` attribute on the parent div.

---

No other changes. Do not touch any other element, attribute, style rule, or script.
</task>

<constraints>
- Edit web/quick-pick.html only. No other file may be modified.
- Do not run or invoke generate_dashboard.py, generate_attractions.py, or any build script.
- Do not add any new HTML, CSS, or JavaScript.
- Do not restructure, reformat, or reorder any content outside the five targeted removals/edits.
- Do not commit, push, copy files, or update any log or README.
- If line numbers have shifted due to prior edits, locate each target by its unique content, not by line number alone.
</constraints>

<verify>
After all five changes are complete, run the full Playwright E2E test suite:

```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

All 20 tests must pass. If any test fails:
1. Do NOT attempt to fix the tests themselves.
2. Do NOT make further edits to quick-pick.html beyond reverting your changes to the failing area.
3. Report the exact failure output verbatim in your handback report.
</verify>

<output_format>
Begin your response with the following structure, with no preamble before it:

## Files Modified
| File | Change |
|------|--------|
| web/quick-pick.html | [one-line description of all changes made] |

## Test Results
[Pass count and status, e.g. "20/20 passed" or exact failure output]

## Assumptions
[Any assumptions made. If none, write "None."]

Stop there. Do not add commentary, next steps, or suggestions.
</output_format>

<reminder>
- Do not invent or assume anything not explicitly stated in this brief.
- If a target element cannot be found by its described content, stop and report it -- do not guess at an alternative or remove a nearby element.
- Cite the exact selector, text, or attribute you matched when describing what you removed or changed.
- If you are uncertain whether two nearby elements are the correct targets, list both with their distinguishing attributes and state which you acted on and why.
- If the test suite produces unexpected results, report verbatim output. Do not silently re-run or modify tests.
</reminder>
