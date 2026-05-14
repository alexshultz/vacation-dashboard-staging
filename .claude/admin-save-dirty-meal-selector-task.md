<task>
You are an expert front-end engineer tasked with two focused bug-fix and UX improvements to the Branson 2026 admin dashboard. You will follow strict TDD: write failing Playwright tests first, confirm they fail, implement the fix, confirm all tests pass.
</task>

<background>
Project vault: `/Users/alex/vaults/Vacation/Branson 2026/`

Key files you will modify:
- `web/admin.html` — hand-edited HTML+inline JS for the admin page. Do NOT regenerate or rewrite from scratch.
- `web/js/admin-overlay.js` — shared admin JS module loaded on other pages.

Key files you will create:
- `tests/e2e/tests/admin-save-dirty.spec.js`
- `tests/e2e/tests/admin-meal-selector.spec.js`

Test runner: `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test`
Existing test pattern for reference: `tests/e2e/tests/admin-form-inputs.spec.js` — study this file to match auth helper pattern and `.env.test` loading before writing any spec.

Design system: `web/css/components.css` is LOCKED. Use existing classes only. For chip/pill elements, use `.chip` and `.chip-selected` classes already defined in `web/admin.html` `<style>` block (lines 137–153). Do not add new CSS classes to `components.css`.

Current code facts you must read before implementing anything:
- `FIELDS = ['title', 'date', 'startTime', 'duration']` at line 500 — note `series_slug` is absent.
- `saveOverrides()` at line 1079 iterates only `FIELDS`; if `rows.length === 0` it returns silently.
- `saveSeriesSlug()` at line 897 is a separate function invoked only by the "Save Series" button.
- `#save-btn` at line 468 has no disabled/highlighted state logic.
- `loadedValues` at line 1008–1009 records baseline values only for `FIELDS`.
- The meal section (`#meal-section`) currently uses `<select id="meal-include-select">`, `<select id="meal-exclude-select">`, `<ul id="meal-include-list">`, `<ul id="meal-exclude-list">`. These elements are the ones you are replacing.
- `addMealOverride(type)` at line 819, `populateMealOverrideLists()` at line 881, `saveMealOverrides()` at line 951 are the functions you will rewrite.
- `allAttendees` is the JS array containing all family name strings.
- `currentEvent.meal_override_include` and `currentEvent.meal_override_exclude` are the Supabase fields persisted.
</background>

<constraints>
1. **TDD order is non-negotiable.** For each area: (a) write the spec, (b) run the full test suite and confirm the new tests fail, (c) implement the fix, (d) run again and confirm all tests pass with no regressions.
2. **Spec file paths are exact**: `tests/e2e/tests/admin-save-dirty.spec.js` and `tests/e2e/tests/admin-meal-selector.spec.js`. Never place specs at `tests/e2e/*.spec.js`.
3. **Do not modify any HTML element not explicitly named in this task.** If you notice an element that looks unused or redundant while reading the file, flag it in your handback report but do not touch it.
4. **`web/admin.html` is hand-edited.** Make targeted surgical edits only. Do not regenerate or rewrite the file.
5. **Design system is locked.** Use existing `.chip` and `.chip-selected` styles from the admin `<style>` block. Do not invent new classes or add rules to `components.css`.
6. **Do not commit, push, or deploy.**
7. If a test is environment-dependent (requires live Supabase), design it to still exercise the DOM behavior with mocked/stubbed network calls where possible, matching patterns in existing specs.
</constraints>

<rules>
AREA 1 — Save flow + dirty-state on #save-btn:

AC-1: "Save Changes" saves the series slug field (`#series-slug-input`) as part of the full save — no separate "Save Series" button click is required. Implement by having `saveOverrides()` call `saveSeriesSlug()` (or inline equivalent) before or as part of the save sequence.

AC-2: `#save-btn` is visually highlighted/enabled ONLY when at least one tracked field (the four in `FIELDS` plus `series-slug-input`) is dirty (current value differs from the value captured at form load). Use `opacity`, `background`, or border style to visually distinguish the active vs. inactive state — match the existing button styling approach.

AC-3: When nothing is dirty, `#save-btn` is visually muted/disabled and appears non-interactive.

AC-4: Clicking `#save-btn` when nothing is dirty does nothing — no action, no error, no silent Supabase call.

Dirty-state tracking implementation notes:
- Extend `loadedValues` to also capture `series-slug-input`'s value at form load time.
- Wire `input` event listeners on all tracked fields (the four drum inputs + `#series-slug-input`) to recheck dirtiness after every change.
- Expose a `updateSaveBtnState()` helper that reads all tracked fields, compares to `loadedValues`, and sets the visual state of `#save-btn`.
- Call `updateSaveBtnState()` after `loadEventForm()` completes, and from every tracked input's change listener.

---

AREA 2 — Meal section: dual-panel batch chip selector:

Replace the existing `<select>`-based meal override UI with a chip-based dual-panel selector inside `#meal-section`. The new structure replaces the interior of the `.meal-panels` div and its children.

AC-5: Two panels side by side, using the existing `.meal-panels` and `.meal-panel` CSS structure.

AC-6: Left panel (`#meal-available-panel`): full list of all family names from `allAttendees` NOT currently in the right panel. Each name is rendered as a `<button class="chip">` with `data-name` attribute. Clicking a chip toggles `.chip-selected` on it. Multiple chips can be selected simultaneously.

AC-7: Right panel (`#meal-assigned-panel`): names currently in `meal_override_include`. Same chip style. Same multi-select toggle behavior.

AC-8: Between the panels: a vertical column or row containing `<button id="meal-add-btn">Add →</button>` and `<button id="meal-remove-btn">← Remove</button>`.

AC-9: Clicking `#meal-add-btn` moves all `.chip-selected` chips from the left panel to the right panel in one action, then clears `.chip-selected` from all chips.

AC-10: Clicking `#meal-remove-btn` moves all `.chip-selected` chips from the right panel to the left panel in one action, then clears `.chip-selected` from all chips.

AC-11: Visual design uses `.chip` and `.chip-selected` classes exactly as defined. No new CSS. Panels are visually polished and match the existing admin form aesthetic.

Implementation notes:
- Rewrite `populateMealOverrideLists(include, exclude)` to build the chip panels. The `include` array populates the right panel; all names not in `include` populate the left panel. The `exclude` array continues to be tracked separately (do not collapse the two override lists).
- Rewrite `saveMealOverrides()` to collect right-panel chip `data-name` values as `meal_override_include`, and whatever logic was previously used for `meal_override_exclude` (read remaining state from `#meal-exclude-list` if still present, or manage a JS variable if you remove those elements — but do not lose exclude data).
- Remove the `<select id="meal-include-select">` and its Add button from the HTML (these are the elements explicitly targeted for replacement). The `<select id="meal-exclude-select">` and its panel may remain or be redesigned — match the same chip pattern if you redesign it.
- `recalculateMealHeadcount()` must still work after the refactor.
</rules>

<output_format>
Execute in this exact order:

1. Read `tests/e2e/tests/admin-form-inputs.spec.js` to internalize auth helper and `.env.test` pattern.
2. Read `web/admin.html` lines 394–480 (form area) and 819–978 (JS functions).
3. Write `tests/e2e/tests/admin-save-dirty.spec.js` covering AC-1 through AC-4 with numbered test titles matching each AC.
4. Run `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/tests/admin-save-dirty.spec.js` — confirm all new tests FAIL. Record the failure output.
5. Write `tests/e2e/tests/admin-meal-selector.spec.js` covering AC-5 through AC-11.
6. Run it — confirm all new tests FAIL. Record the failure output.
7. Implement AREA 1 fix in `web/admin.html` (dirty-state tracking + series slug in save).
8. Implement AREA 2 fix in `web/admin.html` (chip-based dual-panel meal selector).
9. Run the full test suite: `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test` — confirm all new tests pass and no existing tests regress.
10. If any test fails, iterate until all pass (max 5 iterations before declaring a blocker).
</output_format>

<reminder>
- Do not guess at element IDs, function names, or variable names. Read the actual file before writing any code.
- Do not remove or modify any HTML element that is NOT part of the meal panel interior or the save/dirty-state area. If you see an element that looks unused, note it in the handback — do not delete it.
- The `.env.test` file contains `VACDASH_EMAIL`, `VACDASH_PASSWORD`, and `VACDASH_STAGING_URL` — load these exactly as existing specs do.
- Run tests from `tests/e2e/` directory, not from vault root.
- If a test failure is caused by network/auth flakiness rather than a real bug, note it and retry before concluding a failure.
- Do not commit, push, or deploy under any circumstances.

End your response with:

LAZLO_RESULT: tests_run=<yes|no> tests_passed=<yes|no|na> gave_up=<yes|no> iterations=<N>

Then list every file modified or created with a one-line description, then STOP.
</reminder>
