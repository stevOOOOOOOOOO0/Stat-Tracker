import React, { useState, useEffect, useRef } from 'react'
import { IconButton } from '../ui/IconButton'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: React.ReactNode
  onTitleChange?: (title: string) => void
}

export function PageHeader({ title, subtitle, onBack, actions, onTitleChange }: PageHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(title)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!editing) setDraft(title) }, [title, editing])
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) onTitleChange?.(trimmed)
    else setDraft(title)
    setEditing(false)
  }

  const cancel = () => { setDraft(title); setEditing(false) }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
      {onBack && (
        <IconButton
          icon={<span className="text-base leading-none">←</span>}
          label="Back"
          variant="ghost"
          size="sm"
          onClick={onBack}
        />
      )}

      <div className="flex-1 min-w-0">
        {editing && onTitleChange ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800 text-lg font-semibold text-slate-100 rounded px-2 py-0.5 outline-none ring-1 ring-indigo-500"
          />
        ) : (
          <h1
            className={[
              'text-lg font-semibold text-slate-100 truncate',
              onTitleChange ? 'cursor-text hover:text-slate-300 transition-colors' : '',
            ].join(' ')}
            onClick={() => { if (onTitleChange) setEditing(true) }}
          >
            {title}
          </h1>
        )}
        {subtitle && <p className="text-sm text-slate-400 truncate">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
