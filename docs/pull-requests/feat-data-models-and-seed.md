## Summary
Make ShareBite's demo believable with fictional organisations placed in real Jaipur neighbourhoods. Seed timestamps are relative to startup so discovery has active collection windows.

## Changes
- All requested Mongoose models, geospatial indexes and uniqueness constraints.
- 26 donors, 15 NGOs, 68 listings, 36 completed orders, two-way reviews and chat histories.
- Demand requests, reports, notifications, certificates and donor templates.
- Non-destructive seed CLI and automatic memory-mode seed.

## How to test
- Run `npm run seed` and inspect record counts.
- Run `npm run test` for auth, contact masking and safety calculations.
- Start the app and use `/api/auth/demo` with donor, ngo or admin role.

## Screenshots / notes
- All seed organisations and registration numbers are illustrative; none imply real-world verification.
- Stable image URLs use the interface's embedded fallback when unavailable.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
