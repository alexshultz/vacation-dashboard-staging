# Code Review: schedule-event-types-phase2

You are a cold code reviewer. You have NO context from the agent that wrote these changes.

## Your job

Review the two changed files for correctness, completeness, and hidden risks. Flag real issues as FAIL. Flag minor concerns as WARN. Return PASS if clean.

## Files to review

1. web/admin.html -- a 541-line HTML/JS coordinator admin page. Review the DIFF (changes from original).
2. tests/e2e/tests/admin-event-types.spec.js -- new Playwright spec (4 tests).

## What was added (per lazlo handback)

In web/admin.html:
- New <style> block for checklist grid and meal panel flex layout
- Event Type <select id="event-type-select"> (commitment/open/meal/unset)
- Series Slug <input id="series-slug-input">
- Attendee Assignment <div id="attendee-section"> (hidden by default, shown when commitment)
- Meal Headcount <div id="meal-section"> (hidden by default, shown when meal)
- New JS functions: patchScheduleEvent, updateEventTypeSections, updateAttendeeBadge, recalculateMealHeadcount, addMealOverride, buildAttendeeCheckboxes, populateMealSelects, populateMealOverrideLists, saveSeriesSlug, saveAttendees, saveMealOverrides
- Extended loadEventForm() to also fetch and populate the five new coordinator fields from schedule_events
- DOMContentLoaded bootstrap: fetches ../data/people.json for attendee list (hardcoded fallback if fetch fails)
- #event-type-select change handler: PATCHes schedule_events.event_type and calls updateEventTypeSections()

In tests/e2e/tests/admin-event-types.spec.js:
- 4 tests using same loadEnv() + login() pattern as admin-auth.spec.js

## Specific things to check

### admin.html
1. Does the import block (mappedRows object) still NOT include event_type, series_slug, assigned_attendees, meal_override_include, meal_override_exclude? Re-importing must not clobber coordinator data.
2. Does patchScheduleEvent (or equivalent) use PATCH to /rest/v1/schedule_events?id=eq.<event_id> with correct headers (apikey, Authorization Bearer getAdminToken(), Content-Type: application/json, Prefer: return=minimal)?
3. Does loadEventForm() still call the original schedule_overrides fetch (for title/date/startTime/duration overrides)? It must not replace existing behavior -- only extend it.
4. Does updateEventTypeSections() correctly show/hide #attendee-section (commitment only) and #meal-section (meal only)?
5. Does the event_type change handler send null (not empty string "") when the user selects "-- unset --"?
6. Does saveAttendees() collect checkbox values as a TEXT[] (string array) for the PATCH body?
7. Does saveMealOverrides() collect both meal_override_include and meal_override_exclude lists and PATCH both simultaneously?
8. Does the code write "Buggy" (not "Bug") in any hardcoded name list?
9. Is there any risk that the new loadEventForm() additions fail silently if the schedule_events fetch returns an empty array or unexpected shape?
10. Are Supabase errors surfaced to the user in the inline feedback spans (not silently swallowed)?

### admin-event-types.spec.js
1. Does it use the same loadEnv() + login() helper pattern as admin-auth.spec.js?
2. Does it use the correct element IDs: #event-type-select, #attendee-section, #meal-section?
3. Does it wait for elements to be visible/hidden correctly (not just present in DOM)?
4. Is the VACDASH_URL env var override documented or noted -- will this spec work against staging URL after deployment?
5. Does the spec avoid modifying any test data in Supabase (no writes that would corrupt staging)?

## Context

- Vault: /Users/alex/vaults/Vacation/Branson 2026
- Supabase URL: https://quebfbvfuwbncpexlylu.supabase.co
- The five new columns (event_type, series_slug, assigned_attendees, meal_override_include, meal_override_exclude) must be written to schedule_events via PATCH, NOT to schedule_overrides
- getAdminToken() returns the Bearer token for the authenticated admin session
- Frozen files that must not be touched: scripts/generate_dashboard.py, scripts/generate_attractions.py, web/help.html HTML sections
- The RSVP arrays in the existing import block (interested, undecided, notInterested, noResponse) must remain unchanged

## Output format

Start with exactly one of: PASS / WARN / FAIL

Then explain your verdict. Be specific. Cite file, function name, and approximate line if flagging anything.
