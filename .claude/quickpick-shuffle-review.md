# Code Review: Quick Pick shuffle

Cold reviewer. No session context.

## What changed

A Fisher-Yates shuffle function was added to quick-pick.html and called once on the ATTRACTIONS array immediately after fetch populates it, before filterAttractions() runs. Only quick-pick.html changed (+8 lines). A new test file tests/e2e/tests/quickpick-shuffle.spec.js was also created.

## Verify

1. shuffle() is standard Fisher-Yates (in-place, unbiased)
2. Called once after fetch, before filterAttractions() -- correct placement
3. Does not re-shuffle on card commit, undo, or restart -- those all call filterAttractions() which reads the already-shuffled ATTRACTIONS
4. pointerdown still present (safety check)
5. No other changes to quick-pick.html logic
6. Only quick-pick.html modified (not picks.js, not data.json, not any other file)

## The diff

Run: `cd "/Users/alex/vaults/Vacation/Branson 2026" && git diff web/quick-pick.html`

## Verdict

PASS / WARN / FAIL -- one line, then findings. Stop.
