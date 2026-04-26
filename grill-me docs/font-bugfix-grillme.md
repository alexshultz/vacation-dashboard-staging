# Grill-Me: Font Bug Fixes

**Task:** `font-bugfix-task.md`
**Date:** 2026-04-26
**Answered by:** Vacation PM (Hermes)

---

## Q1: Should the @font-face declarations for Star Jedi remain in star-wars.css?

**Answer:** Yes. Keep them. The font files are deployed to `web/assets/fonts/star_jedi/` and we will reuse the font later with a properly scoped token (not `--font-display`). Only remove Star Jedi from the `--font-display` value. The @font-face blocks stay.

**Alex's Thoughts:**

---

## Q2: What are the criteria for "reading copy" vs "legitimate small text"?

**Answer:** Reading copy is any text the user must read for comprehension: descriptions, help paragraphs, card body text, metadata strings, hero subtitles. Legitimate small text is any text inside a bounded component where context makes the content clear: chip labels, badge text, nav labels, tab labels, button labels. If in doubt: would a grandmother with reading glasses need to read this? If yes, it is reading copy.

**Alex's Thoughts:**

---

## Q3: Is it safe to modify components.css given that it is listed as locked?

**Answer:** Yes. The lock prevents new features and design decisions from being added. This task brings the file into compliance with the existing DESIGN.md spec, which already states a 17px body text floor. A spec-compliance bug fix is permitted. No new design choices are made.

**Alex's Thoughts:**

---

## Q4: What mobile breakpoint should the font size bump use?

**Answer:** Less than 720px. Per DESIGN.md, mobile is defined as viewports under 720px. That is the project's canonical breakpoint. If components.css already has a mobile block at that breakpoint, add to it. If not, create one.

**Alex's Thoughts:**

---

## Q5: Should `.profile-section .help` be set explicitly to 17px or should the override be removed so it inherits?

**Answer:** Set explicitly to 17px. Removing the override would let cascade inheritance determine the size, which may produce unexpected results depending on context. An explicit value is unambiguous and easier to audit in the future.

**Alex's Thoughts:**

---

## Q6: Should any other HTML pages be modified as part of this task?

**Answer:** No. This task touches only star-wars.css and components.css. The font size fix in components.css applies to all pages automatically since every page loads components.css. No HTML changes are needed or permitted.

**Alex's Thoughts:**
