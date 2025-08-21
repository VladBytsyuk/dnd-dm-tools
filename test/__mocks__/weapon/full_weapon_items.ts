import { FullWeapon } from "../../../src/domain/models/weapon/FullWeapon"

export const fullWeaponHalberd = {
  "name": {
    "rus": "Алебарда",
    "eng": "Halberd"
  },
  "type": {
    "name": "Воинское рукопашное",
    "order": 2
  },
  "url": "/weapons/halberd",
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
  },
  "weight": 6,
  "description": "<p>Древковое оружие состоит из рукояти, обычно деревянной, и металлического острия или лезвия на её конце. Это классическое военное оружие, чей широкий радиус действия делает его отличным выбором против крупных противников.</p>",
  "properties": [
    {
      "name": "Двуручное",
      "url": "/screens/Two-handed",
      "description": "<p>Это оружие нужно держать двумя руками, когда вы атакуете им.</p>"
    },
    {
      "name": "Досягаемость",
      "url": "/screens/Reach",
      "description": "<p>Это оружие добавляет 5 футов к расстоянию, на котором вы можете совершать этим оружием <detail-tooltip type=\"screen\"><a href=\"/screens/attack\">атаки</a></detail-tooltip> и <detail-tooltip type=\"screen\"><a href=\"/screens/opportunity_attack\">провоцированные атаки</a></detail-tooltip>.</p>"
    },
    {
      "name": "Тяжёлое",
      "url": "/screens/Heavy",
      "description": "<p>Существа <span><em>Маленького</em> или <em>Крошечного</em> размера<a href=\"/rules/Errata_(PHB)\" title=\"изменено Эрратой\"><sup>1</sup></a></span>&nbsp;совершают броски атаки тяжёлым оружием с <span class=\"disadvantage\">помехой</span>. Из-за размера и веса <em>Маленькие</em> <span>или <em>Крошечные</em><a href=\"/rules/Errata_(PHB)\" title=\"изменено Эрратой\"><sup>2</sup></a>&nbsp;</span>существа не могут использовать такое оружие эффективно.</p>"
    }
  ]
} as FullWeapon;

export const fullWeaponMace = {
  "name": {
    "rus": "Булава",
    "eng": "Mace"
  },
  "type": {
    "name": "Простое рукопашное",
    "order": 0
  },
  "url": "/weapons/mace",
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
  },
  "weight": 4,
  "description": "<p>Булава &mdash; короткодревковое ударно-дробящее холодное оружие в виде рукояти с шаровидной ударной частью &mdash; навершием.</p>",
  "properties": []
} as FullWeapon;

export const fullWeaponBlowgun = {
  "name": {
    "rus": "Духовая трубка",
    "eng": "Blowgun"
  },
  "type": {
    "name": "Воинское дальнобойное",
    "order": 3
  },
  "url": "/weapons/blowgun",
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
    }
  },
  "weight": 1,
  "description": "<p>Может стрелять <detail-tooltip type=\"screen\"><a href=\"/items/blowgun_needles\">иглами для трубки</a></detail-tooltip>.</p>",
  "properties": [
    {
      "name": "Боеприпас",
      "url": "/screens/Ammunition",
      "distance": "25/100",
      "description": "<p>Вы можете использовать оружие со свойством <a href=\"#\">Боеприпас</a>&nbsp;для совершения <em>дальнобойной атаки</em> только если у вас есть боеприпасы для стрельбы.</p><p>Каждый раз, когда вы совершаете атаку с помощью этого оружия, вы тратите один боеприпас. Вынимается боеприпас из колчана или другого контейнера частью атаки.</p><p>Для зарядки одноручного оружия требуется одна свободная рука.</p><p>В конце сражения вы восстанавливаете половину использованных боеприпасов, потратив минуту на поиски на поле боя.</p><p>Если вы используете оружие со свойством <a href=\"#\">Боеприпас</a> для совершения <em>рукопашной атаки</em>, вы считаете его импровизированным оружием.&nbsp;</p>"
    },
    {
      "name": "Перезарядка",
      "url": "/screens/Loading",
      "description": "<p>Из-за долгой перезарядки этого оружия вы можете выстрелить из него только один боеприпас одним <em>действием</em>, <em>бонусным действием</em> или <em>реакцией</em>, вне зависимости от количества положенных атак в раунд.</p>"
    }
  ]
} as FullWeapon;
