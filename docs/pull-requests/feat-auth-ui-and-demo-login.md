## Summary
Let judges switch instantly between donor, NGO and admin accounts while supporting normal registration. New community members can submit their profile and private verification documents.

## Changes
- Warm split-layout login/register screen and one-click Demo Mode.
- JWT session context, protected client routes and role-aware navigation.
- Profile editing, NGO capacity/vehicle settings and document upload.
- Live socket query refresh and notification toasts.

## How to test
- Sign in using each Demo Mode button, then switch roles.
- Register a new NGO, complete its profile and attach a PDF document.
- Reload the browser and verify the session persists; sign out and verify protected redirects.

## Screenshots / notes
- Mobile bottom navigation keeps account access within thumb reach.
- Uploaded verification files are private and opened through authenticated requests.

## Checklist
- [ ] App runs with no console errors
- [x] Lint/build passes
- [ ] Responsive checked (mobile + desktop)
- [ ] Seed data still works
