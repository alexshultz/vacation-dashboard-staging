#!/usr/bin/env python3
"""
generate_dashboard.py - Generates shows.html from data/attractions.json

Follows CLAUDE.md: JSON is canonical. Produces self-contained HTML with the original
60s show card style. Updated 2026-04-21 to render tag pills and a client-side
tag filter (Phase 3b).

Filter UI:
  - Collapsible "Filter by tags" panel above the cards.
  - Tags grouped by category (show / music / audience / attraction) with counts.
  - OR semantics: a card shows if it has ANY of the selected tags. With no
    selection, all cards show.
  - Card tag pills are clickable and add that tag to the filter set.
  - "Clear all" button resets the filter.
  - Live "N of M shows" counter.

Council of Minds approved the rename from Attractions to Shows.
Claude Code reviewed 2026-04-19 (pre tag-filter) and 2026-04-21 (tag-filter added).

Usage: python3 scripts/generate_dashboard.py
"""

import json
import html
import re
from collections import defaultdict
from pathlib import Path
from datetime import datetime

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
JSON_PATH = VAULT / "data/attractions.json"
HTML_PATH = VAULT / "web/shows.html"
ICLOUD_HTML_PATH = Path("/Users/alex/Library/Mobile Documents/com~apple~CloudDocs/Branson-2026/web/shows.html")

# Tag vocabulary (mirrors scripts/classify_tags.py Round 8). Used only for
# grouping + ordering in the filter UI. Unknown tags fall into "other".
SHOW_CATEGORIES = ["music", "comedy", "magic", "variety", "drama", "tribute"]
MUSIC_SUBGENRES = ["country", "rock", "gospel", "bluegrass", "pop",
                   "oldies-50s", "oldies-60s", "oldies-70s", "oldies-80s", "classical"]
AUDIENCE_VIBE = ["family", "adult-humor", "date-night", "kid-focused", "religious"]
ATTRACTION_TAGS = ["indoor", "outdoor", "ride", "museum", "active", "relaxed",
                   "food", "shopping", "educational", "thrill", "animals",
                   "water", "history", "under-1hr", "1-2hr", "2-3hr", "half-day", "all-day"]

TAG_CATEGORY = {}
for t in SHOW_CATEGORIES:    TAG_CATEGORY[t] = "show"
for t in MUSIC_SUBGENRES:    TAG_CATEGORY[t] = "music"
for t in AUDIENCE_VIBE:      TAG_CATEGORY[t] = "audience"
for t in ATTRACTION_TAGS:    TAG_CATEGORY[t] = "attraction"

CATEGORY_LABELS = [
    ("show",       "Show type"),
    ("music",      "Music"),
    ("audience",   "Audience"),
    ("attraction", "Attraction"),
]


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
    if not name:
        return ""
    name = name.strip().lower()
    for article in ["the ", "a ", "an "]:
        if name.startswith(article):
            name = name[len(article):].strip()
            break
    return name


def format_display_name(name):
    if not name:
        return name
    original = name.strip()
    lower = original.lower()
    for article in ["The ", "A ", "An "]:
        if lower.startswith(article.lower()):
            article_real = original[:len(article)]
            main_title = original[len(article):].strip()
            return f"{main_title}, {article_real.strip()}"
    return original


def update_navigation_in_all_files(current_page="shows"):
    """Update navigation bar in ALL existing HTML files."""
    pages = ["index.html", "people-timeline.html", "event-timeline.html", "shows.html"]
    for page in pages:
        path = VAULT / "web" / page
        if not path.exists():
            continue
        content = path.read_text()
        shows_class = 'bg-emerald-600 text-white' if page == 'shows.html' else 'hover:bg-zinc-900'
        new_nav = f'''
        <div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">
            <a href="index.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Events</a>
            <a href="people-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">People</a>
            <a href="event-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Timeline</a>
            <a href="shows.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium {shows_class}">Shows</a>
        </div>
'''
        content = re.sub(
            r'<div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">.*?</div>',
            new_nav, content, flags=re.DOTALL,
        )
        path.write_text(content)


def tag_pill_html(tag, cat, count=None, clickable=True, classname="card-tag"):
    """Render one filter/card pill for a tag. cat is used for color coding."""
    tag_safe = html.escape(tag, quote=True)
    cat_safe = html.escape(cat, quote=True)
    count_html = f'<span class="ml-1 opacity-60 text-[10px]">{int(count)}</span>' if count is not None else ""
    return (f'<button type="button" class="{classname}" data-tag="{tag_safe}" data-cat="{cat_safe}">'
            f'{tag_safe}{count_html}</button>')


def build_filter_bar(tag_counts):
    """Emit the collapsible filter panel grouped by category."""
    sections = []
    for cat_key, cat_label in CATEGORY_LABELS:
        tags_in_cat = sorted(
            (t for t in tag_counts if TAG_CATEGORY.get(t) == cat_key),
            key=lambda t: (-tag_counts[t], t),
        )
        if not tags_in_cat:
            continue
        pills = "".join(
            tag_pill_html(t, cat_key, count=tag_counts[t], classname="filter-pill")
            for t in tags_in_cat
        )
        sections.append(
            f'<div class="filter-section"><div class="filter-section-label">{cat_label}</div>'
            f'<div class="flex flex-wrap gap-1.5">{pills}</div></div>'
        )

    # Orphan / unknown tags (shouldn't happen, but rendered defensively)
    orphan = sorted(t for t in tag_counts if t not in TAG_CATEGORY)
    if orphan:
        pills = "".join(
            tag_pill_html(t, "other", count=tag_counts[t], classname="filter-pill")
            for t in orphan
        )
        sections.append(
            f'<div class="filter-section"><div class="filter-section-label">Other</div>'
            f'<div class="flex flex-wrap gap-1.5">{pills}</div></div>'
        )

    body = "".join(sections)
    return f'''
        <details class="mb-6 bg-zinc-900 rounded-2xl border border-zinc-800 p-4" id="filter-panel" open>
            <summary class="cursor-pointer select-none">
                <span class="font-semibold text-base">
                    Filter by tags
                    <span class="text-xs text-zinc-400 ml-2" id="filter-status">showing all</span>
                </span>
            </summary>
            <div class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                    <p class="text-xs text-zinc-400 leading-relaxed">
                        Tap tags to filter (OR match: shows with any selected tag). Tap a tag on a card to add it here.
                    </p>
                    <button type="button" id="filter-clear"
                            class="text-xs px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hidden shrink-0 ml-3">
                        Clear all
                    </button>
                </div>
                {body}
            </div>
        </details>
    '''


def build_card(attr):
    name = attr.get("name", "")
    slug = attr.get("slug", "")
    display_name = format_display_name(name)
    image = attr.get("image", "assets/logos/grand-country-logo.png")
    desc = attr.get("description", "")
    notes = attr.get("notes", "")
    url = attr.get("official_url", "#")
    price = attr.get("price_adult")
    family = attr.get("family_pass")
    duration = attr.get("duration_hours", "")
    tags = attr.get("tags", []) or []

    # Escape all user-facing / scraped strings for safe HTML embedding.
    name_e         = html.escape(name, quote=True)
    slug_e         = html.escape(slug, quote=True)
    display_name_e = html.escape(display_name, quote=True)
    image_e        = html.escape(image, quote=True)
    desc_e         = html.escape(desc, quote=True)
    notes_e        = html.escape(notes, quote=True)
    url_e          = html.escape(url, quote=True)

    price_grid = ""
    if price is not None or family is not None or duration:
        price_grid = '<div class="mt-4 grid grid-cols-2 gap-4 text-xs bg-zinc-800 p-3 rounded-2xl">'
        if price is not None:
            price_grid += f'<div><span class="text-emerald-400">Adult:</span> ${html.escape(str(price))}</div>'
        if family is not None:
            price_grid += f'<div><span class="text-emerald-400">Family Pass:</span> ${html.escape(str(family))}</div>'
        if duration:
            price_grid += f'<div><span class="text-emerald-400">Duration:</span> {html.escape(str(duration))}h</div>'
        price_grid += "</div>"

    tags_html = ""
    if tags:
        # Only keep tags that look safe as slug-style tokens to avoid breaking
        # the space-separated data-tags attribute.
        safe_tags = [t for t in tags if re.fullmatch(r"[A-Za-z0-9_-]+", t)]
        pills = "".join(
            tag_pill_html(t, TAG_CATEGORY.get(t, "other"), clickable=True, classname="card-tag")
            for t in safe_tags
        )
        tags_html = f'<div class="mt-3 flex flex-wrap gap-1.5">{pills}</div>'
    else:
        safe_tags = []

    # data-tags attribute for JS filtering (already validated as slug-safe)
    tag_attr = html.escape(" ".join(safe_tags), quote=True)

    return f'''
    <div class="card bg-zinc-900 rounded-3xl p-6 border border-emerald-700"
         data-slug="{slug_e}" data-tags="{tag_attr}">
        <img src="{image_e}" alt="{name_e}" class="rounded-2xl mb-4 w-full max-h-48 object-contain bg-zinc-800 p-2">
        <h3 class="font-semibold text-lg">{display_name_e}</h3>
        <p class="text-emerald-400 text-sm">{desc_e}</p>
        {tags_html}
        {price_grid}
        <p class="text-xs text-amber-300 mt-3">{notes_e}</p>
        <a href="{url_e}" target="_blank" rel="noopener noreferrer"
           class="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white text-sm font-medium">
           Official Site -&gt;
        </a>
    </div>'''


def main():
    data = json.loads(JSON_PATH.read_text())
    blacklist_path = VAULT / "data/blacklist.json"
    blacklist = json.loads(blacklist_path.read_text()).get("blacklist", []) if blacklist_path.exists() else []

    attractions = [a for a in data.get("attractions", []) if not is_blacklisted(a.get("slug"), blacklist)]
    attractions.sort(key=lambda x: library_sort_key(x.get("name", "")))

    # Tag usage counts across visible (non-blacklisted) attractions
    tag_counts = defaultdict(int)
    for a in attractions:
        for t in a.get("tags", []) or []:
            tag_counts[t] += 1

    filter_bar = build_filter_bar(dict(tag_counts)) if tag_counts else ""
    cards = "".join(build_card(a) for a in attractions)

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Branson 2026 - Shows</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
        body {{ font-family: 'Inter', system-ui, sans-serif; }}
        h1, h2, h3 {{ font-family: 'Playfair Display', sans-serif; }}
        .card {{ transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }}
        .card:hover {{ transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }}
        .card.is-hidden {{ display: none; }}

        /* Tag pill base (used for both filter and card pills). */
        .filter-pill, .card-tag {{
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 9999px;
            border: 1px solid rgba(161, 161, 170, 0.25);
            background: rgba(63, 63, 70, 0.5);
            color: #e4e4e7;
            transition: all 0.15s ease;
            cursor: pointer;
            line-height: 1.2;
        }}
        .filter-pill:hover, .card-tag:hover {{
            background: rgba(82, 82, 91, 0.8);
            border-color: rgba(161, 161, 170, 0.5);
        }}

        /* Category color coding: moss green / lake blue / sand / clay accents. */
        [data-cat="show"]       {{ background: rgba(6, 78, 59, 0.4);   border-color: rgba(16, 185, 129, 0.4); }}
        [data-cat="music"]      {{ background: rgba(30, 58, 138, 0.35); border-color: rgba(96, 165, 250, 0.4); }}
        [data-cat="audience"]   {{ background: rgba(120, 53, 15, 0.35); border-color: rgba(251, 191, 36, 0.4); }}
        [data-cat="attraction"] {{ background: rgba(124, 45, 18, 0.3);  border-color: rgba(253, 186, 116, 0.35); }}

        /* Selected state (filter bar only). */
        .filter-pill[data-active="true"] {{
            background: #10b981;
            border-color: #10b981;
            color: #052e1f;
            font-weight: 600;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }}

        .filter-section-label {{
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #a1a1aa;
            margin-bottom: 6px;
        }}
    </style>
</head>
<body class="bg-zinc-950 text-white">
    <div class="max-w-7xl mx-auto p-6">
        <!-- Navigation - Updated for "Shows" -->
        <div class="flex gap-2 mb-8 border-b border-zinc-800 pb-6">
            <a href="index.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Events</a>
            <a href="people-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">People</a>
            <a href="event-timeline.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-zinc-900 transition-colors">Timeline</a>
            <a href="shows.html" class="px-6 py-2.5 rounded-2xl text-sm font-medium bg-emerald-600 text-white">Shows</a>
        </div>

        <h1 class="text-5xl font-bold mb-2">Branson 2026</h1>
        <p class="text-emerald-400 text-xl mb-8">Shows - May 22 to 28, 2026</p>

        {filter_bar}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="cards-grid">
            {cards}
        </div>

        <div class="mt-16 text-center text-xs text-zinc-500">
            Generated on {datetime.now().strftime("%B %d, %Y")} -
            <span class="text-emerald-500" id="total-count">{len(attractions)} shows</span>
        </div>
    </div>

    <script>
    (function() {{
        const selected = new Set();
        const filterPills = document.querySelectorAll('.filter-pill');
        const cardTags = document.querySelectorAll('.card-tag');
        const cards = document.querySelectorAll('#cards-grid .card');
        const statusEl = document.getElementById('filter-status');
        const clearBtn = document.getElementById('filter-clear');
        const totalCount = {len(attractions)};

        function render() {{
            let visible = 0;
            cards.forEach(card => {{
                const cardTagStr = card.getAttribute('data-tags') || '';
                const cardTags = cardTagStr.split(' ').filter(Boolean);
                let show = true;
                if (selected.size > 0) {{
                    show = cardTags.some(t => selected.has(t));
                }}
                card.classList.toggle('is-hidden', !show);
                if (show) visible++;
            }});

            filterPills.forEach(p => {{
                const active = selected.has(p.getAttribute('data-tag'));
                if (active) p.setAttribute('data-active', 'true');
                else p.removeAttribute('data-active');
            }});

            if (selected.size === 0) {{
                statusEl.textContent = 'showing all';
                clearBtn.classList.add('hidden');
            }} else {{
                const tags = Array.from(selected).join(', ');
                statusEl.textContent = visible + ' of ' + totalCount + ' match: ' + tags;
                clearBtn.classList.remove('hidden');
            }}
        }}

        function toggleTag(tag) {{
            if (selected.has(tag)) selected.delete(tag);
            else selected.add(tag);
            render();
        }}

        filterPills.forEach(p => {{
            p.addEventListener('click', () => toggleTag(p.getAttribute('data-tag')));
        }});

        cardTags.forEach(p => {{
            p.addEventListener('click', (e) => {{
                e.preventDefault();
                e.stopPropagation();
                const tag = p.getAttribute('data-tag');
                selected.add(tag);
                render();
                const panel = document.getElementById('filter-panel');
                try {{
                    if (panel && 'open' in panel && !panel.open) panel.open = true;
                }} catch (err) {{
                    if (panel) panel.setAttribute('open', '');
                }}
                try {{
                    window.scrollTo({{top: 0, behavior: 'smooth'}});
                }} catch (err) {{
                    window.scrollTo(0, 0);
                }}
            }});
        }});

        clearBtn.addEventListener('click', (e) => {{
            e.preventDefault();
            e.stopPropagation();
            selected.clear();
            render();
        }});

        render();
    }})();
    </script>
</body>
</html>'''

    HTML_PATH.write_text(html)
    if ICLOUD_HTML_PATH.parent.exists():
        ICLOUD_HTML_PATH.write_text(html)

    update_navigation_in_all_files("shows")

    print(f"Generated {HTML_PATH}")
    print(f"Also updated iCloud copy and navigation in all HTML files.")
    print(f"  {len(attractions)} shows, {len(tag_counts)} unique tags rendered.")
    print("Done. Run this script after any JSON changes to keep HTML in sync.")


if __name__ == "__main__":
    main()
