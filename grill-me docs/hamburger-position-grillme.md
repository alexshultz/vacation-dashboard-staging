# Grill-Me: Hamburger Button -- Far Right Positioning
*Generated: 2026-04-27 | Task: Move hamburger button to far right corner of header*

---

## Background

Alex's requirement: hamburger ☰ must always be in the far-right corner of the header.
Currently it sits between the logo and the nav links -- visible next to the logo on narrow screens.

---

## Q1: How do we push the hamburger to the far right?

**Alex's Thoughts:**

**Two approaches:**

- **Reorder HTML + margin-left: auto on hamburger:** Move `hamburger` to after `<nav>` in `buildHeader()`. Add `margin-left: auto` to `.hamburger-btn` in the injected CSS. When nav is hidden (hamburger mode), the hamburger's own `margin-left: auto` pushes it right. When nav is visible (nav-fits mode), hamburger is `display: none` -- irrelevant.

- **CSS-only order (flex `order` property):** Keep HTML order, use `order: 999` on `.hamburger-btn`. No HTML change, pure CSS. Slightly more complex to reason about.

**My answer:** HTML reorder + `margin-left: auto`. Cleaner, more readable, no `order` magic. Two small changes to the injected CSS string and one HTML string reorder in `buildHeader()`.

---

## Q2: Does adding `margin-left: auto` to `.hamburger-btn` conflict with `.site-nav { margin-left: auto }` in components.css?

**Alex's Thoughts:**

In hamburger mode, `.site-nav` is `display: none` -- it consumes no space and its `margin-left: auto` has no effect. The hamburger's `margin-left: auto` takes over and pushes it right. No conflict.

In nav-fits mode, `.hamburger-btn` is `display: none` -- it consumes no space. The `.site-nav`'s `margin-left: auto` still pushes the nav right as before. No conflict.

**My answer:** No conflict. The two `margin-left: auto` rules never compete because only one element is visible at a time.

---

## Q3: Does moving the hamburger to after the nav in the HTML break anything?

**Alex's Thoughts:**

The hamburger is referenced by `id="site-hamburger"` everywhere in JS -- `getElementById` is order-independent. The hamburger panel `#hamburger-panel` is injected separately after the header -- unaffected. The `checkNavFit()` function measures `.site-header__inner` width and logo/btn offsetWidth -- still works with the new order since it queries by class/id, not position. No breakage.

**My answer:** Nothing breaks. DOM position doesn't affect any JS query in site.js.

---

## Implementation Scope

**One file:** `web/js/site.js`

**Exact changes:**
1. `buildHeader()` -- move `hamburger` variable to after the `<nav>` string
2. Injected CSS `.hamburger-btn` block -- add `margin-left: auto;`

**Do NOT touch:** any HTML files, any other CSS files, any other JS logic

---

## Alex's Thoughts

*(Leave blank = full approval.)*

---

*Vacation, 2026-04-27*
