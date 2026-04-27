# Grill-Me: Responsive Nav (hamburger vs full nav links)
*Generated: 2026-04-27 | Task: Make site nav switch dynamically between full links and hamburger based on available space*

---

## Background

Current bug: on iPad, both `.hamburger-btn` and `.site-nav` (full nav links) are simultaneously visible, and the hamburger does nothing when tapped because `@media (min-width: 720px) { #hamburger-panel { display: none !important } }` overrides the JS click handler.

Alex's request: if there is room for all 8 nav items, show them; otherwise hide them and show only the hamburger.

> ```note! 
> ```

---

## Q1: CSS breakpoint or JS overflow detection?

**Alex's Thoughts:**

Two options:

- **Fixed CSS breakpoint:** At some px threshold, swap hamburger↔nav-links via media query. Simple, zero JS, instant. The downside: arbitrary px value that may not perfectly match "items fit."

- **JS ResizeObserver overflow detection:** Measure actual nav overflow on every resize. Toggles a class when items don't fit. Perfectly accurate but adds ~20 lines of JS.

**My answer:** Fixed CSS breakpoint. This is a vacation dashboard, not a design system. A well-chosen breakpoint (around 900px) will work fine for 8 items. The ResizeObserver approach adds complexity that isn't justified here. The breakpoint just needs to be wide enough that all 8 items have breathing room -- 900px is the target.

---

**Q2: What breakpoint value?**

**Alex's Thoughts:**

8 items: Home, Activities, Quick Pick, Wishlist, Suggested, Timeline, People, Help. At the current font/padding, each link is roughly 80-110px wide. 8 × ~95px = ~760px of nav links plus ~160px of logo/padding = ~920px total header space needed.

**My answer:** Use `min-width: 960px` as the breakpoint where full nav is shown. Below that, hamburger only. This gives comfortable breathing room on 1024px iPad landscape and typical laptop screens, while phone and portrait iPad stay on hamburger mode.

---

**Q3: What exactly changes at each breakpoint?**

**Alex's Thoughts:**

**Below 960px (hamburger mode):**
- `.hamburger-btn` -- `display: flex` (visible)
- `.site-nav` -- `display: none` (hidden)
- `#hamburger-panel` -- can open/close via JS click handler (no CSS override blocking it)
- `.bottom-tabs` -- visible (3 tabs for quick mobile nav)

**At 960px and above (full nav mode):**
- `.hamburger-btn` -- `display: none` (hidden)
- `.site-nav` -- `display: flex` (visible)
- `#hamburger-panel` -- `display: none !important` (can't open -- hamburger is hidden anyway)
- `.bottom-tabs` -- `display: none` (no need for bottom tabs on wide screens)

**My answer:** Agreed on all of the above. The bottom-tabs hide on wide screens -- they're redundant when the full nav is visible.

---

**Q4: How do we handle profile badge sync?**

**Alex's Thoughts:**

`#profile-btn` and `#site-theme-toggle` live inside `#hamburger-panel`. `syncBadge()` calls `getElementById('profile-btn')`. When the panel is in the DOM but hidden via CSS `display: none`, `getElementById` still finds the element -- badge sync continues to work regardless of visibility. No change needed.

**My answer:** Confirmed -- no change needed to syncBadge or badge logic. Elements remain in DOM at all widths.

---

**Q5: Does the existing 720px `#hamburger-panel { display: none !important }` rule need to change?**

**Alex's Thoughts:**

Yes -- it needs to be replaced entirely. The current rule fires at 720px and forces the panel permanently closed on wide screens, which is why the hamburger button appears broken on iPad. The new rule should fire at 960px (matching Q2), and should also hide the hamburger button itself at that breakpoint (not just the panel).

**My answer:** Remove `@media (min-width: 720px) { #hamburger-panel { display: none !important } }` and replace with:

```css
@media (min-width: 960px) {
  .hamburger-btn       { display: none; }
  #hamburger-panel     { display: none !important; }
  .site-nav            { display: flex; gap: 4px; }
  .bottom-tabs         { display: none; }
}
```

And the default (mobile-first) rules (outside the media query):

```css
.hamburger-btn  { display: flex; }  /* already exists */
.site-nav       { display: none; }  /* ADD THIS -- currently missing */
.bottom-tabs    { display: flex; }  /* already correct */
```

The missing `.site-nav { display: none; }` default is the root cause of the bug.

---

**Q6: Does `.site-nav` have its own display rule in components.css that might conflict?**

**Alex's Thoughts:**

Need to check. If components.css sets `.site-nav { display: flex }` unconditionally, adding `display: none` in the injected site-hamburger-styles block may be overridden by specificity. The injected `<style>` tag goes in `<head>` after the `<link>` stylesheet loads -- so it should win on equal specificity. But worth confirming.

**My answer:** Check `components.css` for `.site-nav` rules before implementing. If a conflict exists, use `.site-nav:not(.force-show) { display: none }` or increase specificity with `.site-header .site-nav { display: none }`. Lazlo must check this and document what it found in the handback report.

---

**Q7: Should the hamburger panel style change at all for wide screens?**

**Alex's Thoughts:**

No. The panel is `position: fixed`, drops below the header, full-width. That behavior is fine for the narrow screens where it will appear. On wide screens it's hidden entirely. No style change needed for the panel itself.

**My answer:** No changes to `#hamburger-panel` styles other than the breakpoint rule in Q5.

---

**Q8: Any concern about the `[hidden] + display:flex` pitfall from CLAUDE.md?**

**Alex's Thoughts:**

CLAUDE.md warns: Browser UA `[hidden]{display:none}` is overridden by `display:flex`. The site-nav is toggled via CSS class/media query, not via the `hidden` attribute -- so this pitfall does not apply here. No `.hidden = true` JS is used on the nav.

**My answer:** Not applicable. Confirmed no change needed.

---

## Implementation Scope

**One file:** `web/js/site.js` (all CSS is injected by site.js -- no separate CSS file touched)

**Exact changes:**
1. In the injected `site-hamburger-styles` block: add `.site-nav { display: none; }` as a default rule
2. Replace `@media (min-width: 720px) { #hamburger-panel { display: none !important; } }` with the full 960px breakpoint block from Q5
3. Check for `.site-nav` conflicts in components.css and resolve if needed (document in handback)
4. No changes to JS logic -- only the injected CSS block changes

**Do NOT touch:** any HTML files, any other CSS files, any JS logic outside the injected CSS string

---

## Alex's Thoughts

*(Leave blank = full approval. Write anything to flag for discussion.)*

---

*Vacation, 2026-04-27*
