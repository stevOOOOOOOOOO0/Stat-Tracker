# Stat Tracker — Design Document

## Overview

Stat Tracker is a mobile-first progressive web app (PWA) for tracking character statistics, notes, and history during tabletop RPG sessions. It is intentionally system-agnostic: players define their own stats, items, abilities, and notes rather than being locked into a specific game's ruleset.

---

## Goals

- **System-agnostic** — works for D&D, Pathfinder, custom systems, or any TTRPG
- **Flexible stat engine** — stats can affect other stats through user-defined relationships
- **Full session tracking** — stats, notes, history, inventory, conditions, or anything else
- **Easy mobile interactions** — optimized for quick updates at the table
- **Offline-capable** — fully functional without an internet connection
- **Shareable** — character sheets can be shared with other players or a GM via accounts (V2)

## Non-Goals

- This app does not enforce any game's rules automatically (no spell slot validation, no RAW rulings)
- This app is not a virtual tabletop (no maps, tokens, or dice physics)

---

## Views & Navigation

```
Campaign View  (top level)
└── Character List View  (scoped to one campaign)
    └── Character Sheet View  (scoped to one character)
        ├── Editable character name (page header)
        ├── Condition chip bar
        ├── Unified draggable item list (stats, items, abilities, bio sections, notes)
        ├── History section (pinned to bottom)
        └── [+] Create FAB
```

### Campaign View

Entry point of the app. Displays all campaigns the player is part of. From here the player can create a new campaign or open the Character List.

### Character List View

Displays all characters belonging to the selected campaign. Tapping a character opens the Character Sheet View.

### Character Sheet View

The primary working view. All character content lives in a **single continuous scrollable page** — no tabs, no fixed sections.

#### Page Header

- **Back button** — returns to the Character List
- **Character name** — tap to edit inline; Enter or blur saves, Escape cancels

#### Condition Chip Bar

Active conditions are shown as chips below the header. Tapping a chip removes the condition.

#### Unified Item List

All entity types — stats, items, abilities, biography sections, and notes — live together in one flat list. The player controls the order by dragging. Any item can appear anywhere relative to any other item regardless of type.

Each list entry has a **drag handle** (≡) on the left. While dragging:
- The item is removed from its original position
- A ghost (40% opacity) appears at the current drop target
- Releasing snaps the item into place

The global order is stored in `Character.sheetOrder` (an array of entity IDs). New items not yet in `sheetOrder` appear at the end of the list.

History is not part of the draggable list — it is always pinned below everything else.

#### Create FAB

A fixed `+` button in the bottom-right opens a type picker sheet. The player chooses Stat, Item, Ability, Biography Section, or Note, and the relevant creation form opens immediately.

---

## Entity Types

### Stats

A **Stat** is a named numeric value representing any measurable attribute (e.g. HP, Strength, AC). Stats are fully user-defined.

#### Read-Only State (the list row)

Each stat row shows:

- **Drag handle** — ≡ on the left; grab to reorder
- **Name** — the stat's label
- **Derived value** — base value plus the sum of all affector contributions; shown as `value` or `value/max` when a maximum is set
- **Active affectors** — compact list of stat names currently modifying this stat's value
- **Roll Check button** — indigo, 48px tall, shown only when the stat is rollable; tapping rolls the configured dice and adds the derived value

Tapping anywhere on the row (except the drag handle and Roll Check button) opens the **Stat Popover**.

#### Roll Result Display

After a roll, the result appears inline below the stat row:

- A togglable button shows either the dice notation (`1d20`) or the raw dice total; tapping switches between them
- The modifier (`+ 5`) and final result (`= 23`) are shown alongside
- A `✕` button dismisses the result; it auto-dismisses after 30 seconds

#### Stat Popover

A centered card overlay that opens when tapping a stat row:

- Large `−` and `+` buttons to decrement/increment the base value (clamped to min/max)
- Current derived value (large, centred)
- Roll Check section (if rollable) with the same notation toggle as the row
- **Edit** button (top right) — opens the Stat Edit Sheet
- **Close** button (top right) — dismisses the popover
- Tapping the backdrop also closes the popover

#### Stat Edit Sheet (bottom sheet)

Opened via the Edit button in the Stat Popover, or when creating a new stat.

**Header row** (always visible, outside the scrollable area):
- **Left** — the stat name as an inline-editable input; tap to edit, changing it updates the draft immediately
- **Right** — "STAT" type badge

**Scrollable form fields:**
- **Base Value** — numeric input
- **Minimum** — toggle on/off; when on, exposes a numeric input for the floor value
- **Maximum** — toggle on/off; when on, exposes a numeric input for the ceiling value
- **Rollable** — toggle; when on, exposes Dice Count and Dice Type fields
- **Affected By** — list of stats that affect this stat, each with an arrow showing which field they target (Value / Minimum / Maximum); a two-step picker adds a new affector: select the stat, then select the target field
- **Affecting** — list of stats, items, and abilities this stat affects; a two-step picker adds a new entry (for stats, the target field is also selected)

**Footer** (always visible, pinned to screen bottom):
- **Delete** — removes the stat (with confirmation dialog); only shown when editing an existing stat
- **Discard** — closes without saving
- **Save** — commits all changes

**Sheet drag behaviour:**
- Drag handle is interactive; dragging resizes the sheet
- Snap points: compact (title + one field + footer), default (70vh), full (92vh)
- Dragging down collapses through snap points; dragging all the way to the bottom discards and closes
- Dragging up expands through snap points
- In all cases the footer buttons stay pinned to the screen bottom — only the content area grows or shrinks

### Items

An **Item** is a named object in a character's possession.

- Name and optional description
- Optional quantity (for consumables)
- Shown as a card with a drag handle, name, truncated description, and a `···` menu (Edit / Delete)
- Delete requires confirmation

### Abilities

An **Ability** is a named action a character can perform (e.g. a spell, a class feature).

- Name and optional description
- Shown as a card with a drag handle, name, truncated description, and a `···` menu (Edit / Delete)
- Delete requires confirmation

### Biography Sections

A **Biography Section** is a long-form text block for stable character identity information (backstory, traits, etc.).

- Inline-editable title (click to edit, Enter/blur saves)
- Collapsible body with a markdown editor
- Drag handle for reordering
- Delete button in the header row

### Notes

A **Note** is a freeform markdown text entry for in-session use.

- Title and body (markdown)
- Shown as a card with drag handle, title, 2-line body preview, and last-updated timestamp
- `···` menu opens the Note Edit Sheet (which also contains the Delete action)

### History

The **History** is an append-only event log pinned to the bottom of the character sheet, below the draggable list. It is not reorderable.

- Collapsed by default; shows the most recent entry as a preview
- Expanding shows the full log via `HistoryLog`
- Entries are created automatically on stat changes and can be added manually

---

## Bottom Sheet Interaction Model

All edit forms, creation forms, and action sheets use a shared `BottomSheet` component with consistent drag behaviour.

### Snap Points

| Point | Height | Notes |
|---|---|---|
| Compact | configurable per sheet | Optional; only enabled on specific sheets (e.g. Stat Edit) |
| Default | 70vh | Starting position when a sheet opens |
| Full | 92vh | Expanded state |

### Drag Gestures

- **Drag up** — grows the sheet height upward; footer stays pinned to screen bottom
- **Drag down** — shrinks the sheet height downward; footer stays pinned to screen bottom
- **Release above threshold** — snaps to the next snap point in that direction
- **Release near the bottom** (sheet height < 100px) — always dismisses, discarding any unsaved state
- **Tap backdrop** — dismisses the sheet

Height changes use CSS transitions (`cubic-bezier(0.32, 0.72, 0, 1)`) when snapping. During an active drag, transitions are disabled so the sheet tracks the finger precisely.

---

## Data Model

This reflects the current implemented types.

```typescript
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

type AffectTarget = 'baseValue' | 'minValue' | 'maxValue'

interface AffecteeEntry {
  id:     string       // ID of the stat/item/ability being affected
  target: AffectTarget // which field on that entity is affected
}

interface Stat {
  id:         string
  name:       string
  baseValue:  number
  minValue?:  number       // floor; undefined = no minimum
  maxValue?:  number       // ceiling; undefined = no maximum
  isRollable: boolean
  diceCount:  number       // e.g. 1
  diceType:   DiceType     // e.g. 'd20'
  affectees:  AffecteeEntry[]  // entities this stat affects, and which field
  order:      number       // per-type sort order (legacy; global order via sheetOrder)
}

// derivedValue = baseValue + sum of baseValue of all stats that have this stat in their affectees with target='baseValue'
// derivedMax   = maxValue  + sum of baseValue of all stats that have this stat in their affectees with target='maxValue'

interface Item {
  id:          string
  characterId: string
  name:        string
  description?: string
  quantity?:   number   // undefined = not a consumable
  order:       number
}

interface Ability {
  id:          string
  characterId: string
  name:        string
  description?: string
  order:       number
}

interface Note {
  id:          string
  characterId: string
  title:       string
  body:        string   // markdown
  order:       number
  createdAt:   string
  updatedAt:   string
}

interface BiographySection {
  id:    string
  title: string
  body:  string   // markdown
  order: number
}

interface Biography {
  characterId: string
  sections:    BiographySection[]
}

interface HistoryEntry {
  id:            string
  characterId:   string
  timestamp:     string
  type:          'stat_change' | 'item_used' | 'ability_used' | 'rest' | 'level_up' | 'condition_change' | 'manual'
  description:   string
  entityId?:     string
  previousValue?: number | string | boolean
  newValue?:      number | string | boolean
}

interface RestReset {
  statId:   string
  mode:     'full' | 'fixed' | 'roll'
  amount?:  number   // when mode = 'fixed'
  formula?: string   // when mode = 'roll'
}

interface RestAction {
  id:          string
  characterId: string
  name:        string   // e.g. "Short Rest"
  resets:      RestReset[]
}

interface ConditionAffector {
  statId:   string
  modifier: number | string
}

interface Condition {
  id:            string
  name:          string
  description?:  string
  affectorRules?: ConditionAffector[]
  durationType:  'rounds' | 'session' | 'permanent'
  duration?:     number
  isLibraryEntry: boolean
}

interface AppliedCondition {
  conditionId:     string
  characterId:     string
  appliedAt:       string
  remainingRounds?: number
}

interface Character {
  id:                string
  campaignId:        string
  name:              string
  avatarUrl?:        string
  ownerId?:          string
  level:             number
  stats:             Stat[]
  items:             Item[]
  abilities:         Ability[]
  restActions:       RestAction[]
  appliedConditions: AppliedCondition[]
  biography:         Biography
  notes:             Note[]
  history:           HistoryEntry[]
  sheetOrder?:       string[]  // global display order across all entity types by ID
  createdAt:         string
  updatedAt:         string
}
```

### `sheetOrder`

`Character.sheetOrder` is the single source of truth for display order in the unified list. It is an array of entity IDs spanning all types (stats, items, abilities, biography sections, notes). When an item's ID is not present in `sheetOrder` (e.g. newly created), it appears at the end of the list sorted by its per-type `order` field. On drag-and-drop reorder, `sheetOrder` is updated with the full new sequence.

---

## Architecture

### Frontend

| Concern        | Choice               | Rationale                                             |
|----------------|----------------------|-------------------------------------------------------|
| Framework      | React 19 + Vite      | Fast DX, great ecosystem, works well as PWA           |
| Styling        | Tailwind CSS v4      | Mobile-first utility classes, fast iteration          |
| State          | Zustand              | Lightweight, simple, works well with local-first data |
| Local storage  | Dexie.js (IndexedDB) | Offline persistence, handles large data sets          |
| PWA            | vite-plugin-pwa      | Generates service worker and manifest automatically   |
| Routing        | React Router v7      | Standard, supports nested routes for character views  |

### Backend (V2)

| Concern       | Choice          | Rationale                                               |
|---------------|-----------------|---------------------------------------------------------|
| Platform      | Supabase        | Auth + Postgres + Realtime in one, generous free tier   |
| Auth          | Supabase Auth   | Email/OAuth, integrates with sharing model              |
| Database      | Postgres        | Relational model fits character ownership and sharing   |
| Realtime      | Supabase Realtime | Live sync for shared character sheets                 |
| Sync strategy | Local-first, sync on reconnect | Offline takes priority; conflicts resolved by timestamp |

### Offline Strategy

1. All data is written to IndexedDB first (the source of truth offline)
2. When online, changes are synced to Supabase in the background
3. Conflict resolution: last-write-wins per character (timestamps compared)
4. A sync status indicator shows the user if they have unsynced changes

---

## UI / UX Principles

- **Thumb-friendly** — all primary actions reachable without two-handed use; Roll Check is 48px tall
- **Progressive disclosure** — simple values visible at a glance; editing is one tap deeper via popovers and bottom sheets
- **Non-destructive** — history log means no changes are ever truly lost; destructive actions (delete, dismiss-to-discard) require deliberate gestures
- **Dark mode first** — default to dark theme; dim game tables make dark mode the expected environment
- **Flexible layout** — the unified draggable list lets each player organise their sheet the way that suits their playstyle, rather than enforcing a rigid section order

---

## Feature Status

### Built

- [x] Campaign view: create and manage campaigns (local, no account required)
- [x] Character list view: see all characters within a campaign
- [x] Create and manage characters
- [x] Editable character name inline in the page header
- [x] Custom stats: base value, optional min/max, rollable toggle, dice configuration
- [x] Stat-to-stat affector relationships with per-field targeting (value / minimum / maximum)
- [x] Stat popover: large +/− buttons, roll section, edit shortcut
- [x] Roll Check button with togglable dice-notation / raw-total display
- [x] Unified draggable character sheet: all entity types in one reorderable list
- [x] Drag-and-drop with ghost preview and source-slot removal
- [x] Stat edit sheet: inline-editable name in header, compact/default/full snap points, footer pinned to screen bottom
- [x] Items: name, description, quantity, drag reorder, edit/delete
- [x] Abilities: name, description, drag reorder, edit/delete
- [x] Biography sections: inline title editing, collapsible markdown body, drag reorder
- [x] Notes: title, markdown body, drag reorder, edit/delete
- [x] History log: auto-generated on stat changes, pinned below the draggable list
- [x] Condition library: apply conditions as chips, conditions can carry stat affector rules
- [x] Rest actions: one-tap batch stat resets
- [x] Bottom sheet: drag handle resizes sheet; footer always pinned to screen bottom; drag to floor dismisses
- [x] Dice calculator overlay: quick dice buttons, formula input, roll history
- [x] Dark mode
- [x] Full offline support (PWA)

### Planned (V2+)

- [ ] User accounts (email/password or OAuth)
- [ ] Cloud sync across devices
- [ ] Campaign sharing via invite code
- [ ] Party member characters in read-only view
- [ ] Party health overview: live HP and conditions for all party members
- [ ] Initiative tracker: GM-managed shared turn order
- [ ] Real-time sync (edits appear live for all party members)
- [ ] Session notes: campaign-level shared notes
- [ ] Quick-access bar: auto-surfaces most-used stats/abilities/items
- [ ] Search: scoped to open character or campaign
- [ ] Data export (JSON)
- [ ] Template library for common systems (D&D 5e, PF2e, etc.)

---

## Open Questions

1. **Conflict resolution** — if two players edit the same shared character simultaneously, how do we merge?
2. **Formula safety** — if roll expressions are added to items/abilities, how do we evaluate user-defined formulas safely?
3. **History retention** — do we keep the full history forever, or allow the user to archive/clear it?
4. **Avatar storage** — local blob in IndexedDB, or require an account to upload to cloud storage?
5. **Template system** — should templates be user-created, bundled, or community-hosted?

---

## Milestones

| Milestone | Scope |
|---|---|
| **M1 — Local MVP** | Campaigns, characters, custom stats with affectors, items, abilities, offline PWA ✓ |
| **M2 — Character Depth** | Rest actions, biography, condition library, notes, history ✓ |
| **M3 — Polish & Interactions** | Unified draggable list, stat popover, roll checks, bottom sheet gestures, inline editing ✓ |
| **M4 — Accounts & Sync** | User accounts, cloud sync, multi-device support |
| **M5 — Party Features** | Campaign sharing, read-only party view, party health overview, initiative tracker, real-time sync |
| **M6 — Discovery** | Search, quick-access bar, templates, import/export |
