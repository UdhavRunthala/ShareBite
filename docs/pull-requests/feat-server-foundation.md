## Summary
Provide authenticated API access and zero-configuration MongoDB startup. Invalid or unavailable external MongoDB connections fall back to an isolated in-memory database with explicit logging.

## Changes
- JWT sessions, bcrypt passwords, pending registration and development demo login.
- Server-side role/verification middleware and private user serialization.
- Input validation, bounded request bodies, security headers and rate limits.
- Bundle interface fonts locally to remove external font-loading delays discovered in browser checks.

## How to test
- Run `npm run test`; authentication tests use a real memory MongoDB instance.
- Start with no `.env` and inspect the memory-mode log.
- Submit an admin role to registration; expect HTTP 400.

## Screenshots / notes
- Local typography retains the design brief's fonts while working without Google Fonts requests.
- Seed population is the next focused branch.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
