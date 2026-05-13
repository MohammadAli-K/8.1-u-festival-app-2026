import { useId, useState } from 'react';
import './Accordion.css';

/**
 * @param {{ items: { id: string; title: string; content: import('react').ReactNode }[] }} props
 */
export function Accordion({ items }) {
  const baseId = useId();
  const [openId, setOpenId] = useState(/** @type {string | null} */ (null));

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-panel-${item.id}`;
        const headerId = `${baseId}-header-${item.id}`;
        return (
          <div
            key={item.id}
            className={`accordion__item${isOpen ? ' accordion__item--open' : ''}`}
          >
            <button
              type="button"
              id={headerId}
              className="accordion__header tap-scale"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              {item.title}
              <span className="material-symbols-outlined accordion__chevron" aria-hidden>
                expand_more
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className="accordion__panel accordion-panel__inner"
            >
              <div className="accordion__panel-body" aria-hidden={!isOpen}>
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
