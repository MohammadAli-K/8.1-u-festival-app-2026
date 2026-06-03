import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LangContext.jsx';
import { actsById } from '../data/acts.js';
import {
  festivalDates,
  getFestivalDayKey,
  GRID_START_MINUTES,
  NUM_QUARTER_SLOTS,
  scheduleSlotsByDay,
  stages,
} from '../data/schedule.js';

/** @typedef {'saturday' | 'sunday'} DayKey */
/** @typedef {'poton' | 'the-lake' | 'the-club' | 'hanggar'} StageId */

/**
 * @typedef {{
 *   id: string;
 *   dayKey: DayKey;
 *   stageId: StageId;
 *   actId: string | null;
 *   titleKey: string | null;
 *   start: Date;
 *   end: Date;
 *   displayTitle: string;
 *   description: { en: string; nl: string } | null;
 *   youtubeUrl: string | null;
 *   imageSrc: string | null;
 *   gridStartCol: number;
 *   gridSpan: number;
 * }} ScheduleBlock
 */

/**
 * @param {DayKey} dayKey
 * @param {string} hhmm "HH:MM"
 */
function parseSlotDate(dayKey, hhmm) {
  const { year, month, day } = festivalDates[dayKey];
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(year, month - 1, day, h, m, 0, 0);
}

/**
 * Minutes from midnight (local wall clock for that slot's calendar day).
 * @param {Date} d
 */
function minutesFromMidnight(d) {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Live = now >= start && now < end (end exclusive: act stops at end time).
 * @param {Date} now
 * @param {Date} start
 * @param {Date} end
 */
export function isBlockLive(now, start, end) {
  return now >= start && now < end;
}

/**
 * @param {Date} start
 * @param {Date} end
 */
export function blockGridPlacement(start, end) {
  const sm = minutesFromMidnight(start);
  let em = minutesFromMidnight(end);
  // End time "24:00" parses to next-day 00:00 (JS Date rollover). Treat any end ≤ start as midnight.
  if (em <= sm) em += 24 * 60;
  const startCol = Math.round((sm - GRID_START_MINUTES) / 15);
  const span = Math.max(1, Math.round((em - sm) / 15));
  return {
    gridStartCol: Math.max(0, Math.min(NUM_QUARTER_SLOTS - 1, startCol)),
    gridSpan: Math.min(NUM_QUARTER_SLOTS, span),
  };
}

/**
 * @param {(key: string) => string} t
 * @returns {{ blocksById: Record<string, ScheduleBlock>; allBlocks: ScheduleBlock[] }}
 */
function buildAllBlocks(t) {
  /** @type {ScheduleBlock[]} */
  const allBlocks = [];
  /** @type {Record<string, ScheduleBlock>} */
  const blocksById = {};

  /** @type {DayKey[]} */
  const days = ['saturday', 'sunday'];
  for (const dayKey of days) {
    const daySlots = scheduleSlotsByDay[dayKey];
    if (!daySlots) continue;
    for (const stage of stages) {
      const list = daySlots[stage.id];
      if (!list) continue;
      for (const raw of list) {
        const start = parseSlotDate(dayKey, raw.start);
        const end = parseSlotDate(dayKey, raw.end);
        const act = raw.actId ? actsById[raw.actId] : null;
        const displayTitle = act
          ? act.name
          : raw.titleKey
            ? t(raw.titleKey)
            : '';
        const { gridStartCol, gridSpan } = blockGridPlacement(start, end);
        const block = {
          id: raw.id,
          dayKey,
          stageId: raw.stageId,
          actId: raw.actId,
          titleKey: raw.titleKey ?? null,
          start,
          end,
          displayTitle,
          description: act ? act.description : null,
          youtubeUrl: act ? act.youtubeUrl : null,
          imageSrc: act ? act.imageSrc : null,
          gridStartCol,
          gridSpan,
        };
        allBlocks.push(block);
        blocksById[raw.id] = block;
      }
    }
  }

  return { blocksById, allBlocks };
}

/**
 * @param {ScheduleBlock[]} blocks
 * @param {Set<string>} favouriteIds
 */
function filterBlocksForMySchedule(blocks, favouriteIds) {
  return blocks.filter((b) => favouriteIds.has(b.id));
}

/**
 * Live slot on a stage and the next scheduled slot for the same festival calendar day.
 *
 * - `current`: block where `isLiveFn(block, now)` is true.
 * - `next`: if there is a current block, the first block with `start >= current.end`; otherwise the first block with `start > now`.
 *
 * @param {ScheduleBlock[]} allBlocks
 * @param {StageId} stageId
 * @param {Date} now
 * @param {(block: ScheduleBlock, now: Date) => boolean} isLiveFn
 * @returns {{ current: ScheduleBlock | null; next: ScheduleBlock | null; dayKey: DayKey | null }}
 */
export function getCurrentAndNextForStage(allBlocks, stageId, now, isLiveFn) {
  const dayKey = getFestivalDayKey(now);
  if (!dayKey) return { current: null, next: null, dayKey: null };
  const blocks = allBlocks
    .filter((b) => b.dayKey === dayKey && b.stageId === stageId)
    .sort((a, b) => a.start - b.start);
  const current = blocks.find((b) => isLiveFn(b, now)) ?? null;
  const next = current
    ? (blocks.find((b) => b.start >= current.end) ?? null)
    : (blocks.find((b) => b.start > now) ?? null);
  return { current, next, dayKey };
}

/**
 * Loads schedule (static for now; replace with fetch() later).
 * @returns {{
 *   loading: boolean;
 *   error: Error | null;
 *   stages: typeof stages;
 *   blocksById: Record<string, ScheduleBlock>;
 *   allBlocks: ScheduleBlock[];
 *   getStageRows: (
 *     dayKey: DayKey,
 *     opts: {
 *       onlyFavourites: boolean;
 *       favouriteIds: Set<string>;
 *       stageIds?: Set<StageId>;
 *       actIds?: Set<string>;
 *     },
 *   ) => { stageId: StageId; blocks: ScheduleBlock[] }[];
 *   isLive: (block: ScheduleBlock, now: Date) => boolean;
 *   getCurrentAndNextForStage: (stageId: StageId, now: Date) => {
 *     current: ScheduleBlock | null;
 *     next: ScheduleBlock | null;
 *     dayKey: DayKey | null;
 *   };
 * }}
 */
export function useSchedule() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  const { blocksById, allBlocks } = useMemo(() => buildAllBlocks(t), [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.resolve();
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStageRows = useCallback(
    (dayKey, { onlyFavourites, favouriteIds, stageIds, actIds }) => {
      const hasStageFilter = stageIds && stageIds.size > 0;
      const hasActFilter = actIds && actIds.size > 0;
      return stages
        .filter((stage) => !hasStageFilter || stageIds.has(stage.id))
        .map((stage) => {
          let blocks = allBlocks.filter(
            (b) => b.dayKey === dayKey && b.stageId === stage.id,
          );
          if (hasActFilter) {
            blocks = blocks.filter((b) => b.actId !== null && actIds.has(b.actId));
          }
          const visible = onlyFavourites ? filterBlocksForMySchedule(blocks, favouriteIds) : blocks;
          return { stageId: stage.id, blocks: visible };
        })
        .filter((row) => row.blocks.length > 0);
    },
    [allBlocks],
  );

  const isLive = useCallback((block, now) => isBlockLive(now, block.start, block.end), []);

  const getCurrentAndNextForStageCb = useCallback(
    (stageId, now) => getCurrentAndNextForStage(allBlocks, stageId, now, isLive),
    [allBlocks, isLive],
  );

  return useMemo(
    () => ({
      loading,
      error,
      stages,
      blocksById,
      allBlocks,
      getStageRows,
      isLive,
      getCurrentAndNextForStage: getCurrentAndNextForStageCb,
    }),
    [loading, error, blocksById, allBlocks, getStageRows, isLive, getCurrentAndNextForStageCb],
  );
}
