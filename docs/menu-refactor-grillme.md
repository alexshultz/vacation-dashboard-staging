# Menu Refactor — Handback Report

## 1. Files Modified

- **web/js/site.js** — Substantial refactor: Quick Pick added to NAV_LINKS (8 items); quick-pick.html alias removed from NAV_ALIASES; buildHeader() stripped to logo + hamburger + site-nav (profile and theme-toggle removed); buildHamburgerPanel() extended with hr separator, theme-toggle button, and profile link; hamburger-btn CSS changed from `display:none` + @media override to `display:flex; align-items:center` always-on; modeLabel() helper added; initial theme-toggle label set from localStorage immediately after panel injection; dark-mode click handler updated to set textContent after each cycle.
- **web/attractions.html** — Single line removed: the `<a class="qp-nav-btn">` Quick Pick shortcut in the filter-row.

---

## 2. Quality Gate Results

```
grep -c 'profile-btn' web/js/site.js
3   → PASS (>= 2)

grep -c 'site-theme-toggle' web/js/site.js
3   → PASS (>= 2)

grep -c 'quick-pick.html' web/js/site.js
1   → SEE FLAG BELOW

grep -c 'qp-nav-btn' web/attractions.html
0   → PASS (== 0)

grep -c 'hamburger-btn' web/js/site.js
3   → PASS (>= 3)

grep -c 'Quick Pick' web/js/site.js
1   → PASS (>= 1)
```

**Gate 3 discrepancy:** Expected >= 2, actual = 1. The gate comment read "(NAV_LINKS entry + removed/changed alias line)", implying the alias would persist in some form. However, Change 2 explicitly says: "remove the entry … Do NOT add a replacement entry." After removal, the only occurrence of `quick-pick.html` is the NAV_LINKS entry. The count of 1 is **correct per the Change 2 spec**. The expected value in the quality gate was written under the assumption the alias line would survive (modified or commented). It should be updated to `>= 1`.

---

## 3. Grill Me

**1. Why is the 'quick-pick.html' alias removed rather than changed to 'quick-pick.html': 'quick-pick.html'?**
With Quick Pick now a first-class NAV_LINKS item whose href is `quick-pick.html`, the active-link detection in `getActiveHref()` falls through to `NAV_ALIASES[pageFile] || pageFile`, which returns `pageFile` directly when no alias exists — a perfect match for the NAV_LINKS entry. An explicit self-alias is redundant and could mask bugs where the alias logic fires incorrectly. Removing it is the cleaner, less surprising path.

**2. What happens to the theme-toggle and profile-btn elements that were in buildHeader() — are they orphaned in the DOM?**
No. They are removed from the `buildHeader()` return string entirely — the variables `profileBtn` and `toggle` and their HTML are gone. The elements are re-created fresh inside `buildHamburgerPanel()` with the same `id` values. The old DOM nodes never exist; the new ones are injected as part of the panel string in the same `insertAdjacentHTML` call.

**3. Will syncBadge() break because profile-btn is now inside a panel that may be hidden?**
No. `getElementById('profile-btn')` finds the element regardless of the visibility of its ancestor panel (`display:none`). The nudge dot toggling writes a class to the `<span>` inside the link; JS reads and writes on descendants of hidden elements work normally. The badge state will be correct and will apply correctly when the panel becomes visible.

**4. Could removing display:none + @media for hamburger-btn break desktop layouts?**
The hamburger-btn was already present in the header DOM at all breakpoints — it was only hidden visually on desktop via the `display:none` default. Making it `display:flex` always means it is now visible at all widths. This is intentional: the hamburger panel now houses the theme toggle and profile link, which must be reachable on desktop too. Any desktop stylesheet that relied on the button being invisible was relying on a behavior this task intentionally removes.

**5. Why is only line 53 of attractions.html removed and not the surrounding filter-row?**
The filter-row and filter-toggle-btn remain functional — the row still shows the Filter popover button. Only the Quick Pick shortcut link is removed because Quick Pick is now reachable directly from the hamburger panel nav. The task spec says remove that one line only, and removing more would change surrounding layout behavior not sanctioned by the brief.

---

## 4. Flags

**Gate 3 expected value is stale.** The quality gate for `quick-pick.html` says `>= 2` with the note "NAV_LINKS entry + removed/changed alias line." After Change 2 (full removal of the alias, no replacement), the correct expected value is `>= 1`. This should be updated if the gate is reused in a future session.

**`modeLabel()` placement:** The helper is defined immediately after `buildHamburgerPanel()`, before the inject block. This is the earliest point at which it is callable in the inject block (for setting the initial label). No forward-reference issue since it is a named function declaration — but it is written as a `function` statement (hoisted), so order is not actually critical. Noted for clarity.

**No other unused or redundant elements were observed** in the code regions touched by this task. The `isProfile` variable that was only used in `buildHeader()` before this change is now also used in `buildHamburgerPanel()`, so it remains fully load-bearing.
