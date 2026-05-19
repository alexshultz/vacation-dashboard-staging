# Task: Fix wishlist/commit independence -- full state matrix + Playwright tests

## Background and root cause

Wish and commit are intended to be completely independent states. A user can be in any combination:
- Neither (no row in Supabase)
- Wishlist only (`state: 'wishlist'`)
- Commit only (`state: 'committing'`)
- Both wishlist AND commit (currently: NO REPRESENTATION -- this is the bug)

The Supabase `picks` table has a single `state` TEXT column. When both wish and commit are active, whichever write fires LAST overwrites the other. Example:

1. User wishlists → upsert `state='wishlist'`
2. User commits → upsert `state='committing'` ← OVERWRITES the wishlist state
3. Reload → hydration sees only `committing` → wish is lost

And vice versa (wishlist write after commit wipes the commit).

## Required fix

Introduce a fourth state value `'both'` meaning "wishlisted AND committed."

### State transitions (write-back logic in Shell.jsx)

**toggleWish ADD** (was not wishlisted, now is):
- If currently committed: upsert `state='both'`
- If not committed: upsert `state='wishlist'`

**toggleWish REMOVE** (was wishlisted, now is not):
- If currently committed: upsert `state='committing'` (preserve commit)
- If not committed: delete row entirely

**toggleCommit ADD** (was not committed, now is):
- If currently wishlisted: upsert `state='both'`
- If not wishlisted: upsert `state='committing'`

**toggleCommit REMOVE** (was committed, now is not):
- If currently wishlisted: upsert `state='wishlist'` (preserve wishlist)
- If not wishlisted: delete row entirely

### Hydration logic in loader.js

```js
if (pick.state === 'wishlist') {
    activity.wish.push(userId);
} else if (pick.state === 'committing') {
    activity.commit.push(userId);
} else if (pick.state === 'both') {
    activity.wish.push(userId);
    activity.commit.push(userId);
}
```

### Supabase CHECK constraint

Before writing `state='both'`, verify whether a CHECK constraint exists:

```js
// Test: attempt to upsert state='both' for a test row and check for error
// If error contains 'check' or 'constraint', the constraint must be dropped first
```

If a constraint exists, use the Supabase Management API to alter the table:
```
ALTER TABLE picks DROP CONSTRAINT IF EXISTS picks_state_check;
```

The PAT for DDL migrations is NOT in the vacation-coordinator .env. If needed, read:
`/Users/alex/vaults/Vacation/Branson 2026/docs/PROJECT-STATE.md` for credential location guidance,
or flag in the handback report that DDL access was needed and describe what you found.

Alternatively: if the constraint blocks 'both', use `state='wish+commit'` or any other string
that passes -- the exact string value doesn't matter as long as hydration and write-back agree.

## Files to modify

- `web/Shell.jsx` -- toggleWish and toggleCommit write-back logic
- `web/loader.js` -- hydratePicks function
- `tests/e2e/tests/picks-state-matrix.spec.js` -- NEW test file (see below)

## Test file: picks-state-matrix.spec.js

Write a Playwright spec at `tests/e2e/tests/picks-state-matrix.spec.js` covering every
combination of wish/commit state with Supabase persistence. Tests must:

1. Set a user name in localStorage before each test
2. Tap the relevant UI controls to set state
3. Reload the page (hard reload via `page.reload()`)
4. Assert the correct state is shown in the UI

Do NOT write tests as Supabase API calls. Drive through the actual UI controls.

### Test cases required

```
TC-1: Wishlist only
  - Wishlist an activity
  - Hard reload
  - Assert: activity appears in wish list
  - Assert: activity does NOT appear in commit list

TC-2: Commit only (no prior wishlist)
  - Commit an activity (without wishlisting first)
  - Hard reload
  - Assert: activity appears in commit list
  - Assert: activity does NOT appear in wish list

TC-3: Wishlist then commit
  - Wishlist an activity
  - Then commit the same activity
  - Hard reload
  - Assert: activity appears in commit list
  - Assert: activity ALSO appears in wish list

TC-4: Commit then wishlist
  - Commit an activity
  - Then wishlist the same activity
  - Hard reload
  - Assert: activity appears in commit list
  - Assert: activity ALSO appears in wish list

TC-5: Wishlist + commit, then unwishlist
  - Wishlist an activity
  - Commit it
  - Unwishlist it
  - Hard reload
  - Assert: activity appears in commit list
  - Assert: activity does NOT appear in wish list

TC-6: Wishlist + commit, then uncommit
  - Wishlist an activity
  - Commit it
  - Uncommit it
  - Hard reload
  - Assert: activity appears in wish list
  - Assert: activity does NOT appear in commit list

TC-7: Wishlist only, then unwishlist
  - Wishlist an activity
  - Unwishlist it
  - Hard reload
  - Assert: activity does NOT appear in wish list
  - Assert: activity does NOT appear in commit list

TC-8: Commit only, then uncommit
  - Commit an activity
  - Uncommit it
  - Hard reload
  - Assert: activity does NOT appear in commit list
  - Assert: activity does NOT appear in wish list
```

### Test setup

- URL: `https://vacation-dev.creeperbomb.com`
- Set user via localStorage: `localStorage.setItem('bd-user', 'testuser')`
- Use a test activity slug that is unlikely to have real data: pick one visible activity
  from the Browse page (or hardcode a known slug from data.json like `silver-dollar-city`)
- After each test, clean up by deleting the test row from Supabase:
  ```js
  // Use window.BD_SUPABASE to delete: .from('picks').delete().eq('user_id','Testuser').eq('slug', slug)
  ```

### Finding UI controls

The SPA renders at `vacation-dev.creeperbomb.com`. The wish and commit controls are in
`web/Activities.jsx` and `web/Cards.jsx`. Read those files to find the correct
element selectors (button text, aria labels, or data attributes) before writing test assertions.

## Rules

1. Read CLAUDE.md before starting.
2. Write ALL test cases FIRST. Confirm they FAIL against current deployed code before fixing.
3. Then implement the fix. Then confirm all tests PASS.
4. Lazlo cannot self-verify Playwright -- note this in handback. Hermes will deploy to staging first, then run tests.
5. Do NOT modify any frozen files (generate_dashboard.py, generate_attractions.py).
6. Do NOT modify schedule.json, data.json, or people.json.
7. `git diff --name-only` must show only: `web/Shell.jsx`, `web/loader.js`, `tests/e2e/tests/picks-state-matrix.spec.js`

## Acceptance criteria

- [ ] AC-1: All 8 test cases written in picks-state-matrix.spec.js
- [ ] AC-2: Tests are confirmed to FAIL against current code (before fix)
- [ ] AC-3: toggleWish write-back uses correct state based on current commit state
- [ ] AC-4: toggleCommit write-back uses correct state based on current wish state
- [ ] AC-5: loader.js hydratePicks handles 'both' (or equivalent) state value
- [ ] AC-6: No auto-crossover: wishlisting never touches commit state, committing never touches wish state
- [ ] AC-7: `git diff --name-only` shows exactly the 3 expected files
- [ ] AC-8: If Supabase CHECK constraint blocked 'both', note the DDL applied in handback

## Handback format

```
## Handback

### Supabase constraint check result
<found constraint / no constraint found / constraint dropped via DDL>

### State value used for 'both'
<'both' or alternative string>

### Diff summary
<brief description of each file changed>

### AC checklist
- [x/] AC-1 ... AC-8

### Test run (attempted locally)
<Note: Lazlo cannot self-verify -- tests run against staging after Hermes deploys>

### Files modified
- web/Shell.jsx
- web/loader.js
- tests/e2e/tests/picks-state-matrix.spec.js

### Conflicts
<none or describe>
```
