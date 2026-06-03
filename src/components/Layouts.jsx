import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppHeader } from './AppHeader.jsx';
import { BottomNav } from './BottomNav.jsx';
import { useLanguage } from '../context/LangContext.jsx';

/** @type {Record<string, string>} */
const TITLE_KEYS = {
  '/': 'nav.home',
  '/info': 'nav.info',
  '/schedule': 'nav.schedule',
  '/map': 'nav.map',
  '/install': 'install.title',
  '/logboek': 'logboek.title',
  '/interactie': 'interactie.title',
};

function titleKeyForPath(pathname) {
  return TITLE_KEYS[pathname] ?? 'nav.home';
}

function useRouteDocumentTitle() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  useEffect(() => {
    const key = titleKeyForPath(pathname);
    document.title = `${t(key)} — ❤️U Festival`;
  }, [pathname, t]);
}

export function MainLayout() {
  useRouteDocumentTitle();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const currentPage = t(titleKeyForPath(pathname));
  const isMapPage = pathname === '/map';

  return (
    <div className="app-shell app-shell--main">
      <AppHeader currentPage={currentPage} showQrButton />
      <main className={`app-main${isMapPage ? ' app-main--map' : ''}`}>
        <div className="page-transition" key={pathname}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export function SecondaryLayout() {
  useRouteDocumentTitle();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const currentPage = t(titleKeyForPath(pathname));

  return (
    <div className="app-shell app-shell--secondary">
      <AppHeader currentPage={currentPage} />
      <main className="app-main app-main--no-nav">
        <div className="page-transition" key={pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
