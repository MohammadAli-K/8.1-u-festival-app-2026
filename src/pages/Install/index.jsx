import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useInstallPrompt } from '../../context/InstallPromptContext.jsx';
import { useLanguage } from '../../context/LangContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Button } from '../../components/Button.jsx';
import logoBlack from '../../assets/logos/logo_black.svg';
import logoWhite from '../../assets/logos/logo_white.svg';
import './Install.css';

const INSTALL_QR_URL = 'https://u-festival.nl';

export default function InstallPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { deferredPrompt, promptInstall } = useInstallPrompt();
  const logoSrc = theme === 'dark' ? logoWhite : logoBlack;
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(INSTALL_QR_URL, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: theme === 'dark' ? '#ffffff' : '#000000',
        light: theme === 'dark' ? '#000000' : '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <div className="page-install">
      <img
        className="page-install__logo"
        src={logoSrc}
        alt={t('home.hero.logoAlt')}
        width={200}
        height={80}
        decoding="async"
      />
      {qrDataUrl ? (
        <img className="page-install__qr" src={qrDataUrl} alt={t('install.qrAlt')} width={256} height={256} />
      ) : null}
      <p className="page-install__hint prose">{t('install.scanHint')}</p>
      {deferredPrompt ? (
        <Button variant="primary" onClick={() => void promptInstall()}>
          {t('install.button')}
        </Button>
      ) : (
        <p className="page-install__hint" style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>
          {t('install.unavailable')}
        </p>
      )}
    </div>
  );
}
