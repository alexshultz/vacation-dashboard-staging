#!/usr/bin/env python3
"""
generate_dashboard.py - Generates dashboard HTML pages from data/attractions.json

Follows CLAUDE.md: JSON is canonical. Uses tokens/components design system (Phase 4).
Generates attractions.html from scratch, manages shared head/nav partials for all pages.

Usage: python3 scripts/generate_dashboard.py
"""

import json
import html
import re
from collections import defaultdict
from pathlib import Path
from datetime import datetime
import sys

VAULT = Path(__file__).parent.parent
JSON_PATH = VAULT / "data" / "attractions.json"
HTML_PATH = VAULT / "web" / "shows.html"

# Utility functions
def normalize_slug(slug):
    """Normalize slug for matching/comparison."""
    if not slug:
        return ""
    normalized = slug.lower().strip()
    normalized = re.sub(r'-s(?=-|$)', 's', normalized)
    normalized = normalized.replace('and8217', "'")
    normalized = re.sub(r"[''´`]", '-', normalized)
    return normalized


def is_blacklisted(slug, blacklist):
    """Check if a slug is in the blacklist."""
    if not slug or not blacklist:
        return False
    normalized_slug = normalize_slug(slug)
    for item in blacklist:
        if normalize_slug(item) == normalized_slug:
            return True
    return False


def library_sort_key(name):
    """Generate sort key for library-style alphabetization (ignoring articles)."""
    if not name:
        return ""
    name = name.strip().lower()
    for article in ["the ", "a ", "an "]:
        if name.startswith(article):
            name = name[len(article):].strip()
            break
    return name


def format_display_name(name):
    """Format display name by moving articles to the end."""
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


def render_head(title: str, description: str = "") -> str:
    """Shared <head> content for all pages."""
    desc_tag = f'<meta name="description" content="{html.escape(description)}">' if description else ""
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
{desc_tag}
<title>{html.escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/themes/trail.css">
<link rel="stylesheet" href="css/components.css">
<script>/* Theme loader -- inline to prevent flash-of-wrong-theme */
(function(){{
  var m = localStorage.getItem('vacdash:v1:mode') || 'system';
  document.documentElement.setAttribute('data-mode', m);
}})();
</script>"""


def render_nav(active_page: str) -> str:
    """Shared site header + mobile bottom tab bar."""
    pages = [
        ("home",        "index.html",          "🏠", "Home"),
        ("attractions", "attractions.html",     "🎡", "Attractions"),
        ("shows",       "shows.html",           "🎭", "Shows"),
        ("timeline",    "event-timeline.html",  "📅", "Timeline"),
        ("people",      "people-timeline.html", "👥", "People"),
    ]
    nav_links = ""
    for key, href, emoji, label in pages:
        cur = ' aria-current="page"' if key == active_page else ""
        nav_links += f'<a href="{href}" class="nav-link"{cur}>{label}</a>\n      '
    tabs = ""
    for key, href, emoji, label in pages:
        cur = ' aria-current="page"' if key == active_page else ""
        tabs += f'<a href="{href}" class="tab"{cur} aria-label="{label}">{emoji}</a>\n  '
    return f"""<header class="site-header">
  <div class="site-header__inner">
    <a class="site-logo" href="index.html">Branson '26</a>
    <nav class="site-nav" aria-label="Main">
      {nav_links.strip()}
    </nav>
    <button class="theme-toggle" aria-label="Toggle dark mode" onclick="(function(){{var modes=['system','light','dark'];var m=document.documentElement.getAttribute('data-mode')||'system';var next=modes[(modes.indexOf(m)+1)%3];document.documentElement.setAttribute('data-mode',next);localStorage.setItem('vacdash:v1:mode',next);}})()">☀️</button>
  </div>
</header>
<nav class="bottom-tabs" aria-label="Main navigation">
  {tabs.strip()}
</nav>"""


def generate_attractions_page():
    """Generate web/attractions.html from data/attractions.json."""
    # Load data
    with open(VAULT / "data" / "attractions.json", encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both formats: raw list or dict with "attractions" key
    attractions = data.get("attractions", data) if isinstance(data, dict) else data
    if not isinstance(attractions, list):
        attractions = []

    # Load blacklist
    blacklist_path = VAULT / "data" / "blacklist.json"
    blacklist = []
    if blacklist_path.exists():
        with open(blacklist_path, encoding="utf-8") as f:
            bl_data = json.load(f)
            # Handle both list and dict formats
            blacklist = bl_data if isinstance(bl_data, list) else bl_data.get("blacklist", [])
    else:
        print("WARNING: blacklist.json not found -- all attractions will be included", file=sys.stderr)

    # Filter blacklisted
    def is_bl(a):
        slug = a.get("slug", "") if isinstance(a, dict) else a
        return normalize_slug(slug) in {normalize_slug(s) for s in blacklist}

    items = [a for a in attractions if not is_bl(a)]
    items.sort(key=lambda a: library_sort_key(a.get("name","")))

    # Collect all tags for filter chips
    all_tags = set()
    for a in items:
        tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(tags, str):
            for t in tags.split(","):
                t = t.strip()
                if t: all_tags.add(t)
        elif isinstance(tags, list):
            for t in tags:
                if t: all_tags.add(t)
    sorted_tags = sorted(all_tags)

    def get_tags_str(a):
        tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(tags, str):
            return " ".join(t.strip() for t in tags.split(",") if t.strip())
        elif isinstance(tags, list):
            return " ".join(t for t in tags if t)
        return ""

    def thumb_html(a):
        slug = normalize_slug(a.get("slug",""))
        name = a.get("name","?")
        thumbs_dir = VAULT / "web" / "assets" / "thumbs"
        for ext in ("jpg","jpeg","png","webp"):
            p = thumbs_dir / f"{slug}-thumb.{ext}"
            if p.exists():
                return f'<img src="assets/thumbs/{slug}-thumb.{ext}" alt="{html.escape(name)}" loading="lazy" class="card--light__img">'
        # SVG fallback
        letter = name[0].lower() if name else "a"
        if not letter.isalpha(): letter = "a"
        svg_path = VAULT / "web" / "svg-fallbacks" / f"{letter}.svg"
        if svg_path.exists():
            return svg_path.read_text(encoding="utf-8")
        return f'<div class="card--light__img" style="background:#3F6B3A;display:grid;place-items:center;color:white;font-size:48px;font-weight:700;">{name[0].upper()}</div>'

    def duration_str(h):
        if not h: return ""
        try:
            h = float(h)
        except (TypeError, ValueError) as e:
            print(f"[generate_dashboard] WARN: duration_str failed for {h!r}: {e}", file=sys.stderr)
            return str(h)
        if h < 1: return f"{int(h*60)}min"
        if h == int(h): return f"{int(h)}h"
        return f"{h}h"

    def render_card(a):
        name = html.escape(a.get("name","Unknown"))
        slug = normalize_slug(a.get("slug",""))
        desc = a.get("description","")
        hook = html.escape(desc[:120] + "..." if len(desc)>120 else desc)
        price = a.get("price_adult") or a.get("price","")
        dur = a.get("duration_hours","")
        rating = a.get("rating","")
        tags_str = get_tags_str(a)

        chips = ""
        if price:
            try:
                chips += f'<span class="minichip price">from ${float(price):.0f}</span>'
            except (TypeError, ValueError) as e:
                print(f"[generate_dashboard] WARN: price format failed for {price!r}: {e}", file=sys.stderr)
                chips += f'<span class="minichip price">{html.escape(str(price))}</span>'
        if dur:
            chips += f'<span class="minichip">{html.escape(duration_str(dur))}</span>'
        if rating:
            chips += f'<span class="minichip rating">★ {html.escape(str(rating))}</span>'

        th = thumb_html(a)
        return f'''<article class="card--light" data-tags="{tags_str}" data-slug="{slug}">
  <button class="heart-overlay" aria-pressed="false" aria-label="Wishlist {name}">♡</button>
  <div class="card--light__thumb">{th}</div>
  <div class="card--light__body">
    <h3>{name}</h3>
    <p class="card--light__hook">{hook}</p>
    <div class="card--light__row">{chips}</div>
  </div>
</article>'''

    cards_html = "\n".join(render_card(a) for a in items)

    chip_btns = '<button class="chip" aria-pressed="true" data-tag="">All</button>\n'
    for t in sorted_tags:
        chip_btns += f'<button class="chip" aria-pressed="false" data-tag="{html.escape(t)}">{html.escape(t)}</button>\n'

    filter_js = r"""
<script>
(function(){
  var active = new Set();
  var chips = document.querySelectorAll('.filter-strip .chip');
  var cards = document.querySelectorAll('.catalog-grid .card--light');
  var counter = document.getElementById('live-count');
  var allBtn = document.querySelector('.chip[data-tag=""]');

  function refilter(){
    var shown = 0;
    cards.forEach(function(c){
      var tags = new Set((c.dataset.tags||'').split(' ').filter(Boolean));
      var visible = active.size === 0 || [...active].some(function(t){ return tags.has(t); });
      c.style.display = visible ? '' : 'none';
      if(visible) shown++;
    });
    if(counter) counter.textContent = 'Showing ' + shown + ' of ' + cards.length;
  }

  chips.forEach(function(btn){
    btn.addEventListener('click', function(){
      var tag = btn.dataset.tag;
      if(tag === ''){
        active.clear();
        chips.forEach(function(b){ b.setAttribute('aria-pressed', b === allBtn ? 'true' : 'false'); });
      } else {
        if(active.has(tag)){
          active.delete(tag);
          btn.setAttribute('aria-pressed','false');
        } else {
          active.add(tag);
          btn.setAttribute('aria-pressed','true');
        }
        allBtn.setAttribute('aria-pressed', active.size === 0 ? 'true' : 'false');
      }
      refilter();
    });
  });
  refilter();
})();
</script>"""

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Attractions -- Branson '26", "Browse all Branson 2026 attractions and shows")}
<style>
/* Page-specific overrides */
.card--light__thumb {{ aspect-ratio: 16/10; overflow: hidden; background: var(--color-bg); }}
.card--light__thumb img {{ width:100%; height:100%; object-fit:cover; display:block; }}
.card--light__thumb svg {{ width:100%; height:100%; display:block; }}
.card--light__body {{ padding: 12px 14px 14px; display:flex; flex-direction:column; gap:8px; flex:1; }}
.card--light__hook {{ font-size:13px; color:var(--color-ink-dim); line-height:1.4; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }}
.card--light__row {{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:auto; }}
</style>
</head>
<body>
{render_nav("attractions")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>Attractions &amp; Shows</h1>
    <p class="hero-sub">Browse {len(items)} things to do. Heart anything that looks fun.</p>
  </div>
  <div class="test-banner" role="status">
    🧪 <strong>Test data</strong> -- Interest counts and picks shown here are not real family data.
    This banner will be removed when the live backend connects in Phase 2.
  </div>
  <div class="filter-strip" role="group" aria-label="Filter by tag">
    {chip_btns.strip()}
  </div>
  <p class="live-count" id="live-count">Showing {len(items)} of {len(items)}</p>
  <div class="catalog-grid" id="catalog-grid">
{cards_html}
  </div>
</main>
{filter_js}
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
</body>
</html>"""

    out = VAULT / "web" / "attractions.html"
    out.write_text(page, encoding="utf-8")
    size_kb = out.stat().st_size // 1024
    print(f"  wrote {out} ({size_kb} KB, {len(items)} attractions)")


def generate_shows_page():
    """Generate web/shows.html using design system."""
    # For now, generate a minimal shows page with the new system
    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Shows -- Branson '26", "Browse all Branson 2026 shows")}
</head>
<body>
{render_nav("shows")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>Shows</h1>
    <p class="hero-sub">Coming soon: a curated list of live shows.</p>
  </div>
</main>
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
</body>
</html>"""
    out = VAULT / "web" / "shows.html"
    out.write_text(page, encoding="utf-8")
    print(f"  wrote {out}")


def main():
    """Generate all dashboard pages."""
    print("Generating attractions.html...")
    generate_attractions_page()
    print("Generating shows.html...")
    generate_shows_page()
    print("Done!")


if __name__ == "__main__":
    main()
