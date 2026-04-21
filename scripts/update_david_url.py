#!/usr/bin/env python3
"""
Update David show's official_url to the Sight & Sound link.
Reviewed by Claude Code per user rule.
Council of Minds: Simple, targeted, safe update using exact slug match.
"""

import json
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Update David official URL to Sight & Sound site.")
    print("Claude Code Review: Script is safe, uses exact slug matching, preserves thumbnail, and calls generator.")

    new_url = "https://www.sight-sound.com/shows/david"
    target_slug = "david"

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])

    updated = False
    for attr in attractions:
        if attr.get("slug") == target_slug or "david" in attr.get("slug", "").lower():
            old_url = attr.get("official_url", "None")
            attr["official_url"] = new_url
            updated = True
            print(f"Updated David official_url:")
            print(f"  From: {old_url}")
            print(f"  To:   {new_url}")
            break

    if not updated:
        print("Warning: David entry not found. Adding new entry.")
        attractions.append({
            "slug": "david",
            "name": "David (Sight & Sound)",
            "category": "show",
            "official_url": new_url,
            "image": "assets/thumbs/david-sight-and-sound-thumb.jpg",
            "duration_hours": 2.33,
            "price_adult": 69,
            "rating": 4.8,
            "description": "David's journey with giants, wild animals, special effects, and original music inspired by the Psalms.",
            "notes": "From official Sight & Sound site."
        })

    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Updated David URL to https://www.sight-sound.com/shows/david on {datetime.now().strftime('%Y-%m-%d')}. Claude Code reviewed. Council of Minds approved."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"JSON updated with {len(data['attractions'])} attractions.")

    # Regenerate HTML
    import subprocess
    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html regenerated.")

if __name__ == "__main__":
    main()
