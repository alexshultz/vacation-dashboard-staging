<role>
You are a senior front-end engineer. Fix two layout issues in the Branson 2026 Timeline page.
</role>

<background>
Project: Branson 2026 vacation dashboard — React SPA
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
Staging URL: https://vacation-dev.creeperbomb.com

The Timeline page has a fixed .day-tabs date strip (position:fixed). Two problems reported by Alex after testing on device:

PROBLEM 1: The page title ("Timeline" h1 inside .page-hero) scrolls up and hides behind the fixed .day-tabs strip. The title should remain visible above the strip -- it should never disappear behind the fixed header.

PROBLEM 2: The people-picker row (.timeline-people, the chips showing family members) takes up unnecessary space. Hide it entirely for now. Do not delete it -- just hide it so it occupies zero space.
</background>

<constraints>
TOUCH ONLY: web/Timeline.jsx and/or web/styles.css
DO NOT modify any other file.
Do not delete any element -- only hide .timeline-people.
Do not restructure any JSX element not directly named in this task.
Flag anything else unusual in the handback -- do not fix it silently.
</constraints>

<task>
Step 1: READ web/Timeline.jsx in full. Identify:
  a. Where .page-hero / the h1 title sits in the JSX structure (is it inside or outside .timeline-wrap?)
  b. Where .timeline-people sits (is it inside .timeline-toolbar, or a sibling?)
  c. Any existing scroll-margin-top or padding on .page-hero

Step 2: READ web/styles.css. Identify:
  a. .page-hero rules -- any existing top padding, margin, or position
  b. .timeline-people rules -- current display value and any height/padding
  c. The fixed .day-tabs top value at mobile and desktop

Step 3: FIX PROBLEM 1 -- ensure the page title is not hidden by the fixed strip.
  The correct fix depends on what you find:
  - If .page-hero is INSIDE .timeline-wrap: add scroll-margin-top or padding-top to .page-hero equal to the fixed strip height + site-header height
  - If .page-hero is OUTSIDE .timeline-wrap (above it): the fixed strip should not cover it at all -- investigate why it does and fix the z-index or stacking order
  Do not guess. Read the structure first.

Step 4: FIX PROBLEM 2 -- hide .timeline-people.
  Add display: none to .timeline-people in styles.css. Do not remove the JSX or the CSS rule -- just add display:none so it can be re-enabled later by removing that one line.

Step 5: Verify both fixes make sense together -- no new overlap or gap introduced.
</task>

<hallucination_guard>
- Read actual file contents before writing any code.
- Do not assume where .page-hero sits relative to .timeline-wrap -- check the JSX.
- Do not invent CSS class names or custom properties.
- Do not delete JSX elements.
- If the root cause of Problem 1 is something unexpected, describe it and fix it correctly rather than applying a generic padding patch.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

MODIFIED FILES:
- [file] — [one-line description]

FLAGGED FOR REVIEW:
- [anything flagged, or "None"]
</output_format>
