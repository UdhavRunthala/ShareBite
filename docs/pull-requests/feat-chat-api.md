## Summary
Connect donation participants through private real-time conversations and live notifications. Contact information is masked before storage and delivery.

## Changes
- JWT-authenticated Socket.io rooms with per-event participation checks.
- Persisted messages, typing indicators, read receipts and unread notification APIs.
- Server-side phone/email/social masking and rate limits.
- New listing, claim, status and message events reach the relevant accounts.

## How to test
- Join an order as its donor and NGO; send a message containing a phone number.
- Verify both clients receive masked text and an unrelated account cannot join.
- Mark notifications read and verify ownership restrictions.

## Screenshots / notes
- Public socket broadcasts carry invalidation signals only; private listing details are fetched through authorized APIs.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
