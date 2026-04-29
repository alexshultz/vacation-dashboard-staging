<role>
You are a precise documentation engineer working on the Branson '26 Dashboard -- a static site
vacation-planning app. Your goal is to (A) create one new Google-format DESIGN.md for the
"trail" theme, and (B) propagate a set of token renames into 23 existing DESIGN.md files.
This is a documentation-only pass: you will never touch CSS, HTML, JS, or JSON files.
</role>

<background>
Project root: /Users/alex/vaults/Vacation/Branson 2026/
All DESIGN.md files live in:  web/themes/
CSS token files live in:      web/css/tokens.css  and  web/css/themes/<theme>.css
DESIGN.md format: Google open-source spec (Apache 2.0, April 2026) -- YAML frontmatter +
  markdown body.
Canonical reference for format and section order: web/themes/DESIGN-superman.md
All existing DESIGN.md files use:
  - version: alpha
  - YAML sections: colors:, typography: (geometry may or may not be present -- mirror the
    reference)
Brief context: Brief 1 already renamed three CSS custom properties in the stylesheet layer:
  --accent-sand  ->  --accent-1
  --accent-clay  ->  --accent-2
  --accent-dusk  ->  --accent-3
This brief propagates those renames into the documentation layer only.
</background>

<constraints>
NEVER modify or create any file with these extensions: .css  .html  .js  .json
Only touch .md files inside web/themes/.
Do not commit, push, or run any git commands.
Do not invent token values -- read them exclusively from the CSS source files listed below.
If a token exists in CSS but has no obvious semantic name in a DESIGN.md section, document
it under an "Other Tokens" subsection rather than omitting it or guessing.
</constraints>

<task_a>
CREATE: web/themes/DESIGN-trail.md  (this file does not exist yet)

Step-by-step order of analysis:
1. Read web/css/tokens.css -- extract every custom property that applies globally (the base
   token palette).
2. Read web/css/themes/trail.css -- extract every token override, including any
   @media (prefers-color-scheme: dark) block.
3. Read web/themes/DESIGN-superman.md in full -- treat it as the exact structural template
   (YAML frontmatter keys, markdown heading hierarchy, section names, table format,
   everything).
4. Compose web/themes/DESIGN-trail.md:
   - YAML frontmatter: set version: alpha and any other frontmatter keys present in
     DESIGN-superman.md.
   - Colors section: document BOTH light-mode values AND dark-mode overrides. If trail.css
     has no dark block, note "No dark-mode overrides defined in trail.css" rather than
     inventing values.
   - Typography section: document all font-family, font-size, font-weight, line-height
     tokens found in the two source files.
   - Geometry section: document all spacing, border-radius, and shadow tokens. If none
     exist for this theme specifically, include the section header with a note:
     "No theme-specific geometry tokens -- see tokens.css for global defaults."
   - Use the renamed token names: --accent-1, --accent-2, --accent-3 (not --accent-sand/
     clay/dusk).
5. Write the file. Do not round-trip through any intermediate format.
</task_a>

<task_b>
UPDATE: the 23 existing DESIGN.md files listed below.

Rename these token strings everywhere they appear inside each file (in body text, tables,
code spans, YAML values -- anywhere):
  --accent-sand  ->  --accent-1
  --accent-clay  ->  --accent-2
  --accent-dusk  ->  --accent-3

ACTIVE THEME files (13) in web/themes/:
  DESIGN-barbie.md
  DESIGN-bluey.md
  DESIGN-dungeon-crawler-carl.md
  DESIGN-heritage.md
  DESIGN-midnight.md
  DESIGN-minecraft.md
  DESIGN-neon-country.md
  DESIGN-patriotic.md
  DESIGN-spongebob.md
  DESIGN-star-wars.md
  DESIGN-sunshine.md
  DESIGN-superman.md
  DESIGN-toy-story.md

ORPHANED SPEC files (10) in web/themes/ -- these have specs but no CSS yet;
apply the same rename:
  DESIGN-storm-watch.md
  DESIGN-dusk-gold.md
  DESIGN-mint-forest.md
  DESIGN-desert-sky.md
  DESIGN-cabin-fire.md
  DESIGN-wildflower.md
  DESIGN-autumn-ozarks.md
  DESIGN-lake-day.md
  DESIGN-sunrise.md
  DESIGN-night-hike.md

Make no other changes to these 23 files -- do not reformat, reorder sections, or alter any
other content.
</task_b>

<verification>
After all edits, run these two shell commands and confirm the results inline in your
completion report:

  grep -r 'accent-sand\|accent-clay\|accent-dusk' web/themes/ --include='*.md'
  # Expected: zero lines of output. If any lines appear, fix them before reporting.

  ls web/themes/DESIGN-trail.md
  # Expected: file exists. If missing, create it before reporting.
</verification>

<example_token_rename>
Before (in any .md file):
  | `--accent-sand` | `#C2A46E` | Brand warm sand accent |

After:
  | `--accent-1` | `#C2A46E` | Brand warm sand accent |

The value and description are unchanged; only the token name string is updated.
</example_token_rename>

<reminder>
You must not invent any token name, hex value, font name, or numeric value. Every value in
DESIGN-trail.md must be traceable to a literal line in web/css/tokens.css or
web/css/themes/trail.css. If you are uncertain about a value, quote the raw CSS line and
flag it with a "NOTE: verify" comment rather than guessing. For the 23 rename edits, make
only the three string substitutions listed -- nothing else.
</reminder>

When complete:
(1) List every file you modified with a one-line description.
(2) Note any assumptions or judgment calls.
(3) STOP. Do not commit, push, copy files, or update logs.
