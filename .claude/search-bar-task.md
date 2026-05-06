<task>
You are a senior front-end engineer working on the Branson 2026 vacation dashboard. Your goal is to replace the chip filter system in `web/attractions.html` with a live-search bar. This is a surgical edit to one file only. Grill-me is already complete — proceed directly to implementation.
</task>

<background>
## Project Layout

- **Vault root:** `/Users/alex/vaults/Vacation/Branson 2026`
- **File to modify:** `web/attractions.html` — THE ONLY FILE YOU MAY EDIT
- **Frozen files (never open, never touch, never run):**
  - `generate_dashboard.py`
  - `generate_attractions.py`
  - `components.css`
  - `tokens.css`
  - `trail.css`
  - Every other HTML file (`web/quick-pick.html`, `web/help.html`, etc.)

## Current HTML Structure

The chip filter system occupies **two** locations inside `web/attractions.html`:

1. **HTML block (~lines 45–99):** The entire `<div class="filter-popover-wrap">` including the Filter toggle button, the popover `<div>`, and all chip `<button>` elements inside it.
2. **Script block (~lines 250–315):** All JavaScript that initialises the chip filter, reads `vacdash:v1:filter` from localStorage, wires chip click handlers, and calls the card-visibility function.

Both locations must be fully replaced/removed. No dead HTML or dead JS referencing chips, `filter-popover`, `filter-toggle`, or `vacdash:v1:filter` may remain after your edit.

## Card Data Structure

Each rendered card element has:
- `data-tags="family music country"` — space-separated tag strings set at render time in `renderCatalog()`
- Visible heading (name) and paragraph (description) in its inner HTML

The preferred approach for the search blob: **inside `renderCatalog()`**, when constructing each card element, add a `data-search` attribute set to:
```
a.name + " " + (a.description || "") + " " + (a.tags || []).join(" ")
```
(all lower-cased is fine here, or lower-case at query time — your choice, but be consistent).

At filter time, the search logic reads `card.dataset.search` rather than scraping DOM text.

## Existing Infrastructure to Preserve Exactly

- `renderCatalog()` function — keep the entire body intact except for adding the `data-search` attribute to each card element
- `fetch('data.json')` call — do not touch
- `escAttr()` / `escText()` helpers — do not touch
- `HOOK_MAX` constant — do not touch
- `#live-count` paragraph — already renders "Showing N of M"; keep it and update it on every filter pass
- Name-modal and wishlist logic — do not touch
- Detail modal logic — do not touch
</background>

<task_description>
## What to Build

### 1. Remove the Chip Filter — HTML

Delete the entire `<div class="filter-popover-wrap">…</div>` block (Filter toggle button + popover div + all chip buttons). Replace it with this search UI in the same position:

```html
<div class="search-wrap">
  <input
    id="attraction-search"
    type="search"
    placeholder="Search attractions…"
    aria-label="Search attractions"
    autocomplete="off"
    style="width:100%;padding:0.5rem 0.75rem;font-size:1rem;border:1px solid var(--border,#ccc);border-radius:6px;box-sizing:border-box;"
  />
  <p style="margin:0.25rem 0 0;font-size:0.8rem;color:var(--muted,#666);">
    e.g. <code>tag:free ice cream</code> &nbsp;·&nbsp; <code>tag:outdoor -tag:thrill</code>
  </p>
</div>
```

> You may adjust the inline styles only if a CSS variable already defined in the project gives a better result. Do NOT add new classes or rules to any stylesheet.

---

### 2. Remove the Chip Filter — JavaScript

Delete all JavaScript in the script block that handles: chip state, `vacdash:v1:filter`, popover toggle, chip click events, and chip-based card visibility.

---

### 3. Add the Search Logic — JavaScript

Add the following behaviour in the same script block (after `renderCatalog` is defined, before or after it is called — your choice of placement, but it must fire after the DOM is populated):

#### Query Parser

Parse the raw query string into three parts:
- **tagIncludes** — array of strings from `tag:<value>` tokens (case-insensitive tag values)
- **tagExcludes** — array of strings from `-tag:<value>` tokens
- **phrase** — the remainder of the query string after stripping all `tag:` and `-tag:` tokens, trimmed and lower-cased

#### Filter Function — `applySearch(query)`

```
function applySearch(query) {
  const q = query.trim().toLowerCase();
  // parse tagIncludes, tagExcludes, phrase from q
  const cards = document.querySelectorAll('.card');   // adjust selector to match actual card class
  let shown = 0;
  cards.forEach(card => {
    const blob = (card.dataset.search || '').toLowerCase();
    const tagList = (card.dataset.tags || '').toLowerCase().split(/\s+/);

    let visible = true;
    // tag: includes
    for (const t of tagIncludes) { if (!tagList.includes(t)) { visible = false; break; } }
    // -tag: excludes
    if (visible) for (const t of tagExcludes) { if (tagList.includes(t)) { visible = false; break; } }
    // phrase match
    if (visible && phrase && !blob.includes(phrase)) { visible = false; }

    card.style.display = visible ? '' : 'none';
    if (visible) shown++;
  });
  // update #live-count
  const countEl = document.getElementById('live-count');
  if (countEl) {
    const total = cards.length;
    countEl.textContent = `Showing ${shown} of ${total}`;
  }
  // persist
  localStorage.setItem('vacdash:v1:search', query);
}
```

> Adapt the card selector (`.card`) to match whatever class `renderCatalog()` actually applies to each card element. Do not guess — read the existing render loop first.

#### Wire the Input

After `renderCatalog()` resolves (inside `.then()` or `async/await` block):

```javascript
const searchInput = document.getElementById('attraction-search');

// restore saved query
const savedQuery = localStorage.getItem('vacdash:v1:search') || '';
searchInput.value = savedQuery;
applySearch(savedQuery);

// live filter
searchInput.addEventListener('input', () => applySearch(searchInput.value));
```

---

### 4. Add `data-search` to Each Card in `renderCatalog()`

Inside `renderCatalog()`, when building each card element, add:

```javascript
cardEl.dataset.search = (a.name + ' ' + (a.description || '') + ' ' + (a.tags || []).join(' ')).toLowerCase();
```

Place this line immediately after the card element is created and before it is appended to the DOM. Do not alter any other line in `renderCatalog()`.
</task_description>

<constraints>
1. **Touch only `web/attractions.html`.** Any edit to another file is a critical failure.
2. **Do not run or modify** `generate_dashboard.py` or `generate_attractions.py`.
3. **Do not add rules** to any `.css` file.
4. **Preserve all 20 Playwright tests.** Run the suite after your changes:
   ```
   cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
   ```
   All 20 must pass. If any fail, fix `attractions.html` until they do.
5. **Run safety greps** before any `git` operation and confirm all pass:
   ```bash
   grep -c 'fetch.*data.json' web/attractions.html   # must be >= 1
   grep -c 'pointerdown' web/quick-pick.html          # must be 1  (verify only, file unchanged)
   grep -c 'fetch.*help.json' web/help.html           # must be 1  (verify only, file unchanged)
   ```
6. **No dead references.** After your edit, `grep -i 'filter-popover\|filter-toggle\|chip\|vacdash:v1:filter'` must return 0 matches in `web/attractions.html`.
7. **Flag but do not remove** any element that looks unused or redundant but is not explicitly named in this brief. Note it in the handback report.
8. **Do not guess.** If you encounter an ambiguity (e.g., the actual card CSS class differs from `.card`), read the file first, then use the correct value. State any ambiguity you resolve in the handback report.
</constraints>

<order_of_operations>
Execute in this exact sequence:

1. **Read** `web/attractions.html` in full. Note:
   - Exact line ranges of the `filter-popover-wrap` block
   - Exact line ranges of the chip-filter JS block
   - The actual CSS class applied to each card by `renderCatalog()`
   - The current `#live-count` update logic

2. **Plan** the diff mentally — identify every line to remove and every line to add.

3. **Edit** `web/attractions.html`:
   a. Remove `filter-popover-wrap` HTML block; insert search UI in its place.
   b. Remove chip-filter JS block; insert `applySearch()` function + input wiring.
   c. Add `data-search` attribute assignment inside `renderCatalog()`.

4. **Verify** by reading the modified file: confirm no dead references to chips/filter-popover/`vacdash:v1:filter`.

5. **Run safety greps** (listed above). Confirm results. Fix if any fail.

6. **Run Playwright suite.** All 20 tests must pass. Fix if any fail.

7. **Write handback report** (see output format below).
</order_of_operations>

<examples>
### Query parsing examples

| Raw query | tagIncludes | tagExcludes | phrase |
|-----------|-------------|-------------|--------|
| `ice cream` | [] | [] | `"ice cream"` |
| `tag:free` | ["free"] | [] | `""` |
| `tag:free ice cream` | ["free"] | [] | `"ice cream"` |
| `tag:outdoor -tag:thrill` | ["outdoor"] | ["thrill"] | `""` |
| `tag:family -tag:thrill go-karts` | ["family"] | ["thrill"] | `"go-karts"` |

### Card visibility logic (pseudo-code)

```
visible = true
for each t in tagIncludes:   if t not in card's tag list → visible = false
for each t in tagExcludes:   if t in card's tag list     → visible = false
if phrase != "":             if phrase not in card's search blob → visible = false
```
</examples>

<output_format>
After completing all implementation and testing steps, write your handback report as a fenced markdown block using this exact structure:

```markdown
## Search Bar — Handback Report

### Changes Made
- [ list every meaningful change with file + line range or function name ]

### Safety Grep Results
- `grep -c 'fetch.*data.json' web/attractions.html` → N
- `grep -c 'pointerdown' web/quick-pick.html`       → N
- `grep -c 'fetch.*help.json' web/help.html`        → N

### Playwright Results
- Tests passed: N / 20
- Any failures: [ none | description ]

### Card Class Used
- Actual card element selector used in `applySearch()`: [ value ]

### Ambiguities Resolved
- [ list any discrepancies between this brief and the actual file, and how you resolved them ]

### Flagged (Not Removed) Elements
- [ any elements that looked unused/redundant but were not named in the brief ]

### Dead Reference Check
- `grep -i 'filter-popover|filter-toggle|chip|vacdash:v1:filter'` in attractions.html → 0 matches: [ YES / NO — if NO, explain ]
```
</output_format>

<reminder>
- You modify ONLY `web/attractions.html`. Any other file touched is a critical failure.
- Do not invent card class names, attribute names, or localStorage keys not specified here. Read the file first.
- Do not remove elements that are not explicitly listed for removal, even if they look orphaned. Flag them instead.
- The `data-search` attribute must be set inside `renderCatalog()` at card-creation time, not in the filter function.
- `vacdash:v1:filter` must not appear anywhere in the file after your edit.
- `vacdash:v1:search` is the only new localStorage key introduced.
- All 20 Playwright tests must pass. Run them. Do not skip this step.
- End your response with the completed handback report.
</reminder>
