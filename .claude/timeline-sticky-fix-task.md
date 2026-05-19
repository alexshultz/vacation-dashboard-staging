<role>
You are a senior front-end engineer and TDD practitioner working on a React SPA. Your goal is to fix a broken sticky date-header in Timeline.jsx so that the .day-tabs strip remains pinned to the top of the screen on mobile as the user scrolls through timeline events.
</role>

<background>
<project>Branson 2026 vacation dashboard — React SPA</project>
<vault_root>/Users/alex/vaults/Vacation/Branson 2026/</vault_root>
<allowed_files>
  - web/Timeline.jsx
  - web/styles.css
</allowed_files>
<constraints>
  - DO NOT modify any file not listed above.
  - Do NOT remove or restructure any HTML element not explicitly named in this task.
  - Flag anything that appears unused or redundant in the handback summary; do not delete it.
</constraints>
<known_facts>
  The following are starting hints only — you MUST read the actual files and confirm every value before using it:
  - .day-tabs inline style in Timeline.jsx is currently: { overflowX: 'auto', position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-bg)' }
  - .page-main has overflow-y: auto in styles.css (near line 103) — this is the scroll container that breaks position:sticky
  - .timeline-wrap has overflow: clip (near lines 256-263 in styles.css)
  - .site-header height is defined in styles.css — read the actual pixel value before assuming anything
</known_facts>
<root_cause>
.page-main has overflow-y: auto, making it the scroll container. position:sticky on .day-tabs is evaluated relative to .page-main, but .page-main has no fixed height, so the strip scrolls away on mobile instead of staying pinned.
</root_cause>
<staging>
  URL: https://vacation-dev.creeperbomb.com
  Auth: page.addInitScript → set localStorage key bd-user = 'alex' before page.goto
  Boot gate: waitForSelector('header.site-header', { timeout: 30000 })
</staging>
<tdd_requirements>
  Test file (new): tests/e2e/tests/timeline-sticky-fix.spec.js
  Playwright cannot assert fixed positioning visually — assert via getComputedStyle that .day-tabs has position 'fixed' (or 'sticky' if inner-scroll approach is used instead).
  Workflow: write failing test → confirm it fails → implement fix → confirm it passes.
</tdd_requirements>
</background>

<task>
Fix .day-tabs so it remains pinned to the top of the viewport on mobile during scroll.

<primary_fix>
Switch .day-tabs from position:sticky to position:fixed with top equal to the exact height of .site-header (read this value from styles.css — do not assume 56px or any other number). Preserve the existing zIndex (10) and background values. Add matching padding-top to the timeline content element immediately below .day-tabs so events are not hidden under the fixed strip.
</primary_fix>

<alternative_fix>
If position:fixed causes layout problems (e.g., width collapse, content jump, or horizontal scroll breakage), use this approach instead: wrap the timeline event content in a new dedicated inner scroll container with a defined height and overflow-y:auto, then keep position:sticky on .day-tabs so it anchors to that inner container. This approach requires no changes to .page-main.
</alternative_fix>
</task>

<analysis_order>
Follow this exact sequence — do not skip or reorder steps:

1. READ web/styles.css in full. Record:
   a. The exact pixel height of .site-header
   b. The exact rule(s) on .page-main (confirm overflow-y: auto and its line number)
   c. The exact rule(s) on .timeline-wrap (confirm overflow: clip and its line number)
   d. Any existing padding-top on the timeline content element below .day-tabs

2. READ web/Timeline.jsx in full. Record:
   a. The exact current inline style object on .day-tabs
   b. The exact class or element immediately below .day-tabs that contains timeline events
   c. Any existing padding or margin on that element

3. WRITE the failing Playwright test to tests/e2e/tests/timeline-sticky-fix.spec.js using the auth and boot-gate pattern described above. The test must navigate to the Timeline view and assert via getComputedStyle that .day-tabs does NOT yet have the target position value (making it a true red test before any code change).

4. RUN the Playwright test. Confirm it fails. Paste the failure output into your working notes.

5. IMPLEMENT the fix (primary approach first; fall back to alternative only if primary causes visible layout problems). Edit only web/Timeline.jsx and web/styles.css.

6. UPDATE the Playwright test assertion to assert the corrected position value ('fixed' or 'sticky' depending on which approach was used).

7. RUN the Playwright test again. Confirm it passes. Paste the passing output into your working notes.

8. Review both modified files for any inline values you hard-coded — replace every hard-coded pixel value with either a CSS custom property already present in styles.css or a value read directly from the file.
</analysis_order>

<hallucination_guard>
- Do not assume any pixel value, class name, element tag, or line number. Read every value from the actual files in steps 1 and 2.
- If a value you read conflicts with the known_facts hints above, trust the file — note the discrepancy in your handback summary.
- Do not invent CSS custom properties or class names that do not already exist in the codebase.
- Do not use approximate or "approximately" values in any code you write.
</hallucination_guard>

<output_format>
Handback summary:
1. Which approach was used (fixed or inner-scroll) and why
2. Exact .site-header height value read from styles.css
3. Any discrepancies found between known_facts and actual file contents
4. Any unused/redundant CSS or JSX flagged (list only -- do not remove)
</output_format>

When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
