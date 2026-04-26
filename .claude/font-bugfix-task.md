# Task: Font Bug Fixes -- Star Jedi Removal + Font Size Audit

**Date:** 2026-04-26
**Grill-Me:** Complete -- proceed to full implementation.

---

## Context

Two font bugs were identified from live testing on mobile and desktop.

1. The Star Wars theme's `--font-display` token was set to Star Jedi, which caused it to render on ALL headings and UI labels across the site (h1, h2, h3, nav labels, chips, badges). Star Jedi's OpenType contextual alternates corrupt letters at small sizes. Example: "ARRIVAL" renders as "ARRHRAL", "DEPARTURE" as "DEPARTKRE".

2. `.profile-section .help` is set to 13px. The DESIGN.md spec sets a body text floor of 17px. This is a spec compliance failure, not a design decision.

**READ CLAUDE.md IN FULL BEFORE WRITING A SINGLE LINE OF CODE.**

---

## Fix 1: `web/css/themes/star-wars.css`

Remove Star Jedi from the `--font-display` token. Revert to Orbitron.

Change:
```css
--font-display: 'Star Jedi', 'Orbitron', 'Eurostile', sans-serif;
```

To:
```css
--font-display: 'Orbitron', 'Eurostile', sans-serif;
```

**Keep the `@font-face` declarations intact.** The font files are deployed and we will use Star Jedi later with a properly scoped token. Do not remove the @font-face blocks. Do not add any new hero-specific token in this pass.

---

## Fix 2: `web/css/components.css`

### 2a: Fix `.profile-section .help`

Change:
```css
.profile-section .help { font-size: 13px; color: var(--color-ink-dim); margin: 0 0 var(--sp-3); }
```

To:
```css
.profile-section .help { font-size: 17px; color: var(--color-ink-dim); margin: 0 0 var(--sp-3); }
```

### 2b: Audit all font-sizes below 16px

Read components.css in full. For every `font-size` value below 16px, classify it:

**Reading copy** (must be bumped to 17px minimum):
- Paragraph text, descriptions, card body text, metadata strings, help text, any prose context
- Rule: if it appears in a `p`, `.help`, `.card-description`, `.meta`, `.hero-sub`, or similar prose element

**Legitimate small text** (leave as-is):
- Chip labels, badge text, nav labels, mini-labels inside bounded components, icon labels
- Rule: if it is inside a chip, badge, button, nav item, or tab label

Document every change in the handback report.

### 2c: Mobile font size bump

Check if components.css already has a `@media (max-width: 719px)` or similar mobile block.

If one exists: add a rule inside it bumping reading copy to 18px minimum.
If none exists: add a new block:

```css
@media (max-width: 719px) {
  .profile-section .help,
  .hero-sub,
  p.help {
    font-size: 18px;
  }
}
```

Adjust the selector list based on what you find during the audit in 2b. Only bump reading copy -- do not change chip, badge, or nav label sizes on mobile.

---

## Hard Constraints

- `web/css/tokens.css` -- LOCKED
- `web/css/themes/trail.css` -- LOCKED
- `web/DESIGN.md` -- LOCKED
- All HTML files -- DO NOT TOUCH
- `scripts/generate_dashboard.py` -- FROZEN
- `scripts/generate_attractions.py` -- FROZEN

**Note on components.css lock:** components.css is locked against new features and design decisions. This task is a spec-compliance bug fix (DESIGN.md specifies 17px body text floor). Bug fixes that bring the file into compliance with the existing spec are permitted. No new design choices are being made.

---

## Handback

Produce the standard three-section handback (files changed, architectural choices, invariants affected). List every font-size change individually with old and new values. Then STOP. Do not commit, push, or rsync.
