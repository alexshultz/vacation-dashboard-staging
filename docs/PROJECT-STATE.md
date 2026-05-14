# Branson '26 Dashboard -- Project State

> This file is the canonical source of current project state for the vacation-coordinator agent.
> SOUL.md references this file. Update it here -- never embed state in SOUL.md.
> Last updated: 2026-05-12

---

## Project Identity

- **Site:** Multi-page static dashboard (Trail theme, "Airbnb meets National Parks")
- **Pages (all 10 exist on disk):** index, attractions, shows, quick-pick, wishlist, suggested, event-timeline, people-timeline, profile, help
- **Production URL:** https://vacation.creeperbomb.com/
- **Staging URL:** https://vacation-dev.creeperbomb.com/
- **Vault root:** `~/vaults/Vacation/Branson 2026/`
- **Primary coder:** Claude Code (lazlo) -- not you

---

## Key Dates

- **Trip:** 2026-05-22 → 2026-05-29
- **Family launch date:** 2026-05-22 (dashboard goes live day-of-trip)

---

## Vault File Reference

| File | Purpose |
|---|---|
| `CLAUDE.md` | Lazlo instructions (vault root) |
| `docs/ROADMAP.md` | Phased plan |
| `docs/PROJECT_LOG.md` | Session log (newest first) |
| `docs/DECISIONS.md` | Architectural decisions |
| `web/DESIGN.md` | Design system spec (read before any CSS/HTML work) |
| `docs/VACATION-AGENT-ONBOARDING.md` | Full project history, rejected features, pending work, key dates |

> **Stale file warning:** `Branson-Project-State.md` in vault root is from 2026-04-18 and references deprecated tools. Ignore it. Trust the files above instead.

---

## Data Pipeline

- `data/attractions.json` + `data/blacklist.json` → `scripts/export_data.py` → `web/data.json` → GitHub Pages
- `generate_dashboard.py` is FROZEN -- `sys.exit(1)` guard prevents execution, but underlying code would overwrite `attractions.html`, `wishlist.html`, and `suggested.html`. Never run or modify it.
- `generate_attractions.py` is FROZEN -- `sys.exit(1)` guard prevents execution, but underlying code would overwrite `attractions.html`. Never run or modify it.
- `web/schedule.json` (28 trip events) is fetched at runtime by `event-timeline.html` and `index.html` -- hand-edit `web/schedule.json` directly to update RSVP data; no generator script.
- `help.json` is the canonical source for help content -- never hand-edit the HTML sections in `help.html`; edit `help.json` only.

---

## Design System

- `tokens.css` + `components.css` + `trail.css` -- LOCKED. No new design decisions.
- 13 other themes committed but pending lazlo batch review before activation.

---

## Backend

- **Phase 1 (localStorage):** Active in production.
- **Phase 2 (Supabase):** Active in production as of 2026-04-28. picks.js hydrates from Supabase. Supabase UUID: `8d266838-80da-406d-98cb-97387394b564`.
- Keepalive cron running every 3 days to prevent free-tier pause.
- **Supabase credentials:** Stored in `~/hermes-config/profiles/vacation-coordinator/.env` -- SUPABASE_PAT (Management API, DDL migrations), SUPABASE_SERVICE_ROLE (data writes), SUPABASE_ANON, SUPABASE_URL.
- **DDL migrations:** Use `curl` with the PAT against `https://api.supabase.com/v1/projects/quebfbvfuwbncpexlylu/database/query`. Python urllib is blocked by Cloudflare -- always use curl with `-H "User-Agent: Mozilla/5.0"`.

---

## Completion Flags

| Item | Status |
|---|---|
| `help.html` | COMPLETE -- all 5 required sections present, entry point on Profile page. Do not re-verify. |
| Design system | LOCKED |
| All 10 pages | Exist on disk |
| Supabase Phase 2 | ACTIVE in production |
| Custom domains | LIVE (production + staging) |

---

## Pre-Launch Checklist (May 22)

No remaining gate items.

---

## Current Sprint Status

Read `docs/PROJECT_LOG.md` (newest first) for the authoritative session-by-session record.

**As of 2026-05-12 (last session):**
- Production: commit `0d13c62` -- LIVE
- Staging: commit `7b51d66` -- awaiting "ship it"
- Playwright: 85 passing, 1 flaky (pre-existing AC-9 login race -- passes on retry, not a regression)
- New: event create, archive, restore, delete on event-timeline.html + admin-overlay.js
- XSS fix: esc() helper applied to all Supabase-sourced strings written into innerHTML
- Supabase: SUPABASE_PAT + SUPABASE_SERVICE_ROLE stored in vacation-coordinator .env and Alex vault

**Open items (not blocking May 22):**
- AC-9 flaky test (pre-existing login race in admin-form-inputs.spec.js) -- WARN, not a blocker
