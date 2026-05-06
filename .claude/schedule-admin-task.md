<task>
You are lazlo, a senior full-stack engineer embedded in the Branson 2026 vacation dashboard project. Your goal is to solve two tightly coupled bugs in the event timeline system: (1) add a Create New Event flow to the admin UI, and (2) fix the family-facing timeline so a healthy-but-empty Supabase response is treated as authoritative and does not fall back to stale placeholder data. Both problems must be solved in a single pass because they are part of the same workflow.

If you are uncertain about any existing behavior, READ the file before changing it. Never invent function signatures, CSS class names, or Supabase column names — derive them from the source.
</task>

---

<background>
**Project:** Branson 2026 vacation dashboard. Static site hosted on GitHub Pages.
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Live URL:** https://vacation.creeperbomb.com/

**Architecture summary:**
- `web/admin-event-timeline.html` — admin page; already uses Supabase upsert for editing existing events via a pencil-icon modal. The Supabase anon key and project URL are already present in this file — do NOT change them.
- `web/event-timeline.html` — family-facing timeline; fetches from Supabase `schedule_events` table at render time, falls back to `web/schedule.json` on failure.
- `web/schedule.json` — static fallback with 28 placeholder events (will remain as the network-failure fallback only).
- Supabase table: `schedule_events`. The `duration` column is **NUMERIC** (stores decimal hours, e.g. `1.5`).
- Design system is **LOCKED**. Use only existing CSS tokens and classes already present in the file. Zero new design decisions.
- Playwright E2E suite lives at `tests/e2e/`. Full suite command: `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test`
- Existing relevant specs: `admin-timeline-delete.spec.js`, `admin-auth.spec.js`

**Known bug to fix opportunistically:**
The save handler in `admin-event-timeline.html` calls `parseInt` on the `duration` field. Because `duration` is a NUMERIC column that stores decimal hours, this truncates values like `1.5` to `1`. Fix this to `parseFloat` as part of the save handler work.
</background>

---

<constraints>
**Files explicitly IN scope — touch ONLY these:**
1. `web/admin-event-timeline.html` — add Create New Event capability
2. `web/event-timeline.html` — fix empty-Supabase fallback logic
3. `tests/e2e/<new-spec-file>.spec.js` — new Playwright spec covering create flow and fallback behavior

**Files explicitly OUT of scope — do NOT touch under any circumstances:**
- `web/js/admin-overlay.js`
- `web/js/site.js`
- `web/js/picks.js`
- `web/css/` (any file in this directory)
- `web/DESIGN.md`
- `CLAUDE.md`
- `scripts/generate_dashboard.py` (FROZEN — do not run, reference, or modify)
- `scripts/generate_attractions.py` (FROZEN — do not run, reference, or modify)
- Any file not listed above as in scope
</constraints>

---

<rules>
**Order of analysis — follow this sequence exactly:**

1. **Read before writing.** Open and read `web/admin-event-timeline.html` in full. Identify: the existing edit modal HTML, the upsert save handler, the Supabase client initialization, and the event list rendering logic. Do not assume anything — read it.

2. **Read `web/event-timeline.html` in full.** Identify precisely where the Supabase fetch occurs, what condition currently triggers the `schedule.json` fallback, and where events are rendered.

3. **Write failing tests first (see TDD Mandate below).** Write the new Playwright spec file before making any HTML changes. Confirm the tests fail against the current code.

4. **Implement Problem 1 — Create New Event in `web/admin-event-timeline.html`:**
   - Add a "Create New Event" button that opens a blank version of the existing edit modal (or a clearly labeled variant). Reuse the modal and its form fields exactly — do not build a second modal.
   - On save, use the same Supabase upsert pattern already in the file. For new events, omit `id` from the payload so Supabase generates it (or follow whatever pattern is already established — read the file first).
   - After a successful create, update the event list in the DOM without requiring a full page reload if the existing rendering logic makes that straightforward. If it is not straightforward, a reliable reload is acceptable — note the choice in your handback.
   - Fix `parseInt` → `parseFloat` for the `duration` field in the save handler.
   - Use only existing CSS classes and tokens.

5. **Implement Problem 2 — Fix fallback logic in `web/event-timeline.html`:**
   - A valid HTTP 200 response from Supabase is authoritative regardless of whether the returned array is empty.
   - When Supabase returns 200 + empty array: render an empty-state message in the timeline (e.g., "No events scheduled yet — check back soon!"). Do not load `schedule.json`.
   - `schedule.json` fallback must remain active for: network failures, non-200 HTTP responses, and any exception thrown during the fetch.
   - Preserve the existing `schedule.json` fallback `fetch` call — do not delete it.

6. **Run safety checks:**
   ```
   grep -c 'fetch.*schedule.json' web/event-timeline.html   # must be >= 1
   grep -c 'fetch.*schedule_events' web/event-timeline.html  # must be >= 1
   ```
   If either returns 0, stop and fix before proceeding.

7. **Run the full Playwright suite and confirm green (see Verify Your Work below).**

8. **Run the Scope Guard (see below).**

9. **Produce handback.**
</rules>

---

## TDD Mandate
1. Write the failing test first. Confirm it fails against current code.
2. Implement the fix.
3. Confirm the test passes and no regressions exist.
4. Do not stop and hand back while tests are red.

---

## Verify Your Work
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
All tests must pass before submitting handback. Passkey biometric flow cannot be tested headlessly -- a green suite is sufficient.

---

## Scope Guard
When all code changes are complete, run: git diff --name-only
If any file outside the explicitly named scope appears in this diff, STOP and revert it with `git checkout <file>` before listing files modified. Do not accept out-of-scope mutations even if they look helpful.

---

<output_format>
When all work is complete, produce the handback in exactly this structure — nothing before it, nothing after it:

```
## Handback

### Files Modified
- `web/admin-event-timeline.html` — <one-line description of what changed>
- `web/event-timeline.html` — <one-line description of what changed>
- `tests/e2e/<filename>.spec.js` — <one-line description of what the spec covers>

### Assumptions & Judgment Calls
- <bullet for each decision made under ambiguity, e.g., "Chose page reload over DOM patch for post-create refresh because the render function closes over a stale array">
- <bullet for the parseInt → parseFloat fix confirming it was applied>
- <any other judgment call>

### Safety Check Results
- `grep -c 'fetch.*schedule.json' web/event-timeline.html` → <result>
- `grep -c 'fetch.*schedule_events' web/event-timeline.html` → <result>

### Test Results
- Suite: <N> passed, <N> failed, <N> skipped
- New spec: <pass/fail>

STOP — do not commit, push, copy files, or update logs.
```
</output_format>

---

<reminder>
You are working in a real production codebase. Never invent CSS class names, Supabase column names, function names, or modal IDs — derive every identifier from what you actually read in the source files. If you cannot find an identifier, say so in the handback assumptions section rather than guessing. The `duration` NUMERIC column fix (`parseInt` → `parseFloat`) is a confirmed known bug — apply it. All other changes must be grounded in what the files actually contain.
</reminder>
