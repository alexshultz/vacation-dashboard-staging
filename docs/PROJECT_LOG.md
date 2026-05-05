## 2026-05-05 -- live search bar replaces chip filter on attractions.html

**Vault commit:** 664e5c3
**Staging commit:** c0a2b5d
**Status:** Staged at https://vacation-dev.creeperbomb.com/ -- production requires "ship it"

**What was built:**
- Entire chip filter system removed from attractions.html (38 chips, Filter toggle, popover div, all JS)
- Replaced with a single live-search bar: filters on every keystroke, no Enter required
- Search operators: plain phrase (AND per word), `tag:value`, `-tag:value`, combinable
- Search blob per card: name + description + notes + tags (lowercased at render time)
- localStorage: `vacdash:v1:filter` retired, `vacdash:v1:search` introduced (query persists across loads)
- CSS tokens corrected: `--color-line`, `--color-ink-dim` (design system compliant)
- applySearch scoped inside catalog-rendered listener (not global)
- Null guard on searchInput element lookup

**Code review findings fixed (8 bugs caught by cold reviewer before staging):**
1. Phrase matching: was literal substring, fixed to per-word AND logic
2. Syntax hint: used fake `tag:free` example, fixed to `tag:outdoor` / `tag:family -tag:indoor`
3. notes field: was excluded from search blob, added
4. Null guard: missing on searchInput getElementById, added
5. applySearch: was global function, moved into listener closure
6. CSS tokens: --border/--muted (undefined), fixed to --color-line/--color-ink-dim
7. Empty tag: value: was hiding all cards, guarded with if(val) check
8. localStorage: was storing untrimmed query, fixed to query.trim()

**Scope drift by lazlo (both reverted before commit):**
- web/quick-pick.html: lazlo deleted .qp-back-link CSS and Back to Browse nav link (out of scope deletion)
- web/people-timeline.html: lazlo fixed stale --accent-sand/--accent-dusk tokens (correct but out of scope)

**Playwright:** 24/25 pass. 1 pre-existing failure: admin-auth.spec.js "event-timeline.html shows edit buttons when logged in" (unrelated to this change).

---

## 2026-05-04 -- chip color mockup deployed to staging

**Status:** Visual review pending -- NOT implemented in production

**What happened:**
- Council of Minds (2026-05-04) returned CAVEAT on category chip color system
  with 8 blocking conditions. No production code was written.
- Chip color mockup built and pushed to staging for visual review:
  https://vacation-dev.creeperbomb.com/chip-color-mockup.html
- specialty-food proposal: 135deg diagonal split, Food #C4601A / Shopping #7A4A8A
- outdoor proposal: #3A7A5A forest green (replaces --status-yes moss collision)
- 404 issue resolved: file was initially placed in web/ subdirectory instead of
  repo root; corrected and re-pushed in same session.
- Tool access failure mid-session: terminal/file tools dropped; recovered before
  session end. NEXT-SESSION.md and this log entry written after recovery.

**Unresolved at session end:**
- Cron job: Alex requested fix/test/schedule but did not identify which cron job.
  Candidates: Playwright e2e suite, Supabase keepalive. Ask at next session start.
- All 8 chip system blocking decisions still open (see docs/NEXT-SESSION.md)

---

## 2026-05-03 -- Data Sprint: Area Tags + Store/Food/Craft Cards -- staged, awaiting review

**Vault commit:** b3971b6
**Staging commit:** c0ad70a
**Status:** Staged at https://vacation-dev.creeperbomb.com/ -- production requires "ship it"
**Total attractions:** 317 (310 visible, 7 hidden by blacklist)

**What was added (82 new entries):**

- **Tanger Outlets (25 new):** Coach, Gap Factory, Banana Republic Factory, Levi's, Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein, GUESS Factory, Chico's, Lane Bryant, Torrid, Old Navy, The Children's Place, Carter's, adidas, New Balance, Skechers, Steve Madden, Sunglass Hut, Yankee Candle, Book Warehouse, Hallmark, Kitchen Collection, rue21, Justice. All tagged `at-tanger-outlets`. (3 already existed: Nike, Under Armour, American Eagle)
- **Branson Landing (14 new):** Bath & Body Works, Pandora, Francesca's, Victoria's Secret, Belk, H&M, Lids, Spencer's, Claire's, Justice, White House Black Market, Torrid, plus the Fountain Show and Boardwalk cards as attraction-type entries. All tagged `at-branson-landing`.
- **Dickson Street, Fayetteville (18 new):** George's Majestic Lounge, Walton Arts Center, Dickson Street Bookshop, Nightbird Books, Maxine's Tap Room, Smoke & Barrel Tavern, Bordino's, Hugo's, Hammontree's Grilled Cheese, Gusano's Pizza, Yeyo's, Powerhouse Seafood, Arsaga's at the Depot, Penguin Ed's BBQ, Sassy's Red House BBQ, Dickson Street Ballroom, Underwood's Fine Jewelers, JJ's Grill. All tagged `at-dickson-street`.
- **Silver Dollar City -- shops, food, crafts (25 new):** Brown Sugar's Bakery, Candy Kitchen, Lumbercamp Restaurant, Molly's Mill, Fred's Old Southern Bar-B-Que, Florentina's Ristorante Italiano, Miss Lizzie's Boarding House, Prairie Kettle Corn, Giant Smoked Turkey Legs, Sorghum Mill, Cobbler & Ice Cream Stand; Dazzle Glass Studio, Ozark Pottery, Blacksmith Shop, Woodcarver's Shop, Candle Shop, Broom Maker, Silversmith & Jewelry Studio, Leatherworks, Soap Shop; Silver Dollar City General Store, Rock Shop & Gem Mine, Wilson Brothers Music, The Christmas Shop, Marvel Cave Gift Shop. All tagged `at-sdc` AND `sdc`.

**Design pattern established:**
- Area tag chips (`at-branson-landing`, `at-tanger-outlets`, `at-dickson-street`, `at-sdc`) let the family filter to all entries in one complex from Browse. No new UI code needed -- filter chip system handles grouping automatically.
- SDC entries get both `sdc` (matches existing SDC overview card) and `at-sdc` (area filter).

**Known caveats:**
- All 82 new entries carry a `notes` flag: *"Training-knowledge entry -- verify store is still open at official site before visiting."* Web search tools were offline this session (auth token failure, session-wide). Names and descriptions drawn from training data -- recommend spot-checking Tanger and SDC lists against official directories before promoting to production.
- Flea markets near Branson (May 23-28) were NOT researched -- web tools were down. Pick this up next session.
- War Eagle Craft Fair excluded -- outside May 23-28 window (October event).

**Still deferred / not started:**
- Flea markets: need web access to confirm open dates
- Production promotion: waiting for "ship it"

**Context decisions from this session (Alex instructions):**
- Branson Landing individual store cards: yes, all of them
- Tanger individual store cards: yes, all of them
- Dickson Street individual businesses: yes, all of them
- SDC shops/food/crafts: yes, all -- with `sdc` tag on all SDC entries
- Art galleries: list as activity (not shopping)
- Winery tasting experiences: add as activity (not retail)
- Specialty food shops: yes
- Farmers markets: add if confirmed open during May 23-28
- Flea markets: add if confirmed open during May 23-28
- Winery retail stores: skip

---

## 2026-05-01 -- Admin Sprint -- staged, awaiting Alex review

**Vault commit:** a004ecc
**Staging commit:** pending push
**Status:** Live at https://vacation-dev.creeperbomb.com/ (staging only -- production requires "ship it")

**Scope shipped:**
- Brief 1: Supabase schema -- schedule_events table, app_config table, RLS policies, Realtime on app_config. Alex ran SQL manually in Supabase dashboard.
- Brief 2: event-timeline.html + index.html -- 3-tier Supabase primary / schedule.json fallback / retry UI. Supabase JS CDN added. INITIAL_VISIBLE fetched live from app_config. Realtime subscription on index.html for live INITIAL_VISIBLE propagation.
- Brief 3: admin.html -- replaced 3141 passcode with Supabase Auth passkey (WebAuthn / Face ID). Import schedule button. Hub nav to admin-event-timeline.html and admin-index.html.
- Brief 4: admin-event-timeline.html (new) -- session guard, pencil-per-card edit modal, full upsert to schedule_events. admin-index.html (new) -- session guard, sticky +/- INITIAL_VISIBLE control bar, upserts to app_config.

**Architectural decisions:**
- duration column changed NUMERIC (ALTER TABLE after Brief 1) -- schedule.json has decimal durations (0.75, 1.5, etc.)
- Supabase JS CDN added to index.html and event-timeline.html (raw REST kept for data fetches; SDK used for auth + Realtime only)
- renderCard hoisted to module scope in admin-event-timeline.html so save handler can reuse it for single-card re-render
- Q14a (site.js admin nav gate switch to Supabase session) deferred to post-launch cleanup sprint

**Next:** Alex reviews staging, says "ship it" to promote to production.
**Playwright test suite:** cron job scheduled overnight (builds + runs against staging).

---

## 2026-04-29 -- Theme System Sprint -- shipped to production

**Production commit:** 8f9a66d (already live when ship-it issued -- prior session promoted)
**Vault commits:** e75d2d6, 21f7df8, cebfa24, 4f8a0a8
**Status:** Live at https://vacation.creeperbomb.com/

**What shipped:**
- Token rename: --accent-sand/clay/dusk -> --accent-1/2/3 across all 16 active CSS files
- Shadow tint fix: Trail-green rgba(63,107,58,0.14) -> neutral rgba(0,0,0,0.10) in tokens.css
- DESIGN-trail.md created; 23 existing DESIGN.md files updated with renamed tokens
- 10 orphaned theme CSS files written from existing specs (storm-watch, dusk-gold, mint-forest, desert-sky, cabin-fire, wildflower, autumn-ozarks, lake-day, sunrise, night-hike)
- 6 catalog theme CSS files written from real-world design systems (airbnb, notion, airtable, mintlify, clay, wise) + 6 companion DESIGN.md files
- profile.html THEMES array expanded from 14 to 30 entries
- Reviewer catch: sunrise.css wishlist/no-status collision (both crimson) -- fixed with pre-dawn purple (#6B3A8B / #9B6ADD)

**4 briefs, 4 code reviews, 1 surgical PM patch. All reviewer checks passed.**

---

## 2026-04-29 -- promote: dynamic admin menu visibility to production

**Production commit:** d8961b1  
**Status:** Live at https://vacation.creeperbomb.com/

**What shipped:**
- ADMIN_USERS array in site.js -- extendable, currently ['Alex']
- Admin link (⚙️ Admin) in both hamburger panel AND desktop .site-nav when logged in as Alex
- vacdashRebuildHamburger() -- instant menu refresh when name is set on profile.html, no reload needed
- admin.html passcode gate (3141) unchanged

**Next up:** Add site.js nav to admin.html so it's not a stranded island (no way back home).

---


## 2026-04-29 -- feat: dynamic admin menu visibility

**Vault commit:** 57be67e  
**Staging commit:** 10ccc99  
**Status:** In staging. Awaiting 'ship it' for production.

**What shipped:**
- `ADMIN_USERS = ['Alex']` array constant in site.js (extendable -- just add names)
- Admin link appears in BOTH hamburger panel AND desktop .site-nav when logged in as Alex
- `window.vacdashRebuildHamburger()` exposed -- rebuilds panel + desktop nav + re-attaches theme toggle handler + calls syncBadge()
- profile.html calls rebuildHamburger() immediately after setUser() -- Admin link appears the instant you pick your name, no page reload needed
- admin.html untouched -- passcode gate (3141) unchanged

**Code review:** 10/10 PASS (cold reviewer)  
**Lazlo flag:** Stale updateProfileBtnBadge() call in profile.html queries non-existent #profile-btn, silently no-ops. Not removed. Low-priority cleanup candidate.

---


## 2026-04-29 -- promote: theme system sprint to production

**Staging commit:** 8c0a60f  
**Production commit:** 8f9a66d  
**Status:** Live at https://vacation.creeperbomb.com/

**What shipped:**
- 16 new theme CSS files (airbnb, airtable, autumn-ozarks, cabin-fire, clay, desert-sky, dusk-gold, lake-day, mint-forest, mintlify, night-hike, notion, storm-watch, sunrise, wildflower, wise)
- 14 existing theme CSS files updated (token rename + dark mode fixes from sprint)
- css/tokens.css updated (--accent-sand/clay/dusk renamed to --accent-1/2/3)
- All 30 DESIGN.md spec files added to themes/
- Stale web/mockups/ deleted from vault, staging, and production
- All HTML pages updated (from earlier sprints pending this promotion)

**Safety checks:** All 5 passed pre-promotion.  
**Mockups:** Deleted from all three locations (vault, staging, production) -- not excluded, not special-cased.

---


## 2026-04-28 -- session: docs/handoff before Hermes update (updated)

**Status:** Documentation session. No code changes.

**What this session did:**
1. Documented the admin editor Council session (morning 20260428_102157) -- was absent from PROJECT_LOG.md
2. Updated ROADMAP.md admin editor item -- removed stale "GitHub-API-backed" wording; added Council findings and 3 blocking decisions for Alex
3. Updated NEXT-SESSION.md for new session pickup
4. Confirmed staging `2cb8a2b` still pending production promotion (event-timeline + index UI polish)

**Known state of blocking decisions on admin editor:**
- Alex reviewing "Option Zero" (GitHub.com web editor on schedule.json) -- no decision recorded
- ADR-002 Supabase ruling -- no decision recorded
- Keepalive cron sufficiency -- no decision recorded

**ROADMAP tester pass discrepancy resolved:** ROADMAP says deferred (correct); NEXT-SESSION was wrong -- tester pass is deferred, NOT the next blocker. Promotion of `2cb8a2b` is the next blocker.

---

---

## 2026-04-28 -- architecture: admin editor Council of Minds session

**Session:** 20260428_102157 (morning, ~10:21 AM)

**Task:** Evaluate architecture options for the coordinator admin editor page (Priority 9 coordinator tool -- Alex edits schedule data and RSVPs without terminal deploy).

**Process:** T3 Council of Minds. Five roles (Explorer, Verifier, Skeptic, Weaver, Archivist) + Refiner synthesis.

**Council result (CAVEAT):** Supabase-backed schedule storage + JS-layer password access control recommended. Medium confidence.

**Eliminated approaches:**
- GitHub API write-back -- HARD BLOCKER: GitHub secret scanning auto-revokes any PAT pushed to a public repo's client-side JS
- Hybrid (Supabase + GitHub) -- split-truth / event ID drift with no arbiter

**"Option Zero" surfaced:** GitHub.com's built-in web editor (pencil icon on schedule.json) -- zero code, real auth, 60-90 second deploy. Alex was reviewing what schedule.json entries look like when the session ended.

**Three decisions BLOCKED on Alex (unresolved at session end):**
1. Accept "Option Zero"? -- Use GitHub.com built-in editor instead of building anything
2. ADR-002 ruling -- does a human-triggered Supabase write-back violate the "no automated code modifying vault files" intent?
3. Keepalive cron sufficiency -- is the every-3-days cron enough to prevent Supabase auto-pause before May 22 trip start?

**No implementation started. No code written.**

---

## 2026-04-28 -- UI polish: event-timeline.html + index.html

**Commits:** vault `ea92f71` (event-timeline), `6ea423e` (index)
**Staging:** `3ef6261` (event-timeline), `2cb8a2b` (index)
**Status:** In staging. NOT YET IN PRODUCTION. Awaiting "ship it."

**Changes shipped to staging on both pages:**
1. "No Response" chip -- outline now matches text color (color-ink-dim border, same pattern as other 3 chips)
2. Legend key -- replaced bare flex div with centered boxed 2x2 grid (480px+: single row). Box uses color-surface background + color-line border + radius-card.
3. Card body column order corrected: **Interested | Not Interested | (divider) | Undecided | No Response**. Visual border-left divider on the Undecided column separates the decided group from the pending group.

**Note:** Column order in staging matches Alex's confirmed desired order (1. Interested 2. Not Interested 3. Undecided 4. No Response). Production still has the old order.

---

## 2026-04-28 -- fix: stale web/mockups/ removed from production

**Commit:** `f259e7c` on vacation-dashboard.git main

**What:** Deleted 4 stale development mockup files (README.md, button-study.html, card-density.html, swipe-browse.html) from web/mockups/ in the production repo. Never served, never linked. rsync --delete would have cleaned them on next promotion anyway. Removed to eliminate recurring "not empty, cannot delete" rsync warning on every deploy.

**Verification:** T2 cold verifier confirmed 0 references to web/ in any root HTML file; no deploy scripts affected.

**Side effect:** --exclude="mockups" flag patched out of branson-lazlo-delegation skill (both rsync commands).

---

## 2026-04-28 -- fix: admin upsert 409 error resolved

**Vault commit:** `a1c9c8b` / Production: `d27adb3`

**Root cause (T3 Council confirmed):** PostgREST v12 requires BOTH ?on_conflict=event_id,field in the URL AND Prefer: resolution=merge-duplicates in the header to emit INSERT ... ON CONFLICT DO UPDATE. URL param was present; header directive was missing. PostgREST issued a plain INSERT, hitting UNIQUE(event_id, field) → 23505.

**Fix:** Single-line change in saveOverrides() in web/admin.html:
- BEFORE: 'Prefer': 'return=minimal'
- AFTER: 'Prefer': 'return=minimal,resolution=merge-duplicates'

**Verification:** RLS confirmed (SELECT/INSERT/UPDATE/DELETE all present for anon). Intra-batch dup structurally impossible (FIELDS array). updated_at refresh handled by existing BEFORE UPDATE trigger.

**Note:** admin.html was new to production (first promotion of admin page).

---

     1|## 2026-04-28 -- stale web/mockups/ removed from production
     2|
     3|**Commit:** `f259e7c` on `vacation-dashboard.git main`
     4|
     5|**What:** Deleted 4 stale development mockup files from `web/mockups/` in the production repo. Files were never referenced by any live page, never served by GitHub Pages, and the rsync deploy workflow already excluded them. The `web/` directory was an artifact from early development that the rsync `--delete` flag would have cleaned on next promotion anyway. Removed now to eliminate the recurring "not empty, cannot delete" rsync warning on every deploy.
     6|
     7|**Verification:** T2 cold verifier confirmed 0 references to `web/` in any root HTML file; no deploy scripts affected; safe to delete.
     8|
     9|**Side effect:** `--exclude="mockups"` flag in `branson-lazlo-delegation` skill is now redundant -- patched out.
    10|
    11|---
    12|     1|## 2026-04-28 -- admin upsert fix promoted to production
    13|     2|
    14|     3|**Promoted:** staging commit `3a183d1` → production commit `d27adb3`
    15|     4|
    16|     5|**URL:** https://vacation.creeperbomb.com/admin.html
    17|     6|
    18|     7|**Notes:** `admin.html` was new to production repo (first promotion of the admin page). rsync warning "not empty, cannot delete ./web" is harmless -- subdirectory already existed in destination. 12 files changed (11 cache-busted HTML + admin.html new).
    19|     8|
    20|     9|---
    21|    10|     1|## 2026-04-28 -- admin upsert fix deployed to staging
    22|    11|     2|
    23|    12|     3|**Task:** Fix 409 unique constraint violation on admin.html schedule overrides save.
    24|    13|     4|
    25|    14|     5|**Root cause (Council confirmed):** PostgREST v12 requires BOTH `?on_conflict=event_id,field` in the URL AND `Prefer: resolution=merge-duplicates` in the header to emit `INSERT ... ON CONFLICT DO UPDATE`. The URL param was present; the header directive was missing. Without it, PostgREST issued a plain INSERT, which hit the UNIQUE(event_id, field) constraint and returned 23505.
    26|    15|     6|
    27|    16|     7|**Fix:** Single-line change to `saveOverrides()` in `web/admin.html` line 335:
    28|    17|     8|- BEFORE: `'Prefer': 'return=minimal'`
    29|    18|     9|- AFTER: `'Prefer': 'return=minimal,resolution=merge-duplicates'`
    30|    19|    10|
    31|    20|    11|**Process:** T3 Council of Minds (5 roles: Explorer, Verifier, Skeptic, Weaver, Archivist + Refiner). Verifier confirmed from PostgREST v12.2 docs; Archivist confirmed from Plan.hs source code. All 5 roles converged. RLS policies verified (SELECT, INSERT, UPDATE, DELETE all present for anon). Intra-batch dup ruled out structurally. updated_at refresh handled by existing BEFORE UPDATE trigger.
    32|    21|    12|
    33|    22|    13|**Verification:** All 6 safety checks passed. git diff scope: web/admin.html only.
    34|    23|    14|
    35|    24|    15|**Status:** Deployed to staging (vacation-dev.creeperbomb.com). Awaiting Alex "ship it" for production.
    36|    25|    16|
    37|    26|    17|---
    38|    27|    18|     1|## 2026-04-28 -- feat: Supabase Phase 2 activation
    39|    28|    19|     2|
    40|    29|    20|     3|**What changed:**
    41|    30|    21|     4|- `web/js/picks.js`: `init()` now fires a non-blocking async hydration fetch from Supabase on user set -- merges server picks into localStorage (Supabase wins per slug), notifies listeners for changed slugs, silent on failure
    42|    31|    22|     5|- `web/js/picks.js`: `sbSet()` now shows an on-screen red error banner (background #F8DDD5) on any Supabase write failure -- includes one-retry button; localStorage write preserved regardless
    43|    32|    23|     6|- `web/js/picks.js`: `fetchAllWishlists()` query expanded from `state=eq.wishlist` to `state=in.(wishlist,committing)` -- return shape unchanged
    44|    33|    24|     7|- `web/js/picks.js`: dead code removed from `showBanner()` -- `retryFailed` parameter and unreachable branch eliminated
    45|    34|    25|     8|- `web/attractions.html`: Phase 1 test banner (`🧪 Test data`) removed -- Phase 2 backend is now live
    46|    35|    26|     9|- `web/attractions.html`: redundant Wisher Badges script block removed -- Avatar Stack (pre-existing, polls every 30s) is the canonical wishlist renderer
    47|    36|    27|    10|
    48|    37|    28|    11|**Deployed to staging:** vacation-dev.creeperbomb.com
    49|    38|    29|    12|**Promoted to production:** vacation.creeperbomb.com
    50|    39|    30|    13|
    51|    40|    31|    14|---
    52|    41|    32|    15|
    53|    42|    33|    16|## 2026-04-27 -- fix: Quick Pick nav instruction corrected in help.json
    54|    43|    34|    17|
    55|    44|    35|    18|**What changed:**
    56|    45|    36|    19|- `web/help.json`: Quick Pick section body corrected -- removed stale reference to "Quick Pick button inside Activities"; replaced with "Find it in the menu under **Quick Pick**" (reflects April 26 nav refactor that promoted Quick Pick to top-level nav)
    57|    46|    37|    20|
    58|    47|    38|    21|**Promoted to production:** vacation.creeperbomb.com
    59|    48|    39|    22|
    60|    49|    40|    23|---
    61|    50|    41|    24|
    62|    51|    42|    25|     1|## 2026-04-27 -- UI polish batch: appearance controls, nav, profile fixes
    63|    52|    43|    26|     2|
    64|    53|    44|    27|     3|**What changed:**
    65|    54|    45|    28|     4|- `web/css/components.css`: profile date row always-stacked (grid-template-columns: 1fr, media query removed)
    66|    55|    46|    29|     5|- `web/profile.html`: Help/FAQ link removed from bottom of profile page
    67|    56|    47|    30|     6|- `web/js/site.js`: Appearance toggle -- ⚙️ System -> 🌓 Auto, button UA background fixed (background: none)
    68|    57|    48|    31|     7|- `web/js/site.js`: Profile link added to desktop nav bar (id=profile-btn-nav); hamburger profile link renamed id=profile-btn-hamburger; syncBadge() updated to querySelectorAll both
    69|    58|    49|    32|     8|- `web/profile.html` + `web/js/site.js` + `web/css/components.css`: "Mode" -> "Appearance" label; icons added to seg buttons (🌓/☀️/🌙); hamburger label always reads "[icon] Appearance"; active pill gets green border (var(--status-yes))
    70|    59|    50|    33|     9|- `web/profile.html`: Saved toast removed (toast(), saved(), toast-wrap div, all 7 call sites)
    71|    60|    51|    34|    10|- `web/js/site.js`: hamburger-link border: none added (removed UA button border box around Appearance)
    72|    61|    52|    35|    11|- `web/js/site.js`: :focus:not(:focus-visible) outline suppression on hamburger-theme-toggle
    73|    62|    53|    36|    12|- CNAME bug fixed: rsync --exclude="CNAME" added to all deploy commands (SOUL.md + skill patched)
    74|    63|    54|    37|    13|- GitHub token extraction corrected: sed -n 's/^GITHUB_TOKEN=*** instead of cut (base64 = truncation)
    75|    64|    55|    38|    14|
    76|    65|    56|    39|    15|**Promoted to production:** vacation.creeperbomb.com
    77|    66|    57|    40|    16|
    78|    67|    58|    41|    17|---
    79|    68|    59|    42|    18|
    80|    69|    60|    43|    19|## 2026-04-27 -- index.html h1 renamed; ROADMAP updated; staging synced
    81|    70|    61|    44|    20|
    82|    71|    62|    45|    21|**What changed:**
    83|    72|    63|    46|    22|- `web/index.html`: h1 changed from "Events" to "Upcoming Activities"
    84|    73|    64|    47|    23|- `docs/ROADMAP.md`: status updated to 2026-04-27; help.html and hamburger work marked done; new sprint items added (Supabase activation, admin editor, INITIAL_VISIBLE in admin); tester pass deferred
    85|    74|    65|    48|    24|- Staging repo synced to production (GAP 5 resolved)
    86|    75|    66|    49|    25|- Deployed to GitHub Pages (production + staging)
    87|    76|    67|    50|    26|
    88|    77|    68|    51|    27|---
    89|    78|    69|    52|    28|
    90|    79|    70|    53|    29|## 2026-04-26 -- Menu refactor: profile + theme toggle move to hamburger, Quick Pick promoted
    91|    80|    71|    54|    30|
    92|    81|    72|    55|    31|**What changed:**
    93|    82|    73|    56|    32|- `web/js/site.js`: NAV_LINKS expanded to 8 items (Quick Pick added between Activities and Wishlist)
    94|    83|    74|    57|    33|- `web/js/site.js`: buildHeader() stripped to site-logo + hamburger-btn + site-nav only
    95|    84|    75|    58|    34|- `web/js/site.js`: buildHamburgerPanel() now includes all 8 nav links + hr separator + theme-toggle button + profile link at bottom
    96|    85|    76|    59|    35|- `web/js/site.js`: hamburger-btn display:flex always (no mobile-only restriction -- hamburger is now universal settings access)
    97|    86|    77|    60|    36|- `web/js/site.js`: dark mode handler sets button textContent after each cycle (⚙️ System / ☀️ Light / 🌙 Dark)
    98|    87|    78|    61|    37|- `web/js/site.js`: modeLabel() helper added; initial label set from localStorage after panel injection
    99|    88|    79|    62|    38|- `web/js/site.js`: NAV_ALIASES quick-pick.html entry removed (matches directly to Quick Pick nav item now)
   100|    89|    80|    63|    39|- `web/attractions.html`: removed <a class="qp-nav-btn"> Quick Pick shortcut from filter row
   101|    90|    81|    64|    40|- syncBadge() unchanged -- getElementById('profile-btn') still resolves in panel
   102|    91|    82|    65|    41|- Deployed to GitHub Pages
   103|    92|    83|    66|    42|
   104|    93|    84|    67|    43|---
   105|    94|    85|    68|    44|
   106|    95|    86|    69|    45|## 2026-04-26 -- Mobile hamburger menu (Priority 4)
   107|    96|    87|    70|    46|
   108|    97|    88|    71|    47|**What changed:**
   109|    98|    89|    72|    48|- `web/js/site.js`: BOTTOM_TABS trimmed from 6 to 3 (Home, Activities, Wishlist)
   110|    99|    90|    73|    49|- Hamburger ☰ button added to header (desktop hidden, mobile visible <720px)
   111|   100|    91|    74|    50|- Full 7-item dropdown panel injected below header, initially hidden
   112|   101|    92|    75|    51|- CSS injected once into document.head (guarded by site-hamburger-styles id)
   113|   102|    93|    76|    52|- Panel closes on: second hamburger tap, outside click, Escape key
   114|   103|    94|    77|    53|- aria-expanded tracks open/closed state for accessibility
   115|   104|    95|    78|    54|- Suggested, Timeline, People now accessible via hamburger menu on mobile
   116|   105|    96|    79|    55|- Deployed to GitHub Pages
   117|   106|    97|    80|    56|
   118|   107|    98|    81|    57|---
   119|   108|    99|    82|    58|
   120|   109|   100|    83|    59|## 2026-04-26 -- index.html day-section banding + Show All/Show Fewer toggle
   121|   110|   101|    84|    60|
   122|   111|   102|    85|    61|**What changed:**
   123|   112|   103|    86|    62|- `web/index.html`: render() rewritten to group events into day-section container divs
   124|   113|   104|    87|    63|- Alternating Trail-palette backgrounds: even days moss 8% tint, odd days sand 10% tint (both blended against --color-bg, works in light + dark mode)
   125|   114|   105|    88|    64|- Day label spans at 45% opacity above each day's cards ("📅 May 23 — Saturday" etc.)
   126|   115|   106|    89|    65|- New `applyVisibilityState(showAll)` function -- single source of truth for card/section visibility
   127|   116|   107|    90|    66|- First INITIAL_VISIBLE (6) cards visible on load; remaining cards and empty day-sections hidden
   128|   117|   108|    91|    67|- "Show All ↓" button -- persists in DOM, toggles to "Show Fewer ↑" on click, never hidden
   129|   118|   109|    92|    68|- Old events-overflow/show-more-btn architecture fully removed (grep -c events-overflow = 0)
   130|   119|   110|    93|    69|- `showingAll` module-level boolean tracks toggle state
   131|   120|   111|    94|    70|- toggleAll() and setupMobileCollapse() unchanged
   132|   121|   112|    95|    71|- Deployed to GitHub Pages
   133|   122|   113|    96|    72|
   134|   123|   114|    97|    73|---
   135|   124|   115|    98|    74|
   136|   125|   116|    99|    75|## 2026-04-26 -- index.html progressive disclosure (Priority 2)
   137|   126|   117|   100|    76|
   138|   127|   118|   101|    77|**What changed:**
   139|   128|   119|   102|    78|- `web/index.html`: first `INITIAL_VISIBLE` (default: 6) events visible on load
   140|   129|   120|   103|    79|- Remaining 22 events in `<div id="events-overflow" hidden>` -- revealed by "Show all 22 more ↓" button
   141|   130|   121|   104|    80|- `INITIAL_VISIBLE` declared as `let` (not const) -- easy to change without code edit
   142|   131|   122|   105|    81|- Hero subtitle updates dynamically from `eventsData.length` after fetch (no longer hardcoded "28")
   143|   132|   123|   106|    82|- Button uses `btn.style.display = 'none'` in click handler (not `btn.hidden` -- CLAUDE.md pitfall avoided)
   144|   133|   124|   107|    83|- No collapse-back behavior -- once revealed, stays revealed
   145|   134|   125|   108|    84|- All existing render functions (`toggleAll`, `setupMobileCollapse`) unchanged
   146|   135|   126|   109|    85|- Deployed to GitHub Pages
   147|   136|   127|   110|    86|
   148|   137|   128|   111|    87|---
   149|   138|   129|   112|    88|
   150|   139|   130|   113|    89|## 2026-04-26 -- schedule.json: single source of truth for 28 trip events
   151|   140|   131|   114|    90|
   152|   141|   132|   115|    91|**What changed:**
   153|   142|   133|   116|    92|- Created `web/schedule.json` with 28 events migrated from inline JS arrays in event-timeline.html and index.html
   154|   143|   134|   117|    93|- Schema: id, title, date, duration, priority, catalogRef (null), startTime (null), travelMinutes (null), interested, undecided, notInterested, noResponse
   155|   144|   135|   118|    94|- Corrected two title errors: "Knife" → "Knife Forge", "Simon & Garfield" → "Simon & Garfunkel"
   156|   145|   136|   119|    95|- 24 events matched for duration; 4 events received default durations (Dogwood 6.0, Dogwood Canyon Horse 1.5, Dogwood Canyon Tram 1.5, Go Karts 1.5); 1 event-timeline-only title dropped ("Dogwood Canyon (all)")
   157|   146|   137|   120|    96|- `web/event-timeline.html`: replaced inline const eventsData array with fetch('schedule.json')
   158|   147|   138|   121|    97|- `web/index.html`: replaced inline const eventsData array with fetch('schedule.json')
   159|   148|   139|   122|    98|- CLAUDE.md: added safety check -- grep -c 'fetch.*schedule.json' web/event-timeline.html must return >= 1
   160|   149|   140|   123|    99|- catalogRef candidates identified for 11 events (set to null; Priority 9 coordinator tool will populate)
   161|   150|   141|   124|   100|- Deployed to GitHub Pages
   162|   151|   142|   125|   101|
   163|   152|   143|   126|   102|**Nullable forward-compat fields (all null, populated by future tasks):**
   164|   153|   144|   127|   103|- catalogRef: slug link to data/attractions.json catalog entry
   165|   154|   145|   128|   104|- startTime: "HH:MM" 24h string (Priority 9 coordinator tool)
   166|   155|   146|   129|   105|- travelMinutes: drive minutes from Watermill Cove (Priority 9 coordinator tool)
   167|   156|   147|   130|   106|
   168|   157|   148|   131|   107|---
   169|   158|   149|   132|   108|
   170|   159|   150|   133|   109|## 2026-04-26 -- Staging environment created + font bug fixes deployed
   171|   160|   151|   134|   110|
   172|   161|   152|   135|   111|**What changed:**
   173|   162|   153|   136|   112|- Created `vacation-dashboard-staging` repo at https://github.com/alexshultz/vacation-dashboard-staging
   174|   163|   154|   137|   113|- GitHub Pages enabled at https://alexshultz.github.io/vacation-dashboard-staging/
   175|   164|   155|   138|   114|- Local staging clone at `/Users/alex/code/vacation-dashboard-staging/`
   176|   165|   156|   139|   115|- Initial staging snapshot deployed (matches production at time of creation)
   177|   166|   157|   140|   116|- CLAUDE.md updated with two-target deploy table and staging-first rule
   178|   167|   158|   141|   117|- Font bug fixes deployed to production: Star Jedi removed from `--font-display` in star-wars.css; 12 reading copy selectors bumped to 17px desktop / 18px mobile in components.css
   179|   168|   159|   142|   118|- Three HTML files (people-timeline.html, profile.html, shows.html) reverted after lazlo made unsolicited eyebrow element removals -- not part of the task brief. Added note to future briefs: do not modify any HTML element not explicitly named in the task.
   180|   169|   160|   143|   119|
   181|   170|   161|   144|   120|**Deploy rule effective May 8:** All new feature work goes to staging first. Production only receives tested, reviewed work.
   182|   171|   162|   145|   121|
   183|   172|   163|   146|   122|---
   184|   173|   164|   147|   123|
   185|   174|   165|   148|   124|## 2026-04-26 -- help.html: runtime JSON renderer + content + profile Help link
   186|   175|   166|   149|   125|
   187|   176|   167|   150|   126|**What changed:**
   188|   177|   168|   151|   127|- Created `web/help.json` with 11 sections of family-facing help content (JSON with minimal Markdown in body strings per ADR-009)
   189|   178|   169|   152|   128|- Rewrote `web/help.html` `<main>`: stripped hard-coded sections, added fetch+IIFE renderer supporting `\n\n` paragraphs, `- ` bullets, and `**bold**`
   190|   179|   170|   153|   129|- Added Help entry-point link to `web/profile.html` (plain `<a>` -- `btn-secondary` class not present in components.css)
   191|   180|   171|   154|   130|- Updated CLAUDE.md pre-push safety checks: added `grep -c 'fetch.*help.json' web/help.html` must return 1
   192|   181|   172|   155|   131|- ADR-009 written (runtime JSON fetch over hard-coded HTML and build-time generator)
   193|   182|   173|   156|   132|- Deployed to GitHub Pages
   194|   183|   174|   157|   133|
   195|   184|   175|   158|   134|**Known cosmetic issue (non-blocking, fix next lazlo pass on help.html):**
   196|   185|   176|   159|   135|Code reviewer flagged WARN item 12: the `<script>` renderer block sits after `</main>` rather than inside `<main>`, and the `<div class="page-hero">` is inside `<main>` alongside the render target. Both are functionally correct but deviate slightly from the brief spec. Fix on next help.html touch.
   197|   186|   177|   160|   136|
   198|   187|   178|   161|   137|**Writing note:** All prose in help.json uses active voice with no dash-based pauses. Double-hyphen substitutes for em dash are prohibited per Alex's style guidance -- the spirit is clean, direct sentences, not just character substitution.
   199|   188|   179|   162|   138|
   200|   189|   180|   163|   139|---
   201|   190|   181|   164|   140|
   202|   191|   182|   165|   141|## 2026-04-26 -- Star Wars Theme: Star Jedi Font Integration + Theme Review
   203|   192|   183|   166|   142|
   204|   193|   184|   167|   143|**What changed:**
   205|   194|   185|   168|   144|- Copied `Starjedi.ttf` and `Starjhol.ttf` to `web/assets/fonts/star_jedi/` (flattened from vault source)
   206|   195|   186|   169|   145|- Updated `web/css/themes/star-wars.css`: added `@font-face` declarations, added `--font-display` token (Star Jedi primary, Orbitron fallback), fixed `--color-ink-dim` in dark mode from `#5A7890` → `#6685A0` (WCAG AA fix, was 4.28:1, now 5.14:1)
   207|   196|   187|   170|   146|- Updated `web/themes/DESIGN-star-wars.md`: typography.display fontFamily + note field, Overview font source paragraph
   208|   197|   188|   171|   147|- Star Jedi scoped to display role only (2rem); Orbitron retained for headline and nav-label
   209|   198|   189|   172|   148|- Star Wars theme NOT activated -- remains ready for activation at Alex's direction
   210|   199|   190|   173|   149|- Deployed to GitHub Pages
   211|   200|   191|   174|   150|
   212|   201|   192|   175|   151|**Auth note:** Discovered `~` in terminal sessions resolves to sandboxed home, not `/Users/alex`. Fixed by using absolute path `/Users/alex/.hermes/.env` for API key extraction. Same fix needed for GitHub token on every lazlo invocation.
   213|   202|   193|   176|   152|
   214|   203|   194|   177|   153|---
   215|   204|   195|   178|   154|
   216|   205|   196|   179|   155|## 2026-04-25 -- Multi-Model Documentation Audit (~27 rounds, ~65+ fixes)
   217|   206|   197|   180|   156|
   218|   207|   198|   181|   157|**What changed:**
   219|   208|   199|   182|   158|- Ran iterative Gemini 2.5 Pro cold-start audit across all 5 core agent docs (SOUL.md, CLAUDE.md, ONBOARDING.md, DECISIONS.md, ROADMAP.md).
   220|   209|   200|   183|   159|- Applied ~65+ genuine documentation fixes across 27 rounds. Key improvements:
   221|   210|   201|   184|   160|
   222|   211|   202|   185|   161|**Critical fixes:**
   223|   212|   203|   186|   162|- Added `data/people.json` to vault `.gitignore` -- PII (phone/email) was unprotected from `git add -A`.
   224|   213|   204|   187|   163|- Clarified that `data/people.json` must never be committed (vault .gitignore now enforces this).
   225|   214|   205|   188|   164|- Resolved contradiction: ONBOARDING.md "no git" comment vs SOUL.md `git commit` step -- vault IS a git repo (no remote), description updated.
   226|   215|   206|   189|   165|- Fixed CLAUDE.md pitfall table `.git/` recovery -- was truncated to 3 words; now has full 7-step command.
   227|   216|   207|   190|   166|
   228|   217|   208|   191|   167|**Workflow fixes (SOUL.md):**
   229|   218|   209|   192|   168|- Step 2 (grill-me): added Discord notify step -- "post note to Alex after writing grillme file".
   230|   219|   210|   193|   169|- Step 3 (lazlo invocation): clarified pre-existing brief prompt variant; replaced ambiguous `[...]` bracket with separate note.
   231|   220|   211|   194|   170|- Step 4 (cache-bust): changed to explicit `cd "$PREVIEW" &&` prefix so cwd is unambiguous.
   232|   221|   212|   195|   171|- Step 6 (handback): added DECISIONS.md to post-session log steps; added "new page = add to sed list" reminder.
   233|   222|   213|   196|   172|- Step 7: added SQL to non-trivial trigger list (CSS/JS/Python/SQL); added pre-existing brief exception inline.
   234|   223|   214|   197|   173|- Tester tracking: clarified Alex relays tester reports (testers are on iMessage, not in #branson-2026).
   235|   224|   215|   198|   174|- delegate_task restriction: expanded to explicitly permit Council of Minds reasoning roles.
   236|   225|   216|   199|   175|- export `VAULT=`/`PREVIEW=` (was `set`).
   237|   226|   217|   200|   176|- Lazlo cd command: changed `~/vaults/Vacation/Branson\ 2026` to quoted absolute path.
   238|   227|   218|   201|   177|
   239|   228|   219|   202|   178|**ONBOARDING.md fixes:**
   240|   229|   220|   203|   179|- Added SOUL.md conflict-rule blockquote to Sources of Truth table.
   241|   230|   221|   204|   180|- Added ONBOARDING.md itself to Sources of Truth table.
   242|   231|   222|   205|   181|- Fixed `web/*.html` permission table: "Delegate all changes to lazlo; do not write directly".
   243|   232|   223|   206|   182|- Clarified CLAUDE.md update rule: propose + Alex approves (was self-contradictory).
   244|   233|   224|   207|   183|- Changed VACATION-AGENT-ONBOARDING.md write permission from YES to "With Alex approval".
   245|   234|   225|   208|   184|- Unified non-trivial trigger definition (CSS/JS/Python/SQL, matches SOUL.md).
   246|   235|   226|   209|   185|- Added entry-point link requirement to Pre-Launch Checklist `help.html` item.
   247|   236|   227|   210|   186|- Added `(run from $PREVIEW -- script modifies files in cwd)` to cache_bust step.
   248|   237|   228|   211|   187|- Updated lazlo prompt to match SOUL.md (pre-existing brief OR grill-me clause).
   249|   238|   229|   212|   188|- Unified grill-me trigger wording (matches SOUL.md exactly).
   250|   239|   230|   213|   189|- Fixed frozen file layout: `generate_attractions.py` guard wording -- removed "PREVENTS" claim; added "do not rely on this guard".
   251|   240|   231|   214|   190|- Fixed "it will NOT overwrite files" -- changed to "it will not execute".
   252|   241|   232|   215|   191|
   253|   242|   233|   216|   192|**DECISIONS.md:**
   254|   243|   234|   217|   193|- ADR-003: struck through superseded blacklist inline JS array entry.
   255|   244|   235|   218|   194|- ADR-007 add-new-page rule: expanded from 4 to 6 steps.
   256|   245|   236|   219|   195|
   257|   246|   237|   220|   196|**ROADMAP.md:**
   258|   247|   238|   221|   197|- Removed redundant `(branson26.family or similar)` from struck-through custom domain item.
   259|   248|   239|   222|   198|- Last updated date updated to 2026-04-25.
   260|   249|   240|   223|   199|
   261|   250|   241|   224|   200|---
   262|   251|   242|   225|   201|
   263|   252|   243|   226|   202|## 2026-04-24 -- Sort + Visible Data-Layer Architecture
   264|   253|   244|   227|   203|
   265|   254|   245|   228|   204|**What changed:**
   266|   255|   246|   229|   205|- Created `scripts/export_data.py`: reads `data/attractions.json` + `data/blacklist.json`, computes `sort_key` (article-stripped lowercase name), sets `visible` boolean (false if slug in blacklist), stable-sorts by `sort_key`, writes all 139 records to `web/data.json`.
   267|   256|   247|   230|   206|- `web/data.json` regenerated: 139 total | 132 visible | 7 hidden. Pre-sorted alphabetically by sort_key.
   268|   257|   248|   231|   207|- `web/attractions.html`: removed 24-slug inline BLACKLIST Set; render filter changed to `if (a.visible === false) return`.
   269|   258|   249|   232|   208|- `web/quick-pick.html`: added `a.visible === false` guard in `filterAttractions()` (fixes 132 vs 139 count bug) and `updateDeckCount()` (fixes denominator inflation).
   270|   259|   250|   233|   209|- `CLAUDE.md` updated: data flow diagram, canonical sources table, render loop section, quick pick section, pitfall table.
   271|   260|   251|   234|   210|
   272|   261|   252|   235|   211|**Bugs fixed:**
   273|   262|   253|   236|   212|1. Sort: attractions now render in library alphabetical order (articles stripped) on both pages.
   274|   263|   254|   237|   213|2. Count: browse view and quick pick now show identical 132 cards.
   275|   264|   255|   238|   214|
   276|   265|   256|   239|   215|**Architecture decision:**
   277|   266|   257|   240|   216|Sort logic and blacklist filtering moved from client-side JS into the export script (single source of truth). HTML files are now dumb renderers -- they read pre-sorted, pre-filtered data.json and iterate it.
   278|   267|   258|   241|   217|
   279|   268|   259|   242|   218|**Process:** Council of Minds analysis -> Hermes self-check audit -> CodeMaster implementation -> CodeMaster review (APPROVED, 0 issues) -> CLAUDE.md update -> deploy.
   280|   269|   260|   243|   219|
   281|   270|   261|   244|   220|
   282|   271|   262|   245|   221|# Branson 2026 Dashboard — Project Log
   283|   272|   263|   246|   222|
   284|   273|   264|   247|   223|**Purpose:** Timestamped, newest-first record of meaningful state changes. Future-Hermes reads this first after a context compression. Humans read it to understand where the project actually stands vs. where any single session thought it was.
   285|   274|   265|   248|   224|
   286|   275|   266|   249|   225|**Rules:**
   287|   276|   267|   250|   226|- Newest at top. Append via insert after the header block, not at the bottom.
   288|   277|   268|   251|   227|- Each entry: ISO timestamp header + one paragraph + optional bullet list of artifacts/commits.
   289|   278|   269|   252|   228|- Commit this file alongside the commit it describes.
   290|   279|   270|   253|   229|- Keep it narrow. Only state changes, pivots, decisions, failures. Not every message.
   291|   280|   271|   254|   230|
   292|   281|   272|   255|   231|---
   293|   282|   273|   256|   232|
   294|   283|   274|   257|   233|## 2026-04-23 -- 4 new themes committed; codemaster CSS review pending
   295|   284|   275|   258|   234|
   296|   285|   276|   259|   235|Four new theme CSS files were designed by the Council of Minds and committed. They follow the same private-palette + semantic-token override pattern as `trail.css`. They are NOT yet wired into any HTML page -- that requires codemaster review first. Alex plans to create additional themes; all theme CSS files should be batched and reviewed together before any are activated.
   297|   286|   277|   260|   236|
   298|   287|   278|   261|   237|**BACKLOG: Codemaster CSS review required before any theme is activated.**
   299|   288|   279|   262|   238|- Review all files in `web/css/themes/` except `trail.css` (already in production)
   300|   289|   280|   263|   239|- Verify each file only overrides tokens defined in `tokens.css` -- no direct `--moss`/`--lake` refs in components
   301|   290|   281|   264|   240|- Verify dark mode blocks match `[data-mode="dark"]` selector pattern used by the rest of the system
   302|   291|   282|   265|   241|- Verify contrast ratios meet AA on both light and dark modes
   303|   292|   283|   266|   242|- No geometry, spacing, or typography changes permitted in theme files
   304|   293|   284|   267|   243|
   305|   294|   285|   268|   244|**Artifacts:**
   306|   295|   286|   269|   245|- `web/css/themes/midnight.css` -- teens/night owls, dark indigo + neon
   307|   296|   287|   270|   246|- `web/css/themes/sunshine.css` -- young kids, candy-bright summer carnival
   308|   297|   288|   271|   247|- `web/css/themes/heritage.css` -- grandparents, aged parchment + colonial palette
   309|   298|   289|   272|   248|- `web/css/themes/neon-country.css` -- wildcard, honky-tonk wood + neon signs
   310|   299|   290|   273|   249|- Commit: d3c6642
   311|   300|   291|   274|   250|
   312|   301|   292|   275|   251|---
   313|   302|   293|   276|   252|
   314|   303|   294|   277|   253|## 2026-04-23 ~11:00 CDT — Documentation architecture overhaul + fetch(data.json) conversion
   315|   304|   295|   278|   254|
   316|   305|   296|   279|   255|Council of Minds synthesis session (Weaver + Archivist). Two changes in this session:
   317|   306|   297|   280|   256|
   318|   307|   298|   281|   257|1. **fetch(data.json) conversion (ADR-003):** `web/attractions.html` converted from ~130 statically baked card elements to a dynamic `fetch('data.json')` render loop via `renderCatalog()`. Blacklist slugs inlined as JS array. Quick Pick deck and filter chips now read DOM `data-*` attributes post-render. 10 stale duplicate cards removed first (see `.claude/sync-triple-change-task.md` for quality gates).
   319|   308|   299|   282|   258|
   320|   309|   300|   283|   259|2. **Documentation architecture overhaul:** CLAUDE.md was stale (last updated 2026-04-18, missing Quick Pick warning and fetch-loop architecture). Full rewrite: accurate architecture diagram, frozen-generator rules, GitHub Pages sync workflow, pitfall table, and mandatory codemaster handback block. Created `docs/DECISIONS.md` (ADR-lite) to replace scattered decision prose in PROJECT_LOG. All decisions from project history back-populated as ADR-001 through ADR-006.
   321|   310|   301|   284|   260|
   322|   311|   302|   285|   261|**Documentation structure now:**
   323|   312|   303|   286|   262|- `CLAUDE.md` — live rules + architecture (agents auto-load, must be accurate)
   324|   313|   304|   287|   263|- `docs/PROJECT_LOG.md` — timestamped state record (Hermes/human reads)
   325|   314|   305|   288|   264|- `docs/DECISIONS.md` — ADR-lite for architectural choices (agents append, never delete)
   326|   315|   306|   289|   265|
   327|   316|   307|   290|   266|**Artifacts:**
   328|   317|   308|   291|   267|- `CLAUDE.md` — full rewrite (2026-04-23)
   329|   318|   309|   292|   268|- `docs/DECISIONS.md` — created, ADR-001 through ADR-006
   330|   319|   310|   293|   269|- `docs/PROJECT_LOG.md` — this entry
   331|   320|   311|   294|   270|
   332|   321|   312|   295|   271|---
   333|   322|   313|   296|   272|
   334|   323|   314|   297|   273|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   335|   324|   315|   298|   274|
   336|   325|   316|   299|   275|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73).
   337|   326|   317|   300|   276|Verdict: PASS WITH WARNINGS. 5 fixes applied:
   338|   327|   318|   301|   277|
   339|   328|   319|   302|   278|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   340|   329|   320|   303|   279|2. hookup_pages.py: idempotency guard added (skip if site-header already present)
   341|   330|   321|   304|   280|3. hookup_pages.py: data-mode regex scoped to <html> tag only; re-ran on 3 static pages
   342|   331|   322|   305|   281|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   343|   332|   323|   306|   282|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   344|   333|   324|   307|   283|
   345|   334|   325|   308|   284|Remaining LOW items (non-blocking, logged for Phase 2):
   346|   335|   326|   309|   285|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   347|   336|   327|   310|   286|- audit_thumbs.py divide-by-zero guard
   348|   337|   328|   311|   287|- tags_str/slug not html.escaped in generator template
   349|   338|   329|   312|   288|- attractions.html inline <style> block duplicates components.css rules
   350|   339|   330|   313|   289|
   351|   340|   331|   314|   290|---
   352|   341|   332|   315|   291|
   353|   342|   333|   316|   292|## 2026-04-21 ~23:55 CDT -- Codemaster handback pattern established
   354|   343|   334|   317|   293|
   355|   344|   335|   318|   294|Alex identified that codemaster (Opus, expensive) was burning turns on mechanical tasks like `git commit`, `cp`, and `git push`. Established the codemaster handback pattern: codemaster writes code only, then explicitly stops and lists what it changed. Hermes handles all post-code orchestration (commit, copy to preview repo, push to Pages, PROJECT_LOG update, Discord notification) via direct terminal calls at zero LLM cost. Saved to `claude-code` skill and `branson-dashboard-maintenance` skill. Also encoded in PROJECT_LOG as standing rule.
   356|   345|   336|   319|   295|
   357|   346|   337|   320|   296|**Rule going forward:** Every codemaster task brief ends with the handback instruction block. Codemaster must NOT run git, cp, push, or log commands.
   358|   347|   338|   321|   297|
   359|   348|   339|   322|   298|---
   360|   349|   340|   323|   299|
   361|   350|   341|   324|   300|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   362|   351|   342|   325|   301|
   363|   352|   343|   326|   302|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73). Verdict: PASS WITH WARNINGS. 5 fixes applied and committed as `891ce59`, pushed to Pages:
   364|   353|   344|   327|   303|
   365|   354|   345|   328|   304|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   366|   355|   346|   329|   305|2. hookup_pages.py: idempotency guard (skip if site-header already present)
   367|   356|   347|   330|   306|3. hookup_pages.py: data-mode regex scoped to `<html>` tag only; re-ran on 3 static pages
   368|   357|   348|   331|   307|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   369|   358|   349|   332|   308|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   370|   359|   350|   333|   309|
   371|   360|   351|   334|   310|**Remaining LOW items (non-blocking, Phase 2 cleanup):**
   372|   361|   352|   335|   311|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   373|   362|   353|   336|   312|- audit_thumbs.py divide-by-zero guard
   374|   363|   354|   337|   313|- tags_str/slug not html.escaped in generator template
   375|   364|   355|   338|   314|- attractions.html inline style block duplicates components.css rules
   376|   365|   356|   339|   315|
   377|   366|   357|   340|   316|---
   378|   367|   358|   341|   317|
   379|   368|   359|   342|   318|## 2026-04-21 ~16:30 CDT -- Phase 2-prep: interactive picks + GitHub Pages deploy
   380|   369|   360|   343|   319|
   381|   370|   361|   344|   320|Autonomous session continued after Phase 4. Heart buttons in attractions.html now wired to picks.js via a name-chooser modal (Phase 1 honor-system -- no auth, localStorage only). Added hello banner showing current user. Attractions dashboard live on GitHub Pages with 132 cards, 39 filter tags, 174 thumbnails, and working wishlist. Supabase schema SQL written (Alex must run manually). picks.js scaffold ready for Phase 2 Supabase wiring.
   382|   371|   362|   345|   321|
   383|   372|   363|   346|   322|**Artifacts:**
   384|   373|   364|   347|   323|- Live: https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   385|   374|   365|   348|   324|- `web/attractions.html` — picks.js + name-chooser modal + hello banner wired (commit `412e496` in preview repo)
   386|   375|   366|   349|   325|- `data/supabase-phase2-schema.sql` — Supabase table & RLS (created in earlier session, ready to run)
   387|   376|   367|   350|   326|- `web/js/picks.js` — localStorage backend (Phase 1), Supabase hooks ready (Phase 2)
   388|   377|   368|   351|   327|- `data/autonomous-session-summary.md` — tester handoff doc
   389|   378|   369|   352|   328|
   390|   379|   370|   353|   329|**How it works (Phase 1):**
   391|   380|   371|   354|   330|1. User clicks a heart button → name-chooser modal appears
   392|   381|   372|   355|   331|2. User picks their name (8-name honor system: Alex, Mycah, Ashlyn, Jordan, Evie, Josh, Bee, or custom)
   393|   382|   373|   356|   332|3. picks.js saves to `vacdash:v1:picks` (localStorage)
   394|   383|   374|   357|   333|4. Hello banner shows "👋 Picking as [name]" with Change button
   395|   384|   375|   358|   334|5. Hearts persist across reload (same browser only)
   396|   385|   376|   359|   335|6. Supabase wiring deferred to Phase 2 (Alex must run schema + fill SUPABASE_* config in picks.js)
   397|   386|   377|   360|   336|
   398|   387|   378|   361|   337|**Next steps for Alex:**
   399|   388|   379|   362|   338|- Test on https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   400|   389|   380|   363|   339|- Run `data/supabase-phase2-schema.sql` in Supabase dashboard when ready for Phase 2
   401|   390|   381|   364|   340|- Update `web/js/picks.js` to add SUPABASE_URL + SUPABASE_ANON_KEY + user auth
   402|   391|   382|   365|   341|
   403|   392|   383|   366|   342|---
   404|   393|   384|   367|   343|
   405|   394|   385|   368|   344|## 2026-04-21 15:45 CDT — Phase 4b-4h: Design system extraction complete (autonomous execution)
   406|   395|   386|   369|   345|
   407|   396|   387|   370|   346|**Execution completed while Alex was away.** All CSS extracted from `card-density.html` mockup, reorganized into semantic token system, and integrated across five production pages. 132 attractions rendered as filterable card grid with SVG fallbacks. Verification pass: all pages link tokens.css and include shared nav.
   408|   397|   388|   371|   347|
   409|   398|   389|   372|   348|**Work completed:**
   410|   399|   390|   373|   349|- **Phase 4b** (commit `7fa638d`): `web/css/tokens.css` (semantic tokens) + `web/css/themes/trail.css` (Ozarks palette)
   411|   400|   391|   374|   350|- **Phase 4c** (commit `206ceb3`): `web/css/components.css` — 500+ lines extracted from mockup, all cards/nav/chips, class renames applied (ccard→card--light BEM), accessibility built in
   412|   401|   392|   375|   351|- **Phase 4d** (commit `04a0697`): `web/svg-fallbacks/[a-z].svg` — 26 gradient SVGs, Trail palette cycled, one per letter
   413|   402|   393|   376|   352|- **Phase 4e** (commit `ab0761c`): `scripts/generate_dashboard.py` refactored — hardcoded `/Users/alex` → `Path(__file__).parent.parent`, iCloud path removed, added `render_head()` and `render_nav()` partials
   414|   403|   394|   377|   353|- **Phase 4f** (integrated in 4e): `web/attractions.html` server-rendered from `data/attractions.json` (132 items after filtering), fully functional tag filters, inline SVG fallbacks for missing thumbs
   415|   404|   395|   378|   354|- **Phase 4g** (commit `1d89436`): `scripts/hookup_pages.py` created, injected shared `<head>` + nav into `index.html`, `event-timeline.html`, `people-timeline.html` (plus theme toggle script + storage listener)
   416|   405|   396|   379|   355|
   417|   406|   397|   380|   356|**Autonomous decisions (judgment calls documented):**
   418|   407|   398|   381|   357|1. **Accent tokens:** Added `--accent-sand`, `--accent-clay`, `--accent-dusk` to tokens.css to preserve component abstraction (components never reference --moss directly)
   419|   408|   399|   382|   358|2. **SVG fallback strategy:** Inline SVG into HTML (not separate <img>), reduces HTTP requests, works offline
   420|   409|   400|   383|   359|3. **Slug fallback:** If thumb missing and SVG fallback missing, render letter as inline div (unlikely case, failsafe)
   421|   410|   401|   384|   360|4. **Phase 4f scope:** Kept to attractions.html only; shows.html hooks up via generator but not rebuilt yet (intentional — matches spec)
   422|   411|   402|   385|   361|5. **Page hookup timing:** Ran hookup_pages.py after generator to inject shared head/nav (order matters for theme script placement)
   423|   412|   403|   386|   362|6. **Verification scope:** Checked all 5 pages for tokens.css link + site-header nav (not full HTML validity — that's Phase 2)
   424|   413|   404|   387|   363|
   425|   414|   405|   388|   364|**Files created/modified:**
   426|   415|   406|   389|   365|- `web/css/tokens.css` (new)
   427|   416|   407|   390|   366|- `web/css/themes/trail.css` (new)
   428|   417|   408|   391|   367|- `web/css/components.css` (new, 700+ lines)
   429|   418|   409|   392|   368|- `web/svg-fallbacks/[a-z].svg` (26 new)
   430|   419|   410|   393|   369|- `web/attractions.html` (rebuilt)
   431|   420|   411|   394|   370|- `web/shows.html` (hooked up)
   432|   421|   412|   395|   371|- `web/index.html` (hooked up)
   433|   422|   413|   396|   372|- `web/event-timeline.html` (hooked up)
   434|   423|   414|   397|   373|- `web/people-timeline.html` (hooked up)
   435|   424|   415|   398|   374|- `scripts/generate_dashboard.py` (refactored)
   436|   425|   416|   399|   375|- `scripts/hookup_pages.py` (new)
   437|   426|   417|   400|   376|
   438|   427|   418|   401|   377|**Test results:** All 5 production pages pass verification (tokens.css link + nav present). attractions.html displays 132 cards, filters work client-side (no backend yet), SVG fallbacks render for missing thumbnails.
   439|   428|   419|   402|   378|
   440|   429|   420|   403|   379|**Known gaps (intentional, Phase 2 scope):**
   441|   430|   421|   404|   380|- No persistent wishlist backend
   442|   431|   422|   405|   381|- Test data banner remains in attractions.html (Phase 2 will remove when backend connects)
   443|   432|   423|   406|   382|- No dark mode theme variants beyond Trail
   444|   433|   424|   407|   383|- SVG fallbacks are placeholder gradients, not real images
   445|   434|   425|   408|   384|
   446|   435|   426|   409|   385|---
   447|   436|   427|   410|   386|
   448|   437|   428|   411|   387|## 2026-04-21 14:15 CDT — Phase 4a: pre-flight backups + project log created
   449|   438|   429|   412|   388|
   450|   439|   430|   413|   389|Alex approved `docs/phase4-plan.md` (option A) with all three assumptions stated. Phase 4 (design system extraction) begins. Backed up the six files Phase 4 will touch into `.backups/2026-04-21-pre-phase-4/`: attractions.html, shows.html, index.html, event-timeline.html, people-timeline.html, generate_dashboard.py. Created this project log to anchor future context.
   451|   440|   431|   414|   390|
   452|   441|   432|   415|   391|**Decisions locked coming in:**
   453|   442|   433|   416|   392|- Canonical card geometry: `card-density.html` @ `--radius-card: 18px`
   454|   443|   434|   417|   393|- Branch strategy: small commits on `main`, no feature branch
   455|   444|   435|   418|   394|- Backup scope: six files listed above, git as safety net for anything else
   456|   445|   436|   419|   395|
   457|   446|   437|   420|   396|**Out-of-scope for Phase 4:** Phase 2 backend (Supabase), non-attractions page rebuilds, filter row JS, trending/first-pick data, auth, alternate themes (Cartridge/Lakeside/colorblind/outdoor), repo restructure, wordmark.
   458|   447|   438|   421|   397|
   459|   448|   439|   422|   398|**Artifacts:**
   460|   449|   440|   423|   399|- `.backups/2026-04-21-pre-phase-4/` (6 files)
   461|   450|   441|   424|   400|- `docs/PROJECT_LOG.md` (this file)
   462|   451|   442|   425|   401|
   463|   452|   443|   426|   402|---
   464|   453|   444|   427|   403|
   465|   454|   445|   428|   404|## 2026-04-21 14:00 CDT — Phase 4 plan committed
   466|   455|   446|   429|   405|
   467|   456|   447|   430|   406|Committed `docs/phase4-plan.md` (commit `b866c1a`). Cites prior locked decisions from Round 7 spec + Phase 1 Implementation Grill Q1–Q48. Surfaces three genuinely-open setup questions (card geometry, branch strategy, backup scope). Verified live preview site at https://alexshultz.github.io/vacation-dashboard-previews/ is reachable and hosts button-study, card-density, and swipe-browse mockups for testers (Mycah, Jordan, Ashlyn).
   468|   457|   448|   431|   407|
   469|   458|   449|   432|   408|---
   470|   459|   450|   433|   409|
   471|   460|   451|   434|   410|## 2026-04-21 13:49 CDT — Archived stale color-skin mockups
   472|   461|   452|   435|   411|
   473|   462|   453|   436|   412|Commit `c416130`. Deleted `web/mockups/mockup-a.html` (Cartridge), `mockup-b.html` (Lakeside), `mockup-c.html` (Trail). Palette was already locked earlier: cream (#FBF6EC) + moss (#3F6B3A) + lake (#2A6A8A) + sand + clay + dusk, with Lexend display / Atkinson Hyperlegible body. The three color-skin mockups were predecessors superseded by the two density studies (`card-density.html`, `swipe-browse.html`). Leaving them in the tree caused Hermes to wrongly re-open the palette question in this session. Cleaned up to prevent future drift.
   474|   463|   454|   437|   413|
   475|   464|   455|   438|   414|---
   476|   465|   456|   439|   415|
   477|   466|   457|   440|   416|## 2026-04-21 13:26 CDT — Phase 3b: tag pills + client-side filter on shows dashboard
   478|   467|   458|   441|   417|
   479|   468|   459|   442|   418|Commit `2584340`. Added tag-pill rendering and OR-based filter panel to `web/shows.html`. iOS compatibility bugs surfaced during testing were fixed. Built on old inline CSS + Tailwind dark theme (predates design system), so this work is polish on a surface that Phase 4g will hook up to tokens.css.
   480|   469|   460|   443|   419|
   481|   470|   461|   444|   420|---
   482|   471|   462|   445|   421|
   483|   472|   463|   446|   422|## 2026-04-21 13:05 CDT — Phase 3: v2 tag merge into attractions.json (139/139)
   484|   473|   464|   447|   423|
   485|   474|   465|   448|   424|Commit `57b00d0`. Classified tags merged from `data/tag-proposals-v2.csv` into `data/attractions.json`. Pre-merge backup at `data/attractions.json.pre-phase3.bak`.
   486|   475|   466|   449|   425|
   487|   476|   467|   450|   426|---
   488|   477|   468|   451|   427|
   489|   478|   469|   452|   428|## 2026-04-21 12:58 CDT — Phase 2: full classification run complete
   490|   479|   470|   453|   429|
   491|   480|   471|   454|   430|Commit `0e87e93`. Ran `scripts/classify_tags_frontier.py` against Claude Sonnet 4.6 across all 139 attractions. Zero failures. $1.38 spent. All 26 teaching examples respected semantically. Produced `data/tag-proposals-v2.csv`, `data/tag-proposals-diff.md`, `data/tag-proposals-v2.meta.json`. One warning: `audience_vibe: unknown 'educational'` on `veterans-memorial-museum`.
   492|   481|   472|   455|   431|
   493|   482|   473|   456|   432|---
   494|   483|   474|   457|   433|
   495|   484|   475|   458|   434|## 2026-04-21 12:47 CDT — Phase 2: classify_tags_frontier.py committed
   496|   485|   476|   459|   435|
   497|   486|   477|   460|   436|Commit `f541284`. Frontier classifier script landed after Claude Code review, following answers captured in `docs/phase2-grill-answers.md` (60 Qs).
   498|   487|   478|   461|   437|
   499|   488|   479|   462|   438|---
   500|   489|   480|   463|   439|
   501|   490|   481|   464|   440|## 2026-04-21 09:33 CDT — Initial commit
   502|   491|   482|   465|   441|
   503|   492|   483|   466|   442|Commit `cd70c3e`. Branson 2026 vault initialized as git repo after Phase 1 cleanup. Included: `web/` (attractions, shows, index, timelines, mockups), `web/DESIGN.md`, `web/assets/` (thumbs, logos), `scripts/`, `data/`, `sources/`.
   504|   493|   484|   467|   443|
   505|   494|   485|   468|   444|---
   506|   495|   486|   469|   445|
   507|   496|   487|   470|   446|## Pre-vault history (before git)
   508|   497|   488|   471|   447|
   509|   498|   489|   472|   448|Earlier design-track work is captured in source docs, not this log:
   510|   499|   490|   473|   449|- `~/vaults/Alex/Vacation/Claude Design Grill-Me.md` — 68 initial design Qs + Phase 1 implementation Q1–Q48
   511|   500|   491|   474|   450|- `~/vaults/Alex/Vacation/Claude Design Round 5 - Testers + Open Questions.md`
   512|   501|