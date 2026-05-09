<role>
You are a senior full-stack engineer executing precise, bounded prerequisite work on an existing codebase. Your goal is to complete all 6 Phase 0 items for the Branson 2026 Admin Promote + Family RSVP features in a single pass. All items are interdependent and must all be completed before stopping.
</role>

<workspace>
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
All relative paths below are relative to this vault root.
</workspace>

<hallucination_guard>
NEVER invent field names, token names, ADR numbers, component formats, or SQL syntax that you have not confirmed by reading the actual files first. If a file does not exist or a value cannot be confirmed by reading source, STOP and report the gap. Do not guess. Do not assume.
</hallucination_guard>

<read_before_touch_rule>
Before modifying ANY existing file, read it in full. No exceptions. Record what you observed. Only then make changes.
</read_before_touch_rule>

<files_in_scope>
EXPLICITLY IN SCOPE (only these files may be created or modified):
  - web/js/admin-overlay.js          (modify)
  - web/DESIGN.md                    (modify)
  - docs/DECISIONS.md                (modify)
  - data/rsvp-migration.sql          (create new)
  - tests/e2e/tests/rsvp-phase0.spec.js  (create new)

EXPLICITLY OUT OF SCOPE -- DO NOT TOUCH UNDER ANY CIRCUMSTANCES:
  - Any HTML page (*.html)
  - site.js
  - picks.js
  - tokens.css
  - components.css
  - trail.css
  - generate_dashboard.py
  - generate_attractions.py
  - Any RLS policy in Supabase (no dashboard API calls that mutate policies)
</files_in_scope>

<steps>

## Step 1 -- Locate Supabase credentials

1.1. Read `web/js/picks.js` OR search `event-timeline.html` to find the Supabase project URL and anon key already present in the codebase.
1.2. Record both values. Do not hardcode invented values anywhere.

---

## Step 2 -- ITEM 1: Verify anon write RLS on schedule_events (diagnosis only)

2.1. Using the anon key from Step 1, attempt a test upsert to `schedule_events` via the Supabase REST API (HTTP UPSERT/POST with `Prefer: resolution=merge-duplicates`). Use a test payload with a clearly fake/test id that will not collide with real data (e.g., `id: "rls-test-probe-delete-me"`).
2.2. Inspect the HTTP response status code.
  - If 200 or 201: anon writes are permitted. Record "ITEM 1 PASS: anon writes allowed on schedule_events." Continue to Step 3.
  - If 401 or 403: Record "ITEM 1 FAIL: anon writes blocked on schedule_events (HTTP <status>). Alex must fix the RLS policy in the Supabase dashboard manually." Then STOP -- do not proceed to any other step. Output the locked format at the bottom and halt.
2.3. Do NOT create, alter, or drop any RLS policy. This is read-only diagnosis.

---

## Step 3 -- ITEM 2: Write SQL migration file

3.1. Create the file `data/rsvp-migration.sql` with exactly the following content (copy verbatim, no paraphrasing):

```sql
-- Branson 2026 Phase 0 RSVP Migration
-- Run manually in the Supabase SQL editor. Do NOT execute via CLI or API.

-- 2a. Add locked_at to schedule_events
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 2b. Add wishlist_count to schedule_events
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS wishlist_count INTEGER;

-- 2c. Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id   TEXT        NOT NULL,
  user_id    TEXT        NOT NULL,
  status     TEXT        NOT NULL
               CHECK (status IN ('interested','undecided','not-going','no-response')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- 2d. Enable RLS and create anon read/write policy on event_rsvps
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_rsvp_readwrite ON event_rsvps
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (
    (SELECT locked_at FROM schedule_events WHERE id = event_rsvps.event_id) IS NULL
    OR now() < (SELECT locked_at FROM schedule_events WHERE id = event_rsvps.event_id)
  );

-- 2e. Index on event_id for query performance
CREATE INDEX IF NOT EXISTS event_rsvps_event_idx ON event_rsvps (event_id);
```

3.2. Do NOT execute this SQL against Supabase. The file is written only. Alex runs it manually.

---

## Step 4 -- ITEM 3: Fix admin-overlay.js silent RSVP array drop

4.1. READ `web/js/admin-overlay.js` IN FULL before making any change. Identify:
  - The exact line(s) where `interested` is read from current event data and added to the upsert payload.
  - The exact variable name, property accessor pattern, and surrounding context used for `interested`.
  - Confirm the field names for `undecided`, `notInterested`, and `noResponse` as they actually exist in the event data object -- do not guess; read the object shape from the file.
4.2. In the upsert payload object, add `undecided`, `notInterested`, and `noResponse` using the identical pattern established for `interested`. Do not change any other logic, variable names, or structure.
4.3. If you cannot find the field names for undecided/notInterested/noResponse in the file, STOP and report what you found instead of inventing names.

---

## Step 5 -- ITEM 4: Add chip-rsvp component to DESIGN.md

5.1. READ `web/DESIGN.md` IN FULL before making any change. Identify:
  - The exact heading level, section structure, and prose format used for existing chip and badge component entries.
  - The exact way CSS token names are referenced (e.g., backtick notation, table column, inline code).
  - The exact tokens used by adjacent chip/badge components so you can verify the tokens you're about to reference actually exist.
5.2. Append a new component section for `chip-rsvp-[state]` following the exact format observed. Include 4 state variants:

  | State       | CSS Token Used       |
  |-------------|----------------------|
  | interested  | `--status-yes`       |
  | undecided   | `--warn`             |
  | not-going   | `--status-no`        |
  | no-response | `--color-ink-dim`    |

5.3. Do NOT add any new CSS token names. Use only these four tokens (which must already exist in the design system per the locked constraint).
5.4. Place the new section in the same logical grouping as existing chip/badge components -- do not append it to a random location.

---

## Step 6 -- ITEM 5: Add ADR for rsvp.js to DECISIONS.md

6.1. READ `docs/DECISIONS.md` IN FULL before making any change. Identify:
  - The highest existing ADR number.
  - The exact heading format (e.g., `## ADR-007: Title`).
  - The exact fields/sections each ADR contains (e.g., Status, Context, Decision, Consequences).
  - Any date format used.
6.2. Add a new ADR with number = (highest existing ADR number + 1). Use today's date. Content must document:
  - rsvp.js is a new family-facing write module for event RSVPs.
  - It uses `localStorage` `display_name` for user identity, following the same pattern as picks.js (cite the ADR number you observed that documents this picks.js pattern -- do not assume it is ADR-006; read the file to confirm).
  - It writes to the `event_rsvps` table, NOT the `schedule_events` arrays.
  - It is distinct from `admin-overlay.js`, which uses Supabase session auth.
6.3. Follow the exact format of existing ADRs. Do not add new fields not present in the existing format.

---

## Step 7 -- ITEM 6: Add Playwright Phase 0 smoke tests

7.1. Create `tests/e2e/tests/rsvp-phase0.spec.js` with three smoke tests. Use the Supabase URL and anon key found in Step 1 (read them from the codebase; do not hardcode invented values). The tests must:

  **Test A -- event_rsvps table reachability:**
  - Send an authenticated GET request to the Supabase REST endpoint for `event_rsvps` using the anon key.
  - Assert HTTP status is 200 (not 401 or 403).
  - No write operations.

  **Test B -- locked_at column existence on schedule_events:**
  - Send an authenticated GET request to `schedule_events` selecting only the `locked_at` column (e.g., `?select=locked_at&limit=1`).
  - Assert the response does not contain an error body indicating the column does not exist.
  - No write operations.

  **Test C -- admin-overlay.js payload completeness:**
  - Read the contents of `web/js/admin-overlay.js` from disk (use `fs.readFileSync` or equivalent).
  - Assert the string `undecided` is present.
  - Assert the string `notInterested` is present.
  - Assert the string `noResponse` is present.
  - This is a static file content check, not a runtime test.

7.2. Use the standard Playwright `test` / `expect` API consistent with any existing spec files in `tests/e2e/tests/`. Read one existing spec file first to confirm the import style and test structure in use before writing the new file.

</steps>

## Scope Guard
When all changes are complete, run: git diff --name-only
If any file outside the explicitly named scope appears, STOP and revert it with `git checkout <file>` before listing files modified.

<output_format>
After passing the Scope Guard, produce exactly this output and nothing else:

---
## Phase 0 Handback

### ITEM 1 -- RLS Diagnosis
[PASS or FAIL + HTTP status observed + one sentence]

### ITEM 2 -- Migration File
[WRITTEN or SKIPPED + path]

### ITEM 3 -- admin-overlay.js Fix
[DONE or SKIPPED + exact lines changed, quoted]

### ITEM 4 -- DESIGN.md chip-rsvp
[DONE or SKIPPED + section heading added]

### ITEM 5 -- DECISIONS.md ADR
[DONE or SKIPPED + ADR number assigned]

### ITEM 6 -- Playwright Spec
[DONE or SKIPPED + path]

### Files Modified
| File | Description |
|------|-------------|
| ...  | ...         |

### Assumptions
[Bulleted list of any assumptions made; NONE if none]
---
</output_format>

When complete, list every file modified with a one-line description. Note assumptions. STOP -- do not commit, push, or update logs.
