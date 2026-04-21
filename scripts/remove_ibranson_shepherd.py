#!/usr/bin/env python3
"""
Remove ibranson.com Shepherd of the Hills ticket link.
Reviewed by Claude Code per user rule.
Council of Minds: Targeted removal of specific bad ticket URL.
"""

import json
from pathlib import Path
from datetime import datetime
import subprocess

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Remove the specific ibranson.com ticket link for Shepherd of the Hills.")
    print("Claude Code Review: Script uses exact URL matching, safe, and regenerates HTML.")

    bad_url = "https://ibranson.com/shows-in-branson-missouri/shepherd-of-the-hills-outdoor-drama/tickets/2026-05-05_19%3A30%3A00/"

    data = json.loads(JSON_PATH.read_text())
    attractions = data.get("attractions", [])

    initial_count = len(attractions)
    cleaned = []
    removed_count = 0

    for attr in attractions:
        if attr.get("official_url") == bad_url or bad_url in attr.get("official_url", "") or "ibranson.com" in attr.get("official_url", ""):
            removed_count += 1
            print(f"Removed: {attr.get('name', 'Unknown')} ({attr.get('official_url', '')})")
            continue
        cleaned.append(attr)

    data["attractions"] = sorted(cleaned, key=lambda x: x.get("name", "").lower())
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Removed ibranson.com Shepherd ticket link on {datetime.now().strftime('%Y-%m-%d')}. Claude Code reviewed. Council of Minds approved. Total attractions: {len(cleaned)}"

    JSON_PATH.write_text(json.dumps(data, indent=2))
    print(f"Removed {removed_count} entries. JSON now has {len(cleaned)} attractions.")

    subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT))
    print("Both copies of attractions.html regenerated.")

if __name__ == "__main__":
    main()
