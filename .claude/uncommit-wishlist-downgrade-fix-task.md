# Task Brief: Fix Uncommit → Wishlist Downgrade Bug in Shell.jsx
**Agent:** Lazlo  
**Vault:** Branson 2026  
**Date issued:** 2026-05-19  
**Estimated effort:** 1 edit, 2 lines changed

---

## 0. Mandatory pre-flight

Before writing a single character of code, read:

```
/Users/alex/vaults/Vacation/Branson 2026/CLAUDE.md
```

in full. If anything in this brief conflicts with a rule there, **flag the conflict explicitly before proceeding**. Completing the task includes the handback steps at the bottom of *this* file — they are not optional.

---

## 1. Working directory

```
/Users/alex/vaults/Vacation/Branson 2026
```

All paths below are relative to this root unless prefixed with `/`.

---

## 2. Bug description

### What happens

1. User is on the Branson 2026 dashboard. They have wishlisted an activity (row exists in Supabase `picks` table: `state = 'wishlist'`).
2. They then commit to that activity (row updated to `state = 'committing'`).
3. They change their mind and **uncommit** — clicking the commit toggle off.
4. **Bug:** The `toggleCommit` reducer branch for `addingCommit === false` calls `.delete()` on the Supabase `picks` row, removing it entirely from the database.
5. The in-memory UI optimistically keeps the item in the wish array (line 65 only removes from `a.commit`, not `a.wish`), so the UI *looks* correct.
6. On hard reload, `loader.js` finds no row for that slug and does not populate the wishlist. **The item silently disappears from the user's wishlist.**

### Root cause — exact lines

**File:** `web/Shell.jsx`  
**Lines 73–74** (inside the `toggleCommit` case, `else` branch):

```js
        } else {
          window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
            .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
        }
```

A `.delete()` here is semantically wrong. Uncommitting should **downgrade** the row to `state: 'wishlist'`, not erase it — because the user's wish intent is still active (the in-memory `a.wish` array still contains the userId after uncommit).

---

## 3. The fix — exactly one change

Replace the `.delete()` call on lines 73–74 with a `.upsert()` that writes `state: 'wishlist'`.

### Current code (lines 72–75, full context):

```js
        } else {
          window.BD_SUPABASE.from('picks').delete().eq('user_id', uid).eq('slug', a.id)
            .then(function(r){ if(r.error) console.error('picks delete error:', r.error, {user_id: uid, slug: a.id}); });
        }
```

### Replacement code:

```js
        } else {
          window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' })
            .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
        }
```

**What changed:**
- `.delete().eq('user_id', uid).eq('slug', a.id)` → `.upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' })`
- Error log label `'picks delete error:'` → `'picks upsert error:'` (consistent with all other upsert error labels in the file)

---

## 4. Context: what must NOT change

The following lines are correct and **must not be touched**:

| Lines | Case | Branch | Operation | Expected |
|-------|------|--------|-----------|----------|
| 51–52 | `toggleWish` | `addingWish === false` | `.delete()` | ✅ Correct — unwishlisting should fully remove the row |
| 48–49 | `toggleWish` | `addingWish === true` | `.upsert({ state: 'wishlist' })` | ✅ Correct |
| 70–71 | `toggleCommit` | `addingCommit === true` | `.upsert({ state: 'committing' })` | ✅ Correct |

Only lines 73–74 are wrong.

---

## 5. Full surrounding context for verification

After the fix, the entire `toggleCommit` Supabase block (lines 67–75) should read:

```js
      if (window.BD_SUPABASE && state.userId) {
        const uid = state.userId.charAt(0).toUpperCase() + state.userId.slice(1);
        if (addingCommit) {
          window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'committing' }, { onConflict: 'user_id,slug' })
            .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
        } else {
          window.BD_SUPABASE.from('picks').upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' })
            .then(function(r){ if(r.error) console.error('picks upsert error:', r.error, {user_id: uid, slug: a.id}); });
        }
      }
```

---

## 6. Acceptance criteria

All six must pass before handback.

- [ ] **AC-1 — Uncommit writes wishlist state:** The uncommit branch (`addingCommit === false`) calls `.upsert({ user_id: uid, slug: a.id, state: 'wishlist' }, { onConflict: 'user_id,slug' })`. There is no `.delete()` call in this branch.
- [ ] **AC-2 — Reload persistence:** After uncommitting an activity and hard-reloading the page, the item appears in the user's wishlist (loader.js will find a row with `state: 'wishlist'` and restore it).
- [ ] **AC-3 — Unwishlist delete path untouched:** Lines 51–52 (`toggleWish` else branch) still call `.delete()` — no change.
- [ ] **AC-4 — Commit upsert path untouched:** Lines 70–71 (`toggleCommit` if branch) still upsert `state: 'committing'` — no change.
- [ ] **AC-5 — Only Shell.jsx modified:** `git diff --name-only` shows exactly one file: `web/Shell.jsx`. No other file is modified.
- [ ] **AC-6 — Handback diff included:** The handback report includes the exact unified diff of the change (see Section 7).

---

## 7. Handback report (complete before responding)

Respond with **all** of the following:

### 7a. Unified diff

Paste the exact output of:

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
git diff web/Shell.jsx
```

### 7b. AC checklist

Copy the checklist from Section 6 and mark each item `[x]` (pass) or `[FAIL — reason]`.

### 7c. Files modified

List every file you wrote to. If it is not exactly `web/Shell.jsx` and nothing else, explain why.

### 7d. Conflict flag (if applicable)

If you found any conflict between this brief and `CLAUDE.md`, describe it here. If none, write: *No conflicts found.*

---

## 8. Guardrails

- **Do not run** `generate_dashboard.py` or `generate_attractions.py` — they are permanently frozen and will destroy hand-edited HTML.
- **Do not run** `export_data.py` — data files are not involved in this fix.
- **Do not modify** any HTML, CSS, JSON, or JS file other than `web/Shell.jsx`.
- **Do not add** `console.log` statements or debug scaffolding.
- **Do not reformat** the file — preserve existing whitespace, indentation (2-space), and quote style (single quotes).
- This fix requires **no tests, no build step, and no deploy** — editing the file is the complete task.
