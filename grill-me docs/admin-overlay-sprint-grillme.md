# Grill-Me: Admin Overlay Sprint

_Design Q&A for the admin-overlay sprint: site.js nav on admin.html, INITIAL_VISIBLE type-in, admin-overlay.js with event-timeline.html edit icons, and DECISIONS.md ADR additions._

---

## Q1: What are the closure risks when hoisting `renderCard()` from inside `render()` to module scope in event-timeline.html, and how should the hoist be done safely?

**Answer:** In `event-timeline.html` (the public family page), `renderCard()` is currently a `const` arrow function declared _inside_ `render()`. That means it closes over four variables defined in `render()`'s local scope: `maxDuration` (6), `yesStyle`, `warnStyle`, `noStyle`, and `nameCell`/`noneCell` (the two formatters). All six of these are pure constants — they don't read any mutable outer state. That makes the hoist safe, but you must move all six up to module scope alongside `renderCard()`. The admin version of the file (`admin-event-timeline.html`) has already done exactly this — `maxDuration`, the three style strings, `nameCell`, and `noneCell` are all declared at module level (lines 106–111). Follow that exact pattern.

There are no mutable-closure risks (no reference to `eventsData`, `allExpanded`, or any let variable that changes over time). The only thing `renderCard()` receives is the individual event object via its parameter — so once the six constants are module-scope, the function is completely self-contained.

**Testing the hoist didn't break render output:** The simplest approach is a before/after snapshot test. Before the hoist, load event-timeline.html in a browser with a fixed dataset (a small JSON fixture with 2–3 events), capture `document.getElementById('timeline-list').innerHTML`. After the hoist, load the same page with the same fixture and diff the two HTML strings. They should be character-identical. A Playwright test can automate this by setting `page.route('**/rest/v1/schedule_events**', ...)` to return the fixture, then asserting `timeline-list` innerHTML against a saved snapshot. Even without Playwright, a quick manual side-by-side in two browser tabs with the same fixture confirms correctness.

Alex's Thoughts:

---

## Q2: After changing `<span id="iv-value">` to `<input type="number" id="iv-value">`, what exactly needs updating in the existing button handlers and the Realtime subscription?

**Answer:** Three call sites currently read or write `iv-value` via `.textContent`. Each must switch to `.value`:

1. **Initial load (line 309):** `document.getElementById('iv-value').textContent = INITIAL_VISIBLE;` → change to `.value = INITIAL_VISIBLE;`
2. **Minus button handler (line 316):** `document.getElementById('iv-value').textContent = INITIAL_VISIBLE;` → `.value = INITIAL_VISIBLE;`
3. **Plus button handler (line 325):** Same swap.

The Realtime subscription handler (lines 337–341) does **not** touch the DOM at all — it reads `payload.new?.value`, updates the `INITIAL_VISIBLE` JS variable, and calls `applyVisibilityState(showingAll)`. That code is already correct and requires no change. However, once you add the new `input` event handler for typed input, that handler should also update the `INITIAL_VISIBLE` JS variable to keep the three consumers in sync.

**Debounce:** Add an `input` event listener on `#iv-value` that fires a debounced (~500 ms) upsert to Supabase `app_config`. The upsert body is identical to the +/- handlers: `{ key: 'initial_visible', value: String(INITIAL_VISIBLE) }`.

**Validation edge cases:**
- Empty string: `parseInt('', 10)` returns `NaN` — guard with `if (isNaN(parsed) || parsed < 1) return;` before upsert.
- Float typed in a `type="number"` input (e.g. "3.7"): the `min="1"` attribute covers UI but doesn't prevent programmatic access. Explicitly floor or reject non-integers: `if (!Number.isInteger(parsed)) return;`
- Zero or negative: `min="1"` on the input handles the UI; mirror that check in the event handler.
- Values larger than `eventsData.length`: technically valid (just shows all events), so no need to cap it — `applyVisibilityState` already handles this gracefully.
- Pasting a non-numeric string: `parseInt` returns `NaN`, caught by the `isNaN` guard.

Alex's Thoughts:

---

## Q3: Should the edit modal in admin-overlay.js include all 11 fields from admin-event-timeline.html, or is a subset more appropriate for in-context editing on the family page?

**Answer:** A subset of 5–6 scheduling fields is the right call for the family-page overlay. The full 11 fields in `admin-event-timeline.html` exist because that page is the **dedicated admin editing surface** — Alex navigates there intentionally to do deep edits. The overlay on `event-timeline.html` serves a different use case: Alex spots an error while viewing the family timeline (wrong time, wrong date, typo in title) and wants to fix it in three taps without leaving the page.

**Recommended subset for the overlay:**
1. `title` (most likely typo target)
2. `date`
3. `startTime`
4. `duration`
5. `priority`
6. `travelMinutes` (optional — include it if the form isn't already feeling crowded)

**What to omit:** `catalogRef`, `interested`, `undecided`, `notInterested`, `noResponse`. The attendance arrays are managed through the family voting UI — editing them in a freeform comma-separated text field on the overlay would be error-prone and inconsistent with the voting data model. `catalogRef` is an internal linking field that never needs a quick fix in context.

**Include a "Full edit →" escape hatch link** in the overlay footer that deep-links to `admin-event-timeline.html` with the event pre-selected (e.g. `admin-event-timeline.html#event-id-123` or a `?id=` query param if that page supports it). This avoids the need to cram all 11 fields into the overlay while giving Alex a path to full editing when needed.

Alex's Thoughts: I'm not sure if I understand this right, but here's what I want to have happen: If I click the edit button on any card anywhere, I want to see all the edit fields for that card. If I'm just viewing a card without using the edit button, I only want to see what I would normally see as if I weren't an admin. If a family member views the card, they shouldn't see the edit button at all, and they should not see any extra fields. They should only see the normal card.



---

## Q4: Should admin pages (admin.html, admin-index.html, admin-event-timeline.html) be added to `NAV_ALIASES` in site.js? Do they need an `ADMIN_USERS` guard, or does the session already cover that?

**Answer:** Admin pages should **not** be added to `NAV_ALIASES`. `NAV_ALIASES` exists to map sub-pages to a **parent nav item** so that the correct desktop nav link and bottom tab get `aria-current="page"` highlighted. Admin pages have no parent in the main nav — they're outside the normal navigation tree. Adding them to `NAV_ALIASES` would force one of the 8 main nav items to light up when on an admin page, which is misleading.

The only thing admin pages need from site.js is the nav bar injection itself (header, hamburger, bottom tabs), so that the logo link and "Home" link exist. That happens automatically as soon as `<script src="js/site.js"></script>` is the first child of `<body>` — no `NAV_ALIASES` entry is needed.

**On the ADMIN_USERS guard:** site.js already conditionally renders the "⚙️ Admin" link in both the desktop nav and the hamburger panel, gated on `localStorage.getItem('vacdash:v1:user')` being in the `ADMIN_USERS` array. This is a **display-only gate** — it controls whether the admin link is visible, not whether the pages are accessible. The real access gate is the Supabase session check on each admin page (`getSession()` → redirect to admin.html if null). For `admin.html` itself (the login page), no session gate is needed — it must be reachable unauthenticated.

**Bottom line:** Add only `<script src="js/site.js"></script>` to admin pages. No `NAV_ALIASES` entry, no additional guards.

Alex's Thoughts:

---

## Q5: What is the exact SQL to tighten the `schedule_events` RLS write policy to Alex's UID only? Is it safe to run on staging before production?

**Answer:** Get Alex's UID from the Supabase Dashboard → Authentication → Users. Then run:

```sql
-- Drop the current permissive write policy (name may vary — check Dashboard → Authentication → Policies)
DROP POLICY IF EXISTS "Allow authenticated upsert" ON schedule_events;
DROP POLICY IF EXISTS "Authenticated users can upsert" ON schedule_events;

-- Tighten: read is public (anon key), write is Alex-UID only
CREATE POLICY "Alex-only write on schedule_events"
  ON schedule_events
  FOR ALL          -- covers INSERT, UPDATE, DELETE, UPSERT
  USING (
    auth.role() = 'anon'                          -- anon can SELECT
    OR auth.uid() = 'REPLACE_WITH_ALEX_UID'       -- Alex can do everything
  )
  WITH CHECK (
    auth.uid() = 'REPLACE_WITH_ALEX_UID'          -- writes only from Alex
  );
```

If reads and writes need to be separated cleanly:

```sql
-- Read policy (all users including anon)
CREATE POLICY "Public read on schedule_events"
  ON schedule_events FOR SELECT
  USING (true);

-- Write policy (Alex UID only)
CREATE POLICY "Alex-only write on schedule_events"
  ON schedule_events FOR ALL
  USING (auth.uid() = 'REPLACE_WITH_ALEX_UID')
  WITH CHECK (auth.uid() = 'REPLACE_WITH_ALEX_UID');
```

Per ADR-005's idempotency rule: always use `DROP POLICY IF EXISTS` before `CREATE POLICY`.

**Safe to run on staging first?** Yes. The staging risk is zero additional harm — if staging is already running with a permissive policy, tightening it on staging proves the SQL is correct and that the session-authenticated overlay save path still works end-to-end. Run on staging, verify the overlay save succeeds with a valid Alex session and fails with an anon request, then promote the same SQL to production. Do not ship the overlay feature to production without this policy in place — that's the explicit pre-ship gate noted in the sprint scope.

Alex's Thoughts: 8d266838-80da-406d-98cb-97387394b564

---

## Q6: Where exactly should the "Admin session active — Sign Out" badge live on screen? Fixed top-right? What should it look like?

**Answer:** Fixed-position, top-right, vertically centered in the header zone (roughly `top: 14px; right: 16px`). This is the same corner as the hamburger button at narrow widths, so it needs a high but non-conflicting `z-index` (e.g. `z-index: 500` — below `#hamburger-panel` at `z-index: 999`). On wide layouts where `body.nav-fits` is active and the full nav is visible, top-right is clear of the hamburger button (which is hidden) but near the profile/admin nav links — that's fine for an info badge.

**Recommended style:** A small pill with a warm amber or warning-red background to signal "elevated privilege active." Using design tokens: `background: var(--warn)` or a dedicated `--status-admin` token if you want to avoid coupling to the existing warn token. White or `--color-bg` text. Bold. Compact: `padding: 6px 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700`. Include a small lock or gear emoji prefix (🔒 or ⚙️) so it's scannable at a glance.

```css
#admin-session-badge {
  position: fixed;
  top: 14px;
  right: 16px;
  z-index: 500;
  background: var(--warn);
  color: #fff;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: none;               /* hidden by default */
  font-family: var(--font-display);
  box-shadow: var(--shadow-2);
}
body.is-admin #admin-session-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

The badge text: `"🔒 Admin — Sign Out"`. Keep it short. On click: call `supabase.auth.signOut()` and remove `body.is-admin` (or let the `onAuthStateChange` handler remove it automatically). No confirmation dialog needed for the same reason as Q6 in the email-auth grillme — signing back in is instant on a personal tool.

Alex's Thoughts: If the only place to log in as an admin is by going somewhere special, then that should be the same place you have to go to log out. 
I'm not sure if that answers the question.

---

## Q7: How do we mock a Supabase session in headless Playwright? Is it feasible for this project, and what's the recommended approach?

**Answer:** Feasible, and there are three approaches in order of preference for this project:

**Approach A — `page.route()` network interception (recommended):**
Playwright's `page.route()` intercepts fetch calls before they hit the network. Intercept the Supabase auth endpoint and `onAuthStateChange` trigger to return a canned session response:

```js
await page.route('**/auth/v1/token**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: 'fake-jwt',
      token_type: 'bearer',
      user: { id: 'alex-uid', email: 'alex@example.com' }
    })
  });
});
```

Also stub `**/auth/v1/user` to return the same user object. This works at the fetch layer, so `supabase.auth.getSession()` sees a valid session without touching real Supabase. Requires stubbing all relevant Supabase REST endpoints the page calls on load as well.

**Approach B — `storageState` / localStorage injection:**
Playwright's `browserContext.addInitScript()` or `page.evaluate()` can seed `localStorage` before any page JS runs. The Supabase JS SDK stores the active session in `localStorage` under a key like `sb-{project-ref}-auth-token`. Inject a properly-shaped JSON blob:

```js
await page.addInitScript(() => {
  localStorage.setItem('sb-quebfbvfuwbncpexlylu-auth-token', JSON.stringify({
    access_token: 'fake-jwt',
    refresh_token: 'fake-refresh',
    user: { id: 'alex-uid', email: 'alex@example.com' },
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }));
});
```

Simpler than network interception, but fragile if Supabase SDK's storage key format changes. For a project on a locked `@supabase/supabase-js@2` CDN version this is low-risk.

**Approach C — real auth in CI:**
Use a dedicated test user account in Supabase with a known email/password and call `signInWithPassword` in `beforeAll`. Requires a real network connection and Supabase project access in CI, but tests the full auth stack. Appropriate for production-gate smoke tests; too heavy for fast unit-style overlay tests.

**For this project:** The E2E suite currently has zero spec files. Start with **Approach B** (localStorage injection) for the `body.is-admin` class tests and pencil-button visibility tests — it's the least plumbing for the most value. Reserve Approach A for the actual save-to-Supabase flow test. No CI setup currently exists, so Approach C is out of scope for this sprint.

Alex's Thoughts:

---

## Q8: The `parseFloat()` / `parseInt()` bug in admin-event-timeline.html — what's wrong and what exactly should the fix be?

**Answer:** On line 268 of `admin-event-timeline.html`:

```js
const duration = parseInt(document.getElementById('ef-duration').value, 10);
```

`duration` maps to a `NUMERIC` column in Supabase (not `INTEGER`). `parseInt` truncates `1.5` to `1`, `2.5` to `2`, etc. Events can have half-hour durations (e.g. 1.5h), so this silently corrupts any duration that isn't a whole number. The fix is:

```js
const duration = parseFloat(document.getElementById('ef-duration').value);
```

`parseFloat('1.5')` → `1.5`. `parseFloat('2')` → `2`. Both are valid NUMERIC values. The change also applies to any counterpart logic in the new `admin-overlay.js` modal — if `duration` is one of the included fields, use `parseFloat` there from the start.

Note that `travelMinutes` (line 269) uses `parseInt` correctly — that column is a whole-minute integer and `parseInt` is right for it.

Alex's Thoughts:

---

## Q9: admin-overlay.js creates its own Supabase client. Could having multiple `supabase.createClient()` calls on the same page (one in event-timeline.html's inline script, one in admin-overlay.js) cause conflicts?

**Answer:** No conflicts, but it's worth understanding why. The Supabase JS SDK v2 uses a shared `localStorage` key (`sb-{project-ref}-auth-token`) for session persistence. Two `createClient()` calls with identical URL + anon key will both read from the same localStorage slot, so both clients see the same session. There is no "double subscription" risk for the auth state itself — each client instance is independent but reads the same backing store.

The only real risk is **duplicate Realtime subscriptions**. If both scripts subscribe to the same Realtime channel, you'd get duplicate event handlers firing. Prevent this by ensuring admin-overlay.js creates its Realtime subscriptions on a uniquely named channel (`admin-overlay:auth` rather than reusing a generic channel name), and that event-timeline.html's inline script does not subscribe to any auth channels — it only reads schedule_events for the data fetch.

**Preferred pattern:** admin-overlay.js is the only code that creates a Supabase client for auth purposes on event-timeline.html. If event-timeline.html's inline script currently uses `window.supabase.createClient(...)` for data fetching, that's fine — it's a read-only REST call, not a persistent subscription. The two clients do not conflict.

Alex's Thoughts:

---

## Q10: What format do existing ADRs use in DECISIONS.md, and how should ADR-010, ADR-011, and ADR-012 be structured?

**Answer:** All nine existing ADRs follow a consistent ADR-lite format:

```
## ADR-NNN · Title (YYYY-MM-DD) [optional: SUPERSEDED tag]

**Decision:** One sentence or short paragraph stating what was decided.

**Context:** (optional but common) Why this decision needed to be made; what situation or bug prompted it.

**Why:** The rationale — what alternatives were considered and rejected, or why this option was chosen.

**Consequences:** Practical impact on the codebase: new rules, files affected, what must never happen, follow-on requirements.
```

Some ADRs include additional subsections (`**Alternatives considered:**`, `**Affects:**`, `**Rule:**`). Most don't. The separator is `---` between entries. Entries are append-only at the bottom.

**Suggested structure for the three new ADRs:**

**ADR-010 · Supabase session as conditional admin display gate** — Decision: `onAuthStateChange` in `admin-overlay.js` adds/removes `body.is-admin` which CSS uses to show/hide edit controls site-wide. Why: avoids duplicating auth checks across pages; the class is the single gate for all admin-only UI. Consequences: any future admin-only element needs only the `.is-admin` CSS rule — no new JS auth check.

**ADR-011 · admin-overlay.js as canonical pattern for inline admin editing** — Decision: Admin editing on public-facing pages is handled exclusively by `admin-overlay.js` via event delegation on `document`. No per-page edit logic. Why: one auth listener, one modal, one save path — eliminates drift between pages. Consequences: future pages that need inline admin editing add `<script src="js/admin-overlay.js"></script>` and the `.admin-edit-btn[data-event-id]` button; no page-specific JS.

**ADR-012 · Q14a (attendance editing on family page) explicitly deferred** — Decision: The attendance arrays (`interested`, `undecided`, `notInterested`, `noResponse`) are not included in the admin-overlay.js edit modal for `event-timeline.html`. Why: they are managed by the voting UI; editing via freeform comma-separated text on the overlay risks data inconsistency. The inconsistency between `admin-event-timeline.html` (which shows all 11 fields) and the overlay (5–6 fields) is acknowledged and documented here rather than resolved. Consequences: full attendance editing requires navigating to `admin-event-timeline.html`. Revisit if a structured picker UI is added to the overlay.

Alex's Thoughts:
