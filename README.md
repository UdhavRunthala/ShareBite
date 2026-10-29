# ShareBite

A neighbourhood table for Jaipur: share surplus food with verified community organisations.

## Development

Requires Node.js 20.19+ (Node 22 LTS recommended) and npm 10+.

```sh
npm install
npm run dev
```

The client uses http://localhost:5173 and proxies API requests to port 4000. Run `npm run lint` and `npm run build` to check the workspace. Environment settings are documented in `.env.example`; never commit your `.env`.

## Design and implementation

The [design brief](docs/design-brief.md) defines the neighbourhood-table identity. [Architecture contracts](docs/architecture.md) describe authorization, data privacy, seed behaviour and runtime assumptions. Existing feature branches were merged through pull requests; descriptions are retained under `docs/pull-requests/`. The current continuation uses direct, focused commits to main with owner authorization.

Current milestone: landing page, authentication, one-click demo roles, private verification profiles, seeded Jaipur data, backend feature APIs and automatic expiry are merged. Discovery/map and the remaining feature screens are next. The complete end-to-end demo is not implemented yet.

## Demo accounts

All three accounts use `Demo@1234`: `donor@demo.com`, `ngo@demo.com`, and `admin@demo.com`. The login page also offers one-click role buttons. Demo organisations, documents and histories are fictional.

## Database and startup troubleshooting

Without a reachable `MONGO_URI`, ShareBite starts MongoDB through `mongodb-memory-server` and seeds the demo. The first install/start needs internet to download MongoDB's native binary and a supported OS capable of running it. Memory data resets on shutdown; use a reachable MongoDB URI for persistence. `npm run seed` validates the seed in a temporary database when no persistent URI is available.

The API welcome page is http://localhost:4000/; the app is http://localhost:5173/. `/api/health` returns 200 when connected, or 503 if the database disconnects. Startup reports the failing stage and exits unsuccessfully rather than serving a pretend healthy app.

If `npm run dev` stops, run `npm run dev -w server` alone to see the API error:

- **Port already in use:** stop the previous API/dev terminal, then restart. On Windows, `netstat -ano | findstr :4000` identifies the listening PID; check its identity before stopping it in Task Manager.
- **Missing dependency:** rerun `npm install` from the repository root and wait until it finishes before starting the app.
- **MongoDB download/start error:** check internet access, native binary compatibility and the reported cause. A reachable `MONGO_URI` avoids the local binary requirement. Containers that hide OS CPU/process information may not support native MongoDB.
- **Windows/OneDrive file locks:** keep the checkout outside OneDrive (for example, `C:\dev\ShareBite`). Synced folders can lock dependency or database files. Restart the terminal after moving the checkout.
- **Invalid PORT:** use an integer from 1 to 65535. Port 4000 is the default expected by Vite's proxy; changing the API port also requires updating `client/vite.config.js`.

Server source changes require a manual restart; client changes reload through Vite. Scripts use Node/npm without shell-specific environment assignments.

## Verification and remaining work

`npm run lint`, `npm run build` and seven focused startup/HTTP regression tests pass in the continuation environment. Run those tests with:

```sh
node --test server/test/startup.test.js server/test/health.test.js
```

Full `npm test`, seeded startup and browser checks require a working MongoDB runtime. The continuation container's MongoDB aborts with `numPartitions > 0`; it exposes zero CPUs and no `/proc`. Windows startup has not been verified here, and the earlier Windows failure must still be diagnosed from its actual error. See [startup review and resume checklist](docs/pull-requests/fix-dev-server-startup.md).

Remaining screens, in order: NGO discovery/map, donor posting, order timeline/proof, chat, leaderboard/certificates, dashboards, NGO directory/reviews and admin. Full core-loop verification and the three-minute demo script follow those screens.
