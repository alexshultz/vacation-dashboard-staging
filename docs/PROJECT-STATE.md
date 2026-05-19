# Branson '26 Dashboard -- Project State

> This file is the canonical source of current project state for the vacation-coordinator agent.
> SOUL.md references this file. Update it here -- never embed state in SOUL.md.
> Last updated: 2026-05-18

---

## Project Identity

- **Site:** React SPA (single entry point, Claude Design layout, Trail theme)
- **Architecture:** `web/index.html` (React 18 + Babel CDN) + `web/loader.js` + JSX files. NOT a multi-page static site.
- **Production URL:** https://vacation.creeperbomb.com/
- **Staging URL:** https://vacation-dev.creeperbomb.com/
- **Vault root:** `~/vaults/Vacation/Branson 2026/`
- **Primary coder:** Claude Code (lazlo) -- not you

---

## Key Dates

- **Trip:** 2026-05-22 -> 2026-05-29
- **Family launch date:** 2026-05-22 (dashboard goes live day-of-trip)

---

## SPA Architecture (as of 2026-05-18)

```
web/index.html           -- React 18 SPA entry point (React + Babel + Supabase CDN, loads loader.js)
web/loader.js            -- Data fetcher/transformer; populates window.BD_* globals before React mounts
web/Shell.jsx            -- Main SPA shell, state management, Supabase write-back, user identity
web/Activities.jsx       -- QuickPick + Browse; shuffle, filtering
web/Cards.jsx            -- Activity card component
web/DetailModal.jsx      -- Detail modal
web/Home.jsx             -- Home page
web/Interests.jsx        -- Wishlist/commit view
web/Profile.jsx          -- Name picker
web/Timeline.jsx         -- Schedule timeline
web/Tweaks.jsx           -- Settings panel
web/tweaks-panel.jsx     -- Tweaks panel component
web/styles.css           -- Claude Design SPA stylesheet
web/fonts/               -- Lexend + Atkinson Hyperlegible fonts
web/loader.js            -- Boots React, fetches data.json + schedule.json + people.json + Supabase picks
```

**window.BD_* globals (populated by loader.js before React mounts):**
- `BD_ACTIVITIES` -- 240 visible attractions (post-blacklist), shape: {id, name, hook, tags, drive, price, rating, thumb, wish[], commit[], locked}
- `BD_SCHEDULE` -- trip events grouped by date
- `BD_PEOPLE` -- family roster from web/people.json
- `BD_SUPABASE` -- initialized Supabase client
- `BD_GET_USER_ACTIVITIES(userId)` -- filtered activity list for a user
- `BD_INITIAL_USER` -- user from localStorage bd-user

**User identity:**
- localStorage key: `bd-user` (lowercase id, e.g. "alex")
- Also writes `vacdash:v1:user` for picks.js compatibility
- Supabase user_id is capitalized (e.g. "Alex")

**Old static pages** (attractions.html, shows.html, etc.) still exist in repo but are NOT reachable via SPA nav. Do not modify or delete them -- they are unreachable legacy files.

---

## Vault File Reference

| File | Purpose |
|---|---|
| `CLAUDE.md` | Lazlo instructions (vault root) |
| `web/DESIGN.md` | Design system spec (read before any CSS/HTML work) |
| `docs/ROADMAP.md` | Phased plan (STALE for current status -- trust PROJECT-STATE.md) |
| `docs/PROJECT_LOG.md` | Session log (newest first) |
| `docs/DECISIONS.md` | Architectural decisions |
| `scripts/safety-check.sh` | Pre-deploy safety checks (updated 2026-05-18 for SPA era) |
| `scripts/deploy.sh` | Canonical deploy script -- ONLY safe way to deploy |

---

## Data Pipeline

- `data/attractions.json` + `data/blacklist.json` -> `scripts/export_data.py` -> `web/data.json` -> runtime fetch
- `generate_dashboard.py` is FROZEN. Never run. Never modify.
- `generate_attractions.py` is FROZEN. Never run. Never modify.
- `web/schedule.json` is hand-edited directly. Structure: `{"events": [...]}` -- NOT a flat array.
- `web/people.json` is the safe public copy (no DOBs/phone numbers). NEVER deploy `data/people.json`.
- `help.json` is the canonical source for help content.

**Schedule event fields:** id, title, date, duration (decimal hours), startTime (HH:MM), catalogRef, travelMinutes, interested, undecided, notInterested, noResponse, event_type, series_slug

**Standard meal times:** Breakfast 08:00, Lunch 12:00, Supper 18:00

---

## Blacklist

- `data/blacklist.json`: 107 entries as of 2026-05-18
- 24 pre-existing seasonal/closed shows
- 83 sub-spots: Tanger Outlets stores (28), Dickson St Fayetteville AR (18), SDC internal food/craft/retail (25), Branson Landing retail shops (12)
- Parent/overview entries kept visible: tanger-outlets-branson, branson-landing, silver-dollar-city
- Result: 330 total attractions, 240 visible, 90 hidden

---

## Design System

- `web/css/tokens.css` + `web/css/components.css` + `web/css/themes/trail.css` -- LOCKED. No new design decisions.
- `web/styles.css` -- Claude Design SPA stylesheet (separate from the above, used by React SPA)
- DESIGN.md is the canonical agent-readable spec. Lazlo reads this before every task.

---

## Backend

- **Supabase:** Active in production. Project UUID: `quebfbvfuwbncpexlylu`
- **picks table:** user_id (capitalized, e.g. "Alex"), slug, status ("wishlist" or "commit"). Conflict key: (user_id, slug).
- **RLS:** picks table open to anon (USING true). schedule_events writes locked to Alex UID only.
- **Supabase write-back:** upsert uses `.eq().eq()` (not deprecated .match()). Fire-and-forget on UI path.
- Keepalive cron running every 3 days to prevent free-tier pause.
- **Credentials:** `~/hermes-config/profiles/vacation-coordinator/.env` -- SUPABASE_ANON, SUPABASE_URL. SUPABASE_PAT not in that .env -- ask Alex, likely in Alex vault at Thoughts/My AI/Authorization Info/Supabase.md.

---

## Deploy Repos

| Repo | Local path | URL |
|---|---|---|
| Staging | `~/code/vacation-dashboard-dev` | vacation-dev.creeperbomb.com |
| Production | `~/code/vacation-dashboard` | vacation.creeperbomb.com |

**Only safe deploy path:**
```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
GITHUB_TOKEN="$(sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env)" \
  bash scripts/deploy.sh staging "description"
# Then after Alex says "ship it":
GITHUB_TOKEN="$(sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env)" \
  bash scripts/deploy.sh production "description"
```

---

## Safety Checks (scripts/safety-check.sh)

Updated 2026-05-18 for SPA era. Checks:
- `pointerdown` in quick-pick.html (Quick Pick swipe code)
- `fetch.*data.json` in attractions.html (render loop)
- `fetch.*help.json` in help.html
- `fetch.*schedule.json` in event-timeline.html
- `loader.js` in index.html (SPA entry point -- replaces old `fetch.*schedule.json` check)
- No dead filter refs in attractions.html

---

## Completion Flags

| Item | Status |
|---|---|
| React SPA migration | COMPLETE -- live on staging 2026-05-18 |
| Wishlist/commit persistence | FIXED 2026-05-18 -- upsert uses .eq().eq(), hydration confirmed working |
| Blacklist restored | COMPLETE 2026-05-18 -- 107 entries, 240 visible attractions |
| DAVID (Sight & Sound) event | ADDED 2026-05-18 -- May 27, 7:30pm, 2h20m |
| Silver Dollar City event | ADDED -- May 26, 10am-6pm |
| Meal events | COMPLETE -- breakfast/lunch/supper May 22-29 (22 events) |
| help.html | COMPLETE -- all 5 required sections present |
| Design system | LOCKED |
| Supabase Phase 2 | ACTIVE in production |
| Custom domains | LIVE (production + staging) |
| safety-check.sh | UPDATED for SPA era 2026-05-18 |

---

## Pre-Launch Checklist (May 22)

- [ ] Clear test Supabase row: `Alex / silver-dollar-city / wishlist` (inserted as diagnostic)
- [ ] Verify commit path persists (only wishlist tested so far)
- [ ] Production deploy -- awaiting Alex "ship it"

---

## Current Sprint Status

**As of 2026-05-18 (this session):**
- Staging: SPA live, blacklist restored, DAVID event added (May 27), schedule correct
- Production: old static site still live -- NOT yet updated
- Playwright: suite exists but not run against current SPA staging -- pre-SPA tests may fail against new architecture
- Test Supabase row still present: Alex / silver-dollar-city / wishlist

**Open items (not blocking May 22):**
- Playwright suite needs audit against SPA -- many tests target old static HTML page IDs
- Schedule remaining trip events beyond meals + SDC + DAVID
- Drive time fields on attractions (deferred, low priority)
