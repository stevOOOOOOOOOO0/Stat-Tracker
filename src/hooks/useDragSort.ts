import { useRef, useCallback } from 'react'

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void
}

interface UseDragSortReturn<T> {
  dragHandlers: (index: number) => DragHandlers
}

/**
 * Generic drag-and-drop sort hook using pointer events.
 * Returns dragHandlers(index) to attach to each draggable item.
 */
export function useDragSort<T>(
  items: T[],
  onReorder: (items: T[]) => void
): UseDragSortReturn<T> {
  const dragIndexRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)

  const dragHandlers = useCallback(
    (index: number): DragHandlers => ({
      onPointerDown: (e: React.PointerEvent) => {
        // Only handle primary pointer (left mouse button or single touch)
        if (e.button !== 0 && e.pointerType === 'mouse') return

        dragIndexRef.current = index
        isDraggingRef.current = false

        const startY = e.clientY
        const target = e.currentTarget as HTMLElement
        target.setPointerCapture(e.pointerId)

        let currentOverIndex = index

        const handlePointerMove = (moveEvent: PointerEvent) => {
          if (dragIndexRef.current === null) return
          isDraggingRef.current = true

          const deltaY = moveEvent.clientY - startY
          const itemHeight = target.offsetHeight || 50
          const steps = Math.round(deltaY / itemHeight)
          const newIndex = Math.max(
            0,
            Math.min(items.length - 1, (dragIndexRef.current ?? 0) + steps)
          )

          if (newIndex !== currentOverIndex) {
            currentOverIndex = newIndex
          }
        }

        const handlePointerUp = () => {
          if (isDraggingRef.current && dragIndexRef.current !== null && currentOverIndex !== dragIndexRef.current) {
            // Reorder items
            const newItems = [...items]
            const [removed] = newItems.splice(dragIndexRef.current, 1)
            newItems.splice(currentOverIndex, 0, removed)
            onReorder(newItems)
          }

          dragIndexRef.current = null
          isDraggingRef.current = false
          target.removeEventListener('pointermove', handlePointerMove)
          target.removeEventListener('pointerup', handlePointerUp)
          target.removeEventListener('pointercancel', handlePointerUp)
        }

        target.addEventListener('pointermove', handlePointerMove)
        target.addEventListener('pointerup', handlePointerUp)
        target.addEventListener('pointercancel', handlePointerUp)
      },
    }),
    [items, onReorder]
  )

  return { dragHandlers }
}
