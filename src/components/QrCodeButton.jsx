import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LangContext.jsx';
import qrCodeImage from '../assets/qr-code/qrcode.png';
import './QrCodeButton.css';

export function QrCodeButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const buttonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const closeRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [open]);

  const modal = open
    ? createPortal(
        <div className="qr-modal" role="presentation">
          <button
            type="button"
            className="qr-modal__backdrop"
            aria-label={t('home.qr.close')}
            onClick={() => setOpen(false)}
          />
          <div
            className="qr-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="qr-modal__header">
              <h2 id={titleId} className="qr-modal__title">
                {t('home.qr.title')}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="qr-modal__close tap-scale"
                aria-label={t('home.qr.close')}
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
            </div>
            <div className="qr-modal__image-wrap">
              <img
                className="qr-modal__image"
                src={qrCodeImage}
                alt={t('home.qr.alt')}
                width={320}
                height={320}
                decoding="async"
              />
            </div>
            <p className="qr-modal__hint">{t('home.qr.hint')}</p>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="app-header__icon-btn tap-scale"
        onClick={() => setOpen(true)}
        aria-label={t('topBar.qr')}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined" aria-hidden>
          qr_code_2
        </span>
      </button>
      {modal}
    </>
  );
}
