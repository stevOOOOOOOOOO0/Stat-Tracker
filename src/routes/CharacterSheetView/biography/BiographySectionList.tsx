import React from 'react'
import type { Biography, BiographySection } from '../../../types'
import { useCharacterStore } from '../../../store/characterStore'
import { SortableList } from '../../../components/shared/SortableList'
import { Button } from '../../../components/ui/Button'
import { generateId } from '../../../lib/ids'
import { BiographySectionEditor } from './BiographySectionEditor'

export interface BiographySectionListProps {
  biography: Biography
  characterId: string
}

export function BiographySectionList({ biography, characterId }: BiographySectionListProps) {
  const updateBiography = useCharacterStore((s) => s.updateBiography)

  const sortedSections = [...biography.sections].sort((a, b) => a.order - b.order)

  const handleUpdate = (updated: BiographySection) => {
    const sections = biography.sections.map((s) =>
      s.id === updated.id ? updated : s
    )
    updateBiography(characterId, { ...biography, sections })
  }

  const handleDelete = (id: string) => {
    const sections = biography.sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i }))
    updateBiography(characterId, { ...biography, sections })
  }

  const handleReorder = (newSections: BiographySection[]) => {
    const sections = newSections.map((s, i) => ({ ...s, order: i }))
    updateBiography(characterId, { ...biography, sections })
  }

  const handleAdd = () => {
    const nextOrder = biography.sections.length
    const newSection: BiographySection = {
      id: generateId(),
      title: 'New Section',
      body: '',
      order: nextOrder,
    }
    updateBiography(characterId, {
      ...biography,
      sections: [...biography.sections, newSection],
    })
  }

  return (
    <div>
      {sortedSections.length === 0 ? (
        <p className="text-slate-500 text-sm py-2">
          No biography sections. Add one to describe your character.
        </p>
      ) : (
        <SortableList
          items={sortedSections}
          keyExtractor={(s) => s.id}
          onReorder={handleReorder}
          renderItem={(section, _idx, dragHandleProps) => (
            <BiographySectionEditor
              key={section.id}
              section={section}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(section.id)}
              dragHandleProps={dragHandleProps}
            />
          )}
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        className="mt-1"
      >
        + Add Section
      </Button>
    </div>
  )
}
