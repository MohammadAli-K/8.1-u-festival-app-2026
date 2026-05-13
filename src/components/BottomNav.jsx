import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LangContext.jsx';
import './BottomNav.css';

const tabs = [
  { to: '/', labelKey: 'nav.home', icon: 'home', end: true },
  { to: '/info', labelKey: 'nav.info', icon: 'info' },
  { to: '/schedule', labelKey: 'nav.schedule', icon: 'calendar_month' },
  { to: '/map', labelKey: 'nav.map', icon: 'location_on' },
];

export function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label={t('nav.primary')}>
      <ul className="bottom-nav__list">
        {tabs.map(({ to, labelKey, icon, end }) => (
          <li key={to} className="bottom-nav__item">
            <NavLink
              to={to}
              end={end}
              aria-label={t(labelKey)}
              className={({ isActive }) =>
                `bottom-nav__link tap-scale${isActive ? ' bottom-nav__link--active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`bottom-nav__icon-wrap${isActive ? ' bottom-nav__icon-wrap--active' : ''}`}
                  >
                    <span className="material-symbols-outlined bottom-nav__icon" aria-hidden>
                      {icon}
                    </span>
                  </span>
                  <span
                    className={`bottom-nav__label${isActive ? ' bottom-nav__label--active' : ''}`}
                  >
                    {t(labelKey)}
                  </span>
                  {isActive ? <span className="bottom-nav__underline" aria-hidden /> : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
