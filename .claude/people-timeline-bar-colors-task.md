<role>
You are a senior front-end engineer and TDD practitioner working on the Branson 2026 vacation dashboard — a static HTML/CSS/JS site hosted on GitHub Pages. Your sole goal in this session is to fix a rendering bug in `web/people-timeline.html`, following strict TDD discipline, and hand back a clean summary. You are not here to refactor, improve, or touch anything outside the explicit scope below.
</role>

<background>

**Project root:** `/Users/alex/vaults/Vacation/Branson 2026/`

**Architecture:** Static site. All pages live in `web/`. Data files (`people.json`, etc.) are fetched at runtime. CSS design tokens are defined in `css/tokens.css` and themed via `css/themes/*.css`.

**CSS token rename (applied 2026-04-29):**
| Old name (STALE — resolves to nothing) | New name (CORRECT) |
|---|---|
| `--accent-sand` | `--accent-1` |
| `--accent-clay` | `--accent-2` |
| `--accent-dusk` | `--accent-3` |

Any inline style or CSS rule that still references the old names will resolve to an empty string, producing invisible/transparent elements.

**Playwright E2E suite:**
- Spec files: `tests/e2e/` (9 specs)
- Run all: `cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test`
- Run single spec: `npx playwright test tests/people-timeline-bar-colors.spec.js`

**Frozen files — never open, never modify, never execute:**
- `scripts/generate_dashboard.py`
- `scripts/generate_attractions.py`

**Safety greps — ALL must return the indicated count after your changes. Run them before handing back:**
```bash
grep -c 'pointerdown' web/quick-pick.html           # must return 1
grep -c 'fetch.*data.json' web/attractions.html     # must return >= 1
grep -c 'fetch.*help.json' web/help.html            # must return 1
grep -c 'fetch.*schedule.json' web/event-timeline.html  # must return >= 1
grep -c 'fetch.*schedule.json' web/index.html       # must return >= 1
```

**Critical preservation rule:** Do not modify, remove, or restructure any HTML element not explicitly named in this task. If you spot something that looks unused or redundant, flag it in the handback report — do not touch it.

**Scope constraint:** Edit ONLY `web/people-timeline.html` and the new Playwright spec file you will create. After all changes are complete, run `git diff --name-only`. If any file outside those two appears in the diff, STOP, revert those changes, and state what happened before handing back.

</background>

<task>

**The bug:** On `web/people-timeline.html`, the Gantt bars for early-departure attendees (specifically those departing May 26 — e.g. "Bee" — and those departing May 27 — e.g. "Kevin") render with no visible color fill. The bars appear as empty transparent rectangles. All other attendee group bars render correctly.

**Root cause (confirmed):** The JavaScript that builds these groups assigns colors using the stale CSS token names `--accent-sand` (dep26 group) and `--accent-dusk` (dep27 group). Both names were renamed on 2026-04-29 and now resolve to nothing. The correct replacement tokens are `--accent-1` and `--accent-3` respectively.

**The fix required:** In `web/people-timeline.html`, in the `dep26.forEach` block, change `color: 'var(--accent-sand)'` → `color: 'var(--accent-1)'`. In the `dep27.forEach` block, change `color: 'var(--accent-dusk)'` → `color: 'var(--accent-3)'`. These are the ONLY changes needed in the HTML file.

</task>

<procedure>

Follow these steps **in exact order**. Do not skip or reorder.

**Step 1 — Inspect the current file**
Read `web/people-timeline.html` in full. Locate the two stale token references (`--accent-sand`, `--accent-dusk`) in the `dep26.forEach` and `dep27.forEach` blocks. Confirm they match the root cause described above before proceeding.

**Step 2 — Write the failing Playwright test**
Create a new spec file at `tests/e2e/people-timeline-bar-colors.spec.js`. The test must:
- Navigate to `people-timeline.html` (use the same base URL pattern as the other specs in `tests/e2e/`).
- Wait for the `#timeline-bars` element to be populated (wait for at least one `.bar` child).
- Find the `.bar` elements whose label text (sibling `<span>`) contains "Departs Tue 26" and "Departs Wed 27".
- Assert that each bar's computed `background-color` is NOT `rgba(0, 0, 0, 0)` (transparent) and NOT an empty string — i.e., it has a visible fill.
- The test should fail against the current broken code.

**Step 3 — Run the new test and confirm it FAILS**
Run: `npx playwright test tests/people-timeline-bar-colors.spec.js`
Confirm the output shows the test failing. Record the failure message. If it passes, STOP — something is wrong with the test logic. Fix the test before proceeding.

**Step 4 — Implement the fix**
In `web/people-timeline.html` only:
- Replace `'var(--accent-sand)'` → `'var(--accent-1)'` in the `dep26.forEach` block.
- Replace `'var(--accent-dusk)'` → `'var(--accent-3)'` in the `dep27.forEach` block.
Make no other changes to the file.

**Step 5 — Confirm the new test passes**
Run: `npx playwright test tests/people-timeline-bar-colors.spec.js`
Confirm it passes. Record the pass line.

**Step 6 — Run the full suite and confirm no regressions**
Run: `cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test`
Confirm all previously-passing tests still pass. Record the full pass/fail count.

**Step 7 — Run the safety greps**
Run every grep listed in the `<background>` section. Confirm each returns the required count.

**Step 8 — Scope check**
Run `git diff --name-only`. Confirm only `web/people-timeline.html` and `tests/e2e/people-timeline-bar-colors.spec.js` appear. If anything else appears, STOP and revert before handing back.

</procedure>

<example>

**What a correct Playwright assertion looks like for this pattern:**

```js
// Get the bar element inside the row labeled "Departs Tue 26"
const dep26Row = page.locator('div').filter({ hasText: 'Departs Tue 26' }).first();
const dep26Bar = dep26Row.locator('.bar');
const bgColor = await dep26Bar.evaluate(el =>
  getComputedStyle(el).backgroundColor
);
expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
expect(bgColor).not.toBe('');
expect(bgColor).not.toBe('transparent');
```

**Expected behavior BEFORE the fix:** `bgColor` returns `rgba(0, 0, 0, 0)` or empty → test FAILS ✓

**Expected behavior AFTER the fix:** `bgColor` returns a non-transparent resolved color (e.g. `rgb(210, 160, 90)`) → test PASSES ✓

</example>

<output_format>

Begin your handback response with this exact structure — no preamble before it:

```
## Handback Report

### Files Modified
1. `web/people-timeline.html` — <one-line description of change>
2. `tests/e2e/people-timeline-bar-colors.spec.js` — <one-line description>

### Test Results
- New spec (pre-fix): FAILED — <paste the failure line>
- New spec (post-fix): PASSED
- Full suite: X passed, Y failed (list any failures by name if > 0)

### Safety Greps
- grep -c 'pointerdown' web/quick-pick.html: <result>
- grep -c 'fetch.*data.json' web/attractions.html: <result>
- grep -c 'fetch.*help.json' web/help.html: <result>
- grep -c 'fetch.*schedule.json' web/event-timeline.html: <result>
- grep -c 'fetch.*schedule.json' web/index.html: <result>

### Scope Check (git diff --name-only)
<paste output>

### Assumptions / Judgment Calls
<list any; "None" if clean>

### Flagged Elements (preserved, not touched)
<list anything that looked unused or redundant; "None" if clean>
```

Stop after this report. Do not run git commit, git push, copy files, or update any logs.

</output_format>

<reminder>
- Do not invent or assume anything not explicitly stated in this prompt. Every fact you need is provided above.
- If the existing Playwright specs use a different base URL pattern than you expected, cite which spec file you referenced to determine the correct pattern. Do not guess.
- If `people.json` is not served by the Playwright test server and the test cannot navigate to `people-timeline.html` correctly, state this explicitly and describe what you found — do not silently skip the test or mock the data without flagging it.
- The only stale tokens to fix are `--accent-sand` → `--accent-1` and `--accent-dusk` → `--accent-3`. Do not rename `--accent-clay` / `--accent-2` unless you find a reference to `--accent-clay` in `web/people-timeline.html` — it is listed for completeness only.
- If you are uncertain whether a computed color represents "visible fill" vs. transparent in the test assertion, list both approaches (e.g., checking `backgroundColor !== 'rgba(0, 0, 0, 0)'` vs. parsing opacity) with tradeoffs. Do not silently pick one.
- Do not modify any file outside `web/people-timeline.html` and the new spec. If the fix cannot be confined to those two files, stop and state what you found before making any further changes.
</reminder>
