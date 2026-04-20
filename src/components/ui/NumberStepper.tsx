import React, { useState, useRef, useEffect } from 'react'

export interface NumberStepperProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  size?: 'sm' | 'md'
}

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  size = 'md',
}: NumberStepperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const clamp = (n: number): number => {
    let result = n
    if (min !== undefined) result = Math.max(min, result)
    if (max !== undefined) result = Math.min(max, result)
    return result
  }

  const decrement = () => {
    onChange(clamp(value - step))
  }

  const increment = () => {
    onChange(clamp(value + step))
  }

  const commitEdit = () => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed)) {
      onChange(clamp(parsed))
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const isMd = size === 'md'

  const btnClass = isMd
    ? 'w-10 h-10 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-100 font-bold text-lg select-none'
    : 'w-8 h-8 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-100 font-bold select-none'

  const valueClass = isMd
    ? 'text-xl font-bold text-slate-100 min-w-[3rem] text-center'
    : 'text-base font-bold text-slate-100 min-w-[2.5rem] text-center'

  const inputClass = isMd
    ? 'text-xl font-bold text-slate-100 min-w-[3rem] text-center bg-slate-700 rounded-lg border border-indigo-500 focus:outline-none px-1'
    : 'text-base font-bold text-slate-100 min-w-[2.5rem] text-center bg-slate-700 rounded-lg border border-indigo-500 focus:outline-none px-1'

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-sm text-slate-300 font-medium">{label}</span>}
      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={min !== undefined && value <= min}
          aria-label="Decrease"
          className={btnClass + ' disabled:opacity-40 disabled:cursor-not-allowed'}
        >
          −
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            className={inputClass}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditValue(String(value))
              setIsEditing(true)
            }}
            aria-label="Edit value"
            className={`${valueClass} px-1 rounded hover:bg-slate-700 transition-colors cursor-text`}
          >
            {value}
          </button>
        )}

        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          aria-label="Increase"
          className={btnClass + ' disabled:opacity-40 disabled:cursor-not-allowed'}
        >
          +
        </button>
      </div>
    </div>
  )
}
