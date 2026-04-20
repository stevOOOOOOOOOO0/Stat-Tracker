import React, { useState } from 'react'
import type { CurrencyDenomination } from '../../../types'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { NumberStepper } from '../../../components/ui/NumberStepper'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'
import { CurrencyDenominationRow } from './CurrencyDenominationRow'

export interface CurrencyWalletProps {
  currency: CurrencyDenomination[]
  characterId: string
}

export function CurrencyWallet({ currency, characterId }: CurrencyWalletProps) {
  const updateCurrency = useCharacterStore(s => s.updateCurrency)
  const addCurrency = useCharacterStore(s => s.addCurrency)
  const removeCurrency = useCharacterStore(s => s.removeCurrency)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addAbbr, setAddAbbr] = useState('')
  const [addAmount, setAddAmount] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const resetForm = () => {
    setAddName('')
    setAddAbbr('')
    setAddAmount(0)
    setShowAddForm(false)
  }

  const handleAdd = () => {
    const trimmedName = addName.trim()
    if (!trimmedName) return
    addCurrency(characterId, {
      id: generateId(),
      name: trimmedName,
      abbreviation: addAbbr.trim() || undefined,
      amount: addAmount,
    })
    resetForm()
  }

  const denomToDelete = confirmDeleteId ? currency.find(c => c.id === confirmDeleteId) : null

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="flex-1 text-sm font-semibold text-slate-300">Currency</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(v => !v)}
          type="button"
        >
          {showAddForm ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {/* Currency list */}
      {currency.length === 0 && !showAddForm ? (
        <p className="text-slate-500 text-sm text-center py-2">No currency denominations</p>
      ) : (
        <div className="divide-y divide-slate-700/50">
          {currency.map(denom => (
            <CurrencyDenominationRow
              key={denom.id}
              denom={denom}
              onUpdate={amount => updateCurrency(characterId, denom.id, amount)}
              onDelete={() => setConfirmDeleteId(denom.id)}
            />
          ))}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder="e.g. Gold"
            />
            <Input
              label="Abbreviation"
              value={addAbbr}
              onChange={e => setAddAbbr(e.target.value)}
              placeholder="e.g. gp"
              maxLength={6}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">Starting Amount</span>
            <NumberStepper
              value={addAmount}
              onChange={setAddAmount}
              min={0}
              size="sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleAdd}
              disabled={!addName.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) removeCurrency(characterId, confirmDeleteId)
          setConfirmDeleteId(null)
        }}
        title="Remove Currency"
        description={`Remove "${denomToDelete?.name}" from your wallet?`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  )
}
