import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MapStagePopup } from './MapStagePopup.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { useLanguage } from '../../context/LangContext.jsx';
import { useSchedule } from '../../hooks/index.js';
import { getEffectiveNow } from '../../data/schedule.js';
import {
  DETAIL_ZOOM_FACTOR,
  geoToSvg,
  LEGEND_MARKER_TYPES,
  loadFloorplanSvgParts,
  MAP_VIEWBOX,
  POI_MARKER_SIZE,
  POI_MARKER_TYPES,
  STAGE_LOCATIONS,
} from '../../data/map.js';
import { POI_LOCATIONS } from '../../data/mapPoiLocations.js';
import potonStage from '../../assets/stages/poton.svg';
import theLakeStage from '../../assets/stages/the-lake.svg';
import theClubStage from '../../assets/stages/the-club.svg';
import hanggarStage from '../../assets/stages/hanggar.svg';
import './Map.css';

const MAX_SCALE = 4;
const PINCH_MIN_DIST_PX = 24;
const POPUP_OFFSET_Y = 52;
const POPUP_WIDTH_ESTIMATE = 280;
const TAP_MOVE_THRESHOLD_PX = 12;

/** Single-finger map pan is skipped when the touch starts on these (pinch still works). */
function isMapChromeTouchTarget(/** @type {EventTarget | null} */ target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      '.page-map__marker, .page-map__controls, .page-map__legend-toggle, .page-map__legend-body, .page-map__popup',
    ),
  );
}

/**
 * Visible viewBox region with preserveAspectRatio xMidYMid slice (matches the SVG).
 * @param {number} vpW
 * @param {number} vpH
 */
function visibleViewBoxSlice(vpW, vpH) {
  const vb = MAP_VIEWBOX;
  if (vpW <= 0 || vpH <= 0) {
    return { minX: vb.minX, minY: vb.minY, width: vb.width, height: vb.height };
  }
  const uniform = Math.max(vpW / vb.width, vpH / vb.height);
  const visibleW = vpW / uniform;
  const visibleH = vpH / uniform;
  return {
    minX: vb.minX + (vb.width - visibleW) / 2,
    minY: vb.minY + (vb.height - visibleH) / 2,
    width: visibleW,
    height: visibleH,
  };
}

/**
 * Clamp pan/zoom so the floorplan always covers the viewport and never zooms out past a full-screen fit.
 * @param {number} tx
 * @param {number} ty
 * @param {number} scale
 * @param {SVGSVGElement | null} svg
 */
function clampPanZoom(tx, ty, scale, svg) {
  const vb = MAP_VIEWBOX;
  const rect = svg
    ? visibleViewBoxSlice(
        svg.getBoundingClientRect().width,
        svg.getBoundingClientRect().height,
      )
    : { minX: vb.minX, minY: vb.minY, width: vb.width, height: vb.height };

  const minScale = Math.max(rect.width / vb.width, rect.height / vb.height);
  const s = Math.min(MAX_SCALE, Math.max(minScale, scale));

  const txMin = rect.minX + rect.width - (vb.minX + vb.width) * s;
  const txMax = rect.minX - vb.minX * s;
  const tyMin = rect.minY + rect.height - (vb.minY + vb.height) * s;
  const tyMax = rect.minY - vb.minY * s;

  return {
    tx: Math.min(txMax, Math.max(txMin, tx)),
    ty: Math.min(tyMax, Math.max(tyMin, ty)),
    scale: s,
    minScale,
  };
}

/**
 * Stage coordinates in the pan-zoom group → viewport pixels (relative to `.page-map__viewport`).
 * @param {SVGSVGElement} svg
 * @param {SVGGElement} panZoomGroup
 * @param {number} svgX
 * @param {number} svgY
 * @returns {{ x: number; y: number } | null}
 */
function stagePointToViewport(svg, panZoomGroup, svgX, svgY) {
  const pt = svg.createSVGPoint();
  pt.x = svgX;
  pt.y = svgY;
  const ctm = panZoomGroup.getScreenCTM();
  if (!ctm) return null;
  const screen = pt.matrixTransform(ctm);
  const svgRect = svg.getBoundingClientRect();
  return { x: screen.x - svgRect.left, y: screen.y - svgRect.top };
}

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
 * @param {TouchList} touches
 */
function touchPinchMetrics(touches) {
  const a = touches[0];
  const b = touches[1];
  return {
    dist: Math.max(
      PINCH_MIN_DIST_PX,
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
    ),
    midClientX: (a.clientX + b.clientX) / 2,
    midClientY: (a.clientY + b.clientY) / 2,
  };
}

/**
 * Zoom around a screen point; `factor` multiplies the current scale.
 * @param {SVGSVGElement} svg
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} factor
 * @param {{ tx: number; ty: number; scale: number }} current
 */
function zoomAtClientPoint(svg, clientX, clientY, factor, current) {
  const { tx: curTx, ty: curTy, scale: curS } = current;
  const P = clientToSvgPoint(svg, clientX, clientY);
  const { minScale } = clampPanZoom(curTx, curTy, curS, svg);
  const nextScale = Math.min(MAX_SCALE, Math.max(minScale, curS * factor));
  const Wx = (P.x - curTx) / curS;
  const Wy = (P.y - curTy) / curS;
  return {
    tx: P.x - Wx * nextScale,
    ty: P.y - Wy * nextScale,
    scale: nextScale,
  };
}

/**
 * Pinch-zoom: keep a fixed SVG anchor under the moving focal point.
 * @param {number} anchorX fixed anchor in SVG space (pinch start midpoint)
 * @param {number} anchorY
 * @param {number} focalX current focal in SVG space (pinch move midpoint)
 * @param {number} focalY
 */
function panZoomFromPinchAnchor(
  startTx,
  startTy,
  startScale,
  anchorX,
  anchorY,
  focalX,
  focalY,
  nextScale,
) {
  const Wx = (anchorX - startTx) / startScale;
  const Wy = (anchorY - startTy) / startScale;
  return {
    tx: focalX - Wx * nextScale,
    ty: focalY - Wy * nextScale,
    scale: nextScale,
  };
}

/**
 * @param {Date} start
 * @param {Date} end
 * @param {'nl' | 'en'} language
 */
function formatTimeRange(start, end, language) {
  const locale = language === 'nl' ? 'nl-NL' : 'en-GB';
  const fmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const [minScale, setMinScale] = useState(1);
  const [legendOpen, setLegendOpen] = useState(false);
  /** @type {'poton' | 'the-lake' | 'the-club' | 'hanggar' | null} */
  const [popupStageId, setPopupStageId] = useState(null);
  const [popupPos, setPopupPos] = useState(
    /** @type {{ left: number; top: number } | null} */ (null),
  );
  /** @type {string | null} */
  const [geoErrorKey, setGeoErrorKey] = useState(null);
  const [geoPos, setGeoPos] = useState(
    /** @type {{ lat: number; lon: number } | null} */ (null),
  );
  const [floorplanHtml, setFloorplanHtml] = useState(
    /** @type {{ __html: string } | null} */ (null),
  );

  const svgRef = useRef(/** @type {SVGSVGElement | null} */ (null));
  const panZoomGroupRef = useRef(/** @type {SVGGElement | null} */ (null));
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

  const markerTapRef = useRef({
    active: false,
    x: 0,
    y: 0,
  });

  const applyPanZoom = useCallback((nextTx, nextTy, nextScale) => {
    const clamped = clampPanZoom(nextTx, nextTy, nextScale, svgRef.current);
    setTx(clamped.tx);
    setTy(clamped.ty);
    setScale(clamped.scale);
    setMinScale(clamped.minScale);
  }, []);

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
        if (err.code === err.PERMISSION_DENIED)
          setGeoErrorKey('map.gps.denied');
        else if (err.code === err.POSITION_UNAVAILABLE)
          setGeoErrorKey('map.gps.unavailable');
        else if (err.code === err.TIMEOUT) setGeoErrorKey('map.gps.timeout');
        else setGeoErrorKey('map.gps.unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleTouchStart = useCallback((/** @type {TouchEvent} */ e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { tx: curTx, ty: curTy, scale: curS } = panZoomRef.current;

    if (e.touches.length === 2) {
      const { dist, midClientX, midClientY } = touchPinchMetrics(e.touches);
      const mid0 = clientToSvgPoint(svg, midClientX, midClientY);
      pinchRef.current = {
        active: true,
        startDist: dist,
        startScale: curS,
        startTx: curTx,
        startTy: curTy,
        mid0,
      };
      panRef.current.pointerId = null;
      return;
    }

    if (e.touches.length === 1) {
      pinchRef.current.active = false;
      if (isMapChromeTouchTarget(e.target)) return;
      setPopupStageId(null);
      const T = e.touches[0];
      const P = clientToSvgPoint(svg, T.clientX, T.clientY);
      panRef.current = {
        pointerId: -1,
        startTx: curTx,
        startTy: curTy,
        startPx: P.x,
        startPy: P.y,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (/** @type {TouchEvent} */ e) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      if (pinchRef.current.active && e.touches.length === 2) {
        const { dist, midClientX, midClientY } = touchPinchMetrics(e.touches);
        const focal = clientToSvgPoint(svg, midClientX, midClientY);
        const pr = pinchRef.current;
        if (!pr.mid0) return;
        const { minScale } = clampPanZoom(
          pr.startTx,
          pr.startTy,
          pr.startScale,
          svg,
        );
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(minScale, pr.startScale * (dist / pr.startDist)),
        );
        const next = panZoomFromPinchAnchor(
          pr.startTx,
          pr.startTy,
          pr.startScale,
          pr.mid0.x,
          pr.mid0.y,
          focal.x,
          focal.y,
          nextScale,
        );
        applyPanZoom(next.tx, next.ty, next.scale);
        return;
      }

      if (
        !pinchRef.current.active &&
        e.touches.length === 1 &&
        panRef.current.pointerId === -1
      ) {
        const T = e.touches[0];
        const P = clientToSvgPoint(svg, T.clientX, T.clientY);
        const p = panRef.current;
        applyPanZoom(
          p.startTx + (P.x - p.startPx),
          p.startTy + (P.y - p.startPy),
          panZoomRef.current.scale,
        );
      }
    },
    [applyPanZoom],
  );

  const handleTouchEnd = useCallback((/** @type {TouchEvent} */ e) => {
    const svg = svgRef.current;
    if (!svg) return;

    if (e.touches.length < 2) pinchRef.current.active = false;
    if (e.touches.length === 0) panRef.current.pointerId = null;

    if (e.touches.length === 1) {
      const { tx: curTx, ty: curTy } = panZoomRef.current;
      const T = e.touches[0];
      const P = clientToSvgPoint(svg, T.clientX, T.clientY);
      panRef.current = {
        pointerId: -1,
        startTx: curTx,
        startTy: curTy,
        startPx: P.x,
        startPy: P.y,
      };
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    const onWheel = (/** @type {WheelEvent} */ e) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const next = zoomAtClientPoint(
        svg,
        e.clientX,
        e.clientY,
        factor,
        panZoomRef.current,
      );
      applyPanZoom(next.tx, next.ty, next.scale);
    };

    const touchOpts = { capture: true };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, {
      ...touchOpts,
      passive: true,
    });
    el.addEventListener('touchmove', handleTouchMove, {
      ...touchOpts,
      passive: false,
    });
    el.addEventListener('touchend', handleTouchEnd, {
      ...touchOpts,
      passive: true,
    });
    el.addEventListener('touchcancel', handleTouchEnd, {
      ...touchOpts,
      passive: true,
    });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', handleTouchStart, touchOpts);
      el.removeEventListener('touchmove', handleTouchMove, touchOpts);
      el.removeEventListener('touchend', handleTouchEnd, touchOpts);
      el.removeEventListener('touchcancel', handleTouchEnd, touchOpts);
    };
  }, [applyPanZoom, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !floorplanHtml) return undefined;
    const ro = new ResizeObserver(() => {
      const { tx: curTx, ty: curTy, scale: curS } = panZoomRef.current;
      applyPanZoom(curTx, curTy, curS);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, [floorplanHtml, applyPanZoom]);

  const zoomBy = useCallback(
    (factor) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const next = zoomAtClientPoint(
        svg,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        factor,
        panZoomRef.current,
      );
      applyPanZoom(next.tx, next.ty, next.scale);
    },
    [applyPanZoom],
  );

  const onPointerDown = (
    /** @type {React.PointerEvent<SVGSVGElement>} */ e,
  ) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    setPopupStageId(null);
    e.currentTarget.setPointerCapture(e.pointerId);
    const { tx: curTx, ty: curTy } = panZoomRef.current;
    const P = clientToSvgPoint(e.currentTarget, e.clientX, e.clientY);
    panRef.current = {
      pointerId: e.pointerId,
      startTx: curTx,
      startTy: curTy,
      startPx: P.x,
      startPy: P.y,
    };
  };

  const onPointerMove = (
    /** @type {React.PointerEvent<SVGSVGElement>} */ e,
  ) => {
    if (e.pointerType === 'touch') return;
    const p = panRef.current;
    if (p.pointerId !== e.pointerId) return;
    const svg = e.currentTarget;
    const P = clientToSvgPoint(svg, e.clientX, e.clientY);
    applyPanZoom(
      p.startTx + (P.x - p.startPx),
      p.startTy + (P.y - p.startPy),
      panZoomRef.current.scale,
    );
  };

  const onPointerUp = (/** @type {React.PointerEvent<SVGSVGElement>} */ e) => {
    if (e.pointerType === 'touch') return;
    if (panRef.current.pointerId === e.pointerId) {
      panRef.current.pointerId = null;
    }
  };

  const panZoomTransform = `translate(${tx} ${ty}) scale(${scale})`;
  const showDetailPois = scale > minScale * DETAIL_ZOOM_FACTOR;

  const popupStage = popupStageId
    ? STAGE_LOCATIONS.find((s) => s.id === popupStageId)
    : null;

  const popupSchedule = popupStageId
    ? getCurrentAndNextForStage(popupStageId, now)
    : { current: null, next: null, dayKey: null };

  const liveByStageId = useMemo(() => {
    /** @type {Record<string, boolean>} */
    const map = {};
    for (const loc of STAGE_LOCATIONS) {
      const { current } = getCurrentAndNextForStage(loc.id, now);
      map[loc.id] = Boolean(current);
    }
    return map;
  }, [getCurrentAndNextForStage, now]);

  const updatePopupPosition = useCallback(
    (/** @type {typeof popupStageId} */ stageId) => {
      if (!stageId) {
        setPopupPos(null);
        return;
      }
      const loc = STAGE_LOCATIONS.find((s) => s.id === stageId);
      const svg = svgRef.current;
      const panZoomGroup = panZoomGroupRef.current;
      const viewport = viewportRef.current;
      if (!loc || !svg || !viewport) return;

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const margin = 8;
      const pt =
        panZoomGroup != null
          ? stagePointToViewport(svg, panZoomGroup, loc.svgX, loc.svgY)
          : null;

      let left = pt
        ? pt.x - POPUP_WIDTH_ESTIMATE / 2
        : (vw - POPUP_WIDTH_ESTIMATE) / 2;
      let top = pt ? pt.y - POPUP_OFFSET_Y : vh * 0.2;
      left = Math.min(
        Math.max(margin, left),
        vw - POPUP_WIDTH_ESTIMATE - margin,
      );
      top = Math.min(Math.max(margin, top), vh - 280);
      setPopupPos({ left, top });
    },
    [],
  );

  const openStagePopup = (/** @type {typeof popupStageId} */ stageId) => {
    if (popupStageId === stageId) {
      setPopupStageId(null);
      setPopupPos(null);
      return;
    }
    setPopupStageId(stageId);
    updatePopupPosition(stageId);
  };

  const onMarkerPointerDown = (/** @type {React.PointerEvent} */ e) => {
    e.stopPropagation();
    markerTapRef.current = { active: true, x: e.clientX, y: e.clientY };
  };

  const onMarkerPointerUp = (
    /** @type {React.PointerEvent} */ e,
    /** @type {typeof popupStageId} */ stageId,
  ) => {
    e.stopPropagation();
    const tap = markerTapRef.current;
    if (!tap.active) return;
    markerTapRef.current.active = false;
    const dx = e.clientX - tap.x;
    const dy = e.clientY - tap.y;
    if (Math.hypot(dx, dy) <= TAP_MOVE_THRESHOLD_PX) {
      openStagePopup(stageId);
    }
  };

  const onMarkerPointerCancel = (/** @type {React.PointerEvent} */ e) => {
    e.stopPropagation();
    markerTapRef.current.active = false;
  };

  /** @param {import('../../hooks/useSchedule.js').ScheduleBlock | null} block */
  const blockDescription = (block) => {
    if (!block?.description) return null;
    return block.description[language] ?? block.description.en ?? null;
  };

  useLayoutEffect(() => {
    if (popupStageId) updatePopupPosition(popupStageId);
  }, [popupStageId, tx, ty, scale, updatePopupPosition]);

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
      <div ref={viewportRef} className="page-map__viewport">
        {geoErrorKey ? (
          <div className="page-map__gps-banner">{t(geoErrorKey)}</div>
        ) : null}

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
          preserveAspectRatio="xMidYMid slice"
          role="application"
          aria-label={t('map.aria.viewport')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <g ref={panZoomGroupRef} transform={panZoomTransform}>
            {floorplanHtml ? (
              <g
                className="page-map__floorplan"
                dangerouslySetInnerHTML={floorplanHtml}
              />
            ) : null}

            {POI_LOCATIONS.map((poi) => {
              const meta = POI_MARKER_TYPES[poi.type];
              if (!meta) return null;
              const visible = !meta.requireZoom || showDetailPois;
              const poiSize = poi.size ?? POI_MARKER_SIZE;
              const poiHalf = poiSize / 2;
              return (
                <g
                  key={poi.id}
                  transform={`translate(${poi.svgX} ${poi.svgY}) scale(${1 / scale})`}
                  className={`page-map__poi${visible ? ' page-map__poi--visible' : ''}`}
                  aria-hidden={!visible}
                >
                  <image
                    href={meta.iconUrl}
                    x={-poiHalf}
                    y={-poiHalf}
                    width={poiSize}
                    height={poiSize}
                  />
                </g>
              );
            })}

            {STAGE_LOCATIONS.map((loc) => {
              const isLive = liveByStageId[loc.id];
              return (
                <g
                  key={loc.id}
                  role="button"
                  tabIndex={0}
                  className={`page-map__marker${isLive ? ' page-map__marker--live' : ''}`}
                  transform={`translate(${loc.svgX} ${loc.svgY}) scale(${1 / scale})`}
                  onPointerDown={onMarkerPointerDown}
                  onPointerUp={(e) => onMarkerPointerUp(e, loc.id)}
                  onPointerCancel={onMarkerPointerCancel}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openStagePopup(loc.id);
                    }
                  }}
                  aria-label={`${t(loc.nameKey)}${isLive ? ` — ${t('schedule.liveNow')}` : ''} — ${t('map.marker.openDetails')}`}
                >
                  <circle cx={0} cy={0} r={50} fill="transparent" aria-hidden />
                  {isLive ? (
                    <circle
                      className="page-map__marker-live-ring"
                      cx={0}
                      cy={0}
                      r={44}
                    />
                  ) : null}
                  <circle
                    className="page-map__marker-dot"
                    cx={0}
                    cy={0}
                    r={36}
                    fill="#d62e39"
                    stroke="#69008b"
                    strokeWidth={5}
                  />
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
              );
            })}

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

        <div
          className={`page-map__legend${legendOpen ? ' page-map__legend--open' : ''}`}
        >
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

        {popupStage && popupPos ? (
          <MapStagePopup
            stageName={t(popupStage.nameKey)}
            stageType={t(popupStage.typeKey)}
            current={
              popupSchedule.current
                ? {
                    displayTitle: popupSchedule.current.displayTitle,
                    start: popupSchedule.current.start,
                    end: popupSchedule.current.end,
                    description: blockDescription(popupSchedule.current),
                    imageSrc: popupSchedule.current.imageSrc,
                    youtubeUrl: popupSchedule.current.youtubeUrl,
                  }
                : null
            }
            next={
              popupSchedule.next
                ? {
                    displayTitle: popupSchedule.next.displayTitle,
                    timeRange: formatTimeRange(
                      popupSchedule.next.start,
                      popupSchedule.next.end,
                      language,
                    ),
                  }
                : null
            }
            timeRange={
              popupSchedule.current
                ? formatTimeRange(
                    popupSchedule.current.start,
                    popupSchedule.current.end,
                    language,
                  )
                : null
            }
            liveLabel={t('schedule.liveNow')}
            nothingLabel={t('map.sheet.nothingScheduled')}
            nextPrefix={t('map.popup.nextPrefix')}
            youtubeLabel={t('schedule.youtube')}
            closeLabel={t('map.popup.close')}
            left={popupPos.left}
            top={popupPos.top}
            onClose={() => {
              setPopupStageId(null);
              setPopupPos(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
