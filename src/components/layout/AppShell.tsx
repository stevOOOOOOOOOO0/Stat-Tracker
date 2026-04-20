import React from 'react'
import { OfflineBanner } from '../ui/OfflineBanner'
import { DiceCalculatorButton } from '../overlays/DiceCalculatorButton'

export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <OfflineBanner />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <DiceCalculatorButton />
    </div>
  )
}
