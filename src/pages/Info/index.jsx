import { useLanguage } from '../../context/LangContext.jsx';
import { Accordion } from '../../components/Accordion.jsx';

export default function InfoPage() {
  const { t } = useLanguage();

  const items = [
    {
      id: 'general',
      title: t('info.section.general'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.general.intro')}</p>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.general.address.title')}</h3>
            <p>{t('info.general.address.location')}</p>
            <p>{t('info.general.address.navigation')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.general.hours.title')}</h3>
            <p>{t('info.general.hours.body')}</p>
          </section>
        </div>
      ),
    },
    {
      id: 'travel',
      title: t('info.section.travel'),
      content: (
        <div className="info-acc prose">
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.travel.bike.title')}</h3>
            <p>{t('info.travel.bike.body')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.travel.car.title')}</h3>
            <p>{t('info.travel.car.body')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.travel.ov.title')}</h3>
            <p>
              {t('info.travel.ov.body')}{' '}
              <a href="https://9292.nl/" target="_blank" rel="noopener noreferrer">
                9292.nl
              </a>
              .
            </p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.travel.shuttle.title')}</h3>
            <p>{t('info.travel.shuttle.p1')}</p>
            <p>{t('info.travel.shuttle.p2')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.travel.taxi.title')}</h3>
            <p>{t('info.travel.taxi.body')}</p>
          </section>
        </div>
      ),
    },
    {
      id: 'lockers',
      title: t('info.section.lockers'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.lockers.p1')}</p>
          <p>{t('info.lockers.p2')}</p>
          <p>{t('info.lockers.p3')}</p>
        </div>
      ),
    },
    {
      id: 'faq',
      title: t('info.section.faq'),
      content: (
        <div className="info-acc prose">
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.faq.q1')}</h3>
            <p>{t('info.faq.a1.p1')}</p>
            <p>{t('info.faq.a1.p2')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.faq.q2')}</h3>
            <p>{t('info.faq.a2')}</p>
          </section>
          <section className="info-sub__item">
            <h3 className="info-sub__heading">{t('info.faq.q3')}</h3>
            <p>{t('info.faq.a3')}</p>
          </section>
        </div>
      ),
    },
    {
      id: 'golden',
      title: t('info.section.golden'),
      content: (
        <div className="info-acc prose">
          <p>{t('info.golden.p1')}</p>
          <p>{t('info.golden.p2')}</p>
        </div>
      ),
    },
  ];

  return (
    <article className="page-info prose">
      <h1 className="page-title">{t('info.title')}</h1>
      <Accordion items={items} />
    </article>
  );
}
