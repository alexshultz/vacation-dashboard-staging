**Task Brief: Fix QuickPick Deck Shuffle in web/Activities.jsx**

---

**Role**
You are a precise React developer working on an in-browser Babel-transpiled React app (no bundler). You make surgical, minimal edits. You do not guess; you read the file before you write.

---

**Context**
Vault root: `/Users/alex/vaults/Vacation/Branson 2026/`
File to modify: `web/Activities.jsx`

This file is a Babel-standalone React component. Hooks are NOT imported from 'react'; they are destructured from the global `React` object at the top of the file. As of the current file, line 3 reads:

```js
const { useState: useStateAct, useMemo: useMemoAct } = React;
```

This means:
- `useState` is used as **`useStateAct`**
- `useMemo` is used as **`useMemoAct`**
- `useEffect` is **not** in the destructure — it is called as **`React.useEffect`** throughout the file (see line 105)

**Do not change the destructure line. Do not add useEffect to the destructure.** Match the existing hook-call conventions exactly.

---

**Bug**
In `QuickPickView`, the deck of activity cards is built with `useMemoAct` (lines 72–81):

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

React memoizes the result and only re-runs when `state.userId` changes. The Fisher-Yates shuffle inside the memo never fires on fresh component mounts or re-navigation -- the same 8 items appear every time until userId changes.

---

**Task — exactly three steps, nothing more**

**Step 1.** Read `web/Activities.jsx` in full before making any edit.

**Step 2.** In `QuickPickView`, replace the `useMemoAct` deck block (lines 72–81 in the current file, beginning with `const deck = useMemoAct(` and ending with `}, [state.userId]);`) with:

```js
const [deck, setDeck] = useStateAct([]);
React.useEffect(() => {
  const unseen = window.BD_ACTIVITIES.filter(
    a => !a.wish.includes(state.userId) && !a.commit.includes(state.userId)
  );
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
  }
  setDeck(unseen.slice(0, 8));
}, [state.userId]);
```

The filter logic and Fisher-Yates shuffle are **identical** to the original. Only the wrapping mechanism changes: `useMemoAct` → `useStateAct` + `React.useEffect`.

**Step 3.** Verify the edited file by reading it back. Confirm:
- The `useMemoAct` call for `deck` is gone.
- The `useStateAct([])` initialization and the `React.useEffect` block are present and syntactically correct.
- No other lines were changed.
- `useMemoAct` is still imported in line 3 (it may be unused now -- that is acceptable; do not remove it).

---

**Constraints**
- Modify **only** `web/Activities.jsx`. No other file.
- No UI changes. No logic changes beyond the wrapping mechanism.
- Do not add `useEffect` to the destructure on line 3.
- Do not remove `useMemo: useMemoAct` from line 3 even if it becomes unused.
- Do not run git, do not push, do not run any shell commands beyond reading and writing the file.
- Do not update `docs/PROJECT_LOG.md`, `docs/DECISIONS.md`, or any other log or tracking file.

---

**Output format**
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
