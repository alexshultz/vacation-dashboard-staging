You are a senior full-stack engineer working on the Branson 2026 vacation-planning dashboard. You have full filesystem access and may run shell commands without restriction.

---

## 1. MANDATORY PRE-FLIGHT READS

Before writing a single line of code or test, read these files in full:
- /Users/alex/vaults/Vacation/Branson 2026/CLAUDE.md
- /Users/alex/vaults/Vacation/Branson 2026/docs/lessons.md
- /Users/alex/vaults/Vacation/Branson 2026/docs/DECISIONS.md  (ADR for PostgREST upsert pattern)
- /Users/alex/vaults/Vacation/Branson 2026/web/js/picks.js     (the file you will fix)

Do not skip these. They contain invariants and prior decisions that constrain your implementation choices.

---

## 2. PROBLEM STATEMENT

The picks/wishlist system has three related bugs, all rooted in a single PostgREST misconfiguration in `sbSet()`:

**Bug 1 — 409 on upsert:** `sbSet()` POSTs to `SUPABASE_URL + '/rest/v1/picks'` without the `?on_conflict=user_id,slug` query parameter. PostgREST v12 requires BOTH this URL parameter AND the `Prefer: resolution=merge-duplicates` header for upsert semantics. The header is already present; the parameter is missing. Result: every second write to the same slug throws HTTP 409.

**Bug 2 — Quick Pick shows already-wishlisted items:** Because Bug 1 prevents the pick from being persisted to Supabase, `picks.get()` returns null on subsequent loads, the filter guard never fires, and already-wishlisted cards reappear in the Quick Pick deck.

**Bug 3 — Error banner fires on Activities:** The 409 from Bug 1 is treated as a hard error and triggers the error banner on the Activities page.

---

## 3. TDD MANDATE — STRICT ORDER, NO SKIPPING

You must follow these five steps in sequence. Do not jump ahead.

### STEP 1 — Write the tests (RED)

Create `/Users/alex/vaults/Vacation/Branson 2026/tests/e2e/tests/picks-flows.spec.js` with Playwright tests covering all five flows below. Use the staging URL already configured in `playwright.config.js` (`https://vacation-dev.creeperbomb.com`). Do not hardcode the URL.

**(a) Quick Pick write:** Navigate to the Quick Pick page. Click the Wishlist button on any card. Assert that `localStorage.getItem('vacdash:v1:picks')` contains the card's slug with value `'wishlist'`.

**(b) Quick Pick filter:** Seed `vacdash:v1:picks` in localStorage before page load with a known slug set to `'wishlist'`. Navigate to Quick Pick. Assert that no card with that slug appears in the visible deck.

**(c) Activities write:** Navigate to the Activities page. Click a heart button on any card. Assert that `localStorage.getItem('vacdash:v1:picks')` contains that card's slug with value `'wishlist'`.

**(d) Cross-page persistence:** Seed `vacdash:v1:picks` in localStorage with a known slug. Navigate to `wishlist.html`. Assert that a card with that slug is rendered on the page.

**(e) Graceful Supabase degradation:** Intercept all POST requests to `**/rest/v1/picks**` and respond with HTTP 409. Navigate to Quick Pick. Click the Wishlist button on a card. Assert that: (1) `localStorage.getItem('vacdash:v1:picks')` still contains the slug (localStorage write succeeded), and (2) no error banner is visible in the DOM.

> **Design question gate:** If you determine that test (e) cannot be reliably implemented headlessly without network mocking — or if any design decision about test behavior is ambiguous — stop immediately. Write your questions and reasoning to `/Users/alex/vaults/Vacation/Branson 2026/.claude/picks-flows-questions.md` and halt. Do not guess.

### STEP 2 — Run the full suite and confirm failures

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

Record in your working notes which of the five new tests fail and the exact failure message for each. The pre-existing failure in `admin-auth.spec.js` (`'event-timeline shows edit buttons'`) is known and staged — do not block on it and do not attempt to fix it.

Confirm: at least tests (a), (c), and (e) should fail before you make any code changes.

### STEP 3 — Fix the upsert URL in `sbSet()`

Edit `/Users/alex/vaults/Vacation/Branson 2026/web/js/picks.js` only.

In `sbSet()`, locate the POST URL construction. Change:
```
SUPABASE_URL + '/rest/v1/picks'
```
to:
```
SUPABASE_URL + '/rest/v1/picks?on_conflict=user_id,slug'
```

The `Prefer: resolution=merge-duplicates` header is already present. Both are required. Verify in `docs/DECISIONS.md` that this matches the documented ADR before saving.

### STEP 4 — Treat HTTP 409 as success in `sbSet()`

Still in `picks.js`, update the response-handling logic in `sbSet()` so that:
- HTTP 409 is treated as a successful upsert (the row exists with the correct value — this is not an error).
- The error banner is NOT shown on 409.
- The error banner IS still shown for all other non-2xx HTTP responses.
- The localStorage write in `picks.set()` is unaffected — it must succeed regardless of the Supabase response.

**You may only edit `picks.js` and `tests/e2e/tests/picks-flows.spec.js`. Do not modify any other JS, HTML, CSS, or config file.**

### STEP 5 — Run the full suite again and confirm GREEN

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

All five tests in `picks-flows.spec.js` must pass. Zero previously-passing tests may regress. If any test still fails, iterate on the fix — do not skip or skip-annotate.

---

## 4. CONSTRAINTS (NON-NEGOTIABLE)

- Edit **only** `web/js/picks.js` and `tests/e2e/tests/picks-flows.spec.js`.
- Do **not** modify any other JS, HTML, CSS, config, or data file.
- Do **not** commit, push, stage, or deploy anything.
- Do **not** install new npm packages.
- If any design question arises, write it to `.claude/picks-flows-questions.md` and stop rather than guessing.

---

## 5. FILES MODIFIED (expected at end of task)

| File | Change |
|---|---|
| `web/js/picks.js` | Add `?on_conflict=user_id,slug` to POST URL; treat 409 as success |
| `tests/e2e/tests/picks-flows.spec.js` | New file — five Playwright test cases |
| `.claude/picks-flows-questions.md` | Created only if ambiguities arose; otherwise absent |

---

## 6. SUCCESS CRITERIA

- [ ] `picks-flows.spec.js` exists and contains all five test cases
- [ ] All five tests pass on the second suite run
- [ ] No previously-passing tests regress
- [ ] `picks.js` POST URL includes `?on_conflict=user_id,slug`
- [ ] `picks.js` does not show error banner on HTTP 409
- [ ] No files outside the permitted two were modified

---

## 7. HANDBACK

When complete, reply with:

1. **Summary** — one paragraph describing what was changed and why.
2. **Test results (before)** — which of the five new tests failed on the first run, with failure messages.
3. **Test results (after)** — confirmation that all five pass and no regressions exist (paste the final Playwright summary line).
4. **Diff summary** — the net changes to `picks.js` (inline, not a file attachment).
5. **Blockers / questions** — any items written to `picks-flows-questions.md`, or "none".

Do not summarize work that was not completed. If you stopped at the design-question gate, say so explicitly and show the contents of `picks-flows-questions.md`.
