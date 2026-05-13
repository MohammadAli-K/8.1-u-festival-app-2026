import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../context/LangContext.jsx';
import { Button } from './Button.jsx';
import './NotificatieInstellingen.css';
import { readNotificationOptIn, writeNotificationOptIn, NOTIFICATION_STORAGE_KEY } from '../utils/notificationPreference.js';

export function NotificatieInstellingen() {
  const { t } = useLanguage();
  const [optIn, setOptIn] = useState(() => readNotificationOptIn());
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'denied'),
  );

  useEffect(() => {
    const sync = () => {
      if (typeof Notification !== 'undefined') setPermission(Notification.permission);
      setOptIn(readNotificationOptIn());
    };
    const onStorage = (e) => {
      if (e.key !== NOTIFICATION_STORAGE_KEY && e.key !== null) return;
      sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onToggle = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (permission === 'denied') return;

    if (!optIn) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        writeNotificationOptIn(true);
        setOptIn(true);
      } else {
        writeNotificationOptIn(false);
        setOptIn(false);
      }
      return;
    }

    writeNotificationOptIn(false);
    setOptIn(false);
  }, [optIn, permission]);

  const sendDemo = useCallback(async () => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({
        type: 'U_FESTIVAL_DEMO_NOTIFY',
        title: t('notifications.demoTitle'),
        body: t('notifications.demoBody'),
      });
    } catch {
      /* ignore */
    }
  }, [t]);

  const denied = permission === 'denied';
  const canDemo = permission === 'granted' && optIn;

  return (
    <div className="notificatie-instellingen">
      {denied ? <p className="notificatie-instellingen__hint">{t('notifications.permissionDenied')}</p> : null}
      <label className="notificatie-instellingen__row">
        <input
          type="checkbox"
          checked={optIn && permission === 'granted'}
          disabled={denied}
          onChange={() => void onToggle()}
        />
        <span>{t('notifications.toggleLabel')}</span>
      </label>
      <Button type="button" variant="primary" disabled={!canDemo} onClick={() => void sendDemo()}>
        {t('notifications.demo')}
      </Button>
      {!canDemo && !denied ? (
        <p className="notificatie-instellingen__hint">{t('notifications.demoNeedPermission')}</p>
      ) : null}
    </div>
  );
}
