import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LangContext.jsx';
import { Accordion } from '../../components/Accordion.jsx';
import { getExternalMapsUrl, VENUE_MAP_CENTER } from '../../data/map.js';
import pkg from '../../../package.json';

const VERSION_TAP_WINDOW_MS = 2000;
const VERSION_TAP_COUNT = 5;

export default function InfoPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const versionTapRef = useRef({ count: 0, windowStart: 0 });

  const mapsOpenUrl = getExternalMapsUrl(
    VENUE_MAP_CENTER.lat,
    VENUE_MAP_CENTER.lon,
    t('home.hero.location'),
  );

  const onVersionTap = useCallback(() => {
    const now = Date.now();
    const { count, windowStart } = versionTapRef.current;
    if (!windowStart || now - windowStart > VERSION_TAP_WINDOW_MS) {
      versionTapRef.current = { count: 1, windowStart: now };
      return;
    }
    const next = count + 1;
    if (next >= VERSION_TAP_COUNT) {
      versionTapRef.current = { count: 0, windowStart: 0 };
      navigate('/logboek');
      return;
    }
    versionTapRef.current = { count: next, windowStart };
  }, [navigate]);

  const items = [
    {
      id: 'general',
      title: t('info.section.general'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.general.intro')}</p>
          <p>{t('info.general.address')}</p>
          <p>{t('info.general.navigation')}</p>
          <p>{t('info.general.date')}</p>
        </div>
      ),
    },
    {
      id: 'travel',
      title: t('info.section.travel'),
      content: (
        <div className="info-acc prose">
          <ul className="info-acc__list">
            <li>{t('info.travel.bike')}</li>
            <li>{t('info.travel.car')}</li>
            <li>{t('info.travel.ov')}</li>
            <li>{t('info.travel.shuttle')}</li>
            <li>{t('info.travel.taxi')}</li>
          </ul>
          <a
            href={mapsOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary ui-text tap-scale info-acc__maps"
          >
            {t('info.maps.open')}
          </a>
        </div>
      ),
    },
    {
      id: 'lockers',
      title: t('info.section.lockers'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.lockers.body')}</p>
        </div>
      ),
    },
    {
      id: 'faq',
      title: t('info.section.faq'),
      content: (
        <div className="info-acc prose info-faq">
          <div className="info-faq__item">
            <p className="info-faq__q">{t('info.faq.q1')}</p>
            <p>{t('info.faq.a1')}</p>
          </div>
          <div className="info-faq__item">
            <p className="info-faq__q">{t('info.faq.q2')}</p>
            <p>{t('info.faq.a2')}</p>
          </div>
          <div className="info-faq__item">
            <p className="info-faq__q">{t('info.faq.q3')}</p>
            <p>{t('info.faq.a3')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'golden',
      title: t('info.section.golden'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.golden.body')}</p>
        </div>
      ),
    },
  ];

  return (
    <article className="page-info prose">
      <h1 className="page-title">{t('info.title')}</h1>
      <Accordion items={items} />
      <button type="button" className="info-version tap-scale" onClick={onVersionTap}>
        {t('info.versionPrefix')} {pkg.version}
      </button>
    </article>
  );
}
