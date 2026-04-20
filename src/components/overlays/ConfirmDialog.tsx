import React from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
      >
        <div
          className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full pointer-events-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-slate-100 mb-2"
          >
            {title}
          </h2>
          {description && (
            <p className="text-slate-400 text-sm mb-6">{description}</p>
          )}
          {!description && <div className="mb-6" />}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              type="button"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
