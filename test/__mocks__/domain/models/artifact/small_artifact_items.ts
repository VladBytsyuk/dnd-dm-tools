import { ArtifactoryFilters } from "../../../../../src/domain/models/artifact/ArtifactoryFilters";
import { SmallArtifact } from "../../../../../src/domain/models/artifact/SmallArtifact"

export const artifactoryFilters = {
    types: ['чудесный предмет', 'волшебная палочка'],
    sources: ['XGE', 'BMT', 'DMG'],
    rarities: ['O', 'Р', 'А']
} as ArtifactoryFilters;

export const smallArtifactAmulet = {
    "name": {
      "rus": "Амулет тёмного осколка",
      "eng": "Dark Shard Amulet"
    },
    "url": "/items/magic/dark_shard_amulet",
    "type": {
      "name": "чудесный предмет",
      "order": 8
    },
    "price": {
      "dmg": "42",
      "xge": "70"
    },
    "source": {
      "shortName": "XGE",
      "name": "Руководство Занатара обо всем",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    },
    "rarity": {
      "type": "common",
      "name": "обычный",
      "short": "O"
    },
    "customization": true
} as SmallArtifact;

export const smallArtifactSphere = {
    "name": {
      "rus": "Раскалывающая сфера Донжона",
      "eng": "Donjon's Sundering Sphere"
    },
    "url": "/items/magic/donjon's_sundering_sphere",
    "type": {
      "name": "чудесный предмет",
      "order": 8
    },
    "price": {
      "dmg": "2274",
      "xge": "11000"
    },
    "source": {
      "shortName": "BMT",
      "name": "Книга многих вещей",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    },
    "rarity": {
      "type": "rare",
      "name": "редкий",
      "short": "Р"
    },
    "customization": true
} as SmallArtifact;

export const smallArtifactWand = {
    "name": {
      "rus": "Палочка Оркуса",
      "eng": "Wand of Orcus"
    },
    "url": "/items/magic/wand_of_orcus",
    "type": {
      "name": "волшебная палочка",
      "order": 2
    },
    "price": {
      "dmg": null,
      "xge": null
    },
    "source": {
      "shortName": "DMG",
      "name": "Руководство мастера",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      },
      homebrew: false,
    },
    "rarity": {
      "type": "artifact",
      "name": "артефакт",
      "short": "А"
    },
    "customization": true
} as SmallArtifact;
