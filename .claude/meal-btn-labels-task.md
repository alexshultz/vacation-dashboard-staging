<role_and_goal>
You are a precise surgical code editor. Your sole objective is to change two button label strings inside a single HTML file. You will make exactly two text substitutions — nothing else. No structural changes, no style changes, no behavior changes, no collateral edits of any kind.
</role_and_goal>

<project_context>
Project: Branson 2026 Dashboard
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
File to edit: web/admin.html (path relative to vault root)

This file is a hand-authored admin dashboard. It contains Playwright-tested UI elements. Three spec files cover the two buttons you are modifying:
  - tests/admin-meal-chips.spec.js
  - tests/admin-meal-conflict.spec.js
  - tests/admin-meal-selector.spec.js

All three spec files locate these buttons by element `id`, NOT by visible text. Changing the label text will not break any test. Do not open, read, or modify any spec file.

The following files are FROZEN — do not run or modify them under any circumstances:
  - generate_dashboard.py
  - generate_attractions.py
</project_context>

<constraints>
- Touch ONLY the two text nodes described below. Do not alter any HTML attribute, element tag, style, script, or other content anywhere in the file.
- If you notice any element that appears unused or redundant while reading the file, flag it in your handback report but do NOT remove or modify it.
- Do not run the Playwright test suite. No behavior has changed; no test run is required.
- Do not run git. Do not push. Do not update any log files.
</constraints>

<task>
Make exactly two text substitutions in:
  /Users/alex/vaults/Vacation/Branson 2026/web/admin.html

**Change 1 — line 431:**
  Element: `<button type="button" id="meal-move-right-btn" ...>`
  Current text node: `Add →`
  New text node:     `Not eating →`

**Change 2 — line 432:**
  Element: `<button type="button" id="meal-move-left-btn" ...>`
  Current text node: `← Remove`
  New text node:     `← Eating`

Every character of every HTML attribute, style value, and surrounding element must remain byte-for-byte identical to the original. Only the two text nodes listed above change.
</task>

<exact_current_html>
For reference, the current source at lines 431–432 is:

Line 431:
<button type="button" id="meal-move-right-btn" style="padding:6px 10px;border-radius:var(--radius-btn);background:var(--color-surface);border:1px solid var(--color-line);font-size:12px;cursor:pointer;color:var(--color-ink);white-space:nowrap;">Add →</button>

Line 432:
<button type="button" id="meal-move-left-btn" style="padding:6px 10px;border-radius:var(--radius-btn);background:var(--color-surface);border:1px solid var(--color-line);font-size:12px;cursor:pointer;color:var(--color-ink);white-space:nowrap;">← Remove</button>
</exact_current_html>

<example_transformation>
BEFORE (meal-move-right-btn):
  ...white-space:nowrap;">Add →</button>

AFTER (meal-move-right-btn):
  ...white-space:nowrap;">Not eating →</button>

Everything before and after the text node is unchanged. The arrow character `→` is preserved in place, only the word "Add" is replaced with "Not eating". Apply the same surgical approach to the left button.
</example_transformation>

<execution_steps>
Execute in this exact order:
1. Open /Users/alex/vaults/Vacation/Branson 2026/web/admin.html and confirm lines 431–432 match the exact current HTML shown above.
2. Locate the text node `Add →` inside the element with id="meal-move-right-btn". Replace it with `Not eating →`.
3. Locate the text node `← Remove` inside the element with id="meal-move-left-btn". Replace it with `← Eating`.
4. Verify: read lines 431–432 back from the saved file. Confirm both text nodes are updated and no attribute or surrounding content has changed.
5. Scan lines 428–435 (a few lines of surrounding context) and confirm no unintended diffs exist.
6. If you observed any element elsewhere in the file that looked unused or redundant during your read, note it in the handback report. Do not touch it.
</execution_steps>

<hallucination_guard>
STOP before saving if any of the following is true:
- You are about to modify more than two text nodes.
- You are about to change any HTML attribute, style property, tag structure, script, or CSS.
- You are about to edit any file other than web/admin.html.
- You are about to run generate_dashboard.py, generate_attractions.py, any test suite, or any git command.
If any of the above applies, halt and report what you found instead of proceeding.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
</output_format>
