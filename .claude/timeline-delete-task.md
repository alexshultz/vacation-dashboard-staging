# Task: Add Delete/Remove Capability to Timeline Event Edit Modal

## 1. Context

Read the following files before making any decisions:
- `CLAUDE.md` — architecture conventions and golden rules
- `docs/DECISIONS.md` — ADRs governing data persistence, admin patterns, and schema
- `docs/lessons.md` — hard-won pitfalls from prior sprints
- `web/event-timeline.html` — family-facing timeline page (renderCard, card structure)
- `web/js/admin-overlay.js` — admin session gate, modal injection, edit/save lifecycle
- `web/js/site.js` — navigation and global script injection
- `web/components.css` — shared CSS including `.admin-edit-btn` rules

Staging URL: `https://vacation-dev.creeperbomb.com`
Playwright config default baseURL: `https://vacation-dev.creeperbomb.com`

## 2. Problem

When an admin user opens the edit modal for a timeline event (via the `.admin-edit-btn` pencil icon rendered inside `<summary>` on each `.event-card`), the modal contains only edit fields and a Save button. There is no Delete or Remove button. Admins have no way to remove an event from the timeline — for example, when a planned activity is cancelled.

**Observable symptoms:**
- Open `https://vacation-dev.creeperbomb.com/event-timeline.html` while authenticated as admin
- Click the edit pencil on any event card
- The edit modal renders with title, date, time, duration, description, etc.
- No delete/remove/cancel-event button or control is present anywhere in the modal

## 3. Desired Outcome

An admin can remove an event from the timeline. After removal, the event no longer appears in the rendered event card list. The UX is safe enough that accidental taps on mobile do not immediately destroy data.

What "done" looks like to the user:
- A remove/delete control is visible in the edit modal when an admin is authenticated
- Triggering it results in the event being removed from the displayed timeline
- The removal persists (page reload confirms it is gone)
- Non-admin users see no change to the family-facing event-timeline page

## 4. Engineering Ownership (Lazlo decides)

You own all of the following decisions. Read CLAUDE.md, DECISIONS.md, and the relevant source files before choosing. Do not guess at design intent — if a decision requires Alex's input, use the question protocol below.

- **Hard delete vs. soft archive** — permanent removal or hidden-but-retained in storage
- **Storage target** — whether the change touches `schedule.json`, Supabase `schedule_events`, or both (do not change the Supabase schema without first flagging it as a design question; see question protocol below)
- **UX design** — placement, label, and visual treatment of the remove control in the edit modal
- **Safeguard design** — whether a confirmation dialog, confirm text, or other friction is appropriate and what it looks like
- **Rollback/undo** — whether any recovery mechanism is warranted
- **admin-overlay.js extension pattern** — whether delete logic lives in admin-overlay.js, in event-timeline.html, or split between them, consistent with the established module contract

### Question Protocol (use freely — do not guess)

If any design decision requires Alex's input:
1. Write questions to `.claude/timeline-delete-questions.md`
2. Run:
   ```bash
   export PATH='/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/alex/.local/bin'
   hermes --profile vacation-coordinator 'LAZLO QUESTION: [your question here]'
   ```
3. Stop. Do not guess or proceed past the decision point.

**Trigger the question protocol if:** the chosen approach requires a Supabase schema change, a new table, or a new RLS policy.

## 5. Constraints (non-negotiable)

- **Do not modify** `generate_dashboard.py` or `generate_attractions.py` — permanently frozen
- **Do not modify** `data/attractions.json`, `data/blacklist.json`, or any file consumed by the frozen generators
- **Do not change the Supabase schema** (tables, columns, indexes, foreign keys) without flagging it as a design question first and stopping for Alex's answer
- **Do not commit, push, or deploy** — Hermes handles all post-code orchestration
- **Do not modify files outside the scope of this task** — at handback, run `git diff --name-only HEAD` and if any file outside the named scope appears, revert it with `git checkout <file>` before listing files modified
- **Scope:** changes are confined to `web/event-timeline.html`, `web/js/admin-overlay.js`, and `web/components.css` unless your diagnosis reveals a strong reason to touch another file — in which case name it and justify it in your handback notes
- **`<details>` visibility rule:** `.admin-edit-btn` must remain inside `<summary>` — do not move it. Any new button added to the edit modal lives inside the modal overlay, not inside `<summary>`.
- **`parseFloat` for duration:** the `duration` field is NUMERIC (decimal hours). Any save/reconstruct code must use `parseFloat()`, not `parseInt()`.
- **Hidden-state rule:** if you replace or add any element that must start hidden, it must carry `style="display:none;"` explicitly.
- **Sign Out rule:** do not add a Sign Out button anywhere in page content — `admin-overlay.js` provides `#vacdash-signout-btn` in the header universally.

## 6. Verify Your Work — TDD Mandate

**You must write the Playwright test FIRST, before writing any implementation code.**

### Step 0 — Baseline (before writing any code)

Record the current test state:
```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --reporter=line 2>&1 | tail -30 > /tmp/lazlo_test_baseline.txt
cat /tmp/lazlo_test_baseline.txt
```

### Step 1 — Write the failing test first

Add a new test to `tests/e2e/tests/admin-auth.spec.js` (or create `tests/e2e/tests/admin-timeline-delete.spec.js` if the new test is large enough to warrant separation — your call). The test must:

1. Authenticate as admin (use the existing `login()` helper pattern from `admin-auth.spec.js`)
2. Navigate to `event-timeline.html`
3. Click the edit button on the first visible event card
4. Assert that a delete/remove control is visible inside the edit modal
5. Trigger the delete/remove action (confirm any dialog if present)
6. Assert that the event card count has decreased by 1 (or the specific card is no longer in the DOM)
7. Reload the page and assert the removed event is still absent (persistence check)

**Run the test suite now and confirm the new test FAILS against the current codebase:**
```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --reporter=line 2>&1 | tail -40
```

The new test must fail (delete control not found) before you write any implementation. If it somehow passes without implementation, re-examine your assertions — they may be testing the wrong thing.

### Step 2 — Implement the fix

Implement the delete/remove capability. Respect all constraints and your own engineering decisions from Section 4.

### Step 3 — Full suite (targeted, then full)

After implementation:

**Targeted (your spec only):**
```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/admin-timeline-delete.spec.js --reporter=line 2>&1 | tail -30
```
(Substitute the actual spec filename.)

**Full suite:**
```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --reporter=line 2>&1 | tail -40
```

### Fix loop (max 3 cycles)

- Fix root cause within this task's scope only
- Do NOT modify, delete, skip, xfail, or weaken any pre-existing test
- Re-run and check after each cycle
- Stop early if: all tests pass; remaining failures match the baseline exactly (pre-existing, not caused by your changes); same error appears twice in a row

**Known pre-existing failure (do not attempt to fix):** `admin-auth.spec.js` — `event-timeline.html shows edit buttons when logged in` — was fixed in vault but is pending staging deployment. It will remain red until staged. Do not block handback on it.

**End your final response with this exact line (last line, nothing after it):**
`LAZLO_RESULT: tests_run=<yes|no> tests_passed=<yes|no|na> gave_up=<yes|no> iterations=<N>`

## 7. Handback

When all code changes are complete:

1. **First item — test status:**
   - ✅ Tests passed: all N tests passed (`<command used>`, N iterations)
   - ⚠️ No test suite found
   - ❌ Tests failing after N attempt(s): [failing test name — one-sentence diagnosis]
   - ℹ️ Pre-existing failures: N tests were already failing before this task

2. Run `git diff --name-only HEAD`. If any file outside the task scope appears in this diff, revert it with `git checkout <file>` before listing files modified.

3. List every file you modified with a one-line description.

4. Note any assumptions, judgment calls, or engineering decisions you made (especially regarding hard delete vs. archive, storage target, and UX/safeguard choices).

5. Note any design questions you deferred or punted on.

6. STOP. Do not commit, push, copy files, update logs, or modify CLAUDE.md. Hermes handles all post-code orchestration.
