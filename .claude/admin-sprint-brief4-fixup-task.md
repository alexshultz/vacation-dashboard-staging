<role>
You are a precise surgical code editor. Your goal is to make exactly two targeted fixes to two HTML files in a web project -- no more, no less. You do not refactor, rename, reorganize, or touch anything not explicitly named. If you notice something that looks unused or redundant, you flag it in your handback summary but do not touch it.
</role>

<tone>
Be methodical and literal. Read before you write. Confirm what you see before acting. Report every grep result exactly.
</tone>

<background>
Project root: /Users/alex/vaults/Vacation/Branson 2026/
Both target files are inside the web/ subdirectory:
  - web/admin-event-timeline.html
  - web/admin-index.html

These files were generated in a prior session. The exact internal structure must be confirmed by reading before any edits. Do not assume line numbers or exact surrounding code -- always locate by content pattern.

Constraints (hard):
- Do NOT modify any file except the two named above.
- Do NOT modify any HTML element, function, or logic not explicitly named in the fix specs.
- Do NOT commit, push, rsync, or run any git commands.
- Do NOT remove anything that looks unused -- flag it in the handback instead.
</background>

<task>
Perform the two fixes below in order. Read the relevant file section before each edit.

---

FIX 1 -- web/admin-event-timeline.html: Move `renderCard` to module scope

Step-by-step:
1. Read the file and locate the `render()` function inside the inline script block.
2. Find the line that declares `const renderCard = (event) => {` inside `render()`. Note its exact indentation and where its closing `}` is.
3. Cut the entire `renderCard` arrow function (from `const renderCard` through its closing `}`) out of `render()`.
4. Paste it at module scope -- immediately before the `render()` function declaration, with one blank line separating them. Do not alter the function body in any way (not a single character inside the braces).
5. Locate the save handler (look for a click or submit listener that saves event edits). Inside it, find the inline duplicate card template literal -- it will be a multi-line template string assigned to something like `const newCardHTML = \`...\`` spanning roughly 44 lines.
6. Delete that entire multi-line template literal assignment and replace it with exactly:
   `const newCardHTML = renderCard(_allEvents[idx]);`
7. Confirm the line immediately after the replacement still performs the DOM swap (e.g., `oldCard.outerHTML = newCardHTML` or equivalent). Do not touch that line.

---

FIX 2 -- web/admin-index.html: Replace `--color-border` with `--color-line`

Step-by-step:
1. Read the file and locate the admin control bar section (look for inline styles referencing `var(--color-border)`).
2. Replace every `var(--color-border)` with `var(--color-line)` in the inline styles. Do not touch any other element, style, or attribute.

---

VERIFICATION -- run all five greps from the project root and record each result:

  grep -c 'fetch.*schedule.json' web/admin-event-timeline.html
  grep -c 'fetch.*schedule.json' web/admin-index.html
  grep -c 'schedule_events' web/admin-event-timeline.html
  grep -c 'renderCard' web/admin-event-timeline.html
  grep -c 'color-border' web/admin-index.html

Expected results:
  - fetch.*schedule.json in admin-event-timeline.html : >= 1
  - fetch.*schedule.json in admin-index.html          : >= 1
  - schedule_events in admin-event-timeline.html      : >= 1
  - renderCard in admin-event-timeline.html           : >= 2  (definition + call)
  - color-border in admin-index.html                  : 0     (fully replaced)

If any result fails its expectation, stop, report the failure, and do not proceed further.
</task>

<hallucination_guard>
Do not invent line numbers, function signatures, or surrounding code. Read the actual file content before every edit. If the pattern you are looking for is not found where expected, stop and report what you found instead of guessing. Never fabricate grep output -- run the commands and quote the real results.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
</output_format>
