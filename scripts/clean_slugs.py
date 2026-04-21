#!/usr/bin/env python3
"""Clean slugs in attractions.json -- remove HTML entity artifacts."""
import json
import re
from pathlib import Path

VAULT = Path(__file__).parent.parent

def clean_slug(name: str) -> str:
    """Generate clean slug from name: lowercase, hyphens, no leading/trailing dashes."""
    if not name:
        return ""
    # Lowercase
    slug = name.lower()
    # Replace common special chars and spaces with hyphens
    slug = re.sub(r'[&\s\'\"]+', '-', slug)
    # Remove other special chars
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    # Strip leading/trailing hyphens
    slug = slug.strip('-')
    # Collapse multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    return slug

def main():
    data_path = VAULT / "data" / "attractions.json"
    bak_path = VAULT / "data" / "attractions.json.pre-slug-clean.bak"
    
    # Load
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both raw list and dict with 'attractions' key
    if isinstance(data, dict):
        attractions = data.get("attractions", [])
    else:
        attractions = data
    
    # Backup
    bak_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Backed up to {bak_path.name}")
    
    # Clean
    renames = []
    for a in attractions:
        old_slug = a.get("slug", "")
        name = a.get("name", "")
        new_slug = clean_slug(name)
        
        if new_slug and old_slug != new_slug:
            renames.append((old_slug, new_slug))
            print(f"  RENAMED: {old_slug} → {new_slug}")
            a["slug"] = new_slug
        elif not new_slug:
            print(f"  WARNING: could not generate slug for {name}")
    
    # Write
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Cleaned {len(renames)} slugs. Wrote {data_path}")

if __name__ == "__main__":
    main()
