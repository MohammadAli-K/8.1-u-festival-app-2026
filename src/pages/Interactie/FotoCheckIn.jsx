import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { useLanguage } from '../../context/LangContext.jsx';

const STAGES = ['ponton', 'theLake', 'theClub', 'hangar'];

/**
 * @param {{ stageKey: string; t: (k: string) => string }} props
 */
function stageLabel({ stageKey, t }) {
  return t(`interactie.stage.${stageKey}`);
}

/**
 * @param {HTMLVideoElement} video
 * @param {string} caption
 * @returns {Promise<Blob | null>}
 */
function snapshotToBlob(video, caption) {
  return new Promise((resolve) => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      resolve(null);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);
    const barH = Math.max(56, Math.floor(h * 0.1));
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, h - barH, w, barH);
    ctx.fillStyle = '#ffffff';
    const fontPx = Math.max(18, Math.floor(w * 0.045));
    ctx.font = `700 ${fontPx}px Sansation, system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(caption, Math.floor(w * 0.04), h - barH / 2);
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
  });
}

export function FotoCheckIn() {
  const { t } = useLanguage();
  const [stage, setStage] = useState(/** @type {string | null} */ (null));
  const [showCameraRequest, setShowCameraRequest] = useState(false);
  const [stream, setStream] = useState(/** @type {MediaStream | null} */ (null));
  const [denied, setDenied] = useState(false);
  const [blob, setBlob] = useState(/** @type {Blob | null} */ (null));
  const [photoPreview, setPhotoPreview] = useState(/** @type {string | null} */ (null));
  const [shareHint, setShareHint] = useState('');
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));

  const stopStream = useCallback(() => {
    setStream((prev) => {
      prev?.getTracks().forEach((tr) => tr.stop());
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream]);

  const requestCamera = async () => {
    setDenied(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(s);
    } catch {
      setDenied(true);
      stopStream();
    }
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !stage) return;
    const cap = stageLabel({ stageKey: stage, t });
    const b = await snapshotToBlob(video, cap);
    setPhotoPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return b ? URL.createObjectURL(b) : null;
    });
    setBlob(b);
    stopStream();
  };

  const retake = () => {
    setPhotoPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setBlob(null);
    setShareHint('');
    setShowCameraRequest(false);
  };

  const shareOrCopy = async () => {
    setShareHint('');
    if (!blob) return;
    const title = t('interactie.photo.shareTitle');
    const text = t('interactie.photo.shareText');
    const shareUrl = `${window.location.origin}/interactie`;

    if (navigator.share) {
      const file = new File([blob], 'u-festival-checkin.png', { type: 'image/png' });
      const payload = { files: [file], title, text: `${text} ${shareUrl}` };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(payload)) {
        try {
          await navigator.share(payload);
          return;
        } catch (e) {
          if (/** @type {Error} */ (e).name === 'AbortError') return;
        }
      }
      try {
        await navigator.share({ title, text: `${text} ${shareUrl}`, url: shareUrl });
        return;
      } catch (e) {
        if (/** @type {Error} */ (e).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareHint(t('interactie.photo.copied'));
    } catch {
      setShareHint(t('interactie.photo.copyFailed'));
    }
  };

  const copyLinkOnly = async () => {
    const shareUrl = `${window.location.origin}/interactie`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareHint(t('interactie.photo.copied'));
    } catch {
      setShareHint(t('interactie.photo.copyFailed'));
    }
  };

  return (
    <section className="interactie-card" aria-labelledby="interactie-photo-heading">
      <h2 id="interactie-photo-heading" className="interactie-card__title">
        {t('interactie.section.photo')}
      </h2>
      <p className="interactie-hint">{t('interactie.photo.pickStage')}</p>
      <div className="interactie-stage-row" role="group" aria-label={t('interactie.photo.pickStage')}>
        {STAGES.map((key) => (
          <button
            key={key}
            type="button"
            className={`interactie-chip${stage === key ? ' interactie-chip--active' : ''}`}
            onClick={() => {
              setStage(key);
              setShowCameraRequest(false);
              setDenied(false);
            }}
          >
            {t(`interactie.stage.${key}`)}
          </button>
        ))}
      </div>

      {!showCameraRequest && !stream && !blob ? (
        <Button
          variant="primary"
          disabled={!stage}
          onClick={() => stage && setShowCameraRequest(true)}
        >
          {t('interactie.photo.continue')}
        </Button>
      ) : null}

      {showCameraRequest && !stream && !blob ? (
        <>
          <div className="interactie-perm-block" role="note">
            <p className="interactie-perm-lang">NL</p>
            <p>{t('interactie.camera.permissionNl')}</p>
            <p className="interactie-perm-lang" style={{ marginTop: '0.65rem' }}>
              EN
            </p>
            <p>{t('interactie.camera.permissionEn')}</p>
          </div>
          <div className="interactie-actions">
            <Button variant="primary" onClick={requestCamera}>
              {t('interactie.camera.request')}
            </Button>
            <Button variant="ghost" onClick={() => setShowCameraRequest(false)}>
              {t('interactie.photo.back')}
            </Button>
          </div>
          {denied ? (
            <>
              <p className="interactie-hint">{t('interactie.camera.denied')}</p>
              <Button variant="ghost" onClick={() => setDenied(false)}>
                {t('interactie.mic.retry')}
              </Button>
            </>
          ) : null}
        </>
      ) : null}

      {stream && !blob ? (
        <>
          <div className="interactie-video-wrap">
            <video ref={videoRef} playsInline muted />
          </div>
          <div className="interactie-actions">
            <Button variant="primary" onClick={capture}>
              {t('interactie.photo.capture')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                stopStream();
                setShowCameraRequest(false);
              }}
            >
              {t('interactie.photo.cancel')}
            </Button>
          </div>
        </>
      ) : null}

      {blob && photoPreview ? (
        <>
          <div className="interactie-video-wrap">
            <img src={photoPreview} alt={t('interactie.photo.previewAlt')} width={400} height={300} />
          </div>
          <div className="interactie-actions">
            <Button variant="primary" onClick={shareOrCopy}>
              {t('interactie.photo.share')}
            </Button>
            <Button variant="ghost" onClick={copyLinkOnly}>
              {t('interactie.photo.copyLink')}
            </Button>
            <Button variant="ghost" onClick={retake}>
              {t('interactie.photo.retake')}
            </Button>
          </div>
          {shareHint ? <p className="interactie-toast">{shareHint}</p> : null}
        </>
      ) : null}
    </section>
  );
}
