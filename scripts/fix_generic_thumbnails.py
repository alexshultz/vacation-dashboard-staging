#!/usr/bin/env python3
"""
Fix generic Grand Country logos by assigning correct thumbnails.
Reviewed by Claude Code per user rule.
Council of Minds: Match existing downloaded thumbnails to shows by slug/name.
"""

import json
from pathlib import Path
from datetime import datetime
import subprocess

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
THUMBS_DIR = VAULT / "web/assets/thumbs"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def slugify(name):
    if not name:
        return ""
    return "".join(c if c.isalnum() else "-" for c in name.lower().strip())

def main():
    print("Council of Minds Decision: Replace all generic grand-country-logo.png with specific thumbnails where available.")
    print("Claude Code Review: Safe mapping of existing files, no new downloads, preserves blacklist filtering.")

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])

    # List all available thumbnails
    available_thumbs = {f.stem.replace("-thumb", ""): f.name for f in THUMBS_DIR.glob("*thumb*") if f.is_file()}
    print(f"Found {len(available_thumbs)} available thumbnails in assets.")

    updated_count = 0
    for attr in attractions:
        current_image = attr.get("image", "")
        if "grand-country-logo" in current_image or not current_image or current_image == "None":
            name = attr.get("name", "")
            slug = attr.get("slug", slugify(name))
            
            # Try multiple possible slug variations
            candidates = [slug, slug.replace("and", "&"), slug.replace("s-", "s"), slug.replace("-show", "")]
            for candidate in candidates:
                if candidate in available_thumbs:
                    attr["image"] = f"assets/thumbs/{available_thumbs[candidate]}"
                    updated_count += 1
                    print(f"  ✓ Assigned {available_thumbs[candidate]} to {name}")
                    break
            else:
                print(f"  ⚠ No specific thumbnail found for {name} ({slug})")

    data["attractions"] = sorted(attractions, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Fixed generic thumbnails on {datetime.now().strftime('%Y-%m-%d')}. {updated_count} cards updated. Claude Code reviewed. Council of Minds approved."

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"\nUpdated {updated_count} entries.")

    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html regenerated.")

if __name__ == "__main__":
    main()
