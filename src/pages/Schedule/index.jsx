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

  const { loading, error, blocksById, getStageRows, isLive } = useSchedule();
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
      }),
    [day, onlyFavourites, getStageRows, favouriteIds],
  );

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

  const showEmpty = onlyFavourites && rows.length === 0;

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
        <Button
          type="button"
          variant={onlyFavourites ? 'primary' : 'ghost'}
          aria-pressed={onlyFavourites}
          onClick={() => setOnlyFavourites((v) => !v)}
        >
          {t('schedule.mySchedule')}
        </Button>
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
          <p className="page-schedule__empty">{t('schedule.emptyMySchedule')}</p>
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
