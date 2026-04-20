import React from 'react'

export interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-indigo-600' : 'bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
      {label && (
        <span className={`text-sm ${disabled ? 'text-slate-500' : 'text-slate-300'}`}>
          {label}
        </span>
      )}
    </div>
  )
}
