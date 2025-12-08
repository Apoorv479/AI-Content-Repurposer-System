import React from 'react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {string} [props.size] - 'sm' | 'md' | 'lg'
 * @param {string} [props.className]
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-slate-300 border-t-indigo-600',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}


