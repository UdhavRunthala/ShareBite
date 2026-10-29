## Summary
Build ShareBite's reusable visual language before feature pages. Warm typography, food cards and clear progress feedback give the app a consistent identity across roles.

## Changes
- Light/dark tokens, responsive spacing, accessible focus and reduced-motion support.
- Buttons, cards, fields, badges, loading/error/empty states and avatars.
- Countdown rings, status timeline, listing cards, chat bubbles and recognition podium.

## How to test
- Run `npm run dev`, then `node scripts/browser-smoke.mjs`.
- Toggle the theme and inspect keyboard focus, 390px mobile and 1440px desktop layouts.
- Run lint and build.

## Screenshots / notes
- Screenshots are generated locally under `.cache/screenshots`.
- Preview metrics describe the component system, not fabricated platform impact.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
