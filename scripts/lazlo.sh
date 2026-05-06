#!/usr/bin/env bash
# lazlo.sh -- Fire a Lazlo (Claude Code) task or code review.
#
# Usage:
#   bash scripts/lazlo.sh run <brief-name>      # runs .claude/<brief-name>-task.md
#   bash scripts/lazlo.sh review <brief-name>   # runs .claude/<brief-name>-review.md
#
# Output is written to /tmp/lazlo-<brief-name>.json
# Stderr is written to /tmp/lazlo-<brief-name>-stderr.log
#
# After it finishes, run:
#   bash scripts/lazlo-check.sh <brief-name>
# to validate the output.

set -e

VAULT="/Users/alex/vaults/Vacation/Branson 2026"
ENV_FILE="/Users/alex/.hermes/.env"

MODE="${1:-}"
BRIEF="${2:-}"

if [[ "$MODE" != "run" && "$MODE" != "review" ]]; then
  echo "Usage:"
  echo "  bash scripts/lazlo.sh run <brief-name>     # execute task"
  echo "  bash scripts/lazlo.sh review <brief-name>  # code review"
  exit 1
fi

if [[ -z "$BRIEF" ]]; then
  echo "Error: brief name required."
  echo "  bash scripts/lazlo.sh run <brief-name>"
  exit 1
fi

if [[ "$MODE" == "run" ]]; then
  BRIEF_FILE=".claude/${BRIEF}-task.md"
  PROMPT="Read .claude/${BRIEF}-task.md. Grill-Me review is complete -- proceed to full implementation."
else
  BRIEF_FILE=".claude/${BRIEF}-review.md"
  PROMPT="Read .claude/${BRIEF}-review.md and perform the review. Return your verdict and findings."
fi

OUT_JSON="/tmp/lazlo-${BRIEF}.json"
OUT_STDERR="/tmp/lazlo-${BRIEF}-stderr.log"

# Verify brief file exists
if [[ ! -f "$VAULT/$BRIEF_FILE" ]]; then
  echo "Error: brief file not found: $VAULT/$BRIEF_FILE"
  exit 1
fi

# Verify brief is not a stub (< 500 bytes = PE subagent stub failure)
SIZE=$(wc -c < "$VAULT/$BRIEF_FILE")
if [[ "$SIZE" -lt 500 ]]; then
  echo "Error: brief file looks like a stub ($SIZE bytes). Re-run prompt-engineer."
  exit 1
fi

echo "=== Lazlo: $MODE '$BRIEF' ==="
echo "Brief: $BRIEF_FILE ($SIZE bytes)"
echo "Output: $OUT_JSON"
echo ""

ANTHROPIC_API_KEY=$(sed -n 's/^ANTHROPIC_API_KEY=//p' "$ENV_FILE")
export ANTHROPIC_API_KEY
export PATH='/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/alex/.local/bin'

cd "$VAULT"
claude --dangerously-skip-permissions \
  -p "$PROMPT" \
  --max-turns 100 --output-format json \
  > "$OUT_JSON" 2>"$OUT_STDERR"

echo ""
echo "Lazlo finished. Run: bash scripts/lazlo-check.sh $BRIEF"
