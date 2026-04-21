#!/usr/bin/env python3
"""
Process Source Data Adjustments for Branson 2026 attractions database.

This script:
1. Loads attractions.json and blacklist.json
2. For duplicates marked "keep the thumbnail", transfers thumbnail to better URL entry
3. Removes all listed duplicates (media.branson.com and americanatheatrebranson.com URLs)
4. Adds seasonal shows to the blacklist using slug format
5. Sorts attractions by name
6. Updates metadata notes
7. Prints a clear summary of changes
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

VAULT_ROOT = Path(__file__).parent.parent
DATA_DIR = VAULT_ROOT / "data"
SOURCES_DIR = VAULT_ROOT / "sources"

ATTRACTIONS_JSON = DATA_DIR / "attractions.json"
BLACKLIST_JSON = DATA_DIR / "blacklist.json"
ADJUSTMENTS_MD = SOURCES_DIR / "Source Data Ajustments.md"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================


def slugify(text: str) -> str:
    """Convert text to slug format."""
    text = text.lower().strip()
    # Replace common HTML entities
    text = text.replace("and8217", "")  # Remove HTML entity remnants
    text = text.replace("&8217", "")
    # Replace non-alphanumeric with hyphens
    text = re.sub(r"[^a-z0-9]+", "-", text)
    # Clean up multiple hyphens and leading/trailing hyphens
    text = re.sub(r"-+", "-", text).strip("-")
    return text


def extract_url_from_line(line: str) -> str:
    """Extract URL from a markdown line."""
    line = line.strip()
    if line.startswith("https://"):
        # Split by space or closing paren to handle inline URLs
        url = line.split()[0].rstrip(")")
        return url
    return None


def extract_slug_from_url(url: str) -> str:
    """Extract slug from a URL."""
    # Handle different URL formats
    if "branson.com/shows/" in url:
        slug = url.split("branson.com/shows/")[1].rstrip("/")
        return slug
    elif "media.branson.com" in url:
        slug = url.split("shows/")[1].rstrip("/")
        return slug
    elif "americanatheatrebranson.com" in url:
        slug = url.split("shows/")[1].rstrip(".html")
        return slug
    elif "gametime.co" in url:
        # Can't extract slug from gametime URLs, return None
        return None
    return None


def parse_adjustments_file(filepath: Path) -> Tuple[List[str], Dict[str, str], List[str]]:
    """
    Parse the Source Data Adjustments.md file.
    
    Returns:
        (duplicates_to_remove, thumbnails_to_preserve_map, seasonals_to_blacklist)
        
    thumbnails_to_preserve_map maps new_url -> old_duplicate_url 
    (to find the duplicate entry and extract its thumbnail)
    """
    duplicates = []
    thumbnails_map = {}  # new_url -> old_duplicate_url (for thumbnail extraction)
    seasonals = []
    
    with open(filepath, "r") as f:
        lines = f.readlines()
    
    current_section = None
    
    for i, line in enumerate(lines):
        line_raw = line  # Keep original for processing
        line = line.strip()
        
        # Detect section headers
        if line.startswith("Remove these duplicates:"):
            current_section = "remove"
            continue
        elif line.startswith("Add to the blacklist:"):
            current_section = "blacklist"
            continue
        elif line.startswith("Look in the source html"):
            current_section = "skip"
            continue
        elif line.startswith("Add this"):
            current_section = "skip"
            continue
        
        # Skip empty lines
        if not line:
            continue
        
        # Parse URLs
        if line.startswith("https://"):
            url = line.split()[0].rstrip(")")
            
            if current_section == "remove":
                # Check if there's a comment about preserving thumbnail
                if "(keep the thumbnail and use it on" in line:
                    # Extract the new URL from the parenthetical
                    match = re.search(r"https://[^\)]+\)", line)
                    if match:
                        new_url = match.group(0).rstrip(")")
                        # Store mapping: new_url -> duplicate_url (to find thumbnail source)
                        thumbnails_map[new_url] = url
                    duplicates.append(url)
                else:
                    duplicates.append(url)
            
            elif current_section == "blacklist":
                slug = extract_slug_from_url(url)
                if slug:
                    seasonals.append(slug)
    
    return duplicates, thumbnails_map, seasonals


def load_json_file(filepath: Path) -> Dict:
    """Load JSON file with error handling."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in {filepath}: {e}")
        return None


def save_json_file(filepath: Path, data: Dict, indent: int = 2) -> bool:
    """Save JSON file with error handling."""
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=indent, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"ERROR: Failed to save {filepath}: {e}")
        return False


# ============================================================================
# MAIN PROCESSING
# ============================================================================


def main():
    print("\n" + "=" * 80)
    print("SOURCE DATA ADJUSTMENTS PROCESSOR")
    print("=" * 80)
    
    # Verify input files exist
    if not ADJUSTMENTS_MD.exists():
        print(f"ERROR: Adjustments file not found: {ADJUSTMENTS_MD}")
        return False
    
    if not ATTRACTIONS_JSON.exists():
        print(f"ERROR: Attractions file not found: {ATTRACTIONS_JSON}")
        return False
    
    if not BLACKLIST_JSON.exists():
        print(f"ERROR: Blacklist file not found: {BLACKLIST_JSON}")
        return False
    
    print(f"\nReading adjustments from: {ADJUSTMENTS_MD.relative_to(VAULT_ROOT)}")
    
    # Parse adjustments file
    duplicates_urls, thumbnails_map, seasonals_slugs = parse_adjustments_file(ADJUSTMENTS_MD)
    
    print(f"  - Found {len(duplicates_urls)} duplicate URLs to remove")
    print(f"  - Found {len(thumbnails_map)} entries with thumbnails to preserve")
    print(f"  - Found {len(seasonals_slugs)} seasonal shows to blacklist")
    
    # Load JSON files
    print(f"\nLoading: {ATTRACTIONS_JSON.relative_to(VAULT_ROOT)}")
    attractions_data = load_json_file(ATTRACTIONS_JSON)
    if not attractions_data:
        return False
    
    print(f"Loading: {BLACKLIST_JSON.relative_to(VAULT_ROOT)}")
    blacklist_data = load_json_file(BLACKLIST_JSON)
    if not blacklist_data:
        return False
    
    initial_count = len(attractions_data.get("attractions", []))
    print(f"  - Initial attractions count: {initial_count}")
    
    # ========================================================================
    # PHASE 1: Transfer thumbnails from duplicates before removal
    # ========================================================================
    print("\n" + "-" * 80)
    print("PHASE 1: TRANSFERRING THUMBNAILS FROM DUPLICATES")
    print("-" * 80)
    
    attractions = attractions_data.get("attractions", [])
    thumbnail_transfer_count = 0
    
    # Build a map of URLs to attractions for quick lookup
    url_to_attraction = {}
    for attraction in attractions:
        url = attraction.get("official_url", "")
        if url:
            url_to_attraction[url] = attraction
    
    # For each new_url that needs a thumbnail, find the duplicate and transfer
    for new_url, old_duplicate_url in thumbnails_map.items():
        # Find the duplicate entry
        duplicate_attr = url_to_attraction.get(old_duplicate_url)
        # Find the entry with the new URL
        target_attr = url_to_attraction.get(new_url)
        
        if duplicate_attr and target_attr:
            old_thumbnail = duplicate_attr.get("image", "")
            if old_thumbnail:
                target_attr["image"] = old_thumbnail
                thumbnail_transfer_count += 1
                
                print(f"  ✓ Transferred thumbnail")
                print(f"    From: {duplicate_attr.get('slug')} ({old_duplicate_url[:50]}...)")
                print(f"    To:   {target_attr.get('slug')} ({new_url[:50]}...)")
                print(f"    Thumbnail: {old_thumbnail}")
        elif not duplicate_attr:
            print(f"  ⚠ Warning: Duplicate entry not found: {old_duplicate_url[:50]}...")
        elif not target_attr:
            print(f"  ⚠ Warning: Target entry not found: {new_url[:50]}...")
    
    print(f"\nTransferred: {thumbnail_transfer_count} thumbnails")
    
    # ========================================================================
    # PHASE 2: Remove duplicates
    # ========================================================================
    print("\n" + "-" * 80)
    print("PHASE 2: REMOVING DUPLICATES")
    print("-" * 80)
    
    removed_count = 0
    removed_entries = []
    
    # Build set of slugs to remove based on duplicate URLs
    slugs_to_remove = set()
    for dup_url in duplicates_urls:
        slug = extract_slug_from_url(dup_url)
        if slug:
            slugs_to_remove.add(slug)
    
    # Remove attractions with duplicate URLs
    filtered_attractions = []
    for attraction in attractions:
        slug = attraction.get("slug", "")
        official_url = attraction.get("official_url", "")
        
        should_remove = False
        
        # Check if slug matches a duplicate
        if slug in slugs_to_remove:
            should_remove = True
            reason = "URL in duplicates list"
        
        # Check if official_url matches a duplicate URL
        elif official_url in duplicates_urls:
            should_remove = True
            reason = "Exact URL match in duplicates"
        
        if should_remove:
            removed_count += 1
            removed_entries.append({
                "slug": slug,
                "name": attraction.get("name", "Unknown"),
                "url": official_url,
                "reason": reason
            })
            print(f"  ✗ {slug}")
            print(f"    Name: {attraction.get('name', 'Unknown')}")
            if official_url:
                print(f"    URL: {official_url[:60]}...")
        else:
            filtered_attractions.append(attraction)
    
    attractions_data["attractions"] = filtered_attractions
    print(f"\nRemoved: {removed_count} entries")
    
    # ========================================================================
    # PHASE 3: Add seasonal shows to blacklist
    # ========================================================================
    print("\n" + "-" * 80)
    print("PHASE 3: ADDING SEASONAL SHOWS TO BLACKLIST")
    print("-" * 80)
    
    blacklist = blacklist_data.get("blacklist", [])
    initial_blacklist_count = len(blacklist)
    new_blacklist_entries = []
    
    for slug in seasonals_slugs:
        if slug not in blacklist:
            blacklist.append(slug)
            new_blacklist_entries.append(slug)
            print(f"  + {slug}")
        else:
            print(f"  ~ {slug} (already in blacklist)")
    
    # Sort blacklist for consistency
    blacklist.sort()
    blacklist_data["blacklist"] = blacklist
    
    print(f"\nAdded to blacklist: {len(new_blacklist_entries)} new entries")
    print(f"Total blacklist entries: {len(blacklist)}")
    
    # ========================================================================
    # PHASE 4: Sort attractions by name
    # ========================================================================
    print("\n" + "-" * 80)
    print("PHASE 4: SORTING ATTRACTIONS BY NAME")
    print("-" * 80)
    
    attractions_data["attractions"].sort(key=lambda x: x.get("name", "").lower())
    print(f"  Sorted {len(attractions_data['attractions'])} attractions alphabetically")
    
    # ========================================================================
    # PHASE 5: Update metadata
    # ========================================================================
    print("\n" + "-" * 80)
    print("PHASE 5: UPDATING METADATA")
    print("-" * 80)
    
    timestamp = datetime.now().isoformat()
    new_note = f"Processed by process_source_data_adjustments.py on {timestamp}. Transferred {thumbnail_transfer_count} thumbnails, removed {removed_count} duplicates, added {len(new_blacklist_entries)} seasonal shows to blacklist."
    
    if "_metadata" not in attractions_data:
        attractions_data["_metadata"] = {}
    
    attractions_data["_metadata"]["note"] = new_note
    print(f"  Updated metadata note")
    print(f"  Note: {new_note[:100]}...")
    
    # ========================================================================
    # SAVE FILES
    # ========================================================================
    print("\n" + "-" * 80)
    print("SAVING FILES")
    print("-" * 80)
    
    if save_json_file(ATTRACTIONS_JSON, attractions_data):
        print(f"  ✓ Saved: {ATTRACTIONS_JSON.relative_to(VAULT_ROOT)}")
    else:
        return False
    
    if save_json_file(BLACKLIST_JSON, blacklist_data):
        print(f"  ✓ Saved: {BLACKLIST_JSON.relative_to(VAULT_ROOT)}")
    else:
        return False
    
    # ========================================================================
    # SUMMARY
    # ========================================================================
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    final_count = len(attractions_data.get("attractions", []))
    
    print(f"\n📊 ATTRACTIONS:")
    print(f"   Initial count:        {initial_count}")
    print(f"   Entries removed:      {removed_count}")
    print(f"   Thumbnails updated:   {thumbnail_transfer_count}")
    print(f"   Final count:          {final_count}")
    print(f"   Net change:           {final_count - initial_count:+d}")
    
    print(f"\n🚫 BLACKLIST:")
    print(f"   Initial count:        {initial_blacklist_count}")
    print(f"   New entries added:    {len(new_blacklist_entries)}")
    print(f"   Total entries:        {len(blacklist)}")
    
    print(f"\n✅ FILES SAVED:")
    print(f"   - {ATTRACTIONS_JSON.relative_to(VAULT_ROOT)}")
    print(f"   - {BLACKLIST_JSON.relative_to(VAULT_ROOT)}")
    
    print("\n" + "=" * 80)
    print("✓ PROCESSING COMPLETE")
    print("=" * 80 + "\n")
    
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
