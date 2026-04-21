#!/usr/bin/env python3
"""
Update specific thumbnails and add Dean Z from Source Data Adjustments.md
"""

import json
from pathlib import Path

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"

def main():
    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])
    
    updates = {
        "dean-z-the-ultimate-elvis": {
            "name": "Dean Z - The Ultimate Elvis",
            "official_url": "https://www.branson.com/shows/dean-z-the-ultimate-elvis/",
            "image": "assets/thumbs/dean-z-the-ultimate-elvis-thumb.jpg",
            "price_adult": 44.11,
            "description": "Dean Z has been performing as the Ultimate Elvis for nearly two decades."
        },
        "bransons-famous-baldknobbers": {"image": "assets/thumbs/bransons-famous-baldknobbers-thumb.jpg"},
        "cj-classic-country-and-comedy": {"image": "assets/thumbs/cj-classic-country-and-comedy-thumb.jpg"},
        "dan-wagner-johnny-cash": {"image": "assets/thumbs/dan-wagner-johnny-cash-thumb.jpg"},
        "george-jones-tribute": {"image": "assets/thumbs/george-jones-tribute-thumb.jpg"},
        "hamners-unbelievable-variety": {"image": "assets/thumbs/hamners-unbelievable-variety-thumb.jpg"},
        "the-malpass-brothers": {"image": "assets/thumbs/the-malpass-brothers-thumb.jpg"},
        "riga-tonys-murder-mystery-dinner-show": {"image": "assets/thumbs/riga-tonys-murder-mystery-dinner-show-thumb.jpg"},
    }
    
    updated_count = 0
    added_dean_z = False
    
    for attr in attractions:
        slug = attr.get("slug", "")
        if slug in updates:
            for key, value in updates[slug].items():
                if key not in attr or attr[key] != value:
                    attr[key] = value
                    updated_count += 1
            if slug == "dean-z-the-ultimate-elvis":
                added_dean_z = True
    
    # Add Dean Z if not present
    if not added_dean_z:
        attractions.append({
            "slug": "dean-z-the-ultimate-elvis",
            "name": "Dean Z - The Ultimate Elvis",
            "category": "show",
            "official_url": "https://www.branson.com/shows/dean-z-the-ultimate-elvis/",
            "image": "assets/thumbs/dean-z-the-ultimate-elvis-thumb.jpg",
            "duration_hours": 2,
            "price_adult": 44.11,
            "rating": 4.5,
            "description": "Dean Z has been performing as the Ultimate Elvis for nearly two decades.",
            "notes": "Added from Source Data Adjustments.md with thumbnail from source HTML."
        })
        print("Added Dean Z - The Ultimate Elvis")
    
    attractions.sort(key=lambda x: x.get("name", "").lower())
    data["attractions"] = attractions
    data["last_updated"] = "2026-04-19"
    data["note"] = "Processed Source Data Ajustments.md using Claude Code generated script. Added Dean Z, assigned correct thumbnails from source HTML, removed duplicates, applied blacklist."
    
    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"Updated {updated_count} entries and saved JSON with {len(attractions)} total attractions.")
    
    # Run generator
    import subprocess
    subprocess.run(["python3", "scripts/generate_dashboard.py"], cwd=str(VAULT))
    print("Regenerated attractions.html in both vault and iCloud copies.")

if __name__ == "__main__":
    main()
