import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { useLanguage } from '../../context/LangContext.jsx';
import { useSchedule } from '../../hooks/index.js';
import { getEffectiveNow } from '../../data/schedule.js';
import {
  geoToSvg,
  LEGEND_MARKER_TYPES,
  loadFloorplanSvgParts,
  MAP_VIEWBOX,
  STAGE_LOCATIONS,
} from '../../data/map.js';
import potonStage from '../../assets/stages/poton.svg';
import theLakeStage from '../../assets/stages/the-lake.svg';
import theClubStage from '../../assets/stages/the-club.svg';
import hanggarStage from '../../assets/stages/hanggar.svg';
import './Map.css';

/** @type {Record<string, string>} */
const STAGE_IMAGES = {
  poton: potonStage,
  'the-lake': theLakeStage,
  'the-club': theClubStage,
  hanggar: hanggarStage,
};

const MIN_SCALE = 0.55;
const MAX_SCALE = 4;

/**
 * @param {SVGSVGElement} svg
 * @param {number} clientX
 * @param {number} clientY
 */
function clientToSvgPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  return pt.matrixTransform(ctm.inverse());
}

/**
 * @param {Date} start
 * @param {Date} end
 * @param {'nl' | 'en'} language
 */
function formatTimeRange(start, end, language) {
  const locale = language === 'nl' ? 'nl-NL' : 'en-GB';
  const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/**
 * Visitor GPS is converted to SVG user coordinates using {@link geoToSvg} in `src/data/map.js`
 * (linear map with clamping — see JSDoc on `GEO_REFERENCE` and `geoToSvg`).
 *
 * The dot is rendered at `(svgX, svgY)` inside the same pan-zoom group as the floorplan.
 */
export default function MapPage() {
  const { t, language } = useLanguage();
  const { loading, error, getCurrentAndNextForStage } = useSchedule();
  const [now, setNow] = useState(() => getEffectiveNow());
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const [legendOpen, setLegendOpen] = useState(false);
  /** @type {'poton' | 'the-lake' | 'the-club' | 'hanggar' | null} */
  const [sheetStageId, setSheetStageId] = useState(null);
  /** @type {string | null} */
  const [geoErrorKey, setGeoErrorKey] = useState(null);
  const [geoPos, setGeoPos] = useState(/** @type {{ lat: number; lon: number } | null} */ (null));
  const [floorplanHtml, setFloorplanHtml] = useState(/** @type {{ __html: string } | null} */ (null));

  const svgRef = useRef(/** @type {SVGSVGElement | null} */ (null));
  const viewportRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const panZoomRef = useRef({ tx: 0, ty: 0, scale: 1 });
  panZoomRef.current = { tx, ty, scale };

  const panRef = useRef({
    pointerId: /** @type {number | null} */ (null),
    startTx: 0,
    startTy: 0,
    startPx: 0,
    startPy: 0,
  });

  const pinchRef = useRef({
    active: false,
    startDist: 1,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    /** @type {{ x: number; y: number } | null} */
    mid0: null,
  });

  const viewBoxStr = useMemo(
    () =>
      `${MAP_VIEWBOX.minX} ${MAP_VIEWBOX.minY} ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    loadFloorplanSvgParts().then(({ inner }) => {
      if (!cancelled) setFloorplanHtml({ __html: inner });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(getEffectiveNow()), 45_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoErrorKey('map.gps.unavailable');
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoErrorKey(null);
        setGeoPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setGeoPos(null);
        if (err.code === err.PERMISSION_DENIED) setGeoErrorKey('map.gps.denied');
        else if (err.code === err.POSITION_UNAVAILABLE) setGeoErrorKey('map.gps.unavailable');
        else if (err.code === err.TIMEOUT) setGeoErrorKey('map.gps.timeout');
        else setGeoErrorKey('map.gps.unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (/** @type {WheelEvent} */ e) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const { tx: curTx, ty: curTy, scale: curS } = panZoomRef.current;
      const P = clientToSvgPoint(svg, e.clientX, e.clientY);
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, curS * factor));
      const Wx = (P.x - curTx) / curS;
      const Wy = (P.y - curTy) / curS;
      setTx(P.x - Wx * nextScale);
      setTy(P.y - Wy * nextScale);
      setScale(nextScale);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = useCallback((factor) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { tx: curTx, ty: curTy, scale: curS } = panZoomRef.current;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const P = clientToSvgPoint(svg, cx, cy);
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, curS * factor));
    const Wx = (P.x - curTx) / curS;
    const Wy = (P.y - curTy) / curS;
    setTx(P.x - Wx * nextScale);
    setTy(P.y - Wy * nextScale);
    setScale(nextScale);
  }, []);

  const onPointerDown = (/** @type {React.PointerEvent<SVGSVGElement>} */ e) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panRef.current = {
      pointerId: e.pointerId,
      startTx: tx,
      startTy: ty,
      startPx: clientToSvgPoint(e.currentTarget, e.clientX, e.clientY).x,
      startPy: clientToSvgPoint(e.currentTarget, e.clientX, e.clientY).y,
    };
  };

  const onPointerMove = (/** @type {React.PointerEvent<SVGSVGElement>} */ e) => {
    if (e.pointerType === 'touch') return;
    const p = panRef.current;
    if (p.pointerId !== e.pointerId) return;
    const svg = e.currentTarget;
    const P = clientToSvgPoint(svg, e.clientX, e.clientY);
    setTx(p.startTx + (P.x - p.startPx));
    setTy(p.startTy + (P.y - p.startPy));
  };

  const onPointerUp = (/** @type {React.PointerEvent<SVGSVGElement>} */ e) => {
    if (e.pointerType === 'touch') return;
    if (panRef.current.pointerId === e.pointerId) {
      panRef.current.pointerId = null;
    }
  };

  const onTouchStart = (/** @type {React.TouchEvent<SVGSVGElement>} */ e) => {
    const svg = e.currentTarget;
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const mx = (a.clientX + b.clientX) / 2;
      const my = (a.clientY + b.clientY) / 2;
      const mid0 = clientToSvgPoint(svg, mx, my);
      pinchRef.current = {
        active: true,
        startDist: Math.max(24, dist),
        startScale: scale,
        startTx: tx,
        startTy: ty,
        mid0,
      };
      panRef.current.pointerId = null;
      return;
    }
    if (e.touches.length === 1) {
      pinchRef.current.active = false;
      const T = e.touches[0];
      const P = clientToSvgPoint(svg, T.clientX, T.clientY);
      panRef.current = {
        pointerId: -1,
        startTx: tx,
        startTy: ty,
        startPx: P.x,
        startPy: P.y,
      };
    }
  };

  const onTouchMove = (/** @type {React.TouchEvent<SVGSVGElement>} */ e) => {
    e.preventDefault();
    const svg = e.currentTarget;
    if (pinchRef.current.active && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const mx = (a.clientX + b.clientX) / 2;
      const my = (a.clientY + b.clientY) / 2;
      const P = clientToSvgPoint(svg, mx, my);
      const pr = pinchRef.current;
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, pr.startScale * (Math.max(24, dist) / pr.startDist)),
      );
      if (!pr.mid0) return;
      const Wx = (pr.mid0.x - pr.startTx) / pr.startScale;
      const Wy = (pr.mid0.y - pr.startTy) / pr.startScale;
      setTx(P.x - Wx * nextScale);
      setTy(P.y - Wy * nextScale);
      setScale(nextScale);
      return;
    }
    if (!pinchRef.current.active && e.touches.length === 1 && panRef.current.pointerId === -1) {
      const T = e.touches[0];
      const P = clientToSvgPoint(svg, T.clientX, T.clientY);
      const p = panRef.current;
      setTx(p.startTx + (P.x - p.startPx));
      setTy(p.startTy + (P.y - p.startPy));
    }
  };

  const onTouchEnd = (/** @type {React.TouchEvent<SVGSVGElement>} */ e) => {
    if (e.touches.length < 2) pinchRef.current.active = false;
    if (e.touches.length === 0) panRef.current.pointerId = null;
    if (e.touches.length === 1) {
      const svg = e.currentTarget;
      const T = e.touches[0];
      const P = clientToSvgPoint(svg, T.clientX, T.clientY);
      panRef.current = {
        pointerId: -1,
        startTx: tx,
        startTy: ty,
        startPx: P.x,
        startPy: P.y,
      };
    }
  };

  const panZoomTransform = `translate(${tx} ${ty}) scale(${scale})`;

  const sheetStage = sheetStageId
    ? STAGE_LOCATIONS.find((s) => s.id === sheetStageId)
    : null;

  const sheetSchedule = sheetStageId
    ? getCurrentAndNextForStage(sheetStageId, now)
    : { current: null, next: null, dayKey: null };

  const gpsSvg = geoPos ? geoToSvg(geoPos.lat, geoPos.lon) : null;

  if (loading) {
    return (
      <div className="page-map">
        <h1 className="page-map__title">{t('map.title')}</h1>
        <Spinner label={t('spinner.loading')} />
      </div>
    );
  }

  if (!floorplanHtml) {
    return (
      <div className="page-map">
        <h1 className="page-map__title">{t('map.title')}</h1>
        <Spinner label={t('map.loadingMap')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-map">
        <h1 className="page-map__title">{t('map.title')}</h1>
        <p className="prose-muted">{String(error.message)}</p>
      </div>
    );
  }

  return (
    <div className="page-map">
      <h1 className="page-map__title">{t('map.title')}</h1>

      <div ref={viewportRef} className="page-map__viewport">
        {geoErrorKey ? <div className="page-map__gps-banner">{t(geoErrorKey)}</div> : null}

        <div className="page-map__controls">
          <button
            type="button"
            className="page-map__zoom-btn tap-scale"
            aria-label={t('map.zoom.in')}
            onClick={() => zoomBy(1.2)}
          >
            +
          </button>
          <button
            type="button"
            className="page-map__zoom-btn tap-scale"
            onClick={() => zoomBy(1 / 1.2)}
            aria-label={t('map.zoom.out')}
          >
            −
          </button>
        </div>

        <svg
          ref={svgRef}
          className="page-map__svg"
          viewBox={viewBoxStr}
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label={t('map.aria.viewport')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <g transform={panZoomTransform}>
            {floorplanHtml ? (
              <g className="page-map__floorplan" dangerouslySetInnerHTML={floorplanHtml} />
            ) : null}

            {STAGE_LOCATIONS.map((loc) => (
              <g
                key={loc.id}
                role="button"
                tabIndex={0}
                className="page-map__marker tap-scale"
                transform={`translate(${loc.svgX} ${loc.svgY}) scale(${1 / scale})`}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => setSheetStageId(loc.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSheetStageId(loc.id);
                  }
                }}
                aria-label={`${t(loc.nameKey)} — ${t('map.marker.openDetails')}`}
              >
                <circle cx={0} cy={0} r={36} fill="#d62e39" stroke="#69008b" strokeWidth={5} />
                <text
                  x={0}
                  y={0}
                  className="page-map__marker-num"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {loc.number}
                </text>
              </g>
            ))}

            {gpsSvg ? (
              <g
                transform={`translate(${gpsSvg.svgX} ${gpsSvg.svgY}) scale(${1 / scale})`}
                aria-hidden
              >
                <circle className="page-map__gps-dot" cx={0} cy={0} r={14} />
              </g>
            ) : null}
          </g>
        </svg>
      </div>

      <div className={`page-map__legend${legendOpen ? ' page-map__legend--open' : ''}`}>
        <button
          type="button"
          className="page-map__legend-toggle tap-scale"
          aria-expanded={legendOpen}
          onClick={() => setLegendOpen((o) => !o)}
        >
          <span>{t('map.legend.title')}</span>
          <span className="material-symbols-outlined" aria-hidden>
            expand_more
          </span>
        </button>
        <div className="page-map__legend-body">
          {LEGEND_MARKER_TYPES.map((row) => (
            <div key={row.type} className="page-map__legend-row">
              <img src={row.iconUrl} alt="" width={32} height={32} />
              <span>{t(row.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {sheetStage ? (
        <BottomSheet
          open
          onClose={() => setSheetStageId(null)}
          title={t(sheetStage.nameKey)}
        >
          <img
            className="page-map__sheet-stage"
            src={STAGE_IMAGES[sheetStage.id]}
            alt=""
          />
          <p className="page-map__sheet-desc">
            {sheetStage.description[language]}
          </p>
          <p className="page-map__sheet-type">{t(sheetStage.typeKey)}</p>

          <h3 className="page-map__sheet-section">{t('map.sheet.nowOnStage')}</h3>
          {sheetSchedule.current ? (
            <p className="page-map__sheet-line">
              <strong>{sheetSchedule.current.displayTitle}</strong>
              <br />
              <span className="page-map__sheet-muted">
                {formatTimeRange(sheetSchedule.current.start, sheetSchedule.current.end, language)}
              </span>
            </p>
          ) : (
            <p className="page-map__sheet-line page-map__sheet-muted">
              {t('map.sheet.nothingScheduled')}
            </p>
          )}

          <h3 className="page-map__sheet-section">{t('map.sheet.nextAct')}</h3>
          {sheetSchedule.next ? (
            <p className="page-map__sheet-line">
              <strong>{sheetSchedule.next.displayTitle}</strong>
              <br />
              <span className="page-map__sheet-muted">
                {formatTimeRange(sheetSchedule.next.start, sheetSchedule.next.end, language)}
              </span>
            </p>
          ) : (
            <p className="page-map__sheet-line page-map__sheet-muted">
              {t('map.sheet.nothingScheduled')}
            </p>
          )}
        </BottomSheet>
      ) : null}
    </div>
  );
}
