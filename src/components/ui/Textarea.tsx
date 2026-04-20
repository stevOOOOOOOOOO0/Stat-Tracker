import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export function Textarea({
  label,
  error,
  helper,
  className = '',
  rows = 4,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={textareaId}
        rows={rows}
        className={[
          'w-full bg-slate-800 border border-slate-600',
          'focus:border-indigo-500 focus:outline-none',
          'text-slate-100 placeholder:text-slate-500',
          'rounded-lg px-3 py-2 transition-colors resize-none',
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
