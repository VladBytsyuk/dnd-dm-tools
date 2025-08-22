import { EquipmentFilters } from "../../../../../src/domain/models/items/EquipmentFilters"
import { SmallItem } from "../../../../../src/domain/models/items/SmallItem"

export const armoryFilters = {
  sources: ['PHB'],
} as EquipmentFilters;

export const smallItemAbacus = {
  "name": {
    "rus": "Абак (счеты)",
    "eng": "Abacus"
  },
  "url": "/items/abacus",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic",
    },
    homebrew: false
  }
} as SmallItem;

export const smallItemLyre = {
  "name": {
    "rus": "Лира",
    "eng": "Lyre"
  },
  "url": "/items/lyre",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    },
    homebrew: false
  }
} as SmallItem;

export const smallItemPoison = {
  "name": {
    "rus": "Яд, простой (флакон)",
    "eng": "Poison, Basic"
  },
  "url": "/items/poison,_basic",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    },
    homebrew: false
  }
} as SmallItem;
