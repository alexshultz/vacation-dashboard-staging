<role>
You are a senior front-end engineer performing two mechanical, zero-ambiguity CSS refactors on
the Branson '26 Dashboard static site. Your goal is to (1) rename three Trail-specific CSS
custom property names to generic names across all 16 CSS files, and (2) fix a tinted shadow
value in tokens.css. Both changes are purely textual -- no logic, no HTML, no Python, no JSON
is touched.
</role>

<background>
Project: Branson '26 Dashboard -- static site.
Vault root: /Users/alex/vaults/Vacation/Branson 2026/

CSS architecture (read this before touching anything):
- web/css/tokens.css -- semantic token definitions only. All components reference vars from
  this file exclusively.
- web/css/themes/trail.css -- defines the private Ozarks palette (--moss, --lake, --sand,
  --clay, --dusk) and maps those palette vars to semantic tokens, including the three accent
  vars being renamed.
- web/css/components.css -- 542+ lines of component rules. References semantic tokens
  (including the three accent vars). Never references raw palette vars directly.
- web/css/themes/*.css (13 non-trail files) -- each defines its own --accent-sand,
  --accent-clay, --accent-dusk overrides.

This is Brief 1 of 4. Downstream briefs depend on this rename being 100% clean.
Incomplete renames will break all subsequent work.

FROZEN FILES -- never run, never modify, never even open:
  generate_dashboard.py
  generate_attractions.py
</background>

<task>
Perform exactly two refactors. Do them in the order listed.

REFACTOR 1 -- TOKEN RENAME (all 16 CSS files)
Replace every occurrence of these three CSS custom property names -- both where they are
declared (left of colon) and where they are consumed (inside var()) -- with the generic
names shown:

  --accent-sand  ->  --accent-1
  --accent-clay  ->  --accent-2
  --accent-dusk  ->  --accent-3

This is a pure string substitution. Do NOT rename any other property. Do NOT rename palette
vars (--sand, --clay, --dusk) -- only the semantic accent tokens.

REFACTOR 2 -- SHADOW FIX (tokens.css only)
In web/css/tokens.css, locate the --shadow-2 definition. Its second rgba layer currently
contains a Trail-green tint:

  rgba(63,107,58,0.14)

Replace it with a neutral value:

  rgba(0,0,0,0.10)

Do not alter any other part of the --shadow-2 value (first layer, blur, spread, offsets).
</task>

<files_to_touch>
Touch ALL 16 files below. Touch NO others.

  web/css/tokens.css
  web/css/themes/trail.css
  web/css/components.css
  web/css/themes/midnight.css
  web/css/themes/sunshine.css
  web/css/themes/heritage.css
  web/css/themes/neon-country.css
  web/css/themes/dungeon-crawler-carl.css
  web/css/themes/spongebob.css
  web/css/themes/bluey.css
  web/css/themes/barbie.css
  web/css/themes/minecraft.css
  web/css/themes/superman.css
  web/css/themes/star-wars.css
  web/css/themes/toy-story.css
  web/css/themes/patriotic.css

All paths are relative to the vault root: /Users/alex/vaults/Vacation/Branson 2026/
</files_to_touch>

<files_never_to_touch>
- Any .html file
- Any .js file
- Any .json file
- Any DESIGN.md file
- generate_dashboard.py
- generate_attractions.py
- Any file not in the 16-file list above
</files_never_to_touch>

<order_of_operations>
1. Read all 16 CSS files. Confirm each exists. If any are missing, STOP and report -- do not
   guess or create files.
2. For each file, grep for accent-sand, accent-clay, accent-dusk. Note counts per file before
   making changes.
3. Apply Refactor 1 (rename) across all 16 files using exact string substitution. Do not use
   regex that could match partial tokens (e.g. do not accidentally rename --accent-sandy).
4. Apply Refactor 2 (shadow fix) in tokens.css only.
5. Run both verification commands and capture their output:
     grep -r 'accent-sand\|accent-clay\|accent-dusk' web/css/ --include='*.css'
     grep 'rgba(63,107,58' web/css/tokens.css
   Both MUST return zero results. If either returns output, the task is NOT complete -- fix the
   remaining occurrences and re-run until clean.
6. Do not run any other commands. Do not start a dev server, do not run Python scripts, do not
   open a browser.
</order_of_operations>

<examples>
BEFORE (trail.css):
  --accent-sand: var(--sand);
  --accent-clay: var(--clay);
  --accent-dusk: var(--dusk);

AFTER (trail.css):
  --accent-1: var(--sand);
  --accent-2: var(--clay);
  --accent-3: var(--dusk);

BEFORE (any theme file, e.g. midnight.css):
  --accent-sand: #c8a96e;
  --accent-clay: #a0522d;
  --accent-dusk: #6b4c82;

AFTER (midnight.css):
  --accent-1: #c8a96e;
  --accent-2: #a0522d;
  --accent-3: #6b4c82;

BEFORE (components.css):
  color: var(--accent-sand);

AFTER (components.css):
  color: var(--accent-1);

BEFORE (tokens.css, shadow-2):
  --shadow-2: 0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(63,107,58,0.14);

AFTER (tokens.css, shadow-2):
  --shadow-2: 0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(0,0,0,0.10);
</examples>

<reminder>
Do not invent file contents. Do not assume what a file contains -- read it first. If a file
does not contain one of the target strings, that is fine; record zero changes for that file
and move on. Do not add, remove, or reorganize any CSS rules beyond the exact substitutions
described. If anything is ambiguous or a file is missing, STOP and report before proceeding.
</reminder>

When complete:
(1) List every file you modified with a one-line description (e.g. "trail.css -- renamed 3
accent declarations; tokens.css -- renamed 3 accent usages + fixed shadow-2 rgba").
(2) Note any assumptions or judgment calls (e.g. a file had zero occurrences of a target
string).
(3) STOP. Do not commit, push, copy files, or update logs.
