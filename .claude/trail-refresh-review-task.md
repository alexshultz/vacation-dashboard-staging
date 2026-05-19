<task>
You are a senior front-end engineer and QA gatekeeper. Your goal is to safely integrate the `design/trail-refresh` branch into the vacation-dashboard-dev project by rebasing it, reviewing all changed files for risk, running the full Playwright test suite, and — only if tests pass — deploying to staging. You are NOT authorized to touch production, main, or open pull requests under any circumstances.

Work in this exact local repository:
  `/Users/alex/vaults/Vacation/Branson 2026/`

This directory is the local clone of `https://github.com/alexshultz/vacation-dashboard-dev`. All site files live under `web/`. Git origin is the GitHub remote above.
</task>

<background>
**Branch under review:** `design/trail-refresh`
This branch contains externally-authored files produced during a Claude Design session. It is currently **1 commit behind `origin/main`** due to local divergence at branch creation time. It must be rebased before any further work.

**Four changed files (no others):**
| File | Before | After | Notes |
|---|---|---|---|
| `web/css/tokens.css` | 1,994 B | 5,663 B | +125 lines; new on-surface design tokens |
| `web/css/themes/trail.css` | 610 B | 1,807 B | +47 lines; full Ozarks color palette |
| `web/css/components.css` | 43,837 B | 26,093 B | **−602 lines; significant condensed rewrite — treat with extra scrutiny** |
| `web/DESIGN.md` | 25,625 B | 36,698 B | +239 lines; surgical merge with new design rules |

**`components.css` size reduction is the highest-risk change.** A drop from 43 KB to 26 KB means a large number of CSS rules were removed. You must verify that no removed class still appears in any `.html`, `.js`, or other `.css` file in the project.

**Playwright suite:** 85 tests total. One pre-existing known-flaky test: `AC-9` in `admin-form-inputs.spec.js` (login race condition). AC-9 is allowed to fail on first run and pass on retry. If AC-9 fails twice in a row, that is still acceptable — it is a known flaky and not a blocker. Any other test failure is a **hard blocker** — stop immediately and report; do not deploy.

**Staging site:** `vacation-dev.creeperbomb.com`
**Production site (DO NOT TOUCH):** `vacation.creeperbomb.com`

**GitHub credentials:**
- Username: `alexshultz`
- Token: Extract with `sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env`
- **Never use `cut -d'=' -f2`** — it truncates tokens that contain `=` characters.
</background>

<constraints>
- **DO NOT** push to `main` under any circumstances.
- **DO NOT** deploy to production (`vacation.creeperbomb.com`) or the production repo (`/Users/alex/code/vacation-dashboard`).
- **DO NOT** open a pull request.
- **DO NOT** run `generate_dashboard.py` or `generate_attractions.py` under any circumstances.
- **DO NOT** modify any HTML file. If you spot something that looks unused or redundant in any HTML file, flag it in the handback report — do not touch it.
- **DO NOT** deploy if any Playwright test other than the known AC-9 flaky fails.
- **DO NOT** infer, assume, or fabricate any detail not found in this prompt or the files on disk. If you are uncertain about something, say so explicitly in the handback report.
</constraints>

<rules>
**Pre-push safety checks — run ALL four before any push. Each must meet its threshold or stop and report:**

```bash
grep -c 'pointerdown' web/quick-pick.html            # must return exactly 1
grep -c 'fetch.*data.json' web/attractions.html       # must return >= 1
grep -c 'fetch.*help.json' web/help.html              # must return exactly 1
grep -c 'fetch.*schedule.json' web/event-timeline.html  # must return >= 1
```

If any check fails its threshold, **stop. Do not push. Report the failure in the handback report.**

**components.css dead-rule audit:** For every class or rule removed from `components.css`, check whether it still appears anywhere in:
- All `web/*.html` files
- All `web/js/*.js` files
- All other `web/css/*.css` files

Any removed rule that is still referenced elsewhere is flagged as **load-bearing** in the handback report. Do not remove or alter it in the branch — just flag it.
</rules>

<procedure>
Follow these steps in exact order. Do not skip steps. Do not reorder them.

**Step 1 — Rebase**
```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
git fetch origin
git checkout design/trail-refresh
git rebase origin/main
```
If the rebase produces conflicts: stop, describe every conflict file and the nature of each conflict in the handback report. Do not resolve conflicts speculatively — flag them for human review.

**Step 2 — Diff review**
Run `git diff origin/main...design/trail-refresh` scoped to the four known changed files. For each file, produce a structured diff summary. For `components.css`, perform the dead-rule audit described in `<rules>` and list every load-bearing removal found.

**Step 3 — Pre-push safety checks**
Run all four `grep -c` checks listed in `<rules>`. Record the numeric output of each. Confirm pass/fail.

**Step 4 — Playwright**
Run the full Playwright suite from the project root. Record the total pass/fail/skip counts. If AC-9 fails on first run, retry it once. If it fails twice, note it as the known flaky — not a blocker. If any other test fails even once, **stop. Do not proceed to Step 5.** Report the failure(s) in the handback report.

**Step 5 — Staging deploy (only if Steps 1–4 all passed)**

Use these exact commands. STAGING = `/Users/alex/code/vacation-dashboard-dev`. Do NOT use the PRODUCTION path (`/Users/alex/code/vacation-dashboard`).

```bash
VAULT="/Users/alex/vaults/Vacation/Branson 2026"
STAGING="/Users/alex/code/vacation-dashboard-dev"

# Push branch to origin first
TOKEN=$(sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env)
git push https://alexshultz:${TOKEN}@github.com/alexshultz/vacation-dashboard-dev.git design/trail-refresh

# rsync to staging repo
rsync -av --delete \
  --exclude=".git" --exclude="CNAME" --exclude="DESIGN.md" --exclude="mockups" \
  "$VAULT/web/" "$STAGING/"

# Fix vault-relative paths
cd "$STAGING"
sed -i '' 's|../assets/thumbs/|assets/thumbs/|g' \
  attractions.html shows.html index.html event-timeline.html people-timeline.html \
  wishlist.html suggested.html profile.html quick-pick.html help.html

# Cache-bust CSS/JS URLs
python3 "$VAULT/scripts/cache_bust.py"

# Commit and push to staging
git add -A && \
  git -c user.email="alexshultz@users.noreply.github.com" \
  commit -m "design: trail-refresh design system (tokens, themes, components, DESIGN.md)" && \
  git -c credential.helper=osxkeychain push origin main
```

Confirm the push and rsync complete without error.

**Step 6 — Handback report**
Produce the handback report as specified in `<output_format>`.
</procedure>

<output_format>
Begin your response with this exact structure. Fill in every field. Do not omit sections.

---

## Handback Report — design/trail-refresh

### 1. Rebase Result
- Status: [CLEAN / CONFLICTS]
- Base commit before rebase: [SHA]
- HEAD after rebase: [SHA]
- Conflicts (if any): [list each file and describe the conflict type]

### 2. Diff Summary

#### web/css/tokens.css
- Lines added / removed: [+X / −Y]
- Summary of changes: [plain-English description]
- Risk flags: [NONE or list]

#### web/css/themes/trail.css
- Lines added / removed: [+X / −Y]
- Summary of changes:
- Risk flags:

#### web/css/components.css
- Lines added / removed: [+X / −Y]
- Summary of changes:
- **Load-bearing removals** (class/rule still referenced elsewhere):
  - [class name] — referenced in [file(s)]
  - ... or NONE
- Other risk flags:

#### web/DESIGN.md
- Lines added / removed: [+X / −Y]
- Summary of changes:
- Risk flags:

### 3. Pre-Push Safety Check Results
| Check | Expected | Actual | Pass/Fail |
|---|---|---|---|
| `pointerdown` in quick-pick.html | 1 | [n] | [PASS/FAIL] |
| `fetch.*data.json` in attractions.html | ≥ 1 | [n] | [PASS/FAIL] |
| `fetch.*help.json` in help.html | 1 | [n] | [PASS/FAIL] |
| `fetch.*schedule.json` in event-timeline.html | ≥ 1 | [n] | [PASS/FAIL] |

### 4. Playwright Results
- Total tests: [n]
- Passed: [n]
- Failed: [n]
- Skipped: [n]
- AC-9 status: [PASSED FIRST RUN / FAILED FIRST RUN, PASSED RETRY / FAILED BOTH RUNS (known flaky — acceptable)]
- Other failures: [NONE or list with test name and error]
- Go/No-Go for deploy: [GO / NO-GO]

### 5. Staging Deploy
- Status: [DEPLOYED / NOT ATTEMPTED / FAILED]
- Branch pushed to origin: [YES / NO]
- rsync target: [exact path used]
- Deploy output summary: [success confirmation or error]
- Staging URL: vacation-dev.creeperbomb.com

### 6. Flags for Human Review
[List anything that looked unusual, risky, redundant, or uncertain — including load-bearing removals from components.css and anything in HTML files that appeared unused. Do not act on these items; record them here only.]

---
</output_format>

<reminder>
Do not invent any detail not found in this prompt or in the files on disk. If a file path does not exist where expected, say so — do not guess at an alternate path. If any step produces unexpected output, quote the actual output and stop rather than proceeding on an assumption. Uncertainty must be surfaced explicitly in the handback report, not silently resolved.

Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.

When complete, provide the handback report. Stop there. Do not open a pull request. Do not push to production. Do not update logs.
</reminder>
