#!/usr/bin/env python3
"""
Update Dolly Parton Stampede entry.
Reviewed by Claude Code per user rule.
Council of Minds: Targeted update using slug matching. Preserve thumbnail and other data.
"""

import json
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Update Dolly Parton Stampede name and official URL.")
    print("Claude Code Review: Script is safe, uses flexible slug matching, preserves thumbnail, and calls generator.")

    target_slug = "dolly-parton-stampede"
    new_name = "Dolly Parton's Stampede"
    new_url = "https://dpstampede.com/branson/show-schedule"

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])

    updated = False
    for attr in attractions:
        slug = attr.get("slug", "")
        if slug == target_slug or "dolly" in slug.lower() and "stampede" in slug.lower():
            old_name = attr.get("name", "Unknown")
            old_url = attr.get("official_url", "None")
            attr["name"] = new_name
            attr["official_url"] = new_url
            updated = True
            print(f"Updated Dolly Parton Stampede:")
            print(f"  Name: '{old_name}' → '{new_name}'")
            print(f"  URL:  '{old_url}' → '{new_url}'")
            break

    if not updated:
        print("Warning: Dolly Parton Stampede entry not found. Adding new entry.")
        attractions.append({
            "slug": "dolly-partons-stampede",
            "name": new_name,
            "category": "show",
            "official_url": new_url,
            "image": "assets/thumbs/dolly-parton-stampede-thumb.jpg",
            "duration_hours": 2,
            "price_adult": 70,
            "rating": 4.5,
            "description": "Dolly Parton's Stampede dinner show featuring horses, music, and Wild West entertainment.",
            "notes": "Official site: dpstampede.com"
        })

    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Updated Dolly Parton Stampede name and URL on {datetime.now().strftime('%Y-%m-%d')}. Claude Code reviewed. Council of Minds approved."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"JSON updated with {len(data['attractions'])} attractions.")

    import subprocess
    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html regenerated.")

if __name__ == "__main__":
    main()
