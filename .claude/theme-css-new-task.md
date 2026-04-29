<role>
You are a senior front-end engineer specializing in design-system CSS architecture. Your sole
goal for this session is to write 16 new CSS theme files (and 6 companion DESIGN.md files)
for the Branson '26 vacation dashboard, following the project's exact file patterns and token
conventions.
</role>

<static_background>
Project: Branson '26 Dashboard -- a static site.
Vault root: /Users/alex/vaults/Vacation/Branson 2026/
All paths below are relative to that vault root.

Canonical semantic tokens (post-Brief-1 rename -- use ONLY these names):
  --color-bg, --color-surface, --color-ink, --color-ink-dim, --color-line,
  --status-yes, --status-no, --status-wishlist, --status-neutral, --status-lock,
  --warn, --accent-1, --accent-2, --accent-3

NEVER use deprecated aliases: --accent-sand, --accent-clay, --accent-dusk (renamed in Brief 1).

Dark mode formula (apply consistently for every new theme):
  H = the primary hue angle of the theme (integer, 0-360)
  --color-bg:      hsl(H, 6%,  9%)
  --color-surface: hsl(H, 6%, 14%)
  --color-ink:     hsl(H, 8%, 92%)
  --color-ink-dim: hsl(H, 6%, 65%)
  --color-line:    hsl(H, 8%, 22%)

CSS file structure -- every file must follow superman.css exactly (5 sections, in order):
  1. @import line for Google Fonts -- omit entirely if using system fonts
  2. Comment block: theme name | vibe | light description | dark description | best-for note
  3. :root { } -- private palette vars (--private-*), font-stack overrides, light-mode
     semantic token overrides
  4. [data-mode="dark"] { } -- dark token overrides using the formula above
  5. @media (prefers-color-scheme: dark) { :root:not([data-mode="light"]) { } } -- mirrors
     section 4

IMPORTANT: The dark mode selector is [data-mode="dark"] { } -- no descendant combinator, no
nested :root. The attribute is set directly on the html element. Follow superman.css exactly.

Font special case: The airbnb theme MUST use system-ui, 'Inter', sans-serif -- Airbnb Cereal
is not available on Google Fonts; do not attempt to import it.
</static_background>

<frozen_files>
The following are permanently frozen. Do NOT modify, overwrite, run, or delete any of them:
  - generate_dashboard.py
  - generate_attractions.py
  - Any file with extension .html
  - Any file with extension .js
  - Any CSS file that already exists (including superman.css -- read it, never write it)
  - Any DESIGN.md file that already exists (read the orphaned specs for source of truth,
    never overwrite them)
</frozen_files>

<task>
Write all 16 theme files as specified below. Complete them in the order listed.

--- GROUP A -- 10 Orphaned Themes ---
For each theme: read its existing DESIGN.md spec as the source of truth for color values
and font choices. Write ONE new CSS file only. Do NOT create or modify the DESIGN.md.

| Theme name    | Existing spec path                       | Output CSS path                        |
|---------------|------------------------------------------|----------------------------------------|
| storm-watch   | web/themes/DESIGN-storm-watch.md        | web/css/themes/storm-watch.css         |
| dusk-gold     | web/themes/DESIGN-dusk-gold.md          | web/css/themes/dusk-gold.css           |
| mint-forest   | web/themes/DESIGN-mint-forest.md        | web/css/themes/mint-forest.css         |
| desert-sky    | web/themes/DESIGN-desert-sky.md         | web/css/themes/desert-sky.css          |
| cabin-fire    | web/themes/DESIGN-cabin-fire.md         | web/css/themes/cabin-fire.css          |
| wildflower    | web/themes/DESIGN-wildflower.md         | web/css/themes/wildflower.css          |
| autumn-ozarks | web/themes/DESIGN-autumn-ozarks.md      | web/css/themes/autumn-ozarks.css       |
| lake-day      | web/themes/DESIGN-lake-day.md           | web/css/themes/lake-day.css            |
| sunrise       | web/themes/DESIGN-sunrise.md            | web/css/themes/sunrise.css             |
| night-hike    | web/themes/DESIGN-night-hike.md         | web/css/themes/night-hike.css          |

Note: The orphaned DESIGN.md specs may still use old accent token names (accent-sand etc.)
in their tables. Use the COLOR VALUES from those specs but map them to --accent-1, --accent-2,
--accent-3 in the output CSS.

--- GROUP B -- 6 Catalog Themes ---
For each theme: derive colors and typography from your knowledge of the real-world design
system. Write BOTH a CSS file AND a new DESIGN.md file.

| Theme   | Character                               | Output CSS                        | Output DESIGN.md                |
|---------|-----------------------------------------|-----------------------------------|---------------------------------|
| airbnb  | warm coral, photography-forward, travel | web/css/themes/airbnb.css         | web/themes/DESIGN-airbnb.md     |
| notion  | warm minimalism, soft surfaces, readable| web/css/themes/notion.css         | web/themes/DESIGN-notion.md     |
| airtable| colorful, structured, friendly          | web/css/themes/airtable.css       | web/themes/DESIGN-airtable.md   |
| mintlify| clean, green-accented, docs/content     | web/css/themes/mintlify.css       | web/themes/DESIGN-mintlify.md   |
| clay    | organic, soft gradients, warm           | web/css/themes/clay.css           | web/themes/DESIGN-clay.md       |
| wise    | bright green accent, clear, friendly    | web/css/themes/wise.css           | web/themes/DESIGN-wise.md       |

Each Group B DESIGN.md must follow the same structure as an existing orphaned DESIGN.md (read
one as a template). Include: theme name, vibe summary, palette table (name / hex / role),
typography, light mode description, dark mode description, best-for note.
</task>

<order_of_operations>
Follow this exact sequence. Do not skip or reorder steps.

1. Read web/css/themes/superman.css in full. Internalize its exact 5-section structure,
   selector names, and comment style. This is your CSS template.
2. Read one existing DESIGN.md (e.g., web/themes/DESIGN-storm-watch.md) in full. This is
   your DESIGN.md template for Group B.
3. For Group A (themes 1-10): for each theme in order, read its DESIGN.md spec, then write
   its CSS file. Write to disk before moving to the next theme.
4. For Group B (themes 11-16): for each theme in order, write its DESIGN.md first, then its
   CSS file. Write both to disk before moving to the next theme.
5. After all 16 CSS files and 6 DESIGN.md files are written, self-audit: confirm every new
   CSS file uses only the canonical token names from <static_background>, and that no frozen
   file was touched.
</order_of_operations>

<examples>
Correct dark mode block for a theme with primary hue H=210 (blue):

  [data-mode="dark"] {
    --color-bg:      hsl(210, 6%,  9%);
    --color-surface: hsl(210, 6%, 14%);
    --color-ink:     hsl(210, 8%, 92%);
    --color-ink-dim: hsl(210, 6%, 65%);
    --color-line:    hsl(210, 8%, 22%);
    --accent-1: hsl(210, 70%, 65%);
    --accent-2: hsl(195, 60%, 70%);
    --accent-3: hsl(225, 50%, 60%);
  }

Correct font import + comment block:

  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

  /*
   * theme:  lake-day
   * Vibe:   Bright, breezy, Ozark lakeside morning
   * Light:  Clear sky blues over warm sand whites
   * Dark:   Deep navy with foam-white text
   * Best for: Families, outdoor itineraries
   */

Forbidden token names -- NEVER use these:
  --accent-sand  (wrong)
  --accent-clay  (wrong)
  --accent-dusk  (wrong)
</examples>

<reminder>
CRITICAL RULES -- enforce before writing every single file:
- Do not fabricate Google Fonts URLs. Only use font families that genuinely exist on
  fonts.google.com. If uncertain, use system-ui fallback and note the assumption.
- Do not reference, read, or modify any file not explicitly listed in this brief.
- Do not run generate_dashboard.py or generate_attractions.py. Do not run any Python script.
- Token names are fixed. If you find yourself typing --accent-sand, --accent-clay, or
  --accent-dusk, stop and correct to --accent-1, --accent-2, --accent-3.
- For Group A: the spec color values are the source of truth. If a value is ambiguous in the
  spec, note it as an assumption in the handback report rather than guessing silently.
</reminder>

When complete:
(1) List every file you created with a one-line description.
(2) Note any assumptions or judgment calls (font choices, color derivations, hue angles used
for dark mode formula, any spec ambiguities resolved).
(3) STOP. Do not commit, push, copy files, or update logs.
