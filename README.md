# PWAU Price Compare

A local-first PWA for comparing grocery, pharmacy and household prices across
Australian retailers, with fallback search links and manual price entry where
automated fetching isn't reliable. See `MASTER_DESIGN.md` for the full design
spec this build follows.

## Project structure

```
frontend/    React + Vite PWA (the app you use)
backend/     Express server for local development + shared search logic
netlify/     Netlify Functions (production deployment target)
```

## Local development

Two terminals:

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:3001` in dev (see
`frontend/vite.config.js`), so you don't need to configure a base URL.

## Current state of automated fetching

Every retailer connector currently returns a **fallback result**: a direct
link to search that retailer's site for your query, plus a "Manual check
needed" status. This is intentional, not a placeholder bug — see the
"Reality check on automated fetching" note in `MASTER_DESIGN.md` Section 4.
Automated fetching is an optional, experimental follow-on (Section 23, steps
13–14), not a requirement for the app to be useful.

To add automated fetching for a retailer, edit only that retailer's file in
`backend/connectors/` — each one is isolated so a change to one never risks
breaking another.

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: "Add new site" → "Import an existing project" → select the repo.
3. Netlify will read `netlify.toml` automatically:
   - Builds from `frontend/`
   - Publishes `frontend/dist`
   - Deploys `netlify/functions/` as serverless functions
   - Redirects `/api/*` to those functions
4. Deploy. No environment variables are required for the current fallback-only build.

## Adding to your phone's home screen

Once deployed, open the Netlify URL in Safari (iOS) or Chrome (Android) and
use "Add to Home Screen". The app installs as a standalone PWA with its own
icon, per the manifest in `frontend/vite.config.js`.

## Data & privacy

- Settings and manual prices are stored in the browser's `localStorage` only
  — nothing is sent to a database or shared between devices (Section 5).
- The backend cache is in-memory and instance-scoped; see the caching note
  in `MASTER_DESIGN.md` Section 5 for what that means on Netlify's free tier.

## Disclaimer

Prices shown are a guide only. Always confirm the final price on the
retailer's own site or in-store before buying.
