# Process Source Data Adjustments Script

## Overview

The `process_source_data_adjustments.py` script automates the data cleaning and enrichment process for the Branson 2026 attractions database based on the adjustments documented in `sources/Source Data Ajustments.md`.

## What It Does

### 1. **Transfers Thumbnails from Duplicates** (Phase 1)
   - For duplicate entries marked with "keep the thumbnail and use it on [URL]", the script:
     - Finds the duplicate entry (usually from media.branson.com)
     - Extracts its thumbnail image
     - Applies it to the entry with the better official URL
     - This preserves high-quality images before removing duplicates

### 2. **Removes All Duplicates** (Phase 2)
   - Removes entries with URLs from:
     - `media.branson.com` (image CDN)
     - `americanatheatrebranson.com` (competing source)
   - Deduplicates the attractions list while preserving one canonical entry per show

### 3. **Updates Blacklist with Seasonal Shows** (Phase 3)
   - Adds seasonal/holiday shows to the blacklist in slug format:
     - Christmas shows (e.g., "a-christmas-story-dinner-show")
     - New Year's shows (e.g., "hamners-new-years-eve-fiesta")
     - Spring festivals (e.g., "shepherd-of-the-hills-spring-fest")
   - Prevents these seasonal shows from appearing in the regular attractions list

### 4. **Sorts Attractions Alphabetically** (Phase 4)
   - Maintains consistent ordering by show name
   - Helps with navigation and prevents unintended duplicates during version control

### 5. **Updates Metadata** (Phase 5)
   - Adds a processing note to `_metadata.note` field
   - Records timestamp and summary of changes
   - Provides audit trail for data provenance

## Input Files

### `sources/Source Data Ajustments.md`
Contains three sections:
- **"Remove these duplicates"** - URLs to remove (with optional thumbnail preservation)
- **"Add to the blacklist"** - URLs for seasonal shows to exclude
- **"Look in the source html"** - Optional image references (not processed by script)

### `data/attractions.json`
The canonical JSON file containing all attractions with:
- `slug` - URL-safe identifier
- `name` - Display name
- `official_url` - Primary link to booking/info
- `image` - Thumbnail path
- Other fields: category, price, rating, description, notes

### `data/blacklist.json`
JSON array of attraction slugs to exclude from the main list

## Output Files

### `data/attractions.json` (Modified)
- Duplicates removed
- Thumbnails updated
- Sorted alphabetically by name
- `_metadata.note` updated

### `data/blacklist.json` (Modified)
- New seasonal show slugs added
- Array sorted alphabetically
- No duplicates in final list

## Usage

### Run the script:

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026
python3 scripts/process_source_data_adjustments.py
```

### Or use the exact command from workspace:

```bash
cd /Users/alex && python3 vaults/Vacation/Branson\ 2026/scripts/process_source_data_adjustments.py
```

## Output Example

The script prints detailed progress in five phases:

```
================================================================================
SOURCE DATA ADJUSTMENTS PROCESSOR
================================================================================

Reading adjustments from: sources/Source Data Ajustments.md
  - Found 35 duplicate URLs to remove
  - Found 6 entries with thumbnails to preserve
  - Found 19 seasonal shows to blacklist

Loading: data/attractions.json
Loading: data/blacklist.json
  - Initial attractions count: 123

--------------------------------------------------------------------------------
PHASE 1: TRANSFERRING THUMBNAILS FROM DUPLICATES
--------------------------------------------------------------------------------
  ✓ Transferred thumbnail
    From: david (https://media.branson.com/images/bcom/shows/david...)
    To:   david-sight-sound-theatres (https://gametime.co/theater/david...)
    Thumbnail: assets/thumbs/david-thumb.jpg
[... more transfers ...]

[Phases 2-5 show similar detailed progress ...]

================================================================================
SUMMARY
================================================================================

📊 ATTRACTIONS:
   Initial count:        123
   Entries removed:      13
   Thumbnails updated:   6
   Final count:          110
   Net change:           -13

🚫 BLACKLIST:
   Initial count:        4
   New entries added:    19
   Total entries:        23

✅ FILES SAVED:
   - data/attractions.json
   - data/blacklist.json

================================================================================
✓ PROCESSING COMPLETE
================================================================================
```

## Key Features

### Defensive Programming
- ✓ Uses `pathlib.Path` for cross-platform path handling
- ✓ Checks for missing files and reports errors
- ✓ Uses `.get()` method to safely access dictionary keys
- ✓ Handles missing thumbnails gracefully
- ✓ Validates JSON parsing with try/except

### URL Parsing
- ✓ Handles multiple URL formats (branson.com, media.branson.com, americanatheatrebranson.com, gametime.co)
- ✓ Extracts slugs from different URL structures
- ✓ Preserves full URLs in output for manual verification

### Thumbnail Preservation
- ✓ Two-phase approach: transfer first, then remove duplicates
- ✓ Only applies thumbnails if both source and target exist
- ✓ Warnings for missing entries
- ✓ Reports which thumbnail came from which duplicate

### Idempotency
- ✓ Can be run multiple times safely
- ✓ Won't duplicate entries in blacklist
- ✓ Won't re-transfer thumbnails
- ✓ Safe for version control workflows

## Troubleshooting

### Script returns warnings about missing entries
- **Cause**: Duplicates were already removed in a previous run
- **Action**: Check `data/attractions.json` for the current state; script will still update remaining entries and process the blacklist

### Thumbnails not transferred
- **Cause**: Duplicate entry doesn't exist (already removed) or target URL doesn't match
- **Action**: Manually verify URLs in `Source Data Ajustments.md` match exactly in JSON; use search_files tool to find potential slug variants

### Blacklist entries already exist
- **Cause**: Script is idempotent; shows "~" symbol for already-blacklisted entries
- **Action**: No action needed; script skips duplicates in blacklist

## Data Validation

Before running, verify:
- [ ] `sources/Source Data Ajustments.md` exists and is readable
- [ ] `data/attractions.json` is valid JSON (test with `python3 -m json.tool data/attractions.json`)
- [ ] `data/blacklist.json` is valid JSON
- [ ] All official_url fields in JSON are strings or null
- [ ] All image fields point to existing files or use proper relative paths

## Next Steps After Running

1. **Verify changes**: Check `data/attractions.json` for correct final count
2. **Review thumbnails**: Spot-check that transferred thumbnails look correct
3. **Test blacklist**: Confirm removed shows don't appear in dashboard
4. **Regenerate artifacts**: Run `python3 scripts/generate_dashboard.py` to update HTML
5. **Commit changes**: If using version control, commit modified JSON files

## Technical Details

### Language & Libraries
- Python 3.6+
- Standard library only: `json`, `re`, `pathlib`, `typing`, `datetime`
- No external dependencies required

### File Paths
- Vault root: `/Users/alex/vaults/Vacation/Branson 2026`
- Data: `data/attractions.json`, `data/blacklist.json`
- Adjustments: `sources/Source Data Ajustments.md`
- Script: `scripts/process_source_data_adjustments.py`

### Error Handling
- File not found → Reports error and exits
- Invalid JSON → Reports specific JSON error and exits
- Safe key access → Uses `.get()` with defaults
- URL parsing → Returns None if pattern doesn't match
- Partial failures → Creates warnings but continues processing

## Author Notes

- Script created: 2026-04-19
- Timezone: Vault timestamps are ISO 8601
- Purpose: Automate the data adjustments from Source Data Ajustments.md
- Maintainability: Well-commented for future updates to process logic
