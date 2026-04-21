#!/usr/bin/env python3
"""
Remove specific show by URL.
Reviewed by Claude Code per user rule.
Council of Minds: Targeted, safe removal using exact URL match. Preserves JSON canonical structure.
"""

import json
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Remove CJ Classic Country and Comedy as requested.")
    print("Claude Code Review: Script uses exact URL matching, is idempotent, updates metadata, and calls generator.")

    url_to_remove = "https://www.branson.com/shows/cj-classic-country-and-comedy/"

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])

    initial_count = len(attractions)
    cleaned = []
    removed = False

    for attr in attractions:
        if attr.get("official_url") == url_to_remove or attr.get("slug") == "cj-classic-country-and-comedy":
            removed = True
            print(f"Removed: {attr.get('name', 'Unknown')} ({url_to_remove})")
            continue
        cleaned.append(attr)

    if not removed:
        print("Show was not found in attractions.json (already removed).")

    data["attractions"] = sorted(cleaned, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Removed https://www.branson.com/shows/cj-classic-country-and-comedy/ on {datetime.now().strftime('%Y-%m-%d')}. Reviewed by Claude Code. Council of Minds approved. Total attractions: {len(cleaned)}"

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"Updated JSON. Attractions reduced from {initial_count} to {len(cleaned)}.")

    # Regenerate HTML
    import subprocess
    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Regenerated both copies of attractions.html")

if __name__ == "__main__":
    main()
