# Grill-Me: Unified Admin Pages Sprint

## Q1: Should site.js dynamically load admin-overlay.js (one change) vs. adding the script tag to all 10 HTML files?
**Answer:** site.js should dynamically append the admin-overlay.js script tag. site.js already runs synchronously as the first child of `<body>` on every page. It can append a `<script src="js/admin-overlay.js">` element to `<head>` in the same synchronous block where it injects the header. This is one change (site.js) vs. 10 HTML file edits, and it guarantees the overlay loads on every future page automatically. The only risk is load order -- admin-overlay.js requires `window.supabase` (CDN) which is in `<head>` and loads before `<body>`, so the SDK is available. The Supabase CDN tag is in `<head>` on all pages that use auth (confirmed on index.html line 17, event-timeline.html line 16). Pages that do NOT have the CDN tag will have admin-overlay.js silently no-op (it checks `window.supabase` before calling createClient).
Alex's Thoughts:

## Q2: Sign-out button in the site header -- what is the correct injection approach?
**Answer:** admin-overlay.js runs after site.js has already injected the `.site-header__inner` element. The overlay can `querySelector('.site-header__inner')` and append a `<button id="vacdash-signout-btn">` as its last child. This places the button consistently in the top-right of the header across all pages with no CSS positioning hacks. The CSS rule `body.is-admin #vacdash-signout-btn { display: inline-flex; }` (with default `display:none`) keeps it hidden until session is confirmed. The floating `#vacdash-admin-badge` div should be removed -- it is superseded by the in-header button. If `.site-header__inner` is not found (edge case: a page without site.js), the overlay falls back to not showing the button -- silent fail, no error.
Alex's Thoughts:

## Q3: index.html uses `document.createElement` + `cardEl.innerHTML` -- how does the edit button get added?
**Answer:** index.html builds cards via `const cardEl = document.createElement('details')` then sets `cardEl.innerHTML = \`...\``. The edit button cannot go inside the innerHTML template literal if we want to avoid touching it -- but we CAN set `cardEl.setAttribute('data-event-id', event.id)` and `cardEl.style.position = 'relative'` on the element directly, then use `cardEl.insertAdjacentHTML('beforeend', '<button class="admin-edit-btn" ...>✏️</button>')` after the innerHTML assignment. This is clean and does not require rewriting the template. Also: `window._vacdashEvents` must be set after the data loads so admin-overlay.js can look up events by id -- same as the event-timeline.html pattern.
Alex's Thoughts:

## Q4: INITIAL_VISIBLE bar -- inline top of main vs. sticky below header?
**Answer:** Inline at the top of `<main>` is correct. Sticky requires z-index management and can overlap content on scroll. An inline bar that scrolls with the page is simpler and places the control naturally where the content it affects begins. The bar should use `display:flex; align-items:center; gap:8px; padding:10px 16px; background:var(--color-surface); border:1px solid var(--color-line); border-radius:var(--radius-btn); margin-bottom:16px;` -- same visual style as the admin-index.html control bar. The `#vacdash-iv-bar` div currently sits AFTER `</script>` and before `</main>` (line 354). It needs to move to just after `<main class="page-main">` (line 68).
Alex's Thoughts:

## Q5: Playwright authenticated spec -- no dotenv in package.json. How to read .env.test credentials?
**Answer:** Use Node.js `fs.readFileSync` to parse `.env.test` manually -- no additional dependency needed. Pattern: read the file, split on newlines, find lines matching `KEY=value`, extract value. This is a 6-line utility function. Alternatively, `process.env` can be pre-populated by running `export $(cat .env.test)` before the test command -- but that requires shell setup. The self-contained fs approach is more reliable in CI and Lazlo contexts. The `.env.test` file is already gitignored (confirmed). Credentials must NEVER appear in test output or console.log -- use them only in fill() calls.
Alex's Thoughts:

## Q6: Playwright login flow -- what selectors does admin.html use?
**Answer:** Confirmed from source: the login form div is `#auth-email-login` (display:none by default, shown after page loads via `showAuthUI()`). Email input: `#login-email`. Password input: `#login-password`. Submit button: `#login-btn`. The spec must wait for `#auth-email-login` to be visible before filling (the showAuthUI() call is async). After login success, admin.html calls `showEditor()` which shows `#editor-section`. The spec should wait for `#editor-section` to be visible to confirm login succeeded, then navigate to the target page.
Alex's Thoughts:

## Q7: Should admin-event-timeline.html and admin-index.html get redirect banners in this sprint?
**Answer:** Yes -- add a visible banner to both pages: a yellow info bar at the top saying "This page is deprecated. Use the main Timeline / Home page instead." with a link to the family version. Do NOT redirect automatically (some bookmarks may rely on these URLs). The banner is admin-only context anyway since the session guard keeps family members out. This is a low-risk 2-line HTML addition per page and satisfies the "leave them until nothing is left to get off them" directive.
Alex's Thoughts:

## Q8: After this sprint, what Playwright tests cover the admin overlay on each page?
**Answer:** New `admin-auth.spec.js` must cover: (1) login flow completes on admin.html, (2) body.is-admin class appears on index.html after login, (3) at least one `.admin-edit-btn` is visible on index.html, (4) `#vacdash-signout-btn` is visible in the header on index.html, (5) same checks on event-timeline.html, (6) sign-out removes is-admin class, (7) unauthenticated visit to index.html and event-timeline.html shows zero visible `.admin-edit-btn` elements. Tests run against `VACDASH_STAGING_URL` from `.env.test`.
Alex's Thoughts:
