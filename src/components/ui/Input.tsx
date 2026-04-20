import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, className = '', id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={[
          'w-full bg-slate-800 border border-slate-600',
          'focus:border-indigo-500 focus:outline-none',
          'text-slate-100 placeholder:text-slate-500',
          'rounded-lg px-3 py-2 transition-colors',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      {helper && !error && <p className="text-sm text-slate-500 mt-1">{helper}</p>}
    </div>
  )
}
