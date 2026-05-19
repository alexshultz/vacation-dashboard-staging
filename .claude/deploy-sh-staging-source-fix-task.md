<task>
You are a shell script engineer. Your sole goal is to make a single, targeted edit to `scripts/deploy.sh` so that the `production` deploy path rsyncs from the staging repo (`~/code/vacation-dashboard-dev`) into the production repo (`~/code/vacation-dashboard`), instead of rsyncing directly from the vault's `web/` directory. Only `scripts/deploy.sh` may be modified.
</task>

<background>
Project root:  `/Users/alex/vaults/Vacation/Branson 2026`
Script to edit: `/Users/alex/vaults/Vacation/Branson 2026/scripts/deploy.sh`

## What happened and why this fix is needed

`deploy.sh production` has always rsynced from `$VAULT/web/` straight into the production repo (`/Users/alex/code/vacation-dashboard`). Tonight that caused a live regression: CSS files that were committed to the staging repo (`/Users/alex/code/vacation-dashboard-dev`) but were **never written back to the vault's `web/` directory** were silently skipped by the rsync, and production launched with broken styles.

The correct mental model is:

```
vault/web/  ──(staging deploy)──►  ~/code/vacation-dashboard-dev  ──(push)──►  staging site
                                   ~/code/vacation-dashboard-dev  ──(production deploy)──►  ~/code/vacation-dashboard  ──(push)──►  production site
```

The staging repo is the promotion source for production — not the vault.

## The current rsync block (lines 82–88 in the file as of this writing)

```bash
# ============================================================
# RSYNC
# ============================================================
echo ""
echo "=== rsync vault/web/ → $TARGET ==="
rsync -av --delete \
  --exclude=".git" \
  --exclude="DESIGN.md" \
  --exclude="CNAME" \
  "$VAULT/web/" "$DEST/"
```

This single block runs for both `staging` and `production`. `$DEST` is set earlier in the arguments block:
- `staging`    → `$DEST = $STAGING_LOCAL`  = `/Users/alex/code/vacation-dashboard-dev`
- `production` → `$DEST = $PRODUCTION_LOCAL` = `/Users/alex/code/vacation-dashboard`

The variables you will need (already declared at the top of the script):

| Variable          | Value                                          |
|-------------------|------------------------------------------------|
| `$VAULT`          | `/Users/alex/vaults/Vacation/Branson 2026`     |
| `$STAGING_LOCAL`  | `/Users/alex/code/vacation-dashboard-dev`      |
| `$PRODUCTION_LOCAL` | `/Users/alex/code/vacation-dashboard`        |

## Required fix

Replace the single shared rsync block with a branch that selects the correct source directory per target:

- **Staging path** (unchanged): source = `$VAULT/web/`, dest = `$STAGING_LOCAL`
- **Production path** (new): source = `$STAGING_LOCAL/`, dest = `$PRODUCTION_LOCAL`

The production rsync must exclude `.git` and `CNAME` (same as current). Including `--exclude="DESIGN.md"` in the production branch is harmless (DESIGN.md is unlikely to be in the staging repo) but is not required; omitting it from the production branch is acceptable. Do not remove it from the staging branch.

A comment and/or echo that makes the source → destination relationship explicit for future readers is required (acceptance criterion 5).
</background>

<rules>
1. Edit ONLY `scripts/deploy.sh`. Touch no other file — not CLAUDE.md, not any HTML, not any Python script.
2. Do NOT run `generate_dashboard.py` or `generate_attractions.py` — they are permanently frozen and will destroy hand-edited HTML.
3. Do NOT commit, push, or execute `deploy.sh` itself.
4. Do not alter the staging rsync in any way — its source (`$VAULT/web/`), destination (`$DEST/`), flags, or excludes must remain byte-for-byte identical to the current script.
5. The production rsync must use `$STAGING_LOCAL/` as its source directory (trailing slash required for rsync directory-content semantics). Its destination remains `$DEST/` (which resolves to `$PRODUCTION_LOCAL` at runtime).
6. Excludes for the production rsync must include at minimum `--exclude=".git"` and `--exclude="CNAME"`.
7. The echo label for the rsync step must be updated to reflect the actual source and destination being used (not the old generic `vault/web/ → $TARGET` string). Use separate echo lines for staging and production to make the data flow unambiguous.
8. All other sections of `deploy.sh` — variable declarations, token extraction, safety check, export data, CNAME check, path fix, cache bust, commit, and push — must remain completely unchanged.
9. Do not run Playwright tests. Do not run any Python tests. Skip all test verification.
10. Do not modify any file not explicitly named in this task. If you spot anything outside `deploy.sh` that looks wrong, flag it in the handback report and leave it alone.
</rules>

<procedure>
Step 1: Read the full contents of `/Users/alex/vaults/Vacation/Branson 2026/scripts/deploy.sh` to confirm the exact current text of the rsync block and surrounding context before touching anything.

Step 2: Locate the rsync section. It is identified by the banner comment `# RSYNC` and the `rsync -av --delete` call that references `"$VAULT/web/" "$DEST/"` as source and destination.

Step 3: Verify that `$STAGING_LOCAL` is declared near the top of the file (it should resolve to `/Users/alex/code/vacation-dashboard-dev`). Confirm `$DEST` in the production path resolves to `$PRODUCTION_LOCAL` (`/Users/alex/code/vacation-dashboard`).

Step 4: Replace the single rsync block (the `echo`, the `rsync` call, and its continuation lines) with an `if/else` block:
  - `if [[ "$TARGET" == "staging" ]]` branch: original rsync from `$VAULT/web/` unchanged.
  - `else` (production) branch: rsync from `$STAGING_LOCAL/` to `$DEST/` with `--exclude=".git"` and `--exclude="CNAME"`. Include a comment on the line immediately before or after the `rsync` call that reads something like: `# Source: staging repo ($STAGING_LOCAL)  Dest: production repo ($DEST)` — the exact wording is up to you, but the intent must be clear.

Step 5: Re-read the modified file in full to confirm:
  - The staging branch is bit-for-bit identical to the original rsync block (only wrapped in an if branch).
  - The production branch sources from `$STAGING_LOCAL/`.
  - No other lines in the file were disturbed.

Step 6: Run `bash -n scripts/deploy.sh` (syntax check only, no execution) to verify no syntax errors were introduced.

Step 7: Run `grep -n "rsync" scripts/deploy.sh` and confirm that `$STAGING_LOCAL` appears as a source argument in the production branch.
</procedure>

<example>
BEFORE (current rsync block, lines ~82–88):

```bash
# ============================================================
# RSYNC
# ============================================================
echo ""
echo "=== rsync vault/web/ → $TARGET ==="
rsync -av --delete \
  --exclude=".git" \
  --exclude="DESIGN.md" \
  --exclude="CNAME" \
  "$VAULT/web/" "$DEST/"
```

AFTER (correct fix — staging unchanged, production uses staging repo as source):

```bash
# ============================================================
# RSYNC
# ============================================================
echo ""
if [[ "$TARGET" == "staging" ]]; then
  echo "=== rsync vault/web/ → staging repo ($STAGING_LOCAL) ==="
  rsync -av --delete \
    --exclude=".git" \
    --exclude="DESIGN.md" \
    --exclude="CNAME" \
    "$VAULT/web/" "$DEST/"
else
  # Production promote: source is the staging repo, NOT vault/web/
  # This ensures files committed to staging (but not yet in vault) are included.
  # Source: $STAGING_LOCAL (/Users/alex/code/vacation-dashboard-dev)
  # Dest:   $DEST          (/Users/alex/code/vacation-dashboard)
  echo "=== rsync staging repo → production repo ==="
  echo "    source: $STAGING_LOCAL/"
  echo "    dest:   $DEST/"
  rsync -av --delete \
    --exclude=".git" \
    --exclude="CNAME" \
    "$STAGING_LOCAL/" "$DEST/"
fi
```

Note: the exact echo wording, the presence/absence of `--exclude="DESIGN.md"` in the production branch, and the exact comment text are all at your discretion — what matters is that the rsync source and destination are accurate and readable. The staging branch must not deviate from the BEFORE block in any way.
</example>

<acceptance_criteria>
The edit is correct if and only if ALL of the following hold:

1. `deploy.sh staging` behavior is completely unchanged — rsync source is `$VAULT/web/`, destination is `$STAGING_LOCAL` (`/Users/alex/code/vacation-dashboard-dev`).

2. `deploy.sh production` rsync uses `$STAGING_LOCAL/` (`/Users/alex/code/vacation-dashboard-dev/`) as its source and `$DEST/` (`/Users/alex/code/vacation-dashboard/`) as its destination.

3. The production rsync excludes at minimum `.git` and `CNAME`.

4. All post-rsync steps (CNAME check, path fix, cache bust, commit, push) remain in place and unchanged for both targets.

5. The script contains a comment or echo line that makes the source → destination relationship of the production rsync unambiguous to a reader who has not seen this task brief.

6. `bash -n scripts/deploy.sh` exits 0 (no syntax errors).

7. `grep -n "rsync" scripts/deploy.sh` output shows `$STAGING_LOCAL` appearing as a source argument in the production branch (i.e., `"$STAGING_LOCAL/" "$DEST/"` or equivalent with the full path literal).

8. Only `scripts/deploy.sh` was modified. `git diff --name-only` (if the vault is a git repo) or a directory listing must show no other changed files.
</acceptance_criteria>

<output_format>
Begin your handback report with this exact structure — no preamble before it:

**Files modified:**
- `scripts/deploy.sh` — [one-line description of what changed and on which approximate lines]

**Verification:**
- `bash -n scripts/deploy.sh` output: [paste result]
- `grep -n "rsync" scripts/deploy.sh` output: [paste full output]

**Assumptions / judgment calls:**
[List anything you decided that was not explicitly specified — e.g., whether to include `--exclude="DESIGN.md"` in the production branch, exact echo wording, etc.]

Stop there. Do not run git, do not push, do not run `deploy.sh`, do not update any log files.
</output_format>

<reminder>
- Do not invent or assume anything not explicitly present in the file you read.
- The file as of this writing uses `$VAULT/web/` as the rsync source for BOTH targets. If you read the file and find the production branch already sources from `$STAGING_LOCAL`, describe that discrepancy and do not make any change.
- If the actual file differs from the code block shown in the example (e.g., the rsync excludes differ, the banner comments differ, there are extra lines), describe the discrepancy explicitly and adapt the fix to what is actually there — do not blindly paste the example.
- Cite the file and line numbers you modified in your handback report.
- The trailing slash on `$STAGING_LOCAL/` in the rsync source is load-bearing: without it, rsync copies the directory itself rather than its contents.
</reminder>
