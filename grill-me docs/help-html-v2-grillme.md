# Grill-Me: help.html Runtime JSON Renderer

**Task:** `help-html-v2-task.md`
**Date:** 2026-04-26
**Answered by:** Vacation PM (Hermes)

---

## Q1: Should `help.json` live at `web/help.json` or `data/help.json`?

**Answer:** `web/help.json`. It needs to be served by GitHub Pages at runtime -- it must be inside `web/` so the rsync deploy picks it up. `data/` is for source files processed by export scripts; `web/` is for files served directly to the browser. Since there is no build step (ADR-009 explicitly rejected a build-time script), the JSON lives in `web/`.

**Alex's Thoughts:**

---

## **Q2: The brief specifies exact section content verbatim. Should lazlo be allowed to make ANY editorial changes to the copy, or is it strictly copy-paste?**

**Answer:** Strictly copy-paste. The copy was drafted by the PM and reviewed by Alex. Lazlo is a software engineer, not a copywriter. Any rewrite risk -- even "improving" a sentence -- is unacceptable for family-facing content. If lazlo identifies a technical issue with a content string (e.g., a character that breaks JSON), it should flag it in the handback rather than silently rewriting.

**Alex's Thoughts:** If lazlo has suggestions then it might be nice to hear them. Perhaps he notices that the architecture would display better if we chose a certain way to do something and we would never have figured that out ourselves. I don't want to shut him down if he has suggestions but I don't want him to just implement changes that might be better decided in another domain.

---

## **Q3: The renderer uses `var` throughout for iOS Safari compatibility. Should we use `const`/`let` instead since our floor is iOS Safari 16+?**

**Answer:** Either is fine -- iOS Safari 16 fully supports `const`/`let`. The brief says `var` is acceptable but not required. Lazlo can use `const`/`let` for clarity if it prefers. What matters is that no transpilation or build step is introduced. Vanilla JS only.

**Alex's Thoughts:**

---

## Q4: Should the Help link on profile.html use a button-style component or a plain text link?

**Answer:** Check `components.css` for `btn-secondary` first. If it exists, use it -- consistent with the design system. If it doesn't, use a plain `<a>` tag. Do not invent a new class. The brief already specifies this fallback. The entry-point just needs to be visible and tapable -- it does not need to be elaborate.

**Alex's Thoughts:**

---

## **Q5: The `aria-labelledby` attribute uses `"h-" + s.id` (e.g., `h-section-whatisthis`). Is this ID format correct and collision-safe?**

**Answer:** The format is correct. Each section gets `id="section-whatisthis"` on the `<section>` element and `id="h-section-whatisthis"` on the `<h2>`. This matches the pattern already used in the existing hard-coded help.html and in profile.html. No collision risk -- all IDs are unique and scoped to help.html only.

**Alex's Thoughts:**

---

## Q6: Should the fetch path be `'help.json'` or `'./help.json'`?

**Answer:** Either works when `help.html` is served from the `web/` root. `'help.json'` is slightly more portable. The brief specifies `'help.json'` -- lazlo should use that. Verify by checking that `help.html` and `help.json` will both be at the same directory level after rsync (they will -- both in `web/`).

**Alex's Thoughts:**

---

## Q7: The existing `help.html` has hard-coded sections. Should lazlo preserve any of that content or discard it entirely?

**Answer:** Discard it entirely. All content is now authored in `help.json`. The hard-coded sections in the current `help.html` are superseded by the JSON content in the brief. The only things preserved from the existing `help.html` are: the `<head>` block, the theme loader `<script>`, the `<script src="js/site.js">` line, and the `<main class="page-main">` wrapper. Everything inside `<main>` is replaced.

**Alex's Thoughts:**

---

## Q8: Should the renderer handle any Markdown beyond bold, bullets, and paragraph breaks?

**Answer:** No. The three constructs in ADR-009 are the full vocabulary. No headers, no links, no italics, no code blocks. If future content needs richer formatting, ADR-009 is updated first and the renderer is extended then. Lazlo should not speculatively add support for constructs not in the spec.

**Alex's Thoughts:**

---

## Q9: What happens if `help.json` is missing a required field (e.g., a section has no `heading`)?

**Answer:** The renderer should be defensive -- skip a section or render it without the heading rather than throw a JS error and break the page. A missing `body` renders as empty. A missing `heading` renders the section with no `<h2>`. This is a graceful degradation, not a hard failure. Hard failure (error message) is only for a failed fetch or invalid JSON at the top level.

**Alex's Thoughts:**

---

## **Q10: Where exactly on profile.html should the Help link be placed? After the last section but before `</main>`, or somewhere more prominent like the hero area?**

**Answer:** After the last section, before `</main>`. This is the least intrusive placement -- it's a utility link, not a primary action. Profile is already a dense page. Tucking it at the bottom respects the existing hierarchy. If Alex wants it moved somewhere more prominent after seeing it, that's a one-line change to `help.json` -- no, wait, that's a one-line change to `profile.html`. Either way trivial.

**Alex's Thoughts:**

---

## Q11: Does this task require updating the pre-push safety check in CLAUDE.md?

**Answer:** Yes -- add one line. After this task, a new invariant exists: `grep -c 'fetch.*help.json' web/help.html` must return 1. If 0, the renderer is missing and help.html is broken. Lazlo should note this in the handback. The PM will add it to CLAUDE.md after handback review.

**Alex's Thoughts:**
