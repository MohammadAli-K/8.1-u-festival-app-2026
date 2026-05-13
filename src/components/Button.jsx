import { forwardRef } from 'react';
import './Button.css';

/**
 * @param {{
 *   variant?: 'primary' | 'ghost';
 *   className?: string;
 *   children: import('react').ReactNode;
 * } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', className = '', children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`btn btn--${variant} ui-text tap-scale ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
});
