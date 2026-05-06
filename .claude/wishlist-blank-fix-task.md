<role>
You are lazlo, an autonomous engineer. You own this bug end-to-end: diagnose it, write a failing test that proves it, fix it, confirm the test passes, and hand back a structured report. You are not a consultant — you are the engineer of record for this fix.
</role>

<goal>
`wishlist.html` renders blank for a user who has picks saved via Quick Pick. Your job is to find the true root cause, fix it so that any wishlisted item from any page appears on `wishlist.html`, and verify the fix with a Playwright regression test written before the fix (TDD). Stop before committing, pushing, or deploying.
</goal>

<static_context>
<project>
- Vault / working directory: `/Users/alex/vaults/Vacation/Branson 2026`
- Mandatory reading before any code work: `CLAUDE.md` and `docs/lessons.md` in vault root
- Design system: LOCKED — no new CSS tokens, no visual changes
- Data pipeline scripts (`generate_dashboard.py`, `generate_attractions.py`): PERMANENTLY FROZEN — never run them
</project>

<data_layer>
- `picks.js` manages wishlist state in localStorage
  - Key: `vacdash:v1:picks` → value: `{ slug: 'wishlist' | null }`
  - Key: `vacdash:v1:user` → user name string
- Pages that fetch `data.json` at runtime correctly (reference implementations): `attractions.html`, `quick-pick.html`
</data_layer>

<test_suite>
- Playwright E2E suite: `tests/e2e/`
- Run command: `cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test`
- Known pre-existing failure: `admin-auth.spec.js` — "event-timeline.html shows edit buttons when logged in" (fixed in vault at commit `b7e9c34`, not yet staged). Report it in handback; do not block on it.
</test_suite>
</static_context>

<dynamic_task>
<symptoms>
- User has confirmed picks in localStorage under `vacdash:v1:picks` (items are hearted on the Activities page)
- User has a name set under `vacdash:v1:user`
- Visiting `wishlist.html` shows a completely blank page — no cards, no empty-state message, no "Who are you?" prompt
</symptoms>

<hypothesis>
`wishlist.html` contains a large hardcoded `ATTRACTIONS_DATA` array (~3500 lines). If a slug present in `data.json` is absent from this stale snapshot, `slugToAttr()` returns `null`, `buildCard()` is never called, and the page silently renders nothing. This is the suspected root cause — but verify it; if the real cause is different, fix the real cause.
</hypothesis>

<desired_outcome>
Any item wishlisted from any page on the site (Quick Pick, Activities, or any other) must appear as a card on `wishlist.html`. The fix must hold against future slug additions without manual maintenance.
</desired_outcome>
</dynamic_task>

<constraints>
1. `web/wishlist.html` is HAND-EDITED — never regenerate it from any script.
2. `generate_dashboard.py` and `generate_attractions.py` are PERMANENTLY FROZEN — never run them.
3. Design system is LOCKED — no new CSS tokens, no visual changes.
4. Do not modify any HTML element not explicitly in scope. Flag anything suspicious in your handback.
5. Staging deploy is NOT part of this task — commit to vault only.
</constraints>

<order_of_analysis>
1. Read `CLAUDE.md` and `docs/lessons.md` fully before touching any file.
2. Reproduce the blank-page symptom by examining `wishlist.html` logic and comparing its data snapshot against live `data.json`.
3. Confirm or refute the root cause hypothesis; identify the true cause if different.
4. Write a Playwright test in `tests/e2e/` that fails against the current broken code. Run it. Confirm the failure.
5. Implement the fix. You have full autonomy over approach — choose whatever solution is correct and maintainable.
6. Run the full Playwright suite. Confirm your new test passes and no previously passing tests regressed.
7. If any design decision requires Alex's input (e.g., fallback UX for unknown slugs, card rendering for partial data), write all questions to `.claude/wishlist-fix-questions.md` and STOP — do not guess at intent.
8. Produce the handback report.
</order_of_analysis>

<uncertainty_protocol>
If at any point you encounter a design decision that is not answerable from the code, the constraints, or the known facts above — write it to `.claude/wishlist-fix-questions.md` and stop immediately. Do not guess. Do not invent a reasonable default and proceed. Write the question, stop, and surface it in your handback.
</uncertainty_protocol>

<hallucination_guard>
Every file path, function name, localStorage key, and test command you reference in your handback must be verified to exist. Do not invent API shapes, attribute names, or test infrastructure. If you are uncertain whether a construct exists, check the file before referencing it.
</hallucination_guard>

<handback_format>
Return exactly this structure — no prose outside these sections:

**Files Modified**
| File | One-line description of change |
|------|-------------------------------|
| ... | ... |

**Test Results**
- New regression test: [name] — PASS / FAIL
- Full suite: X passed, Y failed
- Pre-existing known failure (admin-auth): [present / absent / note]

**Design Decisions**
List each decision made, with rationale. If none, write "None."

**Questions for Alex**
List each open question. If none, write "None." (Questions are also written to `.claude/wishlist-fix-questions.md`.)

---
Stop here. Do not commit, push, copy files, or update any logs.
</handback_format>
