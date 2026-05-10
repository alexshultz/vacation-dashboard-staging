<task>
You are a precise, surgical code agent. Your goal is to complete Phase 1 of the Branson 2026 trip schedule system redesign: database schema migration prep and JSON data cleanup only. No UI changes. No admin.html. No improvisation.

Complete all steps below exactly as specified, then stop and report.
</task>

<background>
## Project

The Branson 2026 trip planning system lives at:

  /Users/alex/vaults/Vacation/Branson 2026

Key files:
- web/schedule.json        -- 28 event objects, each with: id, title, date, duration, priority, catalogRef, startTime, travelMinutes, interested[], undecided[], notInterested[], noResponse[]
- data/people.json         -- canonical attendee list; attendees[].display_name is the source of truth for names
- data/                    -- will receive the new SQL migration file you write
- tests/e2e/tests/         -- Playwright spec files (.spec.js)

## Phase Context

This is Phase 1 of a multi-phase redesign. Phase 1 = schema migration authoring + data normalization only. Phase 2 (admin.html UI and classification) will happen separately after Alex manually runs the migration in the Supabase dashboard.

The SQL migration file you write will NOT be executed by you. Alex runs it manually. Your job is only to write it correctly.

## Known Data Issue

One attendee whose canonical display_name is 'Buggy' (per data/people.json) is stored as 'Bug' throughout the RSVP arrays in web/schedule.json. This must be corrected before the schema work.
</background>

<constraints>
## Frozen Files -- Never Touch
- scripts/generate_dashboard.py
- scripts/generate_attractions.py
- web/help.html  (any HTML section within it)
- web/admin.html  (no changes this phase -- not even whitespace)

## Locked Design System -- Never Touch
- tokens.css
- components.css
- trail.css

## Scope Boundary
The only two files you are authorized to create or modify in this task are:
  1. web/schedule.json
  2. data/schedule-event-types-migration.sql  (new file)

Do not modify any file not explicitly named in this task. If you encounter anything outside scope that looks wrong, flag it in your handback report. Do not fix it.
</constraints>

<rules>
1. All JSON edits must produce valid, well-formed JSON. Validate after editing (python3 -c "import json; json.load(open('web/schedule.json'))" must exit 0).
2. RSVP name replacement is surgical: only replace the string "Bug" where it appears as an RSVP array value -- not in event id fields, title strings, catalogRef values, or any other context.
3. The SQL migration must be written defensively. Every column addition must use a DO $$ / IF NOT EXISTS pattern. Use ALTER TABLE IF EXISTS for the table guard. Do not use bare ADD COLUMN statements that would error on re-run.
4. Do NOT classify any events. Do NOT attempt to infer event_type values. Leave all 28 as null in JSON. Alex will populate them via admin.html.
5. Do not commit, push, stage, or run git commands of any kind.
6. Do not run the SQL migration. Write the file only.
7. Run the Playwright suite as the final step and report results verbatim.
</rules>

<procedure>
Follow these steps in order. Do not skip steps. Do not combine steps.

### Step 1 -- Verify Canonical Name
1.1. Read data/people.json and confirm the canonical display_name for the attendee currently stored as 'Bug' in schedule.json. It must be 'Buggy'. If it is not, stop and report.
1.2. Read web/schedule.json and confirm 'Bug' appears in at least one RSVP array (interested, undecided, notInterested, or noResponse). If not found, note that in your report and skip Step 2.

### Step 2 -- Fix display_name Mismatch in schedule.json
2.1. In web/schedule.json, replace every occurrence of the string "Bug" that appears as a value inside any of these four arrays: interested, undecided, notInterested, noResponse.
2.2. Do NOT replace 'Bug' in: event id strings, title strings, catalogRef strings, date fields, or any non-RSVP field.
2.3. After replacement, validate the JSON is still well-formed:
     python3 -c "import json; json.load(open('web/schedule.json'))"
2.4. Verify: grep the file to confirm zero occurrences of '"Bug"' remain in RSVP contexts, and that 'Buggy' now appears in those positions.

### Step 3 -- Add event_type and series_slug placeholders to schedule.json
3.1. For every one of the 28 event objects in web/schedule.json, add two new fields:
     "event_type": null,
     "series_slug": null
     Insert them after the existing fields to minimize diff noise. All values must be JSON null, not the string "null".
3.2. Validate JSON is still well-formed after edits.
3.3. Confirm all 28 event objects have both new fields:
     python3 -c "import json; data=json.load(open('web/schedule.json')); events=data['events']; print(len([e for e in events if 'event_type' in e and 'series_slug' in e]))"
     Expected output: 28

### Step 4 -- Write SQL Migration File
4.1. Create a new file at: data/schedule-event-types-migration.sql
4.2. The file must contain exactly this structure (write it defensively):

-- Phase 1 Migration: Event Types Feature
-- Adds event classification, series grouping, attendee assignment, and meal override columns
-- to the schedule_events table in Supabase.
-- References: ADR-017, ADR-018, ADR-019, ADR-020, ADR-021
-- Run manually in the Supabase SQL editor. Safe to re-run (idempotent).

-- Widen duration from INTEGER to NUMERIC to support fractional hours (e.g. 0.75, 1.5, 2.5)
ALTER TABLE IF EXISTS schedule_events
  ALTER COLUMN duration TYPE NUMERIC;

-- Add event classification column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN event_type TEXT CHECK (event_type IN ('commitment', 'open', 'meal'));
  END IF;
END $$;

-- Add series grouping slug column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'series_slug'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN series_slug TEXT;
  END IF;
END $$;

-- Add assigned attendees array (for commitment-type events)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'assigned_attendees'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN assigned_attendees TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add meal inclusion override array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'meal_override_include'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN meal_override_include TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add meal exclusion override array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'meal_override_exclude'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN meal_override_exclude TEXT[] DEFAULT '{}';
  END IF;
END $$;

4.3. Verify the file exists and is non-empty:
     ls -lh data/schedule-event-types-migration.sql

### Step 5 -- Run Playwright Tests
5.1. Run the full test suite:
     cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
5.2. Capture the full output. Report pass/fail counts and any failures verbatim.
5.3. If any test fails, do NOT attempt to fix the failing test or modify any spec file. Report the failure and stop.

### Step 6 -- Scope Audit
6.1. Run: git diff --name-only
6.2. Confirm the output contains ONLY these two paths:
     web/schedule.json
     data/schedule-event-types-migration.sql
6.3. If any other file appears in the diff, report it immediately. Do not explain it away.
</procedure>

<acceptance_criteria>
All six criteria must be true before you report completion:

AC-1. grep for '"Bug"' in web/schedule.json RSVP arrays returns zero matches.
AC-2. 'Buggy' appears in every RSVP array position where 'Bug' previously appeared.
AC-3. data/schedule-event-types-migration.sql exists and contains all six DDL operations: ALTER COLUMN duration TYPE NUMERIC, ADD COLUMN event_type (with CHECK constraint), ADD COLUMN series_slug, ADD COLUMN assigned_attendees (TEXT[] DEFAULT '{}'), ADD COLUMN meal_override_include (TEXT[] DEFAULT '{}'), ADD COLUMN meal_override_exclude (TEXT[] DEFAULT '{}'). All column additions use DO $$ / IF NOT EXISTS guards.
AC-4. All 28 event objects in web/schedule.json contain "event_type": null and "series_slug": null.
AC-5. All Playwright tests pass with zero regressions.
AC-6. git diff --name-only shows exactly two files: web/schedule.json and data/schedule-event-types-migration.sql -- nothing else.
</acceptance_criteria>

<output_format>
Your handback report must use this exact structure:

## Handback Report -- Phase 1 Schema Migration Prep

### Files Modified
| File | Change |
|------|--------|
| web/schedule.json | [one-line description] |
| data/schedule-event-types-migration.sql | [one-line description] |

### Acceptance Criteria Verification
- AC-1: PASS / FAIL -- [evidence]
- AC-2: PASS / FAIL -- [evidence]
- AC-3: PASS / FAIL -- [evidence]
- AC-4: PASS / FAIL -- [evidence]
- AC-5: PASS / FAIL -- [evidence: paste playwright summary line]
- AC-6: PASS / FAIL -- [paste exact git diff --name-only output]

### Out-of-Scope Issues Observed (do not fix)
[List anything wrong you noticed in files outside scope, or write "None"]

### Blockers / Anomalies
[Anything that prevented a step from completing, or write "None"]
</output_format>

<reminder>
- You are operating on real files. Do not fabricate output. If a command fails, show the actual error.
- Do not infer, guess, or hallucinate the contents of data/people.json or web/schedule.json -- read the files first.
- Do not classify any events. event_type stays null for all 28. This is not your call to make.
- Do not run the SQL migration. Alex runs it manually.
- Do not commit, push, or update any log files.
- When you are done: list the two modified files with one-line descriptions each, then STOP. Do not add follow-up suggestions, next-step commentary, or phase 2 speculation.
</reminder>
