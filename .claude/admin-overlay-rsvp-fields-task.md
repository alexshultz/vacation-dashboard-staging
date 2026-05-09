<task>
You are a precise, disciplined software engineer working on the Branson 2026 vacation dashboard. Your goal is to restore three missing RSVP fields (`undecided`, `notInterested`, `noResponse`) to `admin-overlay.js` using strict TDD. You will touch exactly one source file. If at any point you discover the fix requires changes outside that file, STOP and report what you found — do not proceed.

State uncertainty explicitly. Never guess at existing code structure — read the file first.
</task>

<background>
**Project:** Branson 2026 vacation dashboard — static HTML/CSS/JS site.
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Playwright suite location:** `tests/e2e/`
**Run Playwright with:** `cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test`

**The problem:** `web/js/admin-overlay.js` is missing three RSVP fields that were stripped during a sprint:
- `undecided`
- `notInterested`
- `noResponse`

All three must be restored to match the existing `interested` field pattern (form label + textarea, save-handler parsing, upsert payload inclusion, and `vacdashOpenEdit` population).

**Existing failing test** (already written — do NOT rewrite it):
File: `tests/e2e/tests/rsvp-phase0.spec.js`
```js
test('Phase 0 C -- admin-overlay.js payload includes undecided, notInterested, noResponse', async () => {
  const filePath = path.resolve(__dirname, '../../../web/js/admin-overlay.js');
  const content = fs.readFileSync(filePath, 'utf8');
  expect(content).toContain('undecided');
  expect(content).toContain('notInterested');
  expect(content).toContain('noResponse');
});
```

**Pattern to replicate** (mirror `interested` exactly):
1. Form: label + textarea placed immediately after the `vacdash-edit-interested` textarea block
2. Labels (uppercase, 12px, font-weight 700):
   - `"Undecided (comma-sep)"` → id `vacdash-edit-undecided`
   - `"Not Interested (comma-sep)"` → id `vacdash-edit-notInterested`
   - `"No Response (comma-sep)"` → id `vacdash-edit-noResponse`
3. Save handler: parse each textarea's value as comma-separated array (same logic as `interested`)
4. Upsert payload object: add `undecided`, `notInterested`, `noResponse` fields
5. `vacdashOpenEdit`: populate each textarea from `event.undecided`, `event.notInterested`, `event.noResponse` with the same graceful fallback used for `interested`

**FROZEN files — never open, never read, never execute:**
- `scripts/generate_dashboard.py`
- `scripts/generate_attractions.py`
</background>

<constraints>
**SCOPE LOCK:** Edit ONLY `web/js/admin-overlay.js`. New spec files are permitted. No other file may be modified.

After all changes, run:
```
git diff --name-only
```
If any path other than `web/js/admin-overlay.js` or a new spec file appears in the diff, STOP immediately and revert those changes before proceeding.

**Safety greps — run all five after changes; all must pass:**
```bash
grep -c 'pointerdown' web/quick-pick.html          # must return 1
grep -c 'fetch.*data.json' web/attractions.html     # must return >= 1
grep -c 'fetch.*help.json' web/help.html            # must return 1
grep -c 'fetch.*schedule.json' web/event-timeline.html  # must return >= 1
grep -c 'fetch.*schedule.json' web/index.html       # must return >= 1
```
If any grep returns an unexpected value, STOP and report before touching anything else.

**HTML elements:** Do not modify any HTML element not explicitly named in this task. If you notice anything that appears unused or redundant, FLAG it in your handback report — do not remove it.
</constraints>

<rules>
Numbered order of operations — follow exactly, do not skip or reorder:

1. **READ** `web/js/admin-overlay.js` in full before writing a single character. Confirm you understand the existing `interested` field pattern across all four locations (form markup, save handler, payload object, `vacdashOpenEdit`).

2. **CONFIRM FAILING STATE** — Run the Playwright suite now, before any changes:
   ```
   cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
   ```
   Confirm that the Phase 0 C test fails and record the failure message. If it passes already, STOP and report — do not proceed.

3. **IMPLEMENT THE FIX** in `web/js/admin-overlay.js` only:
   - Add three label+textarea blocks after the `vacdash-edit-interested` block (see pattern in `<background>`)
   - Add three fields to the upsert payload object
   - Add three parsing lines in the save handler
   - Add three population lines in `vacdashOpenEdit`

4. **RUN SAFETY GREPS** (all five listed in `<constraints>`). All must pass. If any fails, revert and report.

5. **RUN `git diff --name-only`** — confirm only `web/js/admin-overlay.js` (and any new spec file) appears. If anything else appears, STOP and revert.

6. **CONFIRM PHASE 0 C PASSES** — Run the Playwright suite again:
   ```
   cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
   ```
   Confirm Phase 0 C now passes.

7. **CONFIRM NO REGRESSIONS** — Verify the full Playwright suite result. Report any newly failing tests (tests that were passing before step 2 and are now failing). If regressions exist, STOP and report — do not attempt to fix them without explicit instruction.
</rules>

<output_format>
When complete, list every file you modified with a one-line description. Stop there. Do not run git, do not push, do not update logs.

Format:
```
MODIFIED FILES:
- web/js/admin-overlay.js — restored undecided, notInterested, noResponse textarea inputs, payload fields, save-handler parsing, and vacdashOpenEdit population
- [any new spec file, if created] — one-line description

SAFETY GREPS: PASSED / FAILED (list any failures)
PHASE 0 C TEST: PASSED / FAILED
FULL SUITE: X passed, Y failed (list any new failures by test name)
FLAGS: [anything unused/redundant observed but not touched]
```
</output_format>

<reminder>
Do not invent code you have not read. Read `web/js/admin-overlay.js` completely before writing anything. Do not assume the file matches the description in `<background>` — verify every detail against the actual file content. If the real file differs from the description in a way that affects the fix, STOP and report the discrepancy before proceeding. Never hallucinate field names, function signatures, or HTML structure. Only replicate patterns you can see in the file. If you are uncertain about any implementation detail, say so explicitly and ask rather than guessing.
</reminder>
