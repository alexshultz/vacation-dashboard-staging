<role>
You are a precision frontend engineer implementing a unified admin overlay sprint for the Branson 2026 vacation dashboard. Your goal: make admin sign-out and edit controls available on every page, move the INITIAL_VISIBLE bar to the top of index.html, add edit buttons to index.html event cards, add deprecated banners to old admin pages, and write authenticated Playwright specs. Read every source file before writing a single byte.
</role>

<static_background>
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Staging URL:** `https://vacation-dev.creeperbomb.com`
**Files to modify:** web/js/site.js, web/js/admin-overlay.js, web/index.html, web/css/components.css, web/admin-event-timeline.html, web/admin-index.html, tests/e2e/tests/admin-auth.spec.js (NEW)
**Files NOT to touch:** web/event-timeline.html, web/attractions.html, web/shows.html, web/quick-pick.html, web/wishlist.html, web/suggested.html, web/profile.html, web/people-timeline.html, web/help.html, web/admin.html, web/js/picks.js, web/css/tokens.css, web/css/themes/trail.css, generate_dashboard.py, generate_attractions.py

**Verified state (confirmed from source):**
- site.js runs synchronously as FIRST child of body on all pages. Injects header via `cs.insertAdjacentHTML('afterend', buildHeader() + ...)` at approximately line 150. The `.site-header__inner` div is the inner wrapper of the injected header.
- admin-overlay.js: currently injects a floating `#vacdash-admin-badge` div (position:fixed, top:64px, right:12px). `_activateAdmin()` sets display:block on it. `_deactivateAdmin()` sets display:none. It loads today only on index.html (line 361) and event-timeline.html.
- index.html: Supabase CDN on line 17. site.js on line 67. `<main>` opens line 68. `<script>` block lines 89-353. Cards rendered via `document.createElement('details')` + `cardEl.innerHTML = \`...\`` at lines 169-204. `eventsData` is module-level let (line 95). `window._vacdashEvents` is NOT set yet in index.html. `#vacdash-iv-bar` div currently at lines 354-359, AFTER `</script>` and before `</main>` (line 360).
- admin.html login selectors: `#auth-email-login` (shown by showAuthUI on load), `#login-email`, `#login-password`, `#login-btn`, `#editor-section` (shown on successful login).
- tests/e2e/package.json has NO dotenv dependency. Read .env.test with fs.readFileSync.
- tests/e2e/.env.test is gitignored, contains VACDASH_EMAIL, VACDASH_PASSWORD, VACDASH_STAGING_URL.
- Playwright config: tests/e2e/playwright.config.js -- confirm testDir and timeout before writing spec.

**MANDATORY CONSTRAINT:** Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report but do NOT remove or alter it.
**FROZEN FILES:** Never run or modify generate_dashboard.py or generate_attractions.py.
</static_background>

<task>
Implement the following changes in order. Read each file before modifying it.

---

### CHANGE A -- Load admin-overlay.js on every page via site.js

In `web/js/site.js`, inside the synchronous injection block (after `cs.insertAdjacentHTML(...)` and header setup, before the closing `if` block), append a script tag dynamically:

```js
// Load admin overlay on every page that uses site.js
(function() {
  var overlayScript = document.createElement('script');
  overlayScript.src = (function() {
    // Derive the correct relative path to admin-overlay.js
    // site.js itself is at js/site.js, so admin-overlay.js is at js/admin-overlay.js
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('site.js') !== -1) {
        return scripts[i].src.replace('site.js', 'admin-overlay.js');
      }
    }
    return 'js/admin-overlay.js'; // fallback
  })();
  document.head.appendChild(overlayScript);
})();
```

This replaces manually adding `<script src="js/admin-overlay.js">` to each HTML file. After this change, remove the explicit `<script src="js/admin-overlay.js"></script>` tags from index.html (line 361) and event-timeline.html (find and remove the equivalent tag there too) to avoid double-loading.

---

### CHANGE B -- Move sign-out from floating badge to site header button

In `web/js/admin-overlay.js`:

1. Replace the floating badge injection with an in-header button. Instead of creating `#vacdash-admin-badge` as a fixed-position body div, create `#vacdash-signout-btn` as a `<button>`:

```js
var _btn = document.createElement('button');
_btn.id = 'vacdash-signout-btn';
_btn.textContent = '🔒 Sign Out';
_btn.addEventListener('click', function() {
  _sb.auth.signOut().then(function() { location.reload(); });
});
document.body.appendChild(_btn); // fallback -- will be moved to header
// Try to place in site header
var headerInner = document.querySelector('.site-header__inner');
if (headerInner) { headerInner.appendChild(_btn); }
```

2. Update `_activateAdmin()`: instead of `document.getElementById('vacdash-admin-badge').style.display = 'block'`, use `document.getElementById('vacdash-signout-btn').style.display = 'inline-flex'`.

3. Update `_deactivateAdmin()`: set `display = 'none'` on `#vacdash-signout-btn`.

4. Remove all references to `vacdash-admin-badge` from the JS. Keep the CSS rule in components.css updated (see CHANGE E).

---

### CHANGE C -- Add edit buttons to index.html event cards

In `web/index.html`, in the card rendering loop (around lines 169-204):

1. After `cardEl.className = 'event-card';`, add:
```js
cardEl.style.position = 'relative';
cardEl.setAttribute('data-event-id', event.id);
```

2. After `cardEl.innerHTML = \`...\`;` and before `section.appendChild(cardEl)`, add:
```js
cardEl.insertAdjacentHTML('beforeend',
  '<button class="admin-edit-btn" data-event-id="' + event.id +
  '" aria-label="Edit event" onclick="vacdashOpenEdit(this)">✏\uFE0F</button>'
);
```

3. After `eventsData = data;` (both the Supabase fetch path and the schedule.json fallback path), add:
```js
window._vacdashEvents = eventsData;
```
Confirm exact line numbers from the file before patching -- there are two `eventsData =` assignments in loadSchedule().

---

### CHANGE D -- Move INITIAL_VISIBLE bar to top of main content

In `web/index.html`:

1. REMOVE the `#vacdash-iv-bar` div block from its current position (lines 354-359, after `</script>` and before `</main>`).

2. INSERT it immediately after `<main class="page-main">` (line 68), before the toggle button wrapper. Use this updated HTML (no fixed positioning -- inline block):
```html
  <div id="vacdash-iv-bar" style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--color-surface);border:1px solid var(--color-line);border-radius:var(--radius-btn);margin-bottom:16px;">
    <button id="vacdash-iv-minus" type="button" style="width:2rem;height:2rem;font-size:1.2rem;background:none;border:1px solid var(--color-line);border-radius:4px;cursor:pointer;">−</button>
    <input id="vacdash-iv-input" type="number" min="1" style="width:3.5rem;text-align:center;font-size:1.2rem;border:1px solid var(--color-line);border-radius:4px;padding:2px 4px;">
    <button id="vacdash-iv-plus" type="button" style="width:2rem;height:2rem;font-size:1.2rem;background:none;border:1px solid var(--color-line);border-radius:4px;cursor:pointer;">+</button>
    <span style="font-size:13px;color:var(--color-ink-dim);">Visible on load</span>
  </div>
```

Note: The CSS rule `#vacdash-iv-bar { display: none; }` in components.css overrides the inline `display:flex`. The `body.is-admin #vacdash-iv-bar { display: flex; }` rule reveals it. Do NOT add a `hidden` attribute.

---

### CHANGE E -- Update components.css for new signout button

In `web/css/components.css`, in the admin overlay section at the end of the file:

Replace:
```css
#vacdash-admin-badge { display: none; }
body.is-admin #vacdash-admin-badge { display: block; }
```

With:
```css
#vacdash-signout-btn {
  display: none;
  background: none;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-btn);
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-ink);
  margin-left: 8px;
  white-space: nowrap;
}
body.is-admin #vacdash-signout-btn { display: inline-flex; align-items: center; }
```

---

### CHANGE F -- Deprecated banners on admin-event-timeline.html and admin-index.html

In `web/admin-event-timeline.html`, immediately after the `<body>` opening tag and BEFORE the `<script src="js/site.js">` tag, insert:
```html
<!-- Deprecated admin page banner -->
<div style="background:#FFF3CD;color:#856404;border-bottom:1px solid #FFECB5;padding:10px 20px;font-size:14px;text-align:center;">
  ⚠️ This admin view is deprecated. Use the <a href="event-timeline.html" style="color:#856404;font-weight:700;">main Timeline page</a> instead (edit icons appear when you're logged in).
</div>
```

In `web/admin-index.html`, same placement -- immediately after `<body>` opening tag:
```html
<!-- Deprecated admin page banner -->
<div style="background:#FFF3CD;color:#856404;border-bottom:1px solid #FFECB5;padding:10px 20px;font-size:14px;text-align:center;">
  ⚠️ This admin view is deprecated. Use the <a href="index.html" style="color:#856404;font-weight:700;">main Home page</a> instead (admin controls appear when you're logged in).
</div>
```

---

### CHANGE G -- Authenticated Playwright spec

Create `tests/e2e/tests/admin-auth.spec.js`:

```js
// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Load credentials from .env.test (gitignored -- never commit credentials)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.test');
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  lines.forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
  return env;
}
const { VACDASH_EMAIL, VACDASH_PASSWORD, VACDASH_STAGING_URL } = loadEnv();

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

test.describe('Admin overlay -- authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('index.html shows admin controls when logged in', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    // body.is-admin should be present
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(true);
    // Sign-out button visible in header
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(true);
    // At least one edit button visible
    const editBtns = await page.locator('.admin-edit-btn').filter({ hasText: '✏️' });
    expect(await editBtns.count()).toBeGreaterThan(0);
    const firstVisible = await editBtns.first().isVisible();
    expect(firstVisible).toBe(true);
    // IV bar visible
    const ivBarVisible = await page.isVisible('#vacdash-iv-bar');
    expect(ivBarVisible).toBe(true);
  });

  test('event-timeline.html shows edit buttons when logged in', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(true);
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(true);
    const editBtns = page.locator('.admin-edit-btn');
    expect(await editBtns.count()).toBeGreaterThan(0);
    expect(await editBtns.first().isVisible()).toBe(true);
  });

  test('sign-out removes admin controls', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('#vacdash-signout-btn', { state: 'visible', timeout: 10000 });
    await page.click('#vacdash-signout-btn');
    // After reload triggered by signOut
    await page.waitForLoadState('networkidle');
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(false);
  });
});

test.describe('Admin overlay -- unauthenticated family view', () => {
  test('index.html hides admin controls for family', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(false);
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(false);
    // Edit buttons exist in DOM but must not be visible
    const editBtns = page.locator('.admin-edit-btn');
    if (await editBtns.count() > 0) {
      expect(await editBtns.first().isVisible()).toBe(false);
    }
  });

  test('event-timeline.html hides edit buttons for family', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const editBtns = page.locator('.admin-edit-btn');
    if (await editBtns.count() > 0) {
      expect(await editBtns.first().isVisible()).toBe(false);
    }
  });
});
```

---

## Verify Your Work

After all changes, run:
```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

All existing 20 tests must still pass. The new admin-auth.spec.js tests must also pass (7 new tests). If admin-auth tests fail due to network/auth timing, increase the waitForSelector timeout to 15000ms and retry once. Do NOT disable or skip tests.

</task>

<order_of_analysis>
1. Read web/js/site.js in full. Identify exact line where admin-overlay.js script tag should be injected (after header setup, before closing brace of injection block).
2. Read web/js/admin-overlay.js in full. Identify all references to vacdash-admin-badge that must be replaced.
3. Read web/index.html in full. Confirm exact lines for: card createElement loop, two eventsData= assignments, vacdash-iv-bar position, admin-overlay.js script tag.
4. Read web/css/components.css last 30 lines. Confirm exact text to replace.
5. Read web/admin-event-timeline.html lines 1-10. Confirm body tag placement for banner.
6. Read web/admin-index.html lines 1-10. Confirm body tag placement for banner.
7. Read tests/e2e/playwright.config.js. Confirm testDir and timeout settings.
8. Apply CHANGE A (site.js script injection). Verify admin-overlay.js tag removed from index.html and event-timeline.html.
9. Apply CHANGE B (admin-overlay.js badge → header button).
10. Apply CHANGE C (index.html edit buttons + window._vacdashEvents).
11. Apply CHANGE D (move vacdash-iv-bar to top of main).
12. Apply CHANGE E (components.css signout button rules).
13. Apply CHANGE F (deprecated banners on admin pages).
14. Create CHANGE G (admin-auth.spec.js).
15. Run Playwright suite. All 20 existing + 7 new = 27 tests must pass. Fix any failures before handback.
</order_of_analysis>

<hallucination_guard>
- Do NOT add a second Supabase CDN tag to any file. It is already in head on pages that need it.
- Do NOT modify generate_dashboard.py or generate_attractions.py under any circumstances.
- Do NOT touch web/event-timeline.html for anything other than removing the explicit admin-overlay.js script tag (CHANGE A requires removing it from event-timeline.html since site.js will now load it).
- Do NOT use innerHTML to insert the sign-out button into the header -- use appendChild on the actual element.
- Do NOT hardcode credentials anywhere. The spec reads them from .env.test only.
- Do NOT call applyVisibility() -- the correct function name in index.html is applyVisibilityState(showAll). Confirm by reading the file.
- Do NOT remove the #vacdash-iv-bar JS wiring (the event listeners for minus/plus/input) -- only the HTML position changes. The wiring is in the script block and stays there.
- Do NOT add the hidden attribute to #vacdash-iv-bar -- visibility is controlled by CSS only.
- The admin-auth.spec.js sign-out test: clicking the button triggers location.reload() in admin-overlay.js. Use waitForLoadState('networkidle') after click, not waitForNavigation.
- admin-event-timeline.html and admin-index.html are only getting the deprecated banner. Their existing code is untouched.
</hallucination_guard>

<output_format>
1. Modified files: web/js/site.js, web/js/admin-overlay.js, web/index.html, web/css/components.css, web/admin-event-timeline.html, web/admin-index.html
2. New file: tests/e2e/tests/admin-auth.spec.js
3. Playwright suite: all tests pass (20 existing + 7 new)
4. Handback: list every file modified with one-line description, note any deviations from brief
</output_format>

<handback>
When all code changes are complete and Playwright passes: (1) List every file you modified with a one-line description. (2) Note any assumptions or judgment calls. (3) STOP. Do not commit, push, copy files, or update logs. Hermes handles all post-code orchestration.
</handback>
