<task>
You are lazlo, the implementation agent for the Branson 2026 vacation dashboard. Your job is to build a Playwright E2E test suite from scratch. Read every constraint carefully before writing a single line of code.
</task>

<background>
PROJECT: Branson 2026 family vacation dashboard. Static HTML/JS/CSS site deployed to GitHub Pages.
- Vault (your working directory): /Users/alex/vaults/Vacation/Branson 2026/
- Web source files: web/ subdirectory -- DO NOT MODIFY ANY FILE IN web/, scripts/, data/, or docs/
- Staging URL: https://vacation-dev.creeperbomb.com
- Production URL: https://vacation.creeperbomb.com (tests never target this)

SITE ARCHITECTURE (read-only context):
- site.js dynamically injects .site-header and bottom-tabs nav into every page on load
- help.html fetches help.json at runtime and renders section content from it
- event-timeline.html and index.html fetch live Supabase data (Phase 2, active on staging)
- Admin pages (admin-index.html, admin-event-timeline.html) redirect to admin.html if not authenticated
- Admin auth is WebAuthn/passkey -- cannot be automated; do not attempt
- Tests are strictly read-only -- no Supabase writes, no data mutations

FAMILY PAGES (10 total):
  index.html, attractions.html, shows.html, quick-pick.html, wishlist.html,
  suggested.html, event-timeline.html, people-timeline.html, profile.html, help.html

ADMIN PAGES (3 total):
  admin.html (auth gate), admin-index.html, admin-event-timeline.html

HELP.HTML -- THE 5 REQUIRED SECTION HEADINGS (exact strings, case-sensitive):
  1. "What is this"
  2. "Setting your name"
  3. "Browsing and wishlisting"
  4. "Quick Pick"
  5. "Privacy"
</background>

<constraints>
- Do NOT modify any file in web/, scripts/, data/, or docs/
- Do NOT run generate_dashboard.py or generate_attractions.py (frozen)
- Do NOT write to Supabase or mutate any staging data
- Do NOT attempt to automate WebAuthn/passkey authentication
- Do NOT add data-testid attributes to web/ HTML files -- use the CSS selectors specified below
- All test files live in tests/e2e/ inside the vault; they are NOT rsync'd to the staging repo
- Chromium only. WebKit gap is acknowledged and deferred.
</constraints>

<css_selectors>
Use these exact selectors for all assertions. Do not invent alternatives.

SITE CHROME (all family pages):
  - Nav header: .site-header
  - Card elements (attractions/shows): .card--light
  - Event timeline cards: .event-card (event-timeline.html and index.html)
  - Quick Pick / swipe deck cards: .qp-card (quick-pick.html)
  - People timeline cards: .person-card OR .people-card (use .person-card first; if count is 0, fall back to .people-card and log which matched)

PROFILE PAGE:
  - Name input: input[type="text"][id*="name"], OR if not found: input[placeholder*="name" i]

HELP PAGE:
  - Section headings: h2 (text content matching the 5 strings listed above -- use page.getByText() with exact: false)

ADMIN PAGES:
  - Auth UI: #auth-register OR #auth-signin (at least one must be visible)
  - Admin editor container: use selector [data-section="editor"], OR if not present: .admin-editor, OR if not present: the first <section> or <div> that is a sibling of the auth container -- document which selector you found in your handback report
  - Admin editor must be asserted NOT ATTACHED to the DOM (not just hidden via CSS) -- use expect(locator).not.toBeAttached()
</css_selectors>

<setup_instructions>
Step 1: Create the package.json and install dependencies.
From the vault root:

  mkdir -p tests/e2e
  cd tests/e2e
  npm init -y
  npm install --save-dev @playwright/test@1.43.x
  npx playwright install chromium --with-deps

Step 2: Add node_modules to Obsidian excluded folders.
Edit /Users/alex/vaults/Vacation/Branson 2026/.obsidian/app.json.
Find the "excludedFolders" array (or create it if absent) and add "tests/e2e/node_modules".
If app.json does not exist or the key is absent, create the entry:
  { "excludedFolders": ["tests/e2e/node_modules"] }
Merge with any existing content; do not overwrite the whole file.
</setup_instructions>

<files_to_create>

## File 1: tests/e2e/playwright.config.js

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  // retries intentionally 0 -- flakiness baseline must be established before retries are enabled
  retries: 0,
  timeout: 15000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://vacation-dev.creeperbomb.com',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

## File 2: tests/e2e/smoke.spec.js

One test per FAMILY PAGE only. Admin subpages (admin-index.html, admin-event-timeline.html)
are NOT included in smoke -- they redirect and cannot be independently asserted here.
admin.html IS included in smoke (it is a stable page that does not redirect).

Family pages to test (10): index, attractions, shows, quick-pick, wishlist, suggested,
event-timeline, people-timeline, profile, help.
Admin gate page (1): admin.html.

For each page:
1. Register a console error collector BEFORE page.goto():
   const errors = [];
   page.on('console', msg => {
     if (msg.type() === 'error' || msg.type() === 'warning') {
       const text = msg.text();
       // Filter known-benign patterns -- do not fail on these
       const BENIGN = [
         'favicon',
         'WebAuthn',
         'passkey',
         'GoTrueClient',  // Supabase auth client info messages
         'Failed to fetch',  // network-level Supabase flakiness -- skip in smoke
       ];
       if (!BENIGN.some(b => text.includes(b))) {
         errors.push(text);
       }
     }
   });

2. Navigate: await page.goto('/<page>.html');

3. Assert title contains "Branson" (case-insensitive):
   await expect(page).toHaveTitle(/Branson/i);

4. Assert .site-header is visible (proves site.js executed and injected the header):
   await expect(page.locator('.site-header')).toBeVisible();

5. Assert no unexpected console errors:
   expect(errors, `Console errors on <page>.html: ${errors.join('; ')}`).toHaveLength(0);

For admin.html only:
- After .site-header check, assert #auth-register OR #auth-signin is visible
- Assert the admin editor container is NOT attached to DOM (see css_selectors above)

## File 3: tests/e2e/family-features.spec.js

Add file-level timeout override for Supabase-dependent tests:
  test.use({ timeout: 30000 });

Add a beforeAll() health check:
  const response = await fetch('https://vacation-dev.creeperbomb.com/');
  if (!response.ok) {
    test.skip(true, `Staging unreachable (HTTP ${response.status}) -- skipping all functional tests`);
  }

Individual tests (one test per assertion -- do not combine into one mega-test):

TEST 1 -- index.html: Supabase event cards render
  Navigate to index.html.
  Assert expect(page.locator('.event-card')).toHaveCount() >= 1 within 5000ms.
  NOTE: a count of 0 is a DATA issue, not necessarily a code issue -- document this in the test comment.

TEST 2 -- attractions.html: attraction cards render
  Navigate to attractions.html.
  Assert expect(page.locator('.card--light')).toHaveCount() >= 3.

TEST 3 -- event-timeline.html: event cards render
  Navigate to event-timeline.html.
  Assert expect(page.locator('.event-card')).toHaveCount() >= 1 within 5000ms.

TEST 4 -- people-timeline.html: person cards render
  Navigate to people-timeline.html.
  Try .person-card first. If count is 0, try .people-card.
  Assert whichever selector returned > 0 has count >= 1.
  Log which selector matched in a console.log (not a failure).

TEST 5 -- quick-pick.html: swipe deck has cards
  Navigate to quick-pick.html.
  Assert expect(page.locator('.qp-card')).toHaveCount() >= 1.

TEST 6 -- help.html: all 5 required sections present
  Navigate to help.html.
  For each of the 5 required section headings (exact strings in <background>),
  assert page.getByText(heading, { exact: false }) is visible.
  All 5 must pass; failure on any one is a test failure.

TEST 7 -- profile.html: name input present
  Navigate to profile.html.
  Assert input[type="text"][id*="name"] is visible.
  If count is 0, fall back to input[placeholder*="name" i] and assert that is visible.

## File 4: tests/e2e/admin-gate.spec.js

TEST 1 -- admin-index.html redirects to admin.html AND editor is not pre-exposed
  Navigate to admin-index.html with { waitUntil: 'commit' } (catch the navigation before redirect resolves).
  -- OR -- navigate normally and use:
    const editorVisible = await page.locator('[data-section="editor"], .admin-editor').isAttached();
  Assert editor is NOT attached before redirect fires (this may be very fast -- log a warning if it cannot be asserted before redirect, do not fail the build).
  Then assert: await page.waitForURL('**/admin.html', { timeout: 3000 });

TEST 2 -- admin-event-timeline.html redirects to admin.html
  Same pattern as Test 1 for admin-event-timeline.html.

TEST 3 -- admin.html: auth gate is correctly presented
  Navigate to admin.html directly.
  Assert #auth-register OR #auth-signin is visible.
  Assert admin editor container is NOT attached to DOM (not CSS-hidden -- use .not.toBeAttached()).

IMPORTANT: If the redirect fires faster than Playwright can assert the pre-redirect state,
log a console.warn and skip the pre-redirect assertion only -- do NOT fail the test.
The redirect itself (waitForURL within 3s) is the hard requirement.
</files_to_create>

<verify_your_work>
After writing all files and completing npm install:

Step 0 -- Baseline before any code (record current state):
  cd tests/e2e && npx playwright test --reporter=line 2>&1 | tail -30 > /tmp/lazlo_test_baseline.txt || echo "Suite not yet written"

Step 1 -- Run the suite:
  cd tests/e2e && npx playwright test --reporter=line

Step 2 -- Fix loop (max 3 cycles):
  - Fix only in test files (tests/e2e/) -- never touch web/ files
  - Do NOT skip, xfail, or delete any test because it fails
  - If a test fails because of missing staging data (Supabase returns 0 cards), log the diagnosis and do NOT rewrite the test -- report it as a data-dependency issue in your handback
  - If the same error appears twice, stop iterating and report it

End your final response with this exact line (last line, nothing after it):
LAZLO_RESULT: tests_run=<yes|no> tests_passed=<yes|no|na> gave_up=<yes|no> iterations=<N>
</verify_your_work>

<handback>
When all files are written and the test cycle is complete:

1. List every file you created or modified with a one-line description.
2. Report test status as the first item:
   - Tests passed: all N tests passed (npx playwright test, N iterations)
   - Tests failing after N attempts: [failing test name -- one-sentence diagnosis]
   - Data-dependency issues: [test name -- "staging Supabase returned 0 rows for X -- not a code defect"]
3. Report which admin editor selector you found (#auth-register, .admin-editor, or other) and document it.
4. Report which people-timeline card selector matched (.person-card or .people-card).
5. Note any Obsidian app.json changes made (excludedFolders update).
6. STOP. Do not commit, push, rsync, or update any logs. Hermes handles all post-code orchestration.

Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
</handback>
