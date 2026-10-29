## Summary
Complete the donation journey with pickup confirmation, authenticated distribution proofs and two-way reviews. Recognition updates only when a claimed donation has actually reached the distribution stage.

## Changes
- Participant-scoped orders with exact collection details and unread counts.
- Bounded raster uploads with content-signature checks and protected document/proof access.
- Enforced status transitions, proof ownership and people-fed limits.
- Completed-order reviews and automatic certificate snapshots.

## How to test
- Claim a donation, confirm pickup and submit an uploaded distribution photo.
- Attempt duplicate completion, an outsider's proof and a premature review; expect rejection.
- Inspect recognition totals after completion.

## Screenshots / notes
- Uploaded files remain local in ignored `server/uploads/`.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
