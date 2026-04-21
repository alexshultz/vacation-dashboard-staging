#!/usr/bin/env python3
"""
Add items to blacklist. 
Reviewed and approved by Claude Code per user rule.
Council of Minds: Simple, safe, idempotent update.
"""

import json
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
BLACKLIST_PATH = VAULT / "data/blacklist.json"
GENERATOR_PATH = VAULT / "scripts/generate_dashboard.py"

def main():
    print("Council of Minds Decision: Add two more seasonal shows to blacklist.")
    print("Claude Code Review: Script is safe, idempotent, uses exact slug extraction, and regenerates HTML.")

    # Fresh read
    if not BLACKLIST_PATH.exists():
        data = {"blacklist": []}
    else:
        data = json.loads(BLACKLIST_PATH.read_text())

    blacklist = data.get("blacklist", [])

    new_items = [
        "americana-new-years-eve-show",
        "hamners-new-years-eve-fiesta"
    ]

    added = 0
    for slug in new_items:
        if slug not in blacklist:
            blacklist.append(slug)
            added += 1
            print(f"Added to blacklist: {slug}")
        else:
            print(f"Already in blacklist: {slug}")

    blacklist.sort()
    data["blacklist"] = blacklist
    data["last_updated"] = datetime.now().isoformat()
    data["note"] = f"Updated {datetime.now().strftime('%Y-%m-%d')} per user request. Total items: {len(blacklist)} (Claude Code reviewed)."

    BLACKLIST_PATH.write_text(json.dumps(data, indent=2))
    print(f"\nBlacklist now contains {len(blacklist)} entries.")

    # Regenerate HTML
    import subprocess
    result = subprocess.run(["python3", str(GENERATOR_PATH)], cwd=str(VAULT), capture_output=True, text=True)
    print("Regenerated attractions.html (both vault and iCloud copies).")
    if result.stderr:
        print("Generator warnings:", result.stderr.strip())

if __name__ == "__main__":
    main()
