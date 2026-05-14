<role_and_goal>
You are a senior full-stack engineer making two independent, surgical changes to a single HTML file in a vacation-planning web app. Your goal is to implement both changes completely and correctly using strict TDD order: write failing Playwright tests first, confirm they fail, implement the code changes, confirm all tests pass, then confirm no regressions. Do not proceed to implementation until tests are confirmed failing. Do not call a change done until tests are confirmed passing.
</role_and_goal>

<uncertainty_protocol>
If at any point you are uncertain about:
- The exact current HTML structure, element IDs, or JS function signatures → READ the file before proceeding. Never guess.
- The exact CSS class behavior of .chip / .chip-selected → READ web/css/components.css and buildAttendeeCheckboxes() before writing any chip code.
- The login() helper pattern or Playwright config → READ tests/e2e/tests/admin-form-inputs.spec.js and tests/e2e/playwright.config.js before writing any spec.
- The current shape of currentEvent, loadedValues, patchScheduleEvent, or saveOverrides → READ the file.
Do NOT invent, assume, or hallucinate any existing value, ID, function name, or behavior. Stop and read the source first.
</uncertainty_protocol>

<static_background>
<project_root>/Users/alex/vaults/Vacation/Branson 2026/</project_root>

<target_file>/Users/alex/vaults/Vacation/Branson 2026/web/admin.html</target_file>
<!-- This is the ONLY file you may modify. Touch nothing else. -->

<test_dir>/Users/alex/vaults/Vacation/Branson 2026/tests/e2e/tests/</test_dir>
<!-- New spec files go here. testDir = './tests' per playwright.config.js -->

<test_run_command>cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test</test_run_command>

<staging_base_url>https://vacation-dev.creeperbomb.com</staging_base_url>

<existing_reference_spec>tests/e2e/tests/admin-form-inputs.spec.js</existing_reference_spec>
<!-- Read this file for: login() helper, page navigation, chip interaction patterns, attendee chip assertions. Mirror its patterns exactly. -->

<runtime_globals>
  <var name="allAttendees">Runtime array. Populated from data/people.json fetch. Always use as source of names for meal chip panels.</var>
  <var name="currentEvent">Object with fields: meal_override_include (string[]), meal_override_exclude (string[]), series_slug, and all FIELDS values.</var>
  <var name="loadedValues">Object tracking field values at load time. Currently tracks FIELDS = ['title','date','startTime','duration']. Must be extended.</var>
  <var name="patchScheduleEvent(eventId, fields)">Async function. PATCHes the Supabase schedule_events row for the given event ID.</var>
  <var name="saveOverrides()">The single save entry-point. Extend this -- do NOT create new save functions.</var>
</runtime_globals>

<chip_css>
.chip and .chip-selected are defined in web/css/components.css. Do NOT edit that file. Do NOT invent new chip CSS classes. Mirror the exact pattern used in buildAttendeeCheckboxes(): button elements with class "chip", toggle class "chip-selected" on click.
</chip_css>
</static_background>

<task>

<change_a id="dirty-state-and-series-slug">
<title>Save Changes button dirty-state + series_slug folded in</title>

<current_problems>
1. #save-btn always looks the same regardless of dirty state. Clicking when nothing has changed silently returns early (rows.length === 0) with zero user feedback.
2. series_slug is saved by a separate standalone "Save Series" button (saveSeriesSlug function). Users must click two buttons to save everything. This is wrong.
</current_problems>

<required_behavior>
- Fold series_slug into saveOverrides(). If series_slug value differs from what was loaded, PATCH it via patchScheduleEvent alongside (or before) the field overrides.
- Extend loadedValues to also track series_slug at load time.
- Add dirty-state detection: attach an input event listener to every FIELDS input AND the series-slug-input. On each event, re-evaluate whether any current value differs from loadedValues.
  - If ANY field is dirty: remove disabled attribute from #save-btn, set background to var(--status-yes), set color to white, set full opacity, cursor:pointer.
  - If NOTHING is dirty: set disabled attribute on #save-btn, grey/dimmed appearance, cursor:not-allowed.
- Run the dirty check immediately after loadEventForm() completes so the button always starts disabled on a fresh form load.
- Remove the standalone "Save Series" button element from the HTML entirely.
- Remove the saveSeriesSlug() function from the JS entirely.
- No other save function may be added.
</required_behavior>
</change_a>

<change_b id="meal-override-chip-ui">
<title>Meal override UI: chip-based dual-panel transfer selector</title>

<current_problems>
Two select dropdowns (meal-include-select, meal-exclude-select) with one-at-a-time Add buttons and ul lists. addMealOverride() and populateMealSelects() drive this. It is replaced entirely.
</current_problems>

<required_behavior>
Replace with two independent 2-panel transfer units -- one for "Override: Add to count" (include) and one for "Override: Remove from count" (exclude).

Each transfer unit layout:
- LEFT panel: chip grid of available names (allAttendees names NOT currently in this override's right panel). Multi-select: clicking a chip toggles .chip-selected. No "select all" needed.
- CENTER column: two stacked buttons -- "→ Add" (moves all .chip-selected LEFT chips to right panel, clears their selection) and "← Remove" (moves all .chip-selected RIGHT chips back to left panel, clears their selection).
- RIGHT panel: chip grid of names currently in this override. Same multi-select toggle behavior.

Chip elements must be button.chip / button.chip-selected -- identical pattern to buildAttendeeCheckboxes(). No new CSS.

Remove the standalone "Save Overrides" button from the meal section entirely.

Wire meal state into saveOverrides(): read current right-panel chip names from both include and exclude transfer units; PATCH meal_override_include and meal_override_exclude via patchScheduleEvent.

Extend loadedValues to also track meal_override_include and meal_override_exclude as JSON strings (for deep comparison).

The dirty-state check (Change A) must also cover meal overrides: if either right panel's current JSON-stringified name list differs from the loaded JSON string, #save-btn is dirty.

Update populateMealOverrideLists() to populate the new chip panels instead of the old select+ul approach.

Remove populateMealSelects() entirely (dead code after this change).
</required_behavior>
</change_b>

</task>

<execution_order>
You MUST follow this exact sequence. Do not skip or reorder steps.

STEP 1 -- READ BEFORE WRITING
  1a. Read /Users/alex/vaults/Vacation/Branson 2026/web/admin.html in full. Note exact element IDs, JS function names, structure of loadedValues, saveOverrides, loadEventForm, patchScheduleEvent, buildAttendeeCheckboxes, and any existing meal override code.
  1b. Read tests/e2e/tests/admin-form-inputs.spec.js in full. Note the login() helper, page navigation, chip interaction pattern, and assertion style. You will mirror this exactly.
  1c. Read tests/e2e/playwright.config.js. Confirm testDir, baseURL, and any auth setup.
  1d. If anything is ambiguous after reading, re-read the relevant section. Never guess.

STEP 2 -- WRITE FAILING TESTS (Change A)
  Write a new Playwright spec covering ALL of the following for Change A:
  - #save-btn is disabled and dimmed immediately after loading a form (no fields dirty).
  - Changing a FIELDS input makes #save-btn active (green, not disabled).
  - Changing series-slug-input makes #save-btn active.
  - Reverting all inputs back to loaded values makes #save-btn disabled again.
  - Clicking #save-btn when dirty triggers a save (assert network PATCH or observable state change per the existing test pattern).
  - The standalone "Save Series" button does NOT exist in the DOM.
  - saveSeriesSlug is not a callable function on the page.
  Run: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --grep "admin-save-dirty"
  Confirm all new tests FAIL. Do not proceed until failure is confirmed.

STEP 3 -- WRITE FAILING TESTS (Change B)
  Write a new Playwright spec covering ALL of the following for Change B:
  - Both transfer units render with left and right chip panels and Add/Remove buttons.
  - Clicking a left-panel chip toggles .chip-selected on it.
  - Clicking "→ Add" moves selected left chips to the right panel (left panel no longer contains them; right panel does).
  - Clicking "← Remove" moves selected right chips back to the left panel.
  - Multi-select works: multiple chips can be selected before transfer.
  - After transfers, #save-btn becomes dirty (Change A dirty-state is triggered).
  - Saving via #save-btn captures correct right-panel chip names for both include and exclude.
  - Standalone "Save Overrides" button does NOT exist in the DOM.
  - populateMealSelects is not a callable function.
  Run: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --grep "admin-meal-chips"
  Confirm all new tests FAIL. Do not proceed until failure is confirmed.

STEP 4 -- IMPLEMENT Change A in admin.html
  Make only the changes described in change_a. Do not touch Change B code yet.
  Run full test suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
  - Change A tests must pass.
  - Change B tests must still fail (expected).
  - All pre-existing tests must pass. If any pre-existing test regresses, fix admin.html before continuing.

STEP 5 -- IMPLEMENT Change B in admin.html
  Make only the changes described in change_b. Do not re-touch Change A code unless required to wire dirty-state coverage.
  Run full test suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
  - All Change A tests must pass.
  - All Change B tests must pass.
  - All pre-existing tests must pass. Fix any regressions before declaring done.

STEP 6 -- FINAL VERIFICATION
  Run the full test suite one final time. All tests green. Only then proceed to the handback clause.
</execution_order>

<hallucination_guard>
CRITICAL REMINDERS -- violations here are bugs, not style issues:
- You may ONLY modify /Users/alex/vaults/Vacation/Branson 2026/web/admin.html and new spec files under tests/e2e/tests/. No other file may be changed.
- Do NOT invent element IDs, function names, CSS classes, or API shapes. Read the file first.
- Do NOT add new save functions. saveOverrides() is the only save entry-point.
- Do NOT create new CSS classes for chips. Use .chip and .chip-selected exactly as buildAttendeeCheckboxes() uses them.
- Do NOT commit, push, copy files elsewhere, or update any log or changelog.
- TDD order is mandatory and non-negotiable: failing tests confirmed then implementation then passing tests confirmed.
- If a test run output is ambiguous, re-run before drawing conclusions.
</hallucination_guard>

<output_format>
During execution, output:
1. Step number and name as a header before each step.
2. Exact terminal commands run and their full output (do not truncate test results).
3. Any code written (full blocks, not diffs, for clarity).
4. A pass/fail verdict after each test run.

After STEP 6 is complete and all tests are green, output ONLY the handback clause below and then STOP.
</output_format>

<handback_clause>
## Files Modified
- `web/admin.html` -- [one-line description of all changes made]
- `tests/e2e/tests/[spec-filename-a].spec.js` -- [one-line description]
- `tests/e2e/tests/[spec-filename-b].spec.js` -- [one-line description, or merged into one spec with a note]

Do not commit. Do not push. Do not copy files. Do not update any log. STOP.
</handback_clause>
