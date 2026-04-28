# Grill-Me: Appearance Controls Unification
**Task:** Rename "Mode" -> "Appearance" on profile page, add icons to segmented control, fix active highlight, update hamburger label to always say "Appearance."
**Files touched:** profile.html, web/js/site.js, web/css/components.css

---

## Q1 (PROFILE): Icon assignments for the segmented control buttons

Alex specified: System = half moon, Light = sun, Dark = moon.

Proposed mapping:
- 🌓 System (first-quarter / half moon)
- ☀️ Light (sun)
- 🌙 Dark (crescent moon)

This matches the icons already used in the hamburger panel cycling button.

**Note:** The profile says "System" while the hamburger says "Auto" -- these are the same setting. The profile will keep "System" as Alex specified. The inconsistency is minor and can be addressed in a future pass if Alex wants to unify terminology.

Vacation's recommendation: Use the mapping above as-is.

**Alex's Thoughts:**

---

## **Q2 (PROFILE): What should the active/selected state look like for the segmented control?**

Currently: no visual difference between selected and unselected buttons. All look the same.

The `.seg` trough has `background: var(--color-bg)` (a slightly off-tone background). Standard segmented control convention: the selected pill gets a brighter `background: var(--color-surface)` + full-ink `color: var(--color-ink)` (vs the dimmed `color: var(--color-ink-dim)` for unselected). No border change needed -- the pill just "lifts" visually.

In dark mode this means: selected pill is the dark card color, unselected is the darker trough color. In light mode: selected is cream-white, unselected is the slightly-off background.

Vacation's recommendation: Add this CSS rule to components.css:
```css
.seg button[aria-pressed="true"] { background: var(--color-surface); color: var(--color-ink); }
```

No box-shadow needed -- the contrast between `--color-bg` and `--color-surface` is enough in both modes.

**Alex's Thoughts:**

---

## Q3 (HAMBURGER): Hamburger label behavior

Currently the button cycles and shows the full state as its label: "🌓 Auto" / "☀️ Light" / "🌙 Dark".

Alex requested: always show "Appearance" as the text, only the icon changes. So:
- "🌓 Appearance" when Auto/System
- "☀️ Appearance" when Light
- "🌙 Appearance" when Dark

This is a simple change to the `modeLabel()` function in site.js.

Vacation's recommendation: implement as Alex described.

**Alex's Thoughts:**

---

*All three questions are fully answered by Vacation's recommendation. Alex's Thoughts sections left blank = approved to proceed.*
