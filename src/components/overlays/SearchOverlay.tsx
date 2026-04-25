import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useCharacterStore } from '../../store/characterStore'
import { useCampaignStore } from '../../store/campaignStore'
import { useSearch } from '../../hooks/useSearch'
import { Badge } from '../ui/Badge'
import type { BadgeProps } from '../ui/Badge'

type ResultType = 'stat' | 'item' | 'ability'

const TYPE_LABELS: Record<ResultType, string> = {
  stat: 'Stats',
  item: 'Items',
  ability: 'Abilities',
}

const TYPE_BADGE_VARIANT: Record<ResultType, BadgeProps['variant']> = {
  stat: 'indigo',
  item: 'blue',
  ability: 'yellow',
}

function getResultName(result: ReturnType<typeof useSearch>['results'][number]): string {
  return result.item.name
}

export function SearchOverlay() {
  const isSearchOpen = useUIStore((state) => state.isSearchOpen)
  const closeSearch = useUIStore((state) => state.closeSearch)
  const { query, setQuery, results } = useSearch()
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId)
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    } else {
      setQuery('')
    }
  }, [isSearchOpen, setQuery])

  const handleResultClick = () => {
    closeSearch()
    if (activeCampaignId && activeCharacterId) {
      navigate(`/campaigns/${activeCampaignId}/characters/${activeCharacterId}`)
    }
  }

  const grouped: Partial<Record<ResultType, typeof results>> = {}
  for (const result of results) {
    if (!grouped[result.type]) grouped[result.type] = []
    grouped[result.type]!.push(result)
  }
  const orderedTypes: ResultType[] = ['stat', 'item', 'ability']

  return (
    <div
      className={[
        'fixed inset-0 bg-slate-900 z-50 flex flex-col',
        'transition-transform duration-200',
        isSearchOpen ? 'translate-y-0' : '-translate-y-full',
      ].join(' ')}
      aria-hidden={!isSearchOpen}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 flex-shrink-0">
        <button
          type="button"
          onClick={closeSearch}
          aria-label="Close search"
          className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-800 flex-shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stats, items, abilities..."
          className="flex-1 bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:outline-none text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 transition-colors"
          autoComplete="off"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!query.trim() ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm text-center">
              Search stats, items, and abilities
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm text-center">
              No results for "{query}"
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orderedTypes.map((type) => {
              const group = grouped[type]
              if (!group || group.length === 0) return null
              return (
                <section key={type}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    {TYPE_LABELS[type]}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.map((result) => (
                      <button
                        key={result.item.id}
                        type="button"
                        onClick={handleResultClick}
                        className="bg-slate-800 rounded-lg p-3 text-left hover:bg-slate-700 transition-colors w-full flex items-center justify-between gap-3"
                      >
                        <span className="text-slate-100 text-sm font-medium truncate">
                          {getResultName(result)}
                        </span>
                        <Badge variant={TYPE_BADGE_VARIANT[result.type]} size="sm">
                          {result.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
