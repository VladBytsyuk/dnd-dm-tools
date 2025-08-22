import { ArmoryFilters } from "../../../../../src/domain/models/armor/ArmoryFilters"
import { SmallArmor } from "../../../../../src/domain/models/armor/SmallArmor"

export const armoryFilters = { 
    types: ['Легкий доспех', 'Средний доспех', 'Тяжелый доспех'], 
    sources: ['PHB'], 
} as ArmoryFilters;

export const smallArmorLeather = {
    "name": {
      "rus": "Кожаный доспех",
      "eng": "Leather Armor"
    },
    "url": "/armors/leather_armor",
    "type": {
      "name": "Легкий доспех",
      "order": 0
    },
    "armorClass": "11 + модификатор Лов",
    "price": "10 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    }
} as SmallArmor;

export const smallArmorScaleMail = {
    "name": {
      "rus": "Чешуйчатый доспех",
      "eng": "Scale Mail Armor"
    },
    "url": "/armors/scale_mail_armor",
    "type": {
      "name": "Средний доспех",
      "order": 1
    },
    "armorClass": "14 + модификатор Лов (макс. 2)",
    "price": "50 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      }
    }
} as SmallArmor;

export const smallArmorRingMail = {
    "name": {
      "rus": "Кольчатый доспех",
      "eng": "Ring Mail Armor"
    },
    "url": "/armors/ring_mail_armor",
    "type": {
      "name": "Тяжелый доспех",
      "order": 2
    },
    "armorClass": "14",
    "price": "30 зм.",
    "source": {
      "shortName": "PHB",
      "name": "Книга игрока",
      "group": {
        "name": "Официальные источники",
        "shortName": "Basic"
      },
      homebrew: false
    }
} as SmallArmor;
