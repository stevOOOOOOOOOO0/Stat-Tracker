import React, { useState } from 'react'
import type { Stat, StatBlock } from '../../../types'
import { useCharacter } from '../../../hooks/useCharacter'
import { useCharacterStore } from '../../../store/characterStore'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { SortableList } from '../../../components/shared/SortableList'
import { StatRow } from '../stats/StatRow'
import { StatEditSheet } from '../stats/StatEditSheet'
import { CreateStatBlockSheet } from '../stats/CreateStatBlockSheet'

interface EditSheetState {
  stat: Stat | null
  blockId: string
}

export function StatsTab() {
  const { character, effectiveStats, activeCharacterId } = useCharacter()
  const updateStatBlock = useCharacterStore(s => s.updateStatBlock)
  const removeStatBlock = useCharacterStore(s => s.removeStatBlock)
  const updateStat = useCharacterStore(s => s.updateStat)

  const [openEditSheet, setOpenEditSheet] = useState<EditSheetState | null>(null)
  const [openCreateBlockSheet, setOpenCreateBlockSheet] = useState(false)
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null)
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set())
  const [blockMenuOpen, setBlockMenuOpen] = useState<string | null>(null)
  const [editingBlockName, setEditingBlockName] = useState<{ id: string; name: string } | null>(null)

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  const sortedBlocks = [...character.statBlocks].sort((a, b) => a.order - b.order)

  const getEffectiveValue = (stat: Stat): number | string | boolean => {
    if (stat.category === 'resource') {
      return stat.currentValue ?? 0
    }
    if (stat.category === 'boolean') {
      return stat.value === true
    }
    if (stat.category === 'text') {
      return typeof stat.value === 'string' ? stat.value : ''
    }
    // For base and derived, use effectiveStats if available
    const effective = effectiveStats.find(s => s.id === stat.id)
    if (effective) {
      return typeof effective.value === 'number' ? effective.value : Number(effective.value) || 0
    }
    return typeof stat.value === 'number' ? stat.value : Number(stat.value) || 0
  }

  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      return next
    })
  }

  const handleReorderStats = (block: StatBlock, newStats: Stat[]) => {
    newStats.forEach((s, i) => {
      if (s.order !== i) {
        updateStat(activeCharacterId, { ...s, order: i })
      }
    })
  }

  const handleDeleteBlock = (blockId: string) => {
    removeStatBlock(activeCharacterId, blockId)
    setConfirmDeleteBlock(null)
  }

  const handleSaveBlockName = () => {
    if (!editingBlockName) return
    const block = character.statBlocks.find(b => b.id === editingBlockName.id)
    if (block && editingBlockName.name.trim()) {
      updateStatBlock(activeCharacterId, { ...block, name: editingBlockName.name.trim() })
    }
    setEditingBlockName(null)
  }

  const blockToDelete = confirmDeleteBlock
    ? character.statBlocks.find(b => b.id === confirmDeleteBlock)
    : null

  return (
    <div className="p-4 space-y-4">
      {/* Top controls */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setOpenCreateBlockSheet(true)}>
          + Add Stat Block
        </Button>
      </div>

      {sortedBlocks.length === 0 ? (
        <EmptyState
          title="No stat blocks yet"
          description="Create a stat block to start organizing your character's attributes."
          action={
            <Button variant="primary" size="sm" onClick={() => setOpenCreateBlockSheet(true)}>
              Add Stat Block
            </Button>
          }
        />
      ) : (
        sortedBlocks.map(block => {
          const blockStats = character.stats
            .filter(s => s.blockId === block.id)
            .sort((a, b) => a.order - b.order)

          const isCollapsed = collapsedBlocks.has(block.id)
          const isMenuOpen = blockMenuOpen === block.id
          const isEditingName = editingBlockName?.id === block.id

          return (
            <div key={block.id} className="bg-slate-800 rounded-xl overflow-hidden">
              {/* Block header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-700/50">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editingBlockName.name}
                    onChange={e => setEditingBlockName({ id: block.id, name: e.target.value })}
                    onBlur={handleSaveBlockName}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveBlockName()
                      if (e.key === 'Escape') setEditingBlockName(null)
                    }}
                    autoFocus
                    className="flex-1 bg-slate-700 border border-indigo-500 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none"
                  />
                ) : (
                  <span className="flex-1 text-sm font-semibold text-slate-300">{block.name}</span>
                )}

                <span className="text-xs text-slate-500 bg-slate-700 rounded px-1.5 py-0.5">
                  {blockStats.length}
                </span>

                <button
                  type="button"
                  onClick={() => toggleCollapse(block.id)}
                  className="text-slate-500 hover:text-slate-300 transition-colors w-6 h-6 flex items-center justify-center"
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isCollapsed ? '▸' : '▾'}
                </button>

                {/* Block menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBlockMenuOpen(isMenuOpen ? null : block.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors w-6 h-6 flex items-center justify-center text-lg"
                    aria-label="Block options"
                  >
                    ···
                  </button>
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setBlockMenuOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-slate-700 rounded-lg shadow-xl min-w-[140px] overflow-hidden">
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                          onClick={() => {
                            setEditingBlockName({ id: block.id, name: block.name })
                            setBlockMenuOpen(null)
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                          onClick={() => {
                            setConfirmDeleteBlock(block.id)
                            setBlockMenuOpen(null)
                          }}
                        >
                          Delete Block
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Block content */}
              {!isCollapsed && (
                <div className="px-1 py-1">
                  {blockStats.length > 0 ? (
                    <SortableList
                      items={blockStats}
                      keyExtractor={s => s.id}
                      onReorder={newOrder => handleReorderStats(block, newOrder)}
                      renderItem={(stat, _idx, dragHandleProps) => (
                        <StatRow
                          key={stat.id}
                          stat={stat}
                          effectiveValue={getEffectiveValue(stat)}
                          onTap={() => setOpenEditSheet({ stat, blockId: block.id })}
                          dragHandleProps={dragHandleProps}
                          characterId={activeCharacterId}
                        />
                      )}
                    />
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-3">No stats yet</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setOpenEditSheet({ stat: null, blockId: block.id })}
                    className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-2 text-center hover:bg-slate-700/50 rounded-lg"
                  >
                    + Add Stat
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Create stat block sheet */}
      <CreateStatBlockSheet
        isOpen={openCreateBlockSheet}
        onClose={() => setOpenCreateBlockSheet(false)}
        characterId={activeCharacterId}
      />

      {/* Stat edit sheet */}
      {openEditSheet !== null && (
        <StatEditSheet
          stat={openEditSheet.stat}
          blockId={openEditSheet.blockId}
          isOpen={true}
          onClose={() => setOpenEditSheet(null)}
          stats={character.stats}
          characterId={activeCharacterId}
        />
      )}

      {/* Confirm delete block */}
      <ConfirmDialog
        isOpen={confirmDeleteBlock !== null}
        onClose={() => setConfirmDeleteBlock(null)}
        onConfirm={() => confirmDeleteBlock && handleDeleteBlock(confirmDeleteBlock)}
        title="Delete Stat Block"
        description={`Delete "${blockToDelete?.name}"? All stats in this block will be removed.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
