#!/usr/bin/env python3
"""Audit thumbnail inventory for attractions."""
import json
from pathlib import Path

VAULT = Path(__file__).parent.parent

def main():
    data_path = VAULT / "data" / "attractions.json"
    thumbs_dir = VAULT / "web" / "assets" / "thumbs"
    
    # Load attractions
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both raw list and dict with 'attractions' key
    if isinstance(data, dict):
        attractions = data.get("attractions", [])
    else:
        attractions = data
    
    # Audit
    rows = []
    with_thumb = 0
    total = 0
    
    for a in attractions:
        total += 1
        slug = a.get("slug", "")
        name = a.get("name", "")
        
        # Check for thumb
        has_thumb = False
        for ext in ("jpg", "jpeg", "png", "webp"):
            p = thumbs_dir / f"{slug}-thumb.{ext}"
            if p.exists():
                has_thumb = True
                break
        
        if has_thumb:
            with_thumb += 1
            thumb_status = "✓"
        else:
            thumb_status = "✗"
        
        # Fallback letter
        letter = name[0].lower() if name and name[0].isalpha() else "?"
        
        rows.append((slug, name, thumb_status, letter))
    
    # Print markdown table
    print("| Slug | Name | Thumb | Fallback |")
    print("|------|------|-------|----------|")
    for slug, name, status, letter in rows:
        # Truncate name if long
        display_name = name[:50] + "..." if len(name) > 50 else name
        print(f"| `{slug}` | {display_name} | {status} | **{letter}** |")
    
    print(f"\n**Summary:** {with_thumb} of {total} attractions have real thumbnails ({100*with_thumb//total}%)")

if __name__ == "__main__":
    main()
