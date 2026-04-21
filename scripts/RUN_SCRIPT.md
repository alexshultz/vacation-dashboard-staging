# EXACT TERMINAL COMMAND TO RUN

## Quick Start

Copy and paste this command directly into your terminal:

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026 && python3 scripts/process_source_data_adjustments.py
```

Or if you're already in the vault directory:

```bash
python3 scripts/process_source_data_adjustments.py
```

## Alternative (from workspace root):

```bash
cd /Users/alex && python3 vaults/Vacation/Branson\ 2026/scripts/process_source_data_adjustments.py
```

## What the Script Does

The script processes `sources/Source Data Ajustments.md` and automatically:

1. **Transfers Thumbnails** - For entries marked "keep the thumbnail":
   - Finds the duplicate entry (from media.branson.com)
   - Extracts its thumbnail image
   - Applies it to the better official URL entry
   
2. **Removes Duplicates** - Deletes entries with URLs from:
   - media.branson.com (image CDN)
   - americanatheatrebranson.com (competing source)
   
3. **Updates Blacklist** - Adds seasonal/holiday shows:
   - Christmas shows (a-christmas-story-dinner-show, etc.)
   - New Year's shows (hamners-new-years-eve-fiesta, etc.)
   - Spring festivals (shepherd-of-the-hills-spring-fest, etc.)
   
4. **Sorts Attractions** - Alphabetically by show name (for consistency)

5. **Updates Metadata** - Adds processing note with timestamp and summary

## Input Files

- `/Users/alex/vaults/Vacation/Branson 2026/sources/Source Data Ajustments.md`
- `/Users/alex/vaults/Vacation/Branson 2026/data/attractions.json`
- `/Users/alex/vaults/Vacation/Branson 2026/data/blacklist.json`

## Output Files (Modified)

- `/Users/alex/vaults/Vacation/Branson 2026/data/attractions.json`
- `/Users/alex/vaults/Vacation/Branson 2026/data/blacklist.json`

## Expected Results

Based on Source Data Ajustments.md:
- **Duplicates removed**: 13-35 entries (depending on state)
- **Thumbnails transferred**: 6 entries (David, Doo-Wop & More, Melody Hart, Pets and Giggles, Shepherds, Sound of Simon & Garfunkel)
- **Seasonal shows blacklisted**: 19 entries (Christmas, New Year's, spring events)
- **Final attraction count**: ~110 entries

## Key Features

✓ **Defensive** - Uses pathlib, safe key access (.get()), error handling
✓ **Idempotent** - Can run multiple times safely
✓ **Detailed Output** - Shows each change in 5 phases with progress indicators
✓ **No Dependencies** - Uses only Python standard library (json, re, pathlib, datetime)
✓ **Clear Summary** - Reports counts before/after for verification

## Verify Success

After running, you should see:
```
================================================================================
✓ PROCESSING COMPLETE
================================================================================
```

With a summary showing:
- Number of entries removed
- Number of thumbnails transferred
- Number of blacklist entries added
- Final attraction count

## Troubleshooting

**Q: Script shows 0 removals and 0 transfers**
A: This means the duplicates were already removed in a prior run. Script is idempotent and won't fail.

**Q: "Duplicate entry not found" warnings**
A: Duplicates were already removed. This is normal on subsequent runs.

**Q: Blacklist entries show "~" (already in list)**
A: Seasonal shows were already blacklisted. Script skips duplicates in blacklist.

## Documentation

For full documentation, see: `scripts/PROCESS_SOURCE_DATA_ADJUSTMENTS.md`

---

**Last Updated**: 2026-04-19  
**Script Location**: `/Users/alex/vaults/Vacation/Branson 2026/scripts/process_source_data_adjustments.py`  
**Vault Root**: `/Users/alex/vaults/Vacation/Branson 2026`
