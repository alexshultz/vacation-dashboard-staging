### Download Method (Standard from now on)

**New Rule (added per user instruction):**  
For all future downloads from protected sites like media.branson.com, always use full Safari-like browser headers with curl:

```bash
curl -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15" \
     -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" \
     -H "Accept-Language: en-US,en;q=0.9" \
     -H "Referer: https://www.branson.com/" \
     -o "web/assets/thumbs/filename.jpg" \
     "https://media.branson.com/..."
```

This method successfully bypasses 403 errors. All scripts must use this approach. Claude Code must review any download code. This is now standard operating procedure.

---

### Verification / Proof Step (Mandatory from now on)

**New Rule (added per user instruction):**  
After **every** change to JSON, blacklist, HTML, or any generated file, always include a **Proof Step** in the response. This must use **fresh terminal reads** (`cat`, `grep`, `ls`, etc.) on disk (never cached data) to verify and explicitly show that the change has taken effect.

Examples of acceptable proof:
- `cat data/blacklist.json` showing the new entries
- `grep "specific-show-name" web/attractions.html` showing it is either present or absent as expected
- `ls web/assets/thumbs/` showing new files
- Count of cards in the final HTML

This is now part of our **normal operations** and must be followed in every response involving modifications. Claude Code must review any scripts that automate verification.

### Vault & Folder Structure (Single Source of Truth)
We are using the dedicated **Vacation** vault at `/Users/alex/vaults/Vacation/Branson 2026/`. The layout (refined by Claude Code) is:

- `Branson-Project-State.md` (this living document — updated whenever the setup changes)
- `CLAUDE.md` (automation rules, naming conventions, regeneration commands for Claude Code)
- `master-checklist.md` (human-readable single source of truth with RSVP table)
- `data/` (JSON as the *canonical* structured source of truth):
  - `attractions.json`
  - `people.json`
  - `schedule.json`
- `sources/` (raw web clippings, including your Google Listing and previous Obsidian clippings)
- `attractions/` (individual notes + `_index.md` as Obsidian Map of Content)
- `assets/{thumbs,logos,banners}/` (all images, logos, banners — organized and referenced by the dashboard)
- `web/` (self-contained HTML dashboard):
  - `index.html` (Events/RSVP view with 4-state vertical columns)
  - `attractions.html` (current visual card view with thumbnails/logos)
  - `people-timeline.html`
  - `event-timeline.html`
  - `js/data.js` (generated from JSON where possible)

This structure is **Obsidian-native**, iCloud-sync friendly, and designed for easy automation. Everything lives in one vault so curation, linking, and Dataview queries work naturally.

### Skills We Load (via `skill_view`)
Before any task I load the relevant skills:
- `vacation-web-dashboard-from-obsidian` (core pattern, 4-state RSVP with vertical columns, navigation consistency rule, single source of truth, anti-hallucination protocol, mobile-first design)
- `branson-vacation-mvp` (overall architecture and lessons about avoiding over-engineering)
- `claude-code` (primary coding agent for scripts, regeneration tools, organization advice, AppleScript automation)
- `obsidian` (vault interactions, note creation, MOC management)
- `memory-management` and the memory tool (for saving every preference and correction permanently)
- LCM tools (`lcm_status`, `lcm_doctor`, `lcm_grep`, `lcm_expand_query`, `lcm_expand`) — for context management and recall without keeping full history live

### Tools We Use Liberally
- `terminal cat` (when you say "from the disk" or "exact from disk drive")
- `read_file` (for normal verification, always fresh)
- `write_file` / `patch` (for updating HTML, JSON, MD files)
- `terminal` (file operations, moving folders, downloading images with curl using full browser headers)
- `browser_navigate` + `browser_get_images` (researching individual show sites and pulling thumbnails/logos)
- `vision_analyze` (processing screenshots you send)
- `memory` tool (every correction or preference is saved permanently so you never have to remind me)
- `skill_view` (loaded before every relevant task)

### AI/Agents We Plan to Use
- **Hermes (me)** — Orchestrator that loads skills, uses tools, maintains memory, coordinates everything, and makes decisions based on your preferences.
- **Claude Code** (`claude-code` skill) — The main coding agent. It will generate regeneration scripts (`generate_checklist.py`, `generate_dashboard.py`), automation for desktop control + Obsidian clipping, and any future coding tasks. We consult it on organization (as you correctly suggested).
- **LCM Engine** — For lossless context management. We are switching to **query-based recall** (`lcm_grep` and `lcm_expand_query`) so we only load relevant history instead of keeping the full ~250k+ tokens live. This retains perfect memory (original messages stay in the store and can be expanded on demand) without the JPG-style quality loss you mentioned.
- Future subagents (via `delegate_task` or `mcp_claude_Agent`) if we need parallel work (e.g. one agent researching shows while another updates the dashboard).

### Current Workflow for a New Show
1. You send a URL, clipping, or screenshot.
2. Fresh read from disk (`terminal cat` or `read_file`).
3. Browse the site (`browser_navigate` + `browser_get_images`) to get thumbnail/logo and details.
4. Download image to the correct `assets/` subfolder using full browser headers with curl.
5. Update `data/attractions.json` (canonical data).
6. Add or expand a card in `attractions.html` with image, pricing, family notes, and link.
7. Update `master-checklist.md` and `attractions/_index.md` if needed.
8. Copy updated web folder to iCloud if the Studio version needs syncing.

This setup is accurate (fresh disk reads after every correction), efficient (JSON as source of truth for automation), and fully under your control. The recent token concern is being addressed by the switch to query-based recall.

The living document `Branson-Project-State.md` in the vault contains this exact overview and will be kept up to date. The **Proof Step** and **Download Method with full headers** are now mandatory in all responses involving changes.

**Claude Code has reviewed this update.**