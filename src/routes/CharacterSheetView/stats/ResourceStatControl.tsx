import React, { useState, useRef, useEffect } from 'react'
import type { Stat } from '../../../types'

export interface ResourceStatControlProps {
  stat: Stat
  onUpdate: (updates: Partial<Stat>) => void
}

export function ResourceStatControl({ stat, onUpdate }: ResourceStatControlProps) {
  const current = stat.currentValue ?? 0
  const rawMax = stat.maxValue
  const maxNum = typeof rawMax === 'number' ? rawMax : 0
  const effectiveMax = typeof rawMax === 'number' && rawMax > 0 ? rawMax : 0
  const minVal = stat.min ?? 0

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(String(current))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const clamp = (n: number): number => {
    let v = n
    if (minVal !== undefined) v = Math.max(minVal, v)
    if (effectiveMax > 0) v = Math.min(effectiveMax, v)
    return v
  }

  const decrement = () => {
    onUpdate({ currentValue: clamp(current - 1) })
  }

  const increment = () => {
    onUpdate({ currentValue: clamp(current + 1) })
  }

  const commitEdit = () => {
    const parsed = parseInt(editText, 10)
    if (!isNaN(parsed)) {
      onUpdate({ currentValue: clamp(parsed) })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const fillPct = effectiveMax > 0 ? Math.max(0, Math.min(100, (current / effectiveMax) * 100)) : 0
  const isEmpty = current <= 0

  const maxLabel = typeof rawMax === 'string' ? rawMax || '?' : String(maxNum)

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-2 w-full">
        <button
          type="button"
          onClick={decrement}
          disabled={current <= minVal}
          aria-label="Decrease"
          className="bg-slate-700 rounded-lg w-10 h-10 text-xl flex items-center justify-center text-slate-100 hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          −
        </button>

        <div className="flex-1 flex items-center justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="text-center text-slate-100 font-semibold bg-slate-700 border border-indigo-500 rounded-lg px-2 py-1 w-24 focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditText(String(current))
                setIsEditing(true)
              }}
              className="text-slate-100 font-semibold text-base hover:text-indigo-300 transition-colors cursor-text"
              aria-label="Edit current value"
            >
              {current} / {maxLabel}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={effectiveMax > 0 && current >= effectiveMax}
          aria-label="Increase"
          className="bg-slate-700 rounded-lg w-10 h-10 text-xl flex items-center justify-center text-slate-100 hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          +
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={['h-1.5 rounded-full transition-all', isEmpty ? 'bg-red-600' : 'bg-indigo-600'].join(' ')}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  )
}
