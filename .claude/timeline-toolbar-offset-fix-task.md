<role>
You are a senior front-end engineer. Your goal is to fix a single CSS value: the padding-top on .timeline-toolbar in styles.css is not tall enough to clear the fixed .day-tabs strip, causing the top 1-2 timeline events to be hidden behind the date header.
</role>

<background>
Project: Branson 2026 vacation dashboard — React SPA
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
Staging URL: https://vacation-dev.creeperbomb.com

.day-tabs is position:fixed. .timeline-toolbar currently has padding: 58px 16px 14px (the 58px top padding was intended to clear the fixed strip). Alex confirmed on device that the first 1-2 timeline events are still hidden behind the fixed header -- 58px is not enough.
</background>

<constraints>
TOUCH ONLY: web/styles.css
DO NOT modify Timeline.jsx, any other JSX file, or any other file.
Do not remove or restructure any CSS rule not directly involved in this fix.
</constraints>

<task>
Fix the padding-top on .timeline-toolbar so the first timeline event is fully visible below the fixed .day-tabs strip at both mobile and desktop breakpoints.

Step 1: Read web/styles.css. Find:
  a. The current padding value on .timeline-toolbar (near line 269)
  b. The .day-tabs rule: top value at mobile (≤719px) and desktop (≥720px)
  c. The .day-tab rule: min-height, padding, font-size -- anything that contributes to the rendered height of the strip
  d. Any gap or padding on .timeline-toolbar .day-tabs itself

Step 2: Calculate the actual rendered height of the fixed .day-tabs strip at mobile:
  - Strip height = day-tab min-height + any vertical padding on .day-tabs + any border
  - Total space needed below site-header = top value + strip height
  - padding-top on .timeline-toolbar must equal: (strip height) + some breathing room (8-12px)

Step 3: Update padding-top on .timeline-toolbar for mobile. If desktop needs a different value (because top offset differs), add or update the existing @media (min-width: 720px) rule for .timeline-toolbar as well.

Step 4: If there is a separate .timeline-grid or .timeline-stage element that also needs a top offset, check whether it is inside .timeline-toolbar. If it is inside, the padding-top fix covers it. If it is outside, it may need its own adjustment -- flag this in the handback rather than guessing.
</task>

<hallucination_guard>
- Read the actual CSS values. Do not assume 44px, 58px, or any other value without reading the file.
- Do not invent CSS custom properties.
- Do not touch Timeline.jsx.
- If uncertain whether a sibling element also needs adjustment, flag it -- do not silently fix elements outside .timeline-toolbar.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

MODIFIED FILES:
- web/styles.css — [one-line description]

FLAGGED FOR REVIEW:
- [anything flagged, or "None"]
</output_format>
