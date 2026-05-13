import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { useLanguage } from '../../context/LangContext.jsx';

const SAMPLE_MS = 3000;
const ANALYSIS_INTERVAL = 100;

/**
 * @param {number} rmsAvg
 */
function scoreFromRms(rmsAvg) {
  if (rmsAvg < 0.0015) return 1;
  if (rmsAvg < 0.006) return 2;
  if (rmsAvg < 0.018) return 3;
  if (rmsAvg < 0.04) return 4;
  return 5;
}

/**
 * @param {number} target
 * @param {(n: number) => void} onUpdate
 * @param {number} durationMs
 */
function animateCountTo(target, onUpdate, durationMs = 700) {
  const from = 1;
  const to = Math.min(5, Math.max(1, Math.round(target)));
  if (to <= from) {
    onUpdate(to);
    return () => {};
  }
  const start = performance.now();
  let frame = 0;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / durationMs);
    const v = Math.round(from + (to - from) * p);
    onUpdate(v);
    if (p < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export function Sfeercheck() {
  const { t } = useLanguage();
  const [step, setStep] = useState(/** @type {'idle' | 'explained' | 'measuring' | 'done'} */ ('idle'));
  const [denied, setDenied] = useState(false);
  const [remainingSec, setRemainingSec] = useState(3);
  const [meter, setMeter] = useState(0);
  const [finalScore, setFinalScore] = useState(/** @type {number | null} */ (null));
  const [displayScore, setDisplayScore] = useState(1);
  const streamRef = useRef(/** @type {MediaStream | null} */ (null));
  const ctxRef = useRef(/** @type {AudioContext | null} */ (null));
  const rmsSumRef = useRef(0);
  const rmsCountRef = useRef(0);
  const cancelAnimRef = useRef(/** @type {null | (() => void)} */ (null));
  const measureCleanupRef = useRef(/** @type {null | (() => void)} */ (null));

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      measureCleanupRef.current?.();
      measureCleanupRef.current = null;
      stopAll();
    };
  }, [stopAll]);

  useEffect(() => {
    if (finalScore === null) return;
    setDisplayScore(1);
    cancelAnimRef.current?.();
    cancelAnimRef.current = animateCountTo(finalScore, setDisplayScore, 650);
    return () => {
      cancelAnimRef.current?.();
    };
  }, [finalScore]);

  const startMic = async () => {
    setDenied(false);
    measureCleanupRef.current?.();
    measureCleanupRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      rmsSumRef.current = 0;
      rmsCountRef.current = 0;

      setStep('measuring');
      const start = Date.now();
      const iv = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i += 1) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        rmsSumRef.current += rms;
        rmsCountRef.current += 1;
        const rel = Math.min(1, rms * 18);
        setMeter(rel);
        const left = Math.max(0, SAMPLE_MS - (Date.now() - start));
        setRemainingSec(Math.ceil(left / 1000));
      }, ANALYSIS_INTERVAL);

      const to = window.setTimeout(() => {
        measureCleanupRef.current = null;
        clearInterval(iv);
        setMeter(0);
        const avg = rmsCountRef.current > 0 ? rmsSumRef.current / rmsCountRef.current : 0;
        const score = scoreFromRms(avg);
        setFinalScore(score);
        setStep('done');
        stopAll();
      }, SAMPLE_MS);

      measureCleanupRef.current = () => {
        clearInterval(iv);
        clearTimeout(to);
      };
    } catch {
      setDenied(true);
      stopAll();
    }
  };

  const reset = () => {
    cancelAnimRef.current?.();
    setStep('idle');
    setFinalScore(null);
    setDisplayScore(1);
    setDenied(false);
    setRemainingSec(3);
    setMeter(0);
  };

  const vibeKey = finalScore != null ? `interactie.sfeer.score${finalScore}` : '';

  return (
    <section className="interactie-card" aria-labelledby="interactie-sfeer-heading">
      <h2 id="interactie-sfeer-heading" className="interactie-card__title">
        {t('interactie.section.sfeer')}
      </h2>
      <p className="interactie-hint">{t('interactie.sfeer.intro')}</p>

      {step === 'idle' ? (
        <Button variant="primary" onClick={() => setStep('explained')}>
          {t('interactie.sfeer.begin')}
        </Button>
      ) : null}

      {step === 'explained' ? (
        <>
          <div className="interactie-perm-block" role="note">
            <p className="interactie-perm-lang">NL</p>
            <p>{t('interactie.mic.permissionNl')}</p>
            <p className="interactie-perm-lang" style={{ marginTop: '0.65rem' }}>
              EN
            </p>
            <p>{t('interactie.mic.permissionEn')}</p>
          </div>
          <div className="interactie-actions">
            <Button variant="primary" onClick={startMic}>
              {t('interactie.mic.request')}
            </Button>
            <Button variant="ghost" onClick={() => setStep('idle')}>
              {t('interactie.photo.back')}
            </Button>
          </div>
          {denied ? (
            <>
              <p className="interactie-hint">{t('interactie.mic.denied')}</p>
              <Button variant="ghost" onClick={() => setDenied(false)}>
                {t('interactie.mic.retry')}
              </Button>
            </>
          ) : null}
        </>
      ) : null}

      {step === 'measuring' ? (
        <>
          <p className="interactie-hint" aria-live="polite">
            {t('interactie.sfeer.measuring').replace('{n}', String(remainingSec))}
          </p>
          <div className="interactie-meter" aria-hidden>
            <div className="interactie-meter__fill" style={{ width: `${meter * 100}%` }} />
          </div>
        </>
      ) : null}

      {step === 'done' && finalScore != null ? (
        <>
          <p className="interactie-hint">{t('interactie.sfeer.resultLabel')}</p>
          <div className="interactie-score-big" aria-live="polite">
            {displayScore}
          </div>
          {displayScore === finalScore ? (
            <p className="interactie-vibe-label">{t(vibeKey)}</p>
          ) : (
            <p className="interactie-vibe-label" aria-hidden>
              {'\u00a0'}
            </p>
          )}
          <Button variant="ghost" onClick={reset}>
            {t('interactie.sfeer.again')}
          </Button>
        </>
      ) : null}
    </section>
  );
}
