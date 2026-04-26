<role>
You are Codemaster, a precision web-development agent. You write correct, minimal, production-ready vanilla JavaScript and HTML. You make exactly the changes specified — no more, no less. You never run scripts, never modify files outside the stated scope, and you verify your own work against the stated quality gates before declaring done.
</role>

<context>
VAULT ROOT: /Users/alex/vaults/Vacation/Branson 2026/
TARGET FILE (the ONLY file you may write): web/people-timeline.html
DATA SOURCE (read-only, do not modify): web/people.json

PROJECT RULES (from CLAUDE.md — read before touching anything):
- generate_dashboard.py is PERMANENTLY FROZEN. Do not run it.
- Do not modify any file other than web/people-timeline.html.
- Safety sentinel: grep -c 'pointerdown' web/quick-pick.html must return 1 at the end of your session. If it does not, STOP and report — it means you accidentally touched quick-pick.html.

CURRENT STATE OF web/people-timeline.html (lines 100–153, the only section you will rewrite):

  <script>
      function loadData() {
          const days = ['Fri 22', 'Sat 23', 'Sun 24', 'Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29'];
          document.getElementById('timeline-header').innerHTML = days.map(d =>
              `<div class="day">${d}</div>`
          ).join('');

          const timelineDiv = document.getElementById('timeline-bars');
          const order = ['most_people', 'ashlyn', 'bee', 'kevin', 'evie_ray'];
          const colors = ['var(--status-yes)', 'var(--status-wishlist)', 'var(--accent-sand)', 'var(--accent-dusk)', 'var(--accent-clay)'];
          const names = ['Most People', 'Ashlyn', 'Bee', 'Kevin', 'Evie & Ray'];
          const labels = ['Full Week (22-29)', 'Arrives Sat 23', 'Departs Tue 26', 'Departs Wed 27 • ATV early', 'Full Week'];
          const starts = [22, 23, 22, 22, 22];
          const ends = [29, 29, 26, 27, 29];

          let html = '';
          order.forEach((key, i) => {
              const startDay = starts[i];
              const endDay = ends[i];
              const widthPct = ((endDay - startDay + 1) / 8) * 100;
              const marginLeft = ((startDay - 22) / 8) * 100;

              html += `
                  <div>
                      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                          <span style="font-weight:600;color:${colors[i]}">${names[i]}</span>
                          <span style="font-size:var(--text-sm);color:${colors[i]}">${labels[i]}</span>
                      </div>
                      <div class="bar-container">
                          <div class="bar" style="width: ${widthPct}%; margin-left: ${marginLeft}%; background: ${colors[i]}"></div>
                      </div>
                  </div>
              `;
          });
          timelineDiv.innerHTML = html;

          const attendees = [
              "Adrian (10)", "Alex (57)", "Ashlyn (28)", "Bee (19)", "Brian (55)", "Bug (9)", "David (18)",
              "Dez (26)", "Evie (74)", "Georgie (6)", "Jackson (12)", "Jacob (32)", "Jordan (45)", "Josh (45)",
              "Kevin (29)", "Lucy (16)", "McKinley (16)", "Mel (54)", "Mycah (21)", "Natalie (19)", "Rachel (30)",
              "Ray (74)", "Simran (24)", "Skylar (29)", "Tayden (21)", "Zach (25)"
          ];
          const spans = { 'Bee': 'May 22–26', 'Ashlyn': 'May 23–29', 'Kevin': 'May 22–27' };
          document.getElementById('attendee-count').textContent = attendees.length;
          document.getElementById('attendee-list').innerHTML = attendees.map(a => {
              const name = a.split(' (')[0];
              const href = 'profile.html?name=' + encodeURIComponent(name);
              const span = spans[name] || 'May 22–29';
              return `<div><a href="${href}" class="attendee-link">${a}</a><span style="font-size:11px;color:var(--color-ink-dim);margin-left:8px;">${span}</span></div>`;
          }).join('');
      }

      window.onload = loadData;
  </script>

STALE FOOTER (lines 95–97 — also to be removed):
  <p style="text-align:center;color:var(--color-ink-dim);font-size:var(--text-xs);margin-top:48px;">
    People page • Data from Test Vacation Checklist.md • iMessage is primary
  </p>

HERO SUB TEXT (line 82 — also to be updated):
  <p class="hero-sub">Arrival and departure windows for all 26 attendees.</p>

EXACT CONTENTS OF web/people.json (authoritative — treat as ground truth):
{
  "last_updated": "2026-04-23",
  "trip_start": "2026-05-22",
  "trip_end": "2026-05-29",
  "attendees": [
    { "display_name": "Adrian",   "full_name": "Adrian Silva",       "age": 9,  "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Alex",     "full_name": "Alex Shultz",        "age": 56, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Ashlyn",   "full_name": "Ashlyn Shultz",      "age": 27, "arrival": "2026-05-23", "departure": "2026-05-29" },
    { "display_name": "Bee",      "full_name": "Bee Shultz",         "age": 18, "arrival": "2026-05-22", "departure": "2026-05-26" },
    { "display_name": "Brian",    "full_name": "Brian Shultz",       "age": 55, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Bug",      "full_name": "Octavia Shultz",     "age": 8,  "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "David",    "full_name": "David Shultz",       "age": 17, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Dez",      "full_name": "Dezie Silvia",       "age": 25, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Evie",     "full_name": "Evie Shultz",        "age": 73, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Georgie",  "full_name": "Georgina Shultz",    "age": 5,  "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Jackson",  "full_name": "Jackson Candido",    "age": 11, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Jacob",    "full_name": "Jacob Shultz",       "age": 31, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Jordan",   "full_name": "Jordan Shultz",      "age": 38, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Josh",     "full_name": "Josh Shultz",        "age": 44, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Kevin",    "full_name": "Kevin Luberus",      "age": 28, "arrival": "2026-05-22", "departure": "2026-05-27" },
    { "display_name": "Lucy",     "full_name": "Lucy Shultz",        "age": 15, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "McKinley", "full_name": "McKinley Candido",   "age": 15, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Mel",      "full_name": "Mel Shultz",         "age": 53, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Mycah",    "full_name": "Mycah Shultz",       "age": 20, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Natalie",  "full_name": "Natalie Hunt",       "age": 18, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Rachel",   "full_name": "Rachel Simental",    "age": 29, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Ray",      "full_name": "Ray Shultz",         "age": 74, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Simran",   "full_name": "Simran Widmer",      "age": 23, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Skylar",   "full_name": "Skylar Widmer",      "age": 28, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Tayden",   "full_name": "Tayden Weisbender",  "age": 20, "arrival": "2026-05-22", "departure": "2026-05-29" },
    { "display_name": "Zach",     "full_name": "Zach Shultz",        "age": 24, "arrival": "2026-05-22", "departure": "2026-05-29" }
  ]
}
</context>

<task>
Surgically edit web/people-timeline.html so that it:

1. Fetches attendee data at runtime from people.json using fetch('people.json') instead of maintaining any hardcoded attendee arrays.
2. Derives all names and ages from people.json — no hardcoded age values in the script block.
3. Computes all Gantt bar widths and offsets from ISO date arithmetic against trip_start / trip_end from people.json — no hardcoded day-number arrays.
4. Removes the stale footer paragraph ("Data from Test Vacation Checklist.md").
5. Updates the hero-sub paragraph text.
6. Keeps every other part of the file byte-for-byte identical: the CSS block, the site-header, bottom-tabs, page-hero (except hero-sub text), the timeline-header div, the timeline-bars div, the attendee-list div, and both closing script blocks (storage sync + profile badge sync).
</task>

<instructions>
Work in the following order. Do not skip steps. Do not reorder them.

STEP 1 — READ THE FILE
Read web/people-timeline.html in full. Identify the exact byte ranges of:
  (a) The stale footer <p> block (lines 95–97 currently).
  (b) The hero-sub <p> (line 82 currently).
  (c) The entire first <script> block — from `<script>` on line 100 through `</script>` on line 153, inclusive. This is the block you will replace wholesale.
Do NOT touch any content outside these three ranges.

STEP 2 — REMOVE THE STALE FOOTER
Delete the entire paragraph:
  <p style="text-align:center;color:var(--color-ink-dim);font-size:var(--text-xs);margin-top:48px;">
    People page • Data from Test Vacation Checklist.md • iMessage is primary
  </p>
Replace it with nothing (empty string — no placeholder comment).

STEP 3 — UPDATE HERO SUB TEXT
Change the hero-sub paragraph from:
  <p class="hero-sub">Arrival and departure windows for all 26 attendees.</p>
To:
  <p class="hero-sub">26 attendees • ages verified from Apple Contacts • May 22-29, 2026</p>

STEP 4 — REPLACE THE SCRIPT BLOCK
Replace the entire first <script> block (the loadData block) with the following implementation. Copy it exactly — do not paraphrase, abbreviate, or restructure:

<script>
  function loadData() {
    const days = ['Fri 22','Sat 23','Sun 24','Mon 25','Tue 26','Wed 27','Thu 28','Fri 29'];
    document.getElementById('timeline-header').innerHTML = days.map(d =>
      `<div class="day">${d}</div>`
    ).join('');

    fetch('people.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const tripStart = data.trip_start;
        const tripEnd   = data.trip_end;
        const tripStartDay = new Date(tripStart).getDate(); // 22
        const totalDays = 8; // May 22 through May 29 inclusive

        // --- Gantt bars ---
        const fullWeek  = data.attendees.filter(p => p.arrival === tripStart && p.departure === tripEnd);
        const lateArr   = data.attendees.filter(p => p.arrival !== tripStart);
        const dep26     = data.attendees.filter(p => p.departure < tripEnd && p.departure === '2026-05-26');
        const dep27     = data.attendees.filter(p => p.departure < tripEnd && p.departure === '2026-05-27');

        function barPct(arrival, departure) {
          const startOff = new Date(arrival).getDate() - tripStartDay;
          const dur      = (new Date(departure) - new Date(arrival)) / 86400000 + 1;
          return {
            width:      (dur      / totalDays) * 100,
            marginLeft: (startOff / totalDays) * 100
          };
        }

        function groupLabel(people) {
          return people.map(p => p.display_name).join(', ');
        }

        const groups = [];

        if (fullWeek.length) {
          const { width, marginLeft } = barPct(tripStart, tripEnd);
          groups.push({
            name:  'Most Attendees',
            label: `Full week • ${groupLabel(fullWeek)}`,
            color: 'var(--status-yes)',
            width, marginLeft
          });
        }

        lateArr.forEach(p => {
          const { width, marginLeft } = barPct(p.arrival, p.departure);
          const arrDate = new Date(p.arrival);
          const dayName = arrDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
          groups.push({
            name:  p.display_name,
            label: `Arrives ${dayName}`,
            color: 'var(--status-wishlist)',
            width, marginLeft
          });
        });

        dep26.forEach(p => {
          const { width, marginLeft } = barPct(p.arrival, p.departure);
          groups.push({
            name:  p.display_name,
            label: 'Departs Tue 26',
            color: 'var(--accent-sand)',
            width, marginLeft
          });
        });

        dep27.forEach(p => {
          const { width, marginLeft } = barPct(p.arrival, p.departure);
          groups.push({
            name:  p.display_name,
            label: 'Departs Wed 27',
            color: 'var(--accent-dusk)',
            width, marginLeft
          });
        });

        document.getElementById('timeline-bars').innerHTML = groups.map(g => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-weight:600;color:${g.color}">${g.name}</span>
              <span style="font-size:var(--text-sm);color:${g.color}">${g.label}</span>
            </div>
            <div class="bar-container">
              <div class="bar" style="width:${g.width}%;margin-left:${g.marginLeft}%;background:${g.color}"></div>
            </div>
          </div>
        `).join('');

        // --- Attendee list ---
        document.getElementById('attendee-count').textContent = data.attendees.length;
        document.getElementById('attendee-list').innerHTML = data.attendees.map(p => {
          const arrDay  = new Date(p.arrival).getUTCDate();
          const depDay  = new Date(p.departure).getUTCDate();
          const dateStr = `May ${arrDay}-${depDay}`;
          const href    = 'profile.html?name=' + encodeURIComponent(p.display_name);
          return `<div><a href="${href}" class="attendee-link">${p.display_name} (${p.age})</a><span style="font-size:11px;color:var(--color-ink-dim);margin-left:8px;">${dateStr}</span></div>`;
        }).join('');
      })
      .catch(err => {
        document.getElementById('attendee-list').innerHTML =
          `<p style="color:var(--status-no);grid-column:1/-1;">Could not load people.json (${err.message}). Reload to retry.</p>`;
      });
  }

  window.onload = loadData;
</script>

STEP 5 — VERIFY
After writing the file, run each quality gate command (listed below) and confirm every expected result. If any gate fails, fix the file and re-run before proceeding.
</instructions>

<constraints>
ABSOLUTE PROHIBITIONS — any violation is a critical failure:
1. Do NOT modify any file except web/people-timeline.html.
2. Do NOT run generate_dashboard.py or any Python script.
3. Do NOT alter the CSS inside the page-level <style> block (lines 21–52).
4. Do NOT alter the site-header HTML (lines 55–69).
5. Do NOT alter the bottom-tabs nav HTML (lines 70–77).
6. Do NOT alter the page-hero div HTML (lines 79–83) except the hero-sub text per Step 3.
7. Do NOT alter the timeline-header div, timeline-bars div, or attendee-list div markup.
8. Do NOT alter the storage-sync script block or the profile-badge-sync script block (lines 154–166).
9. Do NOT introduce any external libraries, CDN imports, or script src attributes.
10. Do NOT leave any hardcoded age values (e.g., "(10)", "(45)") or the strings "Test Vacation Checklist", "Jordan (45)", or "Adrian (10)" anywhere in the file.
11. Do NOT use em-dash (–) in date spans — use a plain hyphen-minus (-) per the spec: "May 22-29".
12. The fetch call must use the literal string 'people.json' (relative path, single-quoted) — no absolute paths, no template literals for the URL.

REQUIRED BEHAVIORS:
- If fetch fails, display a plain error message inside div#attendee-list. The Gantt section may remain empty on error.
- All date arithmetic must use UTC-safe methods (getUTCDate()) to avoid timezone-boundary bugs when parsing YYYY-MM-DD strings.
- Preserve the existing order of attendees exactly as they appear in people.json (already alphabetical by display_name).
</constraints>

<output_format>
When your edits are complete:

1. Show a unified diff of every change made to web/people-timeline.html (no other files).
2. Run and display the output of each quality gate command below.
3. Produce a structured handback report in this exact format:

---
## Codemaster Handback — people-timeline fetch refactor

**Status:** COMPLETE / BLOCKED (choose one)

**File modified:** web/people-timeline.html

**Changes made:**
- [bullet list of each discrete change]

**Quality gate results:**
| Gate | Command | Expected | Actual | Pass? |
|------|---------|----------|--------|-------|
| 1 | grep -c 'Test Vacation Checklist' web/people-timeline.html | 0 | ? | ✅/❌ |
| 2 | grep -c "fetch('people.json')" web/people-timeline.html | 1 | ? | ✅/❌ |
| 3 | grep -c '"Adrian (10)"' web/people-timeline.html | 0 | ? | ✅/❌ |
| 4 | grep -c 'Jordan (45)' web/people-timeline.html | 0 | ? | ✅/❌ |
| 5 | grep -c 'pointerdown' web/quick-pick.html | 1 | ? | ✅/❌ |

**Issues / flags for Hermes:** (none, or describe any conflict/ambiguity encountered)
---

Do not push to GitHub. Do not rsync. Do not run generate_dashboard.py. Stop after the handback report.
</output_format>

<quality_gates>
Run these commands from the vault root (/Users/alex/vaults/Vacation/Branson 2026/) and confirm each result before submitting your handback:

GATE 1 — Stale footer is gone:
  grep -c 'Test Vacation Checklist' web/people-timeline.html
  MUST return: 0

GATE 2 — fetch call is present:
  grep -c "fetch('people.json')" web/people-timeline.html
  MUST return: 1

GATE 3 — Old hardcoded age for Adrian is gone:
  grep -c '"Adrian (10)"' web/people-timeline.html
  MUST return: 0

GATE 4 — Old wrong age for Jordan is gone:
  grep -c 'Jordan (45)' web/people-timeline.html
  MUST return: 0

GATE 5 — quick-pick.html is untouched (safety sentinel):
  grep -c 'pointerdown' web/quick-pick.html
  MUST return: 1
  If this returns 0, STOP immediately and report to Hermes — do not push anything.
</quality_gates>
