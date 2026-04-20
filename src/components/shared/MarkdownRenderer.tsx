import React from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ breaks: true })

export interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const rawHtml = marked.parse(content) as string
  const safeHtml = DOMPurify.sanitize(rawHtml)

  return (
    <div
      className={[
        'text-slate-300',
        '[&_h1]:text-slate-100 [&_h1]:text-xl [&_h1]:font-bold',
        '[&_h2]:text-slate-100 [&_h2]:font-semibold',
        '[&_a]:text-indigo-400',
        '[&_strong]:text-slate-100',
        '[&_ul]:list-disc [&_ul]:pl-4',
        '[&_code]:bg-slate-700 [&_code]:px-1 [&_code]:rounded',
        '[&_p]:mb-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
