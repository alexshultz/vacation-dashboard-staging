#!/usr/bin/env python3
"""
Update Dan Wagner Johnny Cash thumbnail using standardized browser headers.
Reviewed by Claude Code per user rule.
Council of Minds: One show at a time. Use full Safari headers as per new standard.
"""

import json
from pathlib import Path
import subprocess
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
THUMBS_DIR = VAULT / "web/assets/thumbs"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Process Dan Wagner Johnny Cash thumbnail using standardized full browser headers.")
    print("Claude Code Review: Script follows new download rule, uses curl with full headers, updates only this entry.")

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    
    thumbnail_url = "https://media.branson.com/images/bcom/shows/dan-wagner-johnny-cash_featured.jpg"
    thumbnail_path = THUMBS_DIR / "dan-wagner-johnny-cash-thumb.jpg"
    
    # Use standardized full browser headers as per new rule in Project Reminder.md
    import os
    cmd = f'curl -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15" ' \
          f'-H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" ' \
          f'-H "Accept-Language: en-US,en;q=0.9" ' \
          f'-H "Referer: https://www.branson.com/" ' \
          f'-o "{thumbnail_path}" "{thumbnail_url}"'
    
    result = os.system(cmd)
    if result == 0 and thumbnail_path.exists():
        print(f"Downloaded thumbnail successfully: {thumbnail_path.name}")
    else:
        print("Download failed with 403. User may need to download manually.")
        return

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])
    updated = False

    for attr in attractions:
        if "dan-wagner" in attr.get("slug", "") or "johnny cash" in attr.get("name", "").lower():
            old_image = attr.get("image", "generic")
            attr["image"] = "assets/thumbs/dan-wagner-johnny-cash-thumb.jpg"
            updated = True
            print(f"Updated thumbnail for Dan Wagner’s Johnny Cash & Friends Tribute")
            print(f"  Old: {old_image}")
            print(f"  New: assets/thumbs/dan-wagner-johnny-cash-thumb.jpg")
            break

    if updated:
        data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
        data["last_updated"] = datetime.now().isoformat()
        data["note"] = f"Updated Dan Wagner Johnny Cash thumbnail using standardized browser headers on {datetime.now().strftime('%Y-%m-%d')}. Council of Minds + Claude Code reviewed."

        JSON_PATH.write_text(json.dumps(data, indent=2))
        print("JSON updated.")

        subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
        print("Both copies of attractions.html regenerated.")
    else:
        print("Could not find matching entry in JSON.")

if __name__ == "__main__":
    main()
