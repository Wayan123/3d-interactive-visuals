# Deployment Guide

The app is designed to run locally first, then deploy as a static educational viewer.

## Local development

```bash
cd agent-fleet-dashboard
./run.sh
```

Open `http://127.0.0.1:8877/`.

The Python server provides local API endpoints and static files. The browser app can also fall back to `data/cells.json`, which makes static hosting possible.

## Vercel preview plan

A root `vercel.json` is included so the static viewer deploys with **zero dashboard config** — it serves `agent-fleet-dashboard/` as the static root:

```bash
npm i -g vercel   # once
vercel            # from the repo root: preview deploy
vercel --prod     # production deploy
```

If you prefer to configure it manually in the Vercel dashboard instead:

- Framework Preset: `Other`
- Root Directory: `agent-fleet-dashboard`
- Build Command: leave empty
- Output Directory: leave empty / default static root
- Install Command: leave empty

The static deployment will use:

- `index.html`
- `assets/**`
- `data/cells.json`
- `docs/screenshots/**`

The local-only API endpoints (`/api/health`, `/api/cells`, `/api/services`, `/api/fleet`) are not required for the static viewer because `assets/app.js` falls back to `data/cells.json` when `/api/health` is unavailable. This was verified by serving the app with a plain static server (no Python backend): `/` and `data/cells.json` return 200 with all 39 specimens, `/api/health` returns 404, and the app loads via the static fallback.

## Pre-deploy checklist

From the repository root:

```bash
python3 scripts/validate_project.py
python3 -m py_compile agent-fleet-dashboard/server.py
```

Optional browser smoke test locally:

```bash
cd agent-fleet-dashboard
PORT=8899 ./run.sh
python3 ../scripts/smoke_server.py --base-url http://127.0.0.1:8899
```

## Future static improvements

- Add a public demo URL to the repository homepage.
- Add `og:image` and social metadata after a stable screenshot is selected.
- Add automated screenshot capture for release pages.
- Consider vendoring Three.js if full offline static deployment becomes a priority.
