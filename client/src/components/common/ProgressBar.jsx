import React from 'react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {number} props.progress - 0-100
 * @param {string} [props.className]
 */
export function ProgressBar({ progress, className = '' }) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={clsx('w-full h-1 bg-slate-800 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
        style={{ width: `${clampedProgress}%` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}


