# Phase 2 Grill — Proposed Answers for Review

**Context:** Phase 2 = write `scripts/classify_tags_frontier.py` using Claude Sonnet 4.5 to re-classify all 139 Branson attractions, using 26 human-corrected teaching examples as few-shot. Claude Code produced 60 questions via `/grill-me`. Hermes' proposed answers below. Alex reviews, edits, approves.

**How to use this doc:** For each question, read Hermes' answer. If you agree, leave it. If you want something different, edit inline (change text or add `[ALEX: ...]`). When done, send it back and Hermes will generate the script.

---

## Section A — Core Behavior & Goals

**1. Fresh vs. resume: Always fresh, or support `--resume`?**
> Support `--resume` flag. Default = fresh. `--resume` skips slugs already written to `tag-proposals-v2.csv`. Lets you pick back up after a crash without losing paid tokens.

**2. Non-interference with v1: Confirm no read/write of v1 CSV at all?**
> Read-only access to `tag-proposals.csv` **only** to build the diff (compare old→new). Never written to. Never opened with write mode.

**3. Output schema for v2.csv: Same columns as v1?**
> Same columns as v1, in same order. Adds one column at the end: `agrees_with_teaching` (blank for non-teaching rows, `yes` / `no` for the 26 teaching rows).

**4. What triggers the diff: Only rows where v1 ≠ v2?**
> Diff includes all 139 rows. Column flags clearly mark: `unchanged`, `tags-changed`, `teaching-row-agrees`, `teaching-row-disagrees`. Easier to scan all 139 once than query multiple views.

**5. Human correction baseline in diff: Highlight separately?**
> Yes. The 26 teaching rows get a distinct header section at top of `tag-proposals-diff.md`: "Teaching-set consistency check — did Claude agree with your 26 corrections?" with agree/disagree counts.

**6. Re-classify the 26 teaching examples too?**
> **Yes.** Critical consistency check. If Claude disagrees with your corrections, that's signal (either your correction was wrong, or the model needs more context). Either way you want to know.

**7. Determinism — temperature / seed?**
> `temperature=0.0`. Anthropic API doesn't expose a seed, but t=0 is deterministic enough for this.

**ALEX APPROVED 2026-04-21: All defaults accepted. Use Sonnet 4.6 (not 4.5 as originally written). Script will do a 1-token smoke test at startup to verify the exact model string.**

**8. Explicit "done" criteria?**
> Final stderr line: `✓ Classified N/139, F failures, $X.XX spent, wrote v2.csv + diff.md`. Non-zero exit if any unrecoverable failure.

---

## Section B — Few-Shot Strategy

**9. All 26 examples or subset?**
> All 26. ~4K tokens overhead = ~$0.06 per call. Negligible cost for completeness. Every example teaches something distinct.

**10. Teaching example format in prompt?**
> Structured block per example:
> ```
> Example: {name}
> Description: {first 200 chars of description}
> Initial classifier output: {before_tags}
> Human correction: {after_tags}
> Reason (if inferable): removed [adult-humor] because wrong vibe
> ```

**11. Example ordering?**
> Alphabetical by slug. Deterministic. No semantic ordering (we don't want to imply importance).

**12. Measure teaching impact (run with/without examples)?**
> No. Out of scope. Adds cost without changing the output we ship.

**13. Validate tags in examples are in current vocab?**
> Yes, at script startup. Loud error + halt if any teaching tag is unknown.

**14. Token budget concern for ~4K of examples?**
> Acceptable. Claude Sonnet 4.5 has 200K context. 4K is 2% of window.

---

## Section C — Anthropic API & JSON Enforcement

**15. API key & import strategy?**
> Top of file: `try: import anthropic; except ImportError: sys.exit("pip install anthropic first")`. No auto-pip-install (risky, violates "loud errors"). Env var check: `if not os.environ.get("ANTHROPIC_API_KEY"): sys.exit(...)`.

**16. Model name verification — is `claude-sonnet-4-5` correct?**
> Script will do a 1-token smoke test call to the model at startup. If it 404s, loud error with suggestion to check https://docs.anthropic.com/en/docs/about-claude/models for the current name. No assumptions.
> - it looks like the current sonnet is claude-sonnet-4-6

**17. JSON enforcement — prefill `{` or tool-use?**
> Prefill `{` in the assistant turn. Simpler than tool-use, Anthropic-documented pattern, zero extra tokens.

**18. Max tokens per call?**
> `max_tokens=600`. Output JSON is ~150-200 tokens realistic; 600 gives headroom for long reasoning without being wasteful.

**19. Retry on 429 / 5xx?**
> Exponential backoff: 1s, 2s, 4s, max 3 attempts. After that, loud error per row (logged + continue), and halt-threshold check at end (>10% failures = non-zero exit).

**20. Timeout per call?**
> 60 seconds. Claude typical response < 10s. 60s catches network stalls without blocking the whole run.

**21. Anthropic Batch API (50% off)?**
> No. Async adds complexity, saves ~$0.33. Not worth it for a one-shot run.

**22. Cost tracking — estimate before / actual per / running total?**
> All three. Before: `Estimated: 139 × (800 in + 200 out) tokens ≈ $0.65`. Per row: `[43/139] slug ... 0.004$ (running: 0.17$)`. End: `Total: $0.XX spent`.

---

## Section D — Error Handling & Validation

**23. Loud-error failure threshold?**
> Same as qwen script: >10% of rows fail = non-zero exit with summary. Per-row failures logged to stderr + raw JSONL but don't halt the run.

**24. Non-JSON response from Claude?**
> Log full response to `tag-proposals.raw.jsonl`, retry once with a clearer prompt nudge ("Return ONLY valid JSON."). If second attempt still non-JSON: mark row as failed, continue.

**25. Invalid tag from model (not in vocab)?**
> Strip the unknown tag from output + log warning to `validation_warnings` column. Don't halt. This preserves usable data while making the issue visible in the CSV.

**26. Confidence out of range?**
> Clamp to [0, 1]. Log warning to `validation_warnings`. Don't halt.

**27. Missing required fields in response?**
> Loud warning, retry once, then mark row as failed if still broken. No silent defaults.

**28. Schema validation before CSV write — all at end or incremental?**
> Incremental. Write to `.partial.csv` after each row (append mode). Rename to final `v2.csv` at successful completion. Resume uses the partial if present.

**29. Raw log file — fresh or append?**
> Append. Audit trail matters more than clean file. Old entries are small.

---

## Section E — Output Format & Diff Logic

**30. v2.csv sort order?**
> Same order as `attractions.json` (which is roughly source-order). Matches v1, enables easy `diff` at the file level.

**31. Diff columns — table format?**
> Markdown table with columns:
> `slug | name | v1 tags | v2 tags | human corrected | change_type | notes`
>
> `change_type` values: `unchanged`, `tags-added`, `tags-removed`, `tags-both`, `teaching-agree`, `teaching-disagree`.

**32. Diff scope — all rows or only changes?**
> All 139 rows. Unchanged rows are visually collapsed (just the slug + `unchanged` marker). Changed rows get full detail. Easier to verify "nothing went missing."

**33. Teaching examples clearly marked in diff?**
> Yes. Top section of `diff.md` is a dedicated table for just the 26, scored against `after_tags` in the teaching JSON. Main table below covers all 139 with `change_type` flags.

**34. CSV tag escaping — one column or split?**
> Split by category (same as v1): `show_categories`, `music_subgenres`, `audience_vibe`, `attraction_tags` each as their own comma-joined string column. Plus the unified `proposed_tags` column (v1 convention, kept for continuity).

**35. Empty tags from Claude?**
> Row is still written. Confidence + reasoning captured. Logged as warning. Valid outcome for ambiguous attractions.

**36. Diff format — table / narrative / JSON?**
> Markdown table (per Q31). Easier mobile scan in Obsidian. JSON is too noisy for human review.

**37. Diff summary at top?**
> Yes. Header block:
> ```
> ## Summary
> - Total rows: 139
> - Changed: XX
> - Teaching consistency: Y/26 agree
> - Model: claude-sonnet-4-5 @ temp=0
> - Cost: $X.XX
> - Generated: 2026-04-21 HH:MM
> ```

---

## Section F — Teaching Examples & Validation

**38. Teaching example placement — system / user-turns / in-system?**
> In system prompt, after vocabulary, before the "for each attraction" instructions. Single system message. Simpler than multi-turn.

**39. Measuring teaching impact comparison?**
> No. Out of scope. Same answer as Q12.

**40. Validate teaching slugs don't leak into test set?**
> No — we WANT overlap here. The 26 teaching rows get re-classified with their own examples visible in the prompt. That's the consistency check. Not a standard ML test/train split — this is production calibration.

**41. Include `human_adjustments` field in prompt?**
> Yes. Include the raw `-tag` / `+tag` adjustment string verbatim in each example. Gives Claude the exact signal you sent.

**42. After classifying the 26: flag disagreements?**
> Yes, prominently in diff.md. Not as errors — as signal. You review and decide row-by-row.

**43. Validate all 26 teaching slugs exist in attractions.json?**
> Yes, at startup. Loud error + halt if any teaching slug isn't in the data. Prevents drift bugs.

---

## Section G — Workflow & Testing

**44. `--dry-run` mode?**
> Yes. `--dry-run N` classifies first N attractions (default 3), prints results to stdout (no CSV write), prints cost estimate for full run. Required before burning full $0.65.

**45. Progress reporting — per-row or batched?**
> Per-row. Format: `[43/139] shepherd-of-the-hills-north-pole-adventure ... 0.004$ (0.17$ running)`. Matches qwen script's style.

**46. Partial failure recovery?**
> `.partial.csv` written incrementally. If script crashes, `--resume` reads `.partial.csv` and skips done slugs. Renames to final `v2.csv` only on clean completion.

**47. Pre-run checks?**
> Yes, all three:
> - `attractions.json` exists, parseable, has ≥1 entry
> - `tag-teaching-examples.json` exists, parseable, all slugs exist in attractions, all tags in current vocab
> - `ANTHROPIC_API_KEY` env var set
> - 1-token smoke test to verify model name

**48. Test strategy — dry-run first, then full?**
> Hermes runs `--dry-run 3` after Claude Code review. Shows you the 3 outputs. Then you approve the full 139 run. Cost gate enforced.

---

## Section H — Vocabulary & Round 8 Context

**49. Hardcode new tags or config file?**
> Import from `classify_tags.py` (the source of truth). Avoids drift. If imports get ugly, copy the constants at top with a comment pointing back to the canonical source.

**50. Validate teaching example tags in vocabulary?**
> Yes at startup (covered in Q13, Q47).

**51. Version marker in v2.csv?**
> Yes. First row (or sidecar file) includes a comment: `# Round 8 vocabulary; classifier=claude-sonnet-4-5; generated=2026-04-21`. CSV commenting is non-standard — sidecar file `tag-proposals-v2.meta.json` is cleaner.

**52. Vocabulary locked for this run?**
> **Locked.** Claude picks only from Round 8 vocab. No tag suggestions accepted.

---

## Section I — Post-Processing & Reporting

**53. Top-5 lowest confidence to stderr after run?**
> Yes. Prints at end: `Lowest-confidence rows for your review: [list]`. Action-prompt for the HITL review.

**54. Separate validation report file?**
> No. Warnings live in the `validation_warnings` CSV column + diff.md "warnings" section. One extra file adds clutter.

**55. Auto-compute agreement metrics?**
> Yes, in the diff.md summary block: `% rows unchanged`, `teaching agreement %`.

**56. Export structure for future merge into attractions.json?**
> Out of scope for this script. Separate merge script will be Phase 3, after you approve v2. Keeps each step reviewable.

---

## Section J — Code Style & Maintainability

**57. Self-contained or modular?**
> Self-contained single file. ~400 lines estimated. No new helper modules. Matches your "self-contained files preferred" rule.

**58. Logging — `print` to stderr or logging module?**
> `print(..., file=sys.stderr)` per qwen script convention. Simpler.

**59. Documentation level?**
> Docstrings on main functions. Inline comments where logic is non-obvious. No essay-comments on simple code.

---

## Meta

**60. Out-of-scope items?**
> - Handling attractions added/removed since v1 (assume 139 unchanged)
> - Merging v2 back into attractions.json (Phase 3)
> - Regenerating HTML dashboard after tag changes (Phase 3)
> - Updating the qwen `classify_tags.py` to use frontier (not the goal)

---

## Hermes' default-bundle (quick-reference)

If you're fine with all the above and just want to proceed, the TL;DR is:

- `claude-sonnet-4-5`, temp 0, max_tokens 600, 60s timeout
- 26 examples in system prompt, alphabetical, full detail including `human_adjustments`
- Output: `data/tag-proposals-v2.csv` + `data/tag-proposals-diff.md` + `data/tag-proposals-v2.meta.json` + append to `data/tag-proposals.raw.jsonl`
- `--dry-run N` (default 3) before full run
- `--resume` via `.partial.csv` for crash recovery
- Loud errors at >10% failure threshold
- Cost visible at every step (estimated, per-row, running, final)
- Claude Code review BEFORE dry-run (per your workflow rule)
- You approve between dry-run and full run
- ~$0.65 total

---

## Your response

Mark each section with one of:
- **OK** — approve as written
- **CHANGE** — with a note on what to change
- **SKIP** — don't do this

Or just reply with the question numbers you disagree with and the new answer. Everything else = approved.
