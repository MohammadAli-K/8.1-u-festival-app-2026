import './NewsBlock.css';
import { Badge } from './Badge.jsx';

/**
 * @param {{
 *   type?: 'alert' | 'news' | 'update';
 *   title: string;
 *   children: import('react').ReactNode;
 *   timeLabel?: string;
 *   timeDateTime?: string;
 *   showNewBadge?: boolean;
 *   newBadgeLabel?: string;
 *   onMarkRead?: () => void;
 *   staggerIndex?: number;
 *   className?: string;
 * }} props
 */
export function NewsBlock({
  type = 'news',
  title,
  children,
  timeLabel,
  timeDateTime,
  showNewBadge = false,
  newBadgeLabel = 'New',
  onMarkRead,
  staggerIndex = 0,
  className = '',
}) {
  const style = {
    '--news-stagger-delay': `${staggerIndex * 70}ms`,
  };

  const inner = (
    <>
      <div className="news-block__head">
        <h3 className="news-block__title">{title}</h3>
        {showNewBadge ? (
          <Badge variant="accent" className="news-block__badge">
            {newBadgeLabel}
          </Badge>
        ) : null}
      </div>
      {timeLabel ? (
        <time className="news-block__time" dateTime={timeDateTime}>
          {timeLabel}
        </time>
      ) : null}
      <div className="news-block__body">{children}</div>
    </>
  );

  const rootClass = [
    'news-block',
    `news-block--${type}`,
    'news-block--stagger',
    onMarkRead ? 'news-block--interactive tap-scale' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onMarkRead) {
    return (
      <button
        type="button"
        className={rootClass}
        style={style}
        onClick={onMarkRead}
      >
        {inner}
      </button>
    );
  }

  return (
    <article className={rootClass} style={style}>
      {inner}
    </article>
  );
}
