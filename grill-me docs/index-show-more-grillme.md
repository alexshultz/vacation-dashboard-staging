# Grill-Me Q&A — index.html Show-More Feature
# Date: 2026-04-26

## Task
Add progressive disclosure to web/index.html: first INITIAL_VISIBLE (6) events visible on load, remainder in a hidden overflow div revealed by a "Show all N more ↓" button.

---

## Questions & Answers

**Q1: Where in the DOM do the overflow div and show-more button get inserted?**
A: Immediately after `#events-list`. Use `eventsDiv.insertAdjacentElement('afterend', overflowDiv)`, then `overflowDiv.insertAdjacentElement('afterend', showMoreWrapper)`. No parent restructuring needed.

Alex's Thoughts:

---

Q2: Does `render()` need to defensively clean up previously inserted overflow div and button on re-render?
A: No. `render()` is only called once, after the single `fetch()` in `window.onload`. No cleanup logic needed.

Alex's Thoughts:

---

**Q3: The show-more button will have inline `display:inline-flex`. Can we hide it with `btn.hidden = true`?**
A: NO. CLAUDE.md documents this exact pitfall: browser UA `[hidden]{display:none}` is overridden by an author-level `display:inline-flex` inline style. `btn.hidden = true` will not hide the button. Use `btn.style.display = 'none'` in the click handler instead. The `#events-overflow` div is a plain `<div>` with no competing display rule, so `hidden` works correctly there — `removeAttribute('hidden')` is safe.

Alex's Thoughts:

---

Q4: Should `render()` produce a unified HTML string and then split, or map separately?
A: Map the full `eventsData` array to an HTML-strings array first, then slice. This avoids duplicating the card template. `const cards = eventsData.map(event => ...); eventsDiv.innerHTML = cards.slice(0, INITIAL_VISIBLE).join(''); overflowDiv.innerHTML = cards.slice(INITIAL_VISIBLE).join('');`

Alex's Thoughts:

---

Q5: Should the `<p class="hero-sub">` HTML be modified to remove the hardcoded "28"?
A: Leave the hardcoded HTML text as-is. JS overwrites it after fetch. If `schedule.json` fails to load, the hardcoded fallback "28 events..." is still shown — more resilient than an empty `<p>`. This is consistent with the general project pattern of JS-enhanced HTML.

Alex's Thoughts:

---

Q6: Does `#events-overflow`'s `hidden` attribute work correctly even though child `<details>` elements use `display:flex` on their internals?
A: Yes. The `hidden` attribute on the parent `<div>` causes `display:none` on that div. Child display rules don't affect the parent. No companion CSS rule is needed. The CLAUDE.md pitfall only applies when the *element itself bearing `hidden`* has a competing display rule — plain block divs are safe.

Alex's Thoughts:

---

Q7: Should the show-more button be wrapped in a div for margin spacing?
A: Yes. Wrap it: `const showMoreWrapper = document.createElement('div'); showMoreWrapper.style.cssText = 'margin-top:12px;'; showMoreWrapper.appendChild(btn);`. Inserting margin via a wrapper keeps the button's inline style identical to the "Collapse All" button style. Avoids any CSS mutation.

Alex's Thoughts:

---

Q8: What id, if any, should the show-more button have?
A: Assign `id="show-more-btn"` for easy identification in the handback report and future debugging. No existing code references it. Minimal overhead.

Alex's Thoughts:

---

**Q9: Should `toggleAll()` receive any update to account for the new overflow container?**
A: No. `toggleAll()` uses `querySelectorAll('details.event-card')` which already reaches inside `[hidden]` divs (hidden affects rendering, not DOM traversal). No modification needed.

Alex's Thoughts:

---

Q10: Is `INITIAL_VISIBLE` scoped to the module or global?
A: Global, declared at the top of the `<script>` block with `let`. The brief explicitly states "caller may reassign it" — this implies it needs to be reachable from outside the script block by a future caller. `let` at script top-level on a plain HTML page is effectively global.

Alex's Thoughts:

---

## PROCEED
All questions answered. Lazlo may proceed to full implementation.
