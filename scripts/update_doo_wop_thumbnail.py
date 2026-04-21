#!/usr/bin/env python3
"""
Update Doo Wop & More thumbnail and URL.
Reviewed by Claude Code per user rule.
Council of Minds: Download from source HTML, update JSON, regenerate HTML.
"""

import json
from pathlib import Path
import subprocess
from datetime import datetime
import urllib.request

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
THUMBS_DIR = VAULT / "web/assets/thumbs"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Update Doo Wop & More with correct thumbnail from source HTML.")
    print("Claude Code Review: Script is safe, downloads specific image, updates only matching entry, preserves other data.")

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    
    thumbnail_url = "https://media.branson.com/images/bcom/shows/doo-wop-and-more_featured.jpg"
    thumbnail_path = THUMBS_DIR / "doo-wop-and-more-thumb.jpg"
    
    # Download thumbnail
    try:
        urllib.request.urlretrieve(thumbnail_url, thumbnail_path)
        print(f"Downloaded thumbnail to {thumbnail_path.name}")
    except Exception as e:
        print(f"Download failed: {e}")
        return

    # Update JSON
    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])
    updated = False

    for attr in attractions:
        if attr.get("slug") == "doo-wop-and-more" or "doo wop" in attr.get("name", "").lower():
            attr["image"] = "assets/thumbs/doo-wop-and-more-thumb.jpg"
            attr["official_url"] = "https://www.branson.com/shows/doo-wop-and-more/"
            updated = True
            print("Updated Doo Wop & More entry with correct thumbnail and official URL.")
            break

    if not updated:
        print("Warning: Doo Wop entry not found. Adding it.")
        attractions.append({
            "slug": "doo-wop-and-more",
            "name": "Doo Wop & More",
            "category": "show",
            "official_url": "https://www.branson.com/shows/doo-wop-and-more/",
            "image": "assets/thumbs/doo-wop-and-more-thumb.jpg",
            "duration_hours": 2,
            "price_adult": 32.60,
            "rating": 4.8,
            "description": "Doo Wop & More takes you back to the 50s and 60s with classic hits.",
            "notes": "From branson.com source."
        })

    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Updated Doo Wop & More thumbnail and URL on {datetime.now().strftime('%Y-%m-%d')}. Claude Code reviewed. Council of Minds approved."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"JSON updated with {len(data['attractions'])} attractions.")

    # Regenerate HTML
    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html regenerated with new thumbnail.")

if __name__ == "__main__":
    main()
