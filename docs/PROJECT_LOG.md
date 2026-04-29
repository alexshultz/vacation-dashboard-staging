## 2026-04-28 -- stale web/mockups/ removed from production

**Commit:** `f259e7c` on `vacation-dashboard.git main`

**What:** Deleted 4 stale development mockup files from `web/mockups/` in the production repo. Files were never referenced by any live page, never served by GitHub Pages, and the rsync deploy workflow already excluded them. The `web/` directory was an artifact from early development that the rsync `--delete` flag would have cleaned on next promotion anyway. Removed now to eliminate the recurring "not empty, cannot delete" rsync warning on every deploy.

**Verification:** T2 cold verifier confirmed 0 references to `web/` in any root HTML file; no deploy scripts affected; safe to delete.

**Side effect:** `--exclude="mockups"` flag in `branson-lazlo-delegation` skill is now redundant -- patched out.

---
     1|## 2026-04-28 -- admin upsert fix promoted to production
     2|
     3|**Promoted:** staging commit `3a183d1` → production commit `d27adb3`
     4|
     5|**URL:** https://vacation.creeperbomb.com/admin.html
     6|
     7|**Notes:** `admin.html` was new to production repo (first promotion of the admin page). rsync warning "not empty, cannot delete ./web" is harmless -- subdirectory already existed in destination. 12 files changed (11 cache-busted HTML + admin.html new).
     8|
     9|---
    10|     1|## 2026-04-28 -- admin upsert fix deployed to staging
    11|     2|
    12|     3|**Task:** Fix 409 unique constraint violation on admin.html schedule overrides save.
    13|     4|
    14|     5|**Root cause (Council confirmed):** PostgREST v12 requires BOTH `?on_conflict=event_id,field` in the URL AND `Prefer: resolution=merge-duplicates` in the header to emit `INSERT ... ON CONFLICT DO UPDATE`. The URL param was present; the header directive was missing. Without it, PostgREST issued a plain INSERT, which hit the UNIQUE(event_id, field) constraint and returned 23505.
    15|     6|
    16|     7|**Fix:** Single-line change to `saveOverrides()` in `web/admin.html` line 335:
    17|     8|- BEFORE: `'Prefer': 'return=minimal'`
    18|     9|- AFTER: `'Prefer': 'return=minimal,resolution=merge-duplicates'`
    19|    10|
    20|    11|**Process:** T3 Council of Minds (5 roles: Explorer, Verifier, Skeptic, Weaver, Archivist + Refiner). Verifier confirmed from PostgREST v12.2 docs; Archivist confirmed from Plan.hs source code. All 5 roles converged. RLS policies verified (SELECT, INSERT, UPDATE, DELETE all present for anon). Intra-batch dup ruled out structurally. updated_at refresh handled by existing BEFORE UPDATE trigger.
    21|    12|
    22|    13|**Verification:** All 6 safety checks passed. git diff scope: web/admin.html only.
    23|    14|
    24|    15|**Status:** Deployed to staging (vacation-dev.creeperbomb.com). Awaiting Alex "ship it" for production.
    25|    16|
    26|    17|---
    27|    18|     1|## 2026-04-28 -- feat: Supabase Phase 2 activation
    28|    19|     2|
    29|    20|     3|**What changed:**
    30|    21|     4|- `web/js/picks.js`: `init()` now fires a non-blocking async hydration fetch from Supabase on user set -- merges server picks into localStorage (Supabase wins per slug), notifies listeners for changed slugs, silent on failure
    31|    22|     5|- `web/js/picks.js`: `sbSet()` now shows an on-screen red error banner (background #F8DDD5) on any Supabase write failure -- includes one-retry button; localStorage write preserved regardless
    32|    23|     6|- `web/js/picks.js`: `fetchAllWishlists()` query expanded from `state=eq.wishlist` to `state=in.(wishlist,committing)` -- return shape unchanged
    33|    24|     7|- `web/js/picks.js`: dead code removed from `showBanner()` -- `retryFailed` parameter and unreachable branch eliminated
    34|    25|     8|- `web/attractions.html`: Phase 1 test banner (`🧪 Test data`) removed -- Phase 2 backend is now live
    35|    26|     9|- `web/attractions.html`: redundant Wisher Badges script block removed -- Avatar Stack (pre-existing, polls every 30s) is the canonical wishlist renderer
    36|    27|    10|
    37|    28|    11|**Deployed to staging:** vacation-dev.creeperbomb.com
    38|    29|    12|**Promoted to production:** vacation.creeperbomb.com
    39|    30|    13|
    40|    31|    14|---
    41|    32|    15|
    42|    33|    16|## 2026-04-27 -- fix: Quick Pick nav instruction corrected in help.json
    43|    34|    17|
    44|    35|    18|**What changed:**
    45|    36|    19|- `web/help.json`: Quick Pick section body corrected -- removed stale reference to "Quick Pick button inside Activities"; replaced with "Find it in the menu under **Quick Pick**" (reflects April 26 nav refactor that promoted Quick Pick to top-level nav)
    46|    37|    20|
    47|    38|    21|**Promoted to production:** vacation.creeperbomb.com
    48|    39|    22|
    49|    40|    23|---
    50|    41|    24|
    51|    42|    25|     1|## 2026-04-27 -- UI polish batch: appearance controls, nav, profile fixes
    52|    43|    26|     2|
    53|    44|    27|     3|**What changed:**
    54|    45|    28|     4|- `web/css/components.css`: profile date row always-stacked (grid-template-columns: 1fr, media query removed)
    55|    46|    29|     5|- `web/profile.html`: Help/FAQ link removed from bottom of profile page
    56|    47|    30|     6|- `web/js/site.js`: Appearance toggle -- ⚙️ System -> 🌓 Auto, button UA background fixed (background: none)
    57|    48|    31|     7|- `web/js/site.js`: Profile link added to desktop nav bar (id=profile-btn-nav); hamburger profile link renamed id=profile-btn-hamburger; syncBadge() updated to querySelectorAll both
    58|    49|    32|     8|- `web/profile.html` + `web/js/site.js` + `web/css/components.css`: "Mode" -> "Appearance" label; icons added to seg buttons (🌓/☀️/🌙); hamburger label always reads "[icon] Appearance"; active pill gets green border (var(--status-yes))
    59|    50|    33|     9|- `web/profile.html`: Saved toast removed (toast(), saved(), toast-wrap div, all 7 call sites)
    60|    51|    34|    10|- `web/js/site.js`: hamburger-link border: none added (removed UA button border box around Appearance)
    61|    52|    35|    11|- `web/js/site.js`: :focus:not(:focus-visible) outline suppression on hamburger-theme-toggle
    62|    53|    36|    12|- CNAME bug fixed: rsync --exclude="CNAME" added to all deploy commands (SOUL.md + skill patched)
    63|    54|    37|    13|- GitHub token extraction corrected: sed -n 's/^GITHUB_TOKEN=*** instead of cut (base64 = truncation)
    64|    55|    38|    14|
    65|    56|    39|    15|**Promoted to production:** vacation.creeperbomb.com
    66|    57|    40|    16|
    67|    58|    41|    17|---
    68|    59|    42|    18|
    69|    60|    43|    19|## 2026-04-27 -- index.html h1 renamed; ROADMAP updated; staging synced
    70|    61|    44|    20|
    71|    62|    45|    21|**What changed:**
    72|    63|    46|    22|- `web/index.html`: h1 changed from "Events" to "Upcoming Activities"
    73|    64|    47|    23|- `docs/ROADMAP.md`: status updated to 2026-04-27; help.html and hamburger work marked done; new sprint items added (Supabase activation, admin editor, INITIAL_VISIBLE in admin); tester pass deferred
    74|    65|    48|    24|- Staging repo synced to production (GAP 5 resolved)
    75|    66|    49|    25|- Deployed to GitHub Pages (production + staging)
    76|    67|    50|    26|
    77|    68|    51|    27|---
    78|    69|    52|    28|
    79|    70|    53|    29|## 2026-04-26 -- Menu refactor: profile + theme toggle move to hamburger, Quick Pick promoted
    80|    71|    54|    30|
    81|    72|    55|    31|**What changed:**
    82|    73|    56|    32|- `web/js/site.js`: NAV_LINKS expanded to 8 items (Quick Pick added between Activities and Wishlist)
    83|    74|    57|    33|- `web/js/site.js`: buildHeader() stripped to site-logo + hamburger-btn + site-nav only
    84|    75|    58|    34|- `web/js/site.js`: buildHamburgerPanel() now includes all 8 nav links + hr separator + theme-toggle button + profile link at bottom
    85|    76|    59|    35|- `web/js/site.js`: hamburger-btn display:flex always (no mobile-only restriction -- hamburger is now universal settings access)
    86|    77|    60|    36|- `web/js/site.js`: dark mode handler sets button textContent after each cycle (⚙️ System / ☀️ Light / 🌙 Dark)
    87|    78|    61|    37|- `web/js/site.js`: modeLabel() helper added; initial label set from localStorage after panel injection
    88|    79|    62|    38|- `web/js/site.js`: NAV_ALIASES quick-pick.html entry removed (matches directly to Quick Pick nav item now)
    89|    80|    63|    39|- `web/attractions.html`: removed <a class="qp-nav-btn"> Quick Pick shortcut from filter row
    90|    81|    64|    40|- syncBadge() unchanged -- getElementById('profile-btn') still resolves in panel
    91|    82|    65|    41|- Deployed to GitHub Pages
    92|    83|    66|    42|
    93|    84|    67|    43|---
    94|    85|    68|    44|
    95|    86|    69|    45|## 2026-04-26 -- Mobile hamburger menu (Priority 4)
    96|    87|    70|    46|
    97|    88|    71|    47|**What changed:**
    98|    89|    72|    48|- `web/js/site.js`: BOTTOM_TABS trimmed from 6 to 3 (Home, Activities, Wishlist)
    99|    90|    73|    49|- Hamburger ☰ button added to header (desktop hidden, mobile visible <720px)
   100|    91|    74|    50|- Full 7-item dropdown panel injected below header, initially hidden
   101|    92|    75|    51|- CSS injected once into document.head (guarded by site-hamburger-styles id)
   102|    93|    76|    52|- Panel closes on: second hamburger tap, outside click, Escape key
   103|    94|    77|    53|- aria-expanded tracks open/closed state for accessibility
   104|    95|    78|    54|- Suggested, Timeline, People now accessible via hamburger menu on mobile
   105|    96|    79|    55|- Deployed to GitHub Pages
   106|    97|    80|    56|
   107|    98|    81|    57|---
   108|    99|    82|    58|
   109|   100|    83|    59|## 2026-04-26 -- index.html day-section banding + Show All/Show Fewer toggle
   110|   101|    84|    60|
   111|   102|    85|    61|**What changed:**
   112|   103|    86|    62|- `web/index.html`: render() rewritten to group events into day-section container divs
   113|   104|    87|    63|- Alternating Trail-palette backgrounds: even days moss 8% tint, odd days sand 10% tint (both blended against --color-bg, works in light + dark mode)
   114|   105|    88|    64|- Day label spans at 45% opacity above each day's cards ("📅 May 23 — Saturday" etc.)
   115|   106|    89|    65|- New `applyVisibilityState(showAll)` function -- single source of truth for card/section visibility
   116|   107|    90|    66|- First INITIAL_VISIBLE (6) cards visible on load; remaining cards and empty day-sections hidden
   117|   108|    91|    67|- "Show All ↓" button -- persists in DOM, toggles to "Show Fewer ↑" on click, never hidden
   118|   109|    92|    68|- Old events-overflow/show-more-btn architecture fully removed (grep -c events-overflow = 0)
   119|   110|    93|    69|- `showingAll` module-level boolean tracks toggle state
   120|   111|    94|    70|- toggleAll() and setupMobileCollapse() unchanged
   121|   112|    95|    71|- Deployed to GitHub Pages
   122|   113|    96|    72|
   123|   114|    97|    73|---
   124|   115|    98|    74|
   125|   116|    99|    75|## 2026-04-26 -- index.html progressive disclosure (Priority 2)
   126|   117|   100|    76|
   127|   118|   101|    77|**What changed:**
   128|   119|   102|    78|- `web/index.html`: first `INITIAL_VISIBLE` (default: 6) events visible on load
   129|   120|   103|    79|- Remaining 22 events in `<div id="events-overflow" hidden>` -- revealed by "Show all 22 more ↓" button
   130|   121|   104|    80|- `INITIAL_VISIBLE` declared as `let` (not const) -- easy to change without code edit
   131|   122|   105|    81|- Hero subtitle updates dynamically from `eventsData.length` after fetch (no longer hardcoded "28")
   132|   123|   106|    82|- Button uses `btn.style.display = 'none'` in click handler (not `btn.hidden` -- CLAUDE.md pitfall avoided)
   133|   124|   107|    83|- No collapse-back behavior -- once revealed, stays revealed
   134|   125|   108|    84|- All existing render functions (`toggleAll`, `setupMobileCollapse`) unchanged
   135|   126|   109|    85|- Deployed to GitHub Pages
   136|   127|   110|    86|
   137|   128|   111|    87|---
   138|   129|   112|    88|
   139|   130|   113|    89|## 2026-04-26 -- schedule.json: single source of truth for 28 trip events
   140|   131|   114|    90|
   141|   132|   115|    91|**What changed:**
   142|   133|   116|    92|- Created `web/schedule.json` with 28 events migrated from inline JS arrays in event-timeline.html and index.html
   143|   134|   117|    93|- Schema: id, title, date, duration, priority, catalogRef (null), startTime (null), travelMinutes (null), interested, undecided, notInterested, noResponse
   144|   135|   118|    94|- Corrected two title errors: "Knife" → "Knife Forge", "Simon & Garfield" → "Simon & Garfunkel"
   145|   136|   119|    95|- 24 events matched for duration; 4 events received default durations (Dogwood 6.0, Dogwood Canyon Horse 1.5, Dogwood Canyon Tram 1.5, Go Karts 1.5); 1 event-timeline-only title dropped ("Dogwood Canyon (all)")
   146|   137|   120|    96|- `web/event-timeline.html`: replaced inline const eventsData array with fetch('schedule.json')
   147|   138|   121|    97|- `web/index.html`: replaced inline const eventsData array with fetch('schedule.json')
   148|   139|   122|    98|- CLAUDE.md: added safety check -- grep -c 'fetch.*schedule.json' web/event-timeline.html must return >= 1
   149|   140|   123|    99|- catalogRef candidates identified for 11 events (set to null; Priority 9 coordinator tool will populate)
   150|   141|   124|   100|- Deployed to GitHub Pages
   151|   142|   125|   101|
   152|   143|   126|   102|**Nullable forward-compat fields (all null, populated by future tasks):**
   153|   144|   127|   103|- catalogRef: slug link to data/attractions.json catalog entry
   154|   145|   128|   104|- startTime: "HH:MM" 24h string (Priority 9 coordinator tool)
   155|   146|   129|   105|- travelMinutes: drive minutes from Watermill Cove (Priority 9 coordinator tool)
   156|   147|   130|   106|
   157|   148|   131|   107|---
   158|   149|   132|   108|
   159|   150|   133|   109|## 2026-04-26 -- Staging environment created + font bug fixes deployed
   160|   151|   134|   110|
   161|   152|   135|   111|**What changed:**
   162|   153|   136|   112|- Created `vacation-dashboard-staging` repo at https://github.com/alexshultz/vacation-dashboard-staging
   163|   154|   137|   113|- GitHub Pages enabled at https://alexshultz.github.io/vacation-dashboard-staging/
   164|   155|   138|   114|- Local staging clone at `/Users/alex/code/vacation-dashboard-staging/`
   165|   156|   139|   115|- Initial staging snapshot deployed (matches production at time of creation)
   166|   157|   140|   116|- CLAUDE.md updated with two-target deploy table and staging-first rule
   167|   158|   141|   117|- Font bug fixes deployed to production: Star Jedi removed from `--font-display` in star-wars.css; 12 reading copy selectors bumped to 17px desktop / 18px mobile in components.css
   168|   159|   142|   118|- Three HTML files (people-timeline.html, profile.html, shows.html) reverted after lazlo made unsolicited eyebrow element removals -- not part of the task brief. Added note to future briefs: do not modify any HTML element not explicitly named in the task.
   169|   160|   143|   119|
   170|   161|   144|   120|**Deploy rule effective May 8:** All new feature work goes to staging first. Production only receives tested, reviewed work.
   171|   162|   145|   121|
   172|   163|   146|   122|---
   173|   164|   147|   123|
   174|   165|   148|   124|## 2026-04-26 -- help.html: runtime JSON renderer + content + profile Help link
   175|   166|   149|   125|
   176|   167|   150|   126|**What changed:**
   177|   168|   151|   127|- Created `web/help.json` with 11 sections of family-facing help content (JSON with minimal Markdown in body strings per ADR-009)
   178|   169|   152|   128|- Rewrote `web/help.html` `<main>`: stripped hard-coded sections, added fetch+IIFE renderer supporting `\n\n` paragraphs, `- ` bullets, and `**bold**`
   179|   170|   153|   129|- Added Help entry-point link to `web/profile.html` (plain `<a>` -- `btn-secondary` class not present in components.css)
   180|   171|   154|   130|- Updated CLAUDE.md pre-push safety checks: added `grep -c 'fetch.*help.json' web/help.html` must return 1
   181|   172|   155|   131|- ADR-009 written (runtime JSON fetch over hard-coded HTML and build-time generator)
   182|   173|   156|   132|- Deployed to GitHub Pages
   183|   174|   157|   133|
   184|   175|   158|   134|**Known cosmetic issue (non-blocking, fix next lazlo pass on help.html):**
   185|   176|   159|   135|Code reviewer flagged WARN item 12: the `<script>` renderer block sits after `</main>` rather than inside `<main>`, and the `<div class="page-hero">` is inside `<main>` alongside the render target. Both are functionally correct but deviate slightly from the brief spec. Fix on next help.html touch.
   186|   177|   160|   136|
   187|   178|   161|   137|**Writing note:** All prose in help.json uses active voice with no dash-based pauses. Double-hyphen substitutes for em dash are prohibited per Alex's style guidance -- the spirit is clean, direct sentences, not just character substitution.
   188|   179|   162|   138|
   189|   180|   163|   139|---
   190|   181|   164|   140|
   191|   182|   165|   141|## 2026-04-26 -- Star Wars Theme: Star Jedi Font Integration + Theme Review
   192|   183|   166|   142|
   193|   184|   167|   143|**What changed:**
   194|   185|   168|   144|- Copied `Starjedi.ttf` and `Starjhol.ttf` to `web/assets/fonts/star_jedi/` (flattened from vault source)
   195|   186|   169|   145|- Updated `web/css/themes/star-wars.css`: added `@font-face` declarations, added `--font-display` token (Star Jedi primary, Orbitron fallback), fixed `--color-ink-dim` in dark mode from `#5A7890` → `#6685A0` (WCAG AA fix, was 4.28:1, now 5.14:1)
   196|   187|   170|   146|- Updated `web/themes/DESIGN-star-wars.md`: typography.display fontFamily + note field, Overview font source paragraph
   197|   188|   171|   147|- Star Jedi scoped to display role only (2rem); Orbitron retained for headline and nav-label
   198|   189|   172|   148|- Star Wars theme NOT activated -- remains ready for activation at Alex's direction
   199|   190|   173|   149|- Deployed to GitHub Pages
   200|   191|   174|   150|
   201|   192|   175|   151|**Auth note:** Discovered `~` in terminal sessions resolves to sandboxed home, not `/Users/alex`. Fixed by using absolute path `/Users/alex/.hermes/.env` for API key extraction. Same fix needed for GitHub token on every lazlo invocation.
   202|   193|   176|   152|
   203|   194|   177|   153|---
   204|   195|   178|   154|
   205|   196|   179|   155|## 2026-04-25 -- Multi-Model Documentation Audit (~27 rounds, ~65+ fixes)
   206|   197|   180|   156|
   207|   198|   181|   157|**What changed:**
   208|   199|   182|   158|- Ran iterative Gemini 2.5 Pro cold-start audit across all 5 core agent docs (SOUL.md, CLAUDE.md, ONBOARDING.md, DECISIONS.md, ROADMAP.md).
   209|   200|   183|   159|- Applied ~65+ genuine documentation fixes across 27 rounds. Key improvements:
   210|   201|   184|   160|
   211|   202|   185|   161|**Critical fixes:**
   212|   203|   186|   162|- Added `data/people.json` to vault `.gitignore` -- PII (phone/email) was unprotected from `git add -A`.
   213|   204|   187|   163|- Clarified that `data/people.json` must never be committed (vault .gitignore now enforces this).
   214|   205|   188|   164|- Resolved contradiction: ONBOARDING.md "no git" comment vs SOUL.md `git commit` step -- vault IS a git repo (no remote), description updated.
   215|   206|   189|   165|- Fixed CLAUDE.md pitfall table `.git/` recovery -- was truncated to 3 words; now has full 7-step command.
   216|   207|   190|   166|
   217|   208|   191|   167|**Workflow fixes (SOUL.md):**
   218|   209|   192|   168|- Step 2 (grill-me): added Discord notify step -- "post note to Alex after writing grillme file".
   219|   210|   193|   169|- Step 3 (lazlo invocation): clarified pre-existing brief prompt variant; replaced ambiguous `[...]` bracket with separate note.
   220|   211|   194|   170|- Step 4 (cache-bust): changed to explicit `cd "$PREVIEW" &&` prefix so cwd is unambiguous.
   221|   212|   195|   171|- Step 6 (handback): added DECISIONS.md to post-session log steps; added "new page = add to sed list" reminder.
   222|   213|   196|   172|- Step 7: added SQL to non-trivial trigger list (CSS/JS/Python/SQL); added pre-existing brief exception inline.
   223|   214|   197|   173|- Tester tracking: clarified Alex relays tester reports (testers are on iMessage, not in #branson-2026).
   224|   215|   198|   174|- delegate_task restriction: expanded to explicitly permit Council of Minds reasoning roles.
   225|   216|   199|   175|- export `VAULT=`/`PREVIEW=` (was `set`).
   226|   217|   200|   176|- Lazlo cd command: changed `~/vaults/Vacation/Branson\ 2026` to quoted absolute path.
   227|   218|   201|   177|
   228|   219|   202|   178|**ONBOARDING.md fixes:**
   229|   220|   203|   179|- Added SOUL.md conflict-rule blockquote to Sources of Truth table.
   230|   221|   204|   180|- Added ONBOARDING.md itself to Sources of Truth table.
   231|   222|   205|   181|- Fixed `web/*.html` permission table: "Delegate all changes to lazlo; do not write directly".
   232|   223|   206|   182|- Clarified CLAUDE.md update rule: propose + Alex approves (was self-contradictory).
   233|   224|   207|   183|- Changed VACATION-AGENT-ONBOARDING.md write permission from YES to "With Alex approval".
   234|   225|   208|   184|- Unified non-trivial trigger definition (CSS/JS/Python/SQL, matches SOUL.md).
   235|   226|   209|   185|- Added entry-point link requirement to Pre-Launch Checklist `help.html` item.
   236|   227|   210|   186|- Added `(run from $PREVIEW -- script modifies files in cwd)` to cache_bust step.
   237|   228|   211|   187|- Updated lazlo prompt to match SOUL.md (pre-existing brief OR grill-me clause).
   238|   229|   212|   188|- Unified grill-me trigger wording (matches SOUL.md exactly).
   239|   230|   213|   189|- Fixed frozen file layout: `generate_attractions.py` guard wording -- removed "PREVENTS" claim; added "do not rely on this guard".
   240|   231|   214|   190|- Fixed "it will NOT overwrite files" -- changed to "it will not execute".
   241|   232|   215|   191|
   242|   233|   216|   192|**DECISIONS.md:**
   243|   234|   217|   193|- ADR-003: struck through superseded blacklist inline JS array entry.
   244|   235|   218|   194|- ADR-007 add-new-page rule: expanded from 4 to 6 steps.
   245|   236|   219|   195|
   246|   237|   220|   196|**ROADMAP.md:**
   247|   238|   221|   197|- Removed redundant `(branson26.family or similar)` from struck-through custom domain item.
   248|   239|   222|   198|- Last updated date updated to 2026-04-25.
   249|   240|   223|   199|
   250|   241|   224|   200|---
   251|   242|   225|   201|
   252|   243|   226|   202|## 2026-04-24 -- Sort + Visible Data-Layer Architecture
   253|   244|   227|   203|
   254|   245|   228|   204|**What changed:**
   255|   246|   229|   205|- Created `scripts/export_data.py`: reads `data/attractions.json` + `data/blacklist.json`, computes `sort_key` (article-stripped lowercase name), sets `visible` boolean (false if slug in blacklist), stable-sorts by `sort_key`, writes all 139 records to `web/data.json`.
   256|   247|   230|   206|- `web/data.json` regenerated: 139 total | 132 visible | 7 hidden. Pre-sorted alphabetically by sort_key.
   257|   248|   231|   207|- `web/attractions.html`: removed 24-slug inline BLACKLIST Set; render filter changed to `if (a.visible === false) return`.
   258|   249|   232|   208|- `web/quick-pick.html`: added `a.visible === false` guard in `filterAttractions()` (fixes 132 vs 139 count bug) and `updateDeckCount()` (fixes denominator inflation).
   259|   250|   233|   209|- `CLAUDE.md` updated: data flow diagram, canonical sources table, render loop section, quick pick section, pitfall table.
   260|   251|   234|   210|
   261|   252|   235|   211|**Bugs fixed:**
   262|   253|   236|   212|1. Sort: attractions now render in library alphabetical order (articles stripped) on both pages.
   263|   254|   237|   213|2. Count: browse view and quick pick now show identical 132 cards.
   264|   255|   238|   214|
   265|   256|   239|   215|**Architecture decision:**
   266|   257|   240|   216|Sort logic and blacklist filtering moved from client-side JS into the export script (single source of truth). HTML files are now dumb renderers -- they read pre-sorted, pre-filtered data.json and iterate it.
   267|   258|   241|   217|
   268|   259|   242|   218|**Process:** Council of Minds analysis -> Hermes self-check audit -> CodeMaster implementation -> CodeMaster review (APPROVED, 0 issues) -> CLAUDE.md update -> deploy.
   269|   260|   243|   219|
   270|   261|   244|   220|
   271|   262|   245|   221|# Branson 2026 Dashboard — Project Log
   272|   263|   246|   222|
   273|   264|   247|   223|**Purpose:** Timestamped, newest-first record of meaningful state changes. Future-Hermes reads this first after a context compression. Humans read it to understand where the project actually stands vs. where any single session thought it was.
   274|   265|   248|   224|
   275|   266|   249|   225|**Rules:**
   276|   267|   250|   226|- Newest at top. Append via insert after the header block, not at the bottom.
   277|   268|   251|   227|- Each entry: ISO timestamp header + one paragraph + optional bullet list of artifacts/commits.
   278|   269|   252|   228|- Commit this file alongside the commit it describes.
   279|   270|   253|   229|- Keep it narrow. Only state changes, pivots, decisions, failures. Not every message.
   280|   271|   254|   230|
   281|   272|   255|   231|---
   282|   273|   256|   232|
   283|   274|   257|   233|## 2026-04-23 -- 4 new themes committed; codemaster CSS review pending
   284|   275|   258|   234|
   285|   276|   259|   235|Four new theme CSS files were designed by the Council of Minds and committed. They follow the same private-palette + semantic-token override pattern as `trail.css`. They are NOT yet wired into any HTML page -- that requires codemaster review first. Alex plans to create additional themes; all theme CSS files should be batched and reviewed together before any are activated.
   286|   277|   260|   236|
   287|   278|   261|   237|**BACKLOG: Codemaster CSS review required before any theme is activated.**
   288|   279|   262|   238|- Review all files in `web/css/themes/` except `trail.css` (already in production)
   289|   280|   263|   239|- Verify each file only overrides tokens defined in `tokens.css` -- no direct `--moss`/`--lake` refs in components
   290|   281|   264|   240|- Verify dark mode blocks match `[data-mode="dark"]` selector pattern used by the rest of the system
   291|   282|   265|   241|- Verify contrast ratios meet AA on both light and dark modes
   292|   283|   266|   242|- No geometry, spacing, or typography changes permitted in theme files
   293|   284|   267|   243|
   294|   285|   268|   244|**Artifacts:**
   295|   286|   269|   245|- `web/css/themes/midnight.css` -- teens/night owls, dark indigo + neon
   296|   287|   270|   246|- `web/css/themes/sunshine.css` -- young kids, candy-bright summer carnival
   297|   288|   271|   247|- `web/css/themes/heritage.css` -- grandparents, aged parchment + colonial palette
   298|   289|   272|   248|- `web/css/themes/neon-country.css` -- wildcard, honky-tonk wood + neon signs
   299|   290|   273|   249|- Commit: d3c6642
   300|   291|   274|   250|
   301|   292|   275|   251|---
   302|   293|   276|   252|
   303|   294|   277|   253|## 2026-04-23 ~11:00 CDT — Documentation architecture overhaul + fetch(data.json) conversion
   304|   295|   278|   254|
   305|   296|   279|   255|Council of Minds synthesis session (Weaver + Archivist). Two changes in this session:
   306|   297|   280|   256|
   307|   298|   281|   257|1. **fetch(data.json) conversion (ADR-003):** `web/attractions.html` converted from ~130 statically baked card elements to a dynamic `fetch('data.json')` render loop via `renderCatalog()`. Blacklist slugs inlined as JS array. Quick Pick deck and filter chips now read DOM `data-*` attributes post-render. 10 stale duplicate cards removed first (see `.claude/sync-triple-change-task.md` for quality gates).
   308|   299|   282|   258|
   309|   300|   283|   259|2. **Documentation architecture overhaul:** CLAUDE.md was stale (last updated 2026-04-18, missing Quick Pick warning and fetch-loop architecture). Full rewrite: accurate architecture diagram, frozen-generator rules, GitHub Pages sync workflow, pitfall table, and mandatory codemaster handback block. Created `docs/DECISIONS.md` (ADR-lite) to replace scattered decision prose in PROJECT_LOG. All decisions from project history back-populated as ADR-001 through ADR-006.
   310|   301|   284|   260|
   311|   302|   285|   261|**Documentation structure now:**
   312|   303|   286|   262|- `CLAUDE.md` — live rules + architecture (agents auto-load, must be accurate)
   313|   304|   287|   263|- `docs/PROJECT_LOG.md` — timestamped state record (Hermes/human reads)
   314|   305|   288|   264|- `docs/DECISIONS.md` — ADR-lite for architectural choices (agents append, never delete)
   315|   306|   289|   265|
   316|   307|   290|   266|**Artifacts:**
   317|   308|   291|   267|- `CLAUDE.md` — full rewrite (2026-04-23)
   318|   309|   292|   268|- `docs/DECISIONS.md` — created, ADR-001 through ADR-006
   319|   310|   293|   269|- `docs/PROJECT_LOG.md` — this entry
   320|   311|   294|   270|
   321|   312|   295|   271|---
   322|   313|   296|   272|
   323|   314|   297|   273|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   324|   315|   298|   274|
   325|   316|   299|   275|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73).
   326|   317|   300|   276|Verdict: PASS WITH WARNINGS. 5 fixes applied:
   327|   318|   301|   277|
   328|   319|   302|   278|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   329|   320|   303|   279|2. hookup_pages.py: idempotency guard added (skip if site-header already present)
   330|   321|   304|   280|3. hookup_pages.py: data-mode regex scoped to <html> tag only; re-ran on 3 static pages
   331|   322|   305|   281|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   332|   323|   306|   282|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   333|   324|   307|   283|
   334|   325|   308|   284|Remaining LOW items (non-blocking, logged for Phase 2):
   335|   326|   309|   285|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   336|   327|   310|   286|- audit_thumbs.py divide-by-zero guard
   337|   328|   311|   287|- tags_str/slug not html.escaped in generator template
   338|   329|   312|   288|- attractions.html inline <style> block duplicates components.css rules
   339|   330|   313|   289|
   340|   331|   314|   290|---
   341|   332|   315|   291|
   342|   333|   316|   292|## 2026-04-21 ~23:55 CDT -- Codemaster handback pattern established
   343|   334|   317|   293|
   344|   335|   318|   294|Alex identified that codemaster (Opus, expensive) was burning turns on mechanical tasks like `git commit`, `cp`, and `git push`. Established the codemaster handback pattern: codemaster writes code only, then explicitly stops and lists what it changed. Hermes handles all post-code orchestration (commit, copy to preview repo, push to Pages, PROJECT_LOG update, Discord notification) via direct terminal calls at zero LLM cost. Saved to `claude-code` skill and `branson-dashboard-maintenance` skill. Also encoded in PROJECT_LOG as standing rule.
   345|   336|   319|   295|
   346|   337|   320|   296|**Rule going forward:** Every codemaster task brief ends with the handback instruction block. Codemaster must NOT run git, cp, push, or log commands.
   347|   338|   321|   297|
   348|   339|   322|   298|---
   349|   340|   323|   299|
   350|   341|   324|   300|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   351|   342|   325|   301|
   352|   343|   326|   302|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73). Verdict: PASS WITH WARNINGS. 5 fixes applied and committed as `891ce59`, pushed to Pages:
   353|   344|   327|   303|
   354|   345|   328|   304|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   355|   346|   329|   305|2. hookup_pages.py: idempotency guard (skip if site-header already present)
   356|   347|   330|   306|3. hookup_pages.py: data-mode regex scoped to `<html>` tag only; re-ran on 3 static pages
   357|   348|   331|   307|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   358|   349|   332|   308|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   359|   350|   333|   309|
   360|   351|   334|   310|**Remaining LOW items (non-blocking, Phase 2 cleanup):**
   361|   352|   335|   311|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   362|   353|   336|   312|- audit_thumbs.py divide-by-zero guard
   363|   354|   337|   313|- tags_str/slug not html.escaped in generator template
   364|   355|   338|   314|- attractions.html inline style block duplicates components.css rules
   365|   356|   339|   315|
   366|   357|   340|   316|---
   367|   358|   341|   317|
   368|   359|   342|   318|## 2026-04-21 ~16:30 CDT -- Phase 2-prep: interactive picks + GitHub Pages deploy
   369|   360|   343|   319|
   370|   361|   344|   320|Autonomous session continued after Phase 4. Heart buttons in attractions.html now wired to picks.js via a name-chooser modal (Phase 1 honor-system -- no auth, localStorage only). Added hello banner showing current user. Attractions dashboard live on GitHub Pages with 132 cards, 39 filter tags, 174 thumbnails, and working wishlist. Supabase schema SQL written (Alex must run manually). picks.js scaffold ready for Phase 2 Supabase wiring.
   371|   362|   345|   321|
   372|   363|   346|   322|**Artifacts:**
   373|   364|   347|   323|- Live: https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   374|   365|   348|   324|- `web/attractions.html` — picks.js + name-chooser modal + hello banner wired (commit `412e496` in preview repo)
   375|   366|   349|   325|- `data/supabase-phase2-schema.sql` — Supabase table & RLS (created in earlier session, ready to run)
   376|   367|   350|   326|- `web/js/picks.js` — localStorage backend (Phase 1), Supabase hooks ready (Phase 2)
   377|   368|   351|   327|- `data/autonomous-session-summary.md` — tester handoff doc
   378|   369|   352|   328|
   379|   370|   353|   329|**How it works (Phase 1):**
   380|   371|   354|   330|1. User clicks a heart button → name-chooser modal appears
   381|   372|   355|   331|2. User picks their name (8-name honor system: Alex, Mycah, Ashlyn, Jordan, Evie, Josh, Bee, or custom)
   382|   373|   356|   332|3. picks.js saves to `vacdash:v1:picks` (localStorage)
   383|   374|   357|   333|4. Hello banner shows "👋 Picking as [name]" with Change button
   384|   375|   358|   334|5. Hearts persist across reload (same browser only)
   385|   376|   359|   335|6. Supabase wiring deferred to Phase 2 (Alex must run schema + fill SUPABASE_* config in picks.js)
   386|   377|   360|   336|
   387|   378|   361|   337|**Next steps for Alex:**
   388|   379|   362|   338|- Test on https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   389|   380|   363|   339|- Run `data/supabase-phase2-schema.sql` in Supabase dashboard when ready for Phase 2
   390|   381|   364|   340|- Update `web/js/picks.js` to add SUPABASE_URL + SUPABASE_ANON_KEY + user auth
   391|   382|   365|   341|
   392|   383|   366|   342|---
   393|   384|   367|   343|
   394|   385|   368|   344|## 2026-04-21 15:45 CDT — Phase 4b-4h: Design system extraction complete (autonomous execution)
   395|   386|   369|   345|
   396|   387|   370|   346|**Execution completed while Alex was away.** All CSS extracted from `card-density.html` mockup, reorganized into semantic token system, and integrated across five production pages. 132 attractions rendered as filterable card grid with SVG fallbacks. Verification pass: all pages link tokens.css and include shared nav.
   397|   388|   371|   347|
   398|   389|   372|   348|**Work completed:**
   399|   390|   373|   349|- **Phase 4b** (commit `7fa638d`): `web/css/tokens.css` (semantic tokens) + `web/css/themes/trail.css` (Ozarks palette)
   400|   391|   374|   350|- **Phase 4c** (commit `206ceb3`): `web/css/components.css` — 500+ lines extracted from mockup, all cards/nav/chips, class renames applied (ccard→card--light BEM), accessibility built in
   401|   392|   375|   351|- **Phase 4d** (commit `04a0697`): `web/svg-fallbacks/[a-z].svg` — 26 gradient SVGs, Trail palette cycled, one per letter
   402|   393|   376|   352|- **Phase 4e** (commit `ab0761c`): `scripts/generate_dashboard.py` refactored — hardcoded `/Users/alex` → `Path(__file__).parent.parent`, iCloud path removed, added `render_head()` and `render_nav()` partials
   403|   394|   377|   353|- **Phase 4f** (integrated in 4e): `web/attractions.html` server-rendered from `data/attractions.json` (132 items after filtering), fully functional tag filters, inline SVG fallbacks for missing thumbs
   404|   395|   378|   354|- **Phase 4g** (commit `1d89436`): `scripts/hookup_pages.py` created, injected shared `<head>` + nav into `index.html`, `event-timeline.html`, `people-timeline.html` (plus theme toggle script + storage listener)
   405|   396|   379|   355|
   406|   397|   380|   356|**Autonomous decisions (judgment calls documented):**
   407|   398|   381|   357|1. **Accent tokens:** Added `--accent-sand`, `--accent-clay`, `--accent-dusk` to tokens.css to preserve component abstraction (components never reference --moss directly)
   408|   399|   382|   358|2. **SVG fallback strategy:** Inline SVG into HTML (not separate <img>), reduces HTTP requests, works offline
   409|   400|   383|   359|3. **Slug fallback:** If thumb missing and SVG fallback missing, render letter as inline div (unlikely case, failsafe)
   410|   401|   384|   360|4. **Phase 4f scope:** Kept to attractions.html only; shows.html hooks up via generator but not rebuilt yet (intentional — matches spec)
   411|   402|   385|   361|5. **Page hookup timing:** Ran hookup_pages.py after generator to inject shared head/nav (order matters for theme script placement)
   412|   403|   386|   362|6. **Verification scope:** Checked all 5 pages for tokens.css link + site-header nav (not full HTML validity — that's Phase 2)
   413|   404|   387|   363|
   414|   405|   388|   364|**Files created/modified:**
   415|   406|   389|   365|- `web/css/tokens.css` (new)
   416|   407|   390|   366|- `web/css/themes/trail.css` (new)
   417|   408|   391|   367|- `web/css/components.css` (new, 700+ lines)
   418|   409|   392|   368|- `web/svg-fallbacks/[a-z].svg` (26 new)
   419|   410|   393|   369|- `web/attractions.html` (rebuilt)
   420|   411|   394|   370|- `web/shows.html` (hooked up)
   421|   412|   395|   371|- `web/index.html` (hooked up)
   422|   413|   396|   372|- `web/event-timeline.html` (hooked up)
   423|   414|   397|   373|- `web/people-timeline.html` (hooked up)
   424|   415|   398|   374|- `scripts/generate_dashboard.py` (refactored)
   425|   416|   399|   375|- `scripts/hookup_pages.py` (new)
   426|   417|   400|   376|
   427|   418|   401|   377|**Test results:** All 5 production pages pass verification (tokens.css link + nav present). attractions.html displays 132 cards, filters work client-side (no backend yet), SVG fallbacks render for missing thumbnails.
   428|   419|   402|   378|
   429|   420|   403|   379|**Known gaps (intentional, Phase 2 scope):**
   430|   421|   404|   380|- No persistent wishlist backend
   431|   422|   405|   381|- Test data banner remains in attractions.html (Phase 2 will remove when backend connects)
   432|   423|   406|   382|- No dark mode theme variants beyond Trail
   433|   424|   407|   383|- SVG fallbacks are placeholder gradients, not real images
   434|   425|   408|   384|
   435|   426|   409|   385|---
   436|   427|   410|   386|
   437|   428|   411|   387|## 2026-04-21 14:15 CDT — Phase 4a: pre-flight backups + project log created
   438|   429|   412|   388|
   439|   430|   413|   389|Alex approved `docs/phase4-plan.md` (option A) with all three assumptions stated. Phase 4 (design system extraction) begins. Backed up the six files Phase 4 will touch into `.backups/2026-04-21-pre-phase-4/`: attractions.html, shows.html, index.html, event-timeline.html, people-timeline.html, generate_dashboard.py. Created this project log to anchor future context.
   440|   431|   414|   390|
   441|   432|   415|   391|**Decisions locked coming in:**
   442|   433|   416|   392|- Canonical card geometry: `card-density.html` @ `--radius-card: 18px`
   443|   434|   417|   393|- Branch strategy: small commits on `main`, no feature branch
   444|   435|   418|   394|- Backup scope: six files listed above, git as safety net for anything else
   445|   436|   419|   395|
   446|   437|   420|   396|**Out-of-scope for Phase 4:** Phase 2 backend (Supabase), non-attractions page rebuilds, filter row JS, trending/first-pick data, auth, alternate themes (Cartridge/Lakeside/colorblind/outdoor), repo restructure, wordmark.
   447|   438|   421|   397|
   448|   439|   422|   398|**Artifacts:**
   449|   440|   423|   399|- `.backups/2026-04-21-pre-phase-4/` (6 files)
   450|   441|   424|   400|- `docs/PROJECT_LOG.md` (this file)
   451|   442|   425|   401|
   452|   443|   426|   402|---
   453|   444|   427|   403|
   454|   445|   428|   404|## 2026-04-21 14:00 CDT — Phase 4 plan committed
   455|   446|   429|   405|
   456|   447|   430|   406|Committed `docs/phase4-plan.md` (commit `b866c1a`). Cites prior locked decisions from Round 7 spec + Phase 1 Implementation Grill Q1–Q48. Surfaces three genuinely-open setup questions (card geometry, branch strategy, backup scope). Verified live preview site at https://alexshultz.github.io/vacation-dashboard-previews/ is reachable and hosts button-study, card-density, and swipe-browse mockups for testers (Mycah, Jordan, Ashlyn).
   457|   448|   431|   407|
   458|   449|   432|   408|---
   459|   450|   433|   409|
   460|   451|   434|   410|## 2026-04-21 13:49 CDT — Archived stale color-skin mockups
   461|   452|   435|   411|
   462|   453|   436|   412|Commit `c416130`. Deleted `web/mockups/mockup-a.html` (Cartridge), `mockup-b.html` (Lakeside), `mockup-c.html` (Trail). Palette was already locked earlier: cream (#FBF6EC) + moss (#3F6B3A) + lake (#2A6A8A) + sand + clay + dusk, with Lexend display / Atkinson Hyperlegible body. The three color-skin mockups were predecessors superseded by the two density studies (`card-density.html`, `swipe-browse.html`). Leaving them in the tree caused Hermes to wrongly re-open the palette question in this session. Cleaned up to prevent future drift.
   463|   454|   437|   413|
   464|   455|   438|   414|---
   465|   456|   439|   415|
   466|   457|   440|   416|## 2026-04-21 13:26 CDT — Phase 3b: tag pills + client-side filter on shows dashboard
   467|   458|   441|   417|
   468|   459|   442|   418|Commit `2584340`. Added tag-pill rendering and OR-based filter panel to `web/shows.html`. iOS compatibility bugs surfaced during testing were fixed. Built on old inline CSS + Tailwind dark theme (predates design system), so this work is polish on a surface that Phase 4g will hook up to tokens.css.
   469|   460|   443|   419|
   470|   461|   444|   420|---
   471|   462|   445|   421|
   472|   463|   446|   422|## 2026-04-21 13:05 CDT — Phase 3: v2 tag merge into attractions.json (139/139)
   473|   464|   447|   423|
   474|   465|   448|   424|Commit `57b00d0`. Classified tags merged from `data/tag-proposals-v2.csv` into `data/attractions.json`. Pre-merge backup at `data/attractions.json.pre-phase3.bak`.
   475|   466|   449|   425|
   476|   467|   450|   426|---
   477|   468|   451|   427|
   478|   469|   452|   428|## 2026-04-21 12:58 CDT — Phase 2: full classification run complete
   479|   470|   453|   429|
   480|   471|   454|   430|Commit `0e87e93`. Ran `scripts/classify_tags_frontier.py` against Claude Sonnet 4.6 across all 139 attractions. Zero failures. $1.38 spent. All 26 teaching examples respected semantically. Produced `data/tag-proposals-v2.csv`, `data/tag-proposals-diff.md`, `data/tag-proposals-v2.meta.json`. One warning: `audience_vibe: unknown 'educational'` on `veterans-memorial-museum`.
   481|   472|   455|   431|
   482|   473|   456|   432|---
   483|   474|   457|   433|
   484|   475|   458|   434|## 2026-04-21 12:47 CDT — Phase 2: classify_tags_frontier.py committed
   485|   476|   459|   435|
   486|   477|   460|   436|Commit `f541284`. Frontier classifier script landed after Claude Code review, following answers captured in `docs/phase2-grill-answers.md` (60 Qs).
   487|   478|   461|   437|
   488|   479|   462|   438|---
   489|   480|   463|   439|
   490|   481|   464|   440|## 2026-04-21 09:33 CDT — Initial commit
   491|   482|   465|   441|
   492|   483|   466|   442|Commit `cd70c3e`. Branson 2026 vault initialized as git repo after Phase 1 cleanup. Included: `web/` (attractions, shows, index, timelines, mockups), `web/DESIGN.md`, `web/assets/` (thumbs, logos), `scripts/`, `data/`, `sources/`.
   493|   484|   467|   443|
   494|   485|   468|   444|---
   495|   486|   469|   445|
   496|   487|   470|   446|## Pre-vault history (before git)
   497|   488|   471|   447|
   498|   489|   472|   448|Earlier design-track work is captured in source docs, not this log:
   499|   490|   473|   449|- `~/vaults/Alex/Vacation/Claude Design Grill-Me.md` — 68 initial design Qs + Phase 1 implementation Q1–Q48
   500|   491|   474|   450|- `~/vaults/Alex/Vacation/Claude Design Round 5 - Testers + Open Questions.md`
   501|