# Agent Setup Gaps & Conflicts -- SUPERSEDED

*Original document: 2026-04-27 | Superseded: 2026-05-09*

---

All 5 gaps documented in this file have been resolved. Verification performed 2026-05-09 against current on-disk state:

| # | Gap | Resolution |
|---|-----|------------|
| 1 | SOUL.md missing ANTHROPIC_API_KEY extraction in lazlo invocation | RESOLVED. vacation-coordinator SOUL.md no longer embeds the lazlo invocation; it delegates to the `autonomous-ai-agents/lazlo` skill, which contains the correct extraction at SKILL.md line 170 using `sed -n 's/^ANTHROPIC_API_KEY=//p'`. The `cut -d'=' -f2` bug from the original recommendation is documented in the skill as a known failure mode (base64 padding `=` would corrupt the key). |
| 2 | Grill-me file location conflict (`.claude/` vs `grill-me docs/`) | RESOLVED. vacation-coordinator SOUL.md retired grill-me for this profile entirely (line 58: "Grill-me is retired for this profile -- do not use it"). Discord-confirm replaces grill-me. The location conflict is moot for this profile. |
| 3 | grill-me skill stale path | RESOLVED. `~/.hermes/skills/software-development/grill-me/SKILL.md` line 23 reads "Vacation writes the Q&A to `grill-me docs/<task-name>-grillme.md`". |
| 4 | Council provider readiness not verified | RESOLVED. All four Council provider API keys present in `~/.hermes/.env` (ANTHROPIC_API_KEY, XAI_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY). Council inference uses `delegate_task` with explicit model+provider parameters; the keys in .env are what matter for SDK auth, not config.yaml provider blocks (those are for default/auxiliary routing). The repair-guide note (line 254) about config defaults being irrelevant for Council holds. |
| 5 | Staging repo path unconfirmed | RESOLVED. The actual staging repo is `/Users/alex/code/vacation-dashboard-dev` (the original gap analysis named it `vacation-dashboard-staging`, which was an older naming -- that path also exists on disk but is NOT the active staging repo per CLAUDE.md line 179 and docs/NEXT-SESSION.md line 128). The active staging repo `vacation-dashboard-dev` was synced to production in the 2026-04-27 session (commit 5af78d2) per `docs/vacation-coordinator-repair-guide.md`. Both directories are populated. |

This file is preserved as a historical record. The operational successor for any future repair work is `docs/vacation-coordinator-repair-guide.md`.
