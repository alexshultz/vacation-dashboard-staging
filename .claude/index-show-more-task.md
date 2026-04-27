<task>
You are lazlo, a focused Claude Code CLI agent working on the Branson '26 dashboard. Your job is to add progressive event-list disclosure to web/index.html: show only the first INITIAL_VISIBLE events on load, hide the rest in an overflow container, and reveal them with a "Show all N more ↓" button. This is a JS-only addition — no HTML structure changes, no CSS file changes, no new files.
</task>

<background>
Vault root: /Users/alex/vaults/Vacation/Branson 2026/

Read CLAUDE.md in full before writing any code. If anything in this brief conflicts with CLAUDE.md, flag the conflict explicitly before proceeding.

### Current web/index.html state
- Fetches events from `fetch('schedule.json')` — parses `data.events` array into `eventsData`
- `render()` builds a flat card list via `eventsData.map(...)` and sets `eventsDiv.innerHTML` in one shot
- `toggleAll()` uses `querySelectorAll('details.event-card')` — already traverses hidden divs, requires no changes
- `setupMobileCollapse()` also uses `querySelectorAll` — no changes needed
- Hero subtitle `<p class="hero-sub">` hardcodes: `28 events across May 23–28. Tap any event to see who's in.`
- "Collapse All" button inline style (copy this exactly for the show-more button):
  `display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;color:var(--color-ink)`

### Frozen files — never touch
- `scripts/generate_dashboard.py`
- `scripts/generate_attractions.py`
- `web/css/tokens.css`
- `web/css/themes/trail.css`
- `web/css/components.css`
- `web/data.json`
- `web/attractions.html`
- `web/wishlist.html`
- `web/suggested.html`
- `web/quick-pick.html`
- `web/schedule.json`
- All HTML files not listed as editable below

### Editable files
- `web/index.html` — JS changes only (inside the `<script>` block). Do not modify HTML outside the script block. Do not add or remove CSS.

**Project-wide constraint:** Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
</background>

<grill_me>
Pre-answered design questions (grill-me review is complete — proceed directly to implementation):

Q1: Where in the DOM do the overflow div and show-more button get inserted?
A: Immediately after `#events-list`. Use `eventsDiv.insertAdjacentElement('afterend', overflowDiv)`, then `overflowDiv.insertAdjacentElement('afterend', showMoreWrapper)`. No parent restructuring needed.

Q2: Does `render()` need to defensively clean up previously inserted overflow div and button on re-render?
A: No. `render()` is only called once, after the single `fetch()` in `window.onload`. No cleanup logic needed.

**Q3: The show-more button will have inline `display:inline-flex`. Can we hide it with `btn.hidden = true`?**
A: NO. CLAUDE.md documents this exact pitfall: browser UA `[hidden]{display:none}` is overridden by an author-level `display:inline-flex` inline style. `btn.hidden = true` will not hide the button. Use `btn.style.display = 'none'` in the click handler instead. The `#events-overflow` div is a plain `<div>` with no competing display rule, so `hidden` works correctly there.

Q4: Should `render()` produce a unified HTML string and then split, or map separately?
A: Map the full `eventsData` array to an HTML-strings array first, then slice. This avoids duplicating the card template. `const cards = eventsData.map(event => ...); eventsDiv.innerHTML = cards.slice(0, INITIAL_VISIBLE).join(''); overflowDiv.innerHTML = cards.slice(INITIAL_VISIBLE).join('');`

Q5: Should the `<p class="hero-sub">` HTML be modified to remove the hardcoded "28"?
A: Leave the hardcoded HTML text as-is. JS overwrites it after fetch. If `schedule.json` fails to load, the hardcoded fallback is still shown — more resilient than an empty `<p>`.

Q6: Does `#events-overflow`'s `hidden` attribute work correctly even though child `<details>` elements use `display:flex` on their internals?
A: Yes. The `hidden` attribute on the parent `<div>` causes `display:none` on that div. Child display rules don't affect the parent. No companion CSS rule needed.

Q7: Should the show-more button be wrapped in a div for margin?
A: Yes. Wrap it: `const showMoreWrapper = document.createElement('div'); showMoreWrapper.style.cssText = 'margin-top:12px;'; showMoreWrapper.appendChild(btn);`. Insert `showMoreWrapper` after `overflowDiv`. This avoids contaminating the button's inline style with layout margin.

Q8: What id, if any, should the show-more button have?
A: Assign `id="show-more-btn"` for easy identification in the handback report and future debugging. No other code references it currently.
</grill_me>

<implementation_spec>
Follow these steps in order. Read `web/index.html` in full before writing anything.

### Step 1 — Add INITIAL_VISIBLE declaration
Inside the `<script>` block, add this as the very first statement — before any `const`, `let`, or `function` declarations:

```js
let INITIAL_VISIBLE = 6;
```

Use `let`, not `const`. The caller may reassign it.

### Step 2 — Update render()
Replace the body of `render()` so it:

1. Builds the full cards array (unchanged template, just collect into an array):
   ```js
   const cards = eventsData.map(event => `...existing template...`);
   ```

2. Sets the main container to the first INITIAL_VISIBLE cards:
   ```js
   eventsDiv.innerHTML = cards.slice(0, INITIAL_VISIBLE).join('');
   ```

3. If `eventsData.length > INITIAL_VISIBLE`:
   - Creates `<div id="events-overflow" hidden>` and sets its innerHTML to `cards.slice(INITIAL_VISIBLE).join('')`
   - Inserts it after `eventsDiv`: `eventsDiv.insertAdjacentElement('afterend', overflowDiv)`
   - Creates a show-more button with:
     - `id="show-more-btn"`
     - Text content: `Show all ${eventsData.length - INITIAL_VISIBLE} more ↓`
     - Inline style matching the "Collapse All" button exactly (see Background section)
     - Click handler: `overflowDiv.removeAttribute('hidden'); btn.style.display = 'none';`
       (**not** `btn.hidden = true` — see Grill-Me Q3**)
   - Wraps the button in a div: `<div style="margin-top:12px;">` and inserts that wrapper after `overflowDiv`

4. If `eventsData.length <= INITIAL_VISIBLE`: skip overflow div and show-more button entirely.

Do **not** modify the card template HTML. Do **not** modify `toggleAll()`. Do **not** modify `setupMobileCollapse()`.

### Step 3 — Update hero subtitle
In the `window.onload` fetch callback, after the `render()` call, add:

```js
document.querySelector('.hero-sub').textContent =
  `${eventsData.length} events across May 23–28. Tap any event to see who's in.`;
```

Do **not** change the hardcoded text in the HTML itself — the JS overwrites it at runtime; the HTML text is a fallback.
</implementation_spec>

<quality_gates>
Run all six checks before stopping. Paste the output of each in your handback report.

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"

# 1. INITIAL_VISIBLE declared as `let`
grep -c 'let INITIAL_VISIBLE' web/index.html
# Expected: 1

# 2. Must NOT be `const`
grep -c 'const INITIAL_VISIBLE' web/index.html
# Expected: 0

# 3. events-overflow referenced (id + removeAttribute)
grep -c 'events-overflow' web/index.html
# Expected: >= 2

# 4. hero-sub updated dynamically in JS
grep -c 'hero-sub' web/index.html
# Expected: >= 2 (one in HTML, one in JS querySelector)

# 5. toggleAll and setupMobileCollapse are unmodified (function bodies preserved)
grep -c 'querySelectorAll' web/index.html
# Expected: same count as before implementation (2)

# 6. show-more button does NOT use btn.hidden — uses style.display
grep -c "style\.display\s*=\s*'none'" web/index.html
# Expected: >= 1
```
</quality_gates>

<output_format>
When all code changes are complete, produce a structured handback report with these three sections, then STOP:

**1. Files changed** — every file modified, one line each with a plain-English description.

**2. Architectural choices** — any non-trivial decision. Format each as:
> Choice / Why / Affects

If none beyond what the brief specifies, say so explicitly.

**3. Invariants affected** — any rule in CLAUDE.md, DECISIONS.md, or this brief that was updated, relaxed, or newly discovered.

Do not commit, push, or rsync. PM handles handback.
</output_format>

<reminder>
- Do not invent or assume anything not explicitly present in this brief or in web/index.html as read.
- If this brief conflicts with CLAUDE.md on any point, state the conflict explicitly before proceeding.
- Do not touch any frozen file for any reason whatsoever.
- Do not modify any HTML element outside the `<script>` block.
- Do not add any CSS — not inline on existing elements, not in `<style>` blocks, not in any .css file.
- The `btn.hidden = true` pitfall is real and documented in CLAUDE.md — use `btn.style.display = 'none'` instead.
- Cite the line numbers of web/index.html you are modifying when describing architectural choices.
- If uncertain between two approaches, list both with tradeoffs. Do not silently pick one.
</reminder>
