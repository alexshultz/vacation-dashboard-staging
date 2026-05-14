# Fix Brief: admin-event-crud XSS + test gaps

Read this brief and fix the issues listed. Do NOT touch anything outside the named scope.

## FAIL Issues (blockers -- fix before handback)

### FAIL-1: XSS in renderCardSummary -- event.title unescaped in innerHTML
File: web/event-timeline.html
The `renderCardSummary` function (and `renderArchivedCard` which uses it) injects `${event.title}` directly into `container.innerHTML`. A title containing `<img src=x onerror=alert(1)>` would execute on every family member's browser.

Fix: add an HTML escaping helper function and use it on every user-supplied string written into innerHTML. Apply to: event.title and any other field from Supabase written into innerHTML in these new functions.

### FAIL-2: XSS in nameCell -- RSVP names unescaped in innerHTML
File: web/event-timeline.html
`const nameCell = (n) => \`<div class="event-card__name">${n}</div>\`` -- names from event.interested, event.undecided, event.notInterested, event.noResponse are written unescaped.

Fix: apply the same HTML escaping helper to the nameCell template.

## WARN Issues (fix if straightforward, flag if complex)

### WARN-1: AC-6/AC-7 tests only check button visibility, not behavior
File: tests/e2e/tests/admin-event-crud.spec.js
The Restore and Delete tests create a real archived event but only assert the buttons are visible. They do not click the buttons or verify the Supabase call succeeds.

Fix: extend the AC-6 test to click Restore and verify the card is removed from the archived list. Extend the AC-7 test to click Delete (with confirm() mocked via page.on('dialog')) and verify the card disappears.

### WARN-2: Auth race in AC-6/AC-7 -- waitForFunction placed after click
File: tests/e2e/tests/admin-event-crud.spec.js
`waitForFunction(() => document.body.classList.contains('is-admin'))` must run BEFORE `page.click('#vacdash-show-archived-btn')`, not after.

Fix: move the waitForFunction guard to before the show-archived click in the affected tests.

## Constraints
- Fix ONLY the files named above (web/event-timeline.html, tests/e2e/tests/admin-event-crud.spec.js)
- Do NOT modify any other file
- Do NOT modify any HTML element not in scope of these fixes
- After fixing, run the full Playwright suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
- All 82 tests must pass before handback
- Do NOT commit, push, copy files, or update logs

## Handback format
List every file modified with a one-line description. Note any assumptions. STOP.
