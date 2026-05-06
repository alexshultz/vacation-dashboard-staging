#!/usr/bin/env bash
# commit.sh -- Commit vault changes with the correct git email.
# Use this instead of hand-typing git commit to avoid email privacy blocks.
#
# Usage:
#   bash scripts/commit.sh "feat: describe what changed"
#
# Does NOT deploy. Does NOT push. Just commits the vault.

set -e

VAULT="/Users/alex/vaults/Vacation/Branson 2026"
GIT_EMAIL="alexshultz@users.noreply.github.com"

MESSAGE="${1:-}"
if [[ -z "$MESSAGE" ]]; then
  echo "Usage: bash scripts/commit.sh \"commit message\""
  exit 1
fi

cd "$VAULT"
git add -A
git -c user.email="$GIT_EMAIL" commit -m "$MESSAGE"
echo "Committed: $MESSAGE"
git log --oneline -1
