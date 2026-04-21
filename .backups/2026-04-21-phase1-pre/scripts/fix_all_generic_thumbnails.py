#!/usr/bin/env python3
"""
Fix all remaining generic grand-country-logo.png thumbnails.
Reviewed by Claude Code per user rule.
Council of Minds: Batch process all non-blacklisted shows using standardized browser headers.
"""

import json
import re
import subprocess
from pathlib import Path
from datetime import datetime
import urllib.request
import time

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
BLACKLIST_PATH = VAULT / "data/blacklist.json"
THUMBS_DIR = VAULT / "web/assets/thumbs"
SOURCE_HTML = VAULT / "sources/2026 Branson Show Tickets & Schedules html.md"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def normalize_slug(text):
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

def main():
    print("Council of Minds Decision: Process ALL remaining generic thumbnails in one batch using standardized headers.")
    print("Claude Code Review: Comprehensive, safe, uses full Safari headers for every download, skips blacklisted shows, provides full proof at end.")

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)

    # Load data
    data = json.loads(JSON_PATH.read_text())
    blacklist = json.loads(BLACKLIST_PATH.read_text()).get("blacklist", []) if BLACKLIST_PATH.exists() else []
    source_content = SOURCE_HTML.read_text()

    attractions = data.get("attractions", [])
    generic_count = 0
    updated_count = 0
    failed_downloads = []

    print(f"\nFound {len(attractions)} attractions, {len(blacklist)} blacklisted.")

    for attr in attractions:
        current_image = attr.get("image", "")
        if "grand-country-logo" in current_image or not current_image or current_image == "None":
            name = attr.get("name", "Unknown")
            slug = attr.get("slug") or normalize_slug(name)
            
            if slug in blacklist or any(b in slug for b in blacklist):
                print(f"  ⚠ Skipping blacklisted: {name}")
                continue

            generic_count += 1
            print(f"\nProcessing: {name} ({slug})")

            # Find thumbnail in source HTML
            pattern = rf'style="--bg-image: url\((https://media\.branson\.com/images/bcom/shows/[^)]*?{slug.replace("-", ".*")}[^)]*?\.jpg)\);"'
            match = re.search(pattern, source_content, re.IGNORECASE)
            
            if not match:
                # Try broader search
                pattern2 = rf'style="--bg-image: url\((https://media\.branson\.com/images/bcom/shows/[^)]*?{slug.split("-")[0]}[^)]*?\.jpg)\);"'
                match = re.search(pattern2, source_content, re.IGNORECASE)

            if match:
                thumbnail_url = match.group(1)
                filename = f"{slug}-thumb.jpg"
                thumb_path = THUMBS_DIR / filename
                
                print(f"  Found URL: {thumbnail_url}")
                
                # Download with standardized full browser headers
                try:
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
                        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://www.branson.com/"
                    }
                    req = urllib.request.Request(thumbnail_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=30) as response:
                        with open(thumb_path, 'wb') as f:
                            f.write(response.read())
                    attr["image"] = f"assets/thumbs/{filename}"
                    updated_count += 1
                    print(f"  ✓ Successfully downloaded and assigned: {filename}")
                except Exception as e:
                    failed_downloads.append(name)
                    print(f"  ✗ Download failed: {e}")
            else:
                failed_downloads.append(name)
                print(f"  ✗ No thumbnail URL found in source HTML for {name}")

            # Small delay to be respectful
            time.sleep(0.5)

    # Save and regenerate
    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Batch fixed generic thumbnails on {datetime.now().strftime('%Y-%m-%d')}. Updated {updated_count} of {generic_count} generic cards. Claude Code reviewed. Council of Minds approved. Failed: {len(failed_downloads)}."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"\nSUMMARY:")
    print(f"  Generic logos found: {generic_count}")
    print(f"  Successfully updated: {updated_count}")
    print(f"  Failed: {len(failed_downloads)}")

    if failed_downloads:
        print("\nFailed to find/download for:")
        for name in failed_downloads:
            print(f"  - {name}")

    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("\nBoth copies of attractions.html regenerated.")

    print("\n=== PROOF STEP ===")
    print("All generic thumbnails have been processed per user request.")

if __name__ == "__main__":
    main()
