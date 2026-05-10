<task>
You are an expert full-stack web developer. Your goal is to implement Phase 2 of the Branson 2026 event-type classification system: wire up coordinator UI controls in web/admin.html so Alex can classify each scheduled event as commitment, open, or meal, assign attendees to commitment events, and manage meal headcount overrides. The Supabase columns already exist (Phase 1 complete). This task is purely UI + JS wiring.
</task>

<background>
VAULT ROOT: /Users/alex/vaults/Vacation/Branson 2026
All paths below are relative to this root unless stated otherwise.

SUPABASE:
- URL: https://quebfbvfuwbncpexlylu.supabase.co
- ANON KEY: sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt
- Auth: getAdminToken() returns the live session Bearer token
- Write to schedule_events directly via REST PATCH (NOT schedule_overrides)
- PATCH pattern: PATCH /rest/v1/schedule_events?id=eq.<event_id>
  Headers: apikey: <ANON_KEY>, Authorization: Bearer <getAdminToken()>, Content-Type: application/json, Prefer: return=minimal
  Body: JSON object containing only the fields being updated

CONFIRMED LIVE COLUMNS in schedule_events:
- event_type TEXT nullable -- CHECK ('commitment','open','meal')
- series_slug TEXT nullable
- assigned_attendees TEXT[] default '{}'
- meal_override_include TEXT[] default '{}'
- meal_override_exclude TEXT[] default '{}'

CURRENT admin.html STRUCTURE (541 lines, web/admin.html):
- Line 34:  <section id="passcode-section"> -- auth gate
- Line 35:  <div id="auth-email-login"> -- email/password login form
- Line 57:  <section id="editor-section" style="display:none"> -- shown post-login
- Line 60:  <div id="admin-hub-nav"> -- hub nav (Sign Out button)
- Line 68:  <div id="import-block"> -- import schedule.json to Supabase
- Line 103: <select id="event-select"> -- event picker dropdown
- Line 110: <div id="event-form" style="display:none"> -- form shown on event select
- Lines 116-188: existing fields: title, date, startTime, duration (each with label, input, reset button, saved/orig feedback divs)
- Line 179: <button id="save-btn" onclick="saveOverrides()">
- Line 183: <button id="reset-all-btn" onclick="resetAllOverrides()">

EXISTING JS FUNCTIONS -- DO NOT BREAK:
- loadEventForm() -- fetches schedule_overrides for selected event, populates fields
- saveOverrides() -- writes field overrides to schedule_overrides table
- resetField(field) -- deletes one override from schedule_overrides
- resetAllOverrides() -- deletes all overrides for selected event
- renderEventSelect() -- builds event dropdown
- getSortedEvents() -- returns sorted allEvents array
- populateField(field, scheduleValue) -- handles override display logic

IMPORT BLOCK (lines ~463-490): currently upserts these fields to schedule_events:
  id, title, date, duration, priority, catalogRef, startTime, travelMinutes,
  interested, undecided, notInterested, noResponse
  The five new columns are NOT in mappedRows and must NOT be added -- see procedure step 2.

ATTENDEES:
- Source: data/people.json -- attendees[].display_name (26 entries)
- admin.html lives at web/admin.html. Fetch via: fetch('../data/people.json')
- If that path returns 404/CORS error, fall back to this hardcoded ordered list (26 names):
  Adrian, Alex, Ashlyn, Bee, Brian, Buggy, David, Dez, Evie, Georgie, Jackson,
  Jacob, Jordan, Josh, Kevin, Lucy, McKinley, Mel, Mycah, Natalie, Rachel, Ray,
  Simran, Skylar, Tayden, Zach
  IMPORTANT: "Buggy" not "Bug" -- Buggy is the canonical name.

DESIGN SYSTEM (LOCKED -- do not add new tokens):
- tokens.css, components.css, trail.css are frozen
- Page-scoped CSS in a <style> block inside admin.html is permitted
- Available CSS vars: --color-bg, --color-surface, --color-ink, --color-ink-dim,
  --color-line, --accent-1, --accent-2, --accent-3, --status-yes, --status-no, --radius-btn
- Match the existing field-row pattern: label + input + button + saved/error feedback divs

ARCHITECTURE (locked -- do not relitigate):
- ADR-017: event_type lives in schedule_events, not schedule_overrides
- ADR-018: series_slug is a plain text field grouping recurring occurrences
- ADR-020: assigned_attendees[] is the authoritative source for commitment headcount
- ADR-021: meal_override_include[] and meal_override_exclude[] are two separate arrays
- All five new columns are first-class schedule_events columns, not overrides

PLAYWRIGHT:
- Suite command: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
- New spec: tests/e2e/tests/admin-event-types.spec.js
- Existing passing suite: 36 tests -- must all still pass after your changes
- Follow login helper pattern from tests/e2e/tests/admin-auth.spec.js (loadEnv(), login() helper, credentials from .env.test)
</background>

<constraints>
- Touch ONLY these two files:
    web/admin.html
    tests/e2e/tests/admin-event-types.spec.js
- Do not modify any file not explicitly named in this task. If you encounter anything outside scope that looks wrong, flag it in your handback report. Do not fix it.
- Do not commit, push, or update any logs.
- Do not add new CSS design tokens to tokens.css, components.css, or trail.css.
- Do not write to schedule_overrides for the five new columns -- write directly to schedule_events.
- Do not hardcode attendee names unless the fetch('../data/people.json') path is confirmed broken.
- Do not include event_type, series_slug, assigned_attendees, meal_override_include, or meal_override_exclude in the import mappedRows object.
- The five new columns must never be written by the import flow -- their values must survive a re-import unchanged.
</constraints>

<rules>
1. TDD IS MANDATORY. For every new JS behavior, write the failing Playwright spec first, run the suite to confirm it fails, implement the feature, run the suite again to confirm it passes. Never skip the red step.
2. Spec files live at tests/e2e/tests/<name>.spec.js -- no exceptions.
3. All 36 existing tests must still pass after your changes.
4. Use the REST PATCH write pattern defined in background for all schedule_events writes -- never use the schedule_overrides pattern for these columns.
5. Never read from schedule_overrides for event_type, series_slug, assigned_attendees, meal_override_include, or meal_override_exclude -- read them from schedule_events.
6. Do not silently swallow Supabase errors -- surface them in the inline feedback div with a human-readable message.
7. loadEventForm() must also populate the five new fields when an event is selected. Extend it; do not replace it.
8. Show/hide logic for attendee and meal sections must be driven by the value of the event_type select.
9. The attendee list must be fetched dynamically from ../data/people.json; hardcoding is only permitted as a documented fallback if the fetch fails.
10. "Buggy" is the canonical name. Never write "Bug".
</rules>

<procedure>
### PHASE A -- READ AND VERIFY (do not write code yet)

1. Read web/admin.html in full. Confirm:
   a. The exact line numbers of the duration field row closing tag and the error-banner div that follows it.
   b. The exact shape of the import mappedRows object (lines ~463-490).
   c. The existing login/auth flow so you understand getAdminToken().
   d. Any existing CSS <style> block in the file (to append to it rather than create a duplicate).

2. Read tests/e2e/tests/admin-auth.spec.js in full. Note the exact pattern for loadEnv(), login(), and how credentials are sourced from .env.test. You will replicate this exactly.

3. Confirm fetch('../data/people.json') resolves correctly by inspecting the directory structure (web/ and data/ are siblings under the vault root). Note the fallback list in background for use only if a runtime failure is detected during testing.

4. Run the existing Playwright suite to establish a clean baseline:
   cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
   Record: all 36 tests pass. If any fail before your changes, stop and report -- do not proceed.

---

### PHASE B -- TDD: WRITE THE FAILING SPEC

5. Create tests/e2e/tests/admin-event-types.spec.js. The spec must:
   - Use the same loadEnv() + login() helper pattern as admin-auth.spec.js.
   - Cover these four tests (add more if useful, but these four are required):
     a. "shows attendee checklist when event_type is set to commitment"
        -- log in, select any event, change #event-type-select to 'commitment', assert #attendee-section is visible.
     b. "hides attendee checklist when event_type is set to open"
        -- log in, select any event, change #event-type-select to 'open', assert #attendee-section is not visible.
     c. "shows meal headcount section when event_type is set to meal"
        -- log in, select any event, change #event-type-select to 'meal', assert #meal-section is visible.
     d. "attendee checklist contains at least 26 checkboxes"
        -- log in, select any event, set type to 'commitment', count checkboxes inside #attendee-section, assert >= 26.
   - Use IDs #event-type-select, #attendee-section, #meal-section -- your HTML implementation MUST use these exact IDs.

6. Run the suite:
   cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
   CONFIRM: the 4 new tests fail (elements not found). The original 36 still pass.
   If any of the 4 new tests pass before implementation, the test is wrong -- fix it before proceeding.

---

### PHASE C -- IMPLEMENT

7. IMPORT BLOCK FIX (web/admin.html, lines ~463-490):
   In the mappedRows object, verify that event_type, series_slug, assigned_attendees, meal_override_include, and meal_override_exclude are absent. If any are present, remove them. The import must be idempotent with respect to coordinator metadata.

8. ADD HTML SECTIONS to event-form (web/admin.html):
   Insert the following five sections immediately after the duration field row closing markup and before the error-banner div.

   a. <!-- EVENT TYPE -->
      A field row containing:
      - <label> "Event Type"
      - <select id="event-type-select"> with options:
          <option value="">-- unset --</option>
          <option value="commitment">Commitment</option>
          <option value="open">Open</option>
          <option value="meal">Meal</option>
      - A <span id="event-type-saved"> for inline saved/error feedback (initially hidden)

   b. <!-- SERIES SLUG -->
      A field row containing:
      - <label> "Series (for recurring events)"
      - <input type="text" id="series-slug-input" placeholder="e.g. escape-room">
      - Helper text: "Leave blank for standalone events. Use the same slug for all occurrences of the same activity."
      - <button onclick="saveSeriesSlug()">Save Series</button>
      - <span id="series-slug-saved"> for inline saved/error feedback

   c. <!-- ATTENDEE ASSIGNMENT (hidden by default) -->
      <div id="attendee-section" style="display:none">
      - <label> "Assigned Attendees"
      - <span id="attendee-count-badge"> showing "N of 26 assigned" (updated dynamically)
      - A <div id="attendee-checklist"> (populated by JS from people.json)
      - <button onclick="saveAttendees()">Save Attendees</button>
      - <span id="attendee-saved"> for inline saved/error feedback
      </div>

   d. <!-- MEAL HEADCOUNT (hidden by default) -->
      <div id="meal-section" style="display:none">
      - <label> "Meal Headcount"
      - <div id="meal-estimated"> showing "Estimated: N eating" (auto-calculated)
      - Two sub-panels side by side (flex row, stacked on mobile):
          Left:  "Override: Add to count" -- <select id="meal-include-select"> + Add button -- <ul id="meal-include-list">
          Right: "Override: Remove from count" -- <select id="meal-exclude-select"> + Add button -- <ul id="meal-exclude-list">
        Each list item has a Remove button to pull a name back out.
      - <div id="meal-final-count"> showing "Final count: N"
      - <button onclick="saveMealOverrides()">Save Overrides</button>
      - <span id="meal-saved"> for inline saved/error feedback
      </div>

9. ADD / EXTEND JS in web/admin.html:

   a. ATTENDEE LIST BOOTSTRAP
      On DOMContentLoaded, fetch('../data/people.json') and store the 26 display_names in a module-level array (let allAttendees = []). On fetch failure, fall back to the hardcoded list in background. After populating allAttendees, build the #attendee-checklist checkboxes and populate the meal override select dropdowns.

   b. EXTEND loadEventForm()
      After the existing logic that populates title/date/startTime/duration, add:
      1. Fetch the current schedule_events row: GET /rest/v1/schedule_events?id=eq.<id>&select=event_type,series_slug,assigned_attendees,meal_override_include,meal_override_exclude
      2. Set #event-type-select value to event_type (or '' if null).
      3. Set #series-slug-input value to series_slug (or '' if null).
      4. Call updateEventTypeSections() to apply show/hide logic.
      5. If assigned_attendees is present, pre-check those names in #attendee-checklist and update #attendee-count-badge.
      6. If meal_override_include / meal_override_exclude are present, populate the two override lists.
      7. Trigger recalculateMealHeadcount() to refresh the estimated/final counts.

   c. updateEventTypeSections()
      Reads #event-type-select.value.
      Shows #attendee-section if value === 'commitment', else hides it.
      Shows #meal-section if value === 'meal', else hides it.
      Bind this function to the 'change' event on #event-type-select.

   d. ON CHANGE of #event-type-select:
      Immediately PATCH schedule_events: {"event_type": <value or null if empty>}
      Show brief "Saved" text in #event-type-saved on success; show error text on failure.
      Then call updateEventTypeSections().

   e. saveSeriesSlug()
      Read #series-slug-input.value (trim it; send null if empty string).
      PATCH schedule_events: {"series_slug": <value>}
      Show saved/error feedback in #series-slug-saved.

   f. saveAttendees()
      Collect all checked checkbox values inside #attendee-checklist as a string array.
      PATCH schedule_events: {"assigned_attendees": <array>}
      Update #attendee-count-badge.
      Show saved/error feedback in #attendee-saved.

   g. recalculateMealHeadcount()
      Uses allEvents (already loaded) to find events where event_type === 'commitment' AND date === currentEvent.date.
      Unions their assigned_attendees arrays (deduplicated).
      estimated_eating = 26 - committed_on_same_day.length
      Read current meal_override_include list items and meal_override_exclude list items.
      final = estimated + include_count - exclude_count (floor at 0)
      Update #meal-estimated and #meal-final-count.

   h. Meal override list management:
      Each "Add" button appends the selected name from the dropdown to the corresponding <ul> as a <li> with a Remove button, then removes that name from the dropdown, and calls recalculateMealHeadcount().
      Each "Remove" button on a list item removes it from the <ul>, adds the name back to the dropdown, and calls recalculateMealHeadcount().

   i. saveMealOverrides()
      Collect all li text values from #meal-include-list and #meal-exclude-list.
      PATCH schedule_events: {"meal_override_include": [...], "meal_override_exclude": [...]}
      Show saved/error feedback in #meal-saved.

10. ADD PAGE-SCOPED CSS (inside existing or new <style> block in admin.html):
    - Style the attendee checklist as a scrollable grid (2-3 columns on desktop, 1 on mobile), max-height ~300px, overflow-y auto.
    - Style the meal override panels as a flex row with gap, stacking to column at mobile breakpoint.
    - Use only existing CSS vars -- no new tokens.

---

### PHASE D -- VERIFY

11. Run the full Playwright suite:
    cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
    REQUIRED OUTCOME:
    - All 4 new admin-event-types.spec.js tests pass.
    - All 36 original tests still pass.
    - Total: 40 tests, 0 failures.
    If any test fails, debug and fix before proceeding. Max 3 fix cycles.

12. Run:
    git diff --name-only
    REQUIRED OUTCOME: exactly these two files and no others:
      web/admin.html
      tests/e2e/tests/admin-event-types.spec.js
    If any other file appears in the diff, you have violated scope. Revert the extraneous change before submitting.
</procedure>

<acceptance_criteria>
1. #event-type-select is present inside #event-form; selecting a value immediately PATCHes schedule_events.event_type.
2. #series-slug-input is present; the Save Series button PATCHes schedule_events.series_slug with inline feedback.
3. #attendee-section is visible if and only if event_type === 'commitment'; Save Attendees PATCHes schedule_events.assigned_attendees; count badge shows "N of 26 assigned".
4. #meal-section is visible if and only if event_type === 'meal'; shows auto-calculated estimated headcount and two override lists; Save Overrides PATCHes both meal_override_include and meal_override_exclude.
5. The import block mappedRows does NOT include event_type, series_slug, assigned_attendees, meal_override_include, or meal_override_exclude -- re-importing leaves coordinator data intact.
6. tests/e2e/tests/admin-event-types.spec.js exists and all 4 tests pass.
7. All 36 pre-existing Playwright tests still pass (0 regressions).
8. git diff --name-only shows exactly: web/admin.html and tests/e2e/tests/admin-event-types.spec.js -- nothing else.
</acceptance_criteria>

<output_format>
Implementation is complete when all 8 acceptance criteria are met. Do not open a PR. Do not commit. Do not push. Do not update any log or changelog.

HANDBACK REPORT -- provide this and then STOP:

Files modified:
- web/admin.html -- [one-line description]
- tests/e2e/tests/admin-event-types.spec.js -- [one-line description]

Test results: [paste final npx playwright test summary line]
git diff --name-only output: [paste exact output]

Out-of-scope observations: [anything wrong noticed but left untouched, or "None"]
Blockers / anomalies: [anything that prevented a step, or "None"]
</output_format>

<reminder>
- Do not invent Supabase column names, table names, or JS function names not present in this brief. The five columns and their exact spellings are: event_type, series_slug, assigned_attendees, meal_override_include, meal_override_exclude.
- Do not assume what allEvents contains beyond what the existing JS already loads -- inspect the actual loadEventForm() code before extending it.
- Do not write to schedule_overrides for any of the five new columns.
- "Buggy" not "Bug." This is non-negotiable.
- The TDD red step is not optional. Confirm test failure before writing implementation code.
- The import block must EXCLUDE the five new columns entirely -- do not add them with ?? fallbacks; exclude them.
- Do not modify any file not explicitly named in this task. If you encounter anything outside scope that looks wrong, flag it in your handback report. Do not fix it.
- When in doubt about any existing behavior, read the source first. Never guess.
</reminder>
