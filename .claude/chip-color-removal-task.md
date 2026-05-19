You are Lazlo, a careful and precise software agent. Your task is a two-phase cleanup of the Branson 2026 dashboard codebase. You will first inventory, then remove. Do not touch any file during the inventory phase.

---

## PROJECT PATHS

- Vault root: /Users/alex/vaults/Vacation/Branson 2026/
- Production repo: ~/code/vacation-dashboard
- Staging repo: ~/code/vacation-dashboard-dev
- Playwright suite: cd /Users/alex/vaults/Vacation/Branson 2026/tests/e2e && npx playwright test --workers=2
- Playwright specs: tests/e2e/tests/*.spec.js

---

## PHASE 1 — INVENTORY (read-only, no edits)

Search the entire vault root AND both repos exhaustively. Produce a written inventory table before touching a single file.

For every hit, record:
| File path | Line number | Form | Content snippet |

Search targets (case-insensitive, regex where noted):

1. `accent-sand-chip` — token definition or documentation
2. `accent-clay-chip` — token definition or documentation
3. `chip--shows`, `chip--food`, `chip--shopping` — CSS class or doc reference
4. `chips-category` — any file reference (CSS filename, import, doc)
5. Color-by-category chip spec prose — search for phrases like "category chip", "chip color", "color by category" in .md files
6. `2026-05-04` entries in docs/PROJECT_LOG.md — specifically chip color mockup content
7. Any .claude/ task brief files containing: `chip color`, `chip--`, `chips-category`, `accent-sand-chip`, `accent-clay-chip`
8. Any web/ HTML/CSS/JS files containing `chip--` class prefixes (PM asserts zero — verify and confirm)

After searching, output the complete inventory table. Then proceed directly to Phase 2.

---

## PHASE 2 — REMOVAL

Remove every instance from the inventory. Scope is strictly limited to:

### web/DESIGN.md
- Delete the `accent-sand-chip` token definition line(s) and any surrounding doc prose specific to it
- Delete the `accent-clay-chip` token definition line(s) and any surrounding doc prose specific to it
- Delete all category chip spec text: references to chip--shows, chip--food, chip--shopping
- Delete all references to chips-category.css (the filename and any associated explanation)
- Delete any prose block documenting color-by-category chip behavior

### docs/PROJECT_LOG.md
- Delete the 2026-05-04 chip color mockup log entry in its entirety
- Delete any other log entries that reference chip category colors or chips-category

### .claude/ task briefs
- Delete any brief files whose primary subject is the chip color feature
- If a brief covers multiple topics and chip color is a subsection, delete only the chip color subsection(s), leaving the rest intact

### web/ HTML/CSS/JS files
- If your inventory confirms zero chip-- category classes (as PM asserts), note "web/ files confirmed clean" and make no edits
- If you find any, remove them

---

## HARD CONSTRAINTS — DO NOT TOUCH THESE

| Token / Class | Reason |
|---|---|
| `chip-filter` | RSVP/filter chip — unrelated, leave it |
| `chip-filter-active` | RSVP/filter chip — unrelated, leave it |
| `chip-rsvp-*` (any variant) | RSVP chip — unrelated, leave it |
| `tag-chip` | Tag chip token — unrelated, leave it |
| `accent-sand` (base token) | Base color token — only remove the `-chip` suffixed variant |
| `accent-clay` (base token) | Base color token — only remove the `-chip` suffixed variant |
| `generate_dashboard.py` | PERMANENTLY FROZEN — do not open, do not read, do not touch |
| `generate_attractions.py` | PERMANENTLY FROZEN — do not open, do not read, do not touch |
| Any file not named in your inventory | Scope rule: do not modify what is not explicitly in scope |

PM scope rule (mandatory): Do not modify any element not explicitly named in this task. If you encounter something that looks unused or redundant but is not in your inventory, flag it in the handback report. Do not remove it.

---

## PHASE 3 — PLAYWRIGHT VERIFICATION

After all removals, run the Playwright suite:

```
cd /Users/alex/vaults/Vacation/Branson 2026/tests/e2e && npx playwright test --workers=2
```

Report the full pass/fail result. The chip color system had no Playwright tests (it was never implemented in production), so no test changes are needed. This run is purely a regression check. If any test fails, investigate and report — do not suppress failures.

---

## PHASE 4 — COLD VERIFICATION SEARCH

After removal, run a fresh grep across the entire vault root and both repos for all of the following patterns:

- `accent-sand-chip`
- `accent-clay-chip`
- `chip--shows`
- `chip--food`
- `chip--shopping`
- `chips-category`
- `chip color` (in .md files)
- `color by category` (in .md files)

You are explicitly not permitted to self-certify. Report every result of this search verbatim — zero hits or otherwise. The cold search output is the verification record.

---

## HANDBACK REPORT

After Phase 4, output a structured handback:

**Files Modified:**
- `<path>` — <one-line description of what was removed>
- (repeat for each file)

**Instances Beyond PM Inventory:**
- List any hits found in Phase 1 that were not in the PM's known-instances list, or "None"

**web/ HTML/CSS/JS Status:**
- "Confirmed clean — zero chip-- category classes found" or list what was found and removed

**Judgment Calls:**
- Any ambiguous case where you made a decision, with your reasoning

**Playwright Result:**
- Pass / Fail + summary line

**Cold Search Result:**
- Paste verbatim output of Phase 4 grep

---

## STOP CONDITIONS

- Do NOT commit anything
- Do NOT push to any remote
- Do NOT update PROJECT_LOG.md with a log entry about this task (that would be circular and is forbidden)
- Do NOT modify generate_dashboard.py or generate_attractions.py under any circumstances

Begin with Phase 1 now.
