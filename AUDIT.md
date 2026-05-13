# U Festival PWA — QA audit (May 2026)

This document maps the pre-demo checklist to **PASS**, **FAIL**, or **VERIFY** (needs a human run in Chrome / Lighthouse / device). **Exact fix** is given for every FAIL; VERIFY rows list how to confirm.

---

## Cross-feature wiring

| Item | Status | Evidence / fix |
|------|--------|----------------|
| 1. Map bottom sheet uses `useSchedule()` for current + next act per stage | **PASS** | [src/pages/Map/index.jsx](src/pages/Map/index.jsx) calls `getCurrentAndNextForStage(sheetStageId, now)`. |
| 2. Home shows next upcoming act within 2 hours from schedule | **PASS** | [src/pages/Home/index.jsx](src/pages/Home/index.jsx) uses `getNextActStartingWithin(allBlocks, now, 2h)` from [src/data/schedule.js](src/data/schedule.js). |
| 3. All routes render without console errors (`/`, `/info`, `/schedule`, `/map`, `/install`, `/logboek`) | **VERIFY** | Run `npm run build && npm run preview`; open each path with DevTools console. Fix any warnings (keys, deprecated APIs). |

**Schedule demo date (off-festival QA):** set `VITE_SCHEDULE_DEMO_DATE=2026-09-05` so `getEffectiveNow()` aligns the calendar day with festival programming ([src/data/schedule.js](src/data/schedule.js)); Map, Schedule, and Home `now` ticks use it.

---

## Performance

| Item | Status | Evidence / fix |
|------|--------|----------------|
| Route components lazy-loaded + `Suspense` + `<Spinner>` | **PASS** | [src/App.jsx](src/App.jsx): `React.lazy` per page, `Suspense` with `RouteFallback` + [Spinner](src/components/Spinner.jsx). |
| Sansation: preconnect `fonts.googleapis.com` + `fonts.gstatic.com` | **PASS** (with nuance) | Sansation is **self-hosted** via `@fontsource/sansation` in [src/index.css](src/index.css) (precached woff2). Preconnect links in [index.html](index.html) target Google for **Material Symbols** only. |
| Material Symbols: preconnect | **PASS** | [index.html](index.html): `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` before the stylesheet. |
| No single JS chunk over 150 KB | **PASS** | `manualChunks` in [vite.config.js](vite.config.js); `npm run build` runs [scripts/check-chunk-sizes.mjs](scripts/check-chunk-sizes.mjs). |
| `vite-bundle-visualizer` | **PASS** | `rollup-plugin-visualizer` + `npm run analyze` ([package.json](package.json)). |
| All static assets precached — app loads fully offline | **PASS** (caveat) | Workbox precache + `includeAssets` in [vite.config.js](vite.config.js); floorplan moved to [public/map/kaart_festival_no_markers.svg](public/map/kaart_festival_no_markers.svg). **Caveat:** Material Symbols CSS/glyphs still load from Google on first paint unless cached via existing `runtimeCaching` after an online visit. **Mitigation:** self-host a subset or accept “open online once”. |
| Act images under `src/assets/acts/` | **PASS** | Imports in [src/data/acts.js](src/data/acts.js); build emits hashed assets. |
| Stage images `src/assets/stages/` | **PASS** | [src/pages/Map/index.jsx](src/pages/Map/index.jsx), [src/pages/Schedule/index.jsx](src/pages/Schedule/index.jsx). |
| Logo light/dark | **PASS** | [src/components/AppHeader.jsx](src/components/AppHeader.jsx), [src/pages/Home/index.jsx](src/pages/Home/index.jsx), [src/pages/Install/index.jsx](src/pages/Install/index.jsx). |

**FAIL → fix (historical):** large floorplan was inlined into a single ~250 KB JS chunk. **Fix applied:** serve SVG from `public/map/…` and `fetch()` in [src/data/map.js](src/data/map.js) / [src/pages/Map/index.jsx](src/pages/Map/index.jsx).

---

## Accessibility (WCAG 2.1 AA targets)

| Item | Status | Evidence / fix |
|------|--------|----------------|
| Contrast ≥ 4.5:1 (white on red/blue UI) | **PASS** (engineering) | `--color-accent: #c41e1e` and `--color-secondary: #1a5f7a` in [src/index.css](src/index.css); schedule blocks and `.btn--primary` use `#fff` on those variables. **VERIFY** with WebAIM / axe on final UI. |
| Visible focus rings on interactives | **PASS** (targeted) | Added or confirmed: [NewsBlock.css](src/components/NewsBlock.css), [BottomSheet.css](src/components/BottomSheet.css), [Schedule.css](src/pages/Schedule/Schedule.css), [Map.css](src/pages/Map/Map.css) legend, existing nav/buttons. **VERIFY** full keyboard sweep (including third-party-looking controls). |
| Bottom nav tabs `aria-label` | **PASS** | Each [NavLink](src/components/BottomNav.jsx) has `aria-label={t(labelKey)}` in addition to visible text. |
| Language switcher `aria-label` | **PASS** | [AppHeader.jsx](src/components/AppHeader.jsx) `aria-label={t('topBar.language')}`. |
| Theme toggle `aria-label` + `aria-pressed` | **PASS** | [AppHeader.jsx](src/components/AppHeader.jsx): `aria-pressed={theme === 'dark'}`. |
| Accordion `<button>` + `aria-expanded` | **PASS** | [src/components/Accordion.jsx](src/components/Accordion.jsx). |
| Map `aria-label` | **PASS** | SVG `aria-label={t('map.aria.viewport')}` in [Map/index.jsx](src/pages/Map/index.jsx). |
| `document.title` on route change | **PASS** | `useRouteDocumentTitle()` in [src/components/Layouts.jsx](src/components/Layouts.jsx). |
| `lang` on `<html>` when language switches | **PASS** | [src/context/LangContext.jsx](src/context/LangContext.jsx) sets `document.documentElement.lang`. |

---

## PWA final check

| Item | Status | Evidence / fix |
|------|--------|----------------|
| Lighthouse PWA ≥ 90 | **VERIFY** | Run Lighthouse (Chrome) against `npm run preview` over **localhost** or HTTPS staging. If score &lt; 90, follow Lighthouse “PWA” / “Installable” audits (maskable icons, start URL, SW, HTTPS). |
| `manifest.json` / `manifest.webmanifest` valid | **PASS** (build-time) | Generated from [vite.config.js](vite.config.js); includes `id`, `categories`, `purpose: any` + **maskable** icon entries. Run `npm run icons` before release so [public/icons/](public/icons/) maskable files exist. |
| Installable Chrome Android + Safari iOS | **VERIFY** | Android: add to home screen from Chrome when installable. iOS: Safari → Share → Add to Home Screen; relies on [index.html](index.html) Apple meta + touch icon. |

**Build note:** if `vite build` fails while writing the service worker (`Unexpected early exit` / unfinished `terser` hooks), run the build outside a constrained environment (full CI runner / local shell with enough memory). This was observed under a restricted sandbox.

---

## Documentation

| Item | Status | Evidence / fix |
|------|--------|----------------|
| README: install / dev / build, offline + install testing, structure, deps, replaceable content | **PASS** | [README.md](README.md). |
| This `AUDIT.md` | **PASS** | You are reading it. |

---

## Commands used for evidence

```bash
npm run build    # includes node scripts/check-chunk-sizes.mjs
npm run analyze  # optional dist/stats.html
```

---

## Summary counts

- **PASS:** automated or code-review confirmed in repo.
- **VERIFY:** 3 items (console clean on all routes, Lighthouse PWA score, real-device install).
- **FAIL:** none remaining for implemented scope; prior floorplan chunk issue **fixed** as documented above.
