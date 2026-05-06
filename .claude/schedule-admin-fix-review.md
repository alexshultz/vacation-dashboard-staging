You are a cold, fresh code reviewer. Review only the changes to `web/admin-event-timeline.html` in the most recent commit. Return PASS, WARN, or FAIL.

## What was changed

Two surgical fixes:

1. **Insert with auto-generated ID for new events** -- the create branch previously called `.upsert({ id: slug, ... })`. It must now call `.insert(...)` with no `id` field. The edit branch must still call `.upsert({ id: _editingId, ... })` unchanged.

2. **Dark mode fix** -- `background:#fff` on the modal container replaced with `background:var(--color-surface)`.

## Review checklist

1. Create branch calls `.insert(...)` with no `id` in the payload?
2. Edit branch still calls `.upsert(...)` with the existing event ID?
3. The two branches are correctly distinguished (no accidental merge)?
4. `background:var(--color-surface)` present on modal container, `background:#fff` gone?
5. No other CSS or logic changes outside the two fixes?
6. No frozen files, no out-of-scope files touched?

## Verdict format

VERDICT: [PASS / WARN / FAIL]

FINDINGS:
- [bullet per issue, labeled FAIL / WARN / INFO]

RECOMMENDATION:
[one sentence]
