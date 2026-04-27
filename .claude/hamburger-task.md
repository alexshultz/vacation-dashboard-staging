<task>
You are a senior JavaScript engineer working on the Branson 2026 vacation dashboard. Your sole job is to implement a mobile hamburger menu by editing exactly ONE file: `web/js/site.js`. You will also write a short grill-me doc.

Do not touch any HTML files, any CSS files, or any Python scripts. No exceptions.
</task>

<background>
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`

**Architecture summary:**
- `web/js/site.js` is a 148-line synchronous IIFE loaded as the very first child of `<body>` on all 10 pages.
- It injects the `<header class="site-header">` and `<nav class="bottom-tabs">` during body parsing via `document.currentScript` + `insertAdjacentHTML('afterend', ...)`.
- The injection is guarded: `if (cs && !document.querySelector('.site-header'))` — idempotent.
- After injection, it wires up dark mode toggle, profile badge sync, and cross-tab storage sync. These sections must not be altered.

**Current `site.js` data structures (source of truth — verify by reading the file):**
- `NAV_LINKS`: 7 items — Home, Activities, Wishlist, Suggested, Timeline, People, Help
- `BOTTOM_TABS`: 6 items — Home, Activities, Wishlist, Suggested, Timeline, People
- `NAV_ALIASES`: `{ 'quick-pick.html': 'attractions.html', 'shows.html': 'attractions.html' }`
- `buildHeader()`: returns a header HTML string
- `buildTabs()`: returns the bottom-tabs nav HTML string

**FROZEN — never touch:**
- `web/css/tokens.css`, `web/css/themes/trail.css`, `web/css/components.css`
- All HTML files (all 10 pages): `index.html`, `attractions.html`, `shows.html`, `quick-pick.html`, `wishlist.html`, `suggested.html`, `profile.html`, `event-timeline.html`, `people-timeline.html`, `help.html`
- `scripts/generate_dashboard.py`, `scripts/generate_attractions.py`
- `web/data.json`, `web/schedule.json`
</background>

<constraints>
1. **One file only.** The only file you may modify is `web/js/site.js`.
2. **Do not modify any HTML element not explicitly named in this task.** If you encounter an element that looks unused or redundant during your analysis, flag it in the handback report. Do not remove it.
3. **Idempotence.** The `<style>` block injection must be guarded: check `if (!document.getElementById('site-hamburger-styles'))` before inserting. Inject via `document.head.appendChild(styleEl)` or `document.head.insertAdjacentHTML(...)` — NOT via `currentScript.insertAdjacentHTML` (currentScript is valid only during synchronous body parsing, so the style must be injected during that same synchronous window, alongside the header).
4. **`cs` scope.** `document.currentScript` is captured as `var cs` at the top of the injection block. All synchronous DOM injections (header, tabs, hamburger panel, style block) must happen within that same synchronous flow while `cs` is still a valid reference.
5. **Do not commit, push, or rsync.** PM handles handback.
</constraints>

<task_steps>
Implement the following changes to `web/js/site.js` in this exact order:

---

### Step 1 — Trim BOTTOM_TABS from 6 entries to 3

Keep only these three entries (in this order):
```js
{ href: 'index.html',       label: 'Home',       emoji: '🏠' },
{ href: 'attractions.html', label: 'Activities',  emoji: '🎡' },
{ href: 'wishlist.html',    label: 'Wishlist',    emoji: '♡'  },
```
Remove the Suggested, Timeline, and People entries entirely. They migrate to the hamburger dropdown.

---

### Step 2 — Add hamburger button to `buildHeader()`

Insert the following element into the header HTML string, placed **between** the `site-logo` anchor and the `site-nav` div:

```html
<button class="hamburger-btn" id="site-hamburger" aria-label="Menu" aria-expanded="false">&#9776;</button>
```

The resulting header inner structure must be, in order:
`site-logo` → `hamburger-btn` → `site-nav` → `theme-toggle` → `profile-btn`

---

### Step 3 — Inject hamburger panel

Immediately after (or as part of) the existing chrome injection (`cs.insertAdjacentHTML('afterend', buildHeader() + buildTabs())`), also inject the hamburger dropdown panel. Either extend the same string or make a second call on `cs` — both are valid since `cs` is still live.

The panel HTML must be:
```html
<div id="hamburger-panel" role="navigation" aria-label="Menu" style="display:none">
  <!-- one <a> per NAV_LINKS entry, generated dynamically -->
  <a href="index.html"           class="hamburger-link" aria-current="page">Home</a>
  <a href="attractions.html"     class="hamburger-link">Activities</a>
  <a href="wishlist.html"        class="hamburger-link">Wishlist</a>
  <a href="suggested.html"       class="hamburger-link">Suggested</a>
  <a href="event-timeline.html"  class="hamburger-link">Timeline</a>
  <a href="people-timeline.html" class="hamburger-link">People</a>
  <a href="help.html"            class="hamburger-link">Help</a>
</div>
```

Rules:
- Generate the `<a>` tags dynamically from `NAV_LINKS` (same pattern as `buildHeader()` uses for desktop nav links).
- Apply `aria-current="page"` on whichever entry matches `activeHref`.
- Initial state: `style="display:none"` on the panel div.

Write a `buildHamburgerPanel()` function that returns this HTML string, then call it as part of injection.

---

### Step 4 — Inject `<style>` block (guarded, synchronous)

During the same synchronous injection pass (while `cs` is valid and `document.head` is accessible), inject the following style block. Guard it with `if (!document.getElementById('site-hamburger-styles'))` to ensure idempotence.

The style element must have `id="site-hamburger-styles"`. Inject it via:
```js
var styleEl = document.createElement('style');
styleEl.id = 'site-hamburger-styles';
styleEl.textContent = '/* css content */';
document.head.appendChild(styleEl);
```

CSS content (copy exactly — do not alter property values, selectors, or units):
```css
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--color-ink);
  padding: 6px 10px;
  border-radius: var(--radius-btn);
  line-height: 1;
}
@media (max-width: 719px) {
  .hamburger-btn { display: flex; align-items: center; }
}
#hamburger-panel {
  position: fixed;
  top: var(--header-h, 56px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-bottom: 1.5px solid var(--color-line);
  z-index: 999;
  padding: 8px 0;
  box-shadow: var(--shadow-2, 0 4px 16px rgba(0,0,0,.15));
}
.hamburger-link {
  display: block;
  padding: 14px 24px;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  text-decoration: none;
}
.hamburger-link:hover,
.hamburger-link:focus { background: var(--color-bg); }
.hamburger-link[aria-current="page"] { color: var(--accent-moss, var(--moss)); }
@media (min-width: 720px) {
  #hamburger-panel { display: none !important; }
}
```

---

### Step 5 — Wire up hamburger toggle behavior

After the synchronous DOM injection block, add event listeners for the hamburger UI. These must come after injection (so the elements exist) but still within the IIFE. Wire up three behaviors:

**A. Button click — toggle panel:**
```js
var hamburgerBtn   = document.getElementById('site-hamburger');
var hamburgerPanel = document.getElementById('hamburger-panel');
if (hamburgerBtn && hamburgerPanel) {
  hamburgerBtn.addEventListener('click', function () {
    var isOpen = hamburgerPanel.style.display !== 'none';
    hamburgerPanel.style.display = isOpen ? 'none' : 'block';
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
  // B. Outside click — close panel
  document.addEventListener('click', function (e) {
    if (hamburgerPanel.style.display === 'none') return;
    if (hamburgerPanel.contains(e.target) || hamburgerBtn.contains(e.target)) return;
    hamburgerPanel.style.display = 'none';
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
  // C. Escape key — close panel
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && hamburgerPanel.style.display !== 'none') {
      hamburgerPanel.style.display = 'none';
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
```

Use this exact logic. Do not restructure into separate listener registrations — keep the outside-click and keydown listeners nested inside the `if (hamburgerBtn && hamburgerPanel)` guard.

---

### Step 6 — Write grill-me doc

Create the file `grill-me docs/hamburger-grillme.md` at the vault root with the following content and pre-answered questions:

```markdown
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
```
</task_steps>

<quality_gates>
Before finishing, verify all six gates pass. Run each command from the vault root:

```bash
# 1. hamburger-btn appears >= 3 times (CSS rule, HTML in buildHeader, JS getElementById)
grep -c 'hamburger-btn' web/js/site.js
# Expected: >= 3

# 2. hamburger-panel appears >= 3 times (HTML, JS getElementById, CSS rule)
grep -c 'hamburger-panel' web/js/site.js
# Expected: >= 3

# 3. BOTTOM_TABS has exactly 3 href values
grep -c "href:" web/js/site.js | head  # rough check — confirm manually that BOTTOM_TABS has 3 entries

# 4. aria-expanded appears >= 2 times (initial HTML attribute + JS setAttribute calls)
grep -c 'aria-expanded' web/js/site.js
# Expected: >= 2

# 5. site-hamburger-styles appears >= 2 times (id assignment + guard check)
grep -c 'site-hamburger-styles' web/js/site.js
# Expected: >= 2

# 6. No HTML files were modified
git diff --name-only
# Expected: only web/js/site.js (and grill-me docs/hamburger-grillme.md if tracked)
```

If any gate fails, fix `web/js/site.js` and re-run before proceeding to the handback report.
</quality_gates>

<output_format>
When all six quality gates pass, output a handback report in this exact structure:

```
## Handback Report — Hamburger Menu

**Files modified:**
- `web/js/site.js` — [one-line description of changes]

**Files created:**
- `grill-me docs/hamburger-grillme.md` — pre-answered grill-me Q&A

**Quality gates:** [PASS / FAIL for each of the 6 gates, with actual grep counts]

**Flags (elements encountered but not touched):**
- [List any elements that looked unused or redundant; "None" if nothing to flag]

**Notes:**
- [Any deviations from spec, edge cases encountered, or decisions made]
```

Do not commit, push, or rsync. PM handles handback.
</output_format>

<reminder>
- Do not invent or assume anything not explicitly stated above. Read `web/js/site.js` in full before writing a single line.
- Cite the exact line numbers or function names when describing what you changed.
- If you are uncertain whether a change is required or would break an existing behavior, say so explicitly and describe both options with tradeoffs. Do not silently pick one.
- The CSS must be copied exactly — do not normalize whitespace, rename variables, or merge selectors.
- If `document.head` is null at injection time (which would be unusual given synchronous loading), fall back to `document.documentElement.insertAdjacentHTML('afterbegin', ...)` and flag this in the handback report.
- Do not run `generate_dashboard.py` or `generate_attractions.py` under any circumstances.
</reminder>
