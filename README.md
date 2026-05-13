# ❤️U Festival PWA

React + Vite progressive web app for **❤️U Festival** (Utrecht, 5–6 September 2026). Includes offline precaching (Workbox via `vite-plugin-pwa`), top bar (theme + language), bottom navigation for the four main routes, schedule, map with GPS, and install flow.

## Scripts

| Command | Purpose |
|--------|---------|
| **`npm install`** | Install dependencies |
| **`npm run dev`** | Vite dev server (hot reload; service worker differs from production) |
| **`npm run build`** | Production build → `dist/`, emits `manifest.webmanifest` + `sw.js`, then verifies every `dist/assets/*.js` chunk is ≤ 150 KiB |
| **`npm run preview`** | Serve `dist/` locally over HTTP — **use this for PWA install, offline, and Lighthouse** |
| **`npm run analyze`** | Same as build with Rollup visualizer (`dist/stats.html`) |
| **`npm run icons`** | Regenerate raster and **maskable** icons in `public/icons/` from `src/assets/logos/logo_black.svg` (requires `sharp`) |

## QA / demo: simulated festival day

Schedule “live” logic only runs on real festival calendar days (5–6 Sept 2026) unless you set:

```bash
VITE_SCHEDULE_DEMO_DATE=2026-09-05 npm run dev
# or add to .env.local (not committed)
```

The app then uses that **date** with the device **clock** so map sheets, schedule highlights, and the home “next act” strip behave like festival Saturday.

## How to test offline

1. Run **`npm run build`** then **`npm run preview`** (or deploy over HTTPS).
2. Open the app once **online** so the service worker registers and precache completes (DevTools → Application → Service Workers: “activated and running”).
3. DevTools → **Application** → **Service Workers** → check **Offline**, or disable network in Network tab.
4. Reload and navigate between cached routes (`/`, `/info`, `/schedule`, `/map`, `/install`, `/logboek`). Core UI and precached fonts/assets should load; the floorplan is loaded from `/map/kaart_festival_no_markers.svg` (precached). **Material Symbols** still load from Google unless cached from a prior online visit.

## How to test the install prompt (Chrome / desktop)

1. Use **`npm run preview`** or HTTPS hosting (install requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)).
2. Use **Chrome** (Chromium implements `beforeinstallprompt`). Open the app; the in-app install banner may appear on main shell routes when criteria are met.
3. Open **`/install`** and tap **Install** when the browser exposes the prompt (`deferredPrompt` in [InstallPromptContext](src/context/InstallPromptContext.jsx)).
4. **Android Chrome:** menu → “Install app” / “Add to Home screen” when the PWA is installable.
5. **iOS Safari:** Share → **Add to Home Screen** (no `beforeinstallprompt`; Apple uses manifest + meta tags from [index.html](index.html)).

## Project structure (main paths)

```
public/
  icons/               # PWA + maskable icons (generated via npm run icons)
  map/                 # Large floorplan SVG (precached; not inlined in JS)
  u-festival-sw-extras.js
scripts/
  generate-pwa-icons.mjs
  check-chunk-sizes.mjs
src/
  assets/              # Logos, act images, stage SVGs, markers
  components/          # Shell UI (header, nav, sheets, buttons, …)
  context/             # Theme, language, install prompt
  data/                # schedule.js, acts.js, map.js, news.js
  hooks/               # useSchedule, useNews, favourites
  i18n/                # nl.js, en.js
  pages/               # Route screens (lazy-loaded from App.jsx)
  sw/                  # PWA registration helper
  App.jsx
  main.jsx
  index.css
vite.config.js         # Vite + vite-plugin-pwa + chunking
index.html
```

## Tech stack and dependencies

| Package | Role |
|---------|------|
| **react** / **react-dom** | UI |
| **react-router-dom** | Client-side routing |
| **qrcode** | QR code on `/install` (lazy route → separate chunk) |
| **@fontsource/sansation** | Self-hosted Sansation (Latin 400 / 700 / 300 italic) for offline-friendly body typography |
| **vite** | Dev server and production bundler |
| **@vitejs/plugin-react** | React refresh + JSX |
| **vite-plugin-pwa** | `manifest.webmanifest`, Workbox `sw.js`, precache + runtime caching |
| **rollup-plugin-visualizer** | Bundle graph (`npm run analyze`) |
| **sharp** | `npm run icons` rasterisation |

## Content to replace before launch

- **Act images** — `src/assets/acts/*.webp` and entries in [src/data/acts.js](src/data/acts.js).
- **Stage thumbnails** — `src/assets/stages/*.svg` (referenced from schedule + map).
- **Floorplan** — replace **`public/map/kaart_festival_no_markers.svg`** (and optionally keep a copy under `src/assets/map/` for design source control). [src/data/map.js](src/data/map.js) uses `MAP_VIEWBOX` constants that must stay aligned with the SVG `viewBox` if the art changes.
- **Optional** `src/assets/map/floorplan.svg` — previously supported via `import.meta.glob`; current build uses the public map asset path in `map.js`.
- **Schedule** — [src/data/schedule.js](src/data/schedule.js) slot rows and [festivalDates](src/data/schedule.js).
- **News** — [src/data/news.js](src/data/news.js).

## Routes

| Path | Bottom nav |
|------|----------------|
| `/`, `/info`, `/schedule`, `/map` | Yes |
| `/install`, `/logboek`, `/interactie` | No (secondary layout) |

## PWA notes

Manifest fields and icons are defined in [vite.config.js](vite.config.js) (`VitePWA` → `manifest`). Maskable icons are generated as `logo-maskable-192.webp` / `logo-maskable-512.webp` when you run **`npm run icons`**.

For **Lighthouse PWA ≥ 90**, run Lighthouse against **`npm run preview`** (not `npm run dev`). Address any reported installability / HTTPS / maskable-icon hints.
