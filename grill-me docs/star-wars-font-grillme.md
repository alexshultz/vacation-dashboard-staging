# Grill-Me: Star Wars Font Integration + Theme Review

**Task:** `star-wars-font-task.md`  
**Date:** 2026-04-26  
**Answered by:** Vacation PM (Hermes)

---

## Q1: Which Star Jedi variants should be copied to `web/assets/fonts/`?

**Answer:** `Starjedi.ttf` (solid) as primary. `Starjhol.ttf` (hollow) as optional secondary -- copied but not wired up in CSS unless lazlo finds a natural use for it (e.g., a decorative accent). The logo variants (`Stjldbl1`, `Stjldbl2`, `Strjmono`) and Special Edition (`STJEDISE`) are specialized display fonts not appropriate for UI text at any size -- skip them.

**Alex's Thoughts:**

---

## **Q2: Should Star Jedi apply to ALL heading roles (display, headline, nav-label) or only the display role?**

**Answer:** Display role only (2rem / 32px page titles and hero headings). Star Jedi is highly decorative -- at 14px nav labels it would be unreadable. Orbitron stays for `headline` (1.375rem) and `nav-label` (0.875rem). Star Jedi is the hero font, Orbitron is the workhorse.

**Alex's Thoughts:**

---

## **Q3: Is there a licensing concern with self-hosting Star Jedi?**

**Answer:** Star Jedi was created by Boba Fonts and is widely available as a free fan font. It is NOT an official Lucasfilm/Disney font. The font folder contains `.doc` guide files but no explicit license file. This is a personal family trip tool used internally -- risk is minimal. However, this font cannot be used if this dashboard ever becomes public-facing. Lazlo should note in the CSS that this is a fan font for personal use only.

**Alex's Thoughts:**

---

## **Q4: Should theme activation (making Star Wars the default or picker-selectable) happen as part of this task?**

**Answer:** No. This task ends with production-ready theme files. Theme activation is a separate PM decision and a separate lazlo task. Lazlo should NOT change any HTML `<link>` tags or swap `web/DESIGN.md`. The Star Wars CSS already exists and is already excluded from the active Trail theme -- nothing needs to change for the theme to be "available," it just needs to be reviewed and validated.

**Alex's Thoughts:**

---

## Q5: Should the existing Google Fonts @import (Orbitron + Share Tech Mono) be modified?

**Answer:** No. Keep the Google Fonts import unchanged. Orbitron stays in use for `headline` and `nav-label` roles, so the CDN import is still needed. Star Jedi is added via `@font-face` in addition to the existing import, not as a replacement.

**Alex's Thoughts:**

---

## Q6: What `font-display` value should the @font-face use?

**Answer:** `font-display: swap` -- consistent with how Google Fonts are loaded across the project (`?display=swap` query param). This prevents invisible text during font load and provides Orbitron as the immediate fallback while Star Jedi loads.

**Alex's Thoughts:**

---

## **Q7: Accessibility -- does Star Jedi at `display` size meet WCAG requirements?**

**Answer:** At 2rem (32px), text qualifies as "large text" under WCAG, so the minimum contrast ratio is 3:1 (not 4.5:1). Lazlo must verify that whatever color is applied to display text meets 3:1 in both light mode (Rebel briefing room) and dark mode (Death Star). In dark mode, the likely display color is `--crawl-yellow` (#FFE81F) on `--space-black` (#050A0F) -- that pair is very high contrast and should pass easily. In light mode it's `--color-ink` (#0A0A0F) on `--color-bg` (#EEEEE8) -- also high contrast. Lazlo should verify both explicitly.

**Alex's Thoughts:**

---

## Q8: Should the font directory structure be flattened in `web/assets/fonts/`?

**Answer:** Yes -- flatten it. Instead of mirroring the vault's nested `star_jedi/starjedi/Starjedi.ttf` structure, use `star_jedi/Starjedi.ttf` directly. Two fewer levels of nesting, shorter paths in the CSS, easier to maintain. The relative path from the CSS file becomes: `../../assets/fonts/star_jedi/Starjedi.ttf`.

**Alex's Thoughts:**

---

## Q9: Will the font files be included in the GitHub Pages deploy automatically?

**Answer:** Yes. The rsync step copies everything under `web/` to the preview repo with `rsync -av --delete`. Since the fonts live at `web/assets/fonts/star_jedi/`, they are included automatically. No changes to the deploy workflow are needed.

**Alex's Thoughts:**

---

## Q10: Should `font-weight: 400` be used in the @font-face declaration for Star Jedi?

**Answer:** Yes. Star Jedi is a single-weight font with no bold/italic variants. Declaring it as weight 400 is correct. The CSS rendering engine will synthesize bold if asked, which we don't need -- `display` role text should use the natural weight of the font.

**Alex's Thoughts:**

---

## Q11: Should the @font-face block be added before or after the existing @import line?

**Answer:** After the `@import` line, before the `:root` block. Convention: network imports first (CDN), then local declarations, then variables. This preserves the load order and matches how font loading is typically organized.

**Alex's Thoughts:**

---

## Q12: What semantic tokens does components.css expect, and are they all present in star-wars.css?

**Answer:** Based on `tokens.css` and the existing star-wars.css, the required semantic tokens are: `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-dim`, `--color-line`, `--status-yes`, `--status-no`, `--status-wishlist`, `--status-neutral`, `--status-lock`, `--warn`, `--accent-sand`, `--accent-clay`, `--accent-dusk`. The current star-wars.css appears to define all of these -- lazlo should verify coverage explicitly during the review step and add any that are missing.

**Alex's Thoughts:**


Alex approves all of these.