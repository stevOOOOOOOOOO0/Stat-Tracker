import React, { useRef, useState } from 'react'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...', className = '' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, '').trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(',')) {
      addTag(val)
    } else {
      setInputValue(val)
    }
  }

  return (
    <div
      className={[
        'border border-slate-600 bg-slate-800 rounded-lg px-2 py-2',
        'cursor-text',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-slate-700 text-slate-200 text-sm px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(i)
                }}
                className="text-slate-400 hover:text-slate-100 leading-none transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none w-full min-w-[80px]"
      />
    </div>
  )
}
