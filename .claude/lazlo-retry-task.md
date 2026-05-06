<role>
You are an expert shell script engineer. Your goal is to modify exactly one file — `scripts/lazlo.sh` — so that it survives `overloaded_error` responses from the Anthropic API by extracting the Claude Code session ID from the JSON output and retrying with exponential backoff and full jitter, indefinitely, until the session succeeds or the user kills the process manually.
</role>

<static_background>
## Environment
- Vault root: `/Users/alex/vaults/Vacation/Branson 2026/`
- Target file: `scripts/lazlo.sh` (relative to vault root — full path: `/Users/alex/vaults/Vacation/Branson 2026/scripts/lazlo.sh`)
- Output JSON file pattern: `/tmp/lazlo-<brief-name>.json`
- Shell: bash (confirm shebang before assuming)

## Key behavioral facts you MUST understand before writing a single line
1. `set -e` is already in the script. Any unhandled non-zero exit will kill the process immediately. The retry wrapper must either (a) disable `set -e` around the retry loop, or (b) use a subshell / `|| true` construction so `set -e` never sees a failure inside the loop.
2. The `claude` CLI exits with code **0** even when `overloaded_error` occurs. Detection MUST parse the JSON body — never rely on the exit code.
3. The session ID for `--resume` lives inside the output JSON file. Before each retry, the script must read the already-written file to extract it.
4. Each retry must **append** to the same JSON file (not overwrite), so the full session history accumulates.
5. On eventual success, execution must fall through to the existing `lazlo-check.sh` call that already exists at the end of the script — do not remove or skip it.

## Retry algorithm — implement exactly as specified
- Formula: `sleep = random(0, min(90, 5 * 2^attempt))` seconds (integer or float both acceptable)
- "Full jitter" means: pick a RANDOM value between 0 and the cap — NOT the cap itself every time
- No hard retry limit — loop forever until success or SIGINT/SIGTERM
- After exactly 50 retries, print ONCE to stdout (never repeat this message):
  `Still retrying (attempt N) -- Anthropic API overloaded. Running since [start time]. Kill this process manually to stop.`
  where `[start time]` is the wall-clock time when the script first started.
</static_background>

<uncertainty_handling>
## Before writing any code — read the file first
DO NOT invent the current contents of `scripts/lazlo.sh`. Read it with:
```
cat "/Users/alex/vaults/Vacation/Branson 2026/scripts/lazlo.sh"
```
Then answer these questions internally before proceeding:
- What exact variable holds the JSON output file path?
- What exact flags are passed to the `claude` CLI invocation?
- Where exactly in the script does the `claude` call appear?
- Where exactly does the `lazlo-check.sh` call appear?
- Is `jq` available, or must you use `python3`/`grep` for JSON parsing? (Check with `which jq`.)
- What is the exact session ID field name in the JSON? (If uncertain, look at a sample output file in `/tmp/` matching `lazlo-*.json`, or inspect the Anthropic CLI docs. Do NOT guess the field name.)

If you cannot determine the session ID field name from the existing file or a sample, STOP and state that explicitly rather than inventing a field name.
</uncertainty_handling>

<order_of_analysis>
## Execute in this exact order — do not skip steps

1. **Read the target file** — `cat` the full contents of `scripts/lazlo.sh`. Do not proceed until you have the actual content.
2. **Identify JSON field for session ID** — inspect a `/tmp/lazlo-*.json` file if one exists, or search the script for any existing session-ID handling. If none found, use `jq 'keys'` on a sample file to discover the real field name.
3. **Identify JSON field for error type** — confirm the exact key that holds `overloaded_error` (e.g., `.type`, `.error.type`, etc.) by inspecting a real output file. Do not guess.
4. **Confirm `jq` availability** — run `which jq`. If absent, plan a `python3 -c` fallback for JSON parsing.
5. **Plan the patch** — mentally outline what changes are needed: where `set -e` handling changes, where the retry loop wraps the existing `claude` call, where the backoff/jitter math goes, where the 50-retry warning goes, where the success-path fallthrough to `lazlo-check.sh` is preserved.
6. **Write the patch** — make the smallest possible diff that satisfies all acceptance criteria. Preserve all existing logic outside the retry wrapper.
7. **Self-review** — re-read the modified file in full and verify against every acceptance criterion before declaring done.
8. **Run scope guard** — as specified below.
</order_of_analysis>

<acceptance_criteria>
Every item below must be satisfied. Check each one explicitly in step 7:

- [ ] On `overloaded_error` in the JSON output, the script does NOT exit; it retries.
- [ ] Retry uses `claude --resume <session-id>` with the same flags and the same output file.
- [ ] Session ID is extracted by reading the existing output JSON file before each retry.
- [ ] Each retry appends to the same JSON file; no prior output is lost.
- [ ] Backoff formula: `sleep = random(0, min(90, 5 * 2^attempt))` — full jitter, not fixed cap.
- [ ] No hard retry limit; loop runs until success or manual kill.
- [ ] After attempt 50 (and only after 50, and only once), the warning message is printed to stdout with the correct attempt number and start time.
- [ ] On success (no `overloaded_error` in JSON), execution continues to `lazlo-check.sh` call normally.
- [ ] `set -e` behavior is not broken for any other error path in the script.
- [ ] No files other than `scripts/lazlo.sh` are modified.
</acceptance_criteria>

## Scope Guard
When all code changes are complete, run: git diff --name-only
If any file outside the explicitly named scope appears in this diff, STOP and revert it with `git checkout <file>` before listing files modified.

<hallucination_guard>
## Final reminder before writing any code
- Do NOT invent JSON field names. Read an actual output file.
- Do NOT invent variable names from `lazlo.sh`. Read the actual file.
- Do NOT assume `jq` is installed. Verify it.
- Do NOT assume the session ID field is called `session_id`. Confirm it from a real JSON file.
- If any fact is ambiguous after reading real files, state the ambiguity explicitly and make a conservative choice, noting it as an assumption.
- Every line of shell you write must be valid bash. Test mentally against `bash -n` before finalizing.
</hallucination_guard>

<output_format>
When all code changes are complete, list every file modified with a one-line description. Note any assumptions or judgment calls. STOP -- do not commit, push, copy files, or update logs.
</output_format>
