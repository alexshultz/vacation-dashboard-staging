# Tier Compliance Review — Session 2026-04-26

**Prepared by:** Hermes vacation-coordinator (cron job, job ID d9de71c5a9fe)
**Reviewed session:** 2026-04-26 (approximately 10 PM–1:30 AM CDT)
**Source documents read:**
- `docs/PROJECT_LOG.md` (top four 2026-04-26 entries)
- `docs/DECISIONS.md` (ADR-009 and full ADR history for context)
- `docs/Session Summary 2026-04-26.md`
- `docs/Handoff 2026-04-26.md`
- `~/hermes-brain/verification-log.md` (prior log baseline)

---

## Tier System Reference (as in effect tonight)

| Signal | Tier | Required Action |
|--------|------|-----------------|
| Single-file, reversible, no `~/.hermes/` or config touched | 1 | Inline reasoning only |
| Multi-file OR touches `~/.hermes/`/config OR irreversible | 2 | Fresh context-free verifier instance |
| New component, new workflow, new integration, or Alex requests | 3 | Full Council of Minds |

**Calibration rule (still active):** State tier and rationale aloud before proceeding. Log every Tier 2/3 event to `~/hermes-brain/verification-log.md`.

---

## Operations Reconstructed from Tonight's Session

Six distinct operations are identifiable from the project log entries, session summary, and handoff document. They are listed in rough chronological order.

---

### Operation A — Star Jedi Font Integration

**What was done:**
Copied `Starjedi.ttf` and `Starjhol.ttf` into `web/assets/fonts/star_jedi/`. Updated `web/css/themes/star-wars.css` with `@font-face` declarations, a new `--font-display` token (Star Jedi primary, Orbitron fallback), and fixed a WCAG AA dark-mode contrast failure (`--color-ink-dim` from `#5A7890` to `#6685A0`). Updated `web/themes/DESIGN-star-wars.md`. Deployed to GitHub Pages.

**Files touched:** `web/css/themes/star-wars.css`, `web/themes/DESIGN-star-wars.md`, font assets (2 files). Deployment to GitHub Pages is irreversible in the sense that it immediately changes the live URL.

**What tier it should have been:** **Tier 2.** This is a multi-file write (CSS + design doc + binary assets) combined with an irreversible production deployment. Either signal alone trips Tier 2.

**Was tier declared?** No. No `T2 CHECK` block appears anywhere in the session notes or logs for this operation.

**Was a verifier spawned?** No. The code reviewer mentioned in the session (`WARN item 12`) was lazlo's own internal pass on help.html — not a fresh context-free verifier specifically for this operation.

**Outcome safety:** The theme was NOT activated (production behavior unchanged). The WCAG fix is correct and a strict improvement. Font files are inert until theme activation. The `--font-display` token written here was later reverted in Operation C (bug fix pass), which further reduces residual risk. **Net outcome: safe.**

**Risk of the process gap:** Low. The blast radius was contained by the "theme NOT activated" gate. Even without a verifier, no user-visible regression occurred.

---

### Operation B — help.html Complete Rebuild + ADR-009

**What was done:**
Created `web/help.json` (11 sections, minimal Markdown body strings). Rewrote `web/help.html` `<main>` to strip hard-coded HTML and replace it with a `fetch()` + IIFE renderer. Added a Help entry-point link to `web/profile.html`. Updated `CLAUDE.md` pre-push safety checks (new grep command). Wrote ADR-009 documenting the architectural decision. Deployed to GitHub Pages.

**Files touched:** `web/help.json` (new), `web/help.html` (structural rewrite), `web/profile.html` (additive link), `CLAUDE.md` (rule addition), `docs/DECISIONS.md` (ADR-009 append). Five files, plus deployment.

**What tier it should have been:** **Tier 3.** This operation introduces a new content-serving workflow (runtime JSON fetch as the pattern for page content, not just data records). ADR-009 explicitly acknowledges this was an architectural choice between three alternatives. The session summary notes that "three options were evaluated" — this is Council of Minds territory. The fact that it mirrors the existing `data.json` pattern is a mitigating similarity, but it extends the pattern to a new class of content (help/FAQ pages), which qualifies as a new workflow under the Tier 3 definition.

At minimum, this was a clear **Tier 2** (multi-file + CLAUDE.md config edit + irreversible deploy).

**Was tier declared?** No. No tier declaration block appears in any session artifact.

**Was a verifier spawned (Tier 2) or Council run (Tier 3)?** No. Lazlo's internal code reviewer flagged WARN item 12 (script tag placement after `</main>`), but this is not a fresh context-free verifier. It is lazlo reviewing its own output — which is the exact failure mode the Tier 2 requirement is designed to prevent.

**Known issue left open:** WARN item 12 (script block after `</main>`) was logged as non-blocking and deferred. A proper Tier 2 verifier or Tier 3 Council review might have caught and resolved this before deployment rather than after.

**Outcome safety:** Help page is live, functional, and architecturally sound. ADR-009 captures the decision rationale correctly. The cosmetic issue (script placement) does not affect functionality. **Net outcome: safe, with one deferred cosmetic issue.**

**Risk of the process gap:** Low-Medium. The decision was made correctly by any reasonable measure, but it was made inline without an independent challenge. The risk is that an alternate approach (e.g., a static `export_help.py` generator with a frozen-file guard) was rejected without a fresh perspective evaluating whether the rejection rationale was solid. Given that the frozen-generator risk pattern was already well-documented in ADR-002, the inline rejection was well-reasoned — but the process required a fresh eye regardless.

---

### Operation C — Font Bug Fixes + HTML Reverts

**What was done:**
Removed Star Jedi from `--font-display` in `star-wars.css` (reverting Operation A's token). Bumped 12 reading-copy CSS selectors in `components.css` from 13–15px to 17px desktop / 18px mobile (new `@media` block). Reverted three HTML files (`people-timeline.html`, `profile.html`, `shows.html`) after lazlo made unsolicited eyebrow element removals outside the task brief. Added new mandatory brief instruction: "Do not modify any HTML element not explicitly named in this task."

**Files touched:** `web/css/themes/star-wars.css`, `web/css/components.css`, `web/people-timeline.html`, `web/profile.html`, `web/shows.html`. Five files.

**What tier it should have been:** **Tier 2.** Multi-file write across two CSS files and three HTML files. The HTML reverts are individually reversible, but the components.css typography change (12 selectors bumped) affects every page that uses those selectors — that is a wide blast radius.

**Was tier declared?** No.

**Was a verifier spawned?** No. The three HTML reverts were themselves a corrective action driven by code review (which is good process), but code review of lazlo's output is not the same as an independent verifier checking Hermes's decision to make those CSS typography changes.

**Outcome safety:** All changes correct. The CSS font size increases are conservative accessibility improvements. The HTML reverts restore known-good state. The new brief instruction addresses the root cause. **Net outcome: safe.**

**Risk of the process gap:** Low. Font size increases from 13–15px to 17–18px are improvements with no plausible regression path for a family web app. The revert was surgical and verified by diff. The main missed opportunity was catching the unsolicited lazlo edits *before* they were deployed (a Tier 2 verifier reviewing the lazlo output diff would likely have caught the eyebrow element removals at code-review time, before the three-file revert was necessary).

---

### Operation D — Staging Environment + CLAUDE.md Workflow Update

**What was done:**
Created `vacation-dashboard-staging` GitHub repository. Enabled GitHub Pages for staging at `https://alexshultz.github.io/vacation-dashboard-staging/`. Created local staging clone at `/Users/alex/code/vacation-dashboard-staging/`. Deployed initial production snapshot to staging. Updated `CLAUDE.md` with a two-target deploy table and the staging-first rule (effective May 8).

**Files touched:** New GitHub repository (irreversible external resource), new local directory, `CLAUDE.md` (workflow rule change). The CLAUDE.md change encodes a rule that all agents will read and follow from this point forward.

**What tier it should have been:** **Tier 3.** This is a new workflow (staging-first deployment) and a new integration (separate staging GitHub Pages target). Both are explicit Tier 3 signals. The CLAUDE.md rule change is also significant because it redirects all future agent behavior — a rule that is wrong or ambiguous here propagates to every subsequent session.

**Was tier declared?** No.

**Was a Council of Minds run?** No.

**Outcome safety:** The staging environment is a net safety improvement. The staging-first rule (effective May 8) is correct in intent. The CLAUDE.md wording appears to be clear. However: there is currently no automated enforcement that agents actually deploy to staging before production, and no verification that the rsync commands in the new deploy table are correct (path issues have surfaced in this project before — e.g., the `~` sandboxing issue documented in the auth note). **Net outcome: likely safe, with one unverified assumption about deploy command correctness.**

**Risk of the process gap:** Medium. This is the highest-risk process gap tonight. A Tier 3 Council or even a Tier 2 verifier would have been asked: "Is the staging-first rule in CLAUDE.md specific enough to be enforced? Are the rsync commands in the two-target deploy table correct? Does the staging environment actually isolate from production, or is there a path where a confused agent deploys staging content to production?" These questions were not asked by a fresh perspective. The practical risk right now is low (no family member will see staging before May 8), but the structural risk — an untested workflow rule baked into CLAUDE.md — is meaningful.

---

### Operation E — ROADMAP.md Post-Launch Documentation Section

**What was done:**
Added a "Post-Launch Documentation Tasks" section to `ROADMAP.md` documenting the dark mode DESIGN.md work (deferred, non-blocking).

**Files touched:** `docs/ROADMAP.md` (single file, additive, fully reversible).

**What tier it should have been:** **Tier 1.** Single-file, additive, reversible. No config touched.

**Was tier declared?** Not required for Tier 1.

**Outcome safety:** Safe. Additive documentation only.

**Risk of the process gap:** None.

---

### Operation F — Writing Style Guide

**What was done:**
Created `~/vaults/Alex/Thoughts/My AI/Alex Writing Style Guide.md` capturing formal writing rules for all AI agents (active voice, no dash-based pauses, direct sentences, no hedging).

**Files touched:** One new file, outside the Branson vault. Single file, additive.

**What tier it should have been:** **Tier 1.** Single-file, additive, reversible. Although it touches a cross-project doc (`~/vaults/Alex/`), it does not touch `~/.hermes/` or any config file.

**Was tier declared?** Not required for Tier 1.

**Outcome safety:** Safe.

**Risk of the process gap:** None.

---

## Summary Table

| Op | Operation | Correct Tier | Tier Declared | Verifier/Council | Outcome Safe | Risk |
|----|-----------|:------------:|:-------------:|:----------------:|:------------:|:----:|
| A | Star Jedi Font Integration | **T2** | ❌ No | ❌ No | ✅ Yes | Low |
| B | help.html Rebuild + ADR-009 | **T3** (T2 min) | ❌ No | ❌ No | ✅ Yes | Low-Med |
| C | Font Bug Fixes + HTML Reverts | **T2** | ❌ No | ❌ No | ✅ Yes | Low |
| D | Staging Environment + CLAUDE.md | **T3** | ❌ No | ❌ No | ✅ Yes* | **Medium** |
| E | ROADMAP.md Update | T1 | N/A | N/A | ✅ Yes | None |
| F | Writing Style Guide | T1 | N/A | N/A | ✅ Yes | None |

*Likely safe, with unverified deploy command assumptions.

**Score: 0 out of 4 Tier 2/3 operations followed correct process.**

---

## Operations Where Process Was Skipped and What the Risk Was

### 1. Operation B — help.html Rebuild (T3 required, no process run)

**What was skipped:** No Tier 3 declaration, no Council of Minds, no fresh verifier.

**What the risk was:** An architectural decision (runtime JSON fetch as content pattern for help pages) was made inline without an independent challenge. The three alternatives were evaluated by the same agent that chose one of them. A Council instance might have surfaced: (a) whether the minimal-Markdown renderer in help.html is robust enough for future content editors; (b) whether the script-after-`</main>` placement would cause any real-world layout issues before they were deployed; (c) whether the `help.json` fetch could fail silently on slow connections with no loading indicator. None of these rose to the level of blockers, but the process was designed to catch exactly this class of missed question.

**Actual consequence:** WARN item 12 (script placement) was deployed with a known cosmetic issue. Deferred fix accepted.

---

### 2. Operation D — Staging Environment + CLAUDE.md (T3 required, no process run)

**What was skipped:** No Tier 3 declaration, no Council of Minds, no verifier.

**What the risk was:** A new multi-step workflow was encoded into CLAUDE.md without an independent review. Specific questions not asked:
- Are the rsync commands for the two-target deploy table syntactically correct and tested?
- Is "staging-first effective May 8" clear enough that an agent won't misread it as "staging-first effective immediately"?
- Does the staging repo path (`/Users/alex/code/vacation-dashboard-staging/`) match how SOUL.md and ONBOARDING.md refer to paths, or does it introduce a `~` vs. absolute path ambiguity?

The auth note in the same session (`~` resolves to a sandboxed home, not `/Users/alex`) suggests path issues are a live risk in this project. A fresh verifier asking "is this deploy workflow safe?" would have probed exactly this.

**Actual consequence:** No operational failure yet. The workflow has not been exercised under load. Risk is deferred rather than resolved.

---

### 3. Operation A — Star Jedi Font Integration (T2 required, no verifier)

**What was skipped:** No Tier 2 declaration, no verifier.

**What the risk was:** Multi-file CSS + asset write + production deployment without an independent pass. Lazlo eyebrow-element removals were already a known failure mode this session (Operation C was a direct consequence). A fresh verifier reviewing the star-wars.css diff might have caught issues before deployment.

**Actual consequence:** No regression (theme not activated). `--font-display` token was cleanly reverted in Operation C. Risk was contained by the inactivation gate.

---

### 4. Operation C — Font Bug Fixes + HTML Reverts (T2 required, no verifier)

**What was skipped:** No Tier 2 declaration, no verifier.

**What the risk was:** Components.css typography changes affect all 10 dashboard pages. A verifier would have been asked to confirm: (a) no selector was missed; (b) the 17px/18px numbers match Alex's intent; (c) the `@media` breakpoint at 719px is consistent with the existing breakpoint strategy.

**Actual consequence:** No regression detected. Changes are conservative and direction is correct. The breakpoint value (719px) is not independently verified against other breakpoints in components.css.

---

### Also Noted: Lazlo Workflow Process Gaps (Not Tier System, But Related)

The Handoff document (written by session Hermes at 1:30 AM) self-identifies three additional process gaps that are not strictly Tier System failures but contributed to the same root cause:

1. **Prompt-Engineer Skill not used** — All three lazlo task briefs were drafted inline, not via the prompt-engineer subagent. This removes the intent-check and pre-brief quality gate that catches scope ambiguity (the eyebrow-element removal in Operation C is consistent with an underspecified brief).

2. **Grill-Me three-call pattern not followed** — Grill-me, answer file, and implementation were combined rather than sequenced as three separate calls. This compresses the review surface area.

3. **No post-lazlo code review spawned as a separate delegate_task** — Code review happened within the lazlo session rather than as a cold read by a fresh instance.

These gaps share the same structural root cause as the Tier System gaps: multiple verification steps collapsed into a single context, which defeats the independence guarantee that makes verification meaningful.

---

## Verdict

**No process gap tonight created actual project risk. All gaps were procedural misses only.**

The mitigating factors that kept tonight's misses in the procedural category:

1. **The theme-not-activated gate** neutralized the most aggressive file changes (Star Wars CSS).
2. **ADR-009's rationale is sound** — even without a fresh Council, the help.html decision mirrors an established pattern and the alternatives were correctly rejected.
3. **The staging environment is a net safety addition**, not a risk introduction. Its worst failure mode is a confused agent deploying to the wrong target — which CLAUDE.md now guards against, even if imperfectly.
4. **All deployed changes passed lazlo's internal code review**, which caught WARN item 12 and the eyebrow-element removals. Internal review is not a substitute for an independent verifier, but it is not nothing.

The pattern that emerges from tonight: the Tier System gaps are not about bad decisions — the decisions were good. They are about the absence of an independent second voice on decisions that warranted one. This distinction matters for what to fix.

---

## Recommendations

**1. Enforce the T2 CHECK block as a pre-write gate, not a post-write label.**
Tonight's pattern was: operation executed, then documented. The tier check must happen before the first file write. If the block isn't written first, execution should not begin.

**2. Prioritize Operation D follow-up (staging deploy workflow).**
Before the May 8 launch, verify the two-target deploy commands in CLAUDE.md with a real dry-run. Specifically test: (a) the rsync command for staging, (b) the path-fix sed command on staging HTML files, (c) that a staging push does not touch the production repo. This verification is low-cost and eliminates the one real structural uncertainty from tonight.

**3. Apply the prompt-engineer and grill-me three-call pattern from the next lazlo invocation onward.**
The handoff document already documents the correct 10-step workflow. The next lazlo task (Priority 3: move 25 events to `schedule.json`) is a strong candidate for doing this correctly since it is a new file (`events.json`) and a structural change to `event-timeline.html`, which will be Tier 2 at minimum.

**4. Log Tier 2/3 events to `~/hermes-brain/verification-log.md` at the time of operation, not retroactively.**
Tonight's events are being appended to the verification log now by this cron job. Going forward, the declaration block and log append should happen before the operation, not after.

**5. Clarify CLAUDE.md breakpoint inventory.**
The 719px breakpoint used in Operation C's mobile typography block should be verified against the existing breakpoint table in CLAUDE.md or components.css. If no canonical breakpoint table exists, add one as a Tier 1 documentation task.

---

*Report generated: 2026-04-26 02:00 AM CDT by Hermes vacation-coordinator cron job d9de71c5a9fe*
*Source of truth for tonight's operations: PROJECT_LOG.md, DECISIONS.md, Session Summary, Handoff Document*
