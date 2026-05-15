<task>
You are a senior full-stack engineer working on the Branson 2026 family vacation admin dashboard. Your goal is to implement two targeted fixes in the project at `/Users/alex/vaults/Vacation/Branson 2026/`, using strict TDD: write failing Playwright tests first, confirm they fail, implement the fix, confirm all tests pass with no regressions.

You are operating with `--dangerously-skip-permissions`. Do not ask for confirmation. Execute every step.
</task>

<background>

## Project Layout

```
/Users/alex/vaults/Vacation/Branson 2026/
├── web/
│   ├── admin.html                          ← hand-edited; all admin JS is inline here. DO NOT regenerate.
│   └── js/admin-overlay.js                 ← shared admin module
└── tests/
    └── e2e/
        ├── playwright.config.js            ← testDir is ./tests (relative to tests/e2e/)
        └── tests/
            ├── admin-form-inputs.spec.js   ← REFERENCE: auth helper + .env.test loading pattern
            └── admin-save-dirty.spec.js    ← EXISTING dirty-state spec; add AC-1 test here
```

**All new spec files go in `tests/e2e/tests/` only.**

## Supabase Schema -- `schedule_events` Table

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `title` | text | |
| `date` | text | YYYY-MM-DD |
| `startTime` | text | HH:MM (24-hour) |
| `duration` | numeric | hours (decimal) |
| `event_type` | text | `'commitment'` \| `'open'` \| `'meal'` |
| `assigned_attendees` | TEXT[] | |
| `meal_override_include` | TEXT[] | names manually force-excluded (moved left to right by user) |
| `meal_override_exclude` | TEXT[] | names manually force-included (moved right to left by user, overriding a conflict) |

## Time Overlap Formula

Event A overlaps Event B if **both** conditions hold (strict inequality):
```
A.startTime < B.endTime   AND   B.startTime < A.endTime
```
where `endTime = startTime + duration` (duration in hours; compare as numeric minutes).

Non-overlapping events on the same date are **not** conflicts.

## Runtime Globals in `admin.html`

- `allAttendees` -- JS array of all 26 family name strings; already in scope.

## Design System Rules (LOCKED)

- Use only existing CSS classes and design tokens. Do **not** add new rules to `components.css`.
- For manual-override visual indicators: use a CSS border approach with existing token colors. `var(--accent-2)` (clay/amber) is the preferred indicator color for manual overrides. `var(--status-warn, #e67e22)` is the preferred color for conflict-change alerts. Add scoped styles in admin.html's existing `<style>` block only -- never in components.css.

## Critical Standing Rules

1. **Do not modify any HTML element not explicitly named in this task.** If you discover something that looks unused or wrong, flag it in your handback -- do not remove or alter it.
2. **TDD is non-negotiable.** The order is: write test → confirm it fails → implement → confirm it passes.
3. **Do not commit, push, or deploy** at any point.
4. **Spec files live at `tests/e2e/tests/<name>.spec.js` only.** No other location.
5. When uncertain between two implementation approaches, state both with tradeoffs. Do not silently pick one.

## How to Run Tests

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

</background>

<task_area_1>

## AREA 1 -- Bug Fix: Event Type Selector Does Not Trigger Dirty State

### Problem
Changing the event type segmented control / dropdown (`commitment` / `open` / `meal`) does **not** mark the form dirty or highlight the Save Changes button. Every other tracked field works correctly.

### Acceptance Criterion
**AC-1:** Changing the event type selection marks the form dirty and highlights the Save Changes button in exactly the same way that changing any other tracked field does.

### TDD Steps for AC-1

1. Read `tests/e2e/tests/admin-save-dirty.spec.js` in full to understand the existing dirty-state test pattern (button state assertion, auth helper, .env.test loading).
2. Add a new `test()` block to that file covering AC-1: load a real event, change the event type control, assert Save Changes is highlighted.
3. Run the new test. Confirm it FAILS. Record the failure.
4. Locate the dirty-state listener setup in `web/admin.html`. Add the equivalent listener for the event type control. Read the HTML first to identify the exact element ID/selector.
5. Run the full suite. The AC-1 test must pass. All prior tests must still pass.

</task_area_1>

<task_area_2>

## AREA 2 -- Meal Panel Redesign: Time-Aware Conflict Detection + Single Dual-Panel UI + Visual Override Indicators

### Problem
The current meal section has two sets of add/remove panels with inconsistent labels. There is no time-aware conflict detection. Manual overrides have no visual distinction from auto-placed chips.

### Acceptance Criteria

**AC-2 -- Time-aware conflict detection:**
When a meal event is loaded, fetch all other events for the same `date` from Supabase. For each fetched event, compute whether its time window overlaps the meal's time window using the formula in `<background>`. Only overlapping events are conflicts. Events on the same date with no time overlap are not conflicts.

**AC-3 -- Auto-exclusions (ephemeral):**
The `assigned_attendees` of all conflicting `commitment` events are automatically placed in the **right panel** (excluded from this meal) at load time. These auto-exclusions are **never saved to Supabase** -- they are recalculated fresh every time the meal form loads.

**AC-4 -- Left panel default:**
Every name in `allAttendees` not auto-excluded lands in the **left panel** (eating at this meal) at load time.

**AC-5 -- Manual overrides (persisted):**
After auto-population, the user may move chips manually:
- Moving left to right is a force-exclude; save that name to `meal_override_include`.
- Moving right to left is a force-include (overrides a conflict); save that name to `meal_override_exclude`.

On reload: recalculate auto-exclusions first, then apply saved manual overrides on top.

**AC-6 -- Single dual-panel layout:**
Exactly ONE left panel, ONE right panel, ONE "Add" button (moves selected left chips to right), ONE "Remove" button (moves selected right chips to left). No second set of panels or buttons anywhere in the meal section.

**AC-7 -- Live headcount:**
Meal headcount = number of chips in the left panel. Display and update live on every chip movement.

**AC-8 -- Manual override visual indicator:**
Chips that Alex manually moved (either direction) get a distinct border: `2px solid var(--accent-2)`. Auto-calculated placements have no border. This makes it immediately clear which chips are manually placed vs. auto-placed. The border must persist across re-renders until the override is removed.

**AC-9 -- Conflict-state change alert:**
If a manual override now conflicts with the current auto-calculation -- meaning Alex previously force-excluded someone (meal_override_include) who no longer has a time conflict, OR force-included someone (meal_override_exclude) who now has a new time conflict -- that chip gets an additional warning indicator: `2px solid var(--status-warn, #e67e22)` border (overrides the AC-8 border for that chip). The chip also shows a tooltip or visible label on hover/focus explaining the discrepancy. Example messages:
- "Manually excluded, but no longer has a time conflict"
- "Manually included, but now conflicts with: [Event Title]"

**AC-10 -- Alert does not auto-resolve:**
The system surfaces the AC-9 discrepancy but does NOT silently reassign the chip. Alex's manual override holds until Alex moves the chip. The indicator just flags that the situation has changed since Alex last made a decision.

### TDD Steps for ACs 2-10

1. Read `tests/e2e/tests/admin-form-inputs.spec.js` in full for auth helper and mock/intercept patterns.
2. Read `web/admin.html` in full to understand current meal panel HTML, element IDs, and inline JS before writing any code.
3. Write ALL failing tests first in `tests/e2e/tests/admin-meal-conflict.spec.js`. Use `page.route()` to mock Supabase network calls for deterministic tests. Write one test per AC (AC-2 through AC-10).
4. Run the new spec. Confirm ALL new tests FAIL. Record failures. Do not proceed until confirmed.
5. Implement in `web/admin.html` in this order: AC-6 (layout) → AC-2 (overlap detection) → AC-3/AC-4 (auto-population) → AC-5 (manual override persistence) → AC-7 (headcount) → AC-8 (manual border) → AC-9/AC-10 (conflict-change alert).
6. Run the full suite. All AC-1 through AC-10 tests must pass. All prior tests must still pass.
7. Iterate if needed (max 5 cycles before declaring a blocker).

</task_area_2>

<example>

## Time Overlap Example

Given this meal event:
```
startTime: "12:00", duration: 1.5  → endTime: "13:30"
```

Same-date events:
```
Event A: startTime: "11:00", duration: 1.0 → endTime: "12:00"  ← NOT a conflict (boundary touch, not overlap)
Event B: startTime: "11:00", duration: 1.5 → endTime: "12:30"  ← CONFLICT
Event C: startTime: "13:30", duration: 1.0 → endTime: "14:30"  ← NOT a conflict (boundary touch)
Event D: startTime: "10:00", duration: 3.0 → endTime: "13:00"  ← CONFLICT
```

Only B and D conflict. Their assigned_attendees go to the right panel. A and C are unaffected.

</example>

<constraints>
- Never modify `components.css` or any external stylesheet. Scoped styles in admin.html `<style>` block only.
- Never regenerate `web/admin.html` from scratch. Edit surgically.
- Never modify any HTML element not described in this task. Flag unexpected elements in handback.
- Never commit, push, or deploy.
- All spec files at `tests/e2e/tests/` only.
- Follow the exact auth helper and `.env.test` loading pattern from `admin-form-inputs.spec.js`.
- `meal_override_include` = names force-excluded (moved left to right manually). `meal_override_exclude` = names force-included (moved right to left manually). Do not swap these.
- Auto-exclusions are ephemeral. Never written to Supabase. Only manual overrides persist.
- Overlap formula uses strict inequality on both sides. Do not soften it.
- If uncertain between two approaches, write both with tradeoffs before choosing.
</constraints>

<output_format>
Begin your handback with this block:

```
LAZLO_RESULT: tests_run=yes|no tests_passed=yes|no|na gave_up=yes|no iterations=N
```

Then list every file modified, one per line:

```
FILE_MODIFIED: <relative-path-from-vault-root> -- <one-line description>
```

Flag any untouched-but-suspicious elements:

```
FLAG: <element id or selector> in <file> -- <reason flagged>
```

Stop there. Do not run git. Do not push. Do not update logs.
</output_format>

<reminder>
- Do not guess at element IDs, function names, or variable names. Read the files first.
- If information is missing or unclear after reading, say so explicitly. Do not guess.
- TDD order is non-negotiable: failing test confirmed → implement → passing confirmed.
- AC-8 border (manual indicator) and AC-9 border (conflict-change alert) apply to chips that have BOTH conditions simultaneously: AC-9 wins (warn color overrides clay color).
- On reload: auto-exclusions recalculated first, manual overrides applied second, AC-9 alerts evaluated third.
- Do not commit, push, or deploy under any circumstances.
</reminder>
