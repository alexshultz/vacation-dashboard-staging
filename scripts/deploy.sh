#!/usr/bin/env bash
# deploy.sh -- Branson 2026 dashboard deploy script
#
# Usage:
#   bash scripts/deploy.sh staging  "description of what changed"
#   bash scripts/deploy.sh production  "description of what changed"
#
# Production requires pressing Enter to confirm before anything runs.

set -e

# ============================================================
# VARIABLES -- change here once if anything ever moves
# ============================================================
VAULT="/Users/alex/vaults/Vacation/Branson 2026"
STAGING_LOCAL="/Users/alex/code/vacation-dashboard-dev"
STAGING_REPO="alexshultz/vacation-dashboard-dev"
STAGING_CNAME="vacation-dev.creeperbomb.com"
PRODUCTION_LOCAL="/Users/alex/code/vacation-dashboard"
PRODUCTION_REPO="alexshultz/vacation-dashboard"
PRODUCTION_CNAME="vacation.creeperbomb.com"
GIT_EMAIL="alexshultz@users.noreply.github.com"
HTML_FILES="attractions.html shows.html index.html event-timeline.html people-timeline.html wishlist.html suggested.html profile.html quick-pick.html help.html admin.html admin-event-timeline.html"

# ============================================================
# ARGUMENTS
# ============================================================
TARGET="${1:-}"
DESCRIPTION="${2:-manual deploy}"

if [[ "$TARGET" != "staging" && "$TARGET" != "production" ]]; then
  echo "Usage: bash scripts/deploy.sh [staging|production] \"description\""
  exit 1
fi

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
else
  DEST="$STAGING_LOCAL"
  REPO="$STAGING_REPO"
  CNAME="$STAGING_CNAME"
  COMMIT_PREFIX="deploy"
fi

# ============================================================
# TOKEN (extracted safely -- base64 PATs contain = padding)
# ============================================================
TOKEN=$(sed -n 's/^GITHUB_TOKEN=//p' /Users/alex/.hermes/.env)
if [[ -z "$TOKEN" ]]; then
  echo "ERROR: GITHUB_TOKEN not found in /Users/alex/.hermes/.env"
  exit 1
fi

# ============================================================
# SAFETY CHECKS
# ============================================================
echo ""
bash "$VAULT/scripts/safety-check.sh"

# ============================================================
# EXPORT DATA
# ============================================================
echo ""
echo "=== Export data ==="
python3 "$VAULT/scripts/export_data.py"

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

# ============================================================
# CNAME -- verify, do not blindly overwrite
# ============================================================
echo ""
echo "=== CNAME check ==="
CURRENT_CNAME=$(cat "$DEST/CNAME" 2>/dev/null || echo "")
if [[ "$CURRENT_CNAME" != "$CNAME" ]]; then
  echo "CNAME mismatch (was: '$CURRENT_CNAME', correcting to: '$CNAME')"
  echo "$CNAME" > "$DEST/CNAME"
else
  echo "CNAME OK: $CNAME"
fi

# ============================================================
# PATH FIX
# ============================================================
echo ""
echo "=== Path fix ==="
cd "$DEST"
# shellcheck disable=SC2086
sed -i '' 's|../assets/thumbs/|assets/thumbs/|g' $HTML_FILES

# ============================================================
# CACHE BUST (must run from DEST)
# ============================================================
echo ""
echo "=== Cache bust ==="
python3 "$VAULT/scripts/cache_bust.py"

# ============================================================
# COMMIT + PUSH
# ============================================================
echo ""
echo "=== Commit and push ==="
git add -A
git -c user.email="$GIT_EMAIL" commit -m "$COMMIT_PREFIX: $DESCRIPTION"
git remote set-url origin "https://alexshultz:${TOKEN}@github.com/${REPO}.git"

if [[ "$TARGET" == "production" ]]; then
  git push --force origin main
else
  git push origin main
fi

echo ""
echo "=== Done: $TARGET deploy complete ==="
echo "    $COMMIT_PREFIX: $DESCRIPTION"
