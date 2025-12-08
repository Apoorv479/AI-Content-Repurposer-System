import React from 'react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {'blog' | 'linkedin' | 'thread' | 'captions' | 'seo_keywords'} props.activeVariant
 * @param {(variant: string) => void} props.onVariantChange
 * @param {Object} [props.result] - Job result object (optional)
 */
export function VariantTabs({ activeVariant, onVariantChange, result }) {
  // Always show these tabs, regardless of result availability
  const variants = [
    { key: 'blog', label: 'Blog' },
    { key: 'linkedin', label: 'LinkedIn post' },
    { key: 'captions', label: 'Short caption' },
    { key: 'seo_keywords', label: 'SEO keywords' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {variants.map((variant) => {
        const isActive = activeVariant === variant.key;
        return (
          <button
            key={variant.key}
            onClick={() => onVariantChange(variant.key)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800',
              isActive
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
            aria-pressed={isActive}
            aria-label={`Switch to ${variant.label} view`}
          >
            {variant.label}
          </button>
        );
      })}
    </div>
  );
}


