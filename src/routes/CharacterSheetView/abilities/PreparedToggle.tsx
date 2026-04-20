import React from 'react'
import { Toggle } from '../../../components/ui/Toggle'

export interface PreparedToggleProps {
  prepared: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function PreparedToggle({ prepared, onChange, disabled }: PreparedToggleProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Toggle
        checked={prepared}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={['text-xs', disabled ? 'text-slate-500' : 'text-slate-400'].join(' ')}>
        Prepared
      </span>
    </div>
  )
}
