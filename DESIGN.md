# Stat Tracker — Design Document

## Overview

Stat Tracker is a mobile-first progressive web app (PWA) for tracking character statistics, notes, and history during tabletop RPG sessions. It is intentionally system-agnostic: players define their own stats, formulas, and relationships rather than being locked into a specific game's ruleset.

---

## Goals

- **System-agnostic** — works for D&D, Pathfinder, custom systems, or any TTRPG
- **Flexible stat engine** — stats can affect other stats through user-defined formulas
- **Full session tracking** — stats, notes, history, inventory, conditions, or anything else
- **Easy mobile interactions** — optimized for quick updates at the table
- **Offline-capable** — fully functional without an internet connection
- **Shareable** — character sheets can be shared with other players or a GM via accounts

## Non-Goals

- This app does not enforce any game's rules automatically (no spell slot validation, no RAW rulings)
- This app is not a virtual tabletop (no maps, tokens, or dice physics)

## Key Capabilities

- Users can create entire characters from scratch with custom stats organized into named stat blocks for easy viewing and editing

### Stats

A **Stat** is a named integer value that represents a measurable attribute of a character (e.g. Strength, Armor Class, Max HP). Stats have:

- A **current value** — the live value during play, modified freely during a session
- A **minimum** — a floor the value cannot drop below (typically 0, but configurable)
- A **maximum** — a ceiling the value cannot exceed (can be a fixed number or a formula referencing other stats)
- An optional **affector list** — other stats whose values automatically recalculate this stat when they change

Players can tap a stat to increment, decrement, or directly set its value. All changes are recorded in the History log.

### Items

An **Item** is a named object in a character's possession that can produce a result when used (e.g. a sword, a potion, a wand). Items have:

- A **name** and optional description
- One or more **roll expressions** — dice formulas that define what the item does (e.g. `1d8 + STR_Modifier` for damage)
- An **affector list** — stats or other items that modify the roll result (e.g. a magic sword might add an Enchantment Bonus stat)
- An optional **quantity** — for consumable items (e.g. arrows, potions)

When an item is used, the app evaluates its roll expression with all active affectors applied and optionally records the result in History.

### Abilities

An **Ability** is a named action a character can perform (e.g. a spell, a class feature, a special attack). Abilities have:

- A **name** and optional description
- One or more **roll expressions** — dice formulas for the ability's effect (e.g. `2d6 + Spellcasting_Modifier` for a fireball)
- An **affector list** — stats or items that modify the roll (e.g. a Spell Power stat could add to all spell rolls)
- An optional **resource cost** — links to a resource stat that is decremented on use (e.g. using a spell slot ability reduces the Spell Slots stat)
- An optional **recharge condition** — notes when the ability refreshes (e.g. "Short rest", "Long rest", "Recharges on 5–6")

When an ability is used, the roll is evaluated with affectors applied, any linked resource is decremented, and the event is recorded in History.

### Currency

A **Currency** wallet holds one or more named denominations defined by the player (e.g. Gold / Silver / Copper, or Credits, or simply "Gold"). Each denomination has:

- A **name** and optional abbreviation
- A **current amount** (integer, adjustable with +/- or direct entry)
- An optional **conversion rate** to another denomination (e.g. 1 Gold = 100 Copper)

Currency is displayed as its own section within the Items & Currency tab. Changes are recorded in History.

### Rest & Recovery

**Rest Actions** are one-tap buttons that trigger a batch reset of multiple stats simultaneously. Each rest action has:

- A **name** (e.g. "Short Rest", "Long Rest", "Full Recovery")
- A **list of stat resets** — each entry specifies a target stat and how to restore it: restore to maximum, restore by a fixed amount, or restore by a roll expression (e.g. `1d6 + CON_Modifier`)

When triggered, all resets are applied at once and a single History entry is logged summarizing what was recovered.

### Experience & Leveling

Each character can optionally track progression:

- **Current XP** and a configurable **XP threshold** for the next level
- **Current Level** as a base stat (can be referenced by formulas in other stats)
- A **level-up notification** when XP reaches or exceeds the threshold
- Support for **milestone leveling** (manual level-up with no XP tracking)

Level changes are recorded as notable History events.

### Character Biography

A **Biography** is a structured set of long-form text fields attached to a character. Sections are fully customizable but common defaults include:

- Backstory
- Personality Traits
- Bonds
- Flaws & Ideals
- Appearance

Biography lives in the Biography, Notes & History tab and is intended for stable character identity information, separate from in-session notes.

### Quick-Access Bar

The **Quick-Access Bar** automatically tracks interaction frequency across all stats, abilities, and items. The 4 most frequently used entries are surfaced as large tap targets at the top of the Character Sheet View, always visible regardless of which tab is active.

- Frequency is tracked locally per character (tap count per item)
- The bar updates in real time as usage patterns change
- The player can manually pin or unpin entries to override the automatic selection

### Status Condition Library

The **Condition Library** is a pre-seeded list of common conditions the player can apply with one tap instead of typing from scratch. Each condition entry has:

- A name (e.g. Poisoned, Prone, Frightened, Concentrating)
- An optional set of stat affector rules active while the condition is applied
- An optional duration (number of rounds, or session-scoped)

The library comes with common conditions for popular systems pre-loaded and can be extended with custom entries. Applied conditions appear as chips on the character card and in the party health overview.

### Session Notes

**Session Notes** are campaign-level notes shared with all members of a campaign. Unlike per-character notes, they belong to the campaign itself and are visible to everyone. Common uses include GM summaries, shared lore, handouts, and quest tracking. Each session note has a title, body (markdown), tags, and a session label.

### Party Health Overview

A compact, read-only panel showing the live status of all characters in a campaign. For each character it displays HP (current/max), active conditions, and any stats the character owner marks as "party-visible". Updated in real time when online.

### Initiative Tracker

A shared ordered list managed by the GM that shows whose turn it is during combat. Features:

- Add characters (from the party) or custom entries (for monsters/NPCs) to the order
- Reorder by drag or by entering initiative values
- Step through turns with a single tap; the current turn is highlighted for all viewers
- Round counter increments automatically

---

## Views & Navigation

The app is organized into four levels of navigation. A persistent **Dice Calculator** overlay is accessible from any level.

```
Campaign View  (top level)
└── Character List View  (scoped to one campaign)
    ├── Party Health Overview  (compact HP/condition snapshot for all members)
    ├── Initiative Tracker  (GM-managed turn order, visible to all)
    └── Character Sheet View  (scoped to one character)
        ├── Quick-Access Bar  (auto-pinned: 4 most-used stats/abilities/items)
        ├── Stats tab
        ├── Items & Currency tab
        ├── Abilities tab
        └── Biography, Notes & History tab

[Dice Calculator]  — floating button, accessible from every view
[Search]  — accessible from every view, scopes to open character or campaign
```

### Campaign View

The entry point of the app. Displays all campaigns the player is currently part of, each shown as a card with:

- Campaign name and optional cover image
- TTRPG system label (e.g. "D&D 5e")
- Player count and the user's character name within that campaign
- Last-updated timestamp

From here the player can create a new campaign, join an existing one via invite code, or tap a campaign to open the Character List.

### Character List View

Displays all characters belonging to the selected campaign. Characters are split into two groups:

| Group | Description |
|---|---|
| **My Characters** | Characters owned by the current user — fully editable |
| **Party Members** | Characters owned by other players in the campaign — read-only |

Each character card shows a quick summary (name, class/role, key resource stats like HP). Tapping a character opens the Character Sheet View.

A **Party Health Overview** panel is accessible from this view. It shows all party members' HP, active conditions, and any stats the GM marks as "party-visible" in a compact at-a-glance layout — useful during combat for both the GM and players watching their allies.

An **Initiative Tracker** panel is also accessible here. The GM sets and reorders the initiative list; all party members see the current turn order in real time.

### Character Sheet View

The primary working view. Organized into tabs so the player can focus on one concern at a time:

| Tab | Contents |
|---|---|
| **Stats** | All stat blocks; tap any stat to edit, increment, or decrement |
| **Items & Currency** | Item list plus currency wallet; tap items to use, edit, or adjust quantity |
| **Abilities** | Ability list; tap to use (rolls, resource deduction, prepared toggle) or edit |
| **Biography, Notes & History** | Character biography, freeform notes with tags, and the append-only event log |

A **Quick-Access Bar** sits above the tabs and always remains visible. It auto-populates with the 4 stats, abilities, or items the player has interacted with most frequently. Tapping a quick-access entry fires that item's primary action immediately (increment/decrement for stats, roll for items and abilities) without navigating to its tab.

When viewing another player's character (read-only), all edit controls are hidden. The owner's edits appear live if the device is online.

### Dice Calculator

A floating action button available at every level of the app opens the Dice Calculator as a bottom sheet (does not navigate away from the current view). It supports:

- **Quick dice buttons** — one-tap rolls for common dice: d4, d6, d8, d10, d12, d20, d100
- **Formula input** — type any expression (e.g. `2d6 + 5`, `4d4 - STR_Modifier`) and evaluate it
- **Roll history** — a short log of recent rolls within the current session
- **Stat references** — if a character sheet is open, the formula can reference that character's stats by name

The calculator is purely a convenience tool; rolls made here are not automatically recorded in a character's History unless the user chooses to save the result.

---

## User Personas

| Persona         | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| **Player**      | Tracks their own character's stats, notes, and resources during a session          |
| **GM / DM**     | Views all party character sheets in read-only mode; may edit if granted permission |
| **Solo Player** | Uses the app offline with no account, purely local                                 |

---

## Core Concepts

### Campaigns

A **Campaign** is the top-level container grouping a set of characters into one game. Each campaign has:

- A name, optional cover image, and TTRPG system label
- An **owner** (typically the GM) and a list of **member players**
- A collection of Characters (one or more per player)
- An invite code or shareable link for adding new members

Characters belong to exactly one campaign. A player can be a member of multiple campaigns simultaneously.

### Characters

A **Character** belongs to a Campaign and is owned by one player. Each character has:

- A name and optional avatar/portrait
- A TTRPG system label (free text, e.g. "D&D 5e", "Custom")
- A collection of Stat Blocks, Notes, and History entries
- An owner account and optional list of shared viewers/editors

### Stats

A **Stat** is any named numeric or text value on a character sheet. Stats are fully user-defined and fall into the following categories:

| Category   | Description                             | Examples                              |
| ---------- | --------------------------------------- | ------------------------------------- |
| `base`     | Raw value set directly by the user      | Strength: 18, Max HP: 45              |
| `derived`  | Computed from other stats via a formula | STR Modifier: `floor((STR - 10) / 2)` |
| `resource` | Has a current and max value, depletable | HP: 30/45, Spell Slots: 2/3           |
| `text`     | Free text field                         | Class: "Paladin", Alignment: "LG"     |
| `boolean`  | True/false toggle                       | Concentration: true                   |

#### Stat Affector System

Stats can declare **affectors**: other stats that influence their value. This forms a dependency graph.

**Example dependency:**

```
Strength (base) = 18
  → STR Modifier (derived) = floor((18 - 10) / 2) = 4
    → Longsword Attack Bonus (derived) = STR Modifier + Proficiency Bonus
    → Longsword Damage (derived) = 1d8 + STR Modifier
```

When any stat in the graph changes, all downstream stats are recalculated automatically.

**Formula syntax** (to be finalized during implementation):

- Reference other stats by name: `STR`, `Proficiency Bonus`
- Math operations: `+`, `-`, `*`, `/`, `floor()`, `ceil()`, `round()`, `max()`, `min()`
- Dice notation (for display only, not auto-rolled): `1d8`, `2d6`
- Conditional: `if(CON > 15, 2, 1)`

Circular dependencies are detected and rejected at the time of creation.

### Stat Blocks

A **Stat Block** is a named grouping of stats displayed together, e.g. "Ability Scores", "Combat", "Spellcasting". Users can create, rename, and reorder blocks freely.

### Notes

**Notes** are freeform markdown text entries attached to a character. Each note has:

- A title
- Body (markdown)
- Tags (e.g. "quest", "NPC", "reminder")
- A timestamp

### History / Event Log

The **History** is an append-only log of events on a character. Entries are created:

- Automatically when a stat changes (e.g. "HP changed from 45 → 32")
- Manually by the user (e.g. "Took a short rest, recovered 2 spell slots")

History entries include a timestamp and an optional note.

### Conditions / Tags

**Conditions** are temporary boolean or stacked states attached to a character (e.g. Poisoned, Frightened, Concentrating). Conditions are applied from a **Condition Library** — a pre-seeded list of common conditions that can be extended with custom entries. Each condition can optionally:

- Modify a stat via an affector rule while active
- Have a duration (number of rounds, or session-scoped)
- Appear as a visible chip on the character card and in the Party Health Overview

### Currency

See [Key Capabilities — Currency](#currency) for full details. Currency denominations are character-defined; conversion rates between denominations are optional.

### Rest & Recovery

See [Key Capabilities — Rest & Recovery](#rest--recovery) for full details. Rest actions are character-defined batch resets that fire with a single tap.

### Experience & Leveling

See [Key Capabilities — Experience & Leveling](#experience--leveling) for full details. Level is a first-class stat referenceable in other formulas.

### Biography

See [Key Capabilities — Character Biography](#character-biography) for full details. Biography sections are customizable long-form text fields for stable character identity information.

### Session Notes

See [Key Capabilities — Session Notes](#session-notes) for full details. Campaign-level shared notes visible to all party members.

### Party Health Overview

See [Key Capabilities — Party Health Overview](#party-health-overview) for full details. A real-time read-only snapshot of all party members' HP and conditions.

### Initiative Tracker

See [Key Capabilities — Initiative Tracker](#initiative-tracker) for full details. A GM-managed shared turn order visible to the whole party.

---

## Feature List

### MVP Features

- [ ] Campaign view: create and manage campaigns (local, no account required)
- [ ] Character list view: see all characters within a campaign
- [ ] Create and manage characters with full edit access
- [ ] Create custom stats in any category (base, derived, resource, text, boolean)
- [ ] Define stat affectors and see downstream stats update live
- [ ] Organize stats into named stat blocks
- [ ] Quick-edit stats from the character sheet view (tap to edit)
- [ ] Increment/decrement resource stats with +/- buttons
- [ ] Create and manage items with roll expressions and affectors
- [ ] Currency wallet: custom denominations with optional conversion rates
- [ ] Create and manage abilities with roll expressions, resource costs, and recharge conditions
- [ ] Prepared/unprepared toggle on abilities
- [ ] Rest & recovery actions: one-tap batch stat resets (short rest, long rest, etc.)
- [ ] Experience and level tracking with configurable XP thresholds; milestone leveling option
- [ ] Character biography with customizable long-form sections
- [ ] Add freeform notes with titles and tags
- [ ] Session notes: campaign-level shared notes
- [ ] Auto-generated history log for stat changes, ability/item use, rest actions, and level-ups
- [ ] Manual history entries
- [ ] Condition library: pre-seeded common conditions, apply with one tap, custom conditions supported
- [ ] Quick-access bar: auto-surfaces the 4 most-used stats/abilities/items; manual pin/unpin override
- [ ] Dice calculator: quick dice buttons and formula input, accessible from every view
- [ ] Search: scoped to open character or campaign
- [ ] Dark mode
- [ ] Full offline support (PWA, no network required)
- [ ] Data export (JSON download of a character)

### V2 Features

- [ ] User accounts (email/password or OAuth)
- [ ] Cloud sync of characters and campaigns across devices
- [ ] Invite flow: share campaign via link or code
- [ ] Party member characters visible in read-only within the Character List
- [ ] Party health overview: live HP and conditions for all party members
- [ ] Initiative tracker: GM-managed shared turn order with round counter
- [ ] Real-time sync (edits appear live for all party members)
- [ ] Dice calculator stat references: formulas can reference the currently open character's stats

### Stretch Goals

- [ ] Template library: pre-built character sheet layouts for common systems (D&D 5e, PF2e, etc.)
- [ ] Import from D&D Beyond / other platforms
- [ ] Avatar / cover image uploads to cloud storage

---

## Data Model (Draft)

```typescript
interface Campaign {
  id: string;
  name: string;
  system: string;         // free text, e.g. "D&D 5e"
  coverImageUrl?: string;
  ownerId?: string;       // GM; null if no account
  memberIds: string[];    // player user IDs
  inviteCode?: string;
  characterIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Item {
  id: string;
  characterId: string;
  name: string;
  description?: string;
  rollExpressions: RollExpression[];
  affectorIds: string[];  // stat or item IDs that modify rolls
  quantity?: number;      // undefined = not a consumable
  order: number;
}

interface Ability {
  id: string;
  characterId: string;
  name: string;
  description?: string;
  rollExpressions: RollExpression[];
  affectorIds: string[];    // stat or item IDs that modify rolls
  resourceCostStatId?: string; // stat decremented on use
  resourceCostAmount?: number;
  rechargeCondition?: string; // e.g. "Long rest", "Recharges on 5–6"
  prepared: boolean;        // unprepared abilities are hidden by default
  order: number;
}

interface RollExpression {
  label: string;          // e.g. "Attack", "Damage"
  formula: string;        // e.g. "1d8 + STR_Modifier"
}

type StatCategory = "base" | "derived" | "resource" | "text" | "boolean";

interface Stat {
  id: string;
  name: string;
  category: StatCategory;
  value: number | string | boolean;
  // For resource stats
  currentValue?: number;
  maxValue?: number | string; // can be a formula
  // For derived stats
  formula?: string; // e.g. "floor((STR - 10) / 2)"
  affectors?: string[]; // stat IDs this stat depends on
  // Display
  blockId: string;
  order: number;
  description?: string;
}

interface StatBlock {
  id: string;
  characterId: string;
  name: string;
  order: number;
  statIds: string[];
}

interface Note {
  id: string;
  characterId: string;
  title: string;
  body: string; // markdown
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

interface HistoryEntry {
  id: string;
  characterId: string;
  timestamp: string;
  type: "stat_change" | "item_used" | "ability_used" | "rest" | "level_up" | "condition_change" | "currency_change" | "manual";
  description: string;
  entityId?: string;        // stat, item, ability, or condition ID
  previousValue?: number | string | boolean;
  newValue?: number | string | boolean;
}

interface CurrencyDenomination {
  id: string;
  name: string;
  abbreviation?: string;
  amount: number;
  conversionToId?: string;  // ID of the denomination this converts into
  conversionRate?: number;  // e.g. 100 (meaning 100 of this = 1 of conversionToId)
}

interface RestAction {
  id: string;
  characterId: string;
  name: string;             // e.g. "Short Rest", "Long Rest"
  resets: RestReset[];
}

interface RestReset {
  statId: string;
  mode: "full" | "fixed" | "roll";
  amount?: number;          // used when mode = "fixed"
  formula?: string;         // used when mode = "roll", e.g. "1d6 + CON_Modifier"
}

interface Condition {
  id: string;
  name: string;
  description?: string;
  affectorRules?: ConditionAffector[];
  durationType: "rounds" | "session" | "permanent";
  duration?: number;        // number of rounds, if durationType = "rounds"
  isLibraryEntry: boolean;  // true = part of the shared condition library
}

interface ConditionAffector {
  statId: string;
  modifier: number | string; // fixed number or formula
}

interface AppliedCondition {
  conditionId: string;
  characterId: string;
  appliedAt: string;        // ISO timestamp
  remainingRounds?: number;
}

interface Biography {
  characterId: string;
  sections: BiographySection[];
}

interface BiographySection {
  id: string;
  title: string;            // e.g. "Backstory", "Personality Traits"
  body: string;             // markdown
  order: number;
}

interface SessionNote {
  id: string;
  campaignId: string;
  title: string;
  body: string;             // markdown
  tags: string[];
  sessionLabel?: string;    // e.g. "Session 12"
  createdAt: string;
  updatedAt: string;
}

interface InitiativeEntry {
  id: string;
  label: string;            // character name or custom NPC label
  characterId?: string;     // set if linked to a party character
  initiativeValue: number;
  isActive: boolean;        // true = current turn
}

interface InitiativeTracker {
  campaignId: string;
  round: number;
  entries: InitiativeEntry[];
  updatedAt: string;
}

interface UsageRecord {
  entityId: string;         // stat, item, or ability ID
  entityType: "stat" | "item" | "ability";
  count: number;
  isPinned: boolean;        // manual pin overrides auto-selection
}

interface Character {
  id: string;
  campaignId: string;
  name: string;
  avatarUrl?: string;
  ownerId?: string;         // null if no account (local-only)
  level: number;
  currentXp: number;
  xpThreshold?: number;     // null = milestone leveling
  currency: CurrencyDenomination[];
  statBlocks: StatBlock[];
  stats: Stat[];
  items: Item[];
  abilities: Ability[];
  restActions: RestAction[];
  appliedConditions: AppliedCondition[];
  biography: Biography;
  notes: Note[];
  history: HistoryEntry[];
  usageRecords: UsageRecord[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Architecture

### Frontend

| Concern        | Choice                  | Rationale                                             |
| -------------- | ----------------------- | ----------------------------------------------------- |
| Framework      | React + Vite            | Fast DX, great ecosystem, works well as PWA           |
| Styling        | Tailwind CSS            | Mobile-first utility classes, fast iteration          |
| State          | Zustand                 | Lightweight, simple, works well with local-first data |
| Local storage  | Dexie.js (IndexedDB)    | Offline persistence, handles large data sets          |
| PWA            | vite-plugin-pwa         | Generates service worker and manifest automatically   |
| Routing        | React Router v7         | Standard, supports nested routes for character views  |
| Formula engine | mathjs or custom parser | Safe expression evaluation for derived stats          |

### Backend (V2)

| Concern       | Choice                         | Rationale                                               |
| ------------- | ------------------------------ | ------------------------------------------------------- |
| Platform      | Supabase                       | Auth + Postgres + Realtime in one, generous free tier   |
| Auth          | Supabase Auth                  | Email/OAuth, integrates with sharing model              |
| Database      | Postgres (via Supabase)        | Relational model fits character ownership and sharing   |
| Realtime      | Supabase Realtime              | Live sync for shared character sheets                   |
| Sync strategy | Local-first, sync on reconnect | Offline takes priority; conflicts resolved by timestamp |

### Offline Strategy

1. All data is written to IndexedDB first (the source of truth offline)
2. When online, changes are synced to Supabase in the background
3. Conflict resolution: last-write-wins per stat (timestamps compared)
4. A sync status indicator shows the user if they have unsynced changes

---

## UI / UX Principles

- **Thumb-friendly** — all primary actions reachable without two-handed use
- **Fast edits** — tapping a stat immediately opens an inline edit, no modal required for simple changes
- **Glanceable** — the character sheet overview shows all critical stats at once without scrolling
- **Non-destructive** — history log means no changes are ever truly lost
- **Dark mode first** — default to dark theme; dim game tables make dark mode the expected environment
- **Progressive disclosure** — simple values are visible at a glance; details (formulas, affectors, descriptions) are one tap deeper

---

## Open Questions

1. **Formula safety** — how do we evaluate user-defined formulas safely? (sandboxed eval vs. a parser library)
2. **Conflict resolution** — if two players edit the same shared character simultaneously, how do we merge?
3. **Template system** — should templates be user-created, bundled, or community-hosted?
4. **Avatar storage** — local blob in IndexedDB, or require an account to upload to cloud storage?
5. **History retention** — do we keep the full history forever, or allow the user to archive/clear it?

---

## Milestones

| Milestone | Scope |
|---|---|
| **M1 — Local MVP** | Campaigns, characters, custom stats with affectors, items, abilities, offline PWA |
| **M2 — Character Depth** | Currency, rest actions, XP/leveling, biography, condition library |
| **M3 — Session Tools** | Notes & history, session notes, quick-access bar, search, dice calculator, dark mode |
| **M4 — Accounts & Sync** | User accounts, cloud sync, multi-device support |
| **M5 — Party Features** | Campaign sharing, read-only party view, party health overview, initiative tracker, real-time sync |
| **M6 — Polish** | Templates, import/export, avatar uploads, dice calculator stat references |
