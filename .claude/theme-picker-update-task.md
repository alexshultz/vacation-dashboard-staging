<role>
You are a precise front-end integration engineer. Your sole goal is to append exactly 16 new
entries to the THEMES JavaScript array in one specific HTML file, with color values sourced
exclusively by reading the corresponding CSS theme files on disk. You must not guess, invent,
or approximate any color value.
</role>

<project_background>
Project: Branson '26 Dashboard -- a static site.
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
CSS theme files live in: web/css/themes/  (produced in Brief 3)
File to modify: web/profile.html

The THEMES array is declared inside an IIFE inside a script block, starting around line 225:
  var THEMES = [
It currently contains exactly 14 entries, from 'trail' through 'patriotic'.
Each entry has this exact shape:
  { id: 'trail', label: 'Trail', bg: '#FBF6EC', accent: '#3F6B3A', emoji: '🌲' },

generate_dashboard.py and generate_attractions.py are permanently frozen -- never run or
modify them.
</project_background>

<constraints>
ONLY touch the THEMES array literal inside web/profile.html.
  - Do NOT modify any other part of profile.html (markup, styles, other JS, comments).
  - Do NOT modify or run generate_dashboard.py or generate_attractions.py.
  - Do NOT touch any CSS file.
  - Do NOT commit, push, or copy any file.
  - Do NOT write values from memory -- read every color value from the actual CSS file on disk.
  - Do not modify any HTML element not explicitly named in this task. If you encounter an
    element that looks unused or redundant, flag it in the handback report. Do not remove it.
</constraints>

<task>
Append 16 new theme-entry objects to the THEMES array, in the order listed below, immediately
after the existing 14th entry. The final array must contain exactly 30 entries.

Ordered list of IDs to add:

  Group A (10 entries, in this order):
    storm-watch, dusk-gold, mint-forest, desert-sky, cabin-fire,
    wildflower, autumn-ozarks, lake-day, sunrise, night-hike

  Group B (6 entries, in this order):
    airbnb, notion, airtable, mintlify, clay, wise

For EACH id:
  - id     -> exactly the CSS filename without extension (e.g., 'storm-watch' for storm-watch.css)
  - bg     -> the --color-bg value defined in the light-mode :root block of that theme's CSS file
  - accent -> the --accent-1 value defined in the light-mode :root block of that theme's CSS file
  - label  -> a short, human-readable display name (your judgment; match the theme vibe)
  - emoji  -> a single emoji that matches the theme vibe
</task>

<order_of_operations>
1. Open web/profile.html. Find the THEMES array (approx line 225). Count the existing entries.
   Confirm there are exactly 14 before proceeding. If the count is wrong, STOP and report.
2. For each of the 16 IDs (in the exact order given above):
   a. Open web/css/themes/<id>.css from disk. (Note: CSS files are in web/css/themes/, NOT
      web/themes/. Do not confuse these directories.)
   b. Find the light-mode block (the :root { } block -- this is where light-mode tokens are
      defined, before any [data-mode="dark"] override).
   c. Extract the exact value of --color-bg and --accent-1 as written in that file. Copy
      verbatim; do not normalize or convert formats.
   d. Choose a label and emoji appropriate to the theme name.
3. Append all 16 new objects after the existing 14th entry, maintaining the existing
   comma/formatting style of the array.
4. Count total entries in the modified THEMES array. It must equal exactly 30. If it does not,
   fix the discrepancy before finishing.
5. Do not alter any character of profile.html outside the THEMES array literal.
</order_of_operations>

<example>
Existing entry (do not touch):
  { id: 'trail', label: 'Trail', bg: '#FBF6EC', accent: '#3F6B3A', emoji: '🌲' },

New entry format (append after existing 14):
  { id: 'storm-watch', label: 'Storm Watch', bg: '<exact --color-bg from storm-watch.css>', accent: '<exact --accent-1 from storm-watch.css>', emoji: '⛈️' },
</example>

<reminder>
CRITICAL: Every bg and accent value must be copied character-for-character from the
corresponding CSS file you read in step 2. CSS files are in web/css/themes/ -- not
web/themes/. If a CSS file is missing, malformed, or does not define --color-bg or --accent-1,
do NOT invent a value -- stop and report the specific file and missing variable so the issue
can be resolved. Never substitute a remembered, assumed, or visually-estimated color.
</reminder>

When complete:
(1) List every file you modified with a one-line description.
(2) Note any assumptions or judgment calls (labels, emojis, or any ambiguous selectors).
(3) State the final entry count in the THEMES array (must be 30).
(4) STOP. Do not commit, push, copy files, or update logs.
