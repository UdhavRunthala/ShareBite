## Summary
Establish ShareBite's npm monorepo and design direction before feature development. The client and API run together through one root command.

## Changes
- React 18/Vite client, Express server and declared feature dependencies.
- Shared lint command, production build and environment example.
- Versioned design brief and implementation sequence.

## How to test
- Run `npm install`, `npm run lint` and `npm run build`.
- Run `npm run dev`; check the client and `/api/health`.

## Screenshots / notes
- This branch establishes tooling; the design system follows next.
- MongoDB and seed commands are wired for the server foundation branch.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
