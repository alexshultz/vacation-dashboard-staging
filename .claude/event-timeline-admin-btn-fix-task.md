You are a surgical code editor working on the Branson 2026 vacation dashboard. Your goal is to move exactly one HTML element within a JavaScript template literal in a single file, with zero collateral changes.

<background>
Project: Branson 2026 vacation dashboard — a static multi-page site.
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
Working directory: /Users/alex/vaults/Vacation/Branson 2026

Root cause context: The `.admin-edit-btn` button is styled `position:absolute; top:8px; right:8px` relative to the `<details class="event-card" style="position:relative">` ancestor. When a `<details>` element is collapsed, the browser hides all children EXCEPT those inside `<summary>`. The button is currently a sibling of `<summary>`, so it disappears when the card is collapsed. Moving it inside `<summary>` makes it always visible, matching the behavior already present on index.html.

Design system: LOCKED. No CSS changes in this task.
Frozen scripts — never run or mention: generate_dashboard.py, generate_attractions.py
</background>

<task>
In the file `web/event-timeline.html`, locate the `renderCard` JavaScript template literal (approximately lines 113–150). Find the following structure:

```html
<details class="event-card" style="position:relative">
    <summary>
        <div class="event-card__summary-main">...</div>
        <div class="event-card__chips">...</div>
    </summary>
    <div class="event-card__body">...</div>
    <button class="admin-edit-btn" data-event-id="${event.id}" aria-label="Edit event" onclick="vacdashOpenEdit(this)">✏️</button>
</details>
```

Move the `<button class="admin-edit-btn" ...>` element to be the last child inside `<summary>`, immediately before `</summary>`, so the result is:

```html
<details class="event-card" style="position:relative">
    <summary>
        <div class="event-card__summary-main">...</div>
        <div class="event-card__chips">...</div>
        <button class="admin-edit-btn" data-event-id="${event.id}" aria-label="Edit event" onclick="vacdashOpenEdit(this)">✏️</button>
    </summary>
    <div class="event-card__body">...</div>
</details>
```

This is a pure element relocation. The button's tag, attributes, content, and indentation style must be preserved exactly as found in the actual file.
</task>

<constraints>
1. Edit `web/event-timeline.html` ONLY. Touch no other file.
2. Do NOT modify any HTML element, attribute, class, or text that is not the `admin-edit-btn` button being moved.
3. Do NOT make any CSS changes anywhere.
4. Do NOT run, invoke, or mention generate_dashboard.py or generate_attractions.py.
5. Do NOT run git, do not push, do not update logs.
6. If the actual button markup in the file differs in whitespace or attribute order from the example above, preserve the actual markup exactly — do not normalize it.
</constraints>

<rules>
1. Read the file first. Do not guess at line numbers or content — use the actual file content.
2. Perform the edit as a targeted find-and-replace of the minimum possible text span that uniquely identifies the old structure and produces the new structure.
3. After editing, re-read the affected section of the file to verify: (a) the button now appears inside `<summary>` as its last child, and (b) the button no longer appears after `</summary>`.
4. If you cannot find the exact structure described, STOP and report what you found instead of guessing or making an alternative edit.
5. If anything else in the file looks wrong or suspicious, note it in the handback report and leave it untouched.
6. Test awareness: The Playwright E2E suite lives at `tests/e2e/` and is run with `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test`. The failing test `admin-auth.spec.js` (event-timeline edit buttons visible) targets staging, not localhost — it will not pass until this fix is deployed. This is expected and is NOT a failure caused by this change. Note this in the handback.
</rules>

<output_format>
Begin your response with this exact header, filled in:

HANDBACK REPORT
───────────────
Status: [COMPLETE | BLOCKED | PARTIAL]
File edited: [path or "none"]
Change made: [one sentence describing what moved where]
Verification: [what you re-read and confirmed]
Staging test note: [acknowledge that admin-auth.spec.js will remain red until deployment]
Issues flagged (do not fix): [list or "none"]
</output_format>

<reminder>
You are making ONE structural change. Do not invent attributes, classes, or markup that you have not read directly from the file. Do not assume the file matches the examples above — read it first. If the structure is ambiguous or absent, report it and stop. Accuracy over speed.
</reminder>

When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
