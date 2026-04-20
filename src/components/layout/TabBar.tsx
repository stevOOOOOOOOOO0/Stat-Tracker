import React from 'react'

export interface TabBarTab {
  label: string
}

export interface TabBarProps {
  tabs: TabBarTab[]
  activeIndex: number
  onChange: (i: number) => void
}

export function TabBar({ tabs, activeIndex, onChange }: TabBarProps) {
  return (
    <div className="bg-slate-900 border-b border-slate-700 flex overflow-x-auto scrollbar-none">
      {tabs.map((tab, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={[
            'px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors',
            i === activeIndex
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-300',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
