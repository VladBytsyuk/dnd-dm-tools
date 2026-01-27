# CLAUDE.md

This document provides context for AI assistants working with the DnD DM Tools Obsidian plugin codebase.

## Project Overview

DnD DM Tools is an [Obsidian](https://obsidian.md/) plugin providing Dungeon Master tools for D&D 5th Edition. The plugin UI is in Russian. Current version: **0.7.0**.

**Core Features:**
- **Bestiary** - Creature statblocks with editing capabilities
- **Spellbook** - Spell reference and management
- **Initiative Tracker** - Combat encounter tracking with conditions
- **DM Screen** - Quick reference to D&D 5e rules
- **Arsenal** - Weapons database
- **Armory** - Armor database
- **Equipment** - General equipment items
- **Artifactory** - Magic items
- **Backgrounds** - Character backgrounds
- **Feats** - Character feats

## Tech Stack

- **Language:** TypeScript 5.9
- **UI Framework:** Svelte 5.38
- **Plugin API:** Obsidian
- **Database:** SQL.js (in-memory SQLite with WASM)
- **Build Tool:** esbuild with esbuild-svelte
- **Testing:** Vitest with Testing Library
- **Package Manager:** npm

## Project Structure

```
dnd-dm-tools/
├── src/                          # Source code
│   ├── main.ts                   # Plugin entry point (DndStatblockPlugin)
│   ├── domain/                   # Business logic layer
│   │   ├── models/               # Domain entities by type
│   │   │   ├── common/           # Shared types (Ability, Damage, Rarity, etc.)
│   │   │   ├── monster/          # SmallMonster, FullMonster, BestiaryFilters
│   │   │   ├── spell/            # SmallSpell, FullSpell, SpellbookFilters
│   │   │   ├── weapon/           # SmallWeapon, FullWeapon, ArsenalFilters
│   │   │   ├── armor/            # SmallArmor, FullArmor, ArmoryFilters
│   │   │   ├── items/            # SmallItem, FullItem, EquipmentFilters
│   │   │   ├── artifact/         # SmallArtifact, FullArtifact
│   │   │   ├── background/       # SmallBackground, FullBackground
│   │   │   ├── feat/             # SmallFeat, FullFeat
│   │   │   ├── dm_screen/        # DmScreenItem
│   │   │   └── encounter/        # Encounter, EncounterParticipant
│   │   ├── repositories/         # Repository interfaces
│   │   ├── listeners/            # Event handling interfaces
│   │   └── utils/                # Utility functions
│   ├── data/                     # Data access layer
│   │   ├── databse/              # Database and DAOs (note: typo in folder name)
│   │   │   ├── DB.ts             # Central database manager
│   │   │   ├── Small*Dao.ts      # Minimal item data access
│   │   │   └── Full*Dao.ts       # Complete item data access
│   │   └── repositories/         # Repository implementations
│   ├── ui/                       # User interface layer
│   │   ├── components/           # Feature implementations
│   │   │   ├── feature/          # Feature classes (BaseFeature + implementations)
│   │   │   ├── sidepanel/        # Side panel components
│   │   │   ├── processor/        # Markdown code block processors
│   │   │   ├── modals/           # Dialog components
│   │   │   ├── command/          # Editor commands
│   │   │   └── suggest/          # Autocomplete components
│   │   └── layout/               # Svelte components (~60 files)
│   │       ├── monster/          # Monster UI components
│   │       ├── spell/            # Spell UI components
│   │       ├── weapon/           # Weapon UI components
│   │       ├── armor/            # Armor UI components
│   │       ├── tracker/          # Initiative tracker UI
│   │       ├── sidepanel/        # Side panel layouts
│   │       └── uikit/            # Reusable UI components
│   └── assets/data/              # TypeScript imports of JSON data
├── data/                         # JSON data files (D&D 5e content)
├── test/                         # Test suite
│   ├── setup.ts                  # Vitest setup (mocks Obsidian)
│   ├── __mocks__/                # Mock implementations
│   └── **/*.test.ts              # Test files
└── .github/workflows/            # CI/CD configuration
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development build with watch mode
npm run build        # Production build (with type checking)
npm run release      # Build and create release artifacts in .release/
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage report
npm run svelte-check # Run Svelte type checking
```

## Architecture Patterns

### Feature Pattern

Each feature follows a consistent structure:

1. **Feature Class** (`src/ui/components/feature/XxxFeature.ts`)
   - Extends `BaseFeature<SmallItem, FullItem, Filters>`
   - Creates repository, side panel, and code block processor
   - Registers editor commands

2. **Repository** (`src/data/repositories/XxxRepository.ts`)
   - Implements `Repository<SmallItem, FullItem, Filters>` interface
   - Provides CRUD operations via DAOs

3. **Side Panel** (`src/ui/components/sidepanel/XxxSidePanel.ts`)
   - Extends `BaseSidePanel`
   - Renders Svelte component for browsing items

4. **Code Block Processor** (`src/ui/components/processor/XxxMdCodeBlockProcessor.ts`)
   - Processes markdown code blocks to render items inline

### DAO Pattern

Each entity type has two DAOs:
- `SmallXxxSqlTableDao` - Retrieves minimal item data for lists
- `FullXxxSqlTableDao` - Retrieves complete item details

### Model Pattern

Domain models follow a Small/Full pattern:
- `SmallXxx` - Minimal representation for list views
- `FullXxx` - Complete entity with all details

## Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Plugin entry point, initializes all features |
| `src/data/databse/DB.ts` | Database manager, initializes all DAOs |
| `src/ui/components/feature/BaseFeature.ts` | Base class for all features |
| `src/domain/repositories/Repository.ts` | Repository interface definition |

## Testing

- Tests are in `test/` directory, mirroring `src/` structure
- Test files use `.test.ts` extension
- Obsidian API is mocked in `test/__mocks__/obsidian.ts`
- Uses jsdom environment for DOM testing
- Coverage excludes UI/Svelte components

**Running tests:**
```bash
npm run test        # Run all tests
npm run test:cov    # Generate coverage report
```

## Code Conventions

### TypeScript
- Strict null checks enabled
- ES6 target with ESNext modules
- Inline source maps for debugging
- `verbatimModuleSyntax` enabled

### Naming
- Features: `XxxFeature` (e.g., `BestiaryFeature`)
- Repositories: `XxxRepository` (e.g., `BestiaryRepository`)
- DAOs: `SmallXxxSqlTableDao`, `FullXxxSqlTableDao`
- Models: `SmallXxx`, `FullXxx`
- Svelte components: `XxxUi.svelte`, `XxxSmallUi.svelte`, `XxxFullUi.svelte`

### File Organization
- Domain logic in `src/domain/`
- Data access in `src/data/`
- UI components in `src/ui/`
- Svelte layouts in `src/ui/layout/`

## CI/CD

GitHub Actions workflow (`.github/workflows/test.yml`):
- Triggers on push/PR to main
- Tests on Node.js 18.x and 20.x
- Runs: npm ci → svelte-check → tests → coverage
- Uploads coverage to Codecov

## Build Output

Production build creates:
- `main.js` - Bundled plugin (minified)
- `styles.css` - UI styles
- `sql-wasm.wasm` - SQLite WebAssembly binary

Release artifacts go to `.release/dnd-dm-tools/`

## Database

The plugin uses SQL.js (SQLite in WASM) for data storage:
- Database file: `database.db` in plugin directory
- Transaction support with rollback on error
- Initial data loaded from JSON files in `data/`

## Important Notes

1. **Known typo:** The database folder is named `databse` (missing 'a')
2. **Language:** Plugin UI is in Russian
3. **Obsidian API:** Always use mocks from `test/__mocks__/obsidian.ts` for testing
4. **Svelte 5:** Uses runes and new Svelte 5 syntax
5. **Path aliases:** `@` and `src` aliases resolve to `src/` directory

## Adding New Features

To add a new entity type:

1. Create domain models in `src/domain/models/newtype/`
   - `SmallNewType.ts` - List item representation
   - `FullNewType.ts` - Complete entity
   - `NewTypeFilters.ts` - Filter interface

2. Create DAOs in `src/data/databse/`
   - `SmallNewTypeSqlTableDao.ts`
   - `FullNewTypeSqlTableDao.ts`

3. Create repository in `src/data/repositories/`
   - `NewTypeRepository.ts` implementing `Repository` interface

4. Create UI components in `src/ui/layout/newtype/`
   - `NewTypeSmallUi.svelte`
   - `NewTypeFullUi.svelte`

5. Create feature in `src/ui/components/feature/`
   - `NewTypeFeature.ts` extending `BaseFeature`

6. Register feature in `src/main.ts`

7. Add JSON data in `data/newtype.json`

8. Add tests in `test/` directory
