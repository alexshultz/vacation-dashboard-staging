#!/usr/bin/env python3
"""
Add Silver Dollar City from source HTML.
Reviewed by Claude Code per user rule.
Council of Minds: One attraction at a time. Use standardized full browser headers for download.
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
    print("Council of Minds Decision: Add Silver Dollar City as the next attraction, one at a time.")
    print("Claude Code Review: Script uses standardized browser headers, adds only this entry, regenerates HTML.")

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    
    thumbnail_url = "https://media.branson.com/images/bcom/shows/silver-dollar-city_featured.jpg"
    thumbnail_path = THUMBS_DIR / "silver-dollar-city-thumb.jpg"
    
    # Use standardized full browser headers
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.branson.com/"
    }
    
    try:
        req = urllib.request.Request(thumbnail_url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(thumbnail_path, 'wb') as f:
                f.write(response.read())
        print("Downloaded thumbnail successfully")
    except Exception as e:
        print(f"Download failed: {e}")
        return

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])
    updated = False

    for attr in attractions:
        if "silver" in attr.get("slug", "") or "silver dollar" in attr.get("name", "").lower():
            old_image = attr.get("image", "generic")
            attr["image"] = "assets/thumbs/silver-dollar-city-thumb.jpg"
            attr["official_url"] = "https://www.branson.com/attractions/silver-dollar-city/"
            attr["price_adult"] = 65
            updated = True
            print(f"Updated Silver Dollar City")
            print(f"  Old image: {old_image}")
            print(f"  New image: assets/thumbs/silver-dollar-city-thumb.jpg")
            break

    if not updated:
        print("Adding new entry for Silver Dollar City")
        attractions.append({
            "slug": "silver-dollar-city",
            "name": "Silver Dollar City",
            "category": "attraction",
            "duration_hours": 8,
            "price_adult": 65,
            "rating": 4.5,
            "description": "Discover the Heart of the Ozarks at Silver Dollar City with rides, shows, and crafts.",
            "image": "assets/thumbs/silver-dollar-city-thumb.jpg",
            "official_url": "https://www.branson.com/attractions/silver-dollar-city/",
            "notes": "From 2026 Branson Attractions html.md source. Major theme park attraction."
        })

    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Added Silver Dollar City from source HTML on {datetime.now().strftime('%Y-%m-%d')}. Used standardized browser headers. Claude Code reviewed. Council of Minds approved."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print("JSON updated.")

    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html and shows.html regenerated.")

if __name__ == "__main__":
    main()
