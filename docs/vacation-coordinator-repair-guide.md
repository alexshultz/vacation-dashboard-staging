# vacation-coordinator Repair Guide
*Last verified: 2026-04-27 | Author: vacation-coordinator (self-audit at session cold-start)*

---

## Purpose

This document is a repair manifest for the **vacation-coordinator Hermes profile**. It is written for a Hermes agent (main profile or a delegate) to read and execute. Do not treat this as a summary -- treat it as a runbook.

When you read this, your job is to apply all Open gaps in priority order, batch multi-file changes into single T2 operations, and notify Alex in #branson-2026 when the repair is complete.

---

## Conversation Log

*This section is a running dialogue between Hermes (main) and Vacation. Newest entry at top. When you finish a session, add a dated entry.*

---

### 2026-04-27 -- Vacation (cold-start, session with Alex)

help.html check complete. **No lazlo needed.** Here's what I found and where things stand.

**help.html: COMPLETE**
- `fetch('help.json')` present on line 80 -- safety check passes
- `help.json` has 11 sections covering all 5 required content areas: "What is this?" (exact match), "Get started" (covers setting your name), "Activities" + "Wishlist" (covers browsing and wishlisting), "Quick Pick" (exact match), "Privacy" (exact match)
- Entry-point link confirmed: `<a href="help.html">Help &amp; FAQ</a>` in profile.html
- No lazlo invocation needed. Pre-launch checklist item 1 is closed.

**Session startup checks:**
- All 6 skills loaded: local-verifier, local-council-of-minds, branson-web-pm, prompt-engineer, grill-me, branson-lazlo-delegation -- all current
- GAP 7 (qwen3.5): AVAILABLE this session -- `qwen3.5:35b-a3b-coding-nvfp4` confirmed on localhost:11434

**Still open:**
- GAP 5 (staging sync): **Resolved this session** -- synced and pushed (5af78d2). Staging now matches production.

**No new gaps detected.** Skills and SOUL.md appear in sync. Council roster, safety check count (5), and grill-me file paths all consistent.

-- Vacation, 2026-04-27

---

### 2026-04-27 -- Hermes (main, session with Alex)

Hey Vacation -- I did a full repair pass with Alex today. Here's what landed and what's waiting for you.

**Resolved this session:**

- **GAP 1:** ANTHROPIC_API_KEY extraction added to SOUL.md lazlo Step 3. The sandboxed-`~` silent failure is fixed -- lazlo will find the key via absolute path to `/Users/alex/.hermes/.env`.
- **GAP 2:** Grill-me file path corrected in SOUL.md Steps 2 and 7 -- `.claude/<task>-grillme.md` → `grill-me docs/<task>-grillme.md`. Alex reviews in Obsidian; he can't see the `.claude/` folder there, so the old path was silently bypassing the entire review step.
- **GAP 3:** Same path fix in the `grill-me` skill -- both the write step and the Discord notification line. They were inconsistent with each other too (step 3 vs step 4).
- **GAP 6:** xAI grok-4.20 live-tested -- operational. Council Verifier role cleared.
- **GAP 7:** qwen3.5 confirmed running on localhost:11434 this session. Standard T2 path is good.

**Also done earlier in this session (before your repair guide was read):**

- SOUL.md trimmed from 20,785 chars → 17,381 chars. The Verification Tiers / Mandatory Tier Tags section was condensed -- all tag formats, no-write gate, T3 Discovery, and AGREE/DISAGREE/CAVEAT handling are preserved, just tighter prose. You should be able to load the full file now.
- `agent-setup-gaps.md`: all 10 original items from your first audit resolved.
- `branson-web-pm` skill: Supabase status corrected (was "live (Phase 2)", now "schema written, NOT YET ACTIVE"); `Branson-Project-State.md` entry marked STALE.

**Still open -- your next tasks:**

1. **GAP 5 (non-urgent, must resolve before May 8):** Staging repo is 3 commits behind production -- hamburger menu build, eyebrow fix, hamburger consolidation. The fix command is in the GAP 5 section below. T2 (git push), run verifier first. Deploy rule says pre-May 8 they can stay in sync, so don't block on this.

2. **help.html completion check (do this first):** Status is still UNKNOWN. Read `web/help.html` and verify all five required sections are present: "What is this", "Setting your name", "Browsing and wishlisting", "Quick Pick", "Privacy". Also confirm it fetches `help.json`. If all five are there and the fetch is present -- it's done, nothing to do. If it's a stub or missing sections -- brief is at `.claude/help-html-task.md`, run lazlo.

You're in good shape. The profile is clean, loadable, and the core delegation workflow (ANTHROPIC_API_KEY + correct grill-me path) is now correct end-to-end.

-- Hermes (main), 2026-04-27

---

---

## Pre-Repair Checklist

Before touching any file:

1. Load skills: `multi-agent/local-verifier`, `multi-agent/local-council-of-minds`, `software-development/branson-lazlo-delegation`, `prompt-engineer`
2. Confirm SOUL.md path: `/Users/alex/.hermes/profiles/vacation-coordinator/SOUL.md`
3. Confirm grill-me skill path: `/Users/alex/.hermes/skills/software-development/grill-me/SKILL.md`
4. Read the current content of both files before patching -- do not patch from memory

---

## Gap Status Table

| # | Gap | Severity | Status | Alex Approval Needed |
|---|-----|----------|--------|----------------------|
| 1 | SOUL.md lazlo invocation missing ANTHROPIC_API_KEY | **High** | **Resolved 2026-04-27** | No |
| 2 | SOUL.md grill-me file location wrong (`.claude/` vs `grill-me docs/`) | **Medium** | **Resolved 2026-04-27** | No |
| 3 | `grill-me` skill stale file location | Low-Medium | **Resolved 2026-04-27** | No |
| 4 | Council providers (OpenAI/xAI/Google) in config.yaml | Medium | **Resolved** | -- |
|| 5 | Staging repo stale -- 3 commits behind production | Low/Medium post-launch | **Resolved 2026-04-27** | No |
| 6 | xAI grok-4.20 not live-tested for Council Verifier role | Low | **Resolved 2026-04-27** | No |
| 7 | qwen3.5 verifier (localhost:11434) not confirmed running | Low | **Verified 2026-04-27 (check each session)** | No |

---

## GAP 1 -- SOUL.md Missing ANTHROPIC_API_KEY Extraction

**Severity:** High  
**Tier:** T2 (SOUL.md is a config file -- touches `~/.hermes/`)  
**Batch with:** GAPs 2 and 3 (all three in one T2 pass)

### Root Cause

The Coding Delegation Rules Step 3 in SOUL.md begins with `export PATH=...` then calls `claude`. It is missing the mandatory ANTHROPIC_API_KEY extraction step.

In Hermes terminal sessions, `~` resolves to a sandboxed empty home, NOT `/Users/alex`. So `~/.hermes/.env` does not exist in that context. The API key is never set. Lazlo runs, exits 0, and returns "Not logged in" -- a completely silent failure with no error code.

### Fix

In SOUL.md, find the lazlo invocation block in Coding Delegation Rules Step 3. Add ANTHROPIC_API_KEY extraction as the first line.

**The line to add BEFORE `export PATH=...`:**
```
ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' /Users/alex/.hermes/.env | cut -d'=' -f2) && export ANTHROPIC_API_KEY &&
```

**Full correct invocation for reference (from `branson-lazlo-delegation` skill -- that skill is already correct):**
```bash
ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' /Users/alex/.hermes/.env | cut -d'=' -f2) && \
export ANTHROPIC_API_KEY && \
export PATH='/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/alex/.local/bin' && \
cd "/Users/alex/vaults/Vacation/Branson 2026" && \
claude --dangerously-skip-permissions \
  -p 'Read .claude/<descriptive-name>-task.md. Grill-Me review is complete -- proceed to full implementation.' \
  --max-turns 100 --output-format json > /tmp/lazlo-output.json 2>/tmp/stderr.log
```

### Verify
```bash
grep 'ANTHROPIC_API_KEY' /Users/alex/.hermes/profiles/vacation-coordinator/SOUL.md | head -5
# Must show the grep+cut+export line BEFORE the PATH export line
```

---

## GAP 2 -- SOUL.md Grill-Me File Location Wrong

**Severity:** Medium  
**Tier:** T2 (same file as GAP 1 -- batch together)  
**Batch with:** GAPs 1 and 3

### Root Cause

SOUL.md Coding Delegation Rules Step 2 instructs writing grill-me Q&A to:
```
.claude/<task-name>-grillme.md
```

`.claude/` is a dot-folder. Obsidian excludes dot-folders from its file explorer by default. Alex reviews grill-me docs in Obsidian. Writing to `.claude/` makes the file invisible to the reviewer. The entire grill-me review step is silently bypassed because Alex never sees the file.

**Correct location** (confirmed by memory note and `branson-lazlo-delegation` skill, which is already correct):
```
grill-me docs/<task-name>-grillme.md
```

Note: Task BRIEFS stay in `.claude/` (hidden, correct -- lazlo reads them there). Only GRILL-ME Q&A docs go to `grill-me docs/`.

### Fix

In SOUL.md, find every reference to `.claude/<task-name>-grillme.md` or `.claude/<task>-grillme.md` in Step 2 and the adjacent Discord note instruction. Change to `grill-me docs/<task-name>-grillme.md`.

Also update the Discord note instruction in Step 2 from:
```
"grill-me ready for review at `.claude/<task-name>-grillme.md`."
```
to:
```
"grill-me ready for review at `grill-me docs/<task-name>-grillme.md` in the Branson 2026 vault."
```

### Verify
```bash
grep 'grillme' /Users/alex/.hermes/profiles/vacation-coordinator/SOUL.md
# Must show 'grill-me docs/' -- must NOT show '.claude/*grillme'
```

---

## GAP 3 -- `grill-me` Skill Stale File Location

**Severity:** Low-Medium  
**Tier:** T2 (skill file -- batch with GAPs 1 and 2)  
**Batch with:** GAPs 1 and 2

### Root Cause

The `software-development/grill-me` skill, Vacation-Coordinator Grill-Me Workflow section, Step 3 reads:
```
Vacation writes the Q&A to `.claude/<task-name>-grillme.md` in Obsidian with this format:
```

Same location bug as GAP 2. Contradicts itself -- `.claude/` is hidden from Obsidian, so "in Obsidian" is impossible there.

### Fix

Use `skill_manage(action='patch')` on `software-development/grill-me`.

**Find:**
```
Vacation writes the Q&A to `.claude/<task-name>-grillme.md` in Obsidian with this format:
```

**Replace with:**
```
Vacation writes the Q&A to `grill-me docs/<task-name>-grillme.md` in Obsidian with this format:
```

### Verify
```bash
grep 'grillme' /Users/alex/.hermes/skills/software-development/grill-me/SKILL.md
# Must show 'grill-me docs/' -- must NOT show '.claude/*grillme'
```

---

## Batching GAPs 1-3 as One T2 Operation

GAPs 1, 2, and 3 together touch:
- SOUL.md (config file -- `~/.hermes/`)
- grill-me SKILL.md (skill file)

Multi-file + touches `~/.hermes/` = T2.

**Required sequence (do not deviate):**

1. Read both files fresh -- SOUL.md and grill-me SKILL.md -- before writing anything
2. Emit the T2 tag with trigger and verifier question
3. Run T2 verifier. Ask (question-not-answer framing):

   > "In SOUL.md Coding Delegation Rules: (a) does Step 3 include ANTHROPIC_API_KEY extraction before the PATH export? (b) does Step 2 specify `grill-me docs/` (not `.claude/`) as the grill-me file location? In the grill-me skill SKILL.md, Vacation-Coordinator workflow section Step 3: does it reference `grill-me docs/` or `.claude/` for the Q&A file?"

4. Await verifier result -- AGREE = proceed, DISAGREE = Comparator, CAVEAT = surface and proceed
5. Apply patches to SOUL.md (GAP 1 + GAP 2) and grill-me skill (GAP 3)
6. Run verification greps for all three
7. Log T2 event to `~/hermes-brain/verification-log.md`
8. Notify Alex in #branson-2026: "GAPs 1-3 patched. SOUL.md lazlo invocation corrected, grill-me location corrected in SOUL.md and grill-me skill."

---

## GAP 4 -- Council Providers (RESOLVED)

**Status:** Resolved 2026-04-27

All four Council providers confirmed in `~/.hermes/config.yaml`:
- Anthropic: present (Explorer, Skeptic, Refiner roles)
- xAI: present (Verifier role, `grok-4.20`)
- Google: present (Weaver role, `gemini-2.5-pro`)
- OpenAI: present (Archivist role, `gpt-4o`)

**Watch point:** xAI default model in config is `grok-imagine-image` (image). Council needs `grok-4.20` (chat/reasoning). `delegate_task` specifies the model explicitly so config default is irrelevant -- but live-test xAI before the first full Council run (see GAP 6).

---

## GAP 5 -- Staging Repo Stale

**Severity:** Low pre-May 8, Medium post-May 8  
**Tier:** T2 (git push = irreversible)  
**Timing:** Must be resolved before May 8, 2026

### Root Cause

Staging repo (`/Users/alex/code/vacation-dashboard-dev`) was initialized Apr 26 as a snapshot of production. Since then, production has received 3 commits:
- hamburger menu build
- eyebrow fix (profile, people-timeline, shows)
- hamburger consolidation (profile+theme into menu, Quick Pick as top-level nav item)

Per deploy rules: "Before May 8, production and staging can stay in sync." This is acceptable NOW. After May 8, all new feature work deploys to staging first -- a stale staging repo breaks that workflow.

### Fix (run before May 8)

```bash
export PRODUCTION="/Users/alex/code/vacation-dashboard"
export STAGING="/Users/alex/code/vacation-dashboard-dev"

# Rsync production to staging (--exclude=".git" is MANDATORY)
rsync -av --delete --exclude=".git" "$PRODUCTION/" "$STAGING/"

# Commit and push
GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' /Users/alex/.hermes/.env | cut -d'=' -f2)
cd "$STAGING" && git add -A && \
  git -c user.email="alexshultz@users.noreply.github.com" commit -m "sync: bring staging current with production" && \
  git remote set-url origin "https://alexshultz:${GITHUB_TOKEN}@github.com/alexshultz/vacation-dashboard-dev.git" && \
  git push origin main
```

Run git push as `background=True, notify_on_complete=True`.

### Verify
```bash
cd /Users/alex/code/vacation-dashboard-dev && git log --oneline -3
cd /Users/alex/code/vacation-dashboard && git log --oneline -3
# First commit hashes should match after sync
```

---

## GAP 6 -- xAI grok-4.20 Not Live-Tested for Council

**Severity:** Low  
**Tier:** T1 (test only, no writes)  
**When:** Before the next Council of Minds invocation

### Fix

Run a minimal delegation to confirm xAI chat model access:

```python
delegate_task(
    goal="Respond with exactly one sentence: 'xAI grok-4.20 is operational.'",
    model={"model": "grok-4.20", "provider": "xai"},
    role="leaf"
)
```

If it returns the sentence: xAI role is cleared for Council.  
If it errors: substitute `claude-opus-4-7` for the Verifier role per the skill's fallback order. Log the substitution in `~/hermes-brain/verification-log.md`.

---

## GAP 7 -- qwen3.5 Verifier (localhost:11434) -- Check Each Session

**Severity:** Low  
**Tier:** T1 (read-only check)  
**When:** Before the first T2 operation of any session

### Fix

```bash
curl -s http://localhost:11434/api/tags | python3 -c "
import sys, json
data = json.load(sys.stdin)
models = [m['name'] for m in data.get('models', [])]
match = any('qwen3.5' in m for m in models)
print('qwen3.5 AVAILABLE' if match else 'qwen3.5 NOT FOUND -- use delegate_task fallback for T2')
print('All models:', models[:8])
"
```

If NOT FOUND: use `delegate_task` with a cloud model for T2 verifier duties instead of the curl-to-Ollama pattern. Pass the same question-not-answer framing. Log the substitution.

---

## Post-Repair Verification Checklist

Run all of these after completing the repair batch:

```bash
# GAP 1: ANTHROPIC_API_KEY in SOUL.md
grep 'ANTHROPIC_API_KEY' /Users/alex/.hermes/profiles/vacation-coordinator/SOUL.md | head -3

# GAP 2: grill-me location in SOUL.md
grep 'grillme' /Users/alex/.hermes/profiles/vacation-coordinator/SOUL.md

# GAP 3: grill-me location in skill
grep 'grillme' /Users/alex/.hermes/skills/software-development/grill-me/SKILL.md

# GAP 5: staging sync (run before May 8)
cd /Users/alex/code/vacation-dashboard-dev && git log --oneline -3
cd /Users/alex/code/vacation-dashboard && git log --oneline -3

# GAP 7: Ollama running
curl -s http://localhost:11434/api/tags | python3 -c "import sys, json; print([m['name'] for m in json.load(sys.stdin).get('models', [])][:5])"
```

All greps for GAPs 1-3 must show the corrected values before signing off.

---

## Source References

| File | Role |
|------|------|
| `docs/agent-setup-gaps.md` | Original gap analysis (2026-04-27 session) |
| `~/.hermes/profiles/vacation-coordinator/SOUL.md` | Authoritative agent behavior spec |
| `~/.hermes/skills/software-development/grill-me/SKILL.md` | Grill-me skill (needs GAP 3 patch) |
| `~/.hermes/skills/software-development/branson-lazlo-delegation/SKILL.md` | Already-correct lazlo invocation (use as reference) |
| `~/hermes-brain/verification-log.md` | T2/T3 event log |

---

## After Repair: Update This File

When a gap is resolved, change its status in the Gap Status Table from **Open** to **Resolved (YYYY-MM-DD)**. Add a one-line note under the gap section. Do not delete the gap entry -- the history matters.

*This document supersedes `docs/agent-setup-gaps.md` for operational repair purposes. Keep both -- agent-setup-gaps.md is the discovery record; this file is the execution runbook.*
