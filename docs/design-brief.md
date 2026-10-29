# ShareBite — The neighbourhood table

## Concept
Good food deserves another seat at the table. An editorial, food-first identity combines the confidence of a civic service with the warmth of a neighbourhood kitchen. Jaipur is present in the sandstone accents, local geography and human copy, rather than ornamental clichés. All seeded people and organisations are clearly labelled illustrative demo data.

## Visual system
- Light: paper `#FBF8F3`, ink `#203B32`, primary forest `#244D3E`, muted sage `#E7EDE4`, saffron `#E8AD49`, clay `#BC694E`, border `#E4E4DA`.
- Dark: paper `#15251F`, surfaces `#20332A`, ink `#F6F2E9`, sage `#354D40`, primary `#B9D9B7`, saffron `#F0BB60`, border `#3C5145`.
- Fraunces for expressive editorial headings, Plus Jakarta Sans for interface text. Font fallbacks remain usable offline.
- Spacing: 4/8/12/16/24/32/48/64/96 px. Content width 1280 px. Heading sizes scale with viewport; body 14–18 px with generous line height.
- Radii: controls 12 px, cards 20 px, feature imagery 28 px, pills fully rounded. Shadows use soft forest-tinted layers; borders carry most hierarchy.
- Lucide icons with consistent 1.7 stroke. Photography is generous, cropped intentionally, with an embedded food illustration fallback. No broken-image indicators.

## Motion
160 ms controls, 280 ms reveals, 450 ms major transitions; ease `[0.22,1,0.36,1]`. Stagger lists by 45 ms. Count-up metrics run once; countdown arcs update every second without layout shifts. Respect reduced motion globally and remove decorative looping motion.

## Signature moments
1. **The open table:** oversized serif hero with a circular food portrait and overlapping receipt-like rescue card. A small live community ticker makes the exchange tangible.
2. **A meal's journey:** a continuous four-stop timeline from kitchen to community; claiming transforms a public card into a private collection pass with the unlocked address.
3. **The honour folio:** an ivory and forest certificate with a saffron seal, unique public verification address and downloadable PDF; recognition uses proof-backed meals.
4. **Jaipur is sharing:** map markers resemble small numbered meal tokens, with urgency colour rings and clustered neighbourhood counts.

## Interaction and accessibility
Mobile navigation sits within thumb reach. Forms use short steps, persistent values, sensible Jaipur defaults and explicit validation. Loading skeletons reserve real layout space. Empty states explain the next action. Errors are retryable. Success uses restrained confetti and a concrete next step. All controls have labels, keyboard focus and sufficient contrast in both themes.

## Build plan
1. Monorepo and checks; reusable tokens/components and theme.
2. Express, MongoDB fallback, models, auth, believable seed; verify APIs.
3. Listings, atomic claims, orders, proof, private chat, notifications, recognition and moderation APIs.
4. Landing, authentication, discovery/map, donation form, order flow, chat, recognition, dashboards, directory, admin.
5. Expiry job, security and end-to-end checks, mobile/desktop review, documentation and demo script.

Each focused branch is tested, reviewed and merged before the next begins. PR records document actual verification, including any unavailable checks.
