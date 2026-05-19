# Task: toggleWish must not delete a committed picks row

## Background

`Shell.jsx` has a `toggleWish` reducer case (lines 36–55). When the user removes an item from their wishlist, the else branch (lines 50–52) calls `.delete()` on the Supabase picks row unconditionally.

**Bug:** If the item is currently committed (`state: 'committing'` in Supabase), the delete wipes the commit entirely. After a hard reload, the item is gone from both wishlist and commits.

**Reproduction:**
1. Commit to an activity (it is auto-wishlisted)
2. Unwishlist it (toggle the wishlist button off)
3. Hard reload
4. Item is missing from commits -- it should have stayed committed

## Root cause (confirmed by reading Shell.jsx lines 50–52)

```js
// CURRENT (buggy):
} else {
  window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
    .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
}
```

This deletes the row regardless of whether the user is committed. The fix: check `a.commit.includes(state.userId)` before deciding to delete or downgrade.

## Fix

In the `toggleWish` else branch, replace the unconditional delete with a conditional:

```js
// CORRECT:
} else {
  if (a.commit.includes(state.userId)) {
    // Item is committed -- preserve commit state in Supabase, just remove from wish UI
    window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'committing' }, { onConflict: 'user_id,slug' })
      .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
  } else {
    // Item is wishlist-only -- safe to delete row entirely
    window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
      .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
  }
}
```

## Rules

1. Read CLAUDE.md before making any change.
2. Modify ONLY `web/Shell.jsx`. No other files.
3. Do not run generate_dashboard.py or generate_attractions.py.
4. Do not reformat, rename, or restructure any code outside the changed lines.
5. Do not commit or push -- Hermes handles deploy.

## Acceptance criteria

- [ ] AC-1: Unwishlisting a committed item preserves `state: 'committing'` in Supabase (upsert, not delete)
- [ ] AC-2: Unwishlisting a wishlist-only item still deletes the row entirely
- [ ] AC-3: After unwishlist committed item + hard reload, item still appears in commits
- [ ] AC-4: `git diff --name-only` shows exactly `web/Shell.jsx` -- no other files modified
- [ ] AC-5: Handback includes unified diff

## Handback format

```
## Handback

### Diff
<unified diff>

### AC checklist
- [x/] AC-1 ...
- [x/] AC-2 ...
- [x/] AC-3 ...
- [x/] AC-4 ...
- [x/] AC-5 ...

### Files modified
- web/Shell.jsx

### Conflicts
<none or describe>
```
