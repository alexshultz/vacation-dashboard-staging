# Supabase Phase 2 -- Lazlo Grill-Me
_Generated before implementation. All answers sourced from file reads or this brief._

---

## picks.js Questions

> **Q: What are the exact names of the Supabase credential constants in picks.js?**
> Lazlo's Answer: `SUPABASE_URL` (line 18) and `SUPABASE_ANON_KEY` (line 19). Both are already declared as `const` at module scope inside the IIFE. The hydration fetch must use these names -- no re-declaration.

---

> **Q: What is the exact localStorage key schema picks.js uses for pick state?**
> Lazlo's Answer: All picks are stored under `STORAGE_KEY = 'vacdash:v1:picks'` (line 20) as a single JSON object `{ slug: state }`. Null state means the slug key is deleted from that object. `lsSet()` handles both writes and deletes.

---

> **Q: Does `init()` currently do anything beyond setting `currentUser` and writing USER_KEY to localStorage?**
> Lazlo's Answer: No. Lines 116-119 show it sets `currentUser = userName || ''` and conditionally writes `USER_KEY`. No Supabase call, no async work. This is the insertion point for step 1 hydration.

---

> **Q: Is `init()` synchronous? Must it remain synchronous after this change?**
> Lazlo's Answer: Yes, synchronous. The brief requires fire-and-forget: the async IIFE runs *after* `init()` returns. The function signature does not change.

---

> **Q: Does `sbSet()` currently check `response.ok` before assuming the write succeeded?**
> Lazlo's Answer: No. Lines 89-93 show it calls `await fetch(...)` for both DELETE and POST but never inspects the returned Response object. HTTP 4xx/5xx errors are currently silently swallowed. Step 2 must add `response.ok` checks.

---

> **Q: What retry/error behavior does `sbSet()` currently provide?**
> Lazlo's Answer: Only `console.error('[picks] Supabase write failed', e)` on network-level catch (line 95). No banner, no retry, no user feedback. This is insufficient per the LOUD ERROR CONVENTION -- full banner implementation required.

---

> **Q: Where in `set()` does the localStorage write happen relative to the `sbSet()` call?**
> Lazlo's Answer: Lines 123-126: `lsSet(slug, state)` runs first, then `notify()`, then `sbSet()`. So localStorage is always updated before the server write attempt. The error banner comment "localStorage write already occurred before sbSet() was called -- pick is not lost" is accurate.

---

> **Q: What does `notify(slug, state)` do?**
> Lazlo's Answer: Lines 110-113: calls each callback in `listeners[slug]` and each callback in `listeners['*']` with `(slug, state)`. Step 1 hydration must call `notify(slug, state)` for each row returned from the server whose value differs from local state.

---

> **Q: How should the hydration in `init()` determine whether a slug's value actually changed before calling `notify()`?**
> Lazlo's Answer: Call `lsGet(slug)` before calling `lsSet(slug, row.state)`. If the values differ, the slug is a changed slug that warrants a `notify()` call. Slugs whose server value matches local state should still be written (Supabase wins) but notification is only needed if the value changed.

---

> **Q: What is `fetchAllWishlists()`'s current query, and what must it become?**
> Lazlo's Answer: Line 54: `?state=eq.wishlist&select=user_id,slug`. Must become `?state=in.(wishlist,committing)&select=user_id,slug,state` per step 3. The return signature (`{ slug: [user_id, ...] }`) does not change.

---

> **Q: Does `fetchAllWishlists()` check `response.ok`?**
> Lazlo's Answer: Yes -- lines 61-64 check `!r.ok` and console.error + return `{}`. This is already correct behavior for the aggregation endpoint. No change needed here.

---

> **Q: Does `sbEnabled()` account for the case where init() has not been called yet?**
> Lazlo's Answer: Yes -- `sbEnabled()` (line 50) checks `!!(SUPABASE_URL && SUPABASE_ANON_KEY && currentUser)`. If `currentUser` is empty (no name selected yet), it returns false. Step 1 hydration must guard on `currentUser` being truthy, which `sbEnabled()` already handles.

---

> **Q: Should step 1 hydration use `sbEnabled()` as a guard condition?**
> Lazlo's Answer: Yes. If `!sbEnabled()` returns false (no user set), the hydration fetch must not run. The guard can be `if (currentUser && SUPABASE_URL && SUPABASE_ANON_KEY)` inline or via `sbEnabled()`. Either is correct since the IIFE runs synchronously after `currentUser` is set.

---

## attractions.html Questions

> **Q: Is `buildCard(a)` synchronous?**
> Lazlo's Answer: Yes -- lines 137-188. It creates DOM elements, sets innerHTML, and returns the article. There is no async code in it. `fetchAllWishlists()` cannot be called inside it.

---

> **Q: Does the card already have a container for wishlist-related badges?**
> Lazlo's Answer: Yes -- line 184 includes `<div class="card--light__avatars" data-slug="..."></div>` in the card's `innerHTML`. This div is populated by the separate `refreshAvatars()` avatar script (lines 456-504), not by `buildCard()` itself.

---

> **Q: Is there an existing avatar-stack system in attractions.html that already calls `fetchAllWishlists()`?**
> Lazlo's Answer: Yes -- lines 456-504. The avatar system calls `picks.fetchAllWishlists()` on `catalog-rendered`, renders name chips into all `.card--light__avatars` containers, and polls every 30s. Step 4 adds a parallel `card-wishers` badge system using different element classes. Both will coexist; `card--light__avatars` is also used by the detail modal's `#dm-avatars` slot (line 360) and cannot be removed.

---

> **Q: Does step 4 require modifying `buildCard()` itself, or can badges be appended after render?**
> Lazlo's Answer: `buildCard()` is synchronous and cannot await `fetchAllWishlists()`. The brief says "Inside the card render function, after the card's existing HTML is assembled" but this is architecturally impossible synchronously. The correct interpretation (consistent with the existing avatar system pattern) is to append badges after `catalog-rendered` in a separate listener. The brief phrase "card render function" encompasses the full card creation + population lifecycle.

---

> **Q: Where is `picks.js` loaded in attractions.html, and does it precede the badge script insertion point?**
> Lazlo's Answer: Line 370: `<script src="js/picks.js"></script>`. The new badge script will be inserted after this (and after the existing avatar script at line 456), so `picks` is available.

---

> **Q: Will step 4 badges be rendered once or refreshed on a timer?**
> Lazlo's Answer: Once at page load (after `catalog-rendered` and after `fetchAllWishlists()` resolves). The brief does not ask for polling in step 4. The existing `.card--light__avatars` system already handles live refresh at 30s intervals.

---

> **Q: What element structure does the brief specify for badges?**
> Lazlo's Answer: `<div class="card-wishers">` containing one `<span class="wisher-badge">` per other-user showing only `user_id.split(' ')[0]`. Inline styles only. Suggested: font-size 11-12px, padding 2px 7px, border-radius 999px, background rgba(0,0,0,0.07).

---

> **Q: Is `rgba(0,0,0,0.07)` readable in dark mode?**
> Lazlo's Answer: It is nearly invisible on a dark background. However it is what the brief explicitly suggests, and readability in dark mode is a judgment call the brief delegates. I will use it as specified. The badge text is `color:inherit` so it inherits the card's text color, which is theme-aware. The pill itself will be very subtle in dark mode -- consistent with the "muted" intent.

---

> **Q: The test banner at lines 45-48 says it should be removed "when the live backend connects in Phase 2." Should it be removed in this pass?**
> Lazlo's Answer: The brief explicitly says "Do not modify any HTML element not explicitly named in this task -- flag unused/redundant elements in handback instead." The test banner is not named. It will be flagged in the handback under "Flagged Items" but not removed.

---

> **Q: Will step 4 result in two separate calls to `fetchAllWishlists()` on page load (one from the existing avatar system, one from the new badge system)?**
> Lazlo's Answer: Yes. Both fire after `catalog-rendered`. This is two Supabase REST requests at page load. It is acceptable (both are read-only, the anon key allows it, and the data is small). A future optimization could share a single fetch result, but that is out of scope for this task.

---

## wishlist.html Assessment (read-only)

> **Q: Does wishlist.html read picks via picks.getAll() or directly from localStorage?**
> Lazlo's Answer: It calls `picks.getAll()` (confirmed at line 3117: `var local = picks.getAll()`). This means step 1's Supabase hydration will automatically flow through to wishlist.html -- once `init()` hydrates server data into localStorage, `picks.getAll()` will return the merged result. No changes to wishlist.html are needed for Phase 2 to work correctly there.

> **Q: What is wishlist.html's data source for attraction metadata?**
> Lazlo's Answer: A large embedded `ATTRACTIONS_DATA` array (starting line 148) -- a static snapshot of all attractions baked into the HTML. It does not fetch `data.json` at runtime. Card metadata (name, image, price, etc.) comes from this snapshot.

> **Q: Does wishlist.html call `picks.init()`?**
> Lazlo's Answer: Yes, indirectly -- when a user clicks a name button (line 3028: `picks.init(btn.dataset.name)`). The name chooser modal triggers this, same pattern as attractions.html.

---

## suggested.html Assessment (read-only)

> **Q: Does suggested.html have a functional suggestion UI?**
> Lazlo's Answer: Yes. Lines 3140-3220 show a `loadSuggestions()` async function that fetches from `SB_URL + '/rest/v1/suggestions?to_user=eq.{user}'`, renders suggestion cards with "Add to Wishlist" and "No Thanks" buttons, and handles dismissal. The full Supabase-backed suggestion workflow is already wired. It uses `picks.set(slug, 'wishlist')` to add accepted suggestions.

> **Q: What is the current data source for suggested.html?**
> Lazlo's Answer: Directly fetches from Supabase `suggestions` table via hardcoded `SB_URL` and `SB_KEY` (lines 180-181). Uses `picks.js` only for the wishlist-add action and user identity (`picks.getUser()`). Does not use `picks.fetchAllWishlists()`.

> **Q: What are the hardcoded credentials at lines 180-181?**
> Lazlo's Answer: `var SB_URL = 'https://quebfbvfuwbncpexlylu.supabase.co'` and `var SB_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt'` -- duplicates of the constants already in picks.js. The anon key is publishable (safe for client code). This duplication is a known discovery from the brief and is NOT to be modified.

---

## Cross-Cutting / Architectural Questions

> **Q: Should the hydration fetch in `init()` use the user name captured at call time, or the module-level `currentUser` variable?**
> Lazlo's Answer: The IIFE captures `currentUser` via closure over the module-level variable. Since `currentUser` is set on the line immediately before the IIFE is created, and the fetch URL encodes it at the time the IIFE body runs, the correct user name will be in `currentUser` when the async body executes. For extra safety I'll capture it in a local `const hydrateUser = currentUser` at IIFE creation to guard against hypothetical re-entrancy.

---

> **Q: The banner in sbSet() relies on `document.body`. Is it safe to call inside a module-level IIFE that runs before DOMContentLoaded?**
> Lazlo's Answer: `sbSet()` is only called from `picks.set()`, which is in turn called from event handlers wired after `catalog-rendered`. By the time any `sbSet()` call could fail, `document.body` is fully available. No guard needed.

---

> **Q: Does the error banner ID (`sb-error-banner`) risk collision with any existing elements in attractions.html?**
> Lazlo's Answer: Confirmed no element with `id="sb-error-banner"` exists in attractions.html. The duplicate-check (`document.getElementById('sb-error-banner')`) guards against the banner being created twice if `sbSet()` is called rapidly.

---

> **Q: After step 3 expands `fetchAllWishlists()` to include 'committing' state, does the return shape change?**
> Lazlo's Answer: No. The grouping logic (`grouped[row.slug].push(row.user_id)`) is unchanged. The result is still `{ slug: [user_id, ...] }`. The addition of `state` to the SELECT clause is included but the JS does not use it, preserving the return shape exactly.

---

> **Q: Are there any other callers of `fetchAllWishlists()` besides the existing avatar script and the new step 4 badge script?**
> Lazlo's Answer: No other callers found in attractions.html. The function is also exposed in the `picks` public API (line 133) for external use, so wishlist.html and suggested.html could theoretically call it -- but neither does.
