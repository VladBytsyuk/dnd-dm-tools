import { BestiaryFilters } from "../../../../../src/domain/models/monster/BestiaryFilters"
import { SmallMonster } from "../../../../../src/domain/models/monster/SmallMonster"

export const bestiaryFilters = { 
    types: ['нежить', 'элементаль', 'исчадие'], 
    sources: ['UA22WotM*', 'MM', 'RoT'],
    challangeRatings: ['—', '5', '30']
} as BestiaryFilters;

export const smallMonsterSpirit = {
  "name": {
    "rus": "Дух воителя",
    "eng": "Warrior Spirit"
  },
  "type": "нежить",
  "challengeRating": "—",
  "url": "/bestiary/warrior_spirit",
  "source": {
    "shortName": "UA22WotM",
    "name": "Unearthed Arcana: Чудеса Мультивселенной",
    "group": {
      "name": "Тестовый материал",
      "shortName": "UA"
    }
  }
} as SmallMonster;

export const smallMonsterElemental = {
  "name": {
    "rus": "Огненный элементаль",
    "eng": "Fire Elemental"
  },
  "type": "элементаль",
  "challengeRating": "5",
  "url": "/bestiary/fire_elemental",
  "source": {
    "shortName": "MM",
    "name": "Бестиарий",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    }
  }
} as SmallMonster;

export const smallMonsterTiamat = {
  "name": {
    "rus": "Тиамат",
    "eng": "Tiamat"
  },
  "type": "исчадие",
  "challengeRating": "30",
  "url": "/bestiary/tiamat",
  "source": {
    "shortName": "RoT",
    "name": "Пробуждение Тиамат",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    }
  }
} as SmallMonster;
