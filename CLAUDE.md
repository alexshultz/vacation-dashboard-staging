# CLAUDE.md — Branson 2026 Dashboard

> **AGENT INSTRUCTION (mandatory):** Read this file in full before writing any code. If anything in the task brief conflicts with a rule here, **flag the conflict explicitly before proceeding.** Completing the task includes the handback steps at the bottom of this file — they are not optional.

---

## ⚠️ CRITICAL: generate_dashboard.py IS PERMANENTLY FROZEN

`generate_dashboard.py` **completely overwrites** `web/attractions.html`, `web/wishlist.html`, and `web/suggested.html`. These files contain hand-edited Quick Pick swipe mode code (deck-mode-toggle, deck-stage, full pointer-events JS) that the generator does NOT reproduce.

**Running the generator destroys that code. This happened TWICE. It must never happen again.**

**Pre-push safety check — never skip this:**
```bash
grep -c 'pointerdown' web/attractions.html
# Must return 1. If 0: STOP. Do not push. Recover the Quick Pick code first.
```

**To add new attractions:** edit `data/attractions.json`, then sync to `web/data.json`. Do NOT use the generator. Do NOT regenerate any HTML file from scratch.

---

## Architecture

**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`

### Data Flow
```
data/attractions.json  ──(edit)──►  web/data.json
web/data.json          ──(fetch)──► web/attractions.html   (runtime JS render loop)
web/attractions.html   ──(rsync)──► ~/code/vacation-dashboard-previews/
```

### Canonical Sources

| File | Role |
|---|---|
| `web/data.json` | **Runtime source of truth.** attractions.html fetches this at load time. |
| `data/attractions.json` | Authoritative edit copy. After editing, re-export to `web/data.json`. |
| `data/blacklist.json` | Slugs of seasonal/excluded shows. Inlined as JS array in attractions.html render loop. |
| `web/attractions.html` | **HAND-EDITED. Never regenerate.** Contains Quick Pick swipe deck. |
| `web/quick-pick.html` | Separate Quick Pick page. Reference only for fetch() pattern. Do not modify. |

### File Layout
```
web/
  index.html
  attractions.html       ← HAND-EDITED — never overwrite with generator
  shows.html
  quick-pick.html
  wishlist.html
  suggested.html
  profile.html
  event-timeline.html
  people-timeline.html
  css/
    tokens.css           ← semantic tokens only (no raw palette vars like --moss)
    themes/trail.css     ← Ozarks palette: --moss, --lake, --sand, --clay, --dusk
    components.css       ← all shared components, 542+ lines
  js/
    picks.js             ← wishlist state (localStorage Phase 1, Supabase Phase 2)
  assets/
    thumbs/              ← {slug}-thumb.{jpg,png,webp}
  svg-fallbacks/         ← a.svg … z.svg fallbacks for missing thumbs
  data.json              ← runtime JSON (copy of data/attractions.json)

data/
  attractions.json       ← canonical editing copy
  blacklist.json         ← slugs to exclude from render
  supabase-phase2-schema.sql

docs/
  PROJECT_LOG.md         ← timestamped state record, newest-first
  DECISIONS.md           ← architectural decision record (ADR-lite)

.claude/                 ← task briefs per session

scripts/
  generate_dashboard.py  ← FROZEN. Do not run.
  clean_slugs.py
```

---

## CSS Architecture

- **Components** (`components.css`) reference semantic tokens only: `--color-bg`, `--accent-sand`, etc. Never `--moss` or `--lake` directly.
- Private palette lives in `css/themes/trail.css`. To expose a palette color to components, add a passthrough token in `tokens.css` (e.g., `--accent-sand: var(--sand)`) and use that in components.
- **`[hidden]` + `display:flex` pitfall:** Browser UA `[hidden]{display:none}` is overridden by author `display:flex`. Fix: add `.element[hidden] { display: none; }` companion rule in `components.css` for every element toggled via JS `.hidden = true`.

---

## attractions.html Render Loop (as of 2026-04-23)

`attractions.html` no longer contains baked card HTML. It fetches `data.json` at load time and renders cards via `renderCatalog()`. Key facts:

- Blacklist slugs are **inlined as a JS array** (not a second fetch) to avoid race conditions.
- Filter chips and Quick Pick deck both read from DOM `data-*` attributes on `.card--light` elements after `renderCatalog()` completes. Both must wait for the render loop.
- Card HTML is defined in the JS template literal inside `renderCatalog()`, not in the generator. To change card layout: edit the template literal in `attractions.html` directly.
- Filter chip integration: Quick Pick chip listener reads `aria-selected` 50ms after click to allow the existing chip handler to run first.

---

## Quick Pick (Swipe Deck)

- Quick Pick is a **separate page** (`web/quick-pick.html`), not a mode toggle on attractions.html. The QP nav button on attractions.html is a plain `<a href="quick-pick.html">` link.
- Deck data: `querySelectorAll('#catalog-grid .card--light')` reads DOM `data-*` attributes at deck init time. No separate ATTRACTIONS array.
- Image path normalization: `data-img` stores `assets/thumbs/…`; deck JS normalizes to `../assets/thumbs/…`.
- localStorage key: `vacdash:swipe:progress` → `{ filter: "all", seen: ["slug1", …] }`. Reset `seen` when filter chip changes.
- Stack CSS: `.deck-card.stack-2` and `.deck-card.stack-3` (defined in `components.css`, not `.card`).
- Top card selector for button/keyboard triggers: `deckStage.querySelector('.deck-card:not(.stack-2):not(.stack-3)')`.

---

## GitHub Pages Sync (Canonical Workflow)

```bash
VAULT="/Users/alex/vaults/Vacation/Branson 2026"
PREVIEW="/Users/alex/code/vacation-dashboard-previews"

# 0. SAFETY CHECK — never skip
grep -c 'pointerdown' "$VAULT/web/attractions.html"
# Must return 1. If 0: STOP.

# 1. DO NOT run generate_dashboard.py

# 2. rsync — --exclude=".git" is MANDATORY (omitting it destroys the .git dir)
rsync -av --delete \
  --exclude=".git" --exclude="DESIGN.md" --exclude="mockups" \
  "$VAULT/web/" "$PREVIEW/"

# 3. Fix vault-relative paths → Pages-root paths
cd "$PREVIEW"
sed -i '' 's|../assets/thumbs/|assets/thumbs/|g' \
  attractions.html shows.html index.html event-timeline.html people-timeline.html \
  wishlist.html suggested.html profile.html quick-pick.html

# 4. Commit and push
git add -A && \
  git -c user.email="alexshultz@users.noreply.github.com" commit -m "MESSAGE" && \
  git -c credential.helper=osxkeychain push --force origin main
```

**When you add a new HTML page, add it to the `sed` path-fix list in Step 3.**

---

## Supabase / SQL Rules

- All SQL for this project goes through codemaster — Hermes gets SQL wrong too often.
- Postgres has **no** `CREATE POLICY IF NOT EXISTS` or `CREATE TRIGGER IF NOT EXISTS`. Always: `DROP POLICY IF EXISTS …; CREATE POLICY …;` and `DROP TRIGGER IF EXISTS …; CREATE TRIGGER …;`
- `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION` are idempotent — no drops needed.
- Phase 2 Supabase tables: `picks`, `suggestions`, `wishlist_trash`. Schema at `data/supabase-phase2-schema.sql`.

---

## Pitfall Quick Reference

| Pitfall | Fix |
|---|---|
| Running `generate_dashboard.py` | Never. Destroys Quick Pick code. |
| `[hidden]` ignored on flex element | Add `.element[hidden] { display: none; }` |
| rsync without `--exclude=".git"` | Destroys `.git/`. Always include flag. |
| `credential.helper=store` stale token | Use `-c credential.helper=osxkeychain` |
| `naturalWidth===0` on all images | Timing artifact. Cross-check with `curl -sI`. |
| `CREATE POLICY IF NOT EXISTS` | Doesn't exist in Postgres. Drop + recreate. |
| GitHub email privacy block on push | `git config user.email "alexshultz@users.noreply.github.com"` then `git commit --amend --reset-author --no-edit` |
| `.git/` deleted by rsync | `git init` + `git remote add origin …` + force-push |

---

## Codemaster Handback (Mandatory — Part of Every Session)

When all code changes are complete:

1. **List every file modified** with a one-line description.
2. **List files created** with their purpose.
3. **Note judgment calls** made during implementation.
4. **Update `docs/DECISIONS.md`** for any architectural choice (non-trivial only — follows ADR-lite format in that file).
5. **Add an entry to `docs/PROJECT_LOG.md`** (ISO timestamp, one paragraph, bullet artifacts).
6. **Update this file (`CLAUDE.md`)** if you changed the architecture, file layout, or any rule listed here.
7. **STOP.** Do not run git. Do not push. Do not rsync. Do not run the generator. Hermes handles post-code orchestration.

---

*Last updated: 2026-04-23 by Hermes (Council of Minds synthesis session)*
*Project end date: 2026-05-29*
