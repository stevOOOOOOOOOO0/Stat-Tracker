import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          id={selectId}
          className={[
            'w-full appearance-none bg-slate-800 border border-slate-600',
            'focus:border-indigo-500 focus:outline-none',
            'text-slate-100 rounded-lg px-3 py-2 pr-8 transition-colors',
            'cursor-pointer',
            error ? 'border-red-500' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  )
}
