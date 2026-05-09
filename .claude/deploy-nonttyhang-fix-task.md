<task>
You are a shell script engineer. Your sole goal is to make a single, targeted edit to `scripts/deploy.sh` so that the production confirmation prompt gracefully skips when stdin is not a terminal (non-TTY), instead of blocking forever.
</task>

<background>
Project root: `/Users/alex/vaults/Vacation/Branson 2026`
Script to edit: `/Users/alex/vaults/Vacation/Branson 2026/scripts/deploy.sh`

The script deploys a static site to either staging or production. When `TARGET=production`, it currently prints a warning and calls `read -r` to wait for the user to press Enter before proceeding. This `read -r` hangs indefinitely when the script is invoked in a non-TTY context (background process, piped stdin, cron, CI), because there is no terminal attached to stdin.

The relevant code block that must be changed (and only this block):

```bash
if [[ "$TARGET" == "production" ]]; then
  DEST="$PRODUCTION_LOCAL"
  REPO="$PRODUCTION_REPO"
  CNAME="$PRODUCTION_CNAME"
  COMMIT_PREFIX="promote"
  echo ""
  echo "⚠️  PRODUCTION deploy to vacation.creeperbomb.com"
  echo "   Description: $DESCRIPTION"
  echo "   Press Enter to continue, Ctrl+C to abort."
  read -r
```

The bash idiom for detecting whether stdin is a terminal is:
```bash
if [ -t 0 ]; then
  # stdin is a terminal -- interactive, prompt the user
else
  # stdin is not a terminal -- non-TTY, auto-confirm
fi
```
</background>

<rules>
1. Edit ONLY `scripts/deploy.sh`. Touch no other file.
2. Do NOT commit, push, or execute the script.
3. Do NOT modify `generate_dashboard.py` or `generate_attractions.py` -- they are permanently frozen.
4. When stdin IS a terminal (`[ -t 0 ]` is true): the existing prompt behavior must be completely unchanged -- print the warning, print the description, print "Press Enter to continue, Ctrl+C to abort.", and call `read -r`.
5. When stdin is NOT a terminal (`[ -t 0 ]` is false): print a clear auto-confirm message (e.g., `"   Auto-confirming: stdin is not a terminal."`) and proceed immediately without calling `read -r`.
6. All variable assignments (`DEST`, `REPO`, `CNAME`, `COMMIT_PREFIX`) must remain unconditional -- they must execute regardless of TTY state, exactly as they do today.
7. Do not run Playwright tests. Do not run any Python tests. Skip all test verification.
8. No other behavior of `deploy.sh` changes.
9. Do not modify any HTML element not explicitly named in this task. If you encounter anything outside deploy.sh that looks unused or redundant, flag it in the handback report. Do not remove it.
</rules>

<procedure>
Step 1: Read the full contents of `/Users/alex/vaults/Vacation/Branson 2026/scripts/deploy.sh` to understand its complete structure before touching anything.
Step 2: Locate the exact `if [[ "$TARGET" == "production" ]]; then` block identified above.
Step 3: Verify that the `read -r` line appears inside that block and that the variable assignments (`DEST`, `REPO`, `CNAME`, `COMMIT_PREFIX`) precede the echo/read lines.
Step 4: Apply the minimal diff: wrap only the `echo` + `read -r` lines (not the variable assignments) in a `[ -t 0 ]` check -- interactive branch keeps existing behavior, non-interactive branch prints an auto-confirm message and skips `read -r`.
Step 5: Re-read the modified file to confirm the edit is syntactically correct and no other lines were disturbed.
Step 6: Run `bash -n scripts/deploy.sh` to verify no syntax errors.
</procedure>

<example>
BEFORE (the production block):
```bash
if [[ "$TARGET" == "production" ]]; then
  DEST="$PRODUCTION_LOCAL"
  REPO="$PRODUCTION_REPO"
  CNAME="$PRODUCTION_CNAME"
  COMMIT_PREFIX="promote"
  echo ""
  echo "⚠️  PRODUCTION deploy to vacation.creeperbomb.com"
  echo "   Description: $DESCRIPTION"
  echo "   Press Enter to continue, Ctrl+C to abort."
  read -r
```

AFTER (correct fix -- variable assignments untouched, prompt gated on TTY):
```bash
if [[ "$TARGET" == "production" ]]; then
  DEST="$PRODUCTION_LOCAL"
  REPO="$PRODUCTION_REPO"
  CNAME="$PRODUCTION_CNAME"
  COMMIT_PREFIX="promote"
  echo ""
  echo "⚠️  PRODUCTION deploy to vacation.creeperbomb.com"
  echo "   Description: $DESCRIPTION"
  if [ -t 0 ]; then
    echo "   Press Enter to continue, Ctrl+C to abort."
    read -r
  else
    echo "   Auto-confirming: stdin is not a terminal."
  fi
```
</example>

<acceptance_criteria>
The edit is correct if and only if all three conditions hold:
1. `bash scripts/deploy.sh production "test"` run interactively still prints the warning and waits for Enter.
2. `echo "" | bash scripts/deploy.sh production "test"` does NOT hang -- it prints the auto-confirm message and continues.
3. No other logic, variable, or flow in `deploy.sh` is altered.
</acceptance_criteria>

<output_format>
Begin your response with this exact structure -- no preamble before it:

**Files modified:**
- `scripts/deploy.sh` -- [one-line description of what changed]

Then list any assumptions or judgment calls.

Stop there. Do not run git, do not push, do not update logs.
</output_format>

<reminder>
- Do not invent or assume anything not explicitly present in the inputs or the file you read.
- If the actual file differs from the code block shown above (e.g., the `read -r` is structured differently, or there are additional lines), describe the discrepancy explicitly and adapt the fix to match what is actually there -- do not blindly apply the example.
- If you are uncertain between two valid approaches, list both with tradeoffs rather than silently choosing one.
- Cite file and approximate line number when describing what you changed.
</reminder>
