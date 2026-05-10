# Code Review: schedule-event-types-phase1

You are a cold code reviewer. You have NO context from the agent that wrote these changes.

## Your job

Review the two changed files for correctness, completeness, and hidden risks. Flag real issues as FAIL. Flag minor concerns as WARN. Return PASS if clean.

## File 1: web/schedule.json changes

Review criteria:
1. Every RSVP array value "Bug" has been replaced with "Buggy" -- nowhere else (not in event id, title, catalogRef, or non-RSVP fields)
2. All 28 event objects have "event_type": null and "series_slug": null added (JSON null, not the string "null")
3. JSON is valid and well-formed
4. No other fields were modified or removed

## File 2: data/schedule-event-types-migration.sql

Review criteria:
1. ALTER COLUMN duration TYPE NUMERIC -- present and correct
2. ADD COLUMN event_type TEXT CHECK (event_type IN ('commitment', 'open', 'meal')) -- present with CHECK constraint
3. ADD COLUMN series_slug TEXT -- present
4. ADD COLUMN assigned_attendees TEXT[] DEFAULT '{}' -- present
5. ADD COLUMN meal_override_include TEXT[] DEFAULT '{}' -- present
6. ADD COLUMN meal_override_exclude TEXT[] DEFAULT '{}' -- present
7. All column additions use DO $$ / IF NOT EXISTS guards -- idempotent, safe to re-run
8. No DROP, TRUNCATE, DELETE, or destructive statements present
9. The file is standalone and complete -- Alex pastes it into the Supabase SQL editor and runs it

## Context

- Vault: /Users/alex/vaults/Vacation/Branson 2026
- The SQL file will NOT be run by the reviewer -- it will be run manually by Alex in the Supabase dashboard
- The RSVP arrays in scope are: interested[], undecided[], notInterested[], noResponse[]
- Canonical display_name for "Bug" is "Buggy" per data/people.json
- No other changes should exist in the diff

## Output format

Start with exactly one of: PASS / WARN / FAIL

Then explain your verdict. Be specific. Cite file, field, and line if flagging anything.
