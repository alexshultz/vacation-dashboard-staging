<task>
You are fixing two specific defects in tests/e2e/tests/admin-event-types.spec.js identified by a cold code reviewer. Do not touch any other file. Do not touch web/admin.html.
</task>

<background>
VAULT: /Users/alex/vaults/Vacation/Branson 2026
Spec file to fix: tests/e2e/tests/admin-event-types.spec.js

The spec has two confirmed defects:

DEFECT 1 -- Race condition in test 2 ("hides attendee checklist when event_type is set to open")
The test calls page.selectOption('#event-type-select', 'open') then immediately calls page.isVisible('#attendee-section').
The change handler on #event-type-select is async -- it fires patchScheduleEvent() (a network fetch) and THEN calls updateEventTypeSections() to hide/show sections.
Playwright's selectOption() returns after the DOM event fires, NOT after the async handler body finishes.
Under real network latency, the PATCH hasn't resolved yet when isVisible() is checked, so #attendee-section is still visible -- the test falsely passes (flaky).

FIX: After selectOption, use page.waitForFunction() or page.locator('#attendee-section').waitFor({ state: 'hidden' }) before asserting isVisible. Do not assert immediately after selectOption for any test that relies on the async handler completing.

Apply this same fix to all 4 tests -- all of them trigger the async change handler and then assert visibility. All are potentially flaky. Use waitFor({ state: 'visible' }) or waitFor({ state: 'hidden' }) as appropriate for each test before the final assertion.

DEFECT 2 -- Tests write to real Supabase staging data with no cleanup
All 4 tests fire patchScheduleEvent() via selectOption(), which PATCHes schedule_events.event_type on a real staging event row.
After the test suite runs, a real event row has a dirty event_type value that persists across CI runs and can interfere with other tests.

FIX: Add an afterEach block that PATCHes event_type back to null for the event used in the test.
The PATCH pattern (from admin.html): fetch() to SUPABASE_URL + /rest/v1/schedule_events?id=eq.EVENT_ID with headers apikey, Authorization Bearer ANON_KEY, Content-Type application/json, Prefer return=minimal, body {"event_type": null}.
Use the same credentials as the test (from loadEnv()).
The afterEach does not need a session token -- ANON_KEY is sufficient to read but may not be sufficient to write if RLS is set. Check: the admin-auth.spec.js tests write to Supabase using the authenticated session. If afterEach cannot write with ANON_KEY alone, it must use the authenticated token from a login() call.
Simplest safe approach: in afterEach, just call login() to get an authenticated page, then PATCH event_type to null. This ensures cleanup uses the same auth as the tests.
Alternatively: add a `page` fixture to afterEach and use page.evaluate() to issue the fetch with the authenticated session cookie already present from the test.

If there is a simpler pattern used elsewhere in the test suite for cleanup, follow that.
</background>

<constraints>
- Touch ONLY: tests/e2e/tests/admin-event-types.spec.js
- Do not touch web/admin.html, any other spec file, any config file, or any other file.
- Do not commit, push, or update logs.
- The fix must not introduce new test brittleness (e.g., hardcoded long sleeps -- use waitFor patterns).
</constraints>

<procedure>
1. Read the current tests/e2e/tests/admin-event-types.spec.js in full.
2. Read tests/e2e/tests/admin-auth.spec.js to understand the auth pattern if afterEach needs a session.
3. Apply Defect 1 fix: add appropriate waitFor() calls in all 4 tests before visibility assertions.
4. Apply Defect 2 fix: add afterEach cleanup that resets event_type to null.
5. Run the full suite:
   cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
   All tests must pass. The 4 new tests must pass with the waitFor fixes in place.
6. Confirm git diff --name-only shows ONLY tests/e2e/tests/admin-event-types.spec.js.
</procedure>

<acceptance_criteria>
1. All 4 tests use waitFor({ state: 'visible' }) or waitFor({ state: 'hidden' }) before asserting visibility -- no immediate isVisible() after selectOption().
2. afterEach block resets event_type to null for the tested event.
3. All 40 Playwright tests pass (36 original + 4 new).
4. git diff --name-only shows ONLY tests/e2e/tests/admin-event-types.spec.js.
</acceptance_criteria>

<output_format>
Handback report:

Files modified:
- tests/e2e/tests/admin-event-types.spec.js -- [one-line description of changes]

Test results: [paste playwright summary line]
git diff --name-only: [paste exact output]
Blockers / anomalies: [or "None"]
</output_format>

<reminder>
Do not touch web/admin.html. Do not touch any other file. Do not commit or push.
The waitFor fix must apply to ALL 4 tests, not just test 2.
</reminder>
