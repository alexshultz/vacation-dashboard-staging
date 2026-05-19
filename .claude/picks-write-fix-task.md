## TASK BRIEF — Fix Supabase picks write/delete in web/Shell.jsx

**Target file:** `/Users/alex/vaults/Vacation/Branson 2026/web/Shell.jsx`

---

### Role

You are a precise JavaScript developer fixing Supabase JS v2 API call syntax in a single file. Read the file first, make the exact changes listed, verify each one, stop.

---

### Background

The Branson '26 dashboard stores wishlist/commit picks in a Supabase `picks` table (columns: `id`, `user_id`, `slug`, `state`). The app uses Supabase JS v2 CDN client. Two bugs exist in the current Shell.jsx:

**Bug 1 — `.delete().match()` is deprecated in Supabase JS v2.**
The current delete calls use:
```js
window.BD_SUPABASE.from('picks').delete().match({ user_id: uid, slug: a.id });
```
In Supabase JS v2, `.match()` on delete was deprecated and may silently fail or delete nothing. The correct v2 syntax is chained `.eq()` calls:
```js
window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id);
```

**Bug 2 — Supabase call errors are silently swallowed.**
All four Supabase calls (2x upsert, 2x delete) fire without any error handling. If any call fails (wrong syntax, RLS policy issue, network error), there is zero feedback. Add `.then(function(r){ if(r.error) console.error('picks error:', r.error, {user_id: uid, slug: a.id}); })` to every call so failures surface in the browser console.

---

### Task — exactly these changes, nothing else

Read `web/Shell.jsx` in full first. Find all four Supabase calls inside `toggleWish` and `toggleCommit`. Apply:

**Change 1 — toggleWish delete (currently uses `.match()`):**

Before:
```js
window.BD_SUPABASE.from('picks').delete().match({ user_id: uid, slug: a.id });
```

After:
```js
window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
  .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
```

**Change 2 — toggleWish upsert (currently has onConflict but no error handling):**

Before:
```js
window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' });
```

After:
```js
window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' })
  .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
```

**Change 3 — toggleCommit delete (currently uses `.match()`):**

Before:
```js
window.BD_SUPABASE.from('picks').delete().match({ user_id: uid, slug: a.id });
```

After:
```js
window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
  .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
```

**Change 4 — toggleCommit upsert:**

Before:
```js
window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'committing' }, { onConflict: 'user_id,slug' });
```

After:
```js
window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'committing' }, { onConflict: 'user_id,slug' })
  .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
```

---

### Verification

After editing, read the file back and confirm:
- All four Supabase calls have `.then(function(r){...})` error handlers.
- Zero `.match({` calls remain anywhere in the file.
- No other lines were changed.

---

### Constraints

- Modify **only** `web/Shell.jsx`.
- Do not modify any other file.
- Do not change UI logic, state logic, or any non-Supabase code.
- Do not run git, do not push, do not update logs.

---

When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
