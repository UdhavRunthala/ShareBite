# Implementation contracts

## Runtime
Vite proxies `/api`, `/uploads` and Socket.io to Express on port 4000. Express owns all authorization and state transitions. React Query owns server state and invalidates affected queries on socket events. JWTs identify users; each protected request rechecks bans and role in MongoDB.

`MONGO_URI` is optional. Connection failure falls back to a MongoDB memory server with a short timeout and explicit mode logging. Memory mode seeds on each fresh boot. Seed CLI uses the configured database, or starts a temporary instance to validate the complete seed. MongoDB's binary is downloaded on first install/start, so the first run requires internet. Persistent data requires a reachable MongoDB URI.

## Privacy and integrity
Listings expose rounded neighbourhood coordinates and omit exact addresses until the requesting NGO has claimed the listing. Private listings are visible only to their donor, invited NGO and administrators. User/profile serializers omit passwords and contact details. Chat uses authenticated per-order rooms; only the donor and claimant can join. Contact masking happens on the server, and raw contact text is never delivered to clients.

Claims use an atomic conditional update from Available to Claimed. Only verified, unbanned NGOs can claim. Order transitions are enforced on the server and distribution requires an image plus a bounded positive people-fed count. Leaderboards aggregate distributed orders rather than trusting stored donation counts. Reviews require participation and completed distribution, with one review per reviewer per order.

## Demo and production
Seed organisations, registrations, reviews and documents are fictional and visibly identified as demo content. Demo login is disabled in production unless explicitly enabled. Production requires a supplied JWT secret. Development generates an ephemeral signing secret when missing. Uploads accept bounded raster images; verification documents can include PDF. Upload access is scoped to the relevant user/order or administrator.

## Product assumptions
The safety countdown is a conservative planning estimate, not certification of food safety. Donors attest to handling and must provide an earlier pickup deadline when needed. Food category determines the default window, and the server validates dates. CO2 and weight figures are clearly labelled estimates; recognition counts distribution-proof submissions and does not imply external inspection.
