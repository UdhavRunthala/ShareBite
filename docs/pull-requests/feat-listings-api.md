## Summary
Enable donors to post safe collection windows and verified NGOs to discover and claim surplus. Atomic claims prevent two teams collecting the same donation.

## Changes
- Filtered discovery with urgency/distance sorting and rounded public map positions.
- Exact addresses only for owners, confirmed claimants and admins.
- Private invitations, donor templates, cancellation and nearby notifications.

## How to test
- Create a donation through the donor API and query as a public visitor.
- Race two verified NGO claims; only one succeeds.
- Verify exact address appears only after the successful claim.

## Screenshots / notes
- Safety windows are conservative planning estimates; donor declarations remain required.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
