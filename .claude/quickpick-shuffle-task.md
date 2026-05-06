# Task Brief: Randomize Quick Pick Deck Order on Every Page Load

## 1. Context

The Quick Pick page (`web/quick-pick.html`) fetches `data.json` at runtime, builds an
`ATTRACTIONS` array from `data.attractions`, then passes it through `filterAttractions()`
to produce `currentDeck`. The resulting deck is presented to the user in the same fixed
order on every page load — currently the order produced by `data.json`, which is
alphabetically pre-sorted by `sort_key`.

The user should see a different deck order every time they load the page, so each session
feels fresh.

Read `CLAUDE.md` and `docs/lessons.md` in full before writing any code.

## 2. Desired Outcome

After every page load of `quick-pick.html`, the sequence of `.deck-card` elements in
`#deck-stage` is in a different (randomised) order. Users who reload the page see cards
in a shuffled order, not the same alphabetical sequence.

## 3. TDD Mandate — Tests First, In This Order

**Step A — Write a failing test.**
Add a new spec file: `tests/e2e/tests/quickpick-shuffle.spec.js`.

The test must:
1. Load `quick-pick.html` and wait for at least 3 `.deck-card` elements in `#deck-stage`
   (give the fetch time to resolve — use an appropriate `waitFor`).
2. Collect the text content of all rendered `.deck-card h3` elements and record the order
   as `loadOne`.
3. Reload the page (navigate again or `page.reload()`), wait for at least 3 `.deck-card`
   elements.
4. Collect the `.deck-card h3` order again as `loadTwo`.
5. Assert that `loadOne` and `loadTwo` are NOT identical in order. If they are the same,
   the test fails.

> **Threshold note:** The deck may have many cards. Running two loads and checking the
> full order gives a near-zero probability of a false pass if shuffling is real. If the
> total card count is fewer than 3 (empty deck / staging data issue), skip the test with
> a clear skip message rather than a hard failure.

**Step B — Confirm the test FAILS against the current unmodified code.**
Run the suite:
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/quickpick-shuffle.spec.js
```
Record the failure output. If the test unexpectedly PASSES before any code change, stop
and write a design question to `.claude/quickpick-shuffle-questions.md`. Do not proceed.

**Step C — Implement the fix.**
You own the diagnosis and approach. You may shuffle `ATTRACTIONS` after it is loaded,
shuffle the result of `filterAttractions()` before assigning `currentDeck`, or use any
other approach you judge correct. Do not prescribe a specific algorithm here — that is
your call as engineer. The only constraint: the shuffled order must differ across page
loads (i.e., it cannot be seeded with a fixed constant).

**Step D — Confirm the test PASSES.**
Re-run the spec:
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/quickpick-shuffle.spec.js
```
Must show the new test passing.

## 4. Constraints

- **Edit only `web/quick-pick.html` and `tests/e2e/tests/quickpick-shuffle.spec.js`.**
  No other file may be modified. If you determine that a correct fix requires touching
  another file, write a design question to `.claude/quickpick-shuffle-questions.md` and
  stop.
- **Do not prescribe the shuffle algorithm.** Choose the implementation approach
  yourself.
- **Do not commit, push, or deploy.**
- **If any design question arises that requires Alex's input,** write it to
  `.claude/quickpick-shuffle-questions.md` and stop.
- **Frozen-file rule:** Never run `generate_dashboard.py` or `generate_attractions.py`.

## 5. Verify Your Work

**Step 0 — Baseline (before writing any code).**
Run the full suite and capture current state:
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test --reporter=list 2>&1 | tail -30 > /tmp/lazlo_test_baseline.txt && cat /tmp/lazlo_test_baseline.txt
```

**Step 1 — New spec failing (after writing the test, before any fix).**
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/quickpick-shuffle.spec.js
```
This MUST fail. If it passes, stop and file a question.

**Step 2 — New spec passing (after implementing the fix).**
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test tests/quickpick-shuffle.spec.js
```
Must show the shuffle test passing.

**Step 3 — Full suite.**
```
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```
All tests must pass or match the pre-existing baseline from Step 0. No new failures
introduced by this task.

**Fix loop (max 3 cycles):**
- Fix root cause within this task's scope only (quick-pick.html + the new spec).
- Do NOT modify, delete, skip, or xfail any pre-existing test files.
- Re-run and check. Repeat up to 3 cycles total.
- Stop early if: all tests pass; failures match the baseline; fixing requires
  out-of-scope changes; same error appears twice in a row.

**Safety check before handback:**
```bash
grep -c 'pointerdown' web/quick-pick.html          # must return 1
grep -c 'fetch.*data.json' web/quick-pick.html     # must return >= 1
git diff --name-only HEAD
```
If `git diff --name-only HEAD` shows any file outside `web/quick-pick.html` and
`tests/e2e/tests/quickpick-shuffle.spec.js`, STOP and revert the out-of-scope file
before continuing.

**End your final response with this exact line (last line, nothing after it):**
`LAZLO_RESULT: tests_run=<yes|no> tests_passed=<yes|no|na> gave_up=<yes|no> iterations=<N>`

## 6. Scope

Files you may create or modify:
- `web/quick-pick.html` — add shuffle logic
- `tests/e2e/tests/quickpick-shuffle.spec.js` — new file, the failing-then-passing test

Files you must NOT touch:
- `CLAUDE.md`, `docs/lessons.md`, `docs/DECISIONS.md`, `docs/PROJECT_LOG.md`
- Any other HTML, JS, CSS, or JSON file not listed above
- Any pre-existing spec file

## 7. Handback

When all code changes are complete:

1. List every file you created or modified with a one-line description.
2. Paste the test output proving Step B (test FAILS before fix) and Step D (test PASSES
   after fix).
3. Note any assumptions or judgment calls (e.g., where in the data pipeline you placed
   the shuffle, and why).
4. Run `git diff --name-only HEAD` and confirm only the two scoped files appear.
5. **STOP.** Do not commit, push, copy files, run the deploy sequence, or update
   PROJECT_LOG.md or DECISIONS.md. Hermes handles all post-code orchestration.

`LAZLO_RESULT: tests_run=<yes|no> tests_passed=<yes|no|na> gave_up=<yes|no> iterations=<N>`
