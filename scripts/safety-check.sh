#!/usr/bin/env bash
# safety-check.sh -- Run all pre-deploy safety checks from vault root
# Called by deploy.sh and can be run standalone before any Lazlo commit.
#
# Usage:
#   bash scripts/safety-check.sh
#
# Exits 0 if all checks pass. Exits 1 on first failure with a clear message.

set -e
VAULT="/Users/alex/vaults/Vacation/Branson 2026"
cd "$VAULT"

fail() {
  echo "FAIL: $1 (got $2, expected $3 $4)"
  exit 1
}

echo "=== Safety checks ==="

c=$(grep -c 'pointerdown' "web/quick-pick.html")
[[ "$c" -eq 1 ]] || fail "pointerdown in quick-pick.html" "$c" "==" 1

c=$(grep -c 'fetch.*data.json' "web/attractions.html")
[[ "$c" -ge 1 ]] || fail "fetch data.json in attractions.html" "$c" ">=" 1

c=$(grep -c 'fetch.*help.json' "web/help.html")
[[ "$c" -eq 1 ]] || fail "fetch help.json in help.html" "$c" "==" 1

c=$(grep -c 'fetch.*schedule.json' "web/event-timeline.html")
[[ "$c" -ge 1 ]] || fail "fetch schedule.json in event-timeline.html" "$c" ">=" 1

c=$(grep -c 'fetch.*schedule.json' "web/index.html")
[[ "$c" -ge 1 ]] || fail "fetch schedule.json in index.html" "$c" ">=" 1

c=$(grep -ic 'filter-popover\|filter-toggle\|vacdash:v1:filter' "web/attractions.html" || true)
[[ "$c" -eq 0 ]] || fail "dead filter refs in attractions.html" "$c" "==" 0

echo "All safety checks passed."
