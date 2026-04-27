# Grill-Me: index.html Day-Section Banding

## Q1

`card.hidden = true` is safe on `<details class="event-card">` because the browser UA rule `[hidden]{display:none}` is the only rule controlling the `<details>` element's display value. No author-level CSS in this file or in `components.css` sets `display` on `details.event-card` directly. The only author-level display rule touching `.event-card` is on its child: `.event-card > summary { display: flex; … }` (line 37–44 of `web/index.html`). That rule applies to `<summary>`, not to the `<details>` itself, so the UA `[hidden]{display:none}` wins without conflict when `card.hidden = true` is set. If instead you set `hidden` on an element that had an author-level `display:flex` rule, the author stylesheet would win over the UA stylesheet (author > UA specificity), `display:none` would be overridden, and the element would remain visible despite `hidden = true`. The CLAUDE.md pitfall note documents this exact hazard and explicitly confirms that `<details>` has no such conflicting author rule.

## Q2

With `INITIAL_VISIBLE = 6` and 10 events (day A: events 0–3, day B: events 4–6, day C: events 7–9):

`applyVisibilityState(false)` first processes all cards globally by index:
- Cards 0–5 (events 0–5): `hidden = false` (i < 6)
- Cards 6–9 (events 6–9): `hidden = true` (i >= 6)

Then it processes each day-section by checking whether all of its cards are hidden:
- **Day A** (cards 0–3): all four `hidden = false` → `Array.from(sectionCards).every(c => c.hidden)` is `false` → `sec.hidden = false` → **visible**
- **Day B** (cards 4–6): cards 4 and 5 are `hidden = false`, card 6 is `hidden = true` → `.every()` is `false` → `sec.hidden = false` → **visible**
- **Day C** (cards 7–9): all three are `hidden = true` → `.every()` is `true` → `sec.hidden = true` → **hidden**

Result: Day A and Day B sections are visible; Day C section is hidden. The first 6 events are shown, spanning parts of days A and B.

## Q3

Nothing in the current implementation prevents duplication if `render()` were called a second time. `eventsDiv.innerHTML = ''` clears only the *children* of `#events-list`. The show-all button wrapper is inserted via `eventsDiv.insertAdjacentElement('afterend', wrapper)`, making it a *sibling* of `eventsDiv`, not a child. A second `render()` call would leave the old wrapper in place and insert a new one immediately after `eventsDiv`, resulting in two buttons.

The implementation guards against this with the cleanup at the top of `render()`:
```js
const existingBtn = document.getElementById('show-all-btn');
if (existingBtn) existingBtn.parentNode.remove();
```
This locates the button by its id, then removes its parent wrapper div. When `render()` is called a second time, the old wrapper is removed before the new one is inserted. The `eventsDiv.innerHTML = ''` alone is insufficient for this because `innerHTML` and `insertAdjacentElement('afterend', …)` operate on different parts of the DOM: one on children, one on siblings.

## Q4

When a user clicks "Collapse All" while some cards are hidden (the first 6 shown, the rest hidden), `toggleAll()` runs `document.querySelectorAll('details.event-card').forEach(details => { details.open = allExpanded; })`. Because `querySelectorAll` returns all `details.event-card` elements including the hidden ones, it sets `open = false` (since `allExpanded` becomes `false`) on every card — visible and hidden alike.

When the user then clicks "Show All ↓", `applyVisibilityState(true)` sets `card.hidden = false` on all cards, revealing the previously hidden ones. Those newly revealed cards will be in the **closed** state — they have `open = false` because `toggleAll()` set it earlier.

This is **not a bug** — it is explicitly documented as expected and acceptable in Rule 8 of the task spec. The `toggleAll()` function owns the `open`/`closed` state of all cards, including hidden ones. When those cards are revealed, they surface with whatever state `toggleAll()` last applied. The user can then use "Expand All" to open them if desired. The alternative — making `toggleAll()` skip hidden cards — would create a different inconsistency where the "Collapse All / Expand All" toggle no longer reflects the true state of all cards.

## Q5

The `color-mix(in srgb, var(--moss) 8%, var(--color-bg))` syntax blends 8% of the palette color into the current page background rather than using a fixed hex color. This preserves **background adaptability across light and dark mode**: in light mode `--color-bg` is a near-white surface, so the tint is a pale green wash; in dark mode `--color-bg` is a dark surface, so the same formula produces a dark green-tinged band. A flat hex color (e.g. `#e8f0e4`) would be visually correct only in one mode and would clash in the other. By anchoring the blend to `var(--color-bg)`, the day-section bands automatically remain readable and thematically consistent regardless of which mode is active.

## Q6

The old `events-overflow` div was a container for all event cards beyond index `INITIAL_VISIBLE`. It was created with `hidden = true`, filled with the overflow card HTML via `innerHTML`, inserted after `eventsDiv`, and revealed by the "Show more" button by calling `removeAttribute('hidden')` — at which point the button hid itself. It was a one-way disclosure: once shown, there was no way to collapse back to 6.

The new architecture does not need `events-overflow` because visibility is managed directly on individual `<details>` elements and their containing `day-section` divs via `applyVisibilityState()`. All cards are rendered into the DOM from the start; the function selects them with `querySelectorAll('details.event-card')` and sets `hidden` on each by index. The show-all button is bidirectional (Show All / Show Fewer) and the `showingAll` flag tracks state so `applyVisibilityState` can re-apply either direction. There is no separate container to toggle — the cards live in their day-sections and are shown or hidden in place.

## Q7

In JavaScript, a plain `{}` object literal **does** preserve insertion order for string keys in ES2015+ — but with one important caveat: integer-like keys (e.g. `"0"`, `"1"`) are sorted numerically first before string keys appear in insertion order. Date strings like `"2026-05-23"` are not integer-like (they contain non-numeric characters), so they would be iterated in insertion order. However, the spec says to use "insertion order" explicitly, and relying on this object property ordering behavior is fragile and technically not the guaranteed intent.

The implementation uses a `Map` instead of a plain object:
```js
const dateMap = new Map();
```
`Map` is specified by ES2015 to iterate entries in strict insertion order for all key types, with no special handling for integer-like keys. This is a stronger guarantee than `{}` for this use case. The `groups` array of `[date, events]` pairs is built in parallel to make the ordered structure explicit and iterable without relying on any object key ordering behavior.
