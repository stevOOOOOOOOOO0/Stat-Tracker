import React from 'react'
import type { Stat } from '../../../types'
import { ResourceStatControl } from './ResourceStatControl'
import { DerivedStatDisplay } from './DerivedStatDisplay'
import { useCharacterStore } from '../../../store/characterStore'

export interface StatRowProps {
  stat: Stat
  effectiveValue: number | string | boolean
  onTap: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  characterId: string
}

export function StatRow({ stat, effectiveValue, onTap, dragHandleProps, characterId }: StatRowProps) {
  const updateStat = useCharacterStore(s => s.updateStat)

  const handleResourceUpdate = (updates: Partial<Stat>) => {
    updateStat(characterId, { ...stat, ...updates })
  }

  const isResource = stat.category === 'resource'

  return (
    <div
      className={[
        'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
        !isResource ? 'hover:bg-slate-700/50 cursor-pointer' : '',
      ].join(' ')}
      onClick={!isResource ? onTap : undefined}
      role={!isResource ? 'button' : undefined}
      tabIndex={!isResource ? 0 : undefined}
      onKeyDown={!isResource ? (e) => { if (e.key === 'Enter' || e.key === ' ') onTap() } : undefined}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <span
          {...dragHandleProps}
          className="text-slate-600 text-lg select-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          ≡
        </span>
      )}

      {/* Category-specific content */}
      {stat.category === 'resource' && (
        <div className="flex-1" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-slate-300 text-sm font-medium">{stat.name}</span>
          </div>
          <ResourceStatControl stat={stat} onUpdate={handleResourceUpdate} />
        </div>
      )}

      {stat.category === 'derived' && (
        <div className="flex-1 flex">
          <DerivedStatDisplay
            stat={stat}
            effectiveValue={typeof effectiveValue === 'number' ? effectiveValue : Number(effectiveValue) || 0}
          />
        </div>
      )}

      {stat.category === 'base' && (
        <>
          <span className="flex-1 text-slate-200 text-sm">{stat.name}</span>
          <span className="text-slate-100 font-semibold text-sm">
            {typeof effectiveValue === 'number' || typeof effectiveValue === 'string'
              ? String(effectiveValue)
              : ''}
          </span>
        </>
      )}

      {stat.category === 'text' && (
        <>
          <span className="flex-1 text-slate-200 text-sm">{stat.name}</span>
          <span className="text-slate-300 text-sm italic max-w-[40%] truncate">
            {typeof effectiveValue === 'string' ? effectiveValue : ''}
          </span>
        </>
      )}

      {stat.category === 'boolean' && (
        <>
          <span className="flex-1 text-slate-200 text-sm">{stat.name}</span>
          <span
            className={[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              effectiveValue === true
                ? 'bg-indigo-600 border-indigo-500'
                : 'bg-slate-700 border-slate-500',
            ].join(' ')}
            aria-label={effectiveValue === true ? 'True' : 'False'}
          >
            {effectiveValue === true && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </>
      )}

      {/* Tap arrow for non-resource */}
      {!isResource && (
        <span className="text-slate-500 text-lg flex-shrink-0 ml-auto">›</span>
      )}
    </div>
  )
}
