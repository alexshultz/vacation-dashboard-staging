# Grill-Me: Admin Menu Visibility
*Generated: 2026-04-29 | Task: Wire Admin menu link into site.js so it appears and disappears dynamically based on who is logged in*

---

## Background

`buildHamburgerPanel()` already injects `<a href="admin.html">` when `localStorage.getItem(USER_KEY) === 'Alex'`. The bug: on the same tab where you pick your name on `profile.html`, the panel was already built before the name changed -- Admin link never shows until you navigate away and back. The fix: expose `window.vacdashRebuildHamburger()` from `site.js` and have `profile.html` call it after `setUser()`. This grill surfaces the edge cases and one real open design question before code is written.

---

**1. On a wide browser (nav-fits active), the hamburger button is hidden and the panel never opens. Alex has no path to Admin from a desktop-width browser. Is this acceptable, or should Admin also appear in the full desktop nav?**

The proposed approach adds the Admin link to the hamburger panel only. At ≥960px (`nav-fits` active), the hamburger is hidden via CSS and the panel is locked with `display: none !important`. No Admin link appears anywhere in the desktop nav. Alex is the only admin. If he primarily uses the site on a phone or narrow browser, this is fine. If he uses a laptop at any point, Admin is unreachable until he narrows the browser or switches devices.

Two options: (a) Accept it -- Admin is hamburger-only. Alex goes mobile or pinches to narrow to access it. Simple. (b) Add Admin link to `.site-nav` desktop nav, conditionally injected when `vacdash:v1:user` is in `ADMIN_USERS`. More code, more surface.

My answer: Option (a). Admin is a management screen used rarely. Adding it to the desktop nav adds complexity for a screen accessed a handful of times per trip. If Alex hits this and wants it, it is a one-line addition.

Alex's Thoughts: In the overall grand scheme of things, it is a seldom used screen. However, when I need it, I need it, so I need to have a way to get to the menu.


---

2. `ADMIN_USERS = ['Alex']` is a plain-text constant in client-side JS. Anyone who opens DevTools can read it. Acceptable for this app?

This does not grant access to anything. `admin.html` still requires the passcode (3141). Knowing that "Alex" is the admin username reveals nothing a user could not guess from the name dropdown. The `ADMIN_USERS` list is a cosmetic guard for menu visibility only.

My answer: Acceptable. Family vacation dashboard, not a banking app. The real gate is the passcode.

Alex's Thoughts:

---

3. Clearing your name (setting it back to empty) should remove the Admin link immediately in the same tab. Is this the expected behavior?

When `setUser('')` fires, `rebuildHamburger()` runs, checks `ADMIN_USERS.includes(currentUser)`, finds no match, and rebuilds the panel without the Admin link. Happens immediately, no reload. The proposed approach handles this automatically -- just confirming it matches expectations.

My answer: Yes. Correct and intentional. No action needed.

Alex's Thoughts:

---

4. Should `admin.html` be added to `NAV_ALIASES` in `site.js`?

`NAV_ALIASES` maps sub-pages to their parent nav item so `aria-current="page"` highlights the right nav link. `admin.html` is not a normal nav destination -- it is injected directly into the hamburger panel and absent from `NAV_LINKS`. Leaving it out of `NAV_ALIASES` means visiting `admin.html` lights up nothing in the nav, which is correct for a hidden admin page.

My answer: No. Leave `admin.html` out of `NAV_ALIASES`. No mismatch occurs.

Alex's Thoughts:

---

5. `rebuildHamburger()` will be called from `profile.html`. If `nav-fits` is active at that moment (wide browser), does rebuilding a hidden panel cause any problem?

If the user is on `profile.html` at wide width, `nav-fits` is set and the panel is hidden via `display: none !important`. Calling `rebuildHamburger()` replaces the panel's DOM content and re-attaches the `#site-theme-toggle` handler. The panel stays hidden -- nothing visible changes. The rebuilt content is correct and ready for when the user narrows the browser or switches to mobile.

My answer: No problem. DOM rebuild is invisible when panel is hidden. Safe.

Alex's Thoughts:

---

6. Case sensitivity: what if someone sets the user value to "alex" instead of "Alex"?

The name in `vacdash:v1:user` is set by a dropdown on `profile.html`, not a free-text input. "Alex" is a fixed option in that dropdown. Users cannot type an arbitrary string through the normal UI. The value is always the exact dropdown string. `ADMIN_USERS.includes()` is case-sensitive, but the dropdown enforces the exact case.

If someone manually calls `localStorage.setItem('vacdash:v1:user', 'alex')` via DevTools, the Admin link will not appear. This is fine -- no legitimate user reaches that state through the app.

My answer: Non-issue. No defensive lowercasing needed. Dropdown enforces the match.

Alex's Thoughts:

---

**7. Future admin users (Ashlyn, etc.) -- should they share the same passcode (3141) or get per-user codes? Flagging this now even though it is deferred.**

Adding Ashlyn to `ADMIN_USERS` is trivial. But `admin.html` has a single hardcoded passcode. If Ashlyn gets admin access, she gets 3141. Per-user passcodes would require changes to `admin.html` that are out of scope for this task.

My answer: Defer. Keep single passcode for now. If Ashlyn is ever granted access, she gets the same code. Per-user codes are a separate task if the need arises. Flagged here so the decision is on record.

Alex's Thoughts: I'd prefer everyone to have their own number, but I guess I would need a way to change that as well, so if someone forgot their number, I could fix it for them.


---

**8. Should the Admin link in the hamburger panel have a visual marker (lock icon, different styling) to distinguish it from regular nav items?**

Currently all hamburger panel links render with the same style. A lock icon (🔒) or a subtle color/weight difference on the Admin link would signal it is a privileged item. The alternative is plain "Admin" text with no visual treatment -- identical to other links.

My answer: No visual marker. Alex is the only person who ever sees this link. He knows what it is. A lock icon adds visual noise for no practical benefit. If multiple admins are ever added, revisit.

Alex's Thoughts: No need for a visual monitor at all, I agree.

---

9. Does rebuilding the hamburger panel on `profile.html` produce any visible flash or layout jump?

`rebuildHamburger()` replaces `#hamburger-panel` innerHTML and re-attaches the theme toggle handler. The panel is `position: fixed` and is closed (off-screen) when the rebuild fires -- it only opens on hamburger-button tap. No visible content is painted or repainted. The theme-toggle label is reset from stored mode immediately.

My answer: No flash. The panel is never visible at the moment of rebuild. Safe.

Alex's Thoughts:

---

## Ready to Proceed

**Approved defaults (assuming no overrides above):**
- Admin link lives in hamburger panel only. Not in desktop nav.
- `ADMIN_USERS = ['Alex']` -- single constant, extendable array.
- `window.vacdashRebuildHamburger()` exposed from `site.js`. Called from `profile.html` after `setUser()`.
- No visual differentiation on Admin link.
- `admin.html` unchanged. Passcode gate stays as-is.
- `admin.html` stays out of `NAV_ALIASES`.

**Files changed:** `web/js/site.js`, `web/profile.html`

**Files NOT changed:** `web/admin.html`, all other HTML/CSS files

**Exact additions to `site.js`:**
1. `ADMIN_USERS = ['Alex']` constant alongside `USER_KEY`
2. Replace `=== 'Alex'` check in panel build logic with `ADMIN_USERS.includes(currentUser)`
3. Expose `window.vacdashRebuildHamburger()` that rebuilds `#hamburger-panel` innerHTML and re-attaches `#site-theme-toggle` click handler with correct label from stored mode

**Exact addition to `profile.html`:**
- After `setUser(name)` completes: `if (typeof window.vacdashRebuildHamburger === 'function') window.vacdashRebuildHamburger();`

---

## Alex's Thoughts

*(Leave blank = full approval. Write anything to flag for discussion.)*

---

*Vacation, 2026-04-29*
