# Agent Setup Gaps & Conflicts
*Last updated: 2026-04-27 | Author: vacation-coordinator*

## Overview

Gaps and conflicts identified during cold-start skill load on 2026-04-27. Use this to prioritize SOUL.md and skill patches before or after launch. All items were surfaced by comparing SOUL.md (authoritative), loaded skills, and memory notes at session start.

---

## GAP 1 -- Critical: SOUL.md Lazlo Invocation Missing ANTHROPIC_API_KEY

**Severity:** High -- causes silent auth failure
**Status:** Open

**Description:**
The lazlo invocation template in SOUL.md jumps directly to `export PATH` and calls `claude`. The `branson-lazlo-delegation` skill correctly extracts and exports `ANTHROPIC_API_KEY` first via absolute path before the `claude` call. Following SOUL.md literally results in silent auth failure -- lazlo runs, exits 0, and returns "Not logged in" with no error code.

The root cause is the sandboxed `~` in terminal sessions. `~/.hermes/.env` does not resolve to `/Users/alex/.hermes/.env` in that context. The absolute path grep is required.

**Conflict between:**
- SOUL.md (Coding Delegation Rules, Step 3) -- missing key extraction
- `branson-lazlo-delegation` skill -- correct, includes extraction
- Memory note -- confirms absolute path required, sandboxed `~` is the pitfall

**Correct invocation (from `branson-lazlo-delegation` skill):**
```bash
ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' /Users/alex/.hermes/.env | cut -d'=' -f2) && \
export ANTHROPIC_API_KEY && \
export PATH='/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/alex/.local/bin' && \
cd "/Users/alex/vaults/Vacation/Branson 2026" && \
claude --dangerously-skip-permissions \
  -p 'Read .claude/<task-name>-task.md. Grill-Me review is complete -- proceed to full implementation.' \
  --max-turns 100 --output-format json > /tmp/lazlo-output.json 2>/tmp/stderr.log
```

**Resolution:** Patch SOUL.md Coding Delegation Rules Step 3 to prepend ANTHROPIC_API_KEY extraction before the PATH export line.

---

## GAP 2 -- Behavioral Conflict: Grill-Me File Location

**Severity:** Medium -- Alex misses grill-me reviews if written to hidden folder
**Status:** Open

**Description:**
SOUL.md says to write the grill-me Q&A to `.claude/<task>-grillme.md`. But `.claude/` is hidden from Obsidian's file explorer by default (Obsidian excludes dot-folders). Alex reviews grill-me docs in Obsidian -- writing them to a hidden folder makes them invisible to the reviewer, defeating the entire purpose of the grill-me step.

The correct location is `grill-me docs/<task>-grillme.md`, which IS Obsidian-visible.

**Conflict between:**
- SOUL.md Coding Delegation Rules Step 2 -- says `.claude/<task>-grillme.md` (wrong)
- Memory note -- says `grill-me docs/` (correct)
- `branson-lazlo-delegation` skill -- says `grill-me docs/` (correct)
- `grill-me` skill -- says `.claude/<task>-grillme.md` (wrong, mirrors SOUL.md stale state)

**Resolution:**
1. Patch SOUL.md Step 2: change `.claude/<task>-grillme.md` to `grill-me docs/<task>-grillme.md`
2. Patch `grill-me` skill: same location fix in the Vacation-Coordinator workflow section

Note: `branson-lazlo-delegation` skill is already correct on this point.

---

## GAP 3 -- `grill-me` Skill Stale File Location

**Severity:** Low-Medium -- duplicate of GAP 2 in a different file
**Status:** Open

**Description:**
The `grill-me` skill's Vacation-Coordinator workflow section (step 3) still reads:
> "Vacation writes the Q&A to `.claude/<task-name>-grillme.md` in Obsidian"

Since `.claude/` is hidden from Obsidian, this is internally contradictory. The skill should point to `grill-me docs/<task-name>-grillme.md`.

**Resolution:** One-line patch to `grill-me` skill. Patch SOUL.md first (GAP 2), then keep the skill in sync with the updated SOUL.md language.

---

## GAP 4 -- Council of Minds Provider Readiness Not Verified

**Severity:** Medium -- Council fails silently at Step 3.5 quorum gate if any provider is down
**Status:** Unknown -- not verified this session

**Description:**
`local-council-of-minds` v2.1.0 uses four providers: Anthropic (Explorer + Skeptic + Refiner), xAI (Verifier, grok-4.20), Google (Weaver, gemini-2.5-pro), and OpenAI (Archivist, gpt-4o). The skill itself warns: "Verify OpenAI is configured in `~/.hermes/config.yaml` before first Council run using this role."

OpenAI (Archivist) and xAI (Verifier) have not been confirmed active in config.yaml this session. If either provider is missing, that role returns empty -- and since the quorum requirement is 100%, the Refiner never fires. There is no loud failure, just a silent halt at Step 3.5.

**Verification steps:**
```bash
grep -i 'openai\|gpt' /Users/alex/.hermes/config.yaml
grep -i 'xai\|grok' /Users/alex/.hermes/config.yaml
grep -i 'google\|gemini' /Users/alex/.hermes/config.yaml
```

**Resolution:** Run the three greps. Flag any missing provider before the next Council invocation. If a provider is absent, register it in config.yaml or use the fallback model substitution documented in the skill (Step 3.5).

---

## GAP 5 -- Staging Repo Existence Unknown

**Severity:** Low (pre-May 8) / Medium (post-May 8)
**Status:** Unknown -- not verified

**Description:**
`branson-lazlo-delegation` skill and SOUL.md both define:
```
STAGING="/Users/alex/code/vacation-dashboard-staging"
```

The deploy rule states: "Before May 8, production and staging can stay in sync." After May 8, all new feature work must deploy to staging first, then promote to production after verification. Whether this directory exists and is a properly configured git repo has not been confirmed.

If the staging repo does not exist on May 8, the post-launch deploy workflow breaks on first use.

**Verification step:**
```bash
ls -la /Users/alex/code/vacation-dashboard-staging
```

**Resolution:** Confirm the path exists and is a git repo cloned from the production previews repo. If not, create and configure before May 8.

---

## Summary Table

| # | Gap | Severity | Status | Action Required |
|---|-----|----------|--------|-----------------|
| 1 | SOUL.md lazlo invocation missing ANTHROPIC_API_KEY | **High** | Open | Patch SOUL.md Step 3 |
| 2 | Grill-me file location conflict (SOUL.md vs memory/skill) | **Medium** | Open | Patch SOUL.md Step 2 + `grill-me` skill |
| 3 | `grill-me` skill stale file location | Low-Medium | Open | Patch `grill-me` skill (after GAP 2) |
| 4 | Council providers (OpenAI/xAI) not verified in config.yaml | **Medium** | Unknown | Run config greps before next Council run |
| 5 | Staging repo path not confirmed | Low / Medium post-launch | Unknown | `ls` check, create if absent before May 8 |

---

## Notes

- GAPs 1-3 are SOUL.md and/or skill writes. Together they touch SOUL.md + two skills = multi-file = T2. They should be batched as a single T2 operation.
- GAP 4 is read-only verification -- T1.
- GAP 5 is read-only verification -- T1. Creation of the staging repo (if needed) is a new integration -- T3.
- SOUL.md is the definitive source per project rules. For GAP 1, the skill is correct and SOUL.md needs the patch. For GAP 2, the memory note and `branson-lazlo-delegation` skill are demonstrably correct (writing to a hidden folder defeats the review step), so SOUL.md needs the patch there too.
- Prior version of this file was generated 2026-04-27 (earlier session). This version supersedes it.
