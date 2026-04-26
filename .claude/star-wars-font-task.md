# Task: Star Wars Theme -- Star Jedi Font Integration + Theme Review

**Date:** 2026-04-26  
**Requestor:** Alex (via Vacation PM)  
**Status:** Grill-Me review complete -- proceed to full implementation.

---

## Objective

Integrate the local Star Jedi font files into the Star Wars theme CSS and DESIGN.md, then perform a holistic review of the entire Star Wars theme (colors, typography, accessibility, vibe) and make any improvements needed. The theme should be production-ready after this task, ready for activation at Alex's direction.

---

## Source Font Files

Located in the vault root (NOT in the web directory -- must be copied):

```
assets/fonts/star_jedi/starjedi/Starjedi.ttf    ← PRIMARY -- use this one
assets/fonts/star_jedi/starjedi/Starjhol.ttf    ← Hollow variant -- copy but don't use in CSS unless it adds clear value
```

**Skip the following -- not appropriate for UI use:**
- `stjelogo/Stjldbl1.ttf`, `Stjldbl2.ttf`, `Strjmono.ttf` (logo lockup fonts)
- `stjedise/STJEDISE.TTF` (decorative Special Edition)
- `starjout/Starjout.ttf` (Outline variant -- skip for now)

---

## Step 1: Copy Fonts to Web Directory

Copy to `web/assets/fonts/star_jedi/` (FLATTEN -- no subdirectory nesting):

```
web/assets/fonts/star_jedi/Starjedi.ttf
web/assets/fonts/star_jedi/Starjhol.ttf
```

These files are under `web/` and will be picked up automatically by the rsync deploy step.

---

## Step 2: Modify `web/css/themes/star-wars.css`

### Add @font-face declarations (above the :root block)

```css
@font-face {
  font-family: 'Star Jedi';
  src: url('../../assets/fonts/star_jedi/Starjedi.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Star Jedi Hollow';
  src: url('../../assets/fonts/star_jedi/Starjhol.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Update font stack variables

**IMPORTANT -- Star Jedi is for `display` role ONLY (2rem / page titles / hero headings).**  
Orbitron stays for `headline` and `nav-label`. This is non-negotiable -- Star Jedi is too decorative to be legible at 14px nav labels.

Update the font stack section in `:root`:

```css
  --font-display: 'Star Jedi', 'Orbitron', 'Eurostile', sans-serif;
  --font-heading: 'Orbitron', 'Eurostile', sans-serif;
  --font-body:    'Share Tech Mono', 'Courier New', monospace;
```

The current file only has `--font-heading` and `--font-body`. Adding `--font-display` as a new token is intentional.

---

## Step 3: Update `web/themes/DESIGN-star-wars.md`

Update the `display` typography entry to reflect Star Jedi:

```yaml
typography:
  display:
    fontFamily: "Star Jedi, Orbitron, Eurostile, sans-serif"
    fontSize: 2rem
    fontWeight: 400
    lineHeight: 1.1
    note: "Local @font-face font. Served from web/assets/fonts/star_jedi/Starjedi.ttf"
```

Also add a note in the Overview or Typography prose section documenting the local font source.

---

## Step 4: Full Star Wars Theme Review

After font integration, review the entire theme holistically. Specifically:

1. **Color accuracy** -- are the palette choices actually evocative of Star Wars? Dark mode (Death Star) should feel cinematic. Light mode (Rebel briefing room) should feel tactical.
2. **WCAG AA compliance** -- verify all foreground/background token pairs meet 4.5:1 (normal text) or 3:1 (large text, UI boundaries). In particular: crawl yellow (#FFE81F) on dark backgrounds in dark mode, and any Star Jedi display text.
3. **Font legibility at all roles** -- Star Jedi at 2rem, Orbitron at 1.375rem and 0.875rem, Share Tech Mono at body sizes.
4. **Dark mode completeness** -- the `[data-mode="dark"]` and `@media (prefers-color-scheme: dark)` blocks already exist. Verify they are complete and consistent.
5. **Semantic token coverage** -- verify all semantic tokens used by `components.css` are defined: `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-dim`, `--color-line`, `--status-yes`, `--status-no`, `--status-wishlist`, `--status-neutral`, `--status-lock`, `--warn`, `--accent-sand`, `--accent-clay`, `--accent-dusk`.
6. **Make adjustments** -- if anything looks wrong, off-brand, or fails accessibility, fix it within the theme CSS and DESIGN.md. Document significant changes with a CSS comment.

---

## Hard Constraints (DO NOT TOUCH)

- `web/css/tokens.css` -- LOCKED
- `web/css/components.css` -- LOCKED
- `web/css/themes/trail.css` -- LOCKED
- `web/DESIGN.md` -- active Trail spec, not relevant to this task
- `scripts/generate_dashboard.py` -- FROZEN (do not run)
- `scripts/generate_attractions.py` -- FROZEN (do not run)
- Any HTML file content

**Do NOT activate the Star Wars theme** (do not swap it as the default or change any HTML `<link>` tags). Theme activation is a separate PM decision. This task ends with production-ready theme files.

---

## Deliverables

1. `web/assets/fonts/star_jedi/Starjedi.ttf` -- copied from vault assets
2. `web/assets/fonts/star_jedi/Starjhol.ttf` -- copied from vault assets
3. `web/css/themes/star-wars.css` -- updated with @font-face + reviewed/adjusted
4. `web/themes/DESIGN-star-wars.md` -- updated typography section

---

## Path Verification

Before finishing, verify the @font-face path is correct by confirming the relative depth:
- CSS file lives at: `web/css/themes/star-wars.css`
- Font file lives at: `web/assets/fonts/star_jedi/Starjedi.ttf`
- Relative path from CSS: `../../assets/fonts/star_jedi/Starjedi.ttf`

If the path is wrong, the font silently falls back to Orbitron -- check with browser DevTools or by grepping for 404s.
