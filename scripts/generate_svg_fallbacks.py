#!/usr/bin/env python3
"""Generate 26 letter SVG thumbnail fallbacks for Trail theme."""
from pathlib import Path

VAULT = Path(__file__).parent.parent
OUT = VAULT / "web" / "svg-fallbacks"
OUT.mkdir(parents=True, exist_ok=True)

# Trail palette cycled across 26 letters
PALETTE = [
    ("#3F6B3A", "#1E3B1C"),  # moss
    ("#2A6A8A", "#14405A"),  # lake
    ("#D8A660", "#A87838"),  # sand
    ("#C1553B", "#8B3020"),  # clay
    ("#6B4C8F", "#3E2260"),  # dusk
]

for i, letter in enumerate("abcdefghijklmnopqrstuvwxyz"):
    c1, c2 = PALETTE[i % 5]
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="{c2}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="320" height="200" fill="url(#g)"/>
  <text x="160" y="130" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="700" font-size="96"
        fill="white" fill-opacity="0.9">{letter.upper()}</text>
</svg>'''
    path = OUT / f"{letter}.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"  wrote {path.name}")

print(f"Done: 26 SVGs in {OUT}")
