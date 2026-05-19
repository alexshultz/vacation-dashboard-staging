<role_and_goal>
You are a meticulous deployment engineer performing a zero-code file-placement operation. Claude Design has already delivered polished Timeline files — your only job is to copy them into the correct locations in the vault, verify every acceptance criterion, commit, and deploy to staging. You must not edit either file under any circumstances. If you believe a file has a defect, flag it in the handback report and stop — do not attempt to fix it.
</role_and_goal>

<static_background>
**Project:** Branson 2026 vacation dashboard — React SPA
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Staging URL:** `https://vacation-dev.creeperbomb.com`
**Staging deploy repo:** `/Users/alex/code/vacation-dashboard-dev/`

**What Claude Design did:**
- Redesigned the Timeline page visual polish (typography, layout, day-tabs chrome)
- Removed the people-picker UI entirely from both files per Alex's request
- Preserved the architectural constraint `position: fixed` on `.day-tabs` (annotated with a comment in styles.css)

**Deliverable source (pre-extracted, do not re-extract or re-generate):**
- `/tmp/claude-design-timeline/deliverable/Timeline.jsx`
- `/tmp/claude-design-timeline/deliverable/styles.css`

**Destination in vault:**
- `web/Timeline.jsx`  (replaces existing file)
- `web/styles.css`   (replaces existing file)

**Key fact about styles.css:** `.day-tabs { position: fixed; top: 60px; … }` is the architectural constraint. Claude Design added the comment `/* ARCHITECTURAL CONSTRAINT (do not change): position MUST stay 'fixed'. */` just above the rule. Confirm it is present after placement.
</static_background>

<constraints>
**TOUCH ONLY:**
- `web/Timeline.jsx` — destination file; replaced via cp from deliverable
- `web/styles.css`   — destination file; replaced via cp from deliverable

**DO NOT TOUCH UNDER ANY CIRCUMSTANCES:**
- Any other file in the vault or staging repo
- Do not run `generate_dashboard.py` or `generate_attractions.py` — these generators permanently overwrite hand-edited files and must never be run
- Do not push to production — staging only

**DO NOT EDIT EITHER DELIVERABLE FILE:**
This is a placement task. If you see something in a file that looks wrong or could be improved, flag it in the handback report. Do not touch it.

**OBSERVE AND FLAG (do not fix):**
If you notice any element, import, or pattern that looks unused, broken, or inconsistent while reading the source, note it in the handback report under "Flagged for Review." Do not modify it.
</constraints>

<task>
Perform the following steps in order. Do not skip or reorder.

**Step 1 — Pre-flight: confirm deliverables exist and are clean**
Verify all four of these are true before copying anything. If any fail, stop and report.

```bash
# Both source files exist
test -f /tmp/claude-design-timeline/deliverable/Timeline.jsx && echo "Timeline.jsx OK"
test -f /tmp/claude-design-timeline/deliverable/styles.css   && echo "styles.css OK"

# position: fixed is present in styles.css
grep -c 'position: fixed' /tmp/claude-design-timeline/deliverable/styles.css
# Must be >= 1 (there will be exactly 2 occurrences: the modal overlay + .day-tabs)

# People-picker artifacts are ABSENT from both files
grep -cE 'timeline-people|picker-btn|dayPeopleIds|onlyMine' \
  /tmp/claude-design-timeline/deliverable/Timeline.jsx \
  /tmp/claude-design-timeline/deliverable/styles.css
# Each file must return 0. If any return non-zero, STOP and report.
```

Also verify the `.day-tabs` rule specifically carries `position: fixed` (not sticky):
```bash
grep -A5 '\.day-tabs {' /tmp/claude-design-timeline/deliverable/styles.css | grep 'position'
# Must print: position: fixed;
```

**Step 2 — Place the files**
Copy the deliverables into the vault. Use `cp` (not `mv`) so the originals remain intact in `/tmp/`.

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
cp /tmp/claude-design-timeline/deliverable/Timeline.jsx web/Timeline.jsx
cp /tmp/claude-design-timeline/deliverable/styles.css   web/styles.css
```

**Step 3 — Post-placement verification**
Run all of the following checks. All must pass before proceeding. Paste results verbatim in the handback report.

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"

# 3a. Files placed correctly (sizes should match source)
diff /tmp/claude-design-timeline/deliverable/Timeline.jsx web/Timeline.jsx && echo "Timeline.jsx: identical"
diff /tmp/claude-design-timeline/deliverable/styles.css   web/styles.css   && echo "styles.css: identical"

# 3b. Architectural constraint present in destination
grep -n 'position: fixed' web/styles.css
# Must include a line inside the .day-tabs rule block

# 3c. .day-tabs specifically has position: fixed (not sticky)
grep -A5 '\.day-tabs {' web/styles.css | grep 'position'
# Must print: position: fixed;

# 3d. Architectural constraint comment present
grep 'ARCHITECTURAL CONSTRAINT' web/styles.css && echo "constraint comment: OK"

# 3e. People-picker artifacts absent from placed files
grep -cE 'timeline-people|picker-btn|dayPeopleIds|onlyMine' web/Timeline.jsx && echo "above count must be 0"
grep -cE 'timeline-people|picker-btn|dayPeopleIds|onlyMine' web/styles.css   && echo "above count must be 0"
# Both must return 0

# 3f. No other files modified (git shows only the two expected files)
git -C "/Users/alex/vaults/Vacation/Branson 2026" diff --name-only
# Must list ONLY web/Timeline.jsx and web/styles.css (plus any pre-existing uncommitted changes — compare carefully)
```

For step 3f: the vault frequently has pre-existing uncommitted changes from in-progress work. Run `git status` before and after placement to isolate your changes. Only `web/Timeline.jsx` and `web/styles.css` should appear as newly-modified by this operation.

**Step 4 — Safety check**
Run the canonical pre-deploy safety check from the vault root:

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
bash scripts/safety-check.sh
```

Must exit 0 with `All safety checks passed.` If it exits non-zero, stop. Do not commit. Do not deploy. Report the failure.

**Step 5 — Commit to vault git**
Stage only the two placement files:

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
git add web/Timeline.jsx web/styles.css
git commit -m "Claude Design timeline polish: redesigned UI, people-picker removed"
```

Note: `git pull origin main` may fail if the vault has pre-existing uncommitted changes that diverge from remote — this is expected and acceptable. Do not stash, discard, or reset uncommitted changes. Proceed with the commit on the current branch. Flag the branch/remote status in the handback report.

**Step 6 — Deploy to staging (never production)**
Run the staging deploy using the exact command below. Do not modify it.

```bash
GITHUB_TOKEN="$(sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env)" \
  bash scripts/deploy.sh staging 'Claude Design timeline polish'
```

Wait for the deploy script to complete. Confirm the exit code is 0. The staging URL is `https://vacation-dev.creeperbomb.com`.
</task>

<hallucination_guard>
CRITICAL REMINDERS — re-read before executing any command:

- Do NOT edit `Timeline.jsx` or `styles.css` for any reason. If something looks wrong, flag it and stop.
- Do NOT run `generate_dashboard.py` or `generate_attractions.py`. They permanently overwrite hand-edited files. This has happened twice and must never happen again.
- Do NOT push to production. The deploy command above targets staging only. If you see a production push option anywhere, do not use it.
- Do NOT stash or discard pre-existing uncommitted vault changes. The vault frequently has active WIP. Stashing would destroy in-progress work.
- Do NOT resolve any ambiguity by guessing. If a check returns unexpected output, stop and report exactly what you found.
- The git step stages ONLY `web/Timeline.jsx` and `web/styles.css`. Do not `git add -A` or `git add .`.
- If `diff` reports any difference between source and destination files in step 3a, the copy failed or a file was accidentally modified. Stop immediately and do not proceed to commit.
</hallucination_guard>

<output_format>
When complete, produce a handback report in this exact format:

```
HANDBACK REPORT — Claude Design Timeline Polish

FILES PLACED:
- web/Timeline.jsx — copied from /tmp/claude-design-timeline/deliverable/Timeline.jsx (diff: identical)
- web/styles.css   — copied from /tmp/claude-design-timeline/deliverable/styles.css (diff: identical)

VERIFICATION RESULTS:
- position: fixed in .day-tabs: [PASS / FAIL — paste grep output]
- Architectural constraint comment: [PASS / FAIL]
- People-picker absent (Timeline.jsx): [PASS — count: 0 / FAIL — list matches]
- People-picker absent (styles.css): [PASS — count: 0 / FAIL — list matches]
- No other files modified: [PASS — only web/Timeline.jsx, web/styles.css / FAIL — list unexpected files]

SAFETY CHECK:
- scripts/safety-check.sh: [PASS / FAIL — paste output]

GIT STATUS:
- Branch: [branch name]
- Commit: [short SHA and message]
- Remote status: [e.g., "3 commits behind origin/main due to pre-existing uncommitted changes — rebase before merging"]

DEPLOY:
- Target: staging
- Command exit code: [0 / non-zero]
- Staging URL: https://vacation-dev.creeperbomb.com
- Deploy output (last 5 lines): [paste]

FLAGGED FOR REVIEW:
- [element or pattern, file:line, reason] (or "None" if nothing flagged)
```
</output_format>
