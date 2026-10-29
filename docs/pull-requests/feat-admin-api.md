## Summary
Give administrators document-backed account verification and report moderation. Bans take effect on the next API request and immediately disconnect active sockets.

## Changes
- Admin-only account, order and report views.
- Verification requires submitted documents; review results notify users.
- Ban/unban controls and resolution notes for reports.
- Clearly labelled fictional PDF registration documents in seed accounts.

## How to test
- Attempt admin endpoints as donor; expect 403.
- Open a pending account's PDF as admin, verify it and check its notification.
- Ban a user and confirm its existing token no longer works.

## Screenshots / notes
- Demo documents explicitly state they are fictional and are never exposed through the public directory.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
