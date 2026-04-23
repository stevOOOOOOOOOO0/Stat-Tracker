import React, { useState, useRef, useCallback, useEffect } from 'react'

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

interface DragState {
  sourceIndex: number
  overIndex: number
}

export function SortableList<T>({ items, renderItem, onReorder, keyExtractor }: SortableListProps<T>) {
  const [dragState, setDragState] = useState<DragState | null>(null)

  const itemRefs   = useRef<(HTMLDivElement | null)[]>([])
  const itemsRef   = useRef(items)
  const reorderRef = useRef(onReorder)
  itemsRef.current   = items
  reorderRef.current = onReorder

  // Remove ghost refs for items beyond current display length on cleanup
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length)
  }, [items.length])

  const getOverIndex = useCallback((cursorY: number): number => {
    let best = 0
    let bestDist = Infinity
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mid  = rect.top + rect.height / 2
      const dist = Math.abs(cursorY - mid)
      if (dist < bestDist) { bestDist = dist; best = i }
    })
    return best
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent, sourceIndex: number) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.preventDefault()

    setDragState({ sourceIndex, overIndex: sourceIndex })

    const onMove = (ev: PointerEvent) => {
      const over = getOverIndex(ev.clientY)
      setDragState(prev => prev ? { ...prev, overIndex: over } : null)
    }

    const onUp = () => {
      setDragState(prev => {
        if (prev && prev.overIndex !== prev.sourceIndex) {
          const next = [...itemsRef.current]
          const [removed] = next.splice(prev.sourceIndex, 1)
          next.splice(prev.overIndex, 0, removed)
          reorderRef.current(next)
        }
        return null
      })
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup',   onUp)
      document.removeEventListener('pointercancel', onUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'grabbing'
    document.addEventListener('pointermove',  onMove)
    document.addEventListener('pointerup',    onUp)
    document.addEventListener('pointercancel', onUp)
  }, [getOverIndex])

  // Build the display list: source slot removed, ghost inserted at overIndex
  type DisplayEntry = { item: T; isGhost: boolean; originalIndex: number }

  const displayItems: DisplayEntry[] = dragState
    ? (() => {
        const { sourceIndex, overIndex } = dragState
        const without = items
          .map((item, i) => ({ item, originalIndex: i }))
          .filter((_, i) => i !== sourceIndex)
        const ghost: DisplayEntry = { item: items[sourceIndex], isGhost: true, originalIndex: sourceIndex }
        without.splice(overIndex, 0, ghost as { item: T; isGhost: boolean; originalIndex: number })
        return without as DisplayEntry[]
      })()
    : items.map((item, i) => ({ item, isGhost: false, originalIndex: i }))

  return (
    <div className="w-full" style={{ userSelect: dragState ? 'none' : undefined }}>
      {displayItems.map(({ item, isGhost, originalIndex }, displayIndex) => {
        const dragHandleProps: React.HTMLAttributes<HTMLElement> = {
          onPointerDown: (e: React.PointerEvent<HTMLElement>) =>
            handlePointerDown(e, originalIndex),
          style: { touchAction: 'none', cursor: dragState ? 'grabbing' : 'grab' },
        }

        return (
          <div
            key={`${keyExtractor(item)}${isGhost ? '-ghost' : ''}`}
            ref={el => { itemRefs.current[displayIndex] = el }}
            className={isGhost ? 'opacity-40 pointer-events-none' : ''}
          >
            {renderItem(item, originalIndex, dragHandleProps)}
          </div>
        )
      })}
    </div>
  )
}
