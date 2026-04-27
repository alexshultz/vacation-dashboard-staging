<task>
You are a front-end implementation agent. Your goal is to rewrite `render()` in `web/index.html` to add day-section grouping with alternating background color bands and a progressive-disclosure "Show All / Show Fewer" toggle. Every detail of the architecture is pre-decided and must be followed exactly. Do not interpret, improvise, or simplify — execute the spec as written.
</task>

<background>
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Only file you may touch:** `web/index.html`

**Current state of web/index.html (post Priority 2):**
- `fetch('schedule.json')` populates `eventsData`, then calls `render()`, then `setupMobileCollapse()`
- `render()` currently builds a flat list: `eventsDiv.innerHTML = cards.slice(0, INITIAL_VISIBLE).join('') + overflow div`
- `let INITIAL_VISIBLE = 6` exists at top of script
- `let showingAll` does NOT exist yet — you add it
- `toggleAll()` and `setupMobileCollapse()` exist and must remain completely unchanged
- The "Collapse All" button (`id="toggle-btn"`) exists in static HTML — do not touch it
- Hero-sub is already updated dynamically after fetch (you will update that line per spec below)
- The old `events-overflow` div and `show-more-btn` exist in `render()` and must be cleanly removed as part of the rewrite

**FROZEN — never touch these files:**
- `scripts/generate_dashboard.py`, `scripts/generate_attractions.py`
- `web/css/tokens.css`, `web/css/themes/trail.css`, `web/css/components.css`
- `web/data.json`, `web/schedule.json`
- `web/attractions.html`, `web/wishlist.html`, `web/suggested.html`, `web/quick-pick.html`
- All HTML files except `web/index.html`
- Any CSS file, any other file not explicitly named above

**CSS variable reference (from trail.css — read-only):**
- `--moss` — Ozarks green palette color
- `--sand` — warm sand palette color
- `--color-bg` — page background
- `--radius-card` — card border-radius token
- `--font-display` — display font family
- `--text-sm` — small text size token
- `--color-ink` — primary ink color
- `--color-surface` — surface background
- `--color-line` — border color
- `--radius-btn` — button border-radius token

**Hidden attribute pitfall (from CLAUDE.md):**
Browser UA `[hidden]{display:none}` is overridden by author `display:flex`. HOWEVER, `.event-card` (`<details>`) has NO author-level display rule — only `.event-card > summary` has `display:flex`. Therefore `card.hidden = true` on the `<details>` element is safe and correct. Do NOT add any CSS companion rule for this.

**Key constraint:** Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
</background>

<rules>
**Rule 0 — Read before writing.** Read `web/index.html` in full before making any changes.

**Rule 1 — Module-level variable.** Add `let showingAll = false;` at the top of the script block, alongside the existing `let INITIAL_VISIBLE = 6;` and before any function definition. Do not move or rename `INITIAL_VISIBLE`.

**Rule 2 — render() rewrite.** Replace the body of `render()` entirely. The new `render()` must:

  a. Get a reference to `#events-list` div.
  b. Clear `eventsDiv.innerHTML = ''`.
  c. Group `eventsData` by `event.date` into an ordered array of `[date, eventsArray]` pairs, preserving insertion order (i.e., the order dates first appear in `eventsData`).
  d. Use this date-label lookup map (hardcoded inline):
     ```js
     const DATE_LABELS = {
       '2026-05-23': 'May 23 — Saturday',
       '2026-05-24': 'May 24 — Sunday',
       '2026-05-25': 'May 25 — Monday',
       '2026-05-26': 'May 26 — Tuesday',
       '2026-05-27': 'May 27 — Wednesday',
       '2026-05-28': 'May 28 — Thursday'
     };
     ```
     If a date is not in the map, fall back to the raw date string.
  e. For each `[date, dayEvents]` pair, create a day-section `<div>` with class `day-section`. Apply these inline styles:
     - Even-indexed days (0, 2, 4…): `background: color-mix(in srgb, var(--moss) 8%, var(--color-bg))`
     - Odd-indexed days (1, 3, 5…): `background: color-mix(in srgb, var(--sand) 10%, var(--color-bg))`
     - All day sections: `border-radius: var(--radius-card); padding: 16px 12px 8px; margin-bottom: 20px`
  f. Inside each day-section div, prepend a `<span>` day label with:
     - Text: `📅 ${DATE_LABELS[date] || date}`
     - Inline style: `font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; opacity: 0.45; display: block; margin-bottom: 10px; padding-left: 2px`
  g. After the label span, append all event cards for that day as `<details class="event-card" open>` elements. Build each card using the same template literal that currently exists in `render()` — do NOT change the card's internal HTML structure.
  h. Append each completed day-section div to `eventsDiv`.
  i. After all day-section divs are appended, call `applyVisibilityState(false)`.
  j. If `eventsData.length > INITIAL_VISIBLE`, create and insert the show-all button (see Rule 4).

**Rule 3 — applyVisibilityState(showAll).** Add a new function `applyVisibilityState(showAll)` in the script block (define it before or after `render()`, not inside it):

  ```
  function applyVisibilityState(showAll) {
    const cards = document.querySelectorAll('details.event-card');
    if (showAll) {
      cards.forEach(card => card.hidden = false);
      document.querySelectorAll('.day-section').forEach(sec => sec.hidden = false);
    } else {
      cards.forEach((card, i) => card.hidden = i >= INITIAL_VISIBLE);
      document.querySelectorAll('.day-section').forEach(sec => {
        const sectionCards = sec.querySelectorAll('.event-card');
        sec.hidden = Array.from(sectionCards).every(c => c.hidden);
      });
    }
  }
  ```
  Implement this exactly as shown. Do not optimize, reorder, or simplify.

**Rule 4 — Show-all button.** After appending day-sections and calling `applyVisibilityState(false)`:
  - Only create the button if `eventsData.length > INITIAL_VISIBLE`
  - Create `<button id="show-all-btn">Show All ↓</button>`
  - Apply the exact same inline style as the existing "Collapse All" button: `display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;color:var(--color-ink);`
  - Attach a click handler:
    ```js
    showAllBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      applyVisibilityState(showingAll);
      showAllBtn.textContent = showingAll ? 'Show Fewer ↑' : 'Show All ↓';
    });
    ```
  - Wrap in `<div style="margin-top:12px;">` and insert it after `eventsDiv` using `eventsDiv.insertAdjacentElement('afterend', wrapper)`.
  - The button is never hidden — only its text changes. Do not apply `hidden` to the button or its wrapper.

**Rule 5 — Hero subtitle.** The fetch callback already updates `.hero-sub`. Verify it reads exactly:
  ```js
  document.querySelector('.hero-sub').textContent =
    `${eventsData.length} events across May 23–28. Tap any event to see who's in.`;
  ```
  If it already says this, leave it alone. If it differs, update it to match exactly.

**Rule 6 — Old architecture removal.** The existing `render()` creates `events-overflow` div and `show-more-btn`. These must not exist anywhere in the rewritten `render()`. Remove them cleanly. After your edit, `grep -c 'events-overflow' web/index.html` must return 0.

**Rule 7 — Do not touch:**
  - `toggleAll()` — not one character
  - `setupMobileCollapse()` — not one character
  - The `fetch('schedule.json')` call and its `.then()` chain structure
  - Any HTML outside the `<script>` block
  - The `attendees` array
  - The `allExpanded` variable and its initialization

**Rule 8 — toggleAll() behavior note.** `toggleAll()` uses `querySelectorAll('details.event-card')` and will set `open` on hidden cards too. When those cards are later revealed via Show All, they will surface with whatever open/closed state `toggleAll()` last set. This is expected and acceptable. Do NOT modify `toggleAll()` to work around it.
</rules>

<quality_gates>
After implementing, run ALL six checks and report the exact numeric output of each:

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"

grep -c 'applyVisibilityState' web/index.html
# Expected: >= 3  (function definition + call in render() + call in button handler)

grep -c 'show-all-btn' web/index.html
# Expected: >= 2  (id assignment + at least one other reference)

grep -c 'color-mix' web/index.html
# Expected: >= 2  (even-day tint + odd-day tint; existing card hover color-mix also counts)

grep -c 'showingAll' web/index.html
# Expected: >= 3  (declaration + toggle + applyVisibilityState call)

grep -c 'events-overflow' web/index.html
# Expected: 0  (old architecture fully removed)

grep -c 'fetch.*schedule.json' web/index.html
# Expected: 1  (fetch call intact, not duplicated)
```

**If any gate fails:** fix the issue before proceeding to the handback section. Do not report a gate failure as acceptable.
</quality_gates>

<grill_me>
After passing all quality gates, write a Grill-Me document to:
`/Users/alex/vaults/Vacation/Branson 2026/grill-me docs/index-day-banding-grillme.md`

The document must answer the following questions in full sentences. Do not skip any question.

1. **Hidden attribute safety:** Why is `card.hidden = true` safe on `<details class="event-card">` but would NOT be safe on an element with an author-level `display:flex` rule? Cite the specific CSS rule in `web/index.html` that makes `<details>` safe.

2. **Day-section visibility logic:** Walk through the exact logic of `applyVisibilityState(false)` when `INITIAL_VISIBLE = 6` and there are 10 events across 3 days (day A: 4 events, day B: 3 events, day C: 3 events). Which day sections are visible? Which are hidden? Show your reasoning.

3. **Button persistence:** The show-all button is created inside `render()`. What prevents it from being duplicated if `render()` were called a second time? (Hint: look at how `eventsDiv.innerHTML = ''` and `insertAdjacentElement` interact with sibling elements.)

4. **toggleAll() interaction:** A user clicks "Collapse All" (which calls `toggleAll()`) while some cards are hidden via `applyVisibilityState(false)`. Then they click "Show All ↓". Describe exactly what state the newly revealed cards will be in (open or closed). Is this a bug? Why or why not?

5. **Color-mix semantics:** Why are the day-section backgrounds defined with `color-mix(in srgb, var(--moss) 8%, var(--color-bg))` rather than a flat hex color? What visual property does this preserve across light and dark mode?

6. **Removed architecture:** What did the old `events-overflow` div do, and why does the new architecture not need it?

7. **Ordering guarantee:** The spec says to group `eventsData` by date "preserving insertion order." In JavaScript, does a plain `{}` object literal preserve insertion order for string keys? What does the ES2015+ spec say? What did you use in your implementation and why?

Format: Use `## Q{n}` headers for each answer. Be direct and specific. If you are uncertain about any answer, say so explicitly — do not guess.
</grill_me>

<handback>
When complete, provide a handback report with the following sections exactly:

**Files modified:**
- List each file path and a one-line description of what changed

**Quality gate results:**
- List each gate with the command, expected value, and actual value observed

**Flags (elements not touched but worth noting):**
- Any element you observed that looked unused or redundant but was left in place per the constraint

**Grill-me doc written to:**
- Confirm the full path

Do not commit, push, or rsync. PM handles handback.
</handback>

<reminder>
- Do not invent or assume anything not explicitly stated in this brief. If a detail is missing, stop and flag it rather than guessing.
- Do not change `toggleAll()`, `setupMobileCollapse()`, the fetch call, or any HTML outside the script block — even if something looks broken or improvable.
- The card template literal (the inner HTML of each `<details>`) must not change structurally. Only the grouping and visibility management change.
- If you are uncertain between two implementation approaches for any step, list both with tradeoffs. Do not silently pick one.
- Cite the specific line or element when making factual claims about the current state of `web/index.html`.
- Every quality gate must return the expected value before you write the handback report.
</reminder>
