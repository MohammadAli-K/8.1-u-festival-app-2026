import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useLanguage } from '../../context/LangContext.jsx';
import { useNews } from '../../hooks/useNews.js';
import { useSchedule } from '../../hooks/index.js';
import { getEffectiveNow, getNextActStartingWithin, stages } from '../../data/schedule.js';
import { NewsBlock } from '../../components/NewsBlock.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { BottomSheet } from '../../components/BottomSheet.jsx';
import { NotificatieInstellingen } from '../../components/NotificatieInstellingen.jsx';

const LOGO_HEART_TAP_MS = 2400;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * @param {string} iso
 * @param {'nl' | 'en'} language
 */
function formatNewsTimestamp(iso, language) {
  const locale = language === 'nl' ? 'nl-NL' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

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

export default function HomePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { items, loading, markRead, isUnread } = useNews();
  const { loading: scheduleLoading, error: scheduleError, allBlocks } = useSchedule();
  const [notifOpen, setNotifOpen] = useState(false);
  const [now, setNow] = useState(() => getEffectiveNow());
  const heartTapsRef = useRef({ count: 0, lastTs: 0 });

  useEffect(() => {
    const id = window.setInterval(() => setNow(getEffectiveNow()), 45_000);
    return () => window.clearInterval(id);
  }, []);

  const upcoming = useMemo(
    () => getNextActStartingWithin(allBlocks, now, TWO_HOURS_MS),
    [allBlocks, now],
  );

  const upcomingStageName = useMemo(() => {
    if (!upcoming) return '';
    const s = stages.find((x) => x.id === upcoming.stageId);
    return s ? t(s.nameKey) : '';
  }, [upcoming, t]);

  const onLogoHeartTap = () => {
    const ts = Date.now();
    if (ts - heartTapsRef.current.lastTs > LOGO_HEART_TAP_MS) {
      heartTapsRef.current.count = 0;
    }
    heartTapsRef.current.lastTs = ts;
    heartTapsRef.current.count += 1;
    if (heartTapsRef.current.count >= 5) {
      heartTapsRef.current.count = 0;
      navigate('/interactie');
    }
  };

  const pick = (/** @type {{ nl: string; en: string }} */ b) =>
    b[language] ?? b.nl ?? '';

  return (
    <div className="page-home">
      <header className="home-hero">
        <button
          type="button"
          className="home-hero__notif-btn tap-scale"
          onClick={() => setNotifOpen(true)}
          aria-label={t('home.notifications.open')}
        >
          <span className="material-symbols-outlined" aria-hidden>
            settings
          </span>
        </button>
        <div className="home-hero__title-wrap">
          <h1 className="home-hero__name">{t('home.hero.festivalName')}</h1>
          <button
            type="button"
            className="home-hero__heart-hit tap-scale"
            onClick={onLogoHeartTap}
            aria-hidden
            tabIndex={-1}
          />
        </div>
        <p className="home-hero__meta">{t('home.hero.date')}</p>
        <p className="home-hero__meta home-hero__meta--muted">{t('home.hero.location')}</p>
      </header>

      <h2 className="home-section__title">{t('home.section.upcoming')}</h2>
      <section className="home-upcoming" aria-label={t('home.section.upcoming')}>
        {scheduleLoading ? (
          <div className="home-upcoming__spinner">
            <Spinner label={t('spinner.loading')} />
          </div>
        ) : scheduleError ? (
          <p className="home-empty">{String(scheduleError.message)}</p>
        ) : upcoming ? (
          <div className="home-upcoming__card">
            <p className="home-upcoming__stage">{upcomingStageName}</p>
            <p className="home-upcoming__act">{upcoming.displayTitle}</p>
            <p className="home-upcoming__time">
              {formatTimeRange(upcoming.start, upcoming.end, language)}
            </p>
            <button type="button" className="home-upcoming__cta tap-scale" onClick={() => navigate('/schedule')}>
              {t('home.upcoming.cta')}
            </button>
          </div>
        ) : (
          <p className="home-empty">{t('home.upcoming.empty')}</p>
        )}
      </section>

      <h2 className="home-section__title">{t('home.section.newsAlerts')}</h2>

      <section className="home-news" aria-label={t('home.section.newsAlerts')}>
        {loading ? (
          <div className="home-news__spinner">
            <Spinner label={t('spinner.loading')} />
          </div>
        ) : items.length === 0 ? (
          <p className="home-empty">{t('home.empty')}</p>
        ) : (
          items.map((item, index) => (
            <NewsBlock
              key={item.id}
              type={item.type}
              title={pick(item.title)}
              timeLabel={formatNewsTimestamp(item.timestamp, language)}
              timeDateTime={item.timestamp}
              showNewBadge={isUnread(item.id)}
              newBadgeLabel={t('home.badge.new')}
              staggerIndex={index}
              onMarkRead={() => markRead(item.id)}
            >
              <p>{pick(item.body)}</p>
            </NewsBlock>
          ))
        )}
      </section>
      <BottomSheet open={notifOpen} onClose={() => setNotifOpen(false)} title={t('notifications.settingsTitle')}>
        <NotificatieInstellingen />
      </BottomSheet>
    </div>
  );
}
