import './Badge.css';

/**
 * @param {{
 *   variant?: 'accent' | 'secondary' | 'info';
 *   children: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function Badge({ variant = 'accent', children, className = '' }) {
  return (
    <span className={`badge badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
