# CLAUDE.md — Branson 2026 Vault

## Core Principles
- Single source of truth is `data/attractions.json`, `data/people.json`, and `data/schedule.json`
- `master-checklist.md` and HTML cards are *generated* from the JSON
- All filenames use kebab-case (no #, &, or special characters)
- Images go in `assets/thumbs/`, `assets/logos/`, or `assets/banners/`
- Web dashboard is self-contained in `web/` and uses relative paths (`../assets/...`)

## Automation Rules for Claude Code
When asked to add or update an attraction/show:
1. Update the relevant JSON file in `data/`
2. Regenerate the table in `master-checklist.md`
3. Update or create the note in `attractions/`
4. Regenerate the appropriate HTML card in `web/attractions.html`
5. Add the image to the correct assets subfolder if provided

## Naming Conventions
- Attraction files: `1-hits-of-the-60s.md`, `ripleys-believe-it-or-not.md`
- Image files: match the attraction slug (`1-hits-of-the-60s-thumb.png`, `ripleys-logo-white.svg`)
- JSON keys: use consistent snake_case (`family_friendly`, `price_adult`, `duration_hours`)

## Regeneration Commands
- `python3 scripts/generate_checklist.py` — updates master-checklist.md from JSON
- `python3 scripts/generate_dashboard.py` — regenerates HTML cards from JSON

## Obsidian Usage
- Use `attractions/_index.md` as the main Map of Content
- Embed images with `![[../assets/thumbs/filename.png]]`
- Use Dataview queries on the master checklist for dynamic views

This file is loaded automatically by Claude Code in this vault. Keep it up to date as the project evolves.

Last updated: 2026-04-18 by Hermes + Claude Code
