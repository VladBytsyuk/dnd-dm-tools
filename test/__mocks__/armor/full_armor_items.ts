import { FullArmor } from "../../../src/domain/models/armor/FullArmor"

export const fullArmorLeather = {
  "name": {
    "rus": "Кожаный доспех",
    "eng": "Leather Armor"
  },
  "type": {
    "name": "Легкий доспех",
    "order": 0
  },
  "url": "/armors/leather_armor",
  "armorClass": "11 + модификатор Лов",
  "price": "10 зм.",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    }
  },
  "weight": 10,
  "description": "<p>Нагрудник и плечи этого доспеха изготовлены из кожи, вываренной в масле. Остальные части доспеха сделаны из более мягких и гибких материалов.</p>",
  "duration": "1 минута/1 минута"
} as FullArmor

export const fullArmorScaleMail = {
  "name": {
    "rus": "Чешуйчатый доспех",
    "eng": "Scale Mail Armor"
  },
  "type": {
    "name": "Средний доспех",
    "order": 1
  },
  "url": "/armors/scale_mail_armor",
  "armorClass": "14 + модификатор Лов (макс. 2)",
  "price": "50 зм.",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    }
  },
  "weight": 45,
  "description": "<p>Этот доспех состоит из кожаных куртки и поножей (а также, возможно, отдельной юбки), покрытых перекрывающимися кусочками металла, похожими на рыбную чешую. В комплект входят рукавицы.</p>",
  "disadvantage": true,
  "duration": "5 минут/1 минута"
} as FullArmor

export const fullArmorRingMail = {
  "name": {
    "rus": "Кольчатый доспех",
    "eng": "Ring Mail Armor"
  },
  "type": {
    "name": "Тяжелый доспех",
    "order": 2
  },
  "url": "/armors/ring_mail_armor",
  "armorClass": "14",
  "price": "30 зм.",
  "source": {
    "shortName": "PHB",
    "name": "Книга игрока",
    "group": {
      "name": "Официальные источники",
      "shortName": "Basic"
    }
  },
  "weight": 40,
  "description": "<p>Это кожаный доспех с нашитыми на него толстыми кольцами. Эти кольца помогают укрепить доспех от ударов мечей и топоров. Колечный доспех уступает кольчуге, и обычно его носят только те, кто не могут позволить себе доспех получше.</p>",
  "disadvantage": true,
  "duration": "10 минут/5 минут"
} as FullArmor
