/**
 * Festival line-up — static data (replace with fetch() later via useSchedule).
 * Stage spellings: Podium (id poton), The Lake, The Club, Hanggar.
 */

/** @typedef {'saturday' | 'sunday' | 'wednesday'} DayKey */

/**
 * @typedef {'poton' | 'the-lake' | 'the-club' | 'hanggar'} StageId
 */

/**
 * Raw slot from data file — times are wall-clock HH:MM on the festival date.
 * @typedef {{
 *   id: string;
 *   stageId: StageId;
 *   actId: string | null;
 *   titleKey?: string;
 *   start: string;
 *   end: string;
 * }} ScheduleSlotRaw
 */

/** @type {readonly { id: StageId; nameKey: string; subtitleKey: string }[]} */
export const stages = [
  { id: 'poton', nameKey: 'schedule.stage.poton', subtitleKey: 'schedule.stage.poton.sub' },
  { id: 'the-lake', nameKey: 'schedule.stage.theLake', subtitleKey: 'schedule.stage.theLake.sub' },
  { id: 'the-club', nameKey: 'schedule.stage.theClub', subtitleKey: 'schedule.stage.theClub.sub' },
  { id: 'hanggar', nameKey: 'schedule.stage.hanggar', subtitleKey: 'schedule.stage.hanggar.sub' },
];

/** Timeline 10:00–24:00 in 15-minute steps (56 slots; last starts 23:45). */
export const GRID_FIRST_HOUR = 10;
export const GRID_FIRST_MINUTE = 0;
/** Minutes from midnight at grid start (10:00). */
export const GRID_START_MINUTES = GRID_FIRST_HOUR * 60 + GRID_FIRST_MINUTE;
/** Minutes from midnight at grid end (24:00, exclusive). */
export const GRID_END_MINUTES = 24 * 60;
/** Number of quarter-hour columns on the time axis. */
export const NUM_QUARTER_SLOTS = (GRID_END_MINUTES - GRID_START_MINUTES) / 15;

/** @type {Record<DayKey, Partial<Record<StageId, ScheduleSlotRaw[]>>>} */
/** Voorlopig blokkenschema — bron: src/assets/wireframes/blokkenschema.png */
export const scheduleSlotsByDay = {
  saturday: {
    poton: [
      { id: 'sat-poton-1030-armin', stageId: 'poton', actId: 'armin-van-buuren', start: '10:30', end: '11:45' },
      { id: 'sat-poton-1230-kensington', stageId: 'poton', actId: 'kensington', start: '12:30', end: '14:15' },
      { id: 'sat-poton-1500-de-staat', stageId: 'poton', actId: 'de-staat', start: '15:00', end: '16:30' },
      { id: 'sat-poton-1715-navarone', stageId: 'poton', actId: 'navarone', start: '17:15', end: '18:45' },
      { id: 'sat-poton-1915-dotan', stageId: 'poton', actId: 'dotan', start: '19:15', end: '21:00' },
      { id: 'sat-poton-2200-froukje', stageId: 'poton', actId: 'froukje', start: '22:00', end: '23:45' },
    ],
    'the-lake': [
      { id: 'sat-lake-1000-t1', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent1', start: '10:00', end: '11:15' },
      { id: 'sat-lake-1145-t2', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent2', start: '11:45', end: '13:15' },
      { id: 'sat-lake-1400-t3', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent3', start: '14:00', end: '15:45' },
      { id: 'sat-lake-1615-t4', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent4', start: '16:15', end: '18:00' },
      { id: 'sat-lake-1830-t5', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent5', start: '18:30', end: '20:15' },
      { id: 'sat-lake-2045-t6', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent6', start: '20:45', end: '22:30' },
    ],
    'the-club': [
      { id: 'sat-club-1200-comedy', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.comedy', start: '12:00', end: '13:15' },
      { id: 'sat-club-1400-lecture', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.lecture', start: '14:00', end: '15:15' },
      { id: 'sat-club-1600-theater', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.theater', start: '16:00', end: '17:45' },
      { id: 'sat-club-1830-movie', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.movie', start: '18:30', end: '20:45' },
      { id: 'sat-club-2115-performance', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.performance', start: '21:15', end: '22:30' },
      { id: 'sat-club-2300-illusionist', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.illusionist', start: '23:00', end: '23:45' },
    ],
    hanggar: [
      { id: 'sat-hang-1000-dj1', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj1', start: '10:00', end: '11:15' },
      { id: 'sat-hang-1115-dj2', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj2', start: '11:15', end: '12:45' },
      { id: 'sat-hang-1315-dj3', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj3', start: '13:15', end: '14:45' },
      { id: 'sat-hang-1515-dj4', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj4', start: '15:15', end: '16:45' },
      { id: 'sat-hang-1715-dj5', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj5', start: '17:15', end: '18:45' },
      { id: 'sat-hang-1915-dj6', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj6', start: '19:15', end: '20:45' },
      { id: 'sat-hang-2115-dj7', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj7', start: '21:15', end: '22:45' },
      { id: 'sat-hang-2300-dj8', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj8', start: '23:00', end: '23:45' },
    ],
  },
  sunday: {
    poton: [
      { id: 'sun-poton-1100-martin', stageId: 'poton', actId: 'martin-garrix', start: '11:00', end: '12:45' },
      { id: 'sun-poton-1400-within', stageId: 'poton', actId: 'within-temptation', start: '14:00', end: '15:45' },
      { id: 'sun-poton-1645-chef', stageId: 'poton', actId: 'chefspecial', start: '16:45', end: '18:30' },
      { id: 'sun-poton-1930-eefje', stageId: 'poton', actId: 'eefje-de-visser', start: '19:30', end: '21:15' },
      { id: 'sun-poton-2215-spinvis', stageId: 'poton', actId: 'spinvis', start: '22:15', end: '23:45' },
    ],
    'the-lake': [
      { id: 'sun-lake-1000-t1', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent1', start: '10:00', end: '11:15' },
      { id: 'sun-lake-1145-t2', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent2', start: '11:45', end: '13:15' },
      { id: 'sun-lake-1400-t3', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent3', start: '14:00', end: '15:45' },
      { id: 'sun-lake-1615-t4', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent4', start: '16:15', end: '18:00' },
      { id: 'sun-lake-1830-t5', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent5', start: '18:30', end: '20:15' },
      { id: 'sun-lake-2100-t6', stageId: 'the-lake', actId: null, titleKey: 'schedule.slot.talent6', start: '21:00', end: '22:45' },
    ],
    'the-club': [
      { id: 'sun-club-1215-comedy', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.comedy', start: '12:15', end: '13:30' },
      { id: 'sun-club-1400-lecture', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.lecture', start: '14:00', end: '15:15' },
      { id: 'sun-club-1615-theater', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.theater', start: '16:15', end: '18:00' },
      { id: 'sun-club-1845-movie', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.movie', start: '18:45', end: '21:00' },
      { id: 'sun-club-2145-magic', stageId: 'the-club', actId: null, titleKey: 'schedule.slot.magicShow', start: '21:45', end: '23:15' },
    ],
    hanggar: [
      { id: 'sun-hang-1000-dj1', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj1', start: '10:00', end: '10:45' },
      { id: 'sun-hang-1045-dj2', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj2', start: '10:45', end: '12:15' },
      { id: 'sun-hang-1315-dj3', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj3', start: '13:15', end: '14:45' },
      { id: 'sun-hang-1445-dj4', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj4', start: '14:45', end: '16:15' },
      { id: 'sun-hang-1715-dj5', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj5', start: '17:15', end: '18:45' },
      { id: 'sun-hang-1915-dj6', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj6', start: '19:15', end: '20:45' },
      { id: 'sun-hang-2115-dj7', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj7', start: '21:15', end: '22:45' },
      { id: 'sun-hang-2300-dj8', stageId: 'hanggar', actId: null, titleKey: 'schedule.slot.dj8', start: '23:00', end: '23:45' },
    ],
  },
};

/** @type {Record<DayKey, { year: number; month: number; day: number }>} */
export const festivalDates = {
  saturday: { year: 2026, month: 9, day: 5 },
  sunday: { year: 2026, month: 9, day: 6 },
};

const DEMO_DATE_RAW = import.meta.env.VITE_SCHEDULE_DEMO_DATE;

/**
 * When `VITE_SCHEDULE_DEMO_DATE` is `YYYY-MM-DD`, schedule “now” uses that calendar day with the
 * device clock (QA / demo). Unset in production.
 * @returns {Date}
 */
export function getEffectiveNow() {
  if (typeof DEMO_DATE_RAW === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(DEMO_DATE_RAW)) {
    const [y, m, day] = DEMO_DATE_RAW.split('-').map(Number);
    const clock = new Date();
    return new Date(
      y,
      m - 1,
      day,
      clock.getHours(),
      clock.getMinutes(),
      clock.getSeconds(),
      clock.getMilliseconds(),
    );
  }
  return new Date();
}

/**
 * @param {{ dayKey: DayKey; start: Date; end: Date; displayTitle?: string }[]} allBlocks
 * @param {Date} now
 * @param {number} windowMs
 * @returns {{ dayKey: DayKey; start: Date; end: Date; displayTitle?: string } | null}
 */
export function getNextActStartingWithin(allBlocks, now, windowMs) {
  const dayKey = getFestivalDayKey(now);
  if (!dayKey) return null;
  const end = new Date(now.getTime() + windowMs);
  const candidates = allBlocks.filter(
    (b) => b.dayKey === dayKey && b.start > now && b.start <= end,
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a.start <= b.start ? a : b));
}

/**
 * Calendar day of `now` matches a festival programme day (local wall clock).
 * @param {Date} now
 * @returns {DayKey | null}
 */
export function getFestivalDayKey(now) {
  for (const dayKey of /** @type {const} */ (['saturday', 'sunday'])) {
    const d = festivalDates[dayKey];
    if (
      now.getFullYear() === d.year &&
      now.getMonth() === d.month - 1 &&
      now.getDate() === d.day
    ) {
      return dayKey;
    }
  }
  return null;
}
