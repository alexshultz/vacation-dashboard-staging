# Branson 2026 Project State (Living Document)

**Last Updated:** 2026-04-18

**Vault Location:** ~/vaults/Vacation/Branson 2026/

**Core Principles (from user and Claude Code):**
- Single source of truth: `data/attractions.json` (structured) + `master-checklist.md` (human-readable table)
- Self-contained HTML dashboard in `web/`
- All images in `web/assets/{thumbs,logos,banners}/`
- Obsidian-native: `attractions/_index.md` as MOC, individual notes in `attractions/`
- One-event-at-a-time processing, strict accuracy from source, no hallucinated data
- iMessage is primary for family; dashboard is supplementary
- Always read from disk with `terminal cat` when user specifies "from the disk"
- Update navigation in **all** HTML files when adding new pages (no reminder needed)
- Anti-hallucination protocol is highest priority

**Current Tools and Skills Used:**
- `skill_view` — Load `vacation-web-dashboard-from-obsidian`, `branson-vacation-mvp`, `claude-code`, `obsidian`, memory tools before tasks
- `read_file` or `terminal cat` — Every file state claim (especially after corrections)
- `write_file` / `patch` — Update HTML, JSON, MD files
- `terminal` — File operations, image downloads (`curl`), folder moves
- `browser_navigate` + `browser_get_images` — Research individual show sites and pull thumbnails/logos
- `vision_analyze` — Process screenshots user sends
- `memory` tool — Save every preference and correction permanently
- LCM tools (`lcm_status`, `lcm_doctor`, `lcm_grep`, `lcm_expand_query`, `lcm_expand`) — For recall without keeping full history live
- `claude-code` — Generate automation scripts, regeneration tools, organization advice

**Current Automation Plan:**
- JSON as canonical source → scripts can regenerate both `master-checklist.md` and HTML cards
- `CLAUDE.md` contains rules so Claude Code knows exactly how to work with this project
- Future: AppleScript or Python script for desktop control + Obsidian clipping of new show sites

**Token Management Decision:**
Per your request, I am switching to **query-based recall** (`lcm_grep` and `lcm_expand_query`) for older Branson history instead of keeping the full conversation live. This retains full resolution (original messages stay in the store) while significantly reducing live token count. The `Branson-Project-State.md` file will serve as the compact living summary of the current setup.

This document is updated whenever the project state changes significantly.

**Next Actions Available:**
- Add more shows from your list (one at a time or batch)
- Build regeneration scripts (`generate_checklist.py` and `generate_dashboard.py`)
- Create automation for desktop clipping
- Run `lcm_doctor` or maintenance pass if needed

This setup is designed to be accurate, efficient, and fully under your control.
