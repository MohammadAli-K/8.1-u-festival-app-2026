import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet.jsx';
import { Button } from '../../components/Button.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { useLanguage } from '../../context/LangContext.jsx';
import { useSchedule, useScheduleFavourites } from '../../hooks/index.js';
import {
  getEffectiveNow,
  NUM_QUARTER_SLOTS,
  GRID_START_MINUTES,
  stages,
} from '../../data/schedule.js';
import { actsById, homeActOrder } from '../../data/acts.js';
import potonStage from '../../assets/stages/poton.svg';
import theLakeStage from '../../assets/stages/the-lake.svg';
import theClubStage from '../../assets/stages/the-club.svg';
import hanggarStage from '../../assets/stages/hanggar.svg';
import './Schedule.css';

/** @type {Record<string, string>} */
const STAGE_IMAGES = {
  poton: potonStage,
  'the-lake': theLakeStage,
  'the-club': theClubStage,
  hanggar: hanggarStage,
};

/**
 * @param {Date} start
 * @param {Date} end
 * @param {'nl' | 'en'} language
 */
function formatTimeRange(start, end, language) {
  const locale = language === 'nl' ? 'nl-NL' : 'en-GB';
  const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default function SchedulePage() {
  const { t, language } = useLanguage();
  const [day, setDay] = useState(/** @type {'saturday' | 'sunday'} */ ('saturday'));
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [selectedId, setSelectedId] = useState(/** @type {string | null} */ (null));
  const [now, setNow] = useState(() => getEffectiveNow());
  const [filterStageIds, setFilterStageIds] = useState(
    /** @type {Set<import('../../data/schedule.js').StageId>} */ (new Set()),
  );
  const [filterActIds, setFilterActIds] = useState(/** @type {Set<string>} */ (new Set()));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { loading, error, blocksById, allBlocks, getStageRows, isLive } = useSchedule();
  const { favouriteIds, isFavourite, toggleFavourite } = useScheduleFavourites(blocksById);

  useEffect(() => {
    const id = window.setInterval(() => setNow(getEffectiveNow()), 45_000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(
    () =>
      getStageRows(day, {
        onlyFavourites,
        favouriteIds,
        stageIds: filterStageIds,
        actIds: filterActIds,
      }),
    [day, onlyFavourites, getStageRows, favouriteIds, filterStageIds, filterActIds],
  );

  // Only show artists that actually appear somewhere in the schedule data.
  const scheduledActIds = useMemo(() => {
    const set = new Set();
    for (const b of allBlocks) if (b.actId) set.add(b.actId);
    return set;
  }, [allBlocks]);

  const artistOptions = useMemo(
    () =>
      homeActOrder
        .filter((id) => scheduledActIds.has(id) && actsById[id])
        .map((id) => ({ id, name: actsById[id].name })),
    [scheduledActIds],
  );

  const filterCount = filterStageIds.size + filterActIds.size;

  const toggleStageFilter = useCallback((stageId) => {
    setFilterStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }, []);

  const toggleActFilter = useCallback((actId) => {
    setFilterActIds((prev) => {
      const next = new Set(prev);
      if (next.has(actId)) next.delete(actId);
      else next.add(actId);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilterStageIds(new Set());
    setFilterActIds(new Set());
  }, []);

  const selected = selectedId ? blocksById[selectedId] : null;

  const stageMeta = useCallback(
    (stageId) => {
      const s = stages.find((x) => x.id === stageId);
      if (!s) return { name: '', sub: '' };
      return { name: t(s.nameKey), sub: t(s.subtitleKey) };
    },
    [t],
  );

  const blockStageClass = (block) => {
    if (block.stageId === 'poton') return 'schedule-block schedule-block--poton';
    if (block.stageId === 'the-lake') return 'schedule-block schedule-block--the-lake';
    if (block.stageId === 'the-club') return 'schedule-block schedule-block--the-club';
    return 'schedule-block schedule-block--hanggar';
  };

  if (loading) {
    return (
      <div className="page-schedule">
        <h1 className="page-title">{t('schedule.title')}</h1>
        <Spinner label={t('spinner.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-schedule">
        <h1 className="page-title">{t('schedule.title')}</h1>
        <p className="prose-muted">{String(error.message)}</p>
      </div>
    );
  }

  const hasAnyFilter = filterCount > 0;
  const showEmpty = rows.length === 0 && (onlyFavourites || hasAnyFilter);
  const emptyMessage = onlyFavourites
    ? t('schedule.emptyMySchedule')
    : t('schedule.emptyFiltered');

  return (
    <div className="page-schedule">
      <h1 className="page-title">{t('schedule.title')}</h1>

      <div className="segmented" role="tablist" aria-label={t('schedule.title')}>
        <Button
          type="button"
          role="tab"
          aria-selected={day === 'saturday'}
          variant={day === 'saturday' ? 'primary' : 'ghost'}
          className="btn--segment"
          onClick={() => setDay('saturday')}
        >
          {t('schedule.tab.saturdayShort')}
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={day === 'sunday'}
          variant={day === 'sunday' ? 'primary' : 'ghost'}
          className="btn--segment"
          onClick={() => setDay('sunday')}
        >
          {t('schedule.tab.sundayShort')}
        </Button>
      </div>

      <div className="page-schedule__toolbar">
        <div className="page-schedule__toolbar-buttons">
          <Button
            type="button"
            variant={onlyFavourites ? 'primary' : 'ghost'}
            aria-pressed={onlyFavourites}
            onClick={() => setOnlyFavourites((v) => !v)}
          >
            {t('schedule.mySchedule')}
          </Button>
          <Button
            type="button"
            variant={hasAnyFilter ? 'primary' : 'ghost'}
            aria-pressed={hasAnyFilter}
            aria-haspopup="dialog"
            onClick={() => setFiltersOpen(true)}
          >
            {hasAnyFilter
              ? `${t('schedule.filter')} (${filterCount})`
              : t('schedule.filter')}
          </Button>
        </div>
        {onlyFavourites ? (
          <span className="ui-text" style={{ fontSize: '0.85rem' }}>
            {t('schedule.myScheduleHint')}
          </span>
        ) : null}
      </div>

      <div
        className="page-schedule__scroll"
        role="region"
        aria-label={t('schedule.axisLabel')}
        style={{ '--schedule-num-slots': String(NUM_QUARTER_SLOTS) }}
      >
        {showEmpty ? (
          <p className="page-schedule__empty">{emptyMessage}</p>
        ) : (
          <div className="schedule-grid">
            <div className="schedule-axis">
              <div className="schedule-axis__corner" aria-hidden />
              <div
                className="schedule-axis__slots"
                style={{
                  gridTemplateColumns: `repeat(${NUM_QUARTER_SLOTS}, minmax(var(--schedule-slot-min), 1fr))`,
                }}
              >
                {Array.from({ length: NUM_QUARTER_SLOTS }, (_, i) => {
                  const mins = GRID_START_MINUTES + i * 15;
                  const hh = Math.floor(mins / 60);
                  const mm = mins % 60;
                  const label = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                  return (
                    <div key={i} className="schedule-axis__cell">
                      <span className="schedule-axis__label">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {rows.map((row) => {
              const meta = stageMeta(row.stageId);
              return (
                <div key={row.stageId} className="schedule-row">
                  <div className="schedule-row__stage">
                    <img src={STAGE_IMAGES[row.stageId]} alt={meta.name} title={meta.sub} />
                  </div>
                  <div
                    className="schedule-row__track"
                    style={{
                      gridTemplateColumns: `repeat(${NUM_QUARTER_SLOTS}, minmax(var(--schedule-slot-min), 1fr))`,
                    }}
                  >
                    {row.blocks.map((block) => {
                      const live = isLive(block, now);
                      const fav = isFavourite(block.id);
                      const colStart = block.gridStartCol + 1;
                      const colEnd = colStart + block.gridSpan;
                      return (
                        <button
                          key={block.id}
                          type="button"
                          className={`${blockStageClass(block)}${live ? ' schedule-block--live' : ''}`}
                          style={{ gridColumn: `${colStart} / ${colEnd}` }}
                          onClick={() => setSelectedId(block.id)}
                        >
                          {fav ? (
                            <span className="schedule-block__fav" aria-hidden>
                              ❤️
                            </span>
                          ) : null}
                          <span className="schedule-block__title">{block.displayTitle}</span>
                          <span className="schedule-block__time">
                            {formatTimeRange(block.start, block.end, language)}
                          </span>
                          {live ? (
                            <span className="ui-text" style={{ fontSize: '0.58rem', marginTop: '0.1rem' }}>
                              {t('schedule.liveNow')}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected ? (
        <BottomSheet
          open
          onClose={() => setSelectedId(null)}
          title={selected.displayTitle}
        >
          <ActDetailContent
            block={selected}
            language={language}
            t={t}
            isFavourite={isFavourite(selected.id)}
            onToggleFavourite={() => toggleFavourite(selected.id)}
            onOpenYoutube={() => {
              if (selected.youtubeUrl) window.open(selected.youtubeUrl, '_blank', 'noopener,noreferrer');
            }}
          />
        </BottomSheet>
      ) : null}

      {filtersOpen ? (
        <BottomSheet
          open
          onClose={() => setFiltersOpen(false)}
          title={t('schedule.filter.title')}
        >
          <FilterContent
            t={t}
            stages={stages}
            filterStageIds={filterStageIds}
            onToggleStage={toggleStageFilter}
            artists={artistOptions}
            filterActIds={filterActIds}
            onToggleArtist={toggleActFilter}
            onReset={resetFilters}
            onClose={() => setFiltersOpen(false)}
            hasAnyFilter={hasAnyFilter}
          />
        </BottomSheet>
      ) : null}
    </div>
  );
}

/**
 * @param {{
 *   block: import('../../hooks/useSchedule.js').ScheduleBlock;
 *   language: 'nl' | 'en';
 *   t: (k: string) => string;
 *   isFavourite: boolean;
 *   onToggleFavourite: () => void;
 *   onOpenYoutube: () => void;
 * }} props
 */
function ActDetailContent({ block, language, t, isFavourite, onToggleFavourite, onOpenYoutube }) {
  const meta = stages.find((s) => s.id === block.stageId);
  const stageName = meta ? t(meta.nameKey) : '';
  const desc =
    block.description?.[language] ?? block.description?.en ?? t('schedule.noDescription');

  return (
    <>
      {block.imageSrc ? (
        <img className="schedule-detail__img" src={block.imageSrc} alt="" />
      ) : null}
      <p className="schedule-detail__meta">
        {stageName}
        <br />
        {formatTimeRange(block.start, block.end, language)}
      </p>
      <p className="schedule-detail__desc">{desc}</p>
      <div className="schedule-detail__actions">
        {block.youtubeUrl ? (
          <Button type="button" variant="primary" className="tap-scale" onClick={onOpenYoutube}>
            {t('schedule.youtube')}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={isFavourite ? 'primary' : 'ghost'}
          className="schedule-detail__fav tap-scale"
          aria-pressed={isFavourite}
          onClick={onToggleFavourite}
        >
          {isFavourite ? t('schedule.favourite.remove') : t('schedule.favourite.add')}
        </Button>
      </div>
    </>
  );
}

/**
 * @param {{
 *   t: (k: string) => string;
 *   stages: readonly { id: import('../../data/schedule.js').StageId; nameKey: string }[];
 *   filterStageIds: Set<import('../../data/schedule.js').StageId>;
 *   onToggleStage: (id: import('../../data/schedule.js').StageId) => void;
 *   artists: { id: string; name: string }[];
 *   filterActIds: Set<string>;
 *   onToggleArtist: (id: string) => void;
 *   onReset: () => void;
 *   onClose: () => void;
 *   hasAnyFilter: boolean;
 * }} props
 */
function FilterContent({
  t,
  stages: stageList,
  filterStageIds,
  onToggleStage,
  artists,
  filterActIds,
  onToggleArtist,
  onReset,
  onClose,
  hasAnyFilter,
}) {
  return (
    <div className="schedule-filter">
      <section className="schedule-filter__section" aria-labelledby="schedule-filter-stages">
        <h3 id="schedule-filter-stages" className="schedule-filter__heading">
          {t('schedule.filter.stages')}
        </h3>
        <div className="schedule-filter__chips" role="group" aria-labelledby="schedule-filter-stages">
          {stageList.map((stage) => {
            const active = filterStageIds.has(stage.id);
            return (
              <button
                key={stage.id}
                type="button"
                className={`schedule-filter__chip${active ? ' schedule-filter__chip--active' : ''}`}
                aria-pressed={active}
                onClick={() => onToggleStage(stage.id)}
              >
                {t(stage.nameKey)}
              </button>
            );
          })}
        </div>
      </section>

      {artists.length > 0 ? (
        <section className="schedule-filter__section" aria-labelledby="schedule-filter-artists">
          <h3 id="schedule-filter-artists" className="schedule-filter__heading">
            {t('schedule.filter.artists')}
          </h3>
          <div
            className="schedule-filter__chips"
            role="group"
            aria-labelledby="schedule-filter-artists"
          >
            {artists.map((artist) => {
              const active = filterActIds.has(artist.id);
              return (
                <button
                  key={artist.id}
                  type="button"
                  className={`schedule-filter__chip${active ? ' schedule-filter__chip--active' : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggleArtist(artist.id)}
                >
                  {artist.name}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="schedule-filter__actions">
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          disabled={!hasAnyFilter}
        >
          {t('schedule.filter.reset')}
        </Button>
        <Button type="button" variant="primary" onClick={onClose}>
          {t('schedule.filter.close')}
        </Button>
      </div>
    </div>
  );
}
