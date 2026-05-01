# Task Brief: Enable Supabase Passkey Experimental Flag

**Project:** Branson 2026 Vacation Dashboard  
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`  
**Status:** Staging only — not yet shipped to production  
**Scope:** Single-line code change, one file only

---

## Background

The Supabase auth SDK throws the following error at runtime when passkey (WebAuthn / Face ID / Touch ID) registration is attempted:

> `@supabase/auth-js: the passkey API is experimental and disabled by default. Enable it by passing \`auth: { experimental: { passkey: true } }\` to createClient (or to the GoTrueClient constructor).`

The fix is to add an options object as a third argument to the existing `createClient` call in `web/admin.html`. No other changes are needed or permitted.

---

## Task Description

**File to modify:** `web/admin.html` (approximately line 202)  
**Change type:** Add one argument to an existing function call — nothing else.

### Before

```js
window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### After

```js
window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { experimental: { passkey: true } } })
```

That is the complete change. Do not reformat the line, adjust indentation beyond what is already present, or touch any surrounding code.

---

## Constraints

- **Modify `web/admin.html` only.** No other file in the project should be touched.
- **Touch only the `createClient` call on or near line 202.** Do not alter any other JavaScript expression, variable declaration, or function call in the file.
- **Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.**
- Do not add imports, `<script>` tags, comments, or any other code.
- Do not reorder or deduplicate any existing code.
- Do not run `git add`, `git commit`, `git push`, or any deployment command.

---

## Verify Your Work

After making the change, run the Playwright E2E suite to confirm nothing is broken:

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

**All tests must pass before submitting the handback report.**

> ⚠️ Note: Passkey registration itself (Face ID / Touch ID biometric flow) cannot be exercised in a headless browser environment. The test suite is not expected to cover that path. The tests verify that pages load correctly and that the auth gate behaves as expected. A green Playwright run is sufficient to confirm the change did not regress anything.

If any test fails that was passing before your change, investigate and resolve it before submitting. If you cannot resolve a failure, document it clearly in the handback report.

---

## Handback Report

When all code changes are complete: (1) List every file you modified with a one-line description. (2) Note any assumptions or judgment calls. (3) STOP. Do not commit, push, copy files, or update logs. Hermes handles all post-code orchestration.
