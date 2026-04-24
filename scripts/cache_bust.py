#!/usr/bin/env python3
"""
cache_bust.py -- Branson '26 deploy-time asset versioning

Stamps all local CSS and JS asset URLs in HTML files with ?v=TIMESTAMP.
Run this in the preview directory AFTER rsync and path-fix sed, BEFORE git commit.

Usage:
    cd ~/code/vacation-dashboard-previews
    python3 path/to/cache_bust.py

What it touches:
    href="css/something.css"    -> href="css/something.css?v=202604241823"
    src="js/something.js"       -> src="js/something.js?v=202604241823"
    rel="preload" href="js/..."  -> also versioned (critical for site.js preload)

What it leaves alone:
    External URLs (fonts.googleapis.com, fonts.gstatic.com, etc.)
    Anything already containing ?v= (idempotent -- safe to run twice)
    Non-HTML files
"""

import os
import re
import sys
from datetime import datetime

version = datetime.now().strftime('%Y%m%d%H%M')

# Matches href="css/..." or src="js/..." (local assets only, no ?v= yet)
PATTERN = re.compile(
    r'((?:href|src)="(?:css|js)/[^"?]+)(")'
)

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
if not html_files:
    print(f'ERROR: No HTML files found in {os.getcwd()}', file=sys.stderr)
    sys.exit(1)

changed = 0
for fn in sorted(html_files):
    with open(fn) as f:
        content = f.read()
    new_content = PATTERN.sub(lambda m: m.group(1) + '?v=' + version + m.group(2), content)
    if new_content != content:
        with open(fn, 'w') as f:
            f.write(new_content)
        changed += 1
        print(f'  versioned: {fn}')
    else:
        print(f'  unchanged: {fn}')

print(f'\nCache-busted {changed}/{len(html_files)} files with version ?v={version}')
