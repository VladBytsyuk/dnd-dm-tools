# Character Sheet Interfaces

TypeScript interfaces for D&D 5e character sheet data structure.

## Overview

This module provides strongly-typed interfaces for character sheet data used in read, display, create, edit, import, and export operations.

## Structure

The character sheet has two levels:

1. **Root Level** (`CharacterSheet`) - Contains metadata and a stringified data field
2. **Parsed Data Level** (`CharacterData`) - Full character sheet structure (parsed from data string)

## Usage

### Importing

```typescript
// Import everything
import * from '@/domain/models/character';

// Or import specific types
import {
  CharacterSheet,
  CharacterSheetParsed,
  CharacterData,
  parseCharacterData,
  stringifyCharacterData
} from '@/domain/models/character';
```

### Parsing Character Data

```typescript
// Load character sheet with stringified data
const sheet: CharacterSheet = {
  tags: [],
  edition: "2024",
  jsonType: "character",
  version: "2",
  data: "...", // Stringified JSON
  // ...
};

// Parse the data field into typed structure
const parsed: CharacterSheetParsed = parseCharacterData(sheet);

// Now you can access typed properties
console.log(parsed.data.name.value);
console.log(parsed.data.stats.str.score);
console.log(parsed.data.vitality.ac.value);
```

### Stringifying for Storage

```typescript
// After modifying character data
parsed.data.stats.str.score = 18;
parsed.data.vitality.ac.value = 16;

// Convert back to storage format
const sheet: CharacterSheet = stringifyCharacterData(parsed);

// Now you can save sheet.data as a string
```

### Working with Character Data

```typescript
const character = parsed.data;

// Basic info
console.log(character.name.value); // Character name
console.log(character.info.charClass.value); // Class
console.log(character.info.level.value); // Level

// Ability scores
const strength = character.stats.str;
console.log(`STR: ${strength.score} (${strength.modifier})`);

// Skills with proficiency
const athletics = character.skills.athletics;
if (athletics.isProf === 1) {
  console.log("Proficient in Athletics");
} else if (athletics.isProf === 2) {
  console.log("Expertise in Athletics");
}

// Combat stats
console.log(`AC: ${character.vitality.ac.value}`);
console.log(`HP: ${character.vitality["hp-max"].value}`);
console.log(`Speed: ${character.vitality.speed.value}`);

// Equipment
character.weaponsList.forEach(weapon => {
  console.log(`${weapon.name.value}: ${weapon.dmg.value}`);
});

// Currency
console.log(`Gold: ${character.coins.gp.value}`);

// Text sections (rich text editor content)
const background = character.text.background.value;
console.log(`Background ID: ${background.id}`);
console.log(`Content type: ${background.data.type}`);
```

## Files

- `CharacterSheet.ts` - Root interface and utility functions
- `CharacterData.ts` - Main character data structure
- `CharacterInfo.ts` - Basic character info and spellcasting info
- `CharacterStats.ts` - Ability scores and saving throws
- `CharacterSkills.ts` - Skills with proficiency levels
- `CharacterVitality.ts` - HP, AC, initiative, etc.
- `CharacterEquipment.ts` - Weapons, attunements, and coins
- `CharacterText.ts` - Rich text editor sections
- `index.ts` - Barrel export (exports all interfaces)

## Type Safety

All interfaces are strongly typed with TypeScript:

```typescript
// Type errors caught at compile time
parsed.data.stats.str.score = "18"; // ❌ Error: Type 'string' is not assignable to type 'number'
parsed.data.stats.str.score = 18;   // ✅ OK

parsed.data.skills.invalid.name;    // ❌ Error: Property 'invalid' does not exist
parsed.data.skills.athletics.name;  // ✅ OK

parsed.data.info.level.value = "5"; // ❌ Error: Type 'string' is not assignable to type 'number'
parsed.data.info.level.value = 5;   // ✅ OK
```

## Notes

- The `data` field in `CharacterSheet` is a **stringified JSON** - it must be parsed with `parseCharacterData()`
- Skill proficiency levels: `0` = none, `1` = proficient, `2` = expertise
- Text sections use a rich text editor structure (TipTap/ProseMirror format)
- All ability stats (str, dex, con, int, wis, cha) follow the same structure
- The character follows D&D 5e rules (6 abilities, 18 skills, saving throws)
