# Thumbnail Record for Branson 2026 Attractions

**Created:** 2026-04-19 by Hermes  
**Purpose:** Complete record of thumbnail sources and processing steps for auditability. All thumbnails were side-by-side doubles from americanatheatrebranson.com. Process: downloaded with curl, cropped left half (248x132 from 496x132 originals) using ImageMagick `convert -crop 248x132+0+0 +repage`, saved to `web/assets/thumbs/`. Updated `data/attractions.json` image field and regenerated `attractions.html` (both vault and iCloud copies) to use them. Left half selected as it contained the primary/clean icon.

## Thumbnail Log (Processed One at a Time)

| Show Name | Slug | Source URL | Process Details | Saved As | Notes |
|-----------|------|------------|-----------------|----------|-------|
| Absolutely Country, Definitely Gospel | absolutely-country-definitely-gospel | https://americanatheatrebranson.com/images/icon-ac.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/absolutely-country-definitely-gospel-thumb.png | Left half used. Official icon. |
| Awesome 80s | awesome-80s | https://americanatheatrebranson.com/images/icon-ae.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/awesome-80s-thumb.png | Left half used. High-energy 80s theme visible. |
| Classic Country and Comedy | classic-country-and-comedy | https://americanatheatrebranson.com/images/icon-cc.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/classic-country-and-comedy-thumb.png | Left half used. |
| Aaron Wayne Clean Comedy Hypnosis | aaron-wayne-clean-comedy-hypnosis | https://americanatheatrebranson.com/images/icon-ch.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/aaron-wayne-clean-comedy-hypnosis-thumb.png | Left half used. Matches existing thumb style. |
| America's Top Country Hits | americas-top-country-hits | https://americanatheatrebranson.com/images/icon-cv.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/americas-top-country-hits-thumb.png | Left half used. |
| Patsy Cline and Friends | patsy-cline-and-friends | https://americanatheatrebranson.com/images/icon-pc.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/patsy-cline-and-friends-thumb.png | Left half used. |
| Illusionist Rick Thomas | illusionist-rick-thomas | https://americanatheatrebranson.com/images/icon-rt.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/illusionist-rick-thomas-thumb.png | Left half used. Magic theme. |
| Kenny Rogers Tribute (The Gambler) | kenny-rogers-tribute | https://americanatheatrebranson.com/images/icon-tg.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/kenny-rogers-tribute-thumb.png | Left half used. |
| The Heatherlys - Hits on Route 66 | the-heatherlys-hits-on-route-66 | https://americanatheatrebranson.com/images/icon-th.png | curl download → convert -crop 248x132+0+0 → save | assets/thumbs/hits-on-route-66-thumb.png | Left half used. Added as new entry. |

**Process Summary:** All images were identical in dimension (496x132). Cropping the left half produced clean single thumbnails suitable for the dashboard cards. No right-half content was used. Files are in `web/assets/thumbs/` and referenced in JSON. HTML regenerated to display them with price grids, durations, and notes matching the 60s show and Ripley's style.

This record is saved in the notes/ folder for future reference. Memory updated with preference for documenting thumbnail sources and cropping process.

Last updated: 2026-04-19