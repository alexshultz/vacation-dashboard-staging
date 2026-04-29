# Task: Add Dynamic Admin Menu Visibility

## Context

Project: Branson 2026 vacation dashboard (static site, GitHub Pages).  
Working directory: `/Users/alex/vaults/Vacation/Branson 2026`  
`web/js/site.js` is loaded synchronously as the first child of `<body>` on all 10 pages. It injects the site header, hamburger panel, and bottom tabs. The hamburger panel is built once at page load by `buildHamburgerPanel()`. The desktop `.site-nav` is populated from a `NAV_LINKS` array.

---

## Files You May Touch

- `web/js/site.js`
- `web/profile.html`

**Never touch:** `web/admin.html`, `web/css/tokens.css`, `web/css/components.css`, `web/css/themes/*.css`, or any other HTML file. If you encounter an element that looks unused or redundant while reading files, **flag it in the handback report — do not remove it**.

---

## Implementation Steps

### Step 1 — Read the files first

Read both `web/js/site.js` and `web/profile.html` in full before writing a single line of code. Understand:
- Where `USER_KEY` and `MODE_KEY` are declared at the top of `site.js`
- The full body of `buildHamburgerPanel()` — especially how the Admin `<a>` element is currently built and conditionally injected
- How `NAV_LINKS` is rendered into `.site-nav`
- Where `setUser(name)` lives in `profile.html`, and where `renderGreeting` and `updateProfileBtnBadge` are called inside it
- How the `#site-theme-toggle` click handler is currently attached and what it does (dark mode cycling + label update)
- Where and how `syncBadge()` is called

### Step 2 — `web/js/site.js` changes

Make all four of the following changes in a single edit pass:

**2a. Add `ADMIN_USERS` constant**  
Near the top of the file, alongside `USER_KEY` and `MODE_KEY`, add:
```js
var ADMIN_USERS = ['Alex'];
```
This must be a plain JS array literal. No JSON, no fetch, no external config.

**2b. Refactor the Admin visibility check in `buildHamburgerPanel()`**  
Find the existing check:
```js
localStorage.getItem(USER_KEY) === 'Alex'
```
Replace it with:
```js
ADMIN_USERS.includes(localStorage.getItem(USER_KEY) || '')
```
Leave everything else in the Admin link construction exactly as-is. The link text must remain `"⚙️ Admin"`.

**2c. Inject the Admin link into the desktop `.site-nav`**  
After the code that renders `NAV_LINKS` into the `.site-nav` element, add a conditional block that mirrors the hamburger Admin link pattern: if the current user is in `ADMIN_USERS`, create an `<a>` element pointing to `admin.html` with text `"⚙️ Admin"` and append it to `.site-nav`. Match the same element construction pattern (tag, href, textContent / innerHTML) used for the hamburger Admin link. Do not add Admin to the `NAV_LINKS` array itself.

**2d. Expose `window.vacdashRebuildHamburger()`**  
Add this function to the global scope (assign to `window.vacdashRebuildHamburger`). It must:

1. Find `#hamburger-panel` and replace its `innerHTML` with fresh output from the `buildHamburgerPanel()` internals. You may refactor `buildHamburgerPanel()` to return its HTML string (or a DocumentFragment) instead of writing directly, then call it from both the initial load and from `vacdashRebuildHamburger`. Alternatively, re-invoke the build logic inline — whichever approach produces clean, readable code.

2. Re-attach the `#site-theme-toggle` click handler **without duplicating event listeners**. Use one of these safe patterns:
   - Clone the element with `el.cloneNode(true)`, then replace the old element with the clone before calling `addEventListener` on the clone, **or**
   - Give the handler a named function reference and use a flag/variable to ensure it is only registered once.
   
   After re-attaching, reset the toggle's label from the stored mode value (mirror exactly what the initial page-load code does).

3. If the `.site-nav` element has the class `nav-fits` (i.e., the desktop nav is active), refresh the Admin link there too: remove any existing Admin `<a>` from `.site-nav` that was previously injected, then re-run the conditional injection from step 2c.

4. Call `syncBadge()` at the end of the function to keep the profile button badge state correct.

The function must be **idempotent**: calling it two or more times in succession must produce the same DOM state as calling it once.

### Step 3 — `web/profile.html` change

Locate the `setUser(name)` function. Find the lines that call `renderGreeting` and `updateProfileBtnBadge`. Immediately after both of those calls (i.e., at the end of the `setUser` function body), add:
```js
if (typeof window.vacdashRebuildHamburger === 'function') window.vacdashRebuildHamburger();
```
Do not modify anything else in this file.

---

## Verification — Run before handback

Run each command from the working directory and confirm the expected result:

```bash
grep -c 'ADMIN_USERS' web/js/site.js
# Expected: >= 1

grep -c 'vacdashRebuildHamburger' web/js/site.js
# Expected: >= 1

grep -c 'vacdashRebuildHamburger' web/profile.html
# Expected: >= 1

grep -c 'pointerdown' web/quick-pick.html
# Expected: 1  (safety check — must be untouched)

grep -c 'fetch.*data.json' web/attractions.html
# Expected: >= 1  (safety check — must be untouched)
```

If any check fails, fix the issue before handing back.

---

## Handback Format

Reply with exactly this structure — nothing more:

1. **Files modified** — one line per file describing what changed.
2. **Unused/redundant elements noticed** — list any elements you encountered that looked unused or redundant (per the no-removal discipline). If none, write "None observed."
3. **Verification results** — paste each `grep -c` command with its actual output and confirm pass/fail.

Do **not** run `git`, `rsync`, or any push/deploy command. Do **not** update logs or any file outside the two listed above.
