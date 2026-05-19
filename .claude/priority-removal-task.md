You are Lazlo, a senior staff engineer. Execute this scoped refactor with surgical precision. Every phase has a gate — do not advance until the gate condition is met and output is printed.

Do not commit, push, run generate_dashboard.py, run generate_attractions.py, or update any log file at any point.

══════════════════════════════════════════
PROJECT PATHS
══════════════════════════════════════════
Vault root:      /Users/alex/vaults/Vacation/Branson 2026/
Production repo: ~/code/vacation-dashboard
Staging repo:    ~/code/vacation-dashboard-dev
Playwright cmd:  cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test --workers=2
Spec directory:  tests/e2e/tests/*.spec.js

══════════════════════════════════════════
OBJECTIVE
══════════════════════════════════════════
Remove the priority system completely from the Branson 2026 Dashboard — every rendered string, every JS read/write, every HTML element, every data field, every doc reference. Zero instances must remain when you are done.

══════════════════════════════════════════
PHASE 0 — INVENTORY  [GATE: print list before any edit]
══════════════════════════════════════════
Search the entire vault root recursively. For every occurrence of the word "priority" (case-insensitive), record:

  • File path (relative to vault root)
  • Line number
  • Form — one of: rendered-text | js-read | js-write | js-ref | html-element | html-attribute | json-data-field | doc-reference | test-assertion
  • Exact line content (truncated to 120 chars)

Also search the two deploy repos:
  ~/code/vacation-dashboard/
  ~/code/vacation-dashboard-dev/

Use searches like:
  grep -rn -i "priority" "/Users/alex/vaults/Vacation/Branson 2026/" --include="*.html" --include="*.js" --include="*.json" --include="*.md" --include="*.txt"
  grep -rn -i "priority" ~/code/vacation-dashboard/
  grep -rn -i "priority" ~/code/vacation-dashboard-dev/

The PM has identified these known instances — verify each one (confirm file path, line number, exact content) and add any the PM missed:

  #  | File                        | Approx line | Form             | PM note
  ---|-----------------------------|-------------|------------------|------------------------------------------
  1  | web/event-timeline.html     | 197         | rendered-text    | `${event.duration}h • ${esc(event.priority)} priority`
  2  | web/index.html              | 184         | rendered-text    | `${event.date} • ${event.priority} priority`
  3  | web/admin.html              | 1261        | js-ref           | priority field passed through on event load
  4  | web/admin.html              | TBD         | html-element     | <select> or label for vacdash-edit-priority
  5  | web/admin-overlay.js        | 75          | js-ref           | vacdash-edit-priority wiring
  6  | web/admin-overlay.js        | 185         | js-ref           | vacdash-edit-priority wiring
  7  | web/admin-overlay.js        | 230         | js-ref           | vacdash-edit-priority wiring
  8  | web/admin-overlay.js        | 268         | js-ref           | vacdash-edit-priority wiring
  9  | web/admin-overlay.js        | 336         | js-ref           | vacdash-edit-priority wiring
  10 | web/schedule.json           | all 28 events | json-data-field | "priority": "..." on every event object
  11 | web/DESIGN.md               | TBD         | doc-reference    | priority display documentation
  12 | docs/PROJECT_LOG.md         | TBD         | doc-reference    | priority references
  13 | .claude/ task briefs        | TBD         | doc-reference    | any file referencing priority

GATE 0: Print the complete, verified inventory table. Do not begin Phase 1 until you have printed it.

══════════════════════════════════════════
PHASE 1 — TDD: WRITE NEGATIVE ASSERTIONS  [GATE: new tests must FAIL before removal]
══════════════════════════════════════════
Before removing anything, create a new spec file:
  tests/e2e/tests/no-priority.spec.js

Write Playwright assertions that will prove priority text is absent AFTER removal. They must cover every family-facing page that renders events:
  • index.html (home/overview)
  • event-timeline.html (timeline view)
  • Any other page in the suite that renders event data

For each page, navigate to it and assert that NO element contains the text "priority" in a case-insensitive, visible-text sense. Use patterns such as:
  await expect(page.locator('body')).not.toContainText('priority', { ignoreCase: true });

Run the Playwright suite now:
  cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test --workers=2

GATE 1: The new no-priority assertions MUST FAIL (because priority text is still present). Print the failure output. If the assertions do not fail, STOP and report — either the selectors are wrong or priority is already absent. Do not proceed until you see red on these specific assertions.

══════════════════════════════════════════
PHASE 2 — REMOVAL
══════════════════════════════════════════
Work through every item in the inventory. Apply the scope rules below strictly.

--- web/event-timeline.html ---
Remove only the substring ` • ${esc(event.priority)} priority` (or equivalent) from the template literal on line ~197. Do not alter any other part of that line or any surrounding element.

--- web/index.html ---
Remove only the substring ` • ${event.priority} priority` (or equivalent) from the template literal on line ~184. Do not alter any other part of that line or any surrounding element.

--- web/admin.html ---
(a) Find and remove the <select> element with id "vacdash-edit-priority" and its associated <label>. Remove the complete element(s). Do not alter adjacent elements.
(b) On line ~1261, remove the priority field from the object being passed through when loading event data. Preserve all other fields on that object.
If you find any additional priority references in admin.html beyond (a) and (b), remove them and document each in your handback.

--- web/admin-overlay.js ---
Remove every read, write, and reference to:
  • document.getElementById('vacdash-edit-priority') or querySelector equivalent
  • .value assignments to/from that element
  • any property named `priority` being read from or written to an event object
Lines ~75, 185, 230, 268, 336 are the known targets. If removal of those lines leaves orphaned logic (e.g., a now-empty if-block or unused variable), remove the orphan too and document it in your handback. Preserve all surrounding unrelated logic.

--- web/schedule.json ---
Delete the "priority" key-value pair from every event object. All 28 events must be modified. Do not alter any other field. Ensure the resulting JSON is valid.

--- web/DESIGN.md ---
Delete every paragraph, section heading, bullet point, or inline reference that documents priority display behavior or priority levels. Do not alter any other content.

--- docs/PROJECT_LOG.md ---
Delete every line or block that references priority. Do not alter any other content.

--- .claude/ task brief files ---
For each file in .claude/ that contains the word "priority", delete the specific lines that reference it. Do not alter unrelated content.

══════════════════════════════════════════
HARD CONSTRAINTS — DO NOT TOUCH
══════════════════════════════════════════
  ✗  data/attractions.json — completely out of scope
  ✗  generate_dashboard.py — PERMANENTLY FROZEN, never run or modify
  ✗  generate_attractions.py — PERMANENTLY FROZEN, never run or modify
  ✗  Any HTML element not explicitly named above. If you encounter an element that looks unused or redundant, flag it in your handback report. Do not remove it.
  ✗  Do not commit, push, or update any log or tracking file.

══════════════════════════════════════════
PHASE 3 — VERIFICATION
══════════════════════════════════════════

Step 3a — Run the full Playwright suite:
  cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test --workers=2

All tests must pass, including the new no-priority assertions. Print the full output. If anything is red, fix it and re-run before proceeding.

GATE 3a: Green suite. Do not proceed until the suite is fully green.

Step 3b — Cold search (independent verification):
Run these commands exactly and paste their raw output verbatim. Do not summarize, interpret, or paraphrase the results:

  grep -rn -i "priority" "/Users/alex/vaults/Vacation/Branson 2026/" \
    --include="*.html" --include="*.js" --include="*.json" \
    --include="*.md" --include="*.txt"

  grep -rn -i "priority" ~/code/vacation-dashboard/

  grep -rn -i "priority" ~/code/vacation-dashboard-dev/

If any result refers to a priority data field, priority display logic, priority UI control, or priority documentation, you have not finished. Fix every hit and re-run all three searches until all three return empty output.

You must not self-certify. The raw grep output is the only valid certification.

GATE 3b: All three grep commands return zero results. Print the output (including "no results" confirmation) and do not advance until it is clean.

══════════════════════════════════════════
PHASE 4 — HANDBACK REPORT
══════════════════════════════════════════
Output a structured report with exactly these five sections. Do not omit any section.

**MODIFIED FILES**
File path | one-line description of change
(list every file edited)

**INVENTORY vs. REALITY**
List every instance found during Phase 0 that was NOT in the PM inventory (new finds). If none: "No additional instances found."

**JUDGMENT CALLS**
Document every decision made that was not explicitly specified in this prompt (e.g., "removed orphaned variable X at line Y because it became unreachable after removing the priority read"). If none: "No judgment calls."

**COLD SEARCH OUTPUT**
Paste the complete raw output from all three grep commands in Phase 3b.

**PLAYWRIGHT RESULTS**
Paste the final test suite output (pass/fail summary line from npx playwright test).

══════════════════════════════════════════
STOP.
Do not commit. Do not push. Do not update any log file. Do not mark any task complete in any tracking system. Your work ends with the handback report above.
══════════════════════════════════════════
