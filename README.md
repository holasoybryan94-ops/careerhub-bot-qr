# PulseStack

A WHOOP + macros tracker that runs as a Progressive Web App (installable on iPhone). Built on the **WHOOP Developer API** (OAuth 2.0). Meal logging is local to the device.

> **Why not Bluetooth direct to the strap?** WHOOP does not publish a third-party Bluetooth profile. The strap syncs via BLE only to the official WHOOP iPhone app, which then uploads to WHOOP's cloud. Third-party apps read that data through the WHOOP Developer API — which is exactly what PulseStack does.

## Features

- **Today**: recovery %, day strain, HRV, RHR, SpO₂, skin temperature delta, calories, average HR
- **Sleep**: duration, efficiency, performance, disturbances, stage breakdown (Light / Deep / REM / Awake), sleep need + debt
- **Workouts**: recent activities with sport, duration, strain, HR avg/max, calories
- **Nutrition**: searchable food database, per-meal logging (breakfast/lunch/dinner/snack), live macro bars vs targets
- **Trends**: 7-day recovery, strain vs calories in, HRV
- **PWA**: installable on iPhone home screen, works offline (app shell)

The app ships in **demo mode** with synthetic data so it's usable immediately. Once you plug in WHOOP credentials and tap **Connect WHOOP**, the same screens render live data.

## Deploy as its own Netlify site

This branch is self-contained — it has no WhatsApp bot code or any other unrelated functions. To deploy it as a standalone PulseStack site (separate from anything else in this repo):

1. In Netlify, **Add new site → Import from Git** and select this repository.
2. Set **Branch to deploy** to `claude/fitness-tracking-bluetooth-app-BtaJz` (or merge this branch into a dedicated branch like `pulsestack`).
3. Build settings are read from `netlify.toml` automatically (publish dir `public`, functions dir `netlify/functions`). No build command needed.
4. Add the WHOOP env vars from `.env.example` under **Site settings → Environment variables**.
5. Deploy. Your site URL is the redirect URI you'll register in the WHOOP developer console.

## Install on iPhone

1. Open the deployed site in Safari.
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch from the home-screen icon — it runs full-screen like a native app.

## Connect your WHOOP

1. Go to [developer.whoop.com](https://developer.whoop.com), create an app.
2. Set the redirect URI to: `https://<your-site>.netlify.app/api/whoop/callback`
3. Copy the client ID + secret into your Netlify site environment:
   - `WHOOP_CLIENT_ID`
   - `WHOOP_CLIENT_SECRET`
   - `WHOOP_REDIRECT_URI` (same URL as above)
4. Redeploy. Open the app and tap **Connect WHOOP**.

Required OAuth scopes (already requested by the app):
`read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement offline`

## Architecture

```
public/                  # PWA frontend (vanilla JS, no build step)
  index.html
  app.js / whoop.js / nutrition.js / store.js / charts.js
  styles.css
  manifest.webmanifest / sw.js
  icons/

netlify/functions/       # Serverless OAuth + API proxy
  whoop-login.js         # /api/whoop/login    → redirect to WHOOP auth
  whoop-callback.js      # /api/whoop/callback → exchange code, set httpOnly cookies
  whoop-logout.js        # /api/whoop/logout   → clear cookies
  whoop-status.js        # /api/whoop/status   → { connected: bool }
  whoop-today.js         # latest cycle + recovery
  whoop-sleep.js         # latest sleep
  whoop-workouts.js      # recent workouts
  whoop-trend.js         # 7-day rollup
  _whoop.js              # shared helpers (OAuth, cookies, fetch)
```

**Token storage**: access + refresh tokens live in `HttpOnly; Secure; SameSite=Lax` cookies set by the callback function. The browser never sees them. All API calls go through the serverless proxy, which attaches the token and transparently refreshes it on 401.

**Meal data**: stored in `localStorage` under `pulsestack.v1.*`. Per-device for now — moving this to a database is a straightforward next step.

## Local development

```bash
npm i -g netlify-cli
netlify dev
```

Then open http://localhost:8888. The app boots in demo mode without WHOOP credentials.

## Roadmap ideas

- Persist meals to a database (Netlify Blobs / Supabase) so they sync across devices
- Push notifications for low-recovery mornings
- Strava / Apple Health import for non-WHOOP workouts
- Barcode scanner using `BarcodeDetector` / OpenFoodFacts API
- Custom recipes (save a combined macro entry to reuse)
