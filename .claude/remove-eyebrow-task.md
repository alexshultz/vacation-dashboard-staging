# Codemaster Task: Remove duplicate "Branson '26" eyebrow from page-hero sections
# Branson '26 Dashboard
# Date: 2026-04-23

## Problem

Three pages each show "Branson '26" twice:
1. Once in the site-header (correct -- keep it)
2. Once as `<p class="eyebrow">Branson '26</p>` at the top of the `.page-hero` section (redundant -- remove it)

The eyebrow adds zero value and wastes vertical space since the header already identifies the app.

## Fix

In each of these three files, remove the single eyebrow line. Do not change anything else.

### File 1: web/attractions.html

Find and remove this exact line:
```html
    <p class="eyebrow">Branson '26</p>
```
It appears inside `<div class="page-hero">` just before `<h1>Activities</h1>`.

### File 2: web/wishlist.html

Find and remove this exact line:
```html
    <p class="eyebrow">Branson '26</p>
```
It appears inside `<div class="page-hero">` just before `<h1>My Wishlist</h1>`.

### File 3: web/suggested.html

Find and remove this exact line:
```html
    <p class="eyebrow">Branson '26</p>
```
It appears inside `<div class="page-hero">` just before `<h1>Suggested for You</h1>`.

## CRITICAL WARNING

- Do NOT run `scripts/generate_dashboard.py` -- it will overwrite all hand-edited Quick Pick code in attractions.html and wishlist.html and suggested.html
- Only remove the eyebrow line. Touch nothing else.

## Quality Gates

1. `grep -c 'class="eyebrow"' web/attractions.html` -- must return 0
2. `grep -c 'class="eyebrow"' web/wishlist.html` -- must return 0
3. `grep -c 'class="eyebrow"' web/suggested.html` -- must return 0
4. `grep -c 'page-hero' web/attractions.html` -- must return >= 1 (page-hero div still present)

## Completion Report

When done:
1. List the three files modified, one line each.
2. Confirm quality gate results.
3. STOP. Do not commit, push, or run the generator.
