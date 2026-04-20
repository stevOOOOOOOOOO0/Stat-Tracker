import React, { useState } from 'react'
import type { BiographySection } from '../../../types'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { MarkdownEditor } from '../../../components/shared/MarkdownEditor'

export interface BiographySectionEditorProps {
  section: BiographySection
  onUpdate: (s: BiographySection) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export function BiographySectionEditor({
  section,
  onUpdate,
  onDelete,
  dragHandleProps,
}: BiographySectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)

  const commitTitle = () => {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== section.title) {
      onUpdate({ ...section, title: trimmed })
    } else {
      setTitleDraft(section.title)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTitle()
    if (e.key === 'Escape') {
      setTitleDraft(section.title)
      setIsEditingTitle(false)
    }
  }

  const handleBodyBlur = (newBody: string) => {
    if (newBody !== section.body) {
      onUpdate({ ...section, body: newBody })
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl mb-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer">
        {/* Drag handle */}
        <span
          {...dragHandleProps}
          className="text-slate-600 select-none text-base leading-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          ≡
        </span>

        {/* Inline-editable title */}
        {isEditingTitle ? (
          <div
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-sm py-1"
            />
          </div>
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-slate-200 truncate"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit title"
          >
            {section.title}
          </span>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-slate-500 hover:text-slate-300 transition-colors w-6 h-6 flex items-center justify-center text-xs flex-shrink-0"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-slate-500 hover:text-red-400 px-1.5 py-0.5 flex-shrink-0"
          aria-label="Delete section"
        >
          ×
        </Button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-slate-700/50">
          <div className="pt-2">
            <BodyEditor
              body={section.body}
              onBlur={handleBodyBlur}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Internal component so we can track local edits and only save on blur
function BodyEditor({
  body,
  onBlur,
}: {
  body: string
  onBlur: (v: string) => void
}) {
  const [value, setValue] = useState(body)

  // Sync external changes
  React.useEffect(() => {
    setValue(body)
  }, [body])

  return (
    <div onBlur={() => onBlur(value)}>
      <MarkdownEditor
        value={value}
        onChange={setValue}
        placeholder="Write this section..."
        rows={5}
      />
    </div>
  )
}
