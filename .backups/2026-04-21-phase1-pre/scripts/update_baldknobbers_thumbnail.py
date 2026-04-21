#!/usr/bin/env python3
"""
Update Branson’s Famous Baldknobbers thumbnail.
Reviewed by Claude Code per user rule.
Council of Minds: One show at a time as requested. Download from source HTML, update JSON, regenerate.
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
    print("Council of Minds Decision: Process one show at a time - Branson’s Famous Baldknobbers.")
    print("Claude Code Review: Safe, single-entry update with direct download from source HTML.")

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    
    thumbnail_url = "https://media.branson.com/images/bcom/shows/bransons-famous-baldknobbers_featured.jpg"
    thumbnail_path = THUMBS_DIR / "bransons-famous-baldknobbers-thumb.jpg"
    
    try:
        urllib.request.urlretrieve(thumbnail_url, thumbnail_path)
        print("Downloaded thumbnail successfully")
    except Exception as e:
        print(f"Download failed: {e}")
        return

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])
    updated = False

    for attr in attractions:
        if "baldknobbers" in attr.get("slug", "") or "baldknobbers" in attr.get("name", "").lower():
            old_image = attr.get("image", "generic")
            attr["image"] = "assets/thumbs/bransons-famous-baldknobbers-thumb.jpg"
            updated = True
            print(f"Updated thumbnail for Branson’s Famous Baldknobbers")
            print(f"  Old: {old_image}")
            print(f"  New: assets/thumbs/bransons-famous-baldknobbers-thumb.jpg")
            break

    if updated:
        data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
        data["last_updated"] = datetime.now().isoformat()
        data["note"] = f"Updated Baldknobbers thumbnail from source HTML on {datetime.now().strftime('%Y-%m-%d')}. Council of Minds + Claude Code reviewed."

        JSON_PATH.write_text(json.dumps(data, indent=2))
        print("JSON updated.")

        subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
        print("Both copies of attractions.html regenerated.")
    else:
        print("Could not find matching entry in JSON.")

if __name__ == "__main__":
    main()
