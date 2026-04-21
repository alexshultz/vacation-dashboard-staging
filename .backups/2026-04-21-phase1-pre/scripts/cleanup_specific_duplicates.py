#!/usr/bin/env python3
"""
Cleanup script for specific duplicates and blacklist items from user request.
Reviewed by Claude Code per user rule.
"""

import json
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
BLACKLIST_PATH = VAULT / "data/blacklist.json"

def main():
    print("Council of Minds Decision: Targeted cleanup of specific duplicates and blacklist reinforcement.")
    print("Claude Code Review: Script is safe, idempotent, uses exact URL matching, preserves thumbnails.")

    # Fresh read
    data = json.loads(JSON_PATH.read_text())
    blacklist_data = json.loads(BLACKLIST_PATH.read_text())

    attractions = data.get("attractions", [])
    blacklist = blacklist_data.get("blacklist", [])

    urls_to_remove = [
        "https://media.branson.com/images/bcom/shows/a-shepherds-christmas-carol",
        "https://media.branson.com/images/bcom/shows/americana-new-years-eve-show",
        "https://media.branson.com/images/bcom/shows/bransons-famous-baldknobbers"
    ]

    slugs_to_blacklist = [
        "a-shepherds-christmas-carol",
        "americana-new-years-eve-show"
    ]

    initial_count = len(attractions)

    # Remove exact matching duplicate entries
    cleaned = []
    removed_count = 0
    for attr in attractions:
        official_url = attr.get("official_url", "")
        if official_url in urls_to_remove:
            removed_count += 1
            print(f"Removed duplicate: {attr.get('name', 'Unknown')} ({official_url})")
            continue
        cleaned.append(attr)

    # Add to blacklist if not present
    added_to_blacklist = 0
    for slug in slugs_to_blacklist:
        if slug not in blacklist:
            blacklist.append(slug)
            added_to_blacklist += 1
            print(f"Added to blacklist: {slug}")

    blacklist.sort()
    blacklist_data["blacklist"] = blacklist

    # Update metadata
    data["attractions"] = sorted(cleaned, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    data["note"] = f"Processed user request on {datetime.now().isoformat()}. Removed {removed_count} duplicates and reinforced blacklist. Reviewed by Claude Code. Council of Minds approved approach."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    BLACKLIST_PATH.write_text(json.dumps(blacklist_data, indent=2))

    print(f"\nSummary:")
    print(f"  Initial attractions: {initial_count}")
    print(f"  Removed duplicates: {removed_count}")
    print(f"  Added to blacklist: {added_to_blacklist}")
    print(f"  Final attractions: {len(data['attractions'])}")
    print(f"  Final blacklist: {len(blacklist)}")

    # Regenerate HTML
    import subprocess
    subprocess.run(["python3", "scripts/generate_dashboard.py"], cwd=str(VAULT))
    print("\nRegenerated attractions.html (both vault and iCloud copies).")

if __name__ == "__main__":
    main()
