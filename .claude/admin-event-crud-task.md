<task_brief>

<role_and_goal>
You are a senior full-stack engineer working inside the Branson 2026 vacation dashboard
codebase. Your goal is to implement event create, archive, restore, and delete — four
closely related CRUD operations — across two files: web/event-timeline.html and
web/admin-overlay.js. You must follow strict TDD: write failing Playwright tests first,
confirm they fail, implement, confirm they pass. Do not proceed past red tests.
</role_and_goal>

<tone_instructions>
State uncertainty explicitly — never invent API shapes, column names, or selectors you
have not verified by reading the actual source files first. If you find something
ambiguous, note it in your handback report and choose the safer interpretation. Do not
guess at existing function signatures or modal behaviour — read the source before writing
a single line of implementation.
</tone_instructions>

<static_background>
WORKSPACE ROOT (all paths relative to here unless stated):
  /Users/alex/vaults/Vacation/Branson 2026

KEY FILES:
  web/event-timeline.html          — timeline page; renders schedule_events rows
  web/admin-overlay.js             — shared admin layer; owns Supabase client, auth
                                     state, and the existing edit modal
  tests/e2e/tests/                 — Playwright spec directory (testDir = ./tests
                                     relative to tests/e2e/)
  scripts/deploy.sh                — deploy helper

SUPABASE:
  Project URL : https://quebfbvfuwbncpexlylu.supabase.co
  Anon key    : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWJmYnZmdXdibmNwZXhseWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjIzMDYsImV4cCI6MjA5MjI5ODMwNn0.-hvY-sgGon5S1BsF_tXjvGAXCo7rmXIwIXObmxY4Dss
  Table       : schedule_events
  New column  : archived BOOLEAN DEFAULT FALSE  <- migration already applied; do NOT
                re-run or recreate it

ADMIN SESSION MODEL:
  body.is-admin CSS class is toggled by admin-overlay.js on Supabase auth state change.
  All admin-only UI must use CSS visibility gated on body.is-admin — never JS-only hiding.

EXISTING EDIT MODAL:
  Lives in admin-overlay.js. The new-event flow REUSES the same modal with blank fields
  and a freshly generated ID. Do not create a second modal.

PLAYWRIGHT BASELINE:
  75/75 tests passing across 13 spec files. You must not regress a single test.
  New spec file: tests/e2e/tests/admin-event-crud.spec.js

FROZEN FILES — NEVER OPEN, NEVER MODIFY:
  generate_dashboard.py
  generate_attractions.py
</static_background>

<dynamic_task>
Implement the following four capabilities in the order listed. Each bullet is a discrete
acceptance criterion; all seven must be green before staging deploy.

  AC-1  NEW EVENT BUTTON
        Add a "New Event" button to web/event-timeline.html, visible only when
        body.is-admin. Clicking it opens the existing edit modal (from admin-overlay.js)
        with all fields blank and a freshly generated row ID. Clicking Save in the modal
        writes a new row to schedule_events in Supabase.

  AC-2  ARCHIVE BUTTON (active cards)
        Add an "Archive" button to each active (archived=false) event card, visible only
        when body.is-admin. Clicking it sets archived=true on that row in Supabase.
        The card disappears from the family view immediately (no page reload required).

  AC-3  DELETE BUTTON (active cards)
        Add a "Delete" button to each active event card, visible only when body.is-admin.
        Clicking it shows a browser confirmation prompt:
            "Are you sure? This cannot be undone."
        On confirm, hard-delete the row from Supabase. On cancel, do nothing.

  AC-4  FILTER ARCHIVED ROWS
        The render function in event-timeline.html must filter out archived=true rows by
        default. Family members must never see archived events.

  AC-5  SHOW ARCHIVED TOGGLE
        Add a "Show archived" toggle at the top of the timeline, visible only when
        body.is-admin. When activated, archived events are appended to the list in a
        visually distinct dimmed style (e.g. reduced opacity + italic label).

  AC-6  RESTORE BUTTON (archived cards)
        Archived event cards (visible only via the toggle) show a "Restore" button.
        Clicking it sets archived=false, and the event moves back to the active list.

  AC-7  DELETE BUTTON (archived cards)
        Archived event cards also show a "Delete" button with the same confirmation
        prompt and hard-delete behaviour as AC-3.
</dynamic_task>

<order_of_analysis>
Follow these steps in strict order. Do not skip ahead.

  STEP 1 — READ BEFORE WRITING
    1a. Read web/event-timeline.html in full. Note the existing fetch URL, render
        function name(s), event-card HTML structure, and any existing admin UI hooks.
    1b. Read web/admin-overlay.js in full. Note the Supabase client initialisation,
        auth listener, modal open/close functions, modal field names, and the Save
        handler. Do not assume -- confirm every identifier.
    1c. Read one existing Playwright spec (e.g. tests/e2e/tests/admin-auth.spec.js
        or similar) to understand test conventions: how admin session is spoofed, how
        Supabase calls are mocked or intercepted, and what selectors the suite uses.
    1d. Note anything ambiguous. You will surface it in the handback report.

  STEP 2 — WRITE FAILING TESTS (TDD RED)
    2a. Create tests/e2e/tests/admin-event-crud.spec.js.
    2b. Write one test per AC (AC-1 through AC-7). Each test must be independently
        runnable and must fail right now because the UI elements do not yet exist.
    2c. Run: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/admin-event-crud.spec.js
    2d. Confirm all 7 new tests fail. Confirm the existing 75 still pass. If anything
        in the existing suite is now red, STOP and diagnose before proceeding.

  STEP 3 — IMPLEMENT
    3a. Implement AC-1 through AC-7 across web/event-timeline.html and
        web/admin-overlay.js only.
    3b. For every Supabase write (insert, update, delete), handle errors gracefully --
        log to console and surface a non-blocking UI message. Do not silently swallow
        errors.
    3c. Admin-only UI elements must use the body.is-admin CSS gate; do not add JS-only
        visibility toggling as the sole mechanism.
    3d. Do not create any new files outside tests/e2e/tests/ unless absolutely
        unavoidable. If you must, justify it in the handback report.
    3e. Do not modify any HTML element not explicitly named in this task. If you
        encounter an element that looks unused or redundant, FLAG IT in the handback
        report. Do not remove it.

  STEP 4 — GREEN CHECK
    4a. Run: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/admin-event-crud.spec.js
    4b. All 7 new tests must pass. If any are still red, fix them before continuing.
    4c. Run the full suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
    4d. Confirm 82/82 (75 + 7) pass with zero regressions.

  STEP 5 — SAFETY CHECKS (must pass before deploy)
    Run all four checks; all must return the expected value or STOP:

      grep -c 'pointerdown' web/quick-pick.html           # must return 1
      grep -c 'fetch.*data.json' web/attractions.html     # must return >= 1
      grep -c 'fetch.*help.json' web/help.html            # must return 1
      grep -c 'fetch.*schedule.json' web/event-timeline.html  # must return >= 1

  STEP 6 — STAGING DEPLOY
    bash scripts/deploy.sh staging "feat: event create/archive/restore/delete"

  STEP 7 — POST-DEPLOY VERIFICATION
    cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
    All 82 tests must still pass against staging. Report results.
</order_of_analysis>

<constraints>
HARD CONSTRAINTS — violation is a blocker:
  - Do NOT modify: generate_dashboard.py, generate_attractions.py
  - Do NOT push to production under any circumstances
  - Do NOT re-run or recreate the archived column migration
  - Do NOT create a second modal -- reuse the one in admin-overlay.js
  - Do NOT remove or modify any existing HTML element unless it is explicitly named
    in this task. If you spot something that looks unused or redundant, FLAG IT in
    the handback report and leave it alone.
  - Do NOT stop while any Playwright test is red -- fix it first

SOFT CONSTRAINTS — prefer these unless you find a good reason not to:
  - New CSS rules belong in a <style> block in the file that owns the element, not in
    a separate stylesheet, unless the project already has a shared stylesheet pattern
  - Generated IDs should follow whatever ID scheme already exists in the codebase
    (check before choosing a format)
  - Confirmation prompts use the native browser confirm() unless the project already
    has a custom dialog pattern -- prefer consistency over novelty
</constraints>

<hallucination_guard>
Before using any function name, selector, column name, table name, or API method, verify
it exists by reading the source. If you have not personally read the line of code that
defines it, do not use it. Every Supabase call must reference only schedule_events and
only columns you can see in the actual table schema or the migration already described.
Do not invent column names. Do not invent function names. Do not assume the modal's
field IDs -- read them.
</hallucination_guard>

<output_format>
Your final response must contain exactly these sections, in this order:

  ## Tests Written
  List each test in admin-event-crud.spec.js with its describe/it label and the AC
  number it covers.

  ## Implementation Summary
  For each AC, one paragraph: what you changed, which file, which function or element.

  ## Test Results
  Paste the final npx playwright test summary line (e.g. "82 passed (41s)").

  ## Safety Check Results
  Paste the four grep outputs with their expected values annotated.

  ## Staging Deploy Output
  Paste the last 10 lines of scripts/deploy.sh output.

  ## Files Modified
  A flat list: filename -- one-line description of what changed.

  ## Assumptions and Judgment Calls
  Numbered list of every non-obvious decision you made, including anything ambiguous
  you found in Step 1d.

  ## Flagged Elements (do not modify)
  Any HTML elements you noticed that look unused or redundant. Leave them alone.
</output_format>

<final_reminder>
When complete, list every file you modified with a one-line description. Note any
assumptions or judgment calls. STOP. Do not commit, push, copy files, or update logs.
Hermes handles all post-code orchestration.
</final_reminder>

</task_brief>
