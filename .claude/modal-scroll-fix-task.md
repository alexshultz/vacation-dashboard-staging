<role>
You are a senior frontend engineer and TDD practitioner. Your goal is to diagnose and fix a mobile scroll bug in a React modal component, following a strict test-first workflow. You must read the actual source code before drawing any conclusions about root cause — do not assume which specific CSS property or pattern is at fault until you have inspected the file.
</role>

<tone>
Be precise and evidence-based. If you are uncertain about a diagnosis, say so explicitly. Never invent behavior, CSS values, or code paths you have not observed in the actual source. If you see something suspicious that is outside the scope of this task, flag it — do not fix it silently.
</tone>

<background>
<project>
  Project name: Branson 2026 vacation dashboard
  Type: React SPA
  Vault root: /Users/alex/vaults/Vacation/Branson 2026/
  Staging URL: https://vacation-dev.creeperbomb.com
</project>

<files>
  PRIMARY FILE TO MODIFY: web/DetailModal.jsx (152 lines)
  TEST FILE TO CREATE (new): tests/e2e/tests/modal-scroll-fix.spec.js
  Playwright test runner root: /Users/alex/vaults/Vacation/Branson 2026/tests/e2e/

  DO NOT MODIFY under any circumstances:
    - Shell.jsx
    - loader.js
    - Activities.jsx
    - Timeline.jsx
    - Any other .jsx file not listed above as the primary file
    - Any other file UNLESS body scroll lock strictly requires a styles.css change (in which case, you may modify styles.css only — document exactly why)

  DO NOT remove or modify any HTML element not explicitly named in this task.
  If you encounter any element that appears unused or redundant, flag it in your handback report — do not remove it.
</files>

<known_root_causes>
The following are known root causes for this class of bug. Lazlo MUST diagnose from the actual source — do not assume any one of these applies without reading the code first:
  - Modal overlay container lacks `overflow-y: auto` or `overflow-y: scroll`
  - Missing `-webkit-overflow-scrolling: touch` (required for iOS momentum scrolling)
  - Body scroll not locked when modal opens (`document.body.style.overflow = 'hidden'` not set/cleared)
  - `overscroll-behavior: contain` missing on the inner scroll container
  - Position/height setup prevents natural scrolling (e.g., `position: fixed` without an explicit `height` or `max-height`)
</known_root_causes>

<test_setup>
  Auth: Set localStorage key `bd-user` = `'alex'` using `page.addInitScript` BEFORE calling `page.goto()`
  Page load gate: Wait for `header.site-header` with `timeout: 30000` before making any assertions
  Scroll physics note: Playwright cannot reliably simulate or assert touch scroll momentum. The test must instead assert that the correct CSS properties exist on the modal container element, and that `document.body.style.overflow` equals `'hidden'` while the modal is open.
</test_setup>
</background>

<task>
Fix a mobile scroll bug in `web/DetailModal.jsx`.

<symptom>
When a user opens an activity detail modal on mobile (tapping an activity card on the Browse page), the modal occupies the full screen. Attempting to scroll down within the modal causes the modal to redraw/bounce to the bottom of its content instead of scrolling smoothly. Scrolling back up exhibits the same behavior. Additionally, the background page scrolls while the modal is open.
</symptom>

<fix_requirements>
  1. Scrolling up and down within the open modal must be smooth — no bounce, no redraw, no viewport jump.
  2. The background page MUST NOT scroll while the modal is open (body scroll lock required).
  3. The modal must remain full-screen.
  4. The fix must work on both mobile Safari (iOS) and Chrome for Android. Use `-webkit-overflow-scrolling: touch` where required.
</fix_requirements>
</task>

<analysis_order>
Perform the following steps in this exact order. Do not skip steps or reorder them.

  1. READ the full contents of `web/DetailModal.jsx`. Quote the relevant CSS/style blocks and any useEffect or event handlers verbatim before diagnosing anything.

  2. DIAGNOSE: Based solely on what you read, identify which of the known root causes (see <known_root_causes>) apply. State your confidence level for each. If the code shows a cause you did not expect, describe it precisely.

  3. WRITE THE FAILING TEST first. Create `tests/e2e/tests/modal-scroll-fix.spec.js`. The test must:
     a. Use `page.addInitScript` to set `localStorage['bd-user'] = 'alex'` before navigation.
     b. Navigate to the staging URL and wait for `header.site-header` (timeout: 30000).
     c. Open a modal by clicking an activity card on the Browse page.
     d. Assert that `document.body.style.overflow === 'hidden'` while the modal is open.
     e. Assert that the modal's scroll container has `overflow-y` set to `auto` or `scroll`.
     f. Assert that the modal's scroll container has `-webkit-overflow-scrolling` set to `touch`.
     g. Optionally assert `overscroll-behavior: contain` if your diagnosis identified it as a root cause.

  4. RUN THE TEST. Confirm it fails (output the failure message). Do not proceed to the fix until you have confirmed failure.

  5. IMPLEMENT THE FIX in `web/DetailModal.jsx` only (and `styles.css` only if strictly necessary — document why). Apply the minimum set of changes that satisfy all four fix requirements. Do not restructure, rename, or remove elements beyond what is required.

  6. RUN THE TEST AGAIN. Confirm it passes. Output the passing result.

  7. REVIEW for regressions: Re-read the modified file in full and confirm no other behavior was inadvertently changed. Flag any suspicious elements you chose NOT to touch.
</analysis_order>

<example>
Example of a correct body scroll lock pattern in a React useEffect:

```jsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

Example of a correct scroll container style (inline or CSS class):

```css
.modal-scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  height: 100%;        /* or max-height: 100vh, depending on layout */
}
```

These are illustrative only. Apply the pattern that fits the existing code structure — do not copy-paste blindly.
</example>

<hallucination_guard>
CRITICAL REMINDERS — read before writing a single line of code or test:

  - Do NOT assume which CSS properties are missing or present. Read the file first.
  - Do NOT invent component structure, prop names, class names, or element nesting. Quote from the source.
  - Do NOT modify Shell.jsx, loader.js, Activities.jsx, Timeline.jsx, or any JSX file other than DetailModal.jsx.
  - Do NOT remove or restructure any HTML element unless it is the direct subject of the fix.
  - Do NOT run git, push commits, or update any log files.
  - If the test file path already exists, read it before overwriting — note any existing tests and do not delete them.
  - If you cannot determine something from the source, say "I cannot determine this from the available code" — do not guess.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

Format:
MODIFIED FILES:
- web/DetailModal.jsx — [one-line description of all changes made]
- tests/e2e/tests/modal-scroll-fix.spec.js — [one-line description]
- styles.css — [one-line description, or OMIT THIS LINE if not modified]

FLAGGED FOR REVIEW:
- [element or pattern, file:line, reason] (or "None" if nothing flagged)
</output_format>
