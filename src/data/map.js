import markerBar from '../assets/markers/marker_bar.svg?url';
import markerEntrance from '../assets/markers/marker_entrance_exit.svg?url';
import markerFirstAid from '../assets/markers/marker_first_aid.svg?url';
import markerFood from '../assets/markers/marker_food.svg?url';
import markerIceCream from '../assets/markers/marker_ice_cream.svg?url';
import markerLocker from '../assets/markers/marker_locker.svg?url';
import markerMerchandise from '../assets/markers/marker_merchandise.svg?url';
import markerStage from '../assets/markers/marker_stage1_ponton.svg?url';
import markerStage1 from '../assets/markers/marker_stage1_ponton.svg?url';
import markerStage2 from '../assets/markers/marker_stage2_the_lake.svg?url';
import markerStage3 from '../assets/markers/marker_stage3_the_club.svg?url';
import markerStage4 from '../assets/markers/marker_stage4_hangar.svg?url';
import markerToilet from '../assets/markers/marker_toilet.svg?url';

/** Served from `public/map/` so the floorplan is not inlined into a JS chunk (bundle size + precache). */
export const FLOORPLAN_ASSET_URL = '/map/kaart_festival_no_markers.svg';

/**
 * Minimal procedural floorplan if the static asset is missing (offline without cache, etc.).
 */
const FALLBACK_SVG_RAW = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2330 1353">
  <rect width="2330" height="1353" fill="#4a90d9"/>
  <path fill="#157a21" stroke="#0d5a18" stroke-width="4"
    d="M0 1353 L0 380 Q200 200 520 120 Q900 40 1280 180 Q1680 340 2330 420 L2330 1353 L1180 1353 Q1080 1180 980 1280 Q880 1353 0 1353 Z"/>
  <path fill="#e5d0ab" stroke="#c4a574" stroke-width="2" opacity="0.9"
    d="M0 380 Q200 200 520 120 Q900 40 1280 180 Q1680 340 2330 420 L2330 520 Q1600 450 1200 320 Q600 260 0 480 Z"/>
  <rect x="1080" y="1260" width="170" height="70" rx="8" fill="#f4d7b8" stroke="#8a543c" stroke-width="3"/>
  <text x="1165" y="1305" text-anchor="middle" font-size="28" fill="#333" font-family="sans-serif">IN / OUT</text>
</svg>`;

/**
 * Parse `viewBox="minX minY width height"` from an SVG string.
 * @param {string} svgString
 * @returns {{ minX: number; minY: number; width: number; height: number } | null}
 */
export function parseViewBoxFromSvgString(svgString) {
  const m = svgString.match(/viewBox="([^"]+)"/i);
  if (!m) return null;
  const parts = m[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

/**
 * Strip outer `<svg>` wrapper so content can be placed inside a React-controlled `<svg>`.
 * @param {string} svgString
 * @returns {{ inner: string; viewBox: { minX: number; minY: number; width: number; height: number } | null }}
 */
export function extractSvgBody(svgString) {
  const withoutXml = svgString.replace(/<\?xml[\s\S]*?\?>/i, '').trim();
  const vb = parseViewBoxFromSvgString(withoutXml);
  const innerMatch = withoutXml.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  const inner = innerMatch ? innerMatch[1].trim() : withoutXml;
  return { inner, viewBox: vb };
}

/**
 * Map coordinate system (SVG user units) for markers and GPS — matches `kaart_festival_no_markers.svg`.
 */
export const MAP_VIEWBOX = {
  minX: 0,
  minY: 0,
  width: 2330.58,
  height: 1353.19,
};

/**
 * Fetch floorplan SVG text from the static asset URL (precached by the service worker).
 * Falls back to {@link FALLBACK_SVG_RAW} on network failure.
 * @returns {Promise<{ inner: string; viewBox: typeof MAP_VIEWBOX }>}
 */
export async function loadFloorplanSvgParts() {
  try {
    const res = await fetch(FLOORPLAN_ASSET_URL, { cache: 'force-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const raw = await res.text();
    const { inner, viewBox } = extractSvgBody(raw);
    return {
      inner,
      viewBox: viewBox ?? MAP_VIEWBOX,
    };
  } catch {
    const { inner, viewBox } = extractSvgBody(FALLBACK_SVG_RAW);
    return {
      inner,
      viewBox: viewBox ?? MAP_VIEWBOX,
    };
  }
}

/** @typedef {'poton' | 'the-lake' | 'the-club' | 'hanggar'} StageId */

/**
 * @typedef {{
 *   id: StageId;
 *   number: number;
 *   nameKey: string;
 *   typeKey: string;
 *   svgX: number;
 *   svgY: number;
 *   description: { nl: string; en: string };
 * }} StageLocation
 */

/**
 * Stage markers on the floorplan (user space). Tune `svgX` / `svgY` when the Illustrator export changes.
 * @type {StageLocation[]}
 */
export const STAGE_LOCATIONS = [
  {
    id: 'poton',
    number: 1,
    nameKey: 'schedule.stage.poton',
    typeKey: 'schedule.stage.poton.sub',
    svgX: 496.9,
    svgY: 849.15,
    description: {
      nl: 'Hoofdpodium aan het water — grote acts.',
      en: 'Main stage on the water — headline acts.',
    },
  },
  {
    id: 'the-lake',
    number: 2,
    nameKey: 'schedule.stage.theLake',
    typeKey: 'schedule.stage.theLake.sub',
    svgX: 1256.98,
    svgY: 615.25,
    description: {
      nl: 'Nieuw talent bij het meer.',
      en: 'New talent near the lake.',
    },
  },
  {
    id: 'the-club',
    number: 3,
    nameKey: 'schedule.stage.theClub',
    typeKey: 'schedule.stage.theClub.sub',
    svgX: 1614.31,
    svgY: 528.68,
    description: {
      nl: 'Theater en comedy in het gebouw.',
      en: 'Theatre and comedy in the building.',
    },
  },
  {
    id: 'hanggar',
    number: 4,
    nameKey: 'schedule.stage.hanggar',
    typeKey: 'schedule.stage.hanggar.sub',
    svgX: 2102.13,
    svgY: 231.18,
    description: {
      nl: 'Non-stop house, techno en dance.',
      en: 'Non-stop house, techno and dance.',
    },
  },
];

/**
 * WGS84 bounding box aligned to this floorplan for **linear** GPS mapping.
 * Values are placeholders around Strijkviertel, Utrecht — replace with surveyed corners from the organisation.
 *
 * ## GPS → SVG mapping (equirectangular approximation)
 *
 * Given visitor latitude `lat` and longitude `lon` (degrees), and this box
 * `latMin`, `latMax`, `lonMin`, `lonMax` aligned with the map edges in the same orientation as the SVG:
 *
 * ```
 * svgX = MAP_VIEWBOX.minX + (lon - lonMin) / (lonMax - lonMin) * MAP_VIEWBOX.width
 * svgY = MAP_VIEWBOX.minY + (1 - (lat - latMin) / (latMax - latMin)) * MAP_VIEWBOX.height
 * ```
 *
 * SVG Y grows downward; latitude grows northward — hence the `(1 - …)` term.
 *
 * This ignores earth curvature; for a festival-sized site the error is negligible.
 *
 * **Clamping:** positions outside `[lonMin, lonMax]` × `[latMin, latMax]` are clamped to the rectangle
 * edge before converting, so the visitor dot never drifts off the artwork.
 *
 * @type {{
 *   latMin: number;
 *   latMax: number;
 *   lonMin: number;
 *   lonMax: number;
 * }}
 */
export const GEO_REFERENCE = {
  latMin: 52.022,
  latMax: 52.034,
  lonMin: 5.052,
  lonMax: 5.074,
};

/** Midpoint of {@link GEO_REFERENCE} — pin for “open in maps” links. */
export const VENUE_MAP_CENTER = {
  lat: (GEO_REFERENCE.latMin + GEO_REFERENCE.latMax) / 2,
  lon: (GEO_REFERENCE.lonMin + GEO_REFERENCE.lonMax) / 2,
};

/**
 * HTTPS URL that opens the system or web maps app (geo: is unreliable on desktop).
 * @param {number} lat
 * @param {number} lon
 * @param {string} placeLabel human-readable query label (e.g. translated venue name)
 */
export function getExternalMapsUrl(lat, lon, placeLabel) {
  const encodedLabel = encodeURIComponent(placeLabel);
  if (typeof navigator === 'undefined') {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  const ua = navigator.userAgent;
  const isTouchMac =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || isTouchMac;

  if (isIOS) {
    return `https://maps.apple.com/?ll=${lat},${lon}&q=${encodedLabel}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

/**
 * Map WGS84 coordinates to SVG user units (same space as {@link STAGE_LOCATIONS}).
 * Clamps input to {@link GEO_REFERENCE} before applying the linear formula documented there.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {{ svgX: number; svgY: number }}
 */
export function geoToSvg(lat, lon) {
  const { latMin, latMax, lonMin, lonMax } = GEO_REFERENCE;
  const latC = Math.min(latMax, Math.max(latMin, lat));
  const lonC = Math.min(lonMax, Math.max(lonMin, lon));
  const svgX =
    MAP_VIEWBOX.minX +
    ((lonC - lonMin) / (lonMax - lonMin)) * MAP_VIEWBOX.width;
  const svgY =
    MAP_VIEWBOX.minY +
    (1 - (latC - latMin) / (latMax - latMin)) * MAP_VIEWBOX.height;
  return { svgX, svgY };
}

/** Default POI icon size in SVG user units when a location has no `size`. */
export const POI_MARKER_SIZE = 52.89;

/** Detail POIs appear when scale exceeds fit scale × this factor. */
export const DETAIL_ZOOM_FACTOR = 1.35;

/** @typedef {'bar' | 'food' | 'toilet' | 'locker' | 'first_aid' | 'ice_cream' | 'merchandise' | 'entrance_exit'} PoiType */

/**
 * @typedef {{
 *   iconUrl: string;
 *   labelKey: string;
 *   requireZoom: boolean;
 * }} PoiMarkerMeta
 */

/** @type {Record<PoiType, PoiMarkerMeta>} */
export const POI_MARKER_TYPES = {
  bar: { iconUrl: markerBar, labelKey: 'map.poi.bar', requireZoom: true },
  food: { iconUrl: markerFood, labelKey: 'map.poi.food', requireZoom: true },
  toilet: {
    iconUrl: markerToilet,
    labelKey: 'map.poi.toilet',
    requireZoom: true,
  },
  locker: {
    iconUrl: markerLocker,
    labelKey: 'map.poi.locker',
    requireZoom: true,
  },
  first_aid: {
    iconUrl: markerFirstAid,
    labelKey: 'map.poi.firstAid',
    requireZoom: true,
  },
  ice_cream: {
    iconUrl: markerIceCream,
    labelKey: 'map.poi.iceCream',
    requireZoom: true,
  },
  merchandise: {
    iconUrl: markerMerchandise,
    labelKey: 'map.poi.merchandise',
    requireZoom: true,
  },
  entrance_exit: {
    iconUrl: markerEntrance,
    labelKey: 'map.poi.entrance',
    requireZoom: true,
  },
};

/**
 * @typedef {{ type: string; iconUrl: string; labelKey: string }} LegendMarkerType
 */

/** Legend rows (icon + i18n label). */
export const LEGEND_MARKER_TYPES = /** @type {LegendMarkerType[]} */ ([
  { type: 'stage-1', iconUrl: markerStage1, labelKey: 'map.legend.stage1' },
  { type: 'stage-2', iconUrl: markerStage2, labelKey: 'map.legend.stage2' },
  { type: 'stage-3', iconUrl: markerStage3, labelKey: 'map.legend.stage3' },
  { type: 'stage-4', iconUrl: markerStage4, labelKey: 'map.legend.stage4' },
  { type: 'bar', iconUrl: markerBar, labelKey: 'map.legend.bar' },
  { type: 'food', iconUrl: markerFood, labelKey: 'map.legend.food' },
  {
    type: 'iceCream',
    iconUrl: markerIceCream,
    labelKey: 'map.legend.iceCream',
  },
  {
    type: 'merchandise',
    iconUrl: markerMerchandise,
    labelKey: 'map.legend.merchandise',
  },
  { type: 'toilet', iconUrl: markerToilet, labelKey: 'map.legend.toilet' },
  {
    type: 'firstAid',
    iconUrl: markerFirstAid,
    labelKey: 'map.legend.firstAid',
  },
  { type: 'locker', iconUrl: markerLocker, labelKey: 'map.legend.locker' },
  {
    type: 'entrance',
    iconUrl: markerEntrance,
    labelKey: 'map.legend.entrance',
  },
]);
