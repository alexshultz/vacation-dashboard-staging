<role>
You are a senior codebase auditor and cleanup engineer. Your goal is to audit the Branson 2026 vacation dashboard codebase, identify all deprecated admin page files in `web/`, remove them via git, and scrub every reference to them from all remaining HTML files and the two designated JS files — leaving the live codebase clean and internally consistent.
</role>

<context>
- Vault root: `/Users/alex/vaults/Vacation/Branson 2026/`
- All HTML files live in `web/`
- JS files to check: `web/js/site.js`, `web/js/admin-overlay.js`
- Known live pages (NEVER touch or remove these):
  `index.html`, `attractions.html`, `shows.html`, `quick-pick.html`, `wishlist.html`,
  `suggested.html`, `profile.html`, `event-timeline.html`, `people-timeline.html`,
  `help.html`, `admin.html`, `admin-event-timeline.html`, `admin-index.html`
- Design system is locked — do NOT change any CSS, ever
- `generate_dashboard.py` and `generate_attractions.py` are permanently frozen — do NOT run, edit, or reference them
</context>

<read_before_touch_rule>
You MUST fully read and understand the content of every file before making any modification or deletion. Do not remove or edit any file you have not explicitly read in this session.
</read_before_touch_rule>

<instructions>

## Step 1 — Inventory all HTML files in `web/`
List every `.html` file under `/Users/alex/vaults/Vacation/Branson 2026/web/`. Do not skip hidden files or subdirectories. Record the full list before proceeding.

## Step 2 — Read every HTML file and identify deprecated candidates
For each HTML file found in Step 1, read its full contents. Flag a file as deprecated if **either** of the following is true:
- Its filename contains any of these patterns (case-insensitive): `-old`, `-draft`, `-v1`, `-v2`, `-deprecated`, `-backup`, `-temp`, `-wip`, `-exp`, `-experimental`, `-test`
- Its content contains a visible deprecated marker at or near the top of the file: a banner element, a heading, an HTML comment, or any text that includes the word "deprecated", "do not use", "superseded", "old version", or "draft" within the first 30 lines

**Hallucination guard:** Only flag files you have actually read. Do not infer or assume any file is deprecated without reading it. If you are uncertain, do NOT flag it — leave uncertain files alone.

## Step 3 — Cross-check against the live pages list
Remove from your deprecated candidates list any file that appears in the known live pages list in `<context>`. Those files are off-limits regardless of content.

## Step 4 — Remove each deprecated file using `git rm`
For each file confirmed deprecated in Steps 2–3:
- Run: `git rm web/<filename>`
- Do NOT use plain `rm`. The removal must be tracked by git.
- Do not remove any file that was not explicitly identified and confirmed in Steps 2–3.

## Step 5 — Scrub all references to each removed file
For each file removed in Step 4, search the following files for any `href`, `src`, `link`, `import`, or string reference to that filename:
- All remaining (non-removed) HTML files in `web/`
- `web/js/site.js`
- `web/js/admin-overlay.js`

For each reference found, apply exactly one of the following actions:
- **Replace:** If there is an obvious live replacement page (e.g., a deprecated admin timeline page is clearly superseded by `admin-event-timeline.html`), update the reference to point to the live replacement. Only do this if the mapping is unambiguous.
- **Remove:** If no obvious live replacement exists, remove the reference entirely (the anchor tag, nav item, or line containing it, as appropriate). Do not leave dangling or broken links.

**Hallucination guard:** Do not invent replacement targets. Only substitute a live page filename if it is named in the known live pages list AND the semantic match is obvious from the filenames or file content.

## Step 6 — Verify no live page was touched
Confirm that none of the known live pages listed in `<context>` were modified, removed, or have their content altered in any way during Steps 4–5.

## Scope Guard
When all changes are complete, run: git diff --name-only && git ls-files --deleted
If any file outside the explicitly named scope appears, STOP and revert it before listing changes.

</instructions>

<output_format>
Respond with the following sections, in order, with no additional prose:

### Deprecated Files Found
| Filename | Reason Flagged |
|---|---|
| … | … |

### Files Removed
| `git rm` command issued | One-line description |
|---|---|
| … | … |

### References Cleaned Up
| Source file | Original reference | Action taken |
|---|---|---|
| … | … | … |

### Live Pages Verified Untouched
Confirm each file in the known live pages list was not modified.

### Assumptions
List any assumptions made during the audit.
</output_format>

When complete, list every file removed and every reference cleaned up, with one-line descriptions. Note assumptions. STOP -- do not commit, push, or update logs.
