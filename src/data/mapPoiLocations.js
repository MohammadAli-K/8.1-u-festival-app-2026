/**
 * POI marker positions extracted from src/assets/map/kaart_festival_markers.svg.
 * Regenerate: node scripts/extract-map-poi-positions.mjs
 */

/** @typedef {'bar' | 'food' | 'toilet' | 'locker' | 'first_aid' | 'ice_cream' | 'merchandise' | 'entrance_exit'} PoiType */

/**
 * @typedef {{ id: string; type: PoiType; svgX: number; svgY: number; size: number }} PoiLocation
 */

/** @type {PoiLocation[]} */
export const POI_LOCATIONS = [
  {
    id: 'sym-bar-130',
    type: 'bar',
    svgX: 1675,
    svgY: 390,
    size: 50,
  },
  {
    id: 'sym-bar-129',
    type: 'bar',
    svgX: 1890,
    svgY: 380,
    size: 50,
  },
  {
    id: 'sym-bar-128',
    type: 'bar',
    svgX: 1190,
    svgY: 555,
    size: 50,
  },
  {
    id: 'sym-bar-127',
    type: 'bar',
    svgX: 275.73,
    svgY: 999.15,
    size: 50,
  },
  {
    id: 'pin-entrance_exit-1',
    type: 'entrance_exit',
    svgX: 1610,
    svgY: 1150,
    size: 150,
  },
  {
    id: 'sym-first_aid-134',
    type: 'first_aid',
    svgX: 423,
    svgY: 413.99,
    size: 50,
  },
  {
    id: 'sym-food-142',
    type: 'food',
    svgX: 280,
    svgY: 850,
    size: 50,
  },
  {
    id: 'sym-food-131',
    type: 'food',
    svgX: 820,
    svgY: 600,
    size: 50,
  },

  {
    id: 'ice-114-120',
    type: 'ice_cream',
    svgX: 1450,
    svgY: 450,
    size: 50,
  },
  {
    id: 'ice-113-119',
    type: 'ice_cream',
    svgX: 910,
    svgY: 570,
    size: 50,
  },
  {
    id: 'ice-112-118',
    type: 'ice_cream',
    svgX: 625,
    svgY: 910,
    size: 50,
  },
  {
    id: 'ice-122-128',
    type: 'ice_cream',
    svgX: 1950,
    svgY: 245,
    size: 50,
  },
  {
    id: 'pin-locker-1',
    type: 'locker',
    svgX: 700,
    svgY: 1103.66,
    size: 60,
  },
  {
    id: 'pin-locker-2',
    type: 'locker',
    svgX: 560,
    svgY: 1115,
    size: 60,
  },
  {
    id: 'pin-merchandise-5',
    type: 'merchandise',
    svgX: 400,
    svgY: 1050,
    size: 50,
  },
  {
    id: 'pin-merchandise-4',
    type: 'merchandise',
    svgX: 740,
    svgY: 550,
    size: 50,
  },
  {
    id: 'pin-merchandise-1',
    type: 'merchandise',
    svgX: 1520,
    svgY: 540,
    size: 50,
  },
  {
    id: 'pin-toilet-2',
    type: 'toilet',
    svgX: 2170,
    svgY: 340,
    size: 50,
  },
  {
    id: 'sym-toilet-144',
    type: 'toilet',
    svgX: 180,
    svgY: 1060,
    size: 50,
  },
  {
    id: 'sym-toilet-143',
    type: 'toilet',
    svgX: 1140,
    svgY: 380,
    size: 50,
  },
];
