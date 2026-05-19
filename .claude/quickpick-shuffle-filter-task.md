## TASK BRIEF — Branson 2026 Dashboard: QuickPick Shuffle + Filter Seen

**Target file:** `/Users/alex/vaults/Vacation/Branson 2026/web/Activities.jsx`

---

### 1. ROLE

You are a senior React engineer making a precise, minimal surgical edit to a single file. You write exactly what is asked, touch nothing else, and leave all surrounding code byte-for-byte identical.

---

### 2. TASK

Make exactly two logic changes inside the `QuickPickView` component in `web/Activities.jsx`:

1. **FILTER SEEN** — Before building the deck, exclude every activity the current user has already acted on: any activity where `activity.wish.includes(state.userId)` **or** `activity.commit.includes(state.userId)`.
2. **SHUFFLE** — After filtering, apply an in-place Fisher-Yates shuffle to the filtered array, then slice to the deck size (8). The shuffle must run every time the deck is memoized (i.e., every time `state.userId` changes, which covers init and reset).

---

### 3. CONTEXT

The codebase is a React app loaded via Babel standalone (no bundler). State is managed through `window.__appState` and `Shell.jsx`'s `appReducer`. Each activity object carries:

- `activity.wish` — `string[]` of user IDs who wishlisted it
- `activity.commit` — `string[]` of user IDs who committed to it
- The current user's ID is `state.userId`

The exact target is the `useMemoAct` block at lines 72–74 of `Activities.jsx`:

```js
// CURRENT (before your edit):
const deck = useMemoAct(() => {
  return window.BD_ACTIVITIES.filter(a => !a.wish.includes(state.userId)).slice(0, 8);
}, [state.userId]);
```

This is the **only** location where the deck is built. The shuffle and filter must be applied here — not elsewhere.

---

### 4. INSTRUCTIONS

**Step 1 — Read the file.**
Open `/Users/alex/vaults/Vacation/Branson 2026/web/Activities.jsx` and verify lines 72–74 match the current code shown above. Confirm before editing.

**Step 2 — Apply the patch.**
Replace only the `useMemoAct` block (lines 72–74). The replacement is:

```js
const deck = useMemoAct(() => {
  const unseen = window.BD_ACTIVITIES.filter(
    a => !a.wish.includes(state.userId) && !a.commit.includes(state.userId)
  );
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
  }
  return unseen.slice(0, 8);
}, [state.userId]);
```

**Step 3 — Verify scope.**
Confirm that:
- No line outside the replaced block was changed.
- `Shell.jsx`, `Cards.jsx`, and all other JSX files are unmodified.
- No HTML files were touched.
- No new imports were added (none are needed).

**Step 4 — Verify correctness.**
Read back the edited block and confirm:
- The filter excludes both `wish` and `commit` for `state.userId`.
- The Fisher-Yates loop runs `i` from `unseen.length - 1` down to `1` inclusive.
- The swap uses destructuring: `[unseen[i], unseen[j]] = [unseen[j], unseen[i]]`.
- `.slice(0, 8)` is called on the already-shuffled array.
- The `useMemoAct` dependency array remains `[state.userId]`.

---

### 5. OUTPUT FORMAT

Make the edit using your file-editing tools. Do not print the whole file. Do not summarize the diff. Do not add commentary during execution.

---

### 6. EXAMPLES

**Before (current code):**
```js
const deck = useMemoAct(() => {
  return window.BD_ACTIVITIES.filter(a => !a.wish.includes(state.userId)).slice(0, 8);
}, [state.userId]);
```

**After (correct result):**
```js
const deck = useMemoAct(() => {
  const unseen = window.BD_ACTIVITIES.filter(
    a => !a.wish.includes(state.userId) && !a.commit.includes(state.userId)
  );
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
  }
  return unseen.slice(0, 8);
}, [state.userId]);
```

---

### 7. CONSTRAINTS

- **Only modify `web/Activities.jsx`.** Do not touch `Shell.jsx`, `Cards.jsx`, any other JSX file, any HTML file, or any data/script file.
- **Do not add imports, new state variables, new hooks, or new helper functions.** All changes are inside the existing `useMemoAct` callback.
- **Do not mutate `window.BD_ACTIVITIES`.** Assign the `.filter()` result to a local `const unseen` and shuffle that local copy.
- **Do not change the deck size constant (8)** or any UI logic.
- **Do not change the `useMemoAct` dependency array** — it stays `[state.userId]`.
- **Do not run git, do not push, do not update logs.**
- **Do not run `generate_dashboard.py` or `generate_attractions.py`** — both are permanently frozen and destructive.

---

When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
