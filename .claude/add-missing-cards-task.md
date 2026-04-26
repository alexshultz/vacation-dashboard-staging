# Codemaster Task: Add 10 Missing Attraction Cards to attractions.html
# Branson '26 Dashboard
# Date: 2026-04-23

## Background

`data/attractions.json` has 139 attractions. `web/attractions.html` only has 134 cards. After
subtracting 7 blacklisted slugs, there are exactly 10 real attractions in JSON that have no
corresponding `<article class="card--light">` in the HTML. These need to be injected.

**CRITICAL: Do NOT run `scripts/generate_dashboard.py`.** It overwrites attractions.html and
destroys the Quick Pick JS on quick-pick.html integration. Edit attractions.html directly.

## Files to Modify

- `web/attractions.html` — inject 10 new `<article class="card--light">` blocks

## Files You Will NOT Touch

- `scripts/generate_dashboard.py`
- `web/quick-pick.html`
- `web/css/` (any file)
- `web/js/picks.js`
- `data/attractions.json`

## The 10 Missing Attractions (full JSON data)

Insert each one alphabetically into the `<div class="catalog-grid" id="catalog-grid">` section.
Sort key: same as existing cards — case-insensitive alphabetical by display name, ignoring
leading "A ", "An ", "The ".

### 1. America's Top Country Hits
```json
{
  "slug": "america-s-top-country-hits",
  "name": "America's Top Country Hits",
  "category": "family",
  "duration_hours": 2,
  "price_adult": 47,
  "family_pass": null,
  "rating": 4.6,
  "description": "America's Top Country Hits brings the hits of country music to life on the Branson stage.",
  "image": "assets/thumbs/americas-top-country-hits-thumb.png",
  "official_url": "https://www.branson.com/shows/amaericas-top-country-hits/",
  "notes": "From branson.com source. Starting at $Varies.",
  "tags": ["1-2hr","country","family","indoor","music"]
}
```

### 2. Awesome 80's
```json
{
  "slug": "awesome-80-s",
  "name": "Awesome 80's",
  "category": "show",
  "duration_hours": 2,
  "price_adult": 47,
  "family_pass": null,
  "rating": 4.5,
  "description": "Awesome '80s takes you on a Journey of the decade's greatest hits — pop, rock, and everything in between.",
  "image": "assets/thumbs/awesome-80s-thumb.jpg",
  "official_url": "https://www.branson.com/shows/awesome-80s/",
  "notes": "From branson.com source. Starting at $Varies.",
  "tags": ["1-2hr","date-night","family","indoor","music","oldies-80s","pop","rock","tribute"]
}
```

### 3. Branson's Wild World
```json
{
  "slug": "branson-s-wild-world",
  "name": "Branson's Wild World",
  "category": "attraction",
  "duration_hours": 2,
  "price_adult": 24.52,
  "family_pass": null,
  "rating": 4.6,
  "description": "Zoo and animal encounters with many exotic animals. Great for kids.",
  "image": "assets/thumbs/bransons-wild-world-thumb.jpg",
  "official_url": "https://www.branson.com/attractions/bransons-wild-world/",
  "notes": "Added April 19, 2026.",
  "tags": ["1-2hr","animals","educational","family","indoor","kid-focused","outdoor","relaxed"]
}
```

### 4. Clay Cooper's Country Express
```json
{
  "slug": "clay-cooper-s-country-express",
  "name": "Clay Cooper's Country Express",
  "category": "family",
  "duration_hours": 2,
  "price_adult": 50,
  "family_pass": null,
  "rating": 4.7,
  "description": "Clay Cooper's Country Express features 20+ cast members in an all-ages country variety spectacular.",
  "image": "assets/thumbs/clay-coopers-country-express-thumb.jpg",
  "official_url": "https://www.branson.com/shows/clay-coopers-country-express/",
  "notes": "From branson.com source.",
  "tags": ["1-2hr","country","family","indoor","music","variety"]
}
```

### 5. Dolly Parton's Stampede
```json
{
  "slug": "dolly-parton-s-stampede",
  "name": "Dolly Parton's Stampede",
  "category": "show",
  "duration_hours": 2,
  "price_adult": 50,
  "family_pass": null,
  "rating": 4.5,
  "description": "A dazzling dinner attraction with horse-riding stunts, live music, and a four-course feast.",
  "image": "assets/thumbs/dolly-partons-stampede-thumb.jpg",
  "official_url": "https://dpstampede.com/branson/show-schedule",
  "notes": "Includes dinner. Highly recommended for families.",
  "tags": ["1-2hr","country","date-night","family","food","indoor","variety"]
}
```

### 6. Dublin's Irish Tenors & The Celtic Ladies
```json
{
  "slug": "dublin-s-irish-tenors-the-celtic-ladies",
  "name": "Dublin's Irish Tenors & The Celtic Ladies",
  "category": "show",
  "duration_hours": 2,
  "price_adult": 50,
  "family_pass": null,
  "rating": 4.6,
  "description": "Classical and modern hits with an Irish twist. Three tenors and three Celtic ladies.",
  "image": "assets/thumbs/dublins-irish-tenors-thumb.jpg",
  "official_url": "https://www.kingscastletheatre.com/whats-on/view/?permalink=dublins-irish-tenors--the-celtic-ladies-15658716095d554df9212fc5d554df92130b",
  "notes": "King's Castle Theatre. Official site.",
  "tags": ["1-2hr","classical","date-night","family","indoor","music","pop","variety"]
}
```

### 7. Fritz's Adventure
```json
{
  "slug": "fritz-s-adventure",
  "name": "Fritz's Adventure",
  "category": "attraction",
  "duration_hours": 2,
  "price_adult": 24.95,
  "family_pass": null,
  "rating": 4.6,
  "description": "Adventure park with ropes courses, climbing, zip lines, and multi-story mazes.",
  "image": "assets/thumbs/fritzs-adventure-thumb.jpg",
  "official_url": "https://www.branson.com/attractions/fritzs-adventure/",
  "notes": "Added April 19, 2026.",
  "tags": ["1-2hr","active","family","indoor","outdoor","thrill"]
}
```

### 8. Parakeet Pete's
```json
{
  "slug": "parakeet-pete-s",
  "name": "Parakeet Pete's",
  "category": "attraction",
  "duration_hours": 2,
  "price_adult": null,
  "family_pass": null,
  "rating": 4.5,
  "description": "Walk-through aviary and waterpark experience with parakeet feedings and outdoor water fun.",
  "image": "assets/thumbs/parakeet-pete-s-thumb.jpg",
  "official_url": "https://www.branson.com/attractions/parakeet-pete-s/",
  "notes": "Added 2026-04-19.",
  "tags": ["1-2hr","animals","family","outdoor"]
}
```

### 9. Ripley's Believe It or Not
```json
{
  "slug": "ripley-s-believe-it-or-not",
  "name": "Ripley's Believe It or Not",
  "category": "family",
  "duration_hours": 1,
  "price_adult": 35,
  "family_pass": null,
  "rating": 4.5,
  "description": "Hundreds of oddities, interactive exhibits, and hands-on experiences. Very popular with kids.",
  "image": "assets/logos/ripleys-logo-white.svg",
  "official_url": "https://www.ripleys.com/branson",
  "notes": "Combo ticket available with Super Fun Park.",
  "tags": ["1-2hr","educational","family","indoor","kid-focused","museum","relaxed","under-1hr"]
}
```

### 10. World's Largest Toy Museum Complex
```json
{
  "slug": "world-s-largest-toy-museum-complex",
  "name": "World's Largest Toy Museum Complex",
  "category": "attraction",
  "duration_hours": 2,
  "price_adult": null,
  "family_pass": null,
  "rating": 4.5,
  "description": "A massive complex of multiple toy museums including Mr. Rogers memorabilia, Barbie, and more.",
  "image": "assets/thumbs/world-s-largest-toy-museum-complex-thumb.jpg",
  "official_url": "https://www.branson.com/attractions/world-s-largest-toy-museum-complex/",
  "notes": "Added 2026-04-19.",
  "tags": ["1-2hr","educational","family","indoor","kid-focused","museum","relaxed"]
}
```

## Card HTML Format (copy this pattern exactly)

Reference the first card in attractions.html for the exact structure. Every card must have:

```html
<article class="card--light" data-tags="TAG1 TAG2 ..." data-slug="SLUG"
  data-title="DISPLAY NAME (HTML-escaped)"
  data-desc="DESCRIPTION (HTML-escaped, truncated to ~180 chars if needed)"
  data-price="from $PRICE"
  data-price-adult="$PRICE"
  data-family-pass=""
  data-duration="Xh"
  data-rating="X.X"
  data-img="assets/thumbs/SLUG-thumb.EXT"
  data-url="OFFICIAL_URL"
  data-notes="NOTES"
  data-tags-json="[&quot;tag1&quot;, &quot;tag2&quot;, ...]">
  <button class="heart-overlay" aria-pressed="false" aria-label="Wishlist DISPLAY NAME">♡</button>
  <div class="card--light__thumb"><img src="assets/thumbs/SLUG-thumb.EXT" alt="DISPLAY NAME" loading="lazy" class="card--light__img"></div>
  <div class="card--light__body">
    <h3>DISPLAY NAME</h3>
    <p class="card--light__hook">DESCRIPTION (truncated to ~120 chars)...</p>
    <div class="card--light__avatars" data-slug="SLUG"></div>
    <div class="card--light__row"><span class="minichip price">from $PRICE</span><span class="minichip">Xh</span><span class="minichip rating">★ X.X</span></div>
  </div>
</article>
```

**Special cases:**
- If `price_adult` is null: use `data-price=""`, `data-price-adult=""`, and omit the price minichip
- If the image is an SVG (like Ripley's which uses `assets/logos/ripleys-logo-white.svg`): use it in both `data-img` and `<img src>`
- Apostrophes in names/descriptions: use `&#x27;` in HTML attributes
- Ampersands: use `&amp;` in visible text, `&amp;` in attributes

## After Inserting Cards

1. Update the `<p class="live-count" id="live-count">` text:
   - Currently shows: `Showing 132 of 132`  (or similar)
   - Find the current number by searching for `live-count`
   - Do NOT change this hardcoded text -- the JS counter updates it dynamically. Leave as-is.
   - Actually: the JS script that sets live-count reads from DOM card count. Just make sure the cards are inserted.

2. Update the filter-chips if any new tags appear in the 10 new cards that don't already have a chip. Check for new unique tags and add corresponding chip buttons to the filter-strip in alphabetical order.
   - Tags in the 10 new cards: 1-2hr, country, family, indoor, music, date-night, pop, rock, tribute, oldies-80s, animals, educational, kid-focused, outdoor, relaxed, variety, thrill, classical, museum, under-1hr, active, food, water
   - Cross-check against existing chips in the `<div class="filter-strip">` block. Most should already be there.

## Quality Gates (run before stopping)

1. `python3 -c "import re; html=open('web/attractions.html').read(); slugs=set(re.findall(r'data-slug=\"([^\"]+)\"', html)); print(len(slugs))"` — must return **144** (134 existing + 10 new)
2. `grep -c 'data-slug="america-s-top-country-hits"' web/attractions.html` — must return 1
3. `grep -c 'data-slug="world-s-largest-toy-museum-complex"' web/attractions.html` — must return 1
4. `grep -c 'data-slug="dolly-parton-s-stampede"' web/attractions.html` — must return 1
5. `grep -c 'pointerdown' web/attractions.html` — must return 0 (Quick Pick code is gone from attractions.html, it's on quick-pick.html now)
6. `grep -c 'deck-mode-toggle' web/attractions.html` — must return 0

## Completion Report

When done:
1. List exactly what you added (10 card slugs confirmed present).
2. Confirm quality gate results (all 6).
3. Note any image path decisions (especially Ripley's SVG).
4. STOP. Do not commit, push, or run the generator.
Hermes will verify and push after confirmation.
