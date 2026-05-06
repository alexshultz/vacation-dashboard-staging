# Code Review: wishlist.html stale data fix

You are a cold code reviewer with no session context. Review the changes below and return a verdict.

## What was supposed to happen

Fix wishlist.html rendering blank when picks exist in localStorage. Root cause: hardcoded ATTRACTIONS_DATA snapshot (~3500 lines) was stale -- slugs from data.json that weren't in the snapshot caused slugToAttr() to silently return null, buildCard() was never called, and the page rendered blank with no error.

Changes lazlo was authorized to make:
1. Replace the hardcoded ATTRACTIONS_DATA array in wishlist.html with a runtime fetch('data.json') -- same pattern as attractions.html and quick-pick.html
2. Add a new Playwright regression test that proves the fix
3. Minor playwright.config.js update to allow BASE_URL env override for local testing

No CSS changes. No new visual elements. No other files.

## What to verify

1. wishlist.html no longer contains a hardcoded ATTRACTIONS_DATA array
2. wishlist.html now fetches data.json at runtime and builds a lookup map
3. The rendering logic (renderWishlist, slugToAttr, buildCard) wires correctly into the async fetch -- no race conditions where renders could fire before data is loaded
4. picks.onChange is wired inside the fetch .then() (not at top-level scope before data is available)
5. The existing renderWhoPrompt / renderWishlist / empty-state logic is intact and unchanged
6. New Playwright test: correctly seeds localStorage, navigates to wishlist.html, asserts a card renders
7. playwright.config.js change is minimal and doesn't break the default staging URL
8. No out-of-scope files touched (CLAUDE.md, etc.)

## The diff

Run:
```
cd "/Users/alex/vaults/Vacation/Branson 2026" && git diff web/wishlist.html tests/e2e/tests/wishlist-blank-fix.spec.js tests/e2e/playwright.config.js
```

## Verdict format

- **PASS** -- all changes correct, nothing extra touched
- **WARN: [description]** -- changes are correct but something minor needs attention
- **FAIL: [description]** -- a required change is missing, incorrect, or a race condition / logic bug found

One line verdict first, then findings. Stop.
