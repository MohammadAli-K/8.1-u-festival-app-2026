import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInstallPrompt } from '../context/InstallPromptContext.jsx';
import { useLanguage } from '../context/LangContext.jsx';
import './PwaSystemBanners.css';

const MAIN_SHELL_PATHS = new Set(['/', '/info', '/schedule', '/map']);
const INSTALL_DISMISS_KEY = 'u-festival-install-banner-dismissed';

function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Coarse platform detection for the manual install hint shown when the native
 * `beforeinstallprompt` event is unavailable (e.g. iOS Safari, Firefox Android).
 * @returns {'ios' | 'android' | 'other'}
 */
function getPlatform() {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports itself as a Mac, so fall back to touch detection.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

export function PwaSystemBanners() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const { deferredPrompt, promptInstall } = useInstallPrompt();
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [installAfterDelay, setInstallAfterDelay] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(INSTALL_DISMISS_KEY) === '1',
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const stackRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const isMainShell = MAIN_SHELL_PATHS.has(pathname);
  const platform = getPlatform();

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    let clearId = 0;
    const onInstalled = () => {
      setShowSuccess(true);
      setInstallAfterDelay(false);
      setInstallDismissed(true);
      clearId = window.setTimeout(() => setShowSuccess(false), 5000);
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('appinstalled', onInstalled);
      if (clearId) window.clearTimeout(clearId);
    };
  }, []);

  useEffect(() => {
    if (!isMainShell || isStandalonePwa() || installDismissed) {
      setInstallAfterDelay(false);
      return;
    }
    setInstallAfterDelay(true);
  }, [isMainShell, installDismissed]);

  const installEligible =
    isMainShell && !isStandalonePwa() && !installDismissed && installAfterDelay;

  const showInstallBanner = installEligible && Boolean(deferredPrompt);

  // Fallback for platforms without a native prompt (iOS Safari, Firefox/Samsung
  // on Android, etc.): show manual "add to home screen" instructions instead.
  const showManualHint =
    installEligible && !deferredPrompt && (platform === 'ios' || platform === 'android');

  const manualHintText = platform === 'ios' ? t('install.banner.iosHint') : t('install.banner.androidHint');

  const hasContent = !online || showInstallBanner || showManualHint || showSuccess;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const el = stackRef.current;
    if (!el || !hasContent) {
      root.style.setProperty('--pwa-banner-stack', '0px');
      root.removeAttribute('data-pwa-banners');
      return () => {
        root.style.setProperty('--pwa-banner-stack', '0px');
        root.removeAttribute('data-pwa-banners');
      };
    }
    const h = el.offsetHeight;
    root.style.setProperty('--pwa-banner-stack', `${h}px`);
    root.setAttribute('data-pwa-banners', 'on');
    const ro = new ResizeObserver(() => {
      if (!stackRef.current) return;
      root.style.setProperty('--pwa-banner-stack', `${stackRef.current.offsetHeight}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty('--pwa-banner-stack', '0px');
      root.removeAttribute('data-pwa-banners');
    };
  }, [hasContent, online, showInstallBanner, showManualHint, showSuccess]);

  const dismissInstall = () => {
    sessionStorage.setItem(INSTALL_DISMISS_KEY, '1');
    setInstallDismissed(true);
  };

  if (!hasContent) return null;

  return (
    <div className="pwa-system-banners" ref={stackRef} role="region" aria-label={t('pwa.banners.aria')}>
      {!online ? (
        <div className="pwa-system-banners__strip pwa-system-banners__strip--offline">{t('offline.banner')}</div>
      ) : null}
      {showInstallBanner ? (
        <div className="pwa-system-banners__strip pwa-system-banners__strip--install">
          <span>{t('install.banner.prompt')}</span>
          <div className="pwa-system-banners__actions">
            <button
              type="button"
              className="pwa-system-banners__btn pwa-system-banners__btn--primary tap-scale"
              onClick={() => void promptInstall()}
            >
              {t('install.banner.install')}
            </button>
            <button type="button" className="pwa-system-banners__btn tap-scale" onClick={dismissInstall}>
              {t('install.banner.dismiss')}
            </button>
          </div>
        </div>
      ) : null}
      {showManualHint ? (
        <div className="pwa-system-banners__strip pwa-system-banners__strip--install">
          <span>{manualHintText}</span>
          <div className="pwa-system-banners__actions">
            <button type="button" className="pwa-system-banners__btn tap-scale" onClick={dismissInstall}>
              {t('install.banner.dismiss')}
            </button>
          </div>
        </div>
      ) : null}
      {showSuccess ? (
        <div className="pwa-system-banners__strip pwa-system-banners__strip--success">{t('install.banner.success')}</div>
      ) : null}
    </div>
  );
}
