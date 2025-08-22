import { ArsenalFilters } from "../../../../../src/domain/models/weapon/ArsenalFilters";
import { SmallWeapon } from "../../../../../src/domain/models/weapon/SmallWeapon"

export const arsenalFilters = { 
    types: ['Воинское рукопашное', 'Простое рукопашное', 'Воинское дальнобойное'], 
    sources: ['PHB'], 
    dices: ['1к10', '1к6', '1'],
    damageTypes: ['рубящий', 'дробящий', 'колющий']
} as ArsenalFilters;

export const smallWeaponHalberd = {
    "name": {
      "rus": "Алебарда",
      "eng": "Halberd"
    },
    "url": "/weapons/halberd",
    "type": {
      "name": "Воинское рукопашное",
      "order": 2
    },
    "damage": {
      "dice": "1к10",
      "type": "рубящий"
    },
    "price": "20 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    }
} as SmallWeapon;

export const smallWeaponMace = {
    "name": {
      "rus": "Булава",
      "eng": "Mace"
    },
    "url": "/weapons/mace",
    "type": {
      "name": "Простое рукопашное",
      "order": 0
    },
    "damage": {
      "dice": "1к6",
      "type": "дробящий"
    },
    "price": "5 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    }
} as SmallWeapon;

export const smallWeaponBlowgun = {
    "name": {
      "rus": "Духовая трубка",
      "eng": "Blowgun"
    },
    "url": "/weapons/blowgun",
    "type": {
      "name": "Воинское дальнобойное",
      "order": 3
    },
    "damage": {
      "dice": "1",
      "type": "колющий"
    },
    "price": "10 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      },
      homebrew: false
    }
} as SmallWeapon;
