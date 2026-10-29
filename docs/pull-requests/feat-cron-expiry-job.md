## Summary
Automatically close uncollected donations when their collection or safety window ends. Donors and assigned NGOs receive clear expiry notifications.

## Changes
- Every-minute node-cron task with overlap prevention and shutdown cleanup.
- Conditional status updates prevent duplicate expiry notifications.
- Claimed orders receive an expiry timeline event; completed journeys remain intact.

## How to test
- Run the integration suite, which expires a past-deadline listing twice.
- Confirm the first run expires it and the second performs no changes.
- Check completed orders remain distributed.

## Screenshots / notes
- Discovery and claim endpoints enforce deadlines immediately, even between cron ticks.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
