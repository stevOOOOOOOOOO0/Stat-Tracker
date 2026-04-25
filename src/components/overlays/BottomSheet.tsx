import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** When provided, dragging down collapses to this height instead of dismissing. */
  compactHeight?: string
}

type SnapPoint = 'compact' | 'default' | 'full'

const DEFAULT_HEIGHT      = '70vh'
const FULL_HEIGHT         = '92vh'
const CHANGE_THRESHOLD    = 60
const VELOCITY_THRESHOLD  = 0.5
const DISMISS_HEIGHT_PX   = 100  // height below which release always dismisses

function heightToPx(h: string): number {
  if (h.endsWith('vh')) return parseFloat(h) / 100 * window.innerHeight
  if (h.endsWith('px')) return parseFloat(h)
  return window.innerHeight * 0.7
}

export function BottomSheet({ isOpen, onClose, title, children, footer, compactHeight }: BottomSheetProps) {
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [snap,     setSnap]     = useState<SnapPoint>('default')
  const [dragY,    setDragY]    = useState(0)
  const [dragging, setDragging] = useState(false)

  const onCloseRef = useRef(onClose)
  const snapRef    = useRef(snap)
  onCloseRef.current = onClose
  snapRef.current    = snap

  useEffect(() => {
    if (isOpen) {
      setSnap('default')
      setDragY(0)
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => { setMounted(false); setSnap('default') }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const snapHeightFor = (s: SnapPoint): string => {
    if (s === 'compact') return compactHeight ?? '30vh'
    if (s === 'full')    return FULL_HEIGHT
    return DEFAULT_HEIGHT
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!visible) return
    e.preventDefault()

    const startY = e.clientY
    let lastY    = e.clientY
    let lastT    = Date.now()
    let velocity = 0

    setDragging(true)

    const onMove = (ev: PointerEvent) => {
      const now = Date.now()
      const dt  = now - lastT || 1
      velocity  = (ev.clientY - lastY) / dt
      lastY     = ev.clientY
      lastT     = now
      setDragY(ev.clientY - startY)
    }

    const onUp = (ev: PointerEvent) => {
      setDragging(false)
      document.removeEventListener('pointermove',   onMove)
      document.removeEventListener('pointerup',     onUp)
      document.removeEventListener('pointercancel', onUp)

      const delta   = ev.clientY - startY
      const goingDown = velocity > VELOCITY_THRESHOLD  || delta > CHANGE_THRESHOLD
      const goingUp   = velocity < -VELOCITY_THRESHOLD || delta < -CHANGE_THRESHOLD

      // If dragged so far down the panel would be nearly flat → always dismiss
      const baseHeightPx = heightToPx(snapHeightFor(snapRef.current))
      if (baseHeightPx - delta < DISMISS_HEIGHT_PX) {
        onCloseRef.current()
        return
      }

      setDragY(0)

      if (goingDown) {
        if (snapRef.current === 'full')    { setSnap('default'); return }
        if (snapRef.current === 'default') {
          if (compactHeight)               { setSnap('compact');  return }
          onCloseRef.current(); return
        }
        // compact → spring back
        return
      }

      if (goingUp) {
        if (snapRef.current === 'compact') { setSnap('default'); return }
        if (snapRef.current === 'default') { setSnap('full');    return }
        // full → spring back
        return
      }
    }

    document.addEventListener('pointermove',   onMove)
    document.addEventListener('pointerup',     onUp)
    document.addEventListener('pointercancel', onUp)
  }

  if (!mounted) return null

  const baseHeight = snapHeightFor(snap)

  // Both up and down drag change height only — footer stays pinned at screen bottom.
  // translateY is used only for entrance/exit animation.
  const sheetHeight = dragging
    ? `max(60px, calc(${baseHeight} - ${dragY}px))`
    : baseHeight

  const sheetTransform = visible ? 'translateY(0)' : 'translateY(100%)'

  return createPortal(
    <>
      <div
        className={[
          'fixed inset-0 bg-black/60 z-40 transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Bottom sheet'}
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 rounded-t-2xl flex flex-col overflow-hidden"
        style={{
          height:     sheetHeight,
          transform:  sheetTransform,
          transition: dragging
            ? 'none'
            : 'transform 300ms cubic-bezier(0.32,0.72,0,1), height 300ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div
          className="flex justify-center py-3 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          aria-label="Drag to resize or dismiss"
        >
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {title && (
          <div className="px-4 pb-3 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-4">{children}</div>

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
