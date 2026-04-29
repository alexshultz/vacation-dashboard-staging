<task>
You are a precise code editor. Apply three targeted UI polish changes to a single file in the Branson 2026 vacation dashboard. All three changes mirror improvements already shipped to `web/event-timeline.html` — do not touch that file or any other frozen file.
</task>

<background>
VAULT ROOT: /Users/alex/vaults/Vacation/Branson 2026
TARGET FILE: web/index.html (277 lines total)

FROZEN — never modify these files:
- scripts/generate_dashboard.py
- scripts/generate_attractions.py
- web/attractions.html
- web/wishlist.html
- web/suggested.html
- web/event-timeline.html

CSS variable reference (already defined globally — do not redefine):
- --color-ink-dim, --color-line, --color-surface, --radius-card
- --status-yes, --status-no, --warn

JavaScript chip style consts already in file (lines 161–163, reference only — do not change):
```js
const yesStyle = 'color:var(--status-yes);border-color:color-mix(in srgb,var(--status-yes) 35%,var(--color-line))';
const warnStyle = 'color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,var(--color-line))';
const noStyle  = 'color:var(--status-no);border-color:color-mix(in srgb,var(--status-no) 35%,var(--color-line))';
```
</background>

<task_detail>

## CHANGE 1 — "No Response" chip: add inline style to match border to text color

Apply to TWO locations:

**Location A — Line 76 (HTML legend):**
Find:
```html
    <span class="minichip">– No Response</span>
```
Replace with:
```html
    <span class="minichip" style="color:var(--color-ink-dim);border-color:color-mix(in srgb,var(--color-ink-dim) 35%,var(--color-line))">– No Response</span>
```

**Location B — Line 180 (JS renderCard innerHTML):**
Find:
```js
<span class="minichip">\u2013 ${event.noResponse.length}</span>
```
Replace with:
```js
<span class="minichip" style="color:var(--color-ink-dim);border-color:color-mix(in srgb,var(--color-ink-dim) 35%,var(--color-line))">\u2013 ${event.noResponse.length}</span>
```

---

## CHANGE 2 — Card body column reorder + visual divider

The header summary chips (lines 176–181, order: ✓ ? ✗ –) do NOT change.

Only the card body columns (lines 183–200) change.

**Current order:** Interested | Undecided | Not Interested | No Response
**New order:** Interested | Not Interested | Undecided | No Response

Additionally, the Undecided `<div>` (now 3rd column) gets a visual divider added:
```html
<div style="border-left:1px solid var(--color-line);padding-left:16px">
```

**Exact current block to replace (lines 183–200):**
```html
  <div class="event-card__body">
      <div>
          <div class="event-card__group-title" style="color:var(--status-yes)">Interested (${event.interested.length})</div>
          ${event.interested.map(nameCell).join('') || noneCell}
      </div>
      <div>
          <div class="event-card__group-title" style="color:var(--warn)">Undecided (${event.undecided.length})</div>
          ${event.undecided.map(nameCell).join('') || noneCell}
      </div>
      <div>
          <div class="event-card__group-title" style="color:var(--status-no)">Not Interested (${event.notInterested.length})</div>
          ${event.notInterested.map(nameCell).join('') || noneCell}
      </div>
      <div>
          <div class="event-card__group-title" style="color:var(--color-ink-dim)">No Response (${event.noResponse.length})</div>
          ${event.noResponse.map(nameCell).join('') || noneCell}
      </div>
  </div>
```

**Replace with:**
```html
  <div class="event-card__body">
      <div>
          <div class="event-card__group-title" style="color:var(--status-yes)">Interested (${event.interested.length})</div>
          ${event.interested.map(nameCell).join('') || noneCell}
      </div>
      <div>
          <div class="event-card__group-title" style="color:var(--status-no)">Not Interested (${event.notInterested.length})</div>
          ${event.notInterested.map(nameCell).join('') || noneCell}
      </div>
      <div style="border-left:1px solid var(--color-line);padding-left:16px">
          <div class="event-card__group-title" style="color:var(--warn)">Undecided (${event.undecided.length})</div>
          ${event.undecided.map(nameCell).join('') || noneCell}
      </div>
      <div>
          <div class="event-card__group-title" style="color:var(--color-ink-dim)">No Response (${event.noResponse.length})</div>
          ${event.noResponse.map(nameCell).join('') || noneCell}
      </div>
  </div>
```

---

## CHANGE 3 — Legend key: replace bare flex div with centered boxed 2x2 grid

**Sub-change 3a — CSS rule insertion:**

Find (line 58, inside the existing `<style>` block):
```css
  @media (min-width: 720px) { .event-card__body { grid-template-columns: repeat(4, 1fr); } }
```
Insert the following line IMMEDIATELY AFTER that line (do not replace it):
```css
  @media (min-width: 480px) { .legend-grid { grid-template-columns: repeat(4, auto); } }
```

**Sub-change 3b — Legend div replacement:**

Find (lines 72–77):
```html
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
    <span class="minichip" style="color:var(--status-yes);border-color:color-mix(in srgb,var(--status-yes) 35%,var(--color-line))">✓ Interested</span>
    <span class="minichip" style="color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,var(--color-line))">? Undecided</span>
    <span class="minichip" style="color:var(--status-no);border-color:color-mix(in srgb,var(--status-no) 35%,var(--color-line))">✗ Not Interested</span>
    <span class="minichip">– No Response</span>
  </div>
```
Replace with (note: the No Response chip already incorporates Change 1's inline style):
```html
  <div class="legend-grid" style="display:grid;grid-template-columns:repeat(2,auto);gap:8px;width:fit-content;margin:0 auto 16px;padding:12px 18px;background:var(--color-surface);border:1px solid var(--color-line);border-radius:var(--radius-card);">
    <span class="minichip" style="color:var(--status-yes);border-color:color-mix(in srgb,var(--status-yes) 35%,var(--color-line))">✓ Interested</span>
    <span class="minichip" style="color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,var(--color-line))">? Undecided</span>
    <span class="minichip" style="color:var(--status-no);border-color:color-mix(in srgb,var(--status-no) 35%,var(--color-line))">✗ Not Interested</span>
    <span class="minichip" style="color:var(--color-ink-dim);border-color:color-mix(in srgb,var(--color-ink-dim) 35%,var(--color-line))">– No Response</span>
  </div>
```

</task_detail>

<constraints>
- Edit ONLY web/index.html. Touch no other file.
- Do NOT commit, push, or rsync.
- Do NOT reformat or reindent any code beyond what is explicitly specified.
- Do NOT alter the JS chip style consts at lines 161–163.
- Do NOT alter the header summary chips order (✓ ? ✗ –).
- The No Response chip inline style (Change 1) must appear in BOTH the legend HTML and the JS renderCard string — two separate occurrences.
</constraints>

<verification>
After editing, run ALL 8 checks from the vault root. Every check must pass before reporting completion.

```bash
# Must return >= 2
grep -c 'color-ink-dim.*border-color' web/index.html

# Must return >= 2
grep -c 'Not Interested' web/index.html

# Must return >= 2
grep -c 'grid-template-columns' web/index.html

# Must return 1
grep -c 'pointerdown' web/quick-pick.html

# Must return >= 1
grep -c 'fetch.*data.json' web/attractions.html

# Must return 1
grep -c 'fetch.*help.json' web/help.html

# Must return >= 1
grep -c 'fetch.*schedule.json' web/index.html

# Must show ONLY web/index.html
git diff --name-only HEAD
```

If any check fails, diagnose and fix before reporting.
</verification>

<output_format>
Begin your response with this exact structure — no preamble:

**Files modified:**
- web/index.html — [one-line description of all changes]

**Changed blocks:**
[List every line or block modified, with before/after summary]

**Verification results:**
[Check 1]: [command] → [actual output] [PASS/FAIL]
[Check 2]: ...
...
[Check 8]: ...

**Anomalies:** [Any unexpected findings, or "None"]
</output_format>

<reminder>
- Do not invent or assume anything not explicitly stated above.
- If a find-string is not located exactly as written, stop and report the discrepancy — do not guess at an alternative location.
- Cite the exact line number when describing what was changed.
- If uncertain between two approaches, list both with tradeoffs. Do not silently pick one.
- When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
</reminder>
