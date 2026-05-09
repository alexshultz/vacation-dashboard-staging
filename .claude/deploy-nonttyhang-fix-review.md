# Code Review: deploy-nonttyhang-fix

You are a cold code reviewer. You have NO context from the agent that wrote this change.

## Your job

Review the diff below for correctness, completeness, and hidden risks. Do NOT approve just because it compiles or passes syntax. Flag any real issues as FAIL. Flag minor concerns as WARN. If the change is clean, return PASS.

## The diff

```diff
diff --git a/scripts/deploy.sh b/scripts/deploy.sh
index 76786ad..ea938d2 100755
--- a/scripts/deploy.sh
+++ b/scripts/deploy.sh
@@ -41,8 +41,12 @@ if [[ "$TARGET" == "production" ]]; then
   echo ""
   echo "⚠️  PRODUCTION deploy to vacation.creeperbomb.com"
   echo "   Description: $DESCRIPTION"
-  echo "   Press Enter to continue, Ctrl+C to abort."
-  read -r
+  if [ -t 0 ]; then
+    echo "   Press Enter to continue, Ctrl+C to abort."
+    read -r
+  else
+    echo "   Auto-confirming: stdin is not a terminal."
+  fi
 else
   DEST="$STAGING_LOCAL"
   REPO="$STAGING_REPO"
```

## Context

- `scripts/deploy.sh` deploys a static site to staging or production (GitHub Pages).
- The `if [[ "$TARGET" == "production" ]]; then` block runs only when deploying to production.
- Variable assignments (`DEST`, `REPO`, `CNAME`, `COMMIT_PREFIX`) happen earlier in this same block, before the echo/read lines shown in the diff -- they are NOT inside the TTY check.
- The fix goal: when stdin is not a terminal (background process, piped stdin), skip the blocking `read -r` and auto-confirm. When stdin IS a terminal, keep the original interactive prompt unchanged.

## What to check

1. Is `[ -t 0 ]` the correct bash idiom for detecting a terminal on stdin?
2. Are the variable assignments (`DEST`, `REPO`, `CNAME`, `COMMIT_PREFIX`) guaranteed to execute regardless of TTY state? (They must -- the rest of the script depends on them.)
3. Is the non-TTY message clear enough that a human reading logs will understand what happened?
4. Any edge cases: what if stdin is /dev/null? What if run via `ssh`? What if run from a CI system?
5. Any risk of the auto-confirm path silently proceeding when a human INTENDED to be prompted?

## Output format

Start your response with exactly one of: PASS / WARN / FAIL

Then explain your verdict. Be specific. If WARN or FAIL, cite the exact line and issue.
