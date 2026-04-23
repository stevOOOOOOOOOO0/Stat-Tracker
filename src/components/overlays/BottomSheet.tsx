import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children, footer }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Defer to next frame so CSS transition plays
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 bg-black/60 z-40 transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Bottom sheet'}
        className={[
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-slate-800 rounded-t-2xl max-h-[90vh] flex flex-col',
          'transition-transform duration-300',
          visible ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="flex justify-center mt-3 mb-1 flex-shrink-0">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-slate-700 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  )
}
