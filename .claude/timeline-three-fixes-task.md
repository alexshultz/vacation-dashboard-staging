<role_and_goal>
You are a senior React/CSS engineer performing a precise, test-driven bug-fix pass on a single component. Your goal is to fix exactly three bugs in `web/Timeline.jsx` for the Branson 2026 vacation dashboard React SPA, write Playwright tests that prove each fix, and hand back a clean report. You must be confident about changes you verify by reading source code, and must state explicitly when you are uncertain rather than inventing behavior.
</role_and_goal>

<static_background>
**Project:** Branson 2026 vacation dashboard — React SPA
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Primary file:** `web/Timeline.jsx` (≈209 lines)
**Staging URL:** `https://vacation-dev.creeperbomb.com`
**Playwright test root:** `/Users/alex/vaults/Vacation/Branson 2026/tests/e2e/`
**New test file to create:** `tests/e2e/tests/timeline-fixes.spec.js`

**Key code facts (verified from source — do not assume, read the file first):**
- Component export: `TimelinePage` in `web/Timeline.jsx`
- Current broken default: `const [dayIdx, setDayIdx] = useStateTl(2);` (approx. line 16)
- Day tabs rendered via: `days.map((d, i) => <button className="day-tab" ...>)`
- Schedule data: `BD_SCHEDULE` array, elements shaped `{ date: 'YYYY-MM-DD', day: 'Monday', dayNum: N, events: [...] }`
- Trip window: index 0 = May 22 2026 → index 7 = May 29 2026
- Auth pattern for tests: set `localStorage['bd-user'] = 'alex'` via `page.addInitScript` before `goto`
- Gating selector: wait for `header.site-header` with `timeout: 30000` before any assertions
</static_background>

<constraints>
**TOUCH ONLY:**
- `web/Timeline.jsx` — all three bug fixes go here (logic + inline styles where possible)
- `tests/e2e/tests/timeline-fixes.spec.js` — new file; Playwright tests for all three bugs
- `styles.css` — ONLY if a CSS-only sticky-header fix cannot be expressed as inline styles in `Timeline.jsx`; if you touch it, justify why inline styles were insufficient

**DO NOT TOUCH UNDER ANY CIRCUMSTANCES:**
- `Shell.jsx`
- `loader.js`
- `Activities.jsx`
- Any other JSX, JS, or asset file not listed above
- Do not remove or restructure any HTML element not explicitly named in this task

**OBSERVE AND FLAG (do not fix):**
- If you notice elements that appear unused or redundant while reading the source, note them in the handback report under a "Flagged for Review" section. Do not touch them.
</constraints>

<task>
Fix the following three bugs in `web/Timeline.jsx`. Use strict TDD order for each: write the failing test → confirm it fails → implement the fix → confirm the test passes.

**Bug 1 — DATE STRIP TRUNCATION**
Day-tab buttons clip long day names (e.g., "Thursday") on 375 px-wide mobile screens.
Fix: all 8 day tabs must be fully visible and readable at 375 px viewport width without any text being cut off. Prefer a horizontal-scroll approach or flexible sizing; do not hide or abbreviate day names.

**Bug 2 — DEFAULT DATE LOGIC**
The hardcoded default `useStateTl(2)` always opens Monday regardless of actual date.
Fix the initial index using this logic (computed once on mount, not reactively):
- Today's ISO date string matches a `date` field in `BD_SCHEDULE` → use that element's index
- Today is before `'2026-05-22'` → default to index `0`
- Today is after `'2026-05-29'` → default to index `7`
Use `new Date()` and compare ISO date strings (`YYYY-MM-DD`). Do not use any external date library.

**Bug 3 — STICKY DATE HEADER**
The `.day-tabs` strip scrolls away when the user scrolls down through timeline events.
Fix: `.day-tabs` must stick to the top of the viewport (`position: sticky; top: 0`) while all content below it (events, people picker, etc.) scrolls normally. Apply this as an inline style on the `.day-tabs` container element in JSX. Only fall back to `styles.css` if the sticky behavior cannot be achieved with an inline style due to a structural constraint you can document.
</task>

<ordered_analysis>
Perform your work in this exact order:

1. **Read the source** — Open and read `web/Timeline.jsx` in full before writing a single line of code. Note actual line numbers for each bug site. If any key code fact listed above differs from what you read, state the discrepancy explicitly before proceeding.

2. **Write all three failing tests** — Create `tests/e2e/tests/timeline-fixes.spec.js` with three `test()` blocks, one per bug. Each test must fail against the current (unfixed) code.

3. **Run the tests and confirm failure** — Execute the Playwright suite from `/Users/alex/vaults/Vacation/Branson 2026/tests/e2e/` and paste the failure output for each test.

4. **Fix Bug 1 (truncation)** — Edit `web/Timeline.jsx`. Run test 1. Confirm it passes.

5. **Fix Bug 2 (default date logic)** — Edit `web/Timeline.jsx`. Run test 2. Confirm it passes.

6. **Fix Bug 3 (sticky header)** — Edit `web/Timeline.jsx` (and `styles.css` only if required). Run test 3. Confirm it passes.

7. **Run the full suite** — All three tests must be green together. Paste the final summary output.
</ordered_analysis>

<examples>
**Example: correct default-date logic (pseudocode only — match actual variable names from source)**
```js
function getTodayIndex(schedule) {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const idx = schedule.findIndex(d => d.date === today);
  if (idx !== -1) return idx;
  if (today < schedule[0].date) return 0;
  return schedule.length - 1;
}
const [dayIdx, setDayIdx] = useStateTl(() => getTodayIndex(BD_SCHEDULE));
```
*(Adapt to the real hook name and import pattern you see in the file.)*

**Example: sticky strip inline style**
```jsx
<div className="day-tabs" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
```
*(Use the actual element and existing className — do not rename or restructure.)*

**Example: Playwright test scaffold**
```js
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('https://vacation-dev.creeperbomb.com/timeline');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
});

test('Bug 1 – no day-tab clipping at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // assertion here
});
```
</examples>

<hallucination_guard>
CRITICAL REMINDERS — re-read before writing any code:

- Do NOT invent hook names, import paths, CSS class names, or array shapes. Read the file first and use exactly what is there.
- Do NOT assume the `useStateTl` hook accepts a function initializer without verifying it does. If it only accepts a plain value, compute the index before passing it.
- Do NOT assume `BD_SCHEDULE` is imported from a specific path — find the actual import line.
- Do NOT abbreviate or truncate day names as a "fix" for Bug 1. The requirement is that full names are visible.
- Do NOT remove, rename, or restructure any JSX element. Sticky behavior must be achieved by adding/modifying styles only.
- If any instruction in this prompt conflicts with what you observe in the actual source code, stop and state the conflict clearly before proceeding. Do not silently resolve ambiguity.
- If a test cannot be made to pass within the constraints (e.g., staging site is unreachable), document the blocker explicitly rather than fabricating a pass.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

Format:
```
MODIFIED FILES:
- web/Timeline.jsx — [one-line description of all changes made]
- tests/e2e/tests/timeline-fixes.spec.js — [one-line description]
- styles.css — [one-line description, or OMIT THIS LINE if not modified]

FLAGGED FOR REVIEW:
- [element or pattern, file:line, reason] (or "None" if nothing flagged)
```
</output_format>
