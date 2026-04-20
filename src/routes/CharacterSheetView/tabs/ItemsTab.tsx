import React from 'react'
import { useCharacter } from '../../../hooks/useCharacter'
import { EmptyState } from '../../../components/ui/EmptyState'
import { CurrencyWallet } from '../items/CurrencyWallet'
import { ItemList } from '../items/ItemList'

export function ItemsTab() {
  const { character, activeCharacterId } = useCharacter()

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Currency section */}
      <CurrencyWallet currency={character.currency} characterId={activeCharacterId} />

      <div className="border-t border-slate-700/50" />

      {/* Items section */}
      <ItemList
        items={character.items}
        stats={character.stats}
        characterId={activeCharacterId}
      />
    </div>
  )
}
