# Code Review: picks.js fixes + picks-flows.spec.js

You are a cold code reviewer. No session context.

## What was supposed to happen

Fix three bugs in the wishlist/picks system:
1. Supabase upsert failing with HTTP 409 -- missing `?on_conflict=user_id,slug` on POST URL
2. Quick Pick showing already-wishlisted items -- `window.picks` not set (const doesn't create window property), filter guard always short-circuits
3. Error banner firing on 409 -- should treat 409 as success not error

Files changed: `web/js/picks.js` and `tests/e2e/tests/picks-flows.spec.js` ONLY.

## Verify

1. POST URL gains `?on_conflict=user_id,slug` for non-null state writes
2. HTTP 409 is now treated as success (not thrown) -- banner still shows for other non-2xx errors
3. `window.picks = picks` assigned at module bottom -- filter guards in quick-pick.html can now resolve it
4. No other changes to picks.js logic
5. `picks-flows.spec.js` exists with 5 tests covering: QP write, QP filter, Activities write, cross-page, 409 degradation
6. Only the two permitted files were modified

## The diff

Run: `cd "/Users/alex/vaults/Vacation/Branson 2026" && git diff web/js/picks.js && git diff --stat tests/e2e/tests/picks-flows.spec.js`

## Verdict

- **PASS** -- all changes correct, nothing extra touched
- **WARN: [description]** -- changes correct but something minor to note
- **FAIL: [description]** -- logic error, missing fix, or out-of-scope change

One line verdict, then findings. Stop.
