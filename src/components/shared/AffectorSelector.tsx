import React, { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import type { Stat } from '../../types'

export interface AffectorSelectorProps {
  value: string[]
  onChange: (ids: string[]) => void
  stats: Stat[]
  label?: string
}

export function AffectorSelector({ value, onChange, stats, label }: AffectorSelectorProps) {
  const [filter, setFilter] = useState('')

  const selectedStats = stats.filter((s) => value.includes(s.id))
  const filteredStats = stats.filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  )

  const toggleStat = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const removeStat = (id: string) => {
    onChange(value.filter((v) => v !== id))
  }

  return (
    <div className="w-full">
      {label && (
        <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
      )}

      {selectedStats.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedStats.map((stat) => (
            <span
              key={stat.id}
              className="bg-indigo-900/60 text-indigo-300 text-sm px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
            >
              {stat.name}
              <button
                type="button"
                onClick={() => removeStat(stat.id)}
                aria-label={`Remove ${stat.name}`}
                className="text-indigo-400 hover:text-indigo-100 leading-none transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="border border-slate-600 bg-slate-800 rounded-lg overflow-hidden">
        <div className="p-2 border-b border-slate-700">
          <Input
            placeholder="Search stats..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredStats.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No stats found</p>
          ) : (
            filteredStats.map((stat) => {
              const isSelected = value.includes(stat.id)
              return (
                <label
                  key={stat.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStat(stat.id)}
                    className="w-4 h-4 accent-indigo-500 rounded"
                  />
                  <span className="text-slate-200 text-sm flex-1">{stat.name}</span>
                  <Badge variant="default" size="sm">
                    {stat.category}
                  </Badge>
                </label>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
