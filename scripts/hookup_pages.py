#!/usr/bin/env python3
"""
hookup_pages.py - Injects shared <head> and nav into static HTML pages.

Takes index.html, event-timeline.html, people-timeline.html and updates them
with the design system.
"""

import re
from pathlib import Path

VAULT = Path(__file__).parent.parent

def render_head(title: str, description: str = "") -> str:
    """Shared <head> content for all pages."""
    import html
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


def hookup_page(page_path: Path, page_key: str, title: str):
    """Update a single HTML page with shared head and nav."""
    content = page_path.read_text(encoding="utf-8")
    
    # Replace <head> content (keep <!doctype> and <html> tags)
    head_pattern = r'(<head[^>]*>)(.*?)(</head>)'
    new_head = f'<head>\n{render_head(title)}\n'
    content = re.sub(head_pattern, new_head + r'\3', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Inject nav after <body> tag
    body_pattern = r'(<body[^>]*>)'
    nav = render_nav(page_key)
    content = re.sub(body_pattern, r'\1\n' + nav, content, flags=re.IGNORECASE)
    
    # Add storage event listener before </body>
    storage_script = '<script>window.addEventListener(\'storage\',function(e){if(e.key===\'vacdash:v1:mode\')document.documentElement.setAttribute(\'data-mode\',e.newValue||\'system\')});</script>'
    content = re.sub(r'</body>', storage_script + '\n</body>', content, flags=re.IGNORECASE)
    
    # Add data-mode attribute to <html> tag
    html_pattern = r'<html([^>]*)>'
    if not re.search(r'data-mode', content):
        content = re.sub(html_pattern, r'<html data-mode="system"\1>', content, flags=re.IGNORECASE)
    
    page_path.write_text(content, encoding="utf-8")
    print(f"  hooked up {page_path.name}")


def main():
    """Hookup all static pages."""
    pages_to_hookup = [
        ("index.html", "home", "Home -- Branson '26"),
        ("event-timeline.html", "timeline", "Timeline -- Branson '26"),
        ("people-timeline.html", "people", "People -- Branson '26"),
    ]
    
    for filename, page_key, title in pages_to_hookup:
        path = VAULT / "web" / filename
        if not path.exists():
            print(f"  skipping {filename} (not found)")
            continue
        hookup_page(path, page_key, title)
    
    print("Done!")


if __name__ == "__main__":
    main()
