#!/usr/bin/env python3
"""
generate_attractions.py - FROZEN. Do not run.

This script overwrites web/attractions.html from scratch. attractions.html contains
hand-edited fetch(data.json) render loop code, Quick Pick integration, and visible
filtering that this generator does NOT reproduce. Running it destroys that code.

Same freeze applies as generate_dashboard.py. See CLAUDE.md and docs/DECISIONS.md.

To update attraction data: edit data/attractions.json, then run export_data.py.
"""
import sys
sys.exit(1)  # FROZEN -- see docstring above

"""
ORIGINAL DOCSTRING (preserved for reference):
generate_attractions.py - Generates attractions.html from data/attractions.json

Follows CLAUDE.md: JSON is canonical. Produces self-contained HTML with the same
60s show card style. Filters only category:"attraction" entries and applies
library_sort_key() for proper alphabetical sorting (ignoring leading articles).

Navigation updated to include Attractions tab as active. Updates both vault copy
and iCloud copy of attractions.html.

Usage: python3 scripts/generate_attractions.py
"""

import json
import re
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
HTML_PATH = VAULT / "web/attractions.html"
ICLOUD_HTML_PATH = Path("/Users/alex/Library/Mobile Documents/com~apple~CloudDocs/Branson-2026/web/attractions.html")

def normalize_slug(slug):
    if not slug:
        return ""
    normalized = slug.lower().strip()
    normalized = re.sub(r'-s(?=-|$)', 's', normalized)
    normalized = normalized.replace('and8217', "'")
    normalized = re.sub(r"[''´`]", '-', normalized)
    return normalized

def is_blacklisted(slug, blacklist):
    if not slug or not blacklist:
        return False
    normalized_slug = normalize_slug(slug)
    for item in blacklist:
        if normalize_slug(item) == normalized_slug:
            return True
    return False

def library_sort_key(name):
    """Sort key that ignores leading articles: 'The', 'A', 'An'"""
    if not name:
        return ""
    name = name.strip().lower()
    for article in ["the ", "a ", "an "]:
        if name.startswith(article):
            name = name[len(article):].strip()
            break
    return name

def format_display_name(name):
    """Format display name by moving leading articles to end for library style"""
    if not name:
        return name
    original = name.strip()
    lower = original.lower()
    for article in ["The ", "A ", "An "]:
        if lower.startswith(article.lower()):
            article = original[:len(article)]
            main_title = original[len(article):].strip()
            return f"{main_title}, {article.strip()}"
    return original

def update_navigation_in_all_files(current_page="attractions"):
    """Update navigation bar in ALL HTML files to include Attractions tab."""
    pages = ["index.html", "people-timeline.html", "event-timeline.html", "shows.html", "attractions.html"]
    
    for page in pages:
        path = VAULT / "web" / page
        if path.exists():
            content = path.read_text()
            # Build navigation with Attractions tab
            nav_html = f'''<div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">
            <a href="index.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors {'bg-emerald-600 text-white' if page == 'index.html' else ''}">Events</a>
            <a href="people-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors {'bg-emerald-600 text-white' if page == 'people-timeline.html' else ''}">People</a>
            <a href="event-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors {'bg-emerald-600 text-white' if page == 'event-timeline.html' else ''}">Timeline</a>
            <a href="shows.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors {'bg-emerald-600 text-white' if page == 'shows.html' else ''}">Shows</a>
            <a href="attractions.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium {'bg-emerald-600 text-white' if page == 'attractions.html' else 'hover:bg-zinc-900 transition-colors'}">Attractions</a>
        </div>'''
            
            # Replace old navigation with new one
            content = re.sub(
                r'<div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">.*?</div>',
                nav_html,
                content,
                flags=re.DOTALL
            )
            path.write_text(content)
            print(f"Updated navigation in {page}")

def main():
    # Load JSON data
    data = json.loads(JSON_PATH.read_text())
    blacklist_path = VAULT / "data/blacklist.json"
    blacklist = json.loads(blacklist_path.read_text()).get("blacklist", []) if blacklist_path.exists() else []
    
    # Filter for attractions only, exclude blacklisted
    attractions = [
        a for a in data.get("attractions", [])
        if a.get("category") == "attraction" and not is_blacklisted(a.get("slug"), blacklist)
    ]
    
    # Sort by library sort key (ignoring leading articles)
    attractions.sort(key=lambda x: library_sort_key(x.get("name", "")))

    # Generate cards
    cards = ""
    for attr in attractions:
        name = attr.get("name", "")
        display_name = format_display_name(name)
        image = attr.get("image", "assets/logos/grand-country-logo.png")
        desc = attr.get("description", "")
        notes = attr.get("notes", "")
        url = attr.get("official_url", "#")
        price = attr.get("price_adult")
        family = attr.get("family_pass")
        duration = attr.get("duration_hours", "")

        # Build price/duration grid
        price_grid = ''
        if price is not None or family is not None or duration:
            price_grid = '<div class="mt-4 grid grid-cols-2 gap-4 text-xs bg-zinc-800 p-3 rounded-2xl">'
            if price is not None:
                price_grid += f'<div><span class="text-emerald-400">Adult:</span> ${price}</div>'
            if family is not None:
                price_grid += f'<div><span class="text-emerald-400">Family Pass:</span> ${family}</div>'
            if duration:
                price_grid += f'<div><span class="text-emerald-400">Duration:</span> {duration}h</div>'
            price_grid += '</div>'

        cards += f'''
    <div class="card bg-zinc-900 rounded-3xl p-6 border border-emerald-700">
        <img src="{image}" alt="{name}" class="rounded-2xl mb-4 w-full max-h-48 object-contain bg-zinc-800 p-2">
        <h3 class="font-semibold text-lg">{display_name}</h3>
        <p class="text-emerald-400 text-sm">{desc}</p>
        {price_grid}
        <p class="text-xs text-amber-300 mt-3">{notes}</p>
        <a href="{url}" target="_blank" class="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white text-sm font-medium">Official Site →</a>
    </div>'''

    # Generate HTML document
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Branson 2026 - Attractions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
        body {{ font-family: 'Inter', system-ui, sans-serif; }}
        h1, h2, h3 {{ font-family: 'Playfair Display', sans-serif; }}
        .card {{ transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }}
        .card:hover {{ transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }}
    </style>
</head>
<body class="bg-zinc-950 text-white">
    <div class="max-w-7xl mx-auto p-6">
        <!-- Navigation with Attractions tab active -->
        <div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">
            <a href="index.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Events</a>
            <a href="people-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">People</a>
            <a href="event-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Timeline</a>
            <a href="shows.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Shows</a>
            <a href="attractions.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium bg-emerald-600 text-white">Attractions</a>
        </div>

        <h1 class="text-5xl font-bold mb-2">Branson 2026</h1>
        <p class="text-emerald-400 text-xl mb-10">Attractions • May 22–28, 2026</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards}
        </div>

        <div class="mt-16 text-center text-xs text-zinc-500">
            Generated on {datetime.now().strftime("%B %d, %Y")} • 
            <span class="text-emerald-500">{len(attractions)} attractions</span>
        </div>
    </div>
</body>
</html>'''

    # Write to both locations
    HTML_PATH.write_text(html)
    if ICLOUD_HTML_PATH.parent.exists():
        ICLOUD_HTML_PATH.write_text(html)
        print(f"Generated {ICLOUD_HTML_PATH}")
    
    # Update navigation in all HTML files
    update_navigation_in_all_files("attractions")
    
    print(f"Generated {HTML_PATH}")
    print(f"Updated {len(attractions)} attractions")
    print("Done. Run this script after any JSON changes to keep HTML in sync.")

if __name__ == "__main__":
    main()
