#!/usr/bin/env bash
# lazlo-check.sh -- Validate and display output from a Lazlo run.
#
# Usage:
#   bash scripts/lazlo-check.sh <brief-name>
#
# Reads /tmp/lazlo-<brief-name>.json and prints:
#   - subtype (success / error)
#   - is_error flag
#   - turn count and cost
#   - result text (truncated to 4000 chars for readability)
#   - PASS or FAIL verdict
#
# Exit code: 0 = success, 1 = error or not-logged-in

set -e

BRIEF="${1:-}"
if [[ -z "$BRIEF" ]]; then
  echo "Usage: bash scripts/lazlo-check.sh <brief-name>"
  exit 1
fi

OUT_JSON="/tmp/lazlo-${BRIEF}.json"
if [[ ! -f "$OUT_JSON" ]]; then
  echo "Error: output file not found: $OUT_JSON"
  echo "Run 'bash scripts/lazlo.sh run $BRIEF' first."
  exit 1
fi

python3 - "$OUT_JSON" <<'EOF'
import json, sys

path = sys.argv[1]
with open(path) as f:
    raw = f.read().strip()

# Handle NDJSON (take first line)
try:
    data = json.loads(raw.split('\n')[0])
except json.JSONDecodeError as e:
    print(f"ERROR: Could not parse JSON from {path}: {e}")
    sys.exit(1)

subtype  = data.get('subtype', 'UNKNOWN')
is_error = data.get('is_error', True)
turns    = data.get('num_turns', '?')
cost     = data.get('total_cost_usd', 0)
result   = data.get('result', '')

print(f"subtype  : {subtype}")
print(f"is_error : {is_error}")
print(f"turns    : {turns}")
print(f"cost     : ${cost:.4f}")
print()

if 'Not logged in' in result or 'not logged in' in result.lower():
    print("FAIL -- Lazlo returned 'Not logged in'. API key extraction failed.")
    sys.exit(1)

if subtype != 'success' or is_error:
    print("FAIL -- Lazlo did not complete successfully.")
    print()
    print(result[:4000])
    sys.exit(1)

print("PASS")
print()
print(result[:4000])
if len(result) > 4000:
    print(f"\n... ({len(result) - 4000} chars truncated) ...")
EOF
