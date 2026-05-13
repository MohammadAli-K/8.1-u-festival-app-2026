import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LangContext.jsx';
import { createMockWallEntry, initialWallEntries } from './mockWallData.js';
import { loadWallReactions, saveWallReactions } from './wallStorage.js';

const CYCLE_MS = 5000;
const NEW_ENTRY_MS = 30000;

export function Bezoekerswall() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState(() => initialWallEntries(language));
  const [reactions, setReactions] = useState(loadWallReactions);

  useEffect(() => {
    const id = setInterval(() => {
      setEntries((prev) => {
        if (prev.length < 2) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setEntries((prev) => {
        const next = [createMockWallEntry(language), ...prev];
        return next.slice(0, 24);
      });
    }, NEW_ENTRY_MS);
    return () => clearInterval(id);
  }, [language]);

  const bump = useCallback((entryId, kind) => {
    setReactions((prev) => {
      const cur = prev[entryId] ?? { clap: 0, heart: 0, fire: 0 };
      const nextRow = { ...cur, [kind]: cur[kind] + 1 };
      const next = { ...prev, [entryId]: nextRow };
      saveWallReactions(next);
      return next;
    });
  }, []);

  const visible = entries.slice(0, 6);

  return (
    <section className="interactie-card" aria-labelledby="interactie-wall-heading">
      <h2 id="interactie-wall-heading" className="interactie-card__title">
        {t('interactie.section.wall')}
      </h2>
      <p className="interactie-hint">{t('interactie.wall.hint')}</p>
      <div className="interactie-wall">
        <div className="interactie-wall__list">
          {visible.map((e) => {
            const r = reactions[e.id] ?? { clap: 0, heart: 0, fire: 0 };
            return (
              <article key={e.id} className="interactie-wall__item">
                <span className="interactie-wall__avatar" aria-hidden>
                  {e.avatar}
                </span>
                <div className="interactie-wall__body">
                  <div className="interactie-wall__user">{e.user}</div>
                  <div className="interactie-wall__meta">
                    {t(e.stageKey)} · {e.timeLabel}
                  </div>
                </div>
                <div className="interactie-wall__react" aria-label={t('interactie.wall.reactions')}>
                  <button
                    type="button"
                    title={t('interactie.wall.clap')}
                    onClick={() => bump(e.id, 'clap')}
                  >
                    👏{r.clap > 0 ? <span aria-hidden> {r.clap}</span> : null}
                  </button>
                  <button
                    type="button"
                    title={t('interactie.wall.heart')}
                    onClick={() => bump(e.id, 'heart')}
                  >
                    ❤️{r.heart > 0 ? <span aria-hidden> {r.heart}</span> : null}
                  </button>
                  <button
                    type="button"
                    title={t('interactie.wall.fire')}
                    onClick={() => bump(e.id, 'fire')}
                  >
                    🔥{r.fire > 0 ? <span aria-hidden> {r.fire}</span> : null}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
