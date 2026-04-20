import React, { useState, useRef, useCallback } from 'react'
import type { Stat, Item, Ability } from '../../types'
import { useQuickAccess } from '../../hooks/useQuickAccess'
import { useCharacterStore } from '../../store/characterStore'
import { useCharacter } from '../../hooks/useCharacter'
import { useHistory } from '../../hooks/useHistory'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { NumberStepper } from '../../components/ui/NumberStepper'
import { evaluateRoll } from '../../engine/rollEvaluator'

export interface QuickAccessBarProps {
  characterId: string
}

interface SheetState {
  entityId: string
  entityType: 'stat' | 'item' | 'ability'
  label: string
  currentValue: number
  maxValue?: number
}

interface PinMenuState {
  entityId: string
  isPinned: boolean
  x: number
  y: number
}

const SLOT_COUNT = 4

export function QuickAccessBar({ characterId }: QuickAccessBarProps) {
  const entries = useQuickAccess()
  const { character } = useCharacter()
  const updateStat = useCharacterStore((s) => s.updateStat)
  const recordUsage = useCharacterStore((s) => s.recordUsage)
  const pinQuickAccess = useCharacterStore((s) => s.pinQuickAccess)
  const { appendHistory } = useHistory()

  const [sheetState, setSheetState] = useState<SheetState | null>(null)
  const [sheetValue, setSheetValue] = useState(0)
  const [pinMenu, setPinMenu] = useState<PinMenuState | null>(null)

  const longPressTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const openStatSheet = useCallback(
    (stat: Stat) => {
      if (stat.category === 'resource') {
        setSheetValue(stat.currentValue ?? 0)
        setSheetState({
          entityId: stat.id,
          entityType: 'stat',
          label: stat.name,
          currentValue: stat.currentValue ?? 0,
          maxValue:
            typeof stat.maxValue === 'number'
              ? stat.maxValue
              : typeof stat.maxValue === 'string'
              ? parseInt(stat.maxValue, 10) || undefined
              : undefined,
        })
      } else {
        const val = typeof stat.value === 'number' ? stat.value : Number(stat.value) || 0
        setSheetValue(val)
        setSheetState({
          entityId: stat.id,
          entityType: 'stat',
          label: stat.name,
          currentValue: val,
        })
      }
    },
    []
  )

  const handleTap = useCallback(
    (entity: Stat | Item | Ability | null, entityType: 'stat' | 'item' | 'ability') => {
      if (!entity || !character) return

      if (entityType === 'stat') {
        openStatSheet(entity as Stat)
      } else if (entityType === 'item') {
        const item = entity as Item
        if (item.rollExpressions.length > 0) {
          const result = evaluateRoll(item.rollExpressions[0].formula, character.stats)
          recordUsage(characterId, item.id, 'item')
          appendHistory({
            type: 'item_used',
            description: `Used ${item.name}: ${result.breakdown}`,
            entityId: item.id,
          })
        } else {
          recordUsage(characterId, item.id, 'item')
          appendHistory({
            type: 'item_used',
            description: `Used ${item.name}`,
            entityId: item.id,
          })
        }
      } else if (entityType === 'ability') {
        const ability = entity as Ability
        if (ability.rollExpressions.length > 0) {
          const result = evaluateRoll(ability.rollExpressions[0].formula, character.stats)
          recordUsage(characterId, ability.id, 'ability')
          appendHistory({
            type: 'ability_used',
            description: `Used ${ability.name}: ${result.breakdown}`,
            entityId: ability.id,
          })
        } else {
          recordUsage(characterId, ability.id, 'ability')
          appendHistory({
            type: 'ability_used',
            description: `Used ${ability.name}`,
            entityId: ability.id,
          })
        }
      }
    },
    [character, characterId, openStatSheet, recordUsage, appendHistory]
  )

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent<HTMLButtonElement>,
      entityId: string,
      isPinned: boolean
    ) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const timer = setTimeout(() => {
        setPinMenu({
          entityId,
          isPinned,
          x: rect.left,
          y: rect.top,
        })
        longPressTimers.current.delete(entityId)
      }, 500)
      longPressTimers.current.set(entityId, timer)
    },
    []
  )

  const handlePointerUp = useCallback((entityId: string) => {
    const timer = longPressTimers.current.get(entityId)
    if (timer) {
      clearTimeout(timer)
      longPressTimers.current.delete(entityId)
    }
  }, [])

  const handleStatSave = () => {
    if (!sheetState || !character) return
    const stat = character.stats.find((s) => s.id === sheetState.entityId)
    if (!stat) return

    if (stat.category === 'resource') {
      updateStat(characterId, { ...stat, currentValue: sheetValue })
    } else {
      updateStat(characterId, { ...stat, value: sheetValue })
    }
    setSheetState(null)
  }

  // Fill slots up to 4
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => entries[i] ?? null)

  return (
    <>
      <div className="flex gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700 overflow-x-auto scrollbar-none">
        {slots.map((entry, i) => {
          if (!entry) {
            return (
              <div
                key={`placeholder-${i}`}
                className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl px-3 py-2 flex flex-col items-center min-w-[72px]"
              >
                <span className="text-xs text-slate-600 truncate max-w-[64px]">—</span>
                <span className="text-slate-600 text-xl">—</span>
              </div>
            )
          }

          const { record, entity } = entry
          const entityType = record.entityType

          let primaryDisplay: React.ReactNode
          if (!entity) {
            primaryDisplay = <span className="text-slate-600 text-xl">—</span>
          } else if (entityType === 'stat') {
            const stat = entity as Stat
            if (stat.category === 'resource') {
              primaryDisplay = (
                <span className="text-slate-100 text-sm font-bold">
                  {stat.currentValue ?? 0}/{typeof stat.maxValue === 'number' ? stat.maxValue : stat.maxValue ?? '?'}
                </span>
              )
            } else {
              primaryDisplay = (
                <span className="text-indigo-400 text-lg font-bold">
                  {typeof stat.value === 'number' ? stat.value : String(stat.value)}
                </span>
              )
            }
          } else {
            primaryDisplay = (
              <span className="text-indigo-400 text-xl">⚀</span>
            )
          }

          const entityName = entity?.name ?? record.entityId.slice(0, 8)

          return (
            <button
              key={record.entityId}
              type="button"
              className="bg-slate-700 rounded-xl px-3 py-2 flex flex-col items-center min-w-[72px] active:scale-95 transition-transform flex-shrink-0"
              onClick={() => entity && handleTap(entity, entityType)}
              onPointerDown={(e) =>
                handlePointerDown(e, record.entityId, record.isPinned)
              }
              onPointerUp={() => handlePointerUp(record.entityId)}
              onPointerLeave={() => handlePointerUp(record.entityId)}
              onPointerCancel={() => handlePointerUp(record.entityId)}
              aria-label={entityName}
            >
              <span className="text-xs text-slate-400 truncate max-w-[64px] w-full text-center">
                {entityName}
              </span>
              {primaryDisplay}
            </button>
          )
        })}
      </div>

      {/* Stat edit sheet */}
      {sheetState && (
        <BottomSheet
          isOpen={true}
          onClose={() => setSheetState(null)}
          title={sheetState.label}
        >
          <div className="flex flex-col items-center gap-6 py-4">
            <NumberStepper
              value={sheetValue}
              onChange={setSheetValue}
              min={0}
              max={sheetState.maxValue}
              label={sheetState.label}
            />
            <button
              type="button"
              onClick={handleStatSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Pin menu */}
      {pinMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPinMenu(null)}
          />
          <div
            className="fixed z-50 bg-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]"
            style={{
              left: Math.min(pinMenu.x, window.innerWidth - 160),
              top: Math.max(pinMenu.y - 80, 8),
            }}
          >
            <button
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
              onClick={() => {
                pinQuickAccess(characterId, pinMenu.entityId, !pinMenu.isPinned)
                setPinMenu(null)
              }}
            >
              {pinMenu.isPinned ? 'Unpin' : 'Pin'}
            </button>
          </div>
        </>
      )}
    </>
  )
}
