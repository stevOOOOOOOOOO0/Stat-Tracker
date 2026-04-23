import React from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { Character } from '../../types/character'
import type { Stat } from '../../types/stat'

export interface CharacterCardProps {
  character: Character
  isOwner: boolean
  onClick: () => void
}

function findHpStat(stats: Stat[]): Stat | undefined {
  return stats.find(s => s.name.toLowerCase().includes('hp') || s.name.toLowerCase().includes('hit points'))
}

export function CharacterCard({ character, isOwner, onClick }: CharacterCardProps) {
  const hpStat = findHpStat(character.stats)
  const visibleConditions = character.appliedConditions.slice(0, 3)
  const extraConditions = character.appliedConditions.length - 3

  return (
    <Card onClick={onClick} pressable className="mb-0">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {character.avatarUrl ? (
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 flex-shrink-0 select-none">
            {character.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + level */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100 truncate">{character.name}</span>
            <Badge variant="indigo" size="sm">
              Lv.{character.level}
            </Badge>
            {!isOwner && (
              <span className="text-slate-500 text-xs">(read-only)</span>
            )}
          </div>

          {hpStat && (
            <p className="text-sm text-slate-300 mt-0.5">❤️ {hpStat.baseValue}</p>
          )}

          {/* Conditions */}
          {visibleConditions.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {visibleConditions.map((ac) => (
                <Badge key={ac.conditionId} variant="red" size="sm">
                  {ac.conditionId}
                </Badge>
              ))}
              {extraConditions > 0 && (
                <Badge variant="red" size="sm">
                  +{extraConditions}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
