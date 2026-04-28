# Grill-Me: Hamburger Panel -- Right-Anchored, Content-Width
*Generated: 2026-04-27 | Task: Make hamburger panel only as wide as needed, anchored to right*

---

## Background

Currently `#hamburger-panel` has `left: 0; right: 0` -- spans full viewport width.
Alex wants the panel to be only as wide as its content, still anchored to the right edge
where the hamburger button is. User shouldn't have to travel to the left side of the screen
to tap menu items that opened from the upper-right corner.

---

## Q1: What CSS changes achieve right-anchored content-width panel?

**Alex's Thoughts:**

Remove `left: 0`. Keep `right: 0`. Add `width: max-content` -- the panel sizes itself
to its widest item. Add `max-width: calc(100vw - 16px)` as a safety guard so it can't
overflow on very narrow phones. That's it.

The `.hamburger-link` items use `display: flex` with `.nav-icon` (fixed 2em) and
`.nav-label` (flex: 1). With `width: max-content`, the panel width is determined by
the longest label. "Quick Pick", "Activities", "Suggested", "Timeline" are the longer
ones -- all fit comfortably.

**My answer:** The three-property change is correct:
- Remove: `left: 0;`
- Keep: `right: 0;`
- Add: `width: max-content; max-width: calc(100vw - 16px);`

---

## Q2: Does removing `border-bottom` make sense now that the panel isn't full-width?

**Alex's Thoughts:**

`border-bottom` on a partial-width panel looks odd -- it only underlines the panel width,
not the full header. Should switch to a proper `border` on all sides (or at least left +
bottom) so it looks like a contained dropdown card, not a partial underline.

**My answer:** Replace `border-bottom: 1.5px solid var(--color-line)` with
`border: 1.5px solid var(--color-line)` -- a full border on all sides makes it read as
a card/dropdown rather than a floating underline. Also add `border-radius: var(--radius-btn)
0 0 var(--radius-btn)` or just `border-radius: 0 0 0 var(--radius-btn)` on the bottom-left
corner only (top-right is at the screen edge). Keep it simple: just `border-radius: var(--radius-card, 8px)` with no top-right radius since it touches the header there.

---

## Implementation Scope

**One file:** `web/js/site.js` (injected CSS block only)

**Exact changes to `#hamburger-panel` rule:**
- Remove `left: 0;`
- Add `width: max-content;`
- Add `max-width: calc(100vw - 16px);`
- Replace `border-bottom: 1.5px solid var(--color-line);` with `border: 1.5px solid var(--color-line);`
- Add `border-radius: 0 0 0 var(--radius-btn);` (rounds bottom-left corner only)

**Do NOT touch:** any JS logic, any HTML builders, any other CSS rules

---

## Alex's Thoughts

*(Leave blank = full approval.)*

---

*Vacation, 2026-04-27*
