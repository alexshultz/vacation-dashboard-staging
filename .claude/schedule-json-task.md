<task>
You are lazlo, a Claude Code CLI agent working on the Branson 2026 vacation-planning dashboard. Your goal in this session is a **pure data-migration**: create `web/schedule.json` as the single source of truth for all trip events, then update `web/event-timeline.html` and `web/index.html` to fetch from it instead of using inline hardcoded JS arrays. Zero UI behavior changes. Zero render-logic changes.
</task>

<background>
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`

**READ `CLAUDE.md` IN FULL BEFORE WRITING A SINGLE LINE OF CODE.** If anything in this brief conflicts with a rule in CLAUDE.md, flag the conflict explicitly before proceeding.

### Frozen files -- never touch these
- `scripts/generate_dashboard.py`
- `scripts/generate_attractions.py`
- `web/css/tokens.css`
- `web/css/themes/trail.css`
- `web/css/components.css`
- `web/data.json` (runtime output -- never hand-edit)
- `web/attractions.html`
- `web/wishlist.html`
- `web/suggested.html`
- `web/quick-pick.html`
- All other HTML files not explicitly listed below

### Files you will touch
| File | Action |
|---|---|
| `web/schedule.json` | CREATE NEW |
| `web/event-timeline.html` | Data source swap only -- no render logic changes |
| `web/index.html` | Data source swap only -- no render logic changes |
| `CLAUDE.md` | Add one safety check line |

### Key constraint from project memory
> Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.

### Existing fetch() patterns in this project (for reference)
- `fetch('data.json')` in `web/attractions.html`
- `fetch('help.json')` in `web/help.html`
- Use the same bare-relative-path style: `fetch('schedule.json')` -- no `./` prefix, no absolute path.
</background>

<rules>
### The golden rule for this task
This is a **data migration, not a feature**. The only permitted changes per file are:

- **`web/index.html`:** Remove the `const eventsData = [...]` inline array. Add `let eventsData = [];` at module scope. Replace the synchronous `render()` call inside `window.onload` with a `fetch('schedule.json')` call that populates `eventsData` then calls `render()`. Do NOT change any function body. Do NOT change any HTML element. Do NOT reformat or reorder any code outside the replaced section.

- **`web/event-timeline.html`:** Same swap. Remove the inline `const eventsData = [...]`. Add `let eventsData = [];` at module scope. Replace the synchronous `render()` call inside `window.onload` with a `fetch('schedule.json')` call that populates `eventsData` then calls `render()`. Do NOT change the `render()`, `renderCard()`, `toggleAll()`, or `setupMobileCollapse()` function bodies. Do NOT change any HTML element.

- **`CLAUDE.md`:** Add exactly one line to the existing safety check block (see Step 6 below).

- **`web/schedule.json`:** Create from scratch per schema below.

### fetch() pattern -- use this exactly
```javascript
let eventsData = [];

// ... all existing function definitions unchanged ...

window.onload = () => {
    fetch('schedule.json')
        .then(r => r.json())
        .then(data => {
            eventsData = data.events;
            render();
            setupMobileCollapse();
        })
        .catch(err => console.error('Failed to load schedule.json:', err));
    window.addEventListener('resize', setupMobileCollapse);
};
```

Note: `window.addEventListener('resize', setupMobileCollapse)` stays **outside** the `.then()` -- attach it immediately, do not wait for data to load. This matches the behavioral contract in both files.

### No error UI
The `.catch()` logs to console only. Do NOT add any visible DOM error output (no banners, no fallback arrays, no alert()). This is not a UI change.
</rules>

<task_steps>
Follow these steps in order. Do not skip or reorder.

## Step 1: Read both source files
Read `web/index.html` (lines ~87–194) and `web/event-timeline.html` (lines ~80–222) in full. These contain the inline `eventsData` arrays that are your sources. Do not proceed until you have read both.

## Step 2: Build a reconciliation table before writing any file
In your working notes (not yet in any output), build a table with three columns:

| index.html title | event-timeline.html title | duration | notes |
|---|---|---|---|

Apply the title corrections **during this matching step** (see Title Corrections below). After correcting titles, do exact-string matching. Log every title that fails to match.

**Expected mismatches to find:**
- `"Dogwood"` (index.html) -- no exact match in event-timeline.html (event-timeline has `"Dogwood Canyon (all)"` which is a different consolidated event). Flag as unmatched. Assign default duration: **6.0** (reconciliation note: cross-referenced against event-timeline's consolidated Dogwood Canyon block; flagged in report).
- `"Dogwood Canyon Horse"` (index.html) -- no match in event-timeline.html. Assign default duration: **1.5**.
- `"Dogwood Canyon Tram"` (index.html) -- no match in event-timeline.html. Assign default duration: **1.5**.
- `"Go Karts"` (index.html) -- no match in event-timeline.html. Assign default duration: **1.5**.
- `"Dogwood Canyon (all)"` (event-timeline.html) -- no match in index.html. This title is dropped (index.html is canonical). Flag in report.

## Step 3: Create `web/schedule.json`
Schema:
```json
{
  "events": [
    {
      "id": "slug-here",
      "title": "Event Title",
      "date": "YYYY-MM-DD",
      "duration": 1.5,
      "priority": "high|medium|low",
      "catalogRef": null,
      "startTime": null,
      "travelMinutes": null,
      "interested": ["Name", ...],
      "undecided": ["Name", ...],
      "notInterested": ["Name", ...],
      "noResponse": ["Name", ...]
    }
  ]
}
```

**Canonical base:** index.html's 28-event array. Use every event from index.html.
**Duration source:** event-timeline.html's durations, merged by title match after corrections.
**Field order in each object:** `id`, `title`, `date`, `duration`, `priority`, `catalogRef`, `startTime`, `travelMinutes`, `interested`, `undecided`, `notInterested`, `noResponse` -- in that exact order.
**People arrays:** alphabetical order (as already found in source files).

### New nullable fields (set to null for every event -- populated by later tasks)
- **`catalogRef`:** String slug matching a record in `data/attractions.json`, or null if this event has no catalog entry. Lazlo must read `data/attractions.json` slugs and report which events matched (with the matching slug) and which did not. Do not guess -- match only on exact slug or a clear title match. Report all matches and misses in the reconciliation report.
- **`startTime`:** String in "HH:MM" 24h format, or null. Leave null for all events in this task. Populated by the coordinator tool (Priority 9).
- **`travelMinutes`:** Number (minutes from Watermill Cove), or null. Leave null for all events in this task. Populated by the coordinator tool (Priority 9).

### Title Corrections (apply before matching AND in final JSON)
| Raw title in source | Correct title to use |
|---|---|
| `"Knife"` (index.html) | `"Knife Forge"` |
| `"Simon & Garfield"` (index.html) | `"Simon & Garfunkel"` |

These corrections make those titles match the already-correct titles in event-timeline.html.

### ID slug generation rules
- Lowercase
- Replace spaces with hyphens
- Replace `&` with `and`
- Strip apostrophes
- No leading/trailing/double hyphens

Examples:
- "Silver Dollar City" → `silver-dollar-city`
- "Sight & Sound" → `sight-and-sound`
- "Ripley's" → `ripleys`
- "Five & Dime" → `five-and-dime`
- "Simon & Garfunkel" → `simon-and-garfunkel`
- "Knife Forge" → `knife-forge`
- "Dogwood Canyon Horse" → `dogwood-canyon-horse`
- "ATV" → `atv`
- "Go Karts" → `go-karts`

## Step 4: Update `web/event-timeline.html` -- data source swap only
- Remove the `const eventsData = [` block (lines ~100–126) and its closing `];`
- Add `let eventsData = [];` at module scope in its place
- Replace the synchronous `render(); setupMobileCollapse();` calls inside `window.onload` with the fetch() pattern from the Rules section above
- Touch nothing else in the file

Verify: the `render()`, `renderCard()`, `setupMobileCollapse()`, and `toggleAll()` function bodies must be character-for-character identical to what they were before this edit.

## Step 5: Update `web/index.html` -- data source swap only
- Remove the `const eventsData = [` block (lines ~90–119) and its closing `];`
- Add `let eventsData = [];` at module scope in its place
- Replace the synchronous `render(); setupMobileCollapse();` calls inside `window.onload` with the fetch() pattern from the Rules section above
- Touch nothing else in the file

Verify: the `render()`, `toggleAll()`, and `setupMobileCollapse()` function bodies must be character-for-character identical to what they were before this edit.

## Step 6: Update `CLAUDE.md` -- add one safety check line
Find the existing safety check block that contains:
```bash
grep -c 'fetch.*help.json' web/help.html
# Must return 1. If 0: STOP. Help renderer is missing.
```

Immediately after that block (before the blank line that follows), add:
```bash
grep -c 'fetch.*schedule.json' web/event-timeline.html
# Must return >= 1. If 0: STOP. Event timeline data source is missing.
```

Do not modify any other line in CLAUDE.md.
</task_steps>

<output_format>
When all file changes are complete, produce the handback report in this exact structure. Begin your response with the heading `## Handback Report`. No preamble before it.

### 1. Files changed
List every file modified or created, one line each:
`<filename>` -- <one-line description of what changed>

### 2. Reconciliation report
Three sub-sections:

**Matched titles (with duration merged):**
List every title that matched between index.html and event-timeline.html, and the duration value taken from event-timeline.html. Format: `"Title" → duration: X`

**Unmatched titles from index.html (no duration in event-timeline.html):**
List every index.html title that had no match. Include the default duration assigned and a one-line note. Format: `"Title" → default duration: X (note)`

**Unmatched titles from event-timeline.html (not in canonical base):**
List every event-timeline.html title that had no match in index.html. These were dropped. Format: `"Title" → dropped (reason)`

### 3. Architectural choices
For any non-trivial decision made during this session:
- Choice: [what was decided]
- Why: [one sentence rationale]
- Affects: [which files or invariants]

If no additional choices were made beyond what was specified, say so explicitly.

### 4. Invariants affected
List any changes to CLAUDE.md safety checks. Include the exact new check added and its expected return value.

**After the handback report: STOP.**
Do not commit, push, or rsync. PM handles handback.
</output_format>

<grill_me>
## Grill-Me: Design Decisions

The following questions cover all non-obvious design decisions in this task. These were resolved before the brief was finalized. Full Q&A is at `grill-me docs/schedule-json-grillme.md`.

**Q1: "Dogwood" (index.html) vs "Dogwood Canyon (all)" (event-timeline.html) -- same event?**
A: Different events. index.html has three Dogwood entries (general canyon visit, horse ride, tram ride). event-timeline.html collapsed them into one block. No title match. "Dogwood" → default duration 6.0 with reconciliation note. "Dogwood Canyon (all)" from event-timeline.html → dropped from schedule.json (not in canonical base).

**Q2: Should .catch() add visible error UI?**
A: No. Log to console only: `console.error('Failed to load schedule.json:', err)`. No DOM changes.

**Q3: Slug rules for special characters?**
A: Strip apostrophes, replace `&` with `and`, replace spaces with hyphens, lowercase. No double hyphens.

**Q4: Should eventsData be module-scoped or callback-scoped?**
A: Module-scoped `let eventsData = [];`. Functions reference it by name; they must not change.

**Q5: Does schedule.json need to be added to the rsync sed path-fix in CLAUDE.md Step 3?**
A: No. The sed command rewrites `../assets/thumbs/` paths inside HTML files. JSON has no such paths.

**Q6: What is the fetch() relative path style?**
A: `fetch('schedule.json')` -- bare relative path, consistent with `fetch('data.json')` and `fetch('help.json')` already in the project.

**Q7: Where does the resize listener go relative to the fetch() call?**
A: Outside the `.then()` callback. Attach immediately after starting the fetch, not after data loads. This matches the existing behavioral contract.
</grill_me>

<reminder>
- Do not invent or assume any data not explicitly present in the source files (`web/index.html` and `web/event-timeline.html`). Read both files before writing anything.
- Do not change any render function body, any HTML element, any CSS, or any file not listed in "Files you will touch."
- If you encounter an element that looks unused or redundant in any HTML file, flag it in the handback report. Do not remove it.
- Cite the source (file + line) when making factual claims in the reconciliation report.
- If you are uncertain whether a title is a match, list both interpretations with a note. Do not silently pick one.
- The JSON must be valid. Run a mental parse before finalizing.
- Do not commit, push, or rsync. PM handles handback.
</reminder>
