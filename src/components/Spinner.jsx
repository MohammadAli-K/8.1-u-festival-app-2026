import './Spinner.css';

/**
 * @param {{ label?: string; className?: string }} props
 */
export function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`spinner ${className}`.trim()} role="status" aria-live="polite">
      <span className="spinner__ring" aria-hidden />
      <span className="spinner__sr">{label}</span>
    </div>
  );
}
