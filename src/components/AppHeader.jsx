import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LangContext.jsx';
import logoBlack from '../assets/logos/logo_black.svg';
import logoWhite from '../assets/logos/logo_white.svg';
import './AppHeader.css';

/**
 * @param {{ currentPage: string }} props
 */
export function AppHeader({ currentPage }) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const logoSrc = theme === 'dark' ? logoWhite : logoBlack;
  const themeIcon = theme === 'dark' ? 'light_mode' : 'dark_mode';

  return (
    <header className="app-header">
      <div className="app-header__row">
        <div className="app-header__left">
          <img className="app-header__logo" src={logoSrc} alt="U Festival" height={32} />
        </div>
        <div className="app-header__center">
          {currentPage ? (
            <span className="app-header__page ui-text" title={currentPage}>
              {currentPage}
            </span>
          ) : null}
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="app-header__icon-btn tap-scale"
            onClick={toggleTheme}
            aria-label={t('topBar.theme')}
            aria-pressed={theme === 'dark'}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {themeIcon}
            </span>
          </button>
          <button
            type="button"
            className="app-header__icon-btn app-header__flag tap-scale"
            onClick={toggleLanguage}
            aria-label={t('topBar.language')}
          >
            <span aria-hidden>{language === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
