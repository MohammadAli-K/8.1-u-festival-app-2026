import { Button } from '../../components/Button.jsx';

/**
 * @param {{
 *   stageName: string;
 *   stageType: string;
 *   current: {
 *     displayTitle: string;
 *     start: Date;
 *     end: Date;
 *     description: string | null;
 *     imageSrc?: string;
 *     youtubeUrl?: string;
 *   } | null;
 *   next: { displayTitle: string; timeRange: string } | null;
 *   timeRange: string | null;
 *   liveLabel: string;
 *   nothingLabel: string;
 *   nextPrefix: string;
 *   youtubeLabel: string;
 *   closeLabel: string;
 *   left: number;
 *   top: number;
 *   onClose: () => void;
 * }} props
 */
export function MapStagePopup({
  stageName,
  stageType,
  current,
  next,
  timeRange,
  liveLabel,
  nothingLabel,
  nextPrefix,
  youtubeLabel,
  closeLabel,
  left,
  top,
  onClose,
}) {
  return (
    <div
      className="page-map__popup"
      style={{ left, top }}
      role="dialog"
      aria-modal="false"
      aria-label={stageName}
    >
      <button
        type="button"
        className="page-map__popup-close tap-scale"
        aria-label={closeLabel}
        onClick={onClose}
      >
        <span className="material-symbols-outlined" aria-hidden>
          close
        </span>
      </button>

      <p className="page-map__popup-stage">{stageName}</p>
      <p className="page-map__popup-type">{stageType}</p>

      {current ? (
        <>
          {current.imageSrc ? (
            <img className="page-map__popup-img" src={current.imageSrc} alt="" />
          ) : null}
          <p className="page-map__popup-live">{liveLabel}</p>
          <p className="page-map__popup-title">{current.displayTitle}</p>
          {timeRange ? <p className="page-map__popup-time">{timeRange}</p> : null}
          {current.description ? (
            <p className="page-map__popup-desc">{current.description}</p>
          ) : null}
          {current.youtubeUrl ? (
            <Button
              type="button"
              variant="primary"
              className="page-map__popup-youtube tap-scale"
              onClick={() =>
                window.open(current.youtubeUrl, '_blank', 'noopener,noreferrer')
              }
            >
              {youtubeLabel}
            </Button>
          ) : null}
        </>
      ) : (
        <p className="page-map__popup-muted">{nothingLabel}</p>
      )}

      {next ? (
        <p className="page-map__popup-next">
          <span className="page-map__popup-next-label">{nextPrefix}</span>{' '}
          {next.displayTitle}
          <span className="page-map__popup-next-time"> · {next.timeRange}</span>
        </p>
      ) : null}
    </div>
  );
}
