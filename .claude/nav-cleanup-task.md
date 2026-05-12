# nav-cleanup-task · Lazlo Task Brief
<!-- Anthropic 7-Component Framework -->

---

## 1 · ROLE

You are a **surgical code editor**. Your mandate is to make the minimum possible change to achieve each stated fix. You do not refactor, you do not clean up, you do not improve. You cut exactly where told, you stitch exactly where told, and you stop.

---

## 2 · CONTEXT

**Project:** Branson 2026 Vacation Dashboard  
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`  
**Files in scope:**

| File | Relative path |
|------|--------------|
| Shared site bootstrap | `web/js/site.js` |
| Admin overlay module | `web/js/admin-overlay.js` |

Two UI bugs exist in the shared JS layer:

- `site.js` unconditionally injects a `<nav class="bottom-tabs">` element on every page load. This nav is no longer wanted anywhere in the app.
- `admin-overlay.js` appends the `#vacdash-signout-btn` Sign Out button **after** the hamburger menu button in the site header. This shifts the hamburger left whenever an admin session is active, causing inconsistent header layout. The hamburger must always be the rightmost header element.

No other behaviour in either file is broken or in scope.

---

## 3 · TASK

Perform **exactly two surgical fixes**, one per file, in the order listed.

### Fix 1 — Remove bottom-tabs nav injection (`site.js`)

1. Open `web/js/site.js`.
2. Locate every line (or block) that creates, configures, or inserts an element whose class includes `bottom-tabs` — typically a pattern such as:
   ```js
   const nav = document.createElement('nav');
   nav.className = 'bottom-tabs';
   // ... any attribute/child setup ...
   document.body.appendChild(nav);   // or insertBefore / insertAdjacentElement
   ```
3. **Delete that entire injection block** — every statement that is exclusively concerned with building and inserting the `bottom-tabs` nav. Do not delete anything else.
4. If the injection is wrapped inside an event listener or function that also performs **other** work, delete only the bottom-tabs lines within it; leave the listener/function wrapper and all other statements untouched.
5. Save the file.

**Expected outcome:** No `<nav class="bottom-tabs">` element will appear in the DOM on any page.

---

### Fix 2 — Reorder Sign Out / hamburger (`admin-overlay.js`)

1. Open `web/js/admin-overlay.js`.
2. Locate the code that appends `#vacdash-signout-btn` to the site header. It will resemble one of these patterns:
   ```js
   // Pattern A — append (wrong: places sign-out after hamburger)
   header.appendChild(signOutBtn);

   // Pattern B — insertAdjacentElement / insertBefore referencing something
   header.insertAdjacentElement('beforeend', signOutBtn);
   ```
3. Find the reference to the **hamburger button** in that same vicinity (it will be a variable or a `querySelector` targeting the hamburger; look for class names such as `hamburger`, `menu-toggle`, `nav-toggle`, or an `aria-label` like `"Open menu"`).
4. Change the insertion so the Sign Out button is placed **immediately before** the hamburger, using `insertBefore`:
   ```js
   // After fix — hamburger stays rightmost
   header.insertBefore(signOutBtn, hamburgerBtn);
   ```
   Adjust variable names to match what already exists in the file. Do not introduce new variables unless strictly required to obtain a reference to the hamburger element.
5. Save the file.

**Expected outcome:** Header element order when admin session is active: `[...existing items] · [Sign Out] · [Hamburger]`.

---

## 4 · FORMAT — HANDBACK REPORT

When both fixes are applied and verified, output a handback report in **exactly** this structure and then stop:

```
## Handback Report — nav-cleanup-task

### Files modified
- web/js/site.js — [one-sentence description of what was removed]
- web/js/admin-overlay.js — [one-sentence description of what was changed]

### git diff --name-only HEAD
[paste actual output here]

### Playwright result
[paste summary line(s) from test run here]

### Assumptions
[bullet list, or "None" if none were made]

### Flags for human review
[any elements that looked unused/redundant but were NOT touched, per constraint; or "None"]

---
STOP. Do not commit, push, copy, or update any logs.
```

---

## 5 · EXAMPLES

### Example A — site.js before & after

**Before (illustrative; actual code may differ):**
```js
// site.js — bottom-tabs injection block
document.addEventListener('DOMContentLoaded', () => {
  initTheme();          // ← unrelated; do not touch

  const nav = document.createElement('nav');
  nav.className = 'bottom-tabs';
  nav.innerHTML = `<a href="/">Home</a><a href="/plan">Plan</a>`;
  document.body.appendChild(nav);  // ← DELETE this block

  initScrollBehavior(); // ← unrelated; do not touch
});
```

**After:**
```js
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  initScrollBehavior();
});
```

### Example B — admin-overlay.js before & after

**Before:**
```js
header.appendChild(signOutBtn);  // sign-out lands after hamburger
```

**After:**
```js
const hamburgerBtn = header.querySelector('.hamburger'); // obtain reference if not already present
header.insertBefore(signOutBtn, hamburgerBtn);
```

> ⚠ These snippets are illustrative. Match actual variable names and selectors already in the file; do not copy-paste the examples verbatim.

---

## 6 · CONSTRAINTS  *(non-negotiable — read before touching any code)*

| # | Constraint |
|---|-----------|
| C1 | Edit **only** `web/js/site.js` and `web/js/admin-overlay.js`. No other file may be created, modified, or deleted. |
| C2 | In `site.js`, touch **only** the bottom-tabs injection block. Every other statement, function, listener, and comment must remain byte-for-byte identical. |
| C3 | In `admin-overlay.js`, touch **only** the insertion point of `#vacdash-signout-btn`. Every other statement, function, listener, and comment must remain byte-for-byte identical. |
| C4 | If you encounter an element, variable, or block that looks unused or redundant, **flag it in the handback report** and leave it completely alone. |
| C5 | The design system is locked. Do not introduce any new CSS class names, CSS custom properties, or color tokens — not even in a comment. |
| C6 | Do not modify any Playwright test file. (Confirmed: no existing spec references `bottom-tabs`.) |
| C7 | After completing both fixes, run `git diff --name-only HEAD` from the vault root and confirm the output lists exactly and only these two files. If any other file appears, stop and follow the question protocol before proceeding. |
| C8 | Do **not** commit, push, copy files, or update any logs or changelogs. |

---

## 7 · VERIFICATION STEPS

Run these in order after making your edits:

```bash
# Step 1 — confirm file scope
cd "/Users/alex/vaults/Vacation/Branson 2026"
git diff --name-only HEAD
# Expected output (exactly):
# web/js/admin-overlay.js
# web/js/site.js

# Step 2 — run Playwright suite
cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e"
npx playwright test
# Expected: all pre-existing passing tests still pass; no new failures
```

A successful run is: **two files in git diff, zero new Playwright failures**.

---

## QUESTION PROTOCOL

If any design decision arises that is not covered by this brief:

1. **Do not guess.** Do not make a judgment call. Do not proceed.
2. Run:
   ```bash
   export PATH='/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/alex/.local/bin' \
   && hermes --profile vacation-coordinator "LAZLO QUESTION: [your specific question here]"
   ```
3. Append the question (with timestamp) to `.claude/nav-cleanup-questions.md`.
4. **Stop and wait** for a human response before continuing.

---

*Brief written for Lazlo (Claude Code CLI) · Branson 2026 nav-cleanup sprint · May 2026*
