# Tag classification diff - v2 (claude-sonnet-4-6)

- Generated: 2026-04-21 17:56
- Model: claude-sonnet-4-6 @ temperature=0
- Vocabulary: Round 8
- Total rows: 139
- Unchanged: 1
- Changed: 138
- Teaching agreement: 6/26 (23%)
- Cost: $1.38 (in=376829, out=16959 tokens)

---

## Teaching-set consistency check

| slug | name | v2 output | agrees? |
|------|------|-----------|---------|
| 1-hits-of-the-60s-and-50s-too | #1 Hits of the 60s (and 50s Too!) | music,variety,oldies-50s,oldies-60s,family,indoor,active,1-2hr | yes |
| anthems-of-rock | Anthems of Rock | music,tribute,rock,oldies-80s,adult-humor,date-night,indoor,1-2hr | no |
| bohemian-queen | Bohemian Queen | music,variety,rock,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | no |
| branson-dinosaur-museum | Branson Dinosaur Museum | family,indoor,educational,museum,history,animals,1-2hr | no |
| branson-duck-tours | Branson Duck Tours | family,date-night,outdoor,ride,active,1-2hr | no |
| branson-hills-golf-club | Branson Hills Golf Club | family,date-night,outdoor,active,half-day,1-2hr | no |
| branson-s-famous-baldknobbers | Branson’s Famous Baldknobbers | music,variety,country,family,date-night,indoor,1-2hr | no |
| copperhead-mountain-coaster | Copperhead Mountain Coaster | family,date-night,outdoor,ride,thrill,under-1hr | no |
| dolly-partons-stampede | Dolly Parton's Stampede | variety,country,family,date-night,indoor,food,1-2hr | no |
| grand-jubilee | Grand Jubilee | variety,music,country,gospel,family,indoor,1-2hr | no |
| nashville-roadhouse-live | Nashville Roadhouse Live | music,variety,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | no |
| ozark-hills-winery-wine-tasting | Ozark Hills Winery Wine Tasting | date-night,indoor,relaxed,food,1-2hr | no |
| ozarks-aglow-nighttime-walk | Ozarks Aglow Nighttime Walk | family,outdoor,educational,1-2hr | no |
| retromania | Retromania | family,indoor,1-2hr | no |
| riga-tony-s-murder-mystery-dinner-show | Riga-Tony’s Murder Mystery Dinner Show | variety,adult-humor,date-night,indoor,food,active,2-3hr | no |
| shepherd-of-the-hills-inspiration-tower | Shepherd of the Hills Inspiration Tower | family,outdoor,educational,relaxed,1-2hr | yes |
| shepherd-of-the-hills-north-pole-adventure | Shepherd of the Hills - North Pole Adventure | family,outdoor,educational,1-2hr | no |
| shepherd-s-great-american-chuckwagon-dinner-show | Shepherd’s Great American Chuckwagon Dinner Show | variety,country,family,date-night,outdoor,food,active,half-day | no |
| shepherd-s-wild-west-showdown | Shepherd’s Wild West Showdown | variety,family,outdoor,1-2hr | yes |
| silver-dollar-cityand8217-s-showboat | Branson Showboat | variety,family,date-night,indoor,2-3hr | yes |
| six | SIX | music,variety,adult-humor,date-night,indoor,1-2hr | no |
| the-revollusionists | The Revollusionists | variety,magic,family,date-night,indoor,1-2hr | yes |
| the-social-birdy-putting-golf | The Social Birdy Putting Golf | family,date-night,outdoor,active,1-2hr | no |
| the-sons-of-britches | The Sons of Britches | music,variety,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,relaxed,1-2hr | no |
| where-jesus-walked-immersive | Where Jesus Walked Immersive | variety,family,religious,indoor,educational,relaxed,1-2hr | no |
| white-water | White Water | family,outdoor,water,all-day,half-day | yes |

---

## All 139 rows - change detail

| slug | name | v1 tags | v2 tags | change_type |
|------|------|---------|---------|-------------|
| 1-hits-of-the-60s-and-50s-too | #1 Hits of the 60s (and 50s Too!) | music,variety,oldies-50s,oldies-60s,family,indoor,active,all-day | music,variety,oldies-50s,oldies-60s,family,indoor,active,1-2hr | tags-both |
| a-garth-tribute | A Garth Tribute | tribute,adult-humor,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| a-neil-diamond-tribute-ft-keith-allynn | A Neil Diamond Tribute ft. Keith Allynn | tribute,oldies-70s,oldies-80s,adult-humor,date-night | music,tribute,pop,oldies-70s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| a-shepherd-s-christmas-carol | A Shepherd’s Christmas Carol | variety,family,date-night,indoor,1-2hr,educational | variety,music,gospel,country,family,religious,indoor,food,relaxed,1-2hr | tags-both |
| aaron-wayne-comedy-hypnosis-show | Aaron Wayne Comedy Hypnosis Show | comedy,magic,adult-humor,date-night,indoor,1-2hr | comedy,adult-humor,date-night,family,indoor,relaxed,1-2hr | tags-both |
| abby-lee-miller-live-at-the-top-of-the-pyramid | Abby Lee Miller: Live At The Top Of The Pyramid | music,tribute,adult-humor,date-night,indoor,1-2hr | variety,adult-humor,date-night,family,indoor,1-2hr | tags-both |
| absolutely-country-definitely-gospel | Absolutely Country, Definitely Gospel | music,country,gospel,family,indoor,1-2hr | music,country,gospel,family,religious,indoor,relaxed,1-2hr | tags-added |
| america-s-top-country-hits | America's Top Country Hits | music,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family | music,country,family,indoor,1-2hr | tags-both |
| americana-new-year-s-eve-show | Americana New Year’s Eve Show | variety,adult-humor,date-night,indoor,1-2hr | music,variety,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | tags-both |
| anthems-of-rock | Anthems of Rock | music,tribute,rock,oldies-80s,adult-humor,date-night,indoor,active,all-day | music,tribute,rock,oldies-80s,adult-humor,date-night,indoor,1-2hr | tags-both |
| awesome-80-s | Awesome 80's | tribute,oldies-80s,adult-humor,date-night,indoor,1-2hr | music,tribute,oldies-80s,rock,pop,family,date-night,indoor,1-2hr | tags-both |
| back-to-country-with-mark-aldred | Back To Country With Mark Aldred | music,country,family,date-night | music,tribute,country,family,date-night,indoor,1-2hr | tags-added |
| back-to-the-bee-gees | Back To The Bee Gees | tribute,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | music,tribute,pop,oldies-70s,oldies-80s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| best-of-dean-martin-tribute | Best of Dean Martin Tribute | tribute,oldies-50s,oldies-60s,adult-humor,date-night | music,tribute,oldies-50s,oldies-60s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| bluegrass-bbq-festival | Bluegrass & BBQ Festival | music,bluegrass,family,outdoor,food,all-day | music,bluegrass,family,outdoor,food,active,half-day,all-day | tags-added |
| bohemian-queen | Bohemian Queen | variety,adult-humor,date-night,indoor,1-2hr | music,variety,rock,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | tags-added |
| branson-comedy-bash-dinner-show | Branson Comedy Bash Dinner Show | comedy,adult-humor,date-night,indoor,1-2hr,food | comedy,variety,family,adult-humor,date-night,indoor,food,1-2hr | tags-added |
| branson-murder-mystery-show | Branson Murder Mystery Show | comedy,adult-humor,date-night,indoor,1-2hr | comedy,variety,adult-humor,date-night,family,indoor,food,active,1-2hr | tags-added |
| branson-s-famous-baldknobbers | Branson’s Famous Baldknobbers | music,variety,family,date-night,indoor,1-2hr,all-day | music,variety,country,family,date-night,indoor,1-2hr | tags-both |
| brett-daniels | Brett Daniels | comedy,adult-humor,date-night,indoor,1-2hr | magic,variety,family,date-night,indoor,1-2hr | tags-both |
| british-invasion | British Invasion | music,tribute,oldies-60s,adult-humor,date-night,indoor,1-2hr | music,tribute,rock,oldies-60s,family,date-night,indoor,1-2hr | tags-both |
| broadway-to-buble-starring-george-dyer | Broadway to Buble starring George Dyer | music,tribute,oldies-50s,oldies-60s,oldies-70s,pop,adult-humor,date-night,indoor,relaxed,all-day | music,variety,pop,oldies-60s,oldies-70s,date-night,family,indoor,relaxed,1-2hr | tags-both |
| carpenters-once-more | Carpenters Once More | tribute,oldies-70s,pop,adult-humor,date-night,indoor,relaxed,under-1hr | music,tribute,pop,oldies-70s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| classic-country-and-comedy | Classic Country and Comedy | music,comedy,country,family | music,comedy,country,family,indoor,1-2hr | tags-added |
| classic-rock-icons | Classic Rock Icons | music,tribute,rock,oldies-70s,oldies-80s,adult-humor,date-night | music,tribute,rock,adult-humor,date-night,indoor,1-2hr | tags-both |
| clay-cooper-s-country-express | Clay Cooper's Country Express | music,country,family,indoor,1-2hr | music,variety,country,family,indoor,1-2hr | tags-added |
| comedy-jamboree | Comedy Jamboree | comedy,family,indoor,1-2hr | comedy,variety,family,indoor,1-2hr | tags-added |
| dan-wagner-s-johnny-cash-friends-tribute | Dan Wagner’s Johnny Cash & Friends Tribute | tribute,country,oldies-60s,oldies-70s,family,date-night,indoor,1-2hr,relaxed | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| darryl-worley | Darryl Worley | music,country,oldies-90s,family,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-both |
| david-sight-sound-theatres | DAVID (Sight & Sound Theatres) | drama,tribute,family,date-night,indoor,educational,all-day | drama,music,gospel,family,religious,indoor,relaxed,2-3hr | tags-both |
| dean-z-the-ultimate-elvis | Dean Z - The Ultimate Elvis | tribute,oldies-50s,oldies-60s,adult-humor,date-night | tribute,music,rock,oldies-50s,oldies-60s,family,date-night,indoor,1-2hr | tags-both |
| dolly-partons-stampede | Dolly Parton's Stampede | variety,country,rock,family,date-night,indoor,active,food,all-day,1-2hr | variety,country,family,date-night,indoor,food,1-2hr | tags-removed |
| doo-wop-more | Doo Wop & More | music,oldies-50s,oldies-50s,family,date-night,indoor,relaxed,1-2hr | music,variety,oldies-50s,oldies-60s,family,date-night,indoor,relaxed,1-2hr | tags-added |
| doug-gabriel-the-ultimate-variety-show | Doug Gabriel - The Ultimate Variety Show | variety,adult-humor,date-night,indoor,1-2hr | variety,music,country,pop,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | tags-both |
| down-home-country | Down Home Country | music,country,family | music,variety,country,family,indoor,1-2hr | tags-added |
| dublin-s-irish-tenors-the-celtic-ladies | Dublin's Irish Tenors & The Celtic Ladies | music,tribute,classical,adult-humor,date-night,indoor,relaxed,1-2hr | music,variety,classical,pop,family,date-night,indoor,1-2hr | tags-both |
| gene-watson | Gene Watson | music,country,family,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-added |
| george-jones-haggard-friends | George Jones, Haggard & Friends | tribute,country,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| george-strait-tribute | George Strait Tribute | tribute,country,family,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-added |
| golden-sounds-of-the-platters | Golden Sounds of the Platters | music,oldies-50s,oldies-60s,family,date-night,indoor,relaxed,all-day | music,tribute,oldies-50s,oldies-60s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| grand-jubilee | Grand Jubilee | variety,family,indoor,1-2hr | variety,music,country,gospel,family,indoor,1-2hr | tags-added |
| hamners-unbelievable-variety-show | Hamners' Unbelievable Variety Show | variety,family,indoor,1-2hr | variety,magic,family,date-night,indoor,1-2hr | tags-added |
| hamners-all-american-new-year-s-eve-celebration | Hamners’ All American New Year’s Eve Celebration | variety,adult-humor,date-night,indoor,1-2hr | variety,family,date-night,indoor,1-2hr | tags-both |
| hot-rods-high-heels | Hot Rods & High Heels | comedy,variety,adult-humor,date-night,indoor,1-2hr | music,variety,oldies-50s,oldies-60s,rock,family,date-night,indoor,1-2hr | tags-both |
| hughes-brothers-country-show | Hughes Brothers Country Show | music,country,family,date-night | music,variety,country,family,date-night,indoor,1-2hr | tags-added |
| hughes-music-show | Hughes Music Show | music,family,date-night,indoor,1-2hr | music,variety,country,oldies-50s,oldies-60s,oldies-70s,family,date-night,indoor,1-2hr | tags-added |
| illusionist-rick-thomas | Illusionist Rick Thomas | magic,adult-humor,date-night,indoor,1-2hr | magic,variety,family,date-night,indoor,1-2hr | tags-both |
| jerry-presley-elvis-live | Jerry Presley Elvis Live! | tribute,oldies-50s,oldies-60s,adult-humor,date-night,indoor,relaxed,1-2hr | music,tribute,rock,oldies-50s,oldies-60s,family,date-night,indoor,1-2hr | tags-both |
| jimmy-fortune | Jimmy Fortune | music,country,gospel,family,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-both |
| joe-nichols | Joe Nichols | music,country,family,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-added |
| josh-turner | Josh Turner | music,country,oldies-80s,family,date-night | music,country,family,date-night,indoor,1-2hr | tags-both |
| kenny-rogers-tribute | Kenny Rogers Tribute | tribute,country,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| kentucky-headhunters | Kentucky Headhunters | music,rock,country,adult-humor,date-night | music,country,rock,family,date-night,indoor,1-2hr | tags-both |
| legends-in-concert | Legends in Concert | tribute,family,indoor,1-2hr | tribute,music,country,rock,pop,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | tags-added |
| malpass-brothers-friends | Malpass Brothers & Friends | music,country,bluegrass,family,date-night | music,country,family,date-night,indoor,1-2hr | tags-both |
| matt-gumm-and-company | Matt Gumm and Company | comedy,adult-humor,date-night,indoor,1-2hr | comedy,variety,family,adult-humor,indoor,1-2hr | tags-both |
| melody-hart-the-all-star-band | Melody Hart & The All Star Band | music,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr,relaxed | music,variety,country,pop,family,date-night,indoor,1-2hr | tags-both |
| menopause-the-musical | Menopause The Musical | (same) | (same) | unchanged |
| motown-downtown | Motown Downtown | music,tribute,oldies-60s,oldies-70s,adult-humor,date-night,indoor,relaxed,1-2hr | music,tribute,oldies-60s,oldies-70s,pop,family,date-night,indoor,1-2hr | tags-both |
| nashville-roadhouse-live | Nashville Roadhouse Live | music,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,all-day,1-2hr | music,variety,country,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | tags-both |
| neal-mccoy | Neal McCoy | music,country,rock,adult-humor,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-both |
| new-jersey-nights | New Jersey Nights | tribute,oldies-60s,oldies-70s,adult-humor,date-night,indoor,1-2hr | music,tribute,oldies-60s,pop,family,date-night,indoor,relaxed,1-2hr | tags-both |
| new-south-gospel | New South Gospel | music,gospel,gospel,family | music,gospel,country,family,religious,indoor,relaxed,1-2hr | tags-added |
| orbison-still | Orbison Still | tribute,rock,oldies-50s,oldies-60s,adult-humor,date-night | music,tribute,oldies-60s,rock,family,date-night,indoor,relaxed,1-2hr | tags-both |
| outpost-opry-variety-show-w-joey-garland | Outpost Opry Variety Show w/ Joey Garland | variety,family,date-night,indoor,1-2hr | variety,music,country,family,indoor,1-2hr | tags-both |
| ozarks-country | Ozarks Country | music,country,family | music,variety,country,family,indoor,1-2hr | tags-added |
| ozarks-gospel | Ozarks Gospel | music,gospel,family | music,gospel,family,religious,indoor,relaxed,1-2hr | tags-added |
| patsy-to-patsy | Patsy to Patsy | music,tribute,country,oldies-60s,oldies-70s,family,date-night | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| pierce-arrow-30th-anniversary | Pierce Arrow 30th Anniversary | music,country,family,date-night,indoor,1-2hr | music,variety,country,family,date-night,indoor,1-2hr | tags-added |
| pierce-arrow-gospel | Pierce Arrow Gospel | music,gospel,gospel,family,adult-humor,indoor,relaxed,all-day | music,variety,gospel,country,family,religious,indoor,1-2hr | tags-both |
| pierce-arrow-decades | Pierce Arrow: Decades | music,variety,oldies-50s,oldies-60s,oldies-70s,oldies-80s,adult-humor,date-night,indoor,all-day | music,variety,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,1-2hr | tags-both |
| queens-of-soul | Queens of Soul | tribute,oldies-60s,oldies-70s,adult-humor,date-night,indoor,1-2hr | music,tribute,pop,oldies-60s,oldies-70s,family,date-night,indoor,1-2hr | tags-both |
| re-vibe-dinner-show | Re-Vibe Dinner Show | music,family,indoor,1-2hr | music,variety,pop,oldies-70s,oldies-80s,family,date-night,indoor,food,1-2hr | tags-added |
| reza-edge-of-illusion | Reza Edge of Illusion | magic,variety,adult-humor,date-night,indoor,relaxed,1-2hr | magic,variety,family,date-night,indoor,1-2hr | tags-both |
| rick-mcewen-presents-the-gambler | Rick McEwen Presents The Gambler | tribute,adult-humor,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| riga-tony-s-murder-mystery-dinner-show | Riga-Tony’s Murder Mystery Dinner Show | variety,adult-humor,date-night,indoor,food,active,all-day | variety,adult-humor,date-night,indoor,food,active,2-3hr | tags-both |
| ripley-s-believe-it-or-not | Ripley's Believe It or Not | family,indoor,active,educational,all-day,under-1hr | family,kid-focused,indoor,museum,educational,relaxed,under-1hr,1-2hr | tags-both |
| rock-n-roll-sunrise | Rock N Roll Sunrise | music,rock,oldies-50s,oldies-60s,oldies-70s,oldies-80s,adult-humor,date-night | music,tribute,rock,oldies-50s,oldies-60s,family,date-night,indoor,1-2hr | tags-both |
| separate-journeys | Separate Journeys | music,adult-humor,date-night | variety,drama,adult-humor,date-night,indoor,1-2hr | tags-both |
| shanghai-circus | Shanghai Circus | variety,family,kid-focused,indoor,active,thrill,1-2hr | variety,family,kid-focused,indoor,1-2hr | tags-removed |
| shepherd-of-the-hills-outdoor-drama | Shepherd of the Hills Outdoor Drama | drama,family,date-night,outdoor,1-2hr | drama,family,outdoor,relaxed,2-3hr,history | tags-both |
| shepherd-s-great-american-chuckwagon-dinner-show | Shepherd’s Great American Chuckwagon Dinner Show | variety,family,date-night,indoor,food,active,all-day | variety,country,family,date-night,outdoor,food,active,half-day | tags-both |
| shepherd-s-wild-west-showdown | Shepherd’s Wild West Showdown | variety,family,adult-humor,indoor,1-2hr | variety,family,outdoor,1-2hr | tags-both |
| silver-dollar-cityand8217-s-showboat | Branson Showboat | variety,family,date-night,indoor,all-day | variety,family,date-night,indoor,2-3hr | tags-both |
| six | SIX | music,variety,adult-humor,date-night,indoor,active,educational,all-day | music,variety,adult-humor,date-night,indoor,1-2hr | tags-both |
| smoke-on-the-mountain | Smoke On The Mountain | music,tribute,gospel,country,family,date-night,indoor,relaxed,1-2hr | music,comedy,gospel,country,family,religious,indoor,1-2hr | tags-both |
| southern-gospel-sundays-with-the-frosts | Southern Gospel Sundays with The Frosts | music,gospel,gospel,family,adult-humor,indoor,relaxed,1-2hr | music,gospel,family,religious,indoor,relaxed,1-2hr | tags-both |
| steve-sanders-the-mind-spy | Steve Sanders The Mind Spy | magic,adult-humor,family,indoor,1-2hr | variety,magic,family,date-night,indoor,1-2hr | tags-both |
| strait-to-branson-a-george-strait-tribute | Strait to Branson - A George Strait Tribute | tribute,country,oldies-80s,oldies-90s,adult-humor,date-night,indoor,1-2hr | music,tribute,country,family,date-night,indoor,1-2hr | tags-both |
| the-bellamy-brothers | The Bellamy Brothers | music,country,rock,adult-humor,date-night | music,country,family,date-night,indoor,relaxed,1-2hr | tags-both |
| the-duttons | The Duttons | music,family,date-night,indoor,1-2hr | music,variety,country,family,indoor,1-2hr | tags-both |
| the-gatlin-brothers | The Gatlin Brothers | music,country,oldies-70s,oldies-80s,family,date-night | music,country,family,date-night,indoor,1-2hr | tags-both |
| the-haygoods | The Haygoods | music,gospel,country,family | music,variety,country,pop,family,date-night,indoor,1-2hr | tags-both |
| the-heatherlys-hits-on-route-66 | The Heatherlys Hits On Route 66 | music,country,oldies-50s,oldies-60s,oldies-70s,family,date-night | music,variety,country,oldies-50s,oldies-60s,oldies-70s,family,date-night,indoor,1-2hr | tags-added |
| the-mountain-hollers-family-band | The Mountain Hollers Family Band | music,country,bluegrass,family,indoor,1-2hr | music,variety,country,bluegrass,family,indoor,relaxed,1-2hr | tags-added |
| the-petersens | The Petersens | music,bluegrass,family | music,bluegrass,country,family,indoor,relaxed,1-2hr | tags-added |
| the-revollusionists | The Revollusionists | variety,family,date-night,indoor,1-2hr | variety,magic,family,date-night,indoor,1-2hr | tags-added |
| the-sons-of-britches | The Sons of Britches | music,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,relaxed,all-day | music,variety,oldies-50s,oldies-60s,oldies-70s,oldies-80s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| the-sound-of-simon-garfunkel | The Sound of Simon & Garfunkel | tribute,oldies-60s,oldies-70s,adult-humor,date-night,indoor,1-2hr,relaxed | music,tribute,oldies-60s,oldies-70s,family,date-night,indoor,relaxed,1-2hr | tags-both |
| the-texas-tenors | The Texas Tenors | music,country,oldies-50s,oldies-60s,oldies-70s,family,date-night | music,country,pop,classical,family,date-night,indoor,relaxed,1-2hr | tags-both |
| tracy-byrd | Tracy Byrd | music,country,family,date-night | music,country,family,date-night,indoor,1-2hr | tags-added |
| ultimate-70s-show | Ultimate 70s Show | music,variety,oldies-70s,pop,rock,adult-humor,date-night,indoor,all-day,1-2hr | music,tribute,oldies-70s,pop,rock,family,date-night,indoor,1-2hr | tags-both |
| ultimate-elvis-contest-headliner-act-cote-deonath | Ultimate Elvis Contest Headliner Act: Cote Deonath | tribute,oldies-50s,oldies-60s,adult-humor,date-night,indoor,1-2hr | music,tribute,rock,oldies-50s,oldies-60s,family,date-night,indoor,1-2hr | tags-both |
| where-jesus-walked-immersive | Where Jesus Walked Immersive | variety,adult-humor,date-night,indoor,educational,relaxed | variety,family,religious,indoor,educational,relaxed,1-2hr | tags-both |
| whodunnit-hoedown-murder-mystery-dinner-show | WhoDunnit Hoedown Murder Mystery Dinner Show | variety,drama,country,family,indoor,food,educational,1-2hr | variety,comedy,country,family,adult-humor,date-night,indoor,food,active,1-2hr | tags-both |
| zep-la | Zep-LA | tribute,oldies-60s,oldies-70s,oldies-80s,adult-humor,date-night | music,tribute,rock,oldies-60s,oldies-70s,oldies-80s,adult-humor,date-night,indoor,1-2hr | tags-added |
| butterfly-palace-rainforest-adventure | Butterfly Palace & Rainforest Adventure | family,kid-focused,indoor,educational,animals,all-day,1-2hr | family,kid-focused,indoor,animals,educational,relaxed,1-2hr | tags-both |
| copperhead-mountain-coaster | Copperhead Mountain Coaster | date-night,family,indoor,ride,thrill,under-1hr | family,date-night,outdoor,ride,thrill,under-1hr | tags-both |
| fritzs-adventure | Fritz's Adventure | active,indoor,outdoor,ride,active,thrill,1-2hr | family,indoor,outdoor,active,thrill,1-2hr | tags-both |
| bransons-wild-world | Branson's Wild World | family,kid-focused,indoor,outdoor,animals,all-day | family,kid-focused,indoor,outdoor,animals,educational,relaxed,1-2hr | tags-both |
| titanic-museum-attraction | Titanic Museum Attraction | family,educational,indoor,museum,educational,1-2hr | family,date-night,indoor,museum,relaxed,educational,history,1-2hr | tags-added |
| adventure-seekers | Adventure Seekers | adult-humor,date-night,outdoor,active,thrill,all-day | family,active,1-2hr | tags-both |
| aquarium-at-the-boardwalk | Aquarium At The Boardwalk | family,indoor,animals,educational,1-2hr | family,kid-focused,indoor,educational,relaxed,animals,1-2hr | tags-added |
| branson-dinosaur-museum | Branson Dinosaur Museum | family,indoor,educational,animals,all-day | family,indoor,educational,museum,history,animals,1-2hr | tags-both |
| branson-scenic-railway | Branson Scenic Railway | family,indoor,ride,relaxed,half-day | family,date-night,outdoor,ride,relaxed,educational,history,1-2hr | tags-both |
| branson-hills-golf-club | Branson Hills Golf Club | adult-humor,outdoor,active,all-day,half-day | family,date-night,outdoor,active,half-day,1-2hr | tags-both |
| branson-duck-tours | Branson Duck Tours | family,date-night,indoor,outdoor,ride,active,all-day,1-2hr | family,date-night,outdoor,ride,active,1-2hr | tags-removed |
| branson-zipline-at-wolfe-mountain | Branson Zipline at Wolfe Mountain | active,thrill,outdoor,ride,all-day,1-2hr | family,date-night,outdoor,active,thrill,half-day,1-2hr | tags-both |
| coral-reef-mini-golf | Coral Reef Mini Golf | family,kid-focused,outdoor,active,all-day | family,date-night,outdoor,active,under-1hr,1-2hr | tags-both |
| hollywood-wax-museum-entertainment-center | Hollywood Wax Museum Entertainment Center | family,indoor,educational,relaxed,all-day | family,indoor,museum,relaxed,educational,1-2hr | tags-both |
| ozark-hills-winery-wine-tasting | Ozark Hills Winery Wine Tasting | adult-humor,indoor,relaxed,food,all-day | date-night,indoor,relaxed,food,1-2hr | tags-both |
| ozarks-aglow-nighttime-walk | Ozarks Aglow Nighttime Walk | family,outdoor,educational,all-day | family,outdoor,educational,1-2hr | tags-both |
| parakeet-pete-s | Parakeet Pete's | family,indoor,educational,animals,under-1hr | family,animals,outdoor,1-2hr | tags-both |
| pink-jeep-tours | Pink Jeep Tours | family,outdoor,active,educational,half-day | family,date-night,outdoor,ride,active,1-2hr | tags-both |
| retromania | Retromania | all-day,outdoor,active,educational,thrill,under-1hr | family,indoor,1-2hr | tags-both |
| runaway-mountain-coaster | Runaway Mountain Coaster | family,outdoor,ride,thrill,under-1hr | family,date-night,outdoor,ride,thrill,under-1hr | tags-added |
| shepherd-of-the-hills-historic-homestead-tour | Shepherd of the Hills Historic Homestead Tour | family,indoor,outdoor,educational,history,relaxed,under-1hr,1-2hr | family,outdoor,educational,history,relaxed,1-2hr | tags-removed |
| shepherd-of-the-hills-vigilante-extreme-ziprider | Shepherd of the Hills Vigilante Extreme ZipRider | adult-humor,date-night,outdoor,ride,thrill,half-day | family,date-night,outdoor,ride,thrill,active,1-2hr | tags-both |
| shepherd-of-the-hills-great-woodsman-canopy-tours | Shepherd of the Hills Great Woodsman Canopy Tours | active,thrill,outdoor,ride,active,thrill,half-day | family,date-night,outdoor,active,thrill,2-3hr | tags-both |
| shepherd-of-the-hills-north-pole-adventure | Shepherd of the Hills - North Pole Adventure | family,outdoor,educational,all-day | family,outdoor,educational,1-2hr | tags-both |
| shepherd-of-the-hills-inspiration-tower | Shepherd of the Hills Inspiration Tower | family,indoor,educational,relaxed,half-day | family,outdoor,educational,relaxed,1-2hr | tags-both |
| silver-dollar-city | Silver Dollar City | family,date-night,indoor,outdoor,ride,active,thrill,all-day | family,outdoor,ride,thrill,active,food,shopping,half-day,all-day | tags-both |
| snowflex-tubing-at-wolfe-mountain | Snowflex Tubing at Wolfe Mountain | family,outdoor,active,thrill,half-day | family,outdoor,active,thrill,1-2hr | tags-both |
| the-social-birdy-putting-golf | The Social Birdy Putting Golf | family,date-night,indoor,active,all-day,under-1hr,1-2hr | family,date-night,outdoor,active,1-2hr | tags-both |
| truth-traveler | Truth Traveler | outdoor,active,half-day | family,religious,indoor,educational,relaxed,1-2hr | tags-both |
| veterans-memorial-museum | Veterans Memorial Museum | family,indoor,educational,relaxed,history,under-1hr,1-2hr | family,indoor,museum,educational,relaxed,history,1-2hr | tags-both |
| white-water | White Water | family,outdoor,water,all-day | family,outdoor,water,all-day,half-day | tags-added |
| wonderworks | WonderWorks | family,date-night,indoor,educational,active,1-2hr | family,kid-focused,indoor,active,educational,thrill,1-2hr | tags-both |
| world-s-largest-toy-museum-complex | World's Largest Toy Museum Complex | family,indoor,educational,relaxed,all-day | family,kid-focused,indoor,museum,relaxed,educational,1-2hr | tags-both |
