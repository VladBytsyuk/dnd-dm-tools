import { SpellbookFilters } from "../../../../../src/domain/models/spell/SpellbookFilters";
import { SmallSpell } from "../../../../../src/domain/models/spell/SmallSpell"

export const spellbookFilters = {
  levels: [3, 5, 9],
  schools: ["воплощение", "преобразование", "вызов"],
  sources: ["PHB"]
} as SpellbookFilters;

export const smallSpellFireball = {
    "name": {
      "rus": "Огненный шар",
      "eng": "Fireball"
    },
    "level": 3,
    "school": "воплощение",
    "components": {
      "v": true,
      "s": true,
      "m": "a small ball of bat guano and sulfur",
    },
    "url": "/spells/fireball",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      },
      "homebrew": false
    },
} as SmallSpell;

export const smallSpellAwaken = {
  "name": {
    "rus": "Пробуждение разума",
    "eng": "Awaken"
  },
  "level": 5,
  "school": "преобразование",
  "components": {
    "v": true,
    "s": true,
    "m": "a small piece of bark"
  },
  "url": "/spells/awaken",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    },
    "homebrew": false
  }
} as SmallSpell;

export const smallSpellWish = {
  "name": {
    "rus": "Исполнение желаний",
    "eng": "Wish"
  },
  "level": 9,
  "school": "вызов",
  "components": {
    "v": true,
    "s": false
  },
  "url": "/spells/wish",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    },
    "homebrew": false
  }
} as SmallSpell;
