import React from 'react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.variant] - 'primary' | 'secondary' | 'ghost'
 * @param {string} [props.size] - 'sm' | 'md' | 'lg'
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {() => void} [props.onClick]
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500 disabled:text-slate-500 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}


