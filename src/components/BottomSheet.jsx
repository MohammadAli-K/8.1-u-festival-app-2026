import { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LangContext.jsx';
import './BottomSheet.css';

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   title?: string;
 *   children: import('react').ReactNode;
 * }} props
 */
export function BottomSheet({ open, onClose, title, children }) {
  const { t } = useLanguage();
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const dragStart = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const endDrag = useCallback(() => {
    if (!dragging.current || !panelRef.current) return;
    dragging.current = false;
    const el = panelRef.current;
    const match = el.style.transform.match(/translateY\((\d+)px\)/);
    const dy = match ? Number(match[1]) : 0;
    el.style.transform = '';
    if (dy > 72) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onMove = (/** @type {PointerEvent} */ e) => {
      if (!dragging.current || !panelRef.current) return;
      const dy = Math.max(0, e.clientY - dragStart.current);
      panelRef.current.style.transform = `translateY(${dy}px)`;
    };
    const onUp = () => {
      endDrag();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      dragging.current = false;
      if (panelRef.current) {
        panelRef.current.style.transform = '';
      }
    };
  }, [open, endDrag]);

  const onHandlePointerDown = (/** @type {React.PointerEvent} */ e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    dragStart.current = e.clientY;
  };

  if (!open) return null;

  const node = (
    <div className="bottom-sheet">
      <button
        type="button"
        className="bottom-sheet__backdrop tap-scale"
        aria-label={t('bottomSheet.close')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="bottom-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div
          className="bottom-sheet__handle"
          onPointerDown={onHandlePointerDown}
          role="presentation"
        >
          <span className="bottom-sheet__handle-bar" />
        </div>
        {title ? (
          <h2 id={titleId} className="bottom-sheet__title">
            {title}
          </h2>
        ) : null}
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
