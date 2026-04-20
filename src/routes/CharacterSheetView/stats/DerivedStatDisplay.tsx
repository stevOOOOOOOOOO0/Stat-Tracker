import React from 'react'
import type { Stat } from '../../../types'

export interface DerivedStatDisplayProps {
  stat: Stat
  effectiveValue: number
}

export function DerivedStatDisplay({ stat, effectiveValue }: DerivedStatDisplayProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2 text-center flex-1">
      <div className="text-2xl font-bold text-indigo-400 text-center">{effectiveValue}</div>
      <div className="text-xs text-slate-400 text-center truncate mt-0.5">{stat.name}</div>
      {stat.formula && (
        <div className="text-xs text-slate-500 text-center truncate mt-0.5">{stat.formula}</div>
      )}
    </div>
  )
}
