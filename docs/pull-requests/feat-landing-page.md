## Summary
Introduce ShareBite through a food-first editorial landing page backed by live seeded API data. Visitors can explore nearby surplus and understand the journey from kitchen to community.

## Changes
- Signature circular food hero, floating donation card and animated impact counters.
- Filterable donation previews, community partners, top donors and four-step guidance.
- Responsive navigation/footer, accessible dialogs and locally bundled fonts/photography.
- Stable server startup during repository branch changes.

## How to test
- Run `npm run dev`, then `node scripts/browser-smoke.mjs`.
- Filter bakery donations, open a preview and switch light/dark themes.
- Inspect desktop and mobile screenshots in `.cache/screenshots`.

## Screenshots / notes
- All twenty seed photos and the hero load locally.
- Reduced-motion screenshots keep below-fold content visible; normal browsing reveals it on scroll.
- Server restarts are explicit after server-source edits; Vite still reloads client changes.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
