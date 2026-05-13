import './Card.css';

/**
 * @param {{
 *   image?: string;
 *   imageAlt?: string;
 *   title?: string;
 *   subtitle?: string;
 *   children?: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function Card({ image, imageAlt = '', title, subtitle, children, className = '' }) {
  return (
    <article className={`card ${className}`.trim()}>
      {image ? (
        <img className="card__image" src={image} alt={imageAlt} width={800} height={400} />
      ) : null}
      <div className="card__body">
        {title ? <h3 className="card__title">{title}</h3> : null}
        {subtitle ? <p className="card__subtitle ui-text">{subtitle}</p> : null}
        {children ? <div className="card__content">{children}</div> : null}
      </div>
    </article>
  );
}
