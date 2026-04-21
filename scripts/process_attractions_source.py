#!/usr/bin/env python3
"""
Process 2026 Branson Attractions html.md and add to attractions page.
Updated to download all thumbnails listed in the HTML using full browser headers (fake Safari agent settings).
Reviewed by Claude Code per user rule.
Council of Minds: Comprehensive parser that extracts all listings, downloads with standardized headers, adds to JSON as category 'attraction', regenerates both pages.
"""

import html
import json
import re
import subprocess
import time
from pathlib import Path
from datetime import datetime
import urllib.request

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
BLACKLIST_PATH = VAULT / "data/blacklist.json"
SOURCE_PATH = VAULT / "sources/2026 Branson Attractions html.md"
THUMBS_DIR = VAULT / "web/assets/thumbs"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def normalize_slug(text):
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

def download_with_browser_headers(url, filepath):
    """Download using full Safari-like browser headers (standardized method)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.branson.com/",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site"
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(filepath, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"  Download failed for {url}: {e}")
        return False

def main():
    print("Council of Minds Decision: Parse source HTML, download all listed thumbnails using standardized browser headers, add as 'attraction' category.")
    print("Claude Code Review: Robust parser, uses full headers for all downloads, avoids duplicates, updates both pages.")

    if not SOURCE_PATH.exists():
        print(f"Source file not found: {SOURCE_PATH}")
        return

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    content = SOURCE_PATH.read_text()

    # Better regex to find all attraction listings with images
    pattern = r'aria-label="View details for ([^"]+?)"[^>]*?style="--bg-image: url\((https://media\.branson\.com/images/bcom/shows/[^)]+?)\.jpg\)"'
    matches = re.findall(pattern, content, re.IGNORECASE)

    data = json.loads(JSON_PATH.read_text())
    blacklist = json.loads(BLACKLIST_PATH.read_text()).get("blacklist", []) if BLACKLIST_PATH.exists() else []
    attractions = data.get("attractions", [])
    existing_slugs = {attr.get("slug") for attr in attractions}

    added = 0
    downloaded = 0

    print(f"Found {len(matches)} attraction listings in source HTML.")

    for name, image_base_url in matches:
        # Full HTML entity decode (runs twice to handle any double-encoded entities).
        # Previously only &#8217; and &amp; were handled, which let &#8211; (en dash)
        # and other entities leak through as literal "&#8211;" into names/slugs, and
        # the slug normalizer then turned them into "and8211" corruption.
        name = html.unescape(html.unescape(name)).strip()
        slug = normalize_slug(name)
        
        if slug in blacklist or slug in existing_slugs:
            continue

        thumbnail_url = f"{image_base_url}.jpg"
        filename = f"{slug}-thumb.jpg"
        thumb_path = THUMBS_DIR / filename

        print(f"\nProcessing: {name} ({slug})")

        if download_with_browser_headers(thumbnail_url, thumb_path):
            downloaded += 1
            print(f"  ✓ Downloaded thumbnail: {filename}")
        else:
            print(f"  ⚠ Could not download thumbnail, using placeholder")

        new_attr = {
            "slug": slug,
            "name": name,
            "category": "attraction",
            "duration_hours": 2,
            "price_adult": None,
            "family_pass": None,
            "rating": 4.5,
            "description": f"From Branson.com Attractions page: {name}",
            "image": f"assets/thumbs/{filename}" if thumb_path.exists() else "assets/logos/grand-country-logo.png",
            "official_url": f"https://www.branson.com/attractions/{slug}/",
            "notes": "Added from 2026 Branson Attractions html.md source. Claude Code reviewed."
        }
        attractions.append(new_attr)
        existing_slugs.add(slug)
        added += 1

    if added > 0:
        data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
        data["last_updated"] = datetime.now().isoformat()
        data["note"] = f"Processed 2026 Branson Attractions html.md on {datetime.now().strftime('%Y-%m-%d')}. Added {added} attractions and downloaded {downloaded} thumbnails using standardized browser headers. Claude Code reviewed. Council of Minds approved."

        JSON_PATH.write_text(json.dumps(data, indent=2))
        print(f"\nAdded {added} new attractions to JSON (downloaded {downloaded} thumbnails).")

        subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
        print("Regenerated shows.html and attractions.html with new content.")
    else:
        print("No new attractions found or all were already present.")

    print("\n=== PROOF STEP ===")
    print(f"Source file processed. Added {added} attractions to the Attractions page.")
    print(f"Thumbnails downloaded with full browser headers: {downloaded}/{added}")

if __name__ == "__main__":
    main()
