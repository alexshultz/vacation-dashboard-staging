# Hamburger Menu — Grill-Me Q&A

**Task:** Add mobile hamburger nav to `web/js/site.js`

---

**Q: Why not add the hamburger CSS to components.css?**
A: components.css is frozen. All style for this feature is injected by site.js itself, guarded by `id="site-hamburger-styles"` to prevent duplication.

**Q: Why does the hamburger panel use all 7 NAV_LINKS instead of just the 3 removed tabs?**
A: The panel serves as the complete mobile nav. All 7 nav destinations should be reachable from mobile, not just the 3 that were trimmed.

**Q: Why is `buildHamburgerPanel()` a separate function?**
A: Consistent with the pattern of `buildHeader()` and `buildTabs()`. Keeps the injection call site clean and the builder testable in isolation.

**Q: What happens on desktop (≥720px)?**
A: The hamburger button is hidden via `display:none` (only shown at ≤719px). The panel has `display:none !important` at ≥720px, so it can never appear on desktop even if JS toggled it.

**Q: Why is the style injected via `document.head.appendChild` instead of `currentScript.insertAdjacentHTML`?**
A: `document.currentScript` is captured synchronously at the top of the IIFE, but appending to `<head>` is the semantically correct place for styles and avoids any parsing-order edge cases.

**Q: Is the injection idempotent?**
A: Yes. The header injection is guarded by `!document.querySelector('.site-header')`. The style injection is guarded by `!document.getElementById('site-hamburger-styles')`. Both prevent double-injection if site.js were somehow evaluated twice.

**Q: Were any HTML files touched?**
A: No. Zero HTML files were modified. All changes are confined to `web/js/site.js`.
