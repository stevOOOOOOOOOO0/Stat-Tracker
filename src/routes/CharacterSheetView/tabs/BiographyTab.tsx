import React, { useState } from 'react'
import { useCharacter } from '../../../hooks/useCharacter'
import { EmptyState } from '../../../components/ui/EmptyState'
import { BiographySectionList } from '../biography/BiographySectionList'
import { NoteList } from '../biography/NoteList'
import { HistoryLog } from '../biography/HistoryLog'

type SectionKey = 'biography' | 'notes' | 'history'

export function BiographyTab() {
  const { character, activeCharacterId } = useCharacter()
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    biography: false,
    notes: false,
    history: false,
  })

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  const toggle = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const SectionHeader = ({
    label,
    sectionKey,
  }: {
    label: string
    sectionKey: SectionKey
  }) => (
    <button
      type="button"
      onClick={() => toggle(sectionKey)}
      className="w-full text-sm font-semibold text-slate-400 uppercase tracking-wide py-3 flex justify-between items-center cursor-pointer hover:text-slate-300 transition-colors"
    >
      <span>{label}</span>
      <span className="text-slate-500 text-xs">
        {collapsed[sectionKey] ? '▼' : '▲'}
      </span>
    </button>
  )

  return (
    <div className="p-4 space-y-1">
      {/* Biography */}
      <div>
        <SectionHeader label="Biography" sectionKey="biography" />
        {!collapsed.biography && (
          <BiographySectionList
            biography={character.biography}
            characterId={activeCharacterId}
          />
        )}
      </div>

      <div className="border-t border-slate-800" />

      {/* Notes */}
      <div>
        <SectionHeader label="Notes" sectionKey="notes" />
        {!collapsed.notes && (
          <NoteList
            notes={character.notes}
            characterId={activeCharacterId}
          />
        )}
      </div>

      <div className="border-t border-slate-800" />

      {/* History */}
      <div>
        <SectionHeader label="History" sectionKey="history" />
        {!collapsed.history && (
          <HistoryLog
            history={character.history}
            characterId={activeCharacterId}
          />
        )}
      </div>
    </div>
  )
}
