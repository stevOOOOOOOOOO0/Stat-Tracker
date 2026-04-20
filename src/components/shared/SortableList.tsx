import React, { useState } from 'react'
import { useDragSort } from '../../hooks/useDragSort'

export interface SortableListProps<T> {
  items: T[]
  renderItem: (
    item: T,
    index: number,
    dragHandleProps: React.HTMLAttributes<HTMLElement>
  ) => React.ReactNode
  onReorder: (newItems: T[]) => void
  keyExtractor: (item: T) => string
}

export function SortableList<T>({
  items,
  renderItem,
  onReorder,
  keyExtractor,
}: SortableListProps<T>) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const { dragHandlers } = useDragSort(items, onReorder)

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const handlers = dragHandlers(index)
        const dragHandleProps: React.HTMLAttributes<HTMLElement> = {
          onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
            setDraggingIndex(index)
            handlers.onPointerDown(e)
            // Clear dragging state on pointer up
            const clear = () => {
              setDraggingIndex(null)
              window.removeEventListener('pointerup', clear)
              window.removeEventListener('pointercancel', clear)
            }
            window.addEventListener('pointerup', clear)
            window.addEventListener('pointercancel', clear)
          },
          style: { touchAction: 'none', cursor: 'grab' },
        }

        return (
          <div
            key={keyExtractor(item)}
            className={[
              'transition-all',
              draggingIndex === index ? 'outline outline-2 outline-blue-500 rounded-lg' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {renderItem(item, index, dragHandleProps)}
          </div>
        )
      })}
    </div>
  )
}
