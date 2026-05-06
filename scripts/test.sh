#!/usr/bin/env bash
# test.sh -- Run the Playwright E2E suite against staging.
#
# Usage:
#   bash scripts/test.sh                        # run full suite
#   bash scripts/test.sh smoke                  # run single spec (no .spec.js suffix needed)
#   bash scripts/test.sh admin-auth             # run single spec
#   bash scripts/test.sh --headed               # run full suite headed (visible browser)
#
# BASE_URL defaults to staging (vacation-dev.creeperbomb.com).
# Override for local testing:
#   BASE_URL=http://localhost:8080 bash scripts/test.sh

set -e

VAULT="/Users/alex/vaults/Vacation/Branson 2026"
E2E_DIR="$VAULT/tests/e2e"

if [[ ! -d "$E2E_DIR/node_modules" ]]; then
  echo "Error: node_modules not found. Run: cd $E2E_DIR && npm install"
  exit 1
fi

cd "$E2E_DIR"

SPEC="${1:-}"
EXTRA_FLAGS=""

# If argument is a known flag, pass it through
if [[ "$SPEC" == --* ]]; then
  EXTRA_FLAGS="$SPEC"
  SPEC=""
fi

if [[ -n "$SPEC" ]]; then
  # Accept spec name with or without .spec.js suffix
  SPEC_FILE="tests/${SPEC%.spec.js}.spec.js"
  if [[ ! -f "$SPEC_FILE" ]]; then
    echo "Error: spec not found: $SPEC_FILE"
    echo "Available specs:"
    ls tests/*.spec.js | sed 's|tests/||'
    exit 1
  fi
  echo "=== Running spec: $SPEC_FILE ==="
  npx playwright test "$SPEC_FILE" $EXTRA_FLAGS
else
  echo "=== Running full Playwright suite ==="
  npx playwright test $EXTRA_FLAGS
fi
