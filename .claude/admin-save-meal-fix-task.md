<role_and_goal>
You are fixing three specific failures in the Branson 2026 admin page. Two are in admin.html JS/HTML. One is a spec bug in a test file you wrote. Read the files listed below before touching anything. Then fix exactly the three issues described. Do not refactor, rename, or change anything outside the described scope.
</role_and_goal>

<uncertainty_protocol>
If uncertain about any element ID, function name, or current code shape: READ the file first. Never guess.
</uncertainty_protocol>

<static_background>
<target_files>
  /Users/alex/vaults/Vacation/Branson 2026/web/admin.html
  /Users/alex/vaults/Vacation/Branson 2026/tests/e2e/tests/admin-save-dirty.spec.js
  /Users/alex/vaults/Vacation/Branson 2026/tests/e2e/tests/admin-meal-chips.spec.js
</target_files>
<test_run_command>cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --grep "admin-save-dirty|admin-meal-chips"</test_run_command>
<full_suite_command>cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test</full_suite_command>
</static_background>

<task>

<issue_1 id="save-btn-initial-disabled">
<title>#save-btn must start disabled in HTML -- it does not</title>

<diagnosis>
The #save-btn element in admin.html has no `disabled` attribute and no `cursor:not-allowed` in its inline style. updateSaveBtnDirty() has an early-return guard (`if (loadedValues.title === undefined) return`) that fires before the button is ever disabled on initial page load. Result: the button is always enabled on load, which is wrong.
</diagnosis>

<fix>
1. Add `disabled` attribute directly to the `#save-btn` HTML element in admin.html.
2. Add `cursor:not-allowed;opacity:0.6` to its inline style so it visually matches the disabled state from the start, before any JS runs.
3. Do NOT change updateSaveBtnDirty(). The early-return guard is intentional for mid-load safety. The fix is to start disabled in HTML.
</fix>
</issue_1>

<issue_2 id="save-btn-dirty-detection">
<title>updateSaveBtnDirty() is not detecting title changes as dirty</title>

<diagnosis>
After an event loads and loadedValues is populated, typing into #input-title triggers updateSaveBtnDirty() via the input event listener. But the button does not turn green. The test receives `rgb(255, 253, 247)` (surface color) instead of the green `rgb(63, 107, 58)` (--status-yes). This means the dirty check is running but evaluating clean when it should be dirty.

Root cause to investigate: read updateSaveBtnDirty() and the loadEventForm() sequence carefully. Specifically check:
- When loadedValues is populated relative to when the event selector change listener fires
- Whether the form field values are read and stored AFTER the async Supabase fetch settles (they must be)
- Whether the input event listeners on FIELDS inputs are attached once at DOMContentLoaded (correct) or re-attached on each loadEventForm() (would cause stale closure issues)

Fix the root cause. Do not work around it by adding delays or setTimeout.
</diagnosis>
</issue_2>

<issue_3 id="meal-spec-needs-meal-type">
<title>admin-meal-chips.spec.js tests a non-meal event</title>

<diagnosis>
The meal chip panels (#meal-include-left-panel, #meal-exclude-left-panel) are only populated with chips when the loaded event has event_type = 'meal'. The spec calls selectFirstEvent() which picks whatever event is first in the selector -- almost certainly not a meal event. So the panels are empty and all chip-related assertions fail.
</diagnosis>

<fix>
In admin-meal-chips.spec.js, add a helper or inline step after selectFirstEvent() to switch the event type to "meal":
- Click the "Meal" segmented control button (data-value="meal" on the .seg-btn elements)
- Wait for the meal section (#meal-section) to be visible
- Wait for at least one chip to appear in #meal-include-left-panel (the allAttendees list populates asynchronously)

Apply this setup to every test in admin-meal-chips.spec.js that needs to interact with the chip panels. Tests that only check for absence of elements (e.g. "Save Overrides button does not exist") do not need to be in meal mode -- check whether they actually need it.
</fix>
</issue_3>

</task>

<execution_order>
STEP 1: Read admin.html -- focus on #save-btn HTML element, updateSaveBtnDirty() function, loadEventForm() sequence, and how/when loadedValues is populated and input listeners are attached.
STEP 2: Read admin-save-dirty.spec.js and admin-meal-chips.spec.js in full.
STEP 3: Fix Issue 1 (save-btn disabled attribute in HTML).
STEP 4: Fix Issue 2 (dirty detection root cause -- investigate and fix).
STEP 5: Fix Issue 3 (meal spec: switch to meal type before chip tests).
STEP 6: Run targeted suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --grep "admin-save-dirty|admin-meal-chips"
  - All admin-save-dirty tests must pass.
  - All admin-meal-chips tests must pass.
  - Fix any remaining failures before proceeding.
STEP 7: Run full suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
  - Pre-existing passing tests must not regress.
  - NOTE: Some tests will timeout on login (#editor-section) due to parallel worker concurrency against the admin auth endpoint. These are pre-existing flakies. If a test fails on first attempt but passes on retry (Playwright will auto-retry), it is NOT a regression from your changes.
  - A genuine regression is a test that fails on BOTH attempts AND was not failing before your changes.
  - You may check git stash to verify what was failing before your changes if needed.
</execution_order>

<hallucination_guard>
- You may only modify: web/admin.html, tests/e2e/tests/admin-save-dirty.spec.js, tests/e2e/tests/admin-meal-chips.spec.js
- Do NOT modify any other file.
- Do NOT add new save functions or rename existing ones.
- Do NOT commit, push, copy files, or update logs.
</hallucination_guard>

<output_format>
Step number and name before each step. Terminal commands and full output. Pass/fail verdict after each test run.
After STEP 7 completes, output ONLY the handback clause and STOP.
</output_format>

<handback_clause>
## Files Modified
- `web/admin.html` -- [one-line description]
- `tests/e2e/tests/admin-save-dirty.spec.js` -- [one-line description, or "no changes needed"]
- `tests/e2e/tests/admin-meal-chips.spec.js` -- [one-line description]

Do not commit. Do not push. Do not copy files. Do not update any log. STOP.
</handback_clause>
