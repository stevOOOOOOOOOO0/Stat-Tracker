import React, { useState } from 'react'
import { Textarea } from '../ui/Textarea'
import { MarkdownRenderer } from './MarkdownRenderer'

export interface MarkdownEditorProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write markdown...',
  rows = 6,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={[
            'text-sm px-3 py-1 rounded-md font-medium transition-colors',
            !isPreview
              ? 'bg-slate-700 text-slate-100'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800',
          ].join(' ')}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={[
            'text-sm px-3 py-1 rounded-md font-medium transition-colors',
            isPreview
              ? 'bg-slate-700 text-slate-100'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800',
          ].join(' ')}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div
          className="min-h-[96px] bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          style={{ minHeight: `${rows * 24}px` }}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-slate-500 text-sm">{placeholder}</p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      )}
    </div>
  )
}
