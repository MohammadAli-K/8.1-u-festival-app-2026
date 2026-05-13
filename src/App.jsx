import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, LangProvider, InstallPromptProvider } from './context/index.js';
import { useLanguage } from './context/LangContext.jsx';
import { PwaSystemBanners } from './components/PwaSystemBanners.jsx';
import { MainLayout, SecondaryLayout } from './components/Layouts.jsx';
import { Spinner } from './components/Spinner.jsx';

const HomePage = lazy(() => import('./pages/Home/index.jsx'));
const InfoPage = lazy(() => import('./pages/Info/index.jsx'));
const SchedulePage = lazy(() => import('./pages/Schedule/index.jsx'));
const MapPage = lazy(() => import('./pages/Map/index.jsx'));
const InstallPage = lazy(() => import('./pages/Install/index.jsx'));
const LogboekPage = lazy(() => import('./pages/Logboek/index.jsx'));
const InteractiePage = lazy(() => import('./pages/Interactie/index.jsx'));

function RouteFallback() {
  const { t } = useLanguage();
  return (
    <div className="app-main" role="status">
      <Spinner label={t('spinner.loading')} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <InstallPromptProvider>
          <BrowserRouter>
            <PwaSystemBanners />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/info" element={<InfoPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/map" element={<MapPage />} />
                </Route>
                <Route element={<SecondaryLayout />}>
                  <Route path="/install" element={<InstallPage />} />
                  <Route path="/logboek" element={<LogboekPage />} />
                  <Route path="/interactie" element={<InteractiePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </InstallPromptProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
