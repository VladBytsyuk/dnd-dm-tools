import type { SmallSpell } from "../../domain/models/spell/SmallSpell";

export const baseSpellbook: SmallSpell[] = [
	{
		"name": {
			"rus": "Анализ устройства",
			"eng": "Analyze Device"
		},
		"level": 0,
		"school": "прорицание",
		"additionalType": "Механомагия",
		"components": {
			"v": true,git 
			"s": true,
			"m": "exist"
		},
		"url": "/spells/analyze_device",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Благословенная защита",
			"eng": "Benediction"
		},
		"level": 0,
		"school": "ограждение",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/benediction",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Благословление мёртвых",
			"eng": "Bless the Dead"
		},
		"level": 0,
		"school": "ограждение",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/bless_the_dead",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Брызги кислоты",
			"eng": "Acid Splash"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/acid_splash",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Визитная карточка",
			"eng": "Calling Card"
		},
		"level": 0,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/calling_card",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Включить/Выключить",
			"eng": "On or Off"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/on_or_off",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Власть над огнём",
			"eng": "Control Flames"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"url": "/spells/control_flames",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Воздушный хлыст",
			"eng": "Wind Lash"
		},
		"level": 0,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/wind_lash",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебная рука",
			"eng": "Mage Hand"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mage_hand",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебный камень",
			"eng": "Magic Stone"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/magic_stone",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вспышка мечей",
			"eng": "Sword Burst Old"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/sword_burst_old",
		"source": {
			"shortName": "SCAG",
			"name": "Путеводитель приключенца по Побережью меча",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вспышка мечей",
			"eng": "Sword Burst"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/sword_burst",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовой клинок",
			"eng": "Thunderblade"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/thunderblade",
		"source": {
			"shortName": "SCAG",
			"name": "Путеводитель приключенца по Побережью меча",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовой клинок",
			"eng": "Booming Blade"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/booming_blade",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Добродетель ",
			"eng": "Virtue"
		},
		"level": 0,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/virtue",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Драконий рёв",
			"eng": "Dragon Roar"
		},
		"level": 0,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true
		},
		"url": "/spells/dragon_roar",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дружба",
			"eng": "Friends"
		},
		"level": 0,
		"school": "очарование",
		"components": {
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/friends",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дубинка",
			"eng": "Shillelagh"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/shillelagh",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Железный кулак",
			"eng": "Fist of Iron"
		},
		"level": 0,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/fist_of_iron",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Зашифровать мысли",
			"eng": "Encode Thoughts"
		},
		"level": 0,
		"school": "очарование",
		"components": {
			"s": true
		},
		"url": "/spells/encode_thoughts",
		"source": {
			"shortName": "GGR",
			"name": "Справочник гильдмастера по Равнике",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Зашифровать/расшифровать",
			"eng": "Encrypt or Decrypt"
		},
		"level": 0,
		"school": "преобразование",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/encrypt_or_decrypt",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от оружия",
			"eng": "Blade Ward"
		},
		"level": 0,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/blade_ward",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Звёздный взрыв",
			"eng": "Starburst"
		},
		"level": 0,
		"school": "вызов",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/starburst",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Злая насмешка",
			"eng": "Vicious Mockery"
		},
		"level": 0,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/vicious_mockery",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изменение растений",
			"eng": "Mold Plant"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"s": true
		},
		"url": "/spells/mold_plant",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Иней",
			"eng": "Hoarfrost"
		},
		"level": 0,
		"school": "воплощение",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hoarfrost",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Искусство друидов",
			"eng": "Druidcraft"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/druidcraft",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Исцеление древа",
			"eng": "Tree Heal"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/tree_heal",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Каменный обстрел",
			"eng": "Pummelstone"
		},
		"level": 0,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/pummelstone",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Клинок зелёного пламени",
			"eng": "Green Flame Blade SCAG"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/green_flame_blade_scag",
		"source": {
			"shortName": "SCAG",
			"name": "Путеводитель приключенца по Побережью меча",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Клинок зелёного пламени",
			"eng": "Green Flame Blade"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/green_flame_blade",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Клуб дыма",
			"eng": "Puff of Smoke"
		},
		"level": 0,
		"school": "вызов",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/puff_of_smoke",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Когти тьмы",
			"eng": "Claws of Darkness"
		},
		"level": 0,
		"school": "вызов",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/claws_of_darkness",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Крепкий росток",
			"eng": "Grasping Sprout"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/grasping_sprout",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Лассо молнии",
			"eng": "Lightning Lure"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/lightning_lure",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Леденящее прикосновение",
			"eng": "Chill Touch"
		},
		"level": 0,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/chill_touch",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Лепка земли",
			"eng": "Mold Earth"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"url": "/spells/mold_earth",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Луч холода",
			"eng": "Ray of Frost"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ray_of_frost",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Малая иллюзия",
			"eng": "Minor Illusion"
		},
		"level": 0,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/minor_illusion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Меткий удар",
			"eng": "True Strike"
		},
		"level": 0,
		"school": "прорицание",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/true_strike",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мистический заряд",
			"eng": "Eldritch Blast"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/eldritch_blast",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нашествие",
			"eng": "Infestation"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/infestation",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обессиливающий укол",
			"eng": "Sapping Sting"
		},
		"level": 0,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/sapping_sting",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Обморожение",
			"eng": "Frostbite"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/frostbite",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огненный снаряд",
			"eng": "Fire Bolt"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/fire_bolt",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оплетающая лоза",
			"eng": "Bonding Vine"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/bonding_vine",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Оплошность",
			"eng": "Misstep"
		},
		"level": 0,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/misstep",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ослепление тенью",
			"eng": "Shadow Blindness"
		},
		"level": 0,
		"school": "иллюзия",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shadow_blindness",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Остановка",
			"eng": "Tick Stop"
		},
		"level": 0,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true
		},
		"url": "/spells/tick_stop",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Первобытная дикость",
			"eng": "Primal Savagery"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"url": "/spells/primal_savagery",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Писарь",
			"eng": "Scribe"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/scribe",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пляшущие огоньки",
			"eng": "Dancing Lights"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dancing_lights",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Погасить свет",
			"eng": "Douse Light"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/douse_light",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Погребальный звон",
			"eng": "Toll the Dead"
		},
		"level": 0,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/toll_the_dead",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Потусторонняя хватка",
			"eng": "Otherworldly Grasp"
		},
		"level": 0,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/otherworldly_grasp",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Починка",
			"eng": "Mending"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mending",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пронзающий шип",
			"eng": "Piercing Thorn"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/piercing_thorn",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Раскат грома",
			"eng": "Thunderclap"
		},
		"level": 0,
		"school": "воплощение",
		"additionalType": "Рунная магия",
		"components": {
			"s": true
		},
		"url": "/spells/thunderclap",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Расщепление разума",
			"eng": "Mind Sliver"
		},
		"level": 0,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/mind_sliver",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Свет",
			"eng": "Light"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/light",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Священное пламя",
			"eng": "Sacred Flame"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/sacred_flame",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сеанс",
			"eng": "Seance"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/seance",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Силуэт",
			"eng": "Silhouette"
		},
		"level": 0,
		"school": "иллюзия",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/silhouette",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сияющие руки",
			"eng": "Hand of Radiance"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hand_of_radiance",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Слово Сияния",
			"eng": "Word of Radiance"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/word_of_radiance",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сообщение",
			"eng": "Message"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/message",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сопротивление",
			"eng": "Resistance"
		},
		"level": 0,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/resistance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение костра",
			"eng": "Create Bonfire"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/create_bonfire",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение пламени",
			"eng": "Produce Flame"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/produce_flame",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Терновый кнут",
			"eng": "Thorn Whip"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/thorn_whip",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Удар грома",
			"eng": "Thunder Bolt"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/thunder_bolt",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Указание",
			"eng": "Guidance"
		},
		"level": 0,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/guidance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Укус тени",
			"eng": "Shadow Bite"
		},
		"level": 0,
		"school": "иллюзия",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shadow_bite",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Уход за умирающим",
			"eng": "Spare the Dying"
		},
		"level": 0,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/spare_the_dying",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Фокусы",
			"eng": "Prestidigitation"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/prestidigitation",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Формование воды",
			"eng": "Shape Water"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"url": "/spells/shape_water",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Чувство охотника",
			"eng": "Hunter Sense"
		},
		"level": 0,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/hunter_sense",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Чудотворство",
			"eng": "Thaumaturgy"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"url": "/spells/thaumaturgy",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Шипастый щит",
			"eng": "Thorn Shield"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/thorn_shield",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Шквал",
			"eng": "Gust"
		},
		"level": 0,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/gust",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Электрошок",
			"eng": "Shocking Grasp"
		},
		"level": 0,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shocking_grasp",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ядовитые брызги",
			"eng": "Poison Spray"
		},
		"level": 0,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/poison_spray",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Адское возмездие",
			"eng": "Hellish Rebuke"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hellish_rebuke",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Алая плеть",
			"eng": "Crimson Lash"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Сангромантия",
		"components": {
			"s": true
		},
		"url": "/spells/crimson_lash",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ангельский защитник",
			"eng": "Angelic Guardian"
		},
		"level": 1,
		"school": "иллюзия",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/angelic_guardian",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Безмолвный образ",
			"eng": "Silent Image"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/silent_image",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Беседа с драконом",
			"eng": "Converse with Dragon"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "Магия драконов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/converse_with_dragon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Беспорядочный рост",
			"eng": "Overgrowth"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/overgrowth",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Благословение",
			"eng": "Bless"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/bless",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Божественное благоволение",
			"eng": "Divine Favor"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/divine_favor",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Бронированный панцирь",
			"eng": "Armored Shell"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/armored_shell",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Броня теней",
			"eng": "Shadow Armor"
		},
		"level": 1,
		"school": "ограждение",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shadow_armor",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ведьмин снаряд",
			"eng": "Witch Bolt"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/witch_bolt",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Внезапное пробуждение",
			"eng": "Sudden Awakening"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/sudden_awakening",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Воздушный туннель",
			"eng": "Wind Tunnel"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wind_tunnel",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Волна грома",
			"eng": "Thunderwave"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/thunderwave",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волновой барьер",
			"eng": "Tidal Barrier"
		},
		"level": 1,
		"school": "ограждение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tidal_barrier",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Волчья песнь",
			"eng": "Wolfsong"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true
		},
		"url": "/spells/wolfsong",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебная стрела",
			"eng": "Magic Missile"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/magic_missile",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебная стрела Джима",
			"eng": "Jim's Magic Missile"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/jim's_magic_missile",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебное оружие",
			"eng": "Arcane Weapon"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/arcane_weapon",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вопрос с подвохом",
			"eng": "Trick Question"
		},
		"level": 1,
		"school": "очарование",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/trick_question",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов на дуэль",
			"eng": "Compelled Duel"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/compelled_duel",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов страха",
			"eng": "Cause Fear"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/cause_fear",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Героизм",
			"eng": "Heroism"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/heroism",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Глубокий вздох",
			"eng": "Deep Breath"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true
		},
		"url": "/spells/deep_breath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Гневная кара",
			"eng": "Wrathful Smite"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/wrathful_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Град шипов",
			"eng": "Hail of Thorns"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/hail_of_thorns",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовая кара",
			"eng": "Thunderous Smite"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/thunderous_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовой заряд",
			"eng": "Thunderous Charge"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Магия лабиринта",
		"components": {
			"v": true
		},
		"url": "/spells/thunderous_charge",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Грузоподъёмность машины",
			"eng": "Machine's Load"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/machine's_load",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дар готовности",
			"eng": "Gift of Alacrity"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/gift_of_alacrity",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дар Локи",
			"eng": "Loki's Gift"
		},
		"level": 1,
		"school": "очарование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true
		},
		"url": "/spells/loki's_gift",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дикая хитрость",
			"eng": "Wild Cunning"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/wild_cunning",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Диссонирующий шёпот",
			"eng": "Dissonant Whispers"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/dissonant_whispers",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Доспех Агатиса",
			"eng": "Armor of Agathys"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/armor_of_agathys",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Доспехи мага",
			"eng": "Mage Armor"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mage_armor",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Драконий удар",
			"eng": "Draconic Smite"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/draconic_smite",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Древесный мост",
			"eng": "Bridge of Branches"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/bridge_of_branches",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Дрожь земли",
			"eng": "Earth Tremor"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/earth_tremor",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дружба с животными",
			"eng": "Animal Friendship"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/animal_friendship",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дуновение",
			"eng": "Waft"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/waft",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Едкое варево Таши",
			"eng": "Tasha's Caustic Brew"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tasha's_caustic_brew",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Жуткий смех Таши",
			"eng": "Tasha's Hideous Laughter"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tasha's_hideous_laughter",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Заволакивающая тьма",
			"eng": "Cloying Darkness"
		},
		"level": 1,
		"school": "некромантия",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/cloying_darkness",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Заморозить питьё",
			"eng": "Freeze Potion"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/freeze_potion",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Запомнить",
			"eng": "Memorize"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/memorize",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от добра и зла",
			"eng": "Protection from Evil and Good"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/protection_from_evil_and_good",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от пустоты",
			"eng": "Protection from the Void"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/protection_from_the_void",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Звериные узы",
			"eng": "Beast Bond"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/beast_bond",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Злополучное слово",
			"eng": "Ill-fated Word"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "Магия Хаоса",
		"components": {
			"v": true
		},
		"url": "/spells/ill-fated_word",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Идентификационные нашептывания",
			"eng": "Id Insinuation"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/id_insinuation",
		"source": {
			"shortName": "UACDW",
			"name": "Unearthed Arcana: Жрец, Друид и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Искажение ценности",
			"eng": "Distort Value"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"v": true
		},
		"url": "/spells/distort_value",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Искусная острóта",
			"eng": "Silvery barbs"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/silvery_barbs",
		"source": {
			"shortName": "SCC",
			"name": "Стриксхейвен: Учебная программа хаоса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Катапульта",
			"eng": "Catapult"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"url": "/spells/catapult",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кислотный поток",
			"eng": "Acid Stream"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/acid_stream",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Кольцо ветра",
			"eng": "Circle of Wind"
		},
		"level": 1,
		"school": "ограждение",
		"additionalType": "Магия колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/circle_of_wind",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кольцо отталкивания",
			"eng": "Ringstrike"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ringstrike",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Комариная погибель",
			"eng": "Mosquito Bane"
		},
		"level": 1,
		"school": "некромантия",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mosquito_bane",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Корректировка позиции",
			"eng": "Adjust Positioning"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Боевая магия",
		"components": {
			"v": true
		},
		"url": "/spells/adjust_positioning",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кровавый след",
			"eng": "Blood Print"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/blood_print",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ледяной кинжал",
			"eng": "Ice Knife"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ice_knife",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ледяные пальцы",
			"eng": "Frost Fingers"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/frost_fingers",
		"source": {
			"shortName": "IDRotF",
			"name": "Долина Ледяного Ветра: Иней Морозной девы",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Лечащее слово",
			"eng": "Healing Word"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/healing_word",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Лечебный эликсир",
			"eng": "Healing Elixir"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/healing_elixir",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Лечение ран",
			"eng": "Cure Wounds"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/cure_wounds",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Луч болезни",
			"eng": "Ray of Sickness"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ray_of_sickness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Марионетка",
			"eng": "Puppet"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/puppet",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Маскировка",
			"eng": "Disguise Self"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/disguise_self",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Машинная речь",
			"eng": "Machine Speech"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/machine_speech",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Маятник",
			"eng": "Pendulum"
		},
		"level": 1,
		"school": "очарование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/pendulum",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Метка охотника",
			"eng": "Hunter's Mark"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/hunter's_mark",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мистическое копьё",
			"eng": "Arcane Lance"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/arcane_lance",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Надежная трансляция",
			"eng": "Infallible Relay"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/infallible_relay",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Найти изъян",
			"eng": "Find the Flaw"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/find_the_flaw",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Найти родню",
			"eng": "Find Kin"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/find_kin",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Нанесение ран",
			"eng": "Inflict Wounds"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/inflict_wounds",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Направленный снаряд",
			"eng": "Guiding Bolt"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/guiding_bolt",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Направляющая рука",
			"eng": "Guiding Hand"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/guiding_hand",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Невидимое письмо",
			"eng": "Illusory Script"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/illusory_script",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Невидимый слуга",
			"eng": "Unseen Servant"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/unseen_servant",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Неземной хор",
			"eng": "Unearthly Chorus"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/unearthly_chorus",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Нейтрализация ауры",
			"eng": "Neutralize Aura"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/neutralize_aura",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Неутомимость",
			"eng": "Tireless"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/tireless",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Оберег из козьего копыта",
			"eng": "Goat's Hoof Charm"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/goat's_hoof_charm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение болезней и яда",
			"eng": "Detect Poison and Disease"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/detect_poison_and_disease",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение добра и зла",
			"eng": "Detect Evil and Good"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/detect_evil_and_good",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение магии",
			"eng": "Detect Magic"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/detect_magic",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огненные ладони",
			"eng": "Burning Hands"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/burning_hands",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огонь фей",
			"eng": "Faerie Fire"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/faerie_fire",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оживление конструкта",
			"eng": "Animate Construct"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/animate_construct",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Опознание",
			"eng": "Identify"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/identify",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Опутывание",
			"eng": "Entangle"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/entangle",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Опутывающий удар",
			"eng": "Ensnaring Strike"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/ensnaring_strike",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ослабление брони",
			"eng": "Undermine Armor"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/undermine_armor",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Острые листья",
			"eng": "Slicing Leaves"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/slicing_leaves",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Очарование личности",
			"eng": "Charm Person"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/charm_person",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Очарование очага",
			"eng": "Hearth Charm"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hearth_charm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Очищение пищи и питья",
			"eng": "Purify Food and Drink"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/purify_food_and_drink",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Падение пёрышком",
			"eng": "Feather Fall"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/feather_fall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Палящая кара",
			"eng": "Searing Smite"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/searing_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пламя под языком",
			"eng": "Fire under the Tongue"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true
		},
		"url": "/spells/fire_under_the_tongue",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Плащ теней",
			"eng": "Cloak of Shadow"
		},
		"level": 1,
		"school": "иллюзия",
		"additionalType": "Иллюминация",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/cloak_of_shadow",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Поглощение",
			"eng": "Consumption"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/consumption",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Поглощение стихий",
			"eng": "Absorb Elements"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"s": true
		},
		"url": "/spells/absorb_elements",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск фамильяра",
			"eng": "Find Familiar"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/find_familiar",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ползущая рука",
			"eng": "Creeping Touch"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/creeping_touch",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Понимание языков",
			"eng": "Comprehend Languages"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/comprehend_languages",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Порча",
			"eng": "Bane"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/bane",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поспешное отступление",
			"eng": "Expeditious Retreat"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/expeditious_retreat",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поток",
			"eng": "Torrent"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/torrent",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Почётный гость",
			"eng": "Guest of Honor"
		},
		"level": 1,
		"school": "очарование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/guest_of_honor",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Почувствовать эмоции",
			"eng": "Sense Emotion"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/sense_emotion",
		"source": {
			"shortName": "UASS",
			"name": "Unearthed Arcana: Стартовые заклинания",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Привлекательный подарок",
			"eng": "Beguiling Gift"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"s": true
		},
		"url": "/spells/beguiling_gift",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Призрачный свет",
			"eng": "Ghost Light"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ghost_light",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Приказ",
			"eng": "Command"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/command",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Прилив крови",
			"eng": "Blood Rush"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Сангромантия",
		"components": {
			"s": true
		},
		"url": "/spells/blood_rush",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Притяжение",
			"eng": "Magnify Gravity"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/magnify_gravity",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пришпорить скакуна",
			"eng": "Spur Mount"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/spur_mount",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Прыжок",
			"eng": "Jump"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/jump",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Псевдожизнь",
			"eng": "False Life"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/false_life",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Путеводная звезда",
			"eng": "Guiding Star"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/guiding_star",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Разговор с животными",
			"eng": "Speak with Animals"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/speak_with_animals",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разговор с предметами",
			"eng": "Speak with Inanimate Object"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/speak_with_inanimate_object",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Рука гаи",
			"eng": "Gaea's Hand"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/gaea's_hand",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Руки из тени",
			"eng": "Shadow Hands"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shadow_hands",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Руки Хадара",
			"eng": "Arms of Hadar"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/arms_of_hadar",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сверкающие брызги",
			"eng": "Color Spray"
		},
		"level": 1,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/color_spray",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Своевременное предупреждение",
			"eng": "Auspicious Warning"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "Магия Хаоса",
		"components": {
			"v": true
		},
		"url": "/spells/auspicious_warning",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Связь с землёй",
			"eng": "Land Bond"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/land_bond",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сглаз",
			"eng": "Hex"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/hex",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сигнал тревоги",
			"eng": "Alarm"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/alarm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Силок",
			"eng": "Snare"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/snare",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Скольжение",
			"eng": "Grease"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/grease",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Скользящий шаг",
			"eng": "Gliding Step"
		},
		"level": 1,
		"school": "ограждение",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/gliding_step",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Скоротечный оплот",
			"eng": "Transient Bulwark"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/transient_bulwark",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Скороход",
			"eng": "Longstrider"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/longstrider",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сломанный заряд",
			"eng": "Broken Charge"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/broken_charge",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слухи",
			"eng": "Rumor"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/rumor",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Снаряд хаоса",
			"eng": "Chaos Bolt"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/chaos_bolt",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Снегопад",
			"eng": "Flurry"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/flurry",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Создание укрытия",
			"eng": "Conjure Cover"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/conjure_cover",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение или уничтожение воды",
			"eng": "Create or Destroy Water"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/create_or_destroy_water",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Споры телепатической связи",
			"eng": "Rapport Spores"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/rapport_spores",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Стальное сердце",
			"eng": "Armored Heart"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/armored_heart",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сфера Делериума",
			"eng": "Delerium Orb"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/delerium_orb",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тензеров парящий диск",
			"eng": "Tenser's Floating Disk"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/tenser's_floating_disk",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Туманное облако",
			"eng": "Fog Cloud"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/fog_cloud",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Убежище",
			"eng": "Sanctuary"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sanctuary",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Удаленный доступ",
			"eng": "Remote Access"
		},
		"level": 1,
		"school": "прорицание",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/remote_access",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Удар Зефира",
			"eng": "Zephyr Strike"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/zephyr_strike",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ужасный полёт",
			"eng": "Ghastly Flight"
		},
		"level": 1,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ghastly_flight",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Улика",
			"eng": "Clue"
		},
		"level": 1,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/clue",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Усыпление",
			"eng": "Sleep"
		},
		"level": 1,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sleep",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Хромая кляча",
			"eng": "Hobble Mount"
		},
		"level": 1,
		"school": "некромантия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/hobble_mount",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цветной шарик",
			"eng": "Chromatic Orb"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/chromatic_orb",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Церемония",
			"eng": "Ceremony"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/ceremony",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Чёрные ленты",
			"eng": "Black Ribbons"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/black_ribbons",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Чудо-ягоды",
			"eng": "Goodberry"
		},
		"level": 1,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/goodberry",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Шепчущий ветер",
			"eng": "Whispering Wind"
		},
		"level": 1,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/whispering_wind",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Щит",
			"eng": "Shield"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shield",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Щит веры",
			"eng": "Shield of Faith"
		},
		"level": 1,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shield_of_faith",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Щит шестерней",
			"eng": "Gear Shield"
		},
		"level": 1,
		"school": "ограждение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/gear_shield",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Экстракт Фойсона",
			"eng": "Extract Foyson"
		},
		"level": 1,
		"school": "преобразование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/extract_foyson",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ярость кобольдов",
			"eng": "Kobold's Fury"
		},
		"level": 1,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/kobold's_fury",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Аура мороза",
			"eng": "Aura of Frost"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/aura_of_frost",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Бесследное передвижение",
			"eng": "Pass without Trace"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/pass_without_trace",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Бешеный снаряд",
			"eng": "Frenzied Bolt"
		},
		"level": 2,
		"school": "вызов",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/frenzied_bolt",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Благословение удачи",
			"eng": "Fortune's Favor"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/fortune's_favor",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Благословенный нимб",
			"eng": "Blessed Halo"
		},
		"level": 2,
		"school": "вызов",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/blessed_halo",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Божественное оружие",
			"eng": "Spiritual Weapon"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/spiritual_weapon",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Буря чёрных лебедей",
			"eng": "Black Swan Storm"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/black_swan_storm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вечный огонь",
			"eng": "Continual Flame"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/continual_flame",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Взор ослепительных снегов",
			"eng": "Snowblind Stare"
		},
		"level": 2,
		"school": "некромантия",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/snowblind_stare",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Взрывное зерно",
			"eng": "Explosive Seed"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/explosive_seed",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Видение невидимого",
			"eng": "See Invisibility"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/see_invisibility",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вихрь искривления",
			"eng": "Vortex Warp"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/vortex_warp",
		"source": {
			"shortName": "SCC",
			"name": "Стриксхейвен: Учебная программа хаоса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Внушение",
			"eng": "Suggestion"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/suggestion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Воздушный пузырь",
			"eng": "Air bubble"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"s": true
		},
		"url": "/spells/air_bubble",
		"source": {
			"shortName": "AAG",
			"name": "Руководство астрального приключенца",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебные уста",
			"eng": "Magic Mouth"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/magic_mouth",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебный взлом",
			"eng": "Arcane Hacking"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/arcane_hacking",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебный замок",
			"eng": "Arcane Lock"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/arcane_lock",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Воображаемая сила",
			"eng": "Phantasmal Force"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/phantasmal_force",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов роя скарабеев",
			"eng": "Conjure Scarab Swarm"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_scarab_swarm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Гадание",
			"eng": "Augury"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/augury",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Глухота/слепота",
			"eng": "Blindness or Deafness"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true
		},
		"url": "/spells/blindness_or_deafness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Горящий клинок",
			"eng": "Flame Blade"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/flame_blade",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовой топот",
			"eng": "Thunderous Stampede"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Магия лабиринта",
		"components": {
			"v": true
		},
		"url": "/spells/thunderous_stampede",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дар болтливости",
			"eng": "Gift of Gab"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/gift_of_gab",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Деформирующий снаряд",
			"eng": "Warp Bolt"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/warp_bolt",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дикая лоза",
			"eng": "Arm of the Wild"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/arm_of_the_wild",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Дорога виноградных лоз",
			"eng": "Vine Trestle"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/vine_trestle",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дребезги",
			"eng": "Shatter"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/shatter",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дубовая кора",
			"eng": "Barkskin"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/barkskin",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дыхание Борея",
			"eng": "Boreas's Breath"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Ротхенианская магия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/boreas's_breath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дыхание дракона",
			"eng": "Dragon's Breath"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dragon's_breath",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дьявольская плоть",
			"eng": "Fiend Flesh"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/fiend_flesh",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Животные чувства",
			"eng": "Beast Sense"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/beast_sense",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Завеса стрел",
			"eng": "Cordon of Arrows"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/cordon_of_arrows",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Заводной ключ",
			"eng": "Winding Key"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/winding_key",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Заимствованные знания",
			"eng": "Borrowed Knowledge"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/borrowed_knowledge",
		"source": {
			"shortName": "SCC",
			"name": "Стриксхейвен: Учебная программа хаоса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Заклинивание доспеха",
			"eng": "Lock Armor"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/lock_armor",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Заражающий удар",
			"eng": "Sporecaller's Smite"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/sporecaller's_smite",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Защита от яда",
			"eng": "Protection from Poison"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/protection_from_poison",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Защитный ветер",
			"eng": "Warding Wind"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/warding_wind",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Звукосотрясение",
			"eng": "Reverberate"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/reverberate",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Земляная хватка Максимилиана",
			"eng": "Maximilian's Earthen Grasp"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/maximilian's_earthen_grasp",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Исцеляющий дух",
			"eng": "Healing Spirit"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/healing_spirit",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Каменные кости",
			"eng": "Stone Bones"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/stone_bones",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Каменный шпиль",
			"eng": "Spire of Stone"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spire_of_stone",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Карман на запястье",
			"eng": "Wristpocket"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/wristpocket",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кипящее масло",
			"eng": "Boiling Oil"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/boiling_oil",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Клеймящая кара",
			"eng": "Branding Smite"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/branding_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Копыта ярости",
			"eng": "Furious Hooves"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Магия лабиринта",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/furious_hooves",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Корона безумия",
			"eng": "Crown of Madness"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/crown_of_madness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кража жизни",
			"eng": "Theft of Vitae"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/theft_of_vitae",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кровавый щит",
			"eng": "Sanguine Shield"
		},
		"level": 2,
		"school": "ограждение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/sanguine_shield",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кровопускание",
			"eng": "Bloodletter"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/bloodletter",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кручение",
			"eng": "Spin"
		},
		"level": 2,
		"school": "очарование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/spin",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Левитация",
			"eng": "Levitate"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/levitate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Лунный луч",
			"eng": "Moonbeam"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/moonbeam",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Луч слабости",
			"eng": "Ray of Enfeeblement"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/ray_of_enfeeblement",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Магическое оружие",
			"eng": "Magic Weapon"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/magic_weapon",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Малое восстановление",
			"eng": "Lesser Restoration"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/lesser_restoration",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Матч-реванш",
			"eng": "Grudge Match"
		},
		"level": 2,
		"school": "вызов",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/grudge_match",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мельфова кислотная стрела",
			"eng": "Melf's Acid Arrow"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/melf's_acid_arrow",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ментальный барьер",
			"eng": "Mental Barrier"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"url": "/spells/mental_barrier",
		"source": {
			"shortName": "UACDW",
			"name": "Unearthed Arcana: Жрец, Друид и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное защитное лезвие",
			"eng": "Mass Blade Ward"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mass_blade_ward",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Молебен лечения",
			"eng": "Prayer of Healing"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/prayer_of_healing",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Моментальная перезарядка Джетро",
			"eng": "Jethro's Instant Reload"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/jethro's_instant_reload",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мороз ледяной смерти",
			"eng": "Icingdeath's Frost"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/icingdeath's_frost",
		"source": {
			"shortName": "UA21DO",
			"name": "Unearthed Arcana: Драконьи варианты",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Муки любви",
			"eng": "Heartache"
		},
		"level": 2,
		"school": "очарование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/heartache",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мучительная цепь",
			"eng": "Bitter Chains"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/bitter_chains",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Найти транспорт",
			"eng": "Find Vehicle"
		},
		"level": 2,
		"school": "вызов",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/find_vehicle",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Небесные письмена",
			"eng": "Skywrite"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/skywrite",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Невидимость",
			"eng": "Invisibility"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/invisibility",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Невидимый казначей",
			"eng": "Unseen Accountant"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/unseen_accountant",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Неописуемый",
			"eng": "Nondescript"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/nondescript",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Неподвижный объект",
			"eng": "Immovable Objec"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/immovable_objec",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Нетленные останки",
			"eng": "Gentle Repose"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/gentle_repose",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нистулова ложная магия",
			"eng": "Nystul's Magic Aura"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/nystul's_magic_aura",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нюх на сокровища",
			"eng": "Enhance Greed"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/enhance_greed",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Обезоруживающий ветер",
			"eng": "Wresting Wind"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/wresting_wind",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Облако кинжалов",
			"eng": "Cloud of Daggers"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/cloud_of_daggers",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Область истины",
			"eng": "Zone of Truth"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/zone_of_truth",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение драконов",
			"eng": "Detect Dragons"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/detect_dragons",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение искажения",
			"eng": "Warp sense"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/warp_sense",
		"source": {
			"shortName": "SatO",
			"name": "Сигил и Внешние Земли",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обнаружение мыслей",
			"eng": "Detect Thoughts"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/detect_thoughts",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Общая жертва",
			"eng": "Shared Sacrifice"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/shared_sacrifice",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Озорство Натайра",
			"eng": "Nathair's Mischief"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/nathair's_mischief",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Остановка сердца",
			"eng": "Heartstop"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/heartstop",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Открывание",
			"eng": "Knock"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"url": "/spells/knock",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Отражения",
			"eng": "Mirror Image"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mirror_image",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Охраняющая связь",
			"eng": "Warding Bond"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/warding_bond",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Очищение пространства",
			"eng": "Clearing the Field"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/clearing_the_field",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Палящий луч",
			"eng": "Scorching Ray"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/scorching_ray",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Паук",
			"eng": "Spider Climb"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spider_climb",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Паутина",
			"eng": "Web"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/web",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пекло Аганаззара",
			"eng": "Aganazzar's Scorcher"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/aganazzar's_scorcher",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пиротехника",
			"eng": "Pyrotechnics"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/pyrotechnics",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Под лунным светом",
			"eng": "By the Light of the Moon"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/by_the_light_of_the_moon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подмога",
			"eng": "Aid"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/aid",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск животных или растений",
			"eng": "Locate Animals or Plants"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/locate_animals_or_plants",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск ловушек",
			"eng": "Find Traps"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/find_traps",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск предмета",
			"eng": "Locate Object"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/locate_object",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск скакуна",
			"eng": "Find Steed"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/find_steed",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Порог защиты",
			"eng": "Protect Threshold"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/protect_threshold",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Порыв ветра",
			"eng": "Gust of Wind"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/gust_of_wind",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Починка металла",
			"eng": "Repair Metal"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/repair_metal",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Почтовое животное",
			"eng": "Animal Messenger"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/animal_messenger",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Предупредительный окрик",
			"eng": "Warning Shout"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"v": true
		},
		"url": "/spells/warning_shout",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа зверя",
			"eng": "Summon Beast"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_beast",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятая стража",
			"eng": "Curse Ward"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/curse_ward",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пронзание разума",
			"eng": "Mind Spike"
		},
		"level": 2,
		"school": "прорицание",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/mind_spike",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Психическая плеть Таши",
			"eng": "Tasha's Mind Whip"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/tasha's_mind_whip",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пылающий шар",
			"eng": "Flaming Sphere"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/flaming_sphere",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пылевой вихрь",
			"eng": "Dust Devil"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dust_devil",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разбрасывание карт",
			"eng": "Spray of Cards UA"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/spray_of_cards_ua",
		"source": {
			"shortName": "UA22WotM",
			"name": "Unearthed Arcana: Чудеса Мультивселенной",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Разбрасывание карт",
			"eng": "Spray of Cards"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/spray_of_cards",
		"source": {
			"shortName": "BMT",
			"name": "Книга многих вещей",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Развалина",
			"eng": "Wrack"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wrack",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Размытый образ",
			"eng": "Blur"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/blur",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разрушительный резонанс",
			"eng": "Destructive Resonance"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/destructive_resonance",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Разрыв Лей",
			"eng": "Ley Disruption"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/ley_disruption",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Раскалённый металл",
			"eng": "Heat Metal"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/heat_metal",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Расщелина с сокровищами",
			"eng": "Treasure Chasm"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/treasure_chasm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Речь златоуста",
			"eng": "Enthrall"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/enthrall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рога стихий",
			"eng": "Elemental Horns"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/elemental_horns",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сверкающая монетка Джима",
			"eng": "Jim's Glowing Coin"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/jim's_glowing_coin",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сковывающий лед Райма",
			"eng": "Rime's Binding Ice"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/rime's_binding_ice",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Преклонись",
			"eng": "Power Word Kneel"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/power_word_kneel",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Смена обличья",
			"eng": "Alter Self"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/alter_self",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Смещающее отражение",
			"eng": "Negative Image"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/negative_image",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Снежный шквал Сниллока",
			"eng": "Snilloc's Snowball Swarm"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/snilloc's_snowball_swarm",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Совет Вотана",
			"eng": "Wotan's Rede"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/wotan's_rede",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сокрушительный топот",
			"eng": "Crushing Trample"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/crushing_trample",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сонная настойка",
			"eng": "Sleepy Tincture"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sleepy_tincture",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Стая фамильяров",
			"eng": "Flock of Familiars"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/flock_of_familiars",
		"source": {
			"shortName": "LLK",
			"name": "Потерянная лаборатория Квалиша",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Тёмная тропа",
			"eng": "Dark Path"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dark_path",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тёмное зрение",
			"eng": "Darkvision"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/darkvision",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Теневой клинок",
			"eng": "Shadow Blade"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/shadow_blade",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Теневые марионетки",
			"eng": "Shadow Puppets"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shadow_puppets",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тени на свету",
			"eng": "Shadows Brought to Light"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/shadows_brought_to_light",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тень",
			"eng": "Shade"
		},
		"level": 2,
		"school": "ограждение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/shade",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тишина",
			"eng": "Silence"
		},
		"level": 2,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/silence",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Тотемный колпак",
			"eng": "Totemic Cowl"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/totemic_cowl",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Траншея",
			"eng": "Trench"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/trench",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Трюк с верёвкой",
			"eng": "Rope Trick"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/rope_trick",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Туманный шаг",
			"eng": "Misty Step"
		},
		"level": 2,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/misty_step",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Тьма",
			"eng": "Darkness"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/darkness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Тяжёлые времена",
			"eng": "Bad Timing"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Магия Хаоса",
		"components": {
			"v": true
		},
		"url": "/spells/bad_timing",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Увеличение/уменьшение",
			"eng": "Enlarge or Reduce"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/enlarge_or_reduce",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Увлекательная прогулка",
			"eng": "Kinetic Jaunt"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/kinetic_jaunt",
		"source": {
			"shortName": "SCC",
			"name": "Стриксхейвен: Учебная программа хаоса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Увядание и цветение",
			"eng": "Wither and Bloom"
		},
		"level": 2,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/wither_and_bloom",
		"source": {
			"shortName": "SCC",
			"name": "Стриксхейвен: Учебная программа хаоса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Увядающая кара",
			"eng": "Wilting Smite"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Сангромантия",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/wilting_smite",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Удар гонга",
			"eng": "Rolling Thunder"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/rolling_thunder",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Удар разума",
			"eng": "Mind Thrust"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mind_thrust",
		"source": {
			"shortName": "UA20POR",
			"name": "Unearthed Arcana: Пересмотр псионических способностей",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Удержание личности",
			"eng": "Hold Person"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/hold_person",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Узы земли",
			"eng": "Earthbind"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/earthbind",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Узы Повелителей драконов",
			"eng": "Dragon Lord Bond"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/dragon_lord_bond",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Улучшение характеристики",
			"eng": "Enhance Ability"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/enhance_ability",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Умиротворение",
			"eng": "Calm Emotions"
		},
		"level": 2,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/calm_emotions",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ускользнуть",
			"eng": "Slither"
		},
		"level": 2,
		"school": "преобразование",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/slither",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хаотичная живучесть",
			"eng": "Chaotic Vitality"
		},
		"level": 2,
		"school": "воплощение",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/chaotic_vitality",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цветной клинок",
			"eng": "Chromatic blade"
		},
		"level": 2,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/chromatic_blade",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Цифровой фантом",
			"eng": "Digital Phantom"
		},
		"level": 2,
		"school": "ограждение",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/digital_phantom",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Чтоб тебе не свезло",
			"eng": "Unluck on That"
		},
		"level": 2,
		"school": "очарование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true
		},
		"url": "/spells/unluck_on_that",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Чувство жизненной силы",
			"eng": "Sense Lifeblood"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Сангромантия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/sense_lifeblood",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Чувство логова",
			"eng": "Lair Sense"
		},
		"level": 2,
		"school": "прорицание",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/lair_sense",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шар света",
			"eng": "Orb of Light"
		},
		"level": 2,
		"school": "вызов",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/orb_of_light",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шипы",
			"eng": "Spike Growth"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spike_growth",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Щит мыслей",
			"eng": "Thought Shield"
		},
		"level": 2,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/thought_shield",
		"source": {
			"shortName": "UACDW",
			"name": "Unearthed Arcana: Жрец, Друид и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Ядовитый залп",
			"eng": "Poisoned Volley"
		},
		"level": 2,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/poisoned_volley",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Аура живучести",
			"eng": "Aura of Vitality"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/aura_of_vitality",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Башня Галдера",
			"eng": "Galder's Tower"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/galder's_tower",
		"source": {
			"shortName": "LLK",
			"name": "Потерянная лаборатория Квалиша",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Безопасное расчлененние",
			"eng": "Benign Dismemberment"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/benign_dismemberment",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Безопасный вид",
			"eng": "Innocuous Aspect"
		},
		"level": 3,
		"school": "иллюзия",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/innocuous_aspect",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Быстрая дружба",
			"eng": "Fast Friends"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/fast_friends",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Внезапный рассвет",
			"eng": "Sudden Dawn"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/sudden_dawn",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Водяная стена",
			"eng": "Wall of Water"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_water",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Возрождение",
			"eng": "Revivify"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/revivify",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Восставший труп",
			"eng": "Animate Dead"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/animate_dead",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Враждебность",
			"eng": "Antagonize UA"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/antagonize_ua",
		"source": {
			"shortName": "UA22WotM",
			"name": "Unearthed Arcana: Чудеса Мультивселенной",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Враждебность",
			"eng": "Antagonize"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/antagonize",
		"source": {
			"shortName": "BMT",
			"name": "Книга многих вещей",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вывод из строя",
			"eng": "Haywire"
		},
		"level": 3,
		"school": "очарование",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/haywire",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов животных",
			"eng": "Conjure Animals"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_animals",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов заграждения",
			"eng": "Conjure Barrage"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/conjure_barrage",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов малого демона",
			"eng": "Conjure Lesser Demon"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_lesser_demon",
		"source": {
			"shortName": "UATOBM",
			"name": "Unearthed Arcana: Древняя черная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Газообразная форма",
			"eng": "Gaseous Form"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/gaseous_form",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гашение волны",
			"eng": "Surge Dampener"
		},
		"level": 3,
		"school": "ограждение",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/surge_dampener",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Гипнотический узор",
			"eng": "Hypnotic Pattern"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/hypnotic_pattern",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гнев горы",
			"eng": "Ire of the Mountain"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Ротхенианская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ire_of_the_mountain",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Голод Хадара",
			"eng": "Hunger of Hadar"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/hunger_of_hadar",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Громовая волна",
			"eng": "Thunderous Wave"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/thunderous_wave",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Громовой шаг",
			"eng": "Thunder Step"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/thunder_step",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дневной свет",
			"eng": "Daylight"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/daylight",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дрёма",
			"eng": "Catnap"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/catnap",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Духовные стражи",
			"eng": "Spirit Guardians"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spirit_guardians",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Жуткий вопль",
			"eng": "Dire Wail"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true
		},
		"url": "/spells/dire_wail",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Замедление",
			"eng": "Slow"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/slow",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Заросли терновника",
			"eng": "Engulfing Thorns"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/engulfing_thorns",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Застывшие лезвия",
			"eng": "Frozen Razors"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/frozen_razors",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от баллистики",
			"eng": "Protection from Ballistics"
		},
		"level": 3,
		"school": "ограждение",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/protection_from_ballistics",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от энергии",
			"eng": "Protection from Energy"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/protection_from_energy",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Звуковая волна",
			"eng": "Sonic Wave"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/sonic_wave",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Злобное оружие",
			"eng": "Spiteful Weapon"
		},
		"level": 3,
		"school": "некромантия",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spiteful_weapon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Зловонное облако",
			"eng": "Stinking Cloud"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/stinking_cloud",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Змеиный язык",
			"eng": "Serpent Tongue"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/serpent_tongue",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Извержение земли",
			"eng": "Erupting Earth"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/erupting_earth",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изобилие врагов",
			"eng": "Enemies Abound"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/enemies_abound",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кара Перуна",
			"eng": "Perun's Doom"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Ротхенианская магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/perun's_doom",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Карточный домик",
			"eng": "House of Cards"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/house_of_cards",
		"source": {
			"shortName": "UA22WotM",
			"name": "Unearthed Arcana: Чудеса Мультивселенной",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Клинок гнева",
			"eng": "Blade of Wrath"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/blade_of_wrath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кованный барьер",
			"eng": "Gloomwrought Barrier"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/gloomwrought_barrier",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Контрзаклинание",
			"eng": "Counterspell"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"s": true
		},
		"url": "/spells/counterspell",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Конус шипов",
			"eng": "Spray of Thorn"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/spray_of_thorn",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Крепость интеллекта",
			"eng": "Intellect Fortress"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/intellect_fortress",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кровавая марионетка",
			"eng": "Sanguine Poppet"
		},
		"level": 3,
		"school": "некромантия",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/sanguine_poppet",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кровные узы",
			"eng": "Blood Bond"
		},
		"level": 3,
		"school": "очарование",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/blood_bond",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Крошечный слуга",
			"eng": "Tiny Servant"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/tiny_servant",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Крутое течение",
			"eng": "Riptide"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/riptide",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Легион",
			"eng": "Legion"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/legion",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Леденящий туман",
			"eng": "Freezing Fog"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/freezing_fog",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Леомундова хижина",
			"eng": "Leomund's Tiny Hut"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/leomund's_tiny_hut",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Магический круг",
			"eng": "Magic Circle"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/magic_circle",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Малый лабиринт",
			"eng": "Maze, Lesser"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Магия лабиринта",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/maze,_lesser",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мантия крестоносца",
			"eng": "Crusader's Mantle"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/crusader's_mantle",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Маяк надежды",
			"eng": "Beacon of Hope"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/beacon_of_hope",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мгновенная лихорадка",
			"eng": "Flash Fever"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/flash_fever",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мельфовы маленькие метеоры",
			"eng": "Melf's Minute Meteors"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/melf's_minute_meteors",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мерцание",
			"eng": "Blink"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/blink",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Метель",
			"eng": "Sleet Storm"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/sleet_storm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Множественная хромая кляча",
			"eng": "Mass Hobble Mount"
		},
		"level": 3,
		"school": "некромантия",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/mass_hobble_mount",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное лечащее слово",
			"eng": "Mass Healing Word"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/mass_healing_word",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Молниевая стрела",
			"eng": "Lightning Arrow"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/lightning_arrow",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Молния",
			"eng": "Lightning Bolt"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/lightning_bolt",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мотивационная речь",
			"eng": "Motivational Speech"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/motivational_speech",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Наступление ночи",
			"eng": "Nightfall"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/nightfall",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Находка в тени",
			"eng": "Shadow Trove"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/shadow_trove",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Необнаружимость",
			"eng": "Nondetection"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/nondetection",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Образ",
			"eng": "Major Image"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/major_image",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огненный шар",
			"eng": "Fireball"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/fireball",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Осколки кристаллов",
			"eng": "Jeweled Fissure"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/jeweled_fissure",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ослепляющая кара",
			"eng": "Blinding Smite"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/blinding_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Остаточное изображение",
			"eng": "After Image"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/after_image",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Отсуствие на камерах",
			"eng": "Invisibility to Cameras"
		},
		"level": 3,
		"school": "иллюзия",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/invisibility_to_cameras",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Охранные руны",
			"eng": "Glyph of Warding"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/glyph_of_warding",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Очистка Контаминации",
			"eng": "Purge Contamination"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/purge_contamination",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ощущение Лей",
			"eng": "Ley Sense"
		},
		"level": 3,
		"school": "прорицание",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/ley_sense",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Падение",
			"eng": "Fell"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/fell",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Перегрузка",
			"eng": "Overclock"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/overclock",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Передача жизни",
			"eng": "Life Transference"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/life_transference",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Песня леса",
			"eng": "Song of the Forest"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/song_of_the_forest",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Песчаная стена",
			"eng": "Wall of Sand"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_sand",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пламенный шаг",
			"eng": "Flame Stride"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/flame_stride",
		"source": {
			"shortName": "UA21DO",
			"name": "Unearthed Arcana: Драконьи варианты",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Погребальная песнь повелителей драконов",
			"eng": "Funeral Song of the Dragonlords"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/funeral_song_of_the_dragonlords",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подводное дыхание",
			"eng": "Water Breathing"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/water_breathing",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Подсматривание",
			"eng": "Clairvoyance"
		},
		"level": 3,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/clairvoyance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поймать дыхание",
			"eng": "Catch the Breath"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Магия драконов",
		"components": {
			"v": true
		},
		"url": "/spells/catch_the_breath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Покров духа",
			"eng": "Spirit Shroud"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/spirit_shroud",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Полёт",
			"eng": "Fly"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/fly",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Помощь с фланга",
			"eng": "Outflanking Boon"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/outflanking_boon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Послание",
			"eng": "Sending"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sending",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поступь Ашардалона",
			"eng": "Ashardalon's Stride"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/ashardalon's_stride",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Превращение в животное",
			"eng": "Animal Shapes ODL"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/animal_shapes_odl",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Призрачный дракон",
			"eng": "Phantom Dragon"
		},
		"level": 3,
		"school": "иллюзия",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/phantom_dragon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Призрачный скакун",
			"eng": "Phantom Steed"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/phantom_steed",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа воителя",
			"eng": "Summon Warrior Spirit"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_warrior_spirit",
		"source": {
			"shortName": "UA22WotM",
			"name": "Unearthed Arcana: Чудеса Мультивселенной",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа нежити",
			"eng": "Summon Undead"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_undead",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа порождения теней",
			"eng": "Summon Shadowspawn"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_shadowspawn",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа феи",
			"eng": "Summon Fey"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_fey",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв молнии",
			"eng": "Call Lightning"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/call_lightning",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв низших демонов",
			"eng": "Summon Lesser Demons"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_lesser_demons",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв теневого мастиффа",
			"eng": "Call Shadow Mastiff"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/call_shadow_mastiff",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Прикосновение вампира",
			"eng": "Vampiric Touch"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/vampiric_touch",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Приливная волна",
			"eng": "Tidal Wave"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/tidal_wave",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Принуждённая судьба",
			"eng": "Compelling Fate"
		},
		"level": 3,
		"school": "прорицание",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/compelling_fate",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Притворная смерть",
			"eng": "Feign Death"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/feign_death",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пробуждение жадности",
			"eng": "Incite Greed"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/incite_greed",
		"source": {
			"shortName": "AI",
			"name": "Корпорация приобретений",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятие",
			"eng": "Bestow Curse"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/bestow_curse",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятье некомпетентности",
			"eng": "Curse of Incompetence"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/curse_of_incompetence",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пронзающий корень",
			"eng": "Skewering Branch"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/skewering_branch",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Проницательность геоманта",
			"eng": "Geomantic Discernment"
		},
		"level": 3,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/geomantic_discernment",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пространственный толчок",
			"eng": "Dimensional Shove"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/dimensional_shove",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Псионический заряд",
			"eng": "Psionic Blast"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/psionic_blast",
		"source": {
			"shortName": "UAFRW",
			"name": "Unearthed Arcana: Воин, Следопыт и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Пылающие стрелы",
			"eng": "Flame Arrows"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/flame_arrows",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разговор с мёртвыми",
			"eng": "Speak with Dead"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/speak_with_dead",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разговор с растениями",
			"eng": "Speak with Plants"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/speak_with_plants",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Разъедающий снаряд",
			"eng": "Corrosive bolt"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/corrosive_bolt",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Рассеивание магии",
			"eng": "Dispel Magic"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/dispel_magic",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Реанимация",
			"eng": "Reanimate"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/reanimate",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Рокот грома",
			"eng": "Thunder Rumble"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"s": true
		},
		"url": "/spells/thunder_rumble",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Рост растений",
			"eng": "Plant Growth"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/plant_growth",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Свобода волн",
			"eng": "Freedom of the Waves"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/freedom_of_the_waves",
		"source": {
			"shortName": "TDCS",
			"name": "Сеттинг кампании Тал`Дорей",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Связывание судеб",
			"eng": "Linking Destinies"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true
		},
		"url": "/spells/linking_destinies",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сила стаи",
			"eng": "Potency of the Pack"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/potency_of_the_pack",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Силовая волна",
			"eng": "Pulse Wave"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/pulse_wave",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Скачки по разломам",
			"eng": "Ride the Rifts"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ride_the_rifts",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слияние с камнем",
			"eng": "Meld Into Stone"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/meld_into_stone",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Смешанные чувства",
			"eng": "Confound Senses"
		},
		"level": 3,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/confound_senses",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Снятие проклятья",
			"eng": "Remove Curse"
		},
		"level": 3,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/remove_curse",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение пищи и воды",
			"eng": "Create Food and Water"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/create_food_and_water",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Спектральное прохождение",
			"eng": "Spectral Passage"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spectral_passage",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Спиритический сеанс",
			"eng": "Seance VSoS"
		},
		"level": 3,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/seance_vsos",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сталь героя",
			"eng": "Hero's Steel"
		},
		"level": 3,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hero's_steel",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Стена ветров",
			"eng": "Wind Wall"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wind_wall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Стихийное оружие",
			"eng": "Elemental Weapon"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/elemental_weapon",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Трясина",
			"eng": "Mire"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mire",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тысяча жал",
			"eng": "Thousand Darts"
		},
		"level": 3,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/thousand_darts",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Удар Пустоты",
			"eng": "Void Strike"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/void_strike",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Удушье",
			"eng": "Suffocate"
		},
		"level": 3,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/suffocate",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ужас",
			"eng": "Fear"
		},
		"level": 3,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/fear",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ускорение",
			"eng": "Haste"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/haste",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Успокоение шторма",
			"eng": "Calm of the Storm"
		},
		"level": 3,
		"school": "ограждение",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/calm_of_the_storm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хождение по воде",
			"eng": "Water Walk"
		},
		"level": 3,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/water_walk",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Шквал шестерней",
			"eng": "Gear Barrage"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/gear_barrage",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шторм погибели богов",
			"eng": "Storm God's Doom"
		},
		"level": 3,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/storm_god's_doom",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Щит звезды и тени",
			"eng": "Shield of Star and Shadow"
		},
		"level": 3,
		"school": "ограждение",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/shield_of_star_and_shadow",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Энергетический снаряд Лей",
			"eng": "Ley Energy Bolt"
		},
		"level": 3,
		"school": "воплощение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ley_energy_bolt",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Языки",
			"eng": "Tongues"
		},
		"level": 3,
		"school": "прорицание",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/tongues",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Абсолютный приказ",
			"eng": "Absolute Command"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/absolute_command",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Алый круг",
			"eng": "Circle of Scarlet"
		},
		"level": 4,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/circle_of_scarlet",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Аура жизни",
			"eng": "Aura of Life"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/aura_of_life",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Аура очищения",
			"eng": "Aura of Purity"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/aura_of_purity",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Болезненное сияние",
			"eng": "Sickening Radiance"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/sickening_radiance",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Быстрый курьер Галдера",
			"eng": "Galder's Speedy Courier"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/galder's_speedy_courier",
		"source": {
			"shortName": "LLK",
			"name": "Потерянная лаборатория Квалиша",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "В свете бдительной луны",
			"eng": "By the Light of the Watchful Moon"
		},
		"level": 4,
		"school": "прорицание",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/by_the_light_of_the_watchful_moon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вдохновляющая речь",
			"eng": "Inspiring Speech"
		},
		"level": 4,
		"school": "очарование",
		"additionalType": "Боевая магия",
		"components": {
			"v": true
		},
		"url": "/spells/inspiring_speech",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Верный пёс Морденкайнена",
			"eng": "Mordenkainen's Faithful Hound"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mordenkainen's_faithful_hound",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Власть над водами",
			"eng": "Control Water"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/control_water",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Водяная сфера",
			"eng": "Watery Sphere"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/watery_sphere",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Волна пламени",
			"eng": "Flame Wave"
		},
		"level": 4,
		"school": "вызов",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/flame_wave",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Воображаемый убийца",
			"eng": "Phantasmal Killer"
		},
		"level": 4,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/phantasmal_killer",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вращающиеся топоры",
			"eng": "Spinning Axes"
		},
		"level": 4,
		"school": "воплощение",
		"additionalType": "Магия колец",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/spinning_axes",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов Барлгура",
			"eng": "Conjure Barlgura"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/conjure_barlgura",
		"source": {
			"shortName": "UATOBM",
			"name": "Unearthed Arcana: Древняя черная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов лесных обитателей",
			"eng": "Conjure Woodland Beings"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_woodland_beings",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов малых древней",
			"eng": "Conjure Minor Plant Creatures"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_minor_plant_creatures",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Вызов малых элементалей",
			"eng": "Conjure Minor Elementals"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_minor_elementals",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов ноу-бота",
			"eng": "Conjure Knowbot"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/conjure_knowbot",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов теневого демона",
			"eng": "Conjure Shadow Demon"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_shadow_demon",
		"source": {
			"shortName": "UATOBM",
			"name": "Unearthed Arcana: Древняя черная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Высшая невидимость",
			"eng": "Greater Invisibility"
		},
		"level": 4,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/greater_invisibility",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гигантское насекомое",
			"eng": "Giant Insect"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/giant_insect",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Глиф лунной ловушки",
			"eng": "Moon Trap"
		},
		"level": 4,
		"school": "ограждение",
		"additionalType": "Магия Лабиринта",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/moon_trap",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Гравитационная воронка",
			"eng": "Gravity Sinkhole"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/gravity_sinkhole",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Град",
			"eng": "Ice Storm"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ice_storm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гремлины",
			"eng": "Gremlins"
		},
		"level": 4,
		"school": "воплощение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/gremlins",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Делериумный взрыв",
			"eng": "Delerium Blast"
		},
		"level": 4,
		"school": "воплощение",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/delerium_blast",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Древесный захват",
			"eng": "Tree Strike"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tree_strike",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Дробящие шестерни",
			"eng": "Grinding Gears"
		},
		"level": 4,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/grinding_gears",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дух Смерти",
			"eng": "Spirit of Death UA"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spirit_of_death_ua",
		"source": {
			"shortName": "UA22WotM",
			"name": "Unearthed Arcana: Чудеса Мультивселенной",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Дух Смерти",
			"eng": "Spirit of Death"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/spirit_of_death",
		"source": {
			"shortName": "BMT",
			"name": "Книга многих вещей",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Едкий шар",
			"eng": "Vitriolic Sphere"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/vitriolic_sphere",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Загнивающая чешуя",
			"eng": "Scale Rot"
		},
		"level": 4,
		"school": "некромантия",
		"additionalType": "Магия драконов",
		"components": {

		},
		"concentration": true,
		"url": "/spells/scale_rot",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Запечатывание врат",
			"eng": "Gate Seal"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/gate_seal",
		"source": {
			"shortName": "SatO",
			"name": "Сигил и Внешние Земли",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Записать память",
			"eng": "Write Memory"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/write_memory",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Защита от смерти",
			"eng": "Death Ward"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/death_ward",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изгнание",
			"eng": "Banishment"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/banishment",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изготовление",
			"eng": "Fabricate"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/fabricate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изменение формы камня",
			"eng": "Stone Shape"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/stone_shape",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Искажение гравитации",
			"eng": "Distort Gravity"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/distort_gravity",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Иссушающее дыхание",
			"eng": "Desiccating Breath"
		},
		"level": 4,
		"school": "вызов",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/desiccating_breath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кабинет Морденкайнена",
			"eng": "Mordenkainen's Private Sanctum"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mordenkainen's_private_sanctum",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Каменная кожа",
			"eng": "Stoneskin"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/stoneskin",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Клинок моего брата",
			"eng": "Blade of my Brother"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/blade_of_my_brother",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Колеблющееся мировоззрение",
			"eng": "Fluctuating Alignment"
		},
		"level": 4,
		"school": "очарование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/fluctuating_alignment",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Крылья дэва",
			"eng": "Deva's Wings"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/deva's_wings",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Леомундов потайной сундук",
			"eng": "Leomund's Secret Chest"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/leomund's_secret_chest",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ложное видение",
			"eng": "False Vision"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/false_vision",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Луч подавления жизни",
			"eng": "Ray of Life Suppression"
		},
		"level": 4,
		"school": "некромантия",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ray_of_life_suppression",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Магический глаз",
			"eng": "Arcane Eye"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/arcane_eye",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мгновенное осадное орудие",
			"eng": "Instant Siege Weapon"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/instant_siege_weapon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мираж",
			"eng": "Hallucinatory Terrain"
		},
		"level": 4,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/hallucinatory_terrain",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Небесная кара",
			"eng": "Supernal Smite"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/supernal_smite",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ночные кошмары",
			"eng": "Night Terrors"
		},
		"level": 4,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/night_terrors",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Облава на логово",
			"eng": "Raid the Lair"
		},
		"level": 4,
		"school": "ограждение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/raid_the_lair",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Облако спор",
			"eng": "Cloud of Spores"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/cloud_of_spores",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Облачение тени",
			"eng": "Shadow of Moil"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shadow_of_moil",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оглушающая кара",
			"eng": "Staggering Smite"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/staggering_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огненная стена",
			"eng": "Wall of Fire"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_fire",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Огненный поток",
			"eng": "Torrent of Fire"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/torrent_of_fire",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Огненный щит",
			"eng": "Fire Shield"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/fire_shield",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оружие Пустоты",
			"eng": "Nether Weapon"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/nether_weapon",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Оседлай молнию",
			"eng": "Ride the Lightning"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/ride_the_lightning",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Отилюков упругий шар",
			"eng": "Otiluke's Resilient Sphere"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/otiluke's_resilient_sphere",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Очарование монстра",
			"eng": "Charm Monster"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/charm_monster",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Паровой заряд",
			"eng": "Steam Blast"
		},
		"level": 4,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/steam_blast",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Переносящая дверь",
			"eng": "Dimension Door"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/dimension_door",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Перестановка",
			"eng": "Reposition"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/reposition",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Поглощение разума",
			"eng": "Consume Mind"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/consume_mind",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подчинение зверя",
			"eng": "Dominate Beast"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/dominate_beast",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск высшего скакуна",
			"eng": "Find Greater Steed"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/find_greater_steed",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск существа",
			"eng": "Locate Creature"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/locate_creature",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Превращение",
			"eng": "Polymorph"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/polymorph",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Предсказание",
			"eng": "Divination"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/divination",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв высшего демона",
			"eng": "Summon Greater Demon"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_greater_demon",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа аберрации",
			"eng": "Summon Aberration"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_aberration",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа конструкта",
			"eng": "Summon Construct"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_construct",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа элементалей",
			"eng": "Summon Elemental"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_elemental",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв табуна",
			"eng": "Hirvsth's Call"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hirvsth's_call",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Принуждение",
			"eng": "Compulsion"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/compulsion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятое прикосновение",
			"eng": "Accursed Touch"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/accursed_touch",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Проклятый дар",
			"eng": "Cursed Gift"
		},
		"level": 4,
		"school": "ограждение",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/cursed_gift",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятье стихий",
			"eng": "Elemental Bane"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/elemental_bane",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Психическое копье Раулотима",
			"eng": "Raulothim's Psychic Lance"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/raulothim's_psychic_lance",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рассеивание невидимости",
			"eng": "Invisibility Purge"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/invisibility_purge",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Свобода перемещения",
			"eng": "Freedom of Movement"
		},
		"level": 4,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/freedom_of_movement",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Связывающая клятва",
			"eng": "Binding Oath"
		},
		"level": 4,
		"school": "некромантия",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/binding_oath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Синхронность",
			"eng": "Synchronicity"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/synchronicity",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Системный бэкдор",
			"eng": "System Backdoor"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/system_backdoor",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Скольжение по земле",
			"eng": "Earthskimmer"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/earthskimmer",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Мучение",
			"eng": "Power Word Torment"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/power_word_torment",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Смятение",
			"eng": "Confusion"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/confusion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Снежный булыжник",
			"eng": "Snow Boulder"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/snow_boulder",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Страж веры",
			"eng": "Guardian of Faith"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/guardian_of_faith",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Страж природы",
			"eng": "Guardian of Nature"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/guardian_of_nature",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сумасбродный щит",
			"eng": "Wild Shield"
		},
		"level": 4,
		"school": "ограждение",
		"additionalType": "Магия Хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/wild_shield",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сфера бури",
			"eng": "Storm Sphere"
		},
		"level": 4,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/storm_sphere",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Тайны лабиринта",
			"eng": "Labyrinth Mastery"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/labyrinth_mastery",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Тёмное таинство",
			"eng": "Dark Sacrament"
		},
		"level": 4,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/dark_sacrament",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Теневое возмездие",
			"eng": "Shadowy Retribution"
		},
		"level": 4,
		"school": "некромантия",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/shadowy_retribution",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Теневые монстры",
			"eng": "Shadow Monsters"
		},
		"level": 4,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shadow_monsters",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Трепет судьбы",
			"eng": "Flickering Fate"
		},
		"level": 4,
		"school": "прорицание",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/flickering_fate",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ужасное предупреждение",
			"eng": "Dire Warning"
		},
		"level": 4,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/dire_warning",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Усыхание",
			"eng": "Blight"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/blight",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Форсированная эволюция",
			"eng": "Forced Evolution"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/forced_evolution",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хаотичная форма",
			"eng": "Chaotic Form"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/chaotic_form",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хрупкость",
			"eng": "Brittling"
		},
		"level": 4,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/brittling",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цепкая лоза",
			"eng": "Grasping Vine"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/grasping_vine",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Чёрная рука",
			"eng": "Black Hand"
		},
		"level": 4,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/black_hand",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Чтение памяти",
			"eng": "Read Memory"
		},
		"level": 4,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/read_memory",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шутка Ётуна",
			"eng": "Jotun's Jest"
		},
		"level": 4,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/jotun's_jest",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Эвардовы чёрные щупальца",
			"eng": "Evard's Black Tentacles"
		},
		"level": 4,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/evard's_black_tentacles",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Эго кнут",
			"eng": "Ego Whip"
		},
		"level": 4,
		"school": "очарование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/ego_whip",
		"source": {
			"shortName": "UAFRW",
			"name": "Unearthed Arcana: Воин, Следопыт и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Буря",
			"eng": "Thunderstorm"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Магия драконов",
		"components": {

		},
		"concentration": true,
		"url": "/spells/thunderstorm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Быстрый колчан",
			"eng": "Swift Quiver"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/swift_quiver",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вещий сон",
			"eng": "Dream"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/dream",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Власть над ветрами",
			"eng": "Control Winds"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/control_winds",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вложение заклинания",
			"eng": "Imbue Spell"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/imbue_spell",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Водоворот",
			"eng": "Maelstrom"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/maelstrom",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Врата в царство теней",
			"eng": "Shadow Realm Gateway"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/shadow_realm_gateway",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Временной сдвиг",
			"eng": "Temporal Shunt"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/temporal_shunt",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов взрослого древня",
			"eng": "Conjure Plant Creatures"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_plant_creatures",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Вызов Врока",
			"eng": "Conjure Vrock"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_vrock",
		"source": {
			"shortName": "UATOBM",
			"name": "Unearthed Arcana: Древняя черная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов залпа",
			"eng": "Conjure Volley"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/conjure_volley",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов элементаля",
			"eng": "Conjure Elemental"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_elemental",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Выключение",
			"eng": "Shutdown"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/shutdown",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Высшее восстановление",
			"eng": "Greater Restoration"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/greater_restoration",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гнев природы",
			"eng": "Wrath of Nature"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/wrath_of_nature",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Головоруб",
			"eng": "Vorpal Blade"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/vorpal_blade",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Далекий шаг",
			"eng": "Far Step"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/far_step",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дар Хёда",
			"eng": "Hod's Gift"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/hod's_gift",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Длань Бигби",
			"eng": "Bigby's Hand"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/bigby's_hand",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дождь клинков",
			"eng": "Rain of Blades"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/rain_of_blades",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Древесный путь",
			"eng": "Tree Stride"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/tree_stride",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Духовное разделение",
			"eng": "Spiritual Sundering"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/spiritual_sundering",
		"source": {
			"shortName": "LH",
			"name": "Лазерлама",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Дыхание могучего дракона",
			"eng": "Dragon Breath"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/dragon_breath",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Живые тени",
			"eng": "Living Shadows"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/living_shadows",
		"source": {
			"shortName": "DMf5E",
			"name": "Углубленная Магия для 5 редакции",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Завывание в лабиринте",
			"eng": "Labyrinthine Howl"
		},
		"level": 5,
		"school": "иллюзия",
		"additionalType": "Магия Лабиринта",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/labyrinthine_howl",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Заражение",
			"eng": "Contagion"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/contagion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Звёздный дождь",
			"eng": "Starfall"
		},
		"level": 5,
		"school": "вызов",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/starfall",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Знание легенд",
			"eng": "Legend Lore"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/legend_lore",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изгоняющая кара",
			"eng": "Banishing Smite"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/banishing_smite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изменение памяти",
			"eng": "Modify Memory"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/modify_memory",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изучение врага",
			"eng": "Scrutinize Foe"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/scrutinize_foe",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Инфернальный зов",
			"eng": "Infernal Calling"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/infernal_calling",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Испепеление",
			"eng": "Immolation"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/immolation",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Каменная стена",
			"eng": "Wall of Stone"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_stone",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кислотный дождь",
			"eng": "Acid Rain"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/acid_rain",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Когти земляного дракона",
			"eng": "Claws of the Earth Dragon"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true
		},
		"url": "/spells/claws_of_the_earth_dragon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Конус холода",
			"eng": "Cone of Cold"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/cone_of_cold",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кровопотеря",
			"eng": "Ensanguinate"
		},
		"level": 5,
		"school": "некромантия",
		"additionalType": "Ротхенианская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/ensanguinate",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Круг силы",
			"eng": "Circle of Power"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/circle_of_power",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Круг телепортации",
			"eng": "Teleportation Circle"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/teleportation_circle",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кусачий мороз",
			"eng": "Biting Frost"
		},
		"level": 5,
		"school": "вызов",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/biting_frost",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Магическое зеркало",
			"eng": "Magic Mirror"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/magic_mirror",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Маленькая смерть",
			"eng": "Little Death"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"s": true,
			"m": "exist"
		},
		"url": "/spells/little_death",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Малый импульс Лей",
			"eng": "Lesser ley Pulse"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/lesser_ley_pulse",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мгновенное укрепление",
			"eng": "Instant Fortification"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/instant_fortification",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ментальная связь Рэри",
			"eng": "Rary's Telepathic Bond"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/rary's_telepathic_bond",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Механическое единение",
			"eng": "Mechanical Union"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/mechanical_union",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Меч судьбы",
			"eng": "Sword of Destiny"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"v": true
		},
		"url": "/spells/sword_of_destiny",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Множественная починка металла",
			"eng": "Mass Repair Metal"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mass_repair_metal",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное гашение волны",
			"eng": "Mass Surge Dampener"
		},
		"level": 5,
		"school": "ограждение",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/mass_surge_dampener",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное лечение ран",
			"eng": "Mass Cure Wounds"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mass_cure_wounds",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Наблюдение",
			"eng": "Scrying"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/scrying",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нашествие насекомых",
			"eng": "Insect Plague"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/insect_plague",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Не сегодня!",
			"eng": "Not this Day!"
		},
		"level": 5,
		"school": "ограждение",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/not_this_day!",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Небесный огонь",
			"eng": "Flame Strike"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/flame_strike",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нейтрализующее поле",
			"eng": "Neutralizing Field"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/neutralizing_field",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Обессиливание",
			"eng": "Enervation"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/enervation",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Обет",
			"eng": "Geas"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/geas",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Облако смерти",
			"eng": "Cloudkill"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/cloudkill",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Общение",
			"eng": "Commune"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/commune",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Общение с городом",
			"eng": "Commune with City"
		},
		"level": 5,
		"school": "прорицание",
		"additionalType": "техномагия",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/commune_with_city",
		"source": {
			"shortName": "UAMM",
			"name": "Unearthed Arcana: Современная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Общение с природой",
			"eng": "Commune with Nature"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/commune_with_nature",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оживление",
			"eng": "Raise Dead"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/raise_dead",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Оживление вещей",
			"eng": "Animate Objects"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/animate_objects",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пиявка Лей",
			"eng": "Ley Leech"
		},
		"level": 5,
		"school": "некромантия",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ley_leech",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Планарные узы",
			"eng": "Planar Binding"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/planar_binding",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пляска смерти",
			"eng": "Danse Macabre"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/danse_macabre",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поглощение энергии",
			"eng": "Energy Absorption"
		},
		"level": 5,
		"school": "ограждение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/energy_absorption",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подчинение личности",
			"eng": "Dominate Person"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/dominate_person",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поражающая разум спора",
			"eng": "Mind Spore"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"ritual": true,
		"url": "/spells/mind_spore",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Посеять буйство",
			"eng": "Incite Riot"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/incite_riot",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Поток негативной энергии",
			"eng": "Negative Energy Flood"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/negative_energy_flood",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Преграда жизни",
			"eng": "Antilife Shell"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/antilife_shell",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Преобразование камня",
			"eng": "Transmute Rock"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/transmute_rock",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв густой дымки",
			"eng": "Conjure the Deep Haze"
		},
		"level": 5,
		"school": "вызов",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_the_deep_haze",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв Духа Дракона",
			"eng": "Summon Draconic Spirit"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_draconic_spirit",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа небожителей",
			"eng": "Summon Celestial"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_celestial",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Притворство",
			"eng": "Seeming"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/seeming",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пробуждение разума",
			"eng": "Awaken"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/awaken",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятое кольцо",
			"eng": "Curse Ring"
		},
		"level": 5,
		"school": "некромантия",
		"additionalType": "Магия колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/curse_ring",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пылающая колесница",
			"eng": "Blazing Chariot"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/blazing_chariot",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Радужный луч",
			"eng": "Prismatic Ray"
		},
		"level": 5,
		"school": "вызов",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/prismatic_ray",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Разрушительная волна",
			"eng": "Destructive Wave"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/destructive_wave",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рассвет",
			"eng": "Dawn"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dawn",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рассеивание добра и зла",
			"eng": "Dispel Evil and Good"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dispel_evil_and_good",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Реинкарнация",
			"eng": "Reincarnate"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/reincarnate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рой духов",
			"eng": "Spirit Swarm"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/spirit_swarm",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Свобода ветров",
			"eng": "Freedom of the Winds"
		},
		"level": 5,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/freedom_of_the_winds",
		"source": {
			"shortName": "TDCS",
			"name": "Сеттинг кампании Тал`Дорей",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Связанная речь",
			"eng": "Tongue Tied"
		},
		"level": 5,
		"school": "очарование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/tongue_tied",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Связь с иным миром",
			"eng": "Contact Other Plane"
		},
		"level": 5,
		"school": "прорицание",
		"components": {
			"v": true
		},
		"ritual": true,
		"url": "/spells/contact_other_plane",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Святая земля",
			"eng": "Holy Ground"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/holy_ground",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Святилище",
			"eng": "Hallow"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/hallow",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Священное оружие",
			"eng": "Holy Weapon"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/holy_weapon",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сдвиг вероятностей",
			"eng": "Shifting the Odds"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shifting_the_odds",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Силовая стена",
			"eng": "Wall of Force"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_force",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Синаптический разряд",
			"eng": "Synaptic Static"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/synaptic_static",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Смертность",
			"eng": "Mortality"
		},
		"level": 5,
		"school": "преобразование",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/mortality",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Создание прохода",
			"eng": "Passwall"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/passwall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Создание штурвала чарохода",
			"eng": "Creating spelljamming helm"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/creating_spelljamming_helm",
		"source": {
			"shortName": "AAG",
			"name": "Руководство астрального приключенца",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение",
			"eng": "Creation"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/creation",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Стена света",
			"eng": "Wall of Light"
		},
		"level": 5,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_light",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Телекинез",
			"eng": "Telekinesis"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/telekinesis",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Теневое помешательство",
			"eng": "Dark Dementing"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/dark_dementing",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Удар стального ветра",
			"eng": "Steel Wind Strike"
		},
		"level": 5,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/steel_wind_strike",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Удержание чудовища",
			"eng": "Hold Monster"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/hold_monster",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Усиление навыка",
			"eng": "Skill Empowerment"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/skill_empowerment",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Усиленное поле Лей",
			"eng": "Amplify Ley Field"
		},
		"level": 5,
		"school": "воплощение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/amplify_ley_field",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Фальшивый двойник",
			"eng": "Mislead"
		},
		"level": 5,
		"school": "иллюзия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/mislead",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Хватка Тьюпилака",
			"eng": "Grasp of the Tupilak"
		},
		"level": 5,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/grasp_of_the_tupilak",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цепи бога",
			"eng": "Chains of the Goddess"
		},
		"level": 5,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/chains_of_the_goddess",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Эйдетическая память",
			"eng": "Eidetic Memory"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"concentration": true,
		"url": "/spells/eidetic_memory",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ядовитое облачение",
			"eng": "Investiture of Venom"
		},
		"level": 5,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/investiture_of_venom",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Волшебный сосуд",
			"eng": "Magic Jar"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/magic_jar",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вторжение теней",
			"eng": "Encroaching Shadows"
		},
		"level": 6,
		"school": "воплощение",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/encroaching_shadows",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов феи",
			"eng": "Conjure Fey"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_fey",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Гравитационный разлом",
			"eng": "Gravity Fissure"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/gravity_fissure",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Движение почвы",
			"eng": "Move Earth"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/move_earth",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дромиджево появление",
			"eng": "Drawmij's Instant Summons"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/drawmij's_instant_summons",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Заданная иллюзия",
			"eng": "Programmed Illusion"
		},
		"level": 6,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/programmed_illusion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Запрет",
			"eng": "Forbiddance"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/forbiddance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Земляной червь",
			"eng": "Earth Worm"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/earth_worm",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Игра судьбы",
			"eng": "Game of Fate"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/game_of_fate",
		"source": {
			"shortName": "VSoS",
			"name": "Шпиль тайн Вальды",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Извлечение знаний",
			"eng": "Extract Knowledge"
		},
		"level": 6,
		"school": "некромантия",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/extract_knowledge",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Искатель сердец",
			"eng": "Heartseeker"
		},
		"level": 6,
		"school": "воплощение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/heartseeker",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Истинное зрение",
			"eng": "True Seeing"
		},
		"level": 6,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/true_seeing",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Клетка душ",
			"eng": "Soul Cage"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/soul_cage",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кольцо очарования",
			"eng": "Enchant Ring"
		},
		"level": 6,
		"school": "очарование",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/enchant_ring",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Корона света",
			"eng": "Crown of Radiance"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/crown_of_radiance",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Кости земли",
			"eng": "Bones of the Earth"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/bones_of_the_earth",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Крик баньши",
			"eng": "Banshee Wail"
		},
		"level": 6,
		"school": "некромантия",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/banshee_wail",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Круг смерти",
			"eng": "Circle of Death"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/circle_of_death",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ледяная стена",
			"eng": "Wall of Ice"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_ice",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Линия разлома",
			"eng": "Fault Line"
		},
		"level": 6,
		"school": "вызов",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/fault_line",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Луч Контаминации",
			"eng": "Ray of Contamination"
		},
		"level": 6,
		"school": "некромантия",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/ray_of_contamination",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Магические врата",
			"eng": "Arcane Gate"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/arcane_gate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ментальная тюрьма",
			"eng": "Mental Prison"
		},
		"level": 6,
		"school": "иллюзия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/mental_prison",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное внушение",
			"eng": "Mass Suggestion"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true,
			"m": "exist"
		},
		"url": "/spells/mass_suggestion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Могучее метание",
			"eng": "Powerful Throwing"
		},
		"level": 6,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/powerful_throwing",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Небесная корона",
			"eng": "Heavenly Crown"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/heavenly_crown",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Неудержимая пляска Отто",
			"eng": "Otto's Irresistible Dance"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/otto's_irresistible_dance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Облачение ветра",
			"eng": "Investiture of Wind"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/investiture_of_wind",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Облачение камня",
			"eng": "Investiture of Stone"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/investiture_of_stone",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Облачение льда",
			"eng": "Investiture of Ice"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/investiture_of_ice",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Облачение огня",
			"eng": "Investiture of Flame"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/investiture_of_flame",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Одеяние из осколков",
			"eng": "Robe of Shards"
		},
		"level": 6,
		"school": "ограждение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/robe_of_shards",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Окаменение",
			"eng": "Flesh to Stone"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/flesh_to_stone",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Отилюков ледяной шар",
			"eng": "Otiluke's Freezing Sphere"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/otiluke's_freezing_sphere",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Первородный страж",
			"eng": "Primordial Ward"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/primordial_ward",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Перенос Контаминации",
			"eng": "Siphon Contamination"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/siphon_contamination",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пир героев",
			"eng": "Heroes' Feast"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/heroes'_feast",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Планарный союзник",
			"eng": "Planar Ally"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/planar_ally",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Платиновый щит Фицбана",
			"eng": "Fizban's Platinum Shield"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/fizban's_platinum_shield",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пляшущая молния",
			"eng": "Chain Lightning"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/chain_lightning",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Погребение",
			"eng": "Entomb"
		},
		"level": 6,
		"school": "преобразование",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/entomb",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Поиск пути",
			"eng": "Find the Path"
		},
		"level": 6,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/find_the_path",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Полное исцеление",
			"eng": "Heal"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/heal",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поражение",
			"eng": "Harm"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/harm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Потусторонний облик Таши",
			"eng": "Tasha's Otherworldly Guise"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tasha's_otherworldly_guise",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Потусторонняя форма",
			"eng": "Otherworldly Form"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/otherworldly_form",
		"source": {
			"shortName": "UASMT",
			"name": "Unearthed Arcana: Заклинания и магические тату",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Предосторожность",
			"eng": "Contingency"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/contingency",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призыв духа исчадия",
			"eng": "Summon Fiend"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/summon_fiend",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Прогулка по извилистой тропе",
			"eng": "Walk the Twisted Path"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/walk_the_twisted_path",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятье Борея",
			"eng": "Curse of Boreas"
		},
		"level": 6,
		"school": "вызов",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/curse_of_boreas",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Психическое разрушение",
			"eng": "Psychic Crush"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/psychic_crush",
		"source": {
			"shortName": "UAFRW",
			"name": "Unearthed Arcana: Воин, Следопыт и Волшебник",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Путешествие через растения",
			"eng": "Transport via Plants"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/transport_via_plants",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пути дриады",
			"eng": "Dryad's Leap"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/dryad's_leap",
		"source": {
			"shortName": "PG",
			"name": "Путеводитель игрока: Прорастающий хаос",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Разящее око",
			"eng": "Eyebite"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/eyebite",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Раскидывание",
			"eng": "Scatter"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/scatter",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Распад",
			"eng": "Disintegrate"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/disintegrate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Роща друида",
			"eng": "Druid Grove"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/druid_grove",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Семена смерти",
			"eng": "Seeds of Death"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/seeds_of_death",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слово возврата",
			"eng": "Word of Recall"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/word_of_recall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Солнечный луч",
			"eng": "Sunbeam"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/sunbeam",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение гомункула",
			"eng": "Create Homunculus"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/create_homunculus",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сотворение нежити",
			"eng": "Create Undead"
		},
		"level": 6,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/create_undead",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Становление крылом ночи",
			"eng": "Become Nightwing"
		},
		"level": 6,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/become_nightwing",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Стена клинков",
			"eng": "Blade Barrier"
		},
		"level": 6,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/blade_barrier",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Стражи",
			"eng": "Guards and Wards"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/guards_and_wards",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сфера неуязвимости",
			"eng": "Globe of Invulnerability"
		},
		"level": 6,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/globe_of_invulnerability",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Терновая стена",
			"eng": "Wall of Thorns"
		},
		"level": 6,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/wall_of_thorns",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Трансформация Тензера",
			"eng": "Tenser's Transformation"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tenser's_transformation",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Управление льдом",
			"eng": "Icy Manipulation"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/icy_manipulation",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Утопление",
			"eng": "Drown"
		},
		"level": 6,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/drown",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хаотичный мир",
			"eng": "Chaotic World"
		},
		"level": 6,
		"school": "иллюзия",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/chaotic_world",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хлыст Лей",
			"eng": "Ley Whip"
		},
		"level": 6,
		"school": "вызов",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ley_whip",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хождение по ветру",
			"eng": "Wind Walk"
		},
		"level": 6,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/wind_walk",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Чёрный колодец",
			"eng": "Black Well"
		},
		"level": 6,
		"school": "некромантия",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/black_well",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Адский кованный",
			"eng": "Hellforging"
		},
		"level": 7,
		"school": "некромантия",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/hellforging",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Аспект дракона",
			"eng": "Aspect of the Dragon"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/aspect_of_the_dragon",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Безвременный двигатель",
			"eng": "Timeless Engine"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/timeless_engine",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Божественное слово",
			"eng": "Divine Word"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true
		},
		"url": "/spells/divine_word",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Большой импульс Лей",
			"eng": "Greater Ley Pulse"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/greater_ley_pulse",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Великолепный особняк Морденкайнена",
			"eng": "Mordenkainen's Magnificent Mansion"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mordenkainen's_magnificent_mansion",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Воскрешение",
			"eng": "Resurrection"
		},
		"level": 7,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/resurrection",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов небожителя",
			"eng": "Conjure Celestial"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_celestial",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов теневого титана",
			"eng": "Conjure Shadow Titan"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/conjure_shadow_titan",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Вызов Хезроу",
			"eng": "Conjure Hezrou"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/conjure_hezrou",
		"source": {
			"shortName": "UATOBM",
			"name": "Unearthed Arcana: Древняя черная магия",
			"group": {
				"name": "Тестовый материал",
				"shortName": "UA"
			}
		}
	},
	{
		"name": {
			"rus": "Вьюга",
			"eng": "Blizzard"
		},
		"level": 7,
		"school": "воплощение",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/blizzard",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Град щитов",
			"eng": "Volley Shield"
		},
		"level": 7,
		"school": "ограждение",
		"additionalType": "Магия лей-линий",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/volley_shield",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Движущаяся стена",
			"eng": "Walking Wall"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/walking_wall",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Драконоподобное превращение",
			"eng": "Draconic Transformation"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/draconic_transformation",
		"source": {
			"shortName": "FTD",
			"name": "Сокровищница драконов Фицбана",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Замедленный огненный шар",
			"eng": "Delayed Blast Fireball"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/delayed_blast_fireball",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Звёздное зрение",
			"eng": "Starry Vision"
		},
		"level": 7,
		"school": "прорицание",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/starry_vision",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Знак",
			"eng": "Symbol"
		},
		"level": 7,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/symbol",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изменение тяготения",
			"eng": "Reverse Gravity"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/reverse_gravity",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Изоляция",
			"eng": "Sequester"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sequester",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Иммунитет к Контаминации",
			"eng": "Contamination Immunity"
		},
		"level": 7,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/contamination_immunity",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Корона звёзд",
			"eng": "Crown of Stars"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/crown_of_stars",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ледяная хватка Пустоты",
			"eng": "Icy Grasp of the Void"
		},
		"level": 7,
		"school": "вызов",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/icy_grasp_of_the_void",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Меч Морденкайнена",
			"eng": "Mordenkainen's Sword"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/mordenkainen's_sword",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Неуправляемая трансформация",
			"eng": "Uncontrollable Transformation"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/uncontrollable_transformation",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Огненная буря",
			"eng": "Fire Storm"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/fire_storm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Октариновые брызги",
			"eng": "Octarine Spray"
		},
		"level": 7,
		"school": "воплощение",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/octarine_spray",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Охраняющее кольцо",
			"eng": "Ringward"
		},
		"level": 7,
		"school": "ограждение",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/ringward",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Перст смерти",
			"eng": "Finger of Death"
		},
		"level": 7,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/finger_of_death",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Печать святилища",
			"eng": "Seal of Sanctuary"
		},
		"level": 7,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/seal_of_sanctuary",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подобие",
			"eng": "Simulacrum"
		},
		"level": 7,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/simulacrum",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Поле энтропийного урона",
			"eng": "Entropic Damage Field"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/entropic_damage_field",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Последние лучи заходящего солнца",
			"eng": "Last Rays of the Dying Sun"
		},
		"level": 7,
		"school": "воплощение",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/last_rays_of_the_dying_sun",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Проекция",
			"eng": "Project Image"
		},
		"level": 7,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/project_image",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятие древесной кожи",
			"eng": "Arboreal Curse"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/arboreal_curse",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Проклятый прах",
			"eng": "Curse of Dust"
		},
		"level": 7,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/curse_of_dust",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Радужные брызги",
			"eng": "Prismatic Spray"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/prismatic_spray",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Регенерация",
			"eng": "Regenerate"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/regenerate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Связь сущностей",
			"eng": "Tether Essence"
		},
		"level": 7,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/tether_essence",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Символ чародейства",
			"eng": "Symbol of Sorcery"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/symbol_of_sorcery",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Боль",
			"eng": "Power Word Pain"
		},
		"level": 7,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/power_word_pain",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Смерч",
			"eng": "Whirlwind"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/whirlwind",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Создание магена",
			"eng": "Create Magen"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/create_magen",
		"source": {
			"shortName": "IDRotF",
			"name": "Долина Ледяного Ветра: Иней Морозной девы",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сон синей вуали",
			"eng": "Dream of the Blue Veil"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/dream_of_the_blue_veil",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Таинственный мираж",
			"eng": "Mirage Arcane"
		},
		"level": 7,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mirage_arcane",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Телепортация",
			"eng": "Teleport"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/teleport",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Торжество",
			"eng": "Celebration"
		},
		"level": 7,
		"school": "очарование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/celebration",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Триумф льда",
			"eng": "Triumph of Ice"
		},
		"level": 7,
		"school": "преобразование",
		"additionalType": "Рунная магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/triumph_of_ice",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Убийца легенд",
			"eng": "Legend Killer"
		},
		"level": 7,
		"school": "прорицание",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/legend_killer",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Узилище",
			"eng": "Forcecage"
		},
		"level": 7,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/forcecage",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Уход в иной мир",
			"eng": "Plane Shift"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/plane_shift",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Храм богов",
			"eng": "Temple of the Gods"
		},
		"level": 7,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/temple_of_the_gods",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Эфирность",
			"eng": "Etherealness"
		},
		"level": 7,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/etherealness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Алый дождь",
			"eng": "Red Rain"
		},
		"level": 8,
		"school": "ограждение",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/red_rain",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Антипатия/симпатия",
			"eng": "Antipathy or Sympathy"
		},
		"level": 8,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/antipathy_or_sympathy",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Аура святости",
			"eng": "Holy Aura"
		},
		"level": 8,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/holy_aura",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Брешь в реальности",
			"eng": "Reality Break"
		},
		"level": 8,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/reality_break",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Власть над погодой",
			"eng": "Control Weather"
		},
		"level": 8,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/control_weather",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Воспламеняющаяся туча",
			"eng": "Incendiary Cloud"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/incendiary_cloud",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Вредоносные волны",
			"eng": "Malevolent Waves"
		},
		"level": 8,
		"school": "ограждение",
		"additionalType": "Магия Тени",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/malevolent_waves",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Движение мирового колеса",
			"eng": "Move the Cosmic Wheel"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/move_the_cosmic_wheel",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Двойник",
			"eng": "Clone"
		},
		"level": 8,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/clone",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Демиплан",
			"eng": "Demiplane"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"s": true
		},
		"url": "/spells/demiplane",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дорогостоящая победа",
			"eng": "Costly Victory"
		},
		"level": 8,
		"school": "вызов",
		"additionalType": "Боевая магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/costly_victory",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Едкий ливень",
			"eng": "Caustic Torrent"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/caustic_torrent",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Землетрясение",
			"eng": "Earthquake"
		},
		"level": 8,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/earthquake",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Иллюзорный дракон",
			"eng": "Illusory Dragon"
		},
		"level": 8,
		"school": "иллюзия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/illusory_dragon",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Крадущаяся смерть",
			"eng": "Creeping Death"
		},
		"level": 8,
		"school": "некромантия",
		"components": {
			"s": true
		},
		"concentration": true,
		"url": "/spells/creeping_death",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Лабиринт",
			"eng": "Maze"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/maze",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ледяной каскад",
			"eng": "Glacial Cascade"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/glacial_cascade",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Магическое зрение",
			"eng": "Arcane Sight"
		},
		"level": 8,
		"school": "прорицание",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/arcane_sight",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Могучая крепость",
			"eng": "Mighty Fortress"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/mighty_fortress",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Находчивость",
			"eng": "Glibness"
		},
		"level": 8,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"url": "/spells/glibness",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Одуряющая тьма",
			"eng": "Maddening Darkness"
		},
		"level": 8,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/maddening_darkness",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Паровой свисток",
			"eng": "Steam Whistle"
		},
		"level": 8,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/steam_whistle",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Подчинение чудовища",
			"eng": "Dominate Monster"
		},
		"level": 8,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/dominate_monster",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Превращение в животных",
			"eng": "Animal Shapes"
		},
		"level": 8,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/animal_shapes",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Преграда магии",
			"eng": "Antimagic Field"
		},
		"level": 8,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/antimagic_field",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Призвать звезду",
			"eng": "Summon Star"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/summon_star",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Принесение механизма в жертву",
			"eng": "Machine Sacrifice"
		},
		"level": 8,
		"school": "вызов",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/machine_sacrifice",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Прыжок во времени",
			"eng": "Time Jump"
		},
		"level": 8,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/time_jump",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Разрушительная аура",
			"eng": "Disruptive Aura"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/disruptive_aura",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Резкий блик летнего света",
			"eng": "Harsh Light of Summer's Glare"
		},
		"level": 8,
		"school": "очарование",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/harsh_light_of_summer's_glare",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Свежевание",
			"eng": "Flense"
		},
		"level": 8,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/flense",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сила Контаминации",
			"eng": "Contaminated Power"
		},
		"level": 8,
		"school": "преобразование",
		"additionalType": "Контаминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/contaminated_power",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слабоумие",
			"eng": "Feeblemind"
		},
		"level": 8,
		"school": "очарование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/feeblemind",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Оглушение",
			"eng": "Power Word Stun"
		},
		"level": 8,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/power_word_stun",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Реконструкция",
			"eng": "Power Word Restore"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/power_word_restore",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Смертельное жало",
			"eng": "Deadly Sting"
		},
		"level": 8,
		"school": "преобразование",
		"additionalType": "Магия драконов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/deadly_sting",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Создание слуги кольца",
			"eng": "Create Ring Servant"
		},
		"level": 8,
		"school": "преобразование",
		"additionalType": "Магия колец",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/create_ring_servant",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сокрытие разума",
			"eng": "Mind Blank"
		},
		"level": 8,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mind_blank",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Солнечный ожог",
			"eng": "Sunburst"
		},
		"level": 8,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sunburst",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Стена Сумрака",
			"eng": "Wall of Gloom"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/wall_of_gloom",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Телепатия",
			"eng": "Telepathy"
		},
		"level": 8,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/telepathy",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Темная звезда",
			"eng": "Dark Star"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/dark_star",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Увядание",
			"eng": "Desolation"
		},
		"level": 8,
		"school": "некромантия",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/desolation",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ужасное увядание Аби-Далзима",
			"eng": "Abi-Dalzim's Horrid Wilting"
		},
		"level": 8,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/abi-dalzim's_horrid_wilting",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Цветение",
			"eng": "Bloom"
		},
		"level": 8,
		"school": "воплощение",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/bloom",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цунами",
			"eng": "Tsunami"
		},
		"level": 8,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/tsunami",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Эталон хаоса",
			"eng": "Paragon of Chaos"
		},
		"level": 8,
		"school": "преобразование",
		"additionalType": "Магия хаоса",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/paragon_of_chaos",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Большой лабиринт",
			"eng": "Maze, Greater"
		},
		"level": 9,
		"school": "воплощение",
		"additionalType": "Магия Лабиринта",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/maze,_greater",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Великая печать святилища",
			"eng": "Greater Seal of Sanctuary"
		},
		"level": 9,
		"school": "ограждение",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/greater_seal_of_sanctuary",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Врата",
			"eng": "Gate"
		},
		"level": 9,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/gate",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Время в бутылке",
			"eng": "Time in a Bottle"
		},
		"level": 9,
		"school": "преобразование",
		"additionalType": "Механомагия",
		"components": {
			"v": true
		},
		"concentration": true,
		"url": "/spells/time_in_a_bottle",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Гроза гнева",
			"eng": "Storm of Vengeance"
		},
		"level": 9,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/storm_of_vengeance",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дань Маммона",
			"eng": "Mammon's Due"
		},
		"level": 9,
		"school": "воплощение",
		"additionalType": "Ротхенианская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/mammon's_due",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Заточение",
			"eng": "Imprisonment"
		},
		"level": 9,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/imprisonment",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Исполнение желаний",
			"eng": "Wish"
		},
		"level": 9,
		"school": "вызов",
		"components": {
			"v": true
		},
		"url": "/spells/wish",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Истинное воскрешение",
			"eng": "True Resurrection"
		},
		"level": 9,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/true_resurrection",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Истинное превращение",
			"eng": "True Polymorph"
		},
		"level": 9,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/true_polymorph",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Источник Лей",
			"eng": "Ley Surge"
		},
		"level": 9,
		"school": "вызов",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/ley_surge",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Квинтэссенция",
			"eng": "Quintessence"
		},
		"level": 9,
		"school": "преобразование",
		"additionalType": "Ангельская магия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/quintessence",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Клинок разрушения",
			"eng": "Blade of Disaster"
		},
		"level": 9,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/blade_of_disaster",
		"source": {
			"shortName": "TCE",
			"name": "Котел Таши со всякой всячиной",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кольцо разрушения",
			"eng": "Circle of Devastation"
		},
		"level": 9,
		"school": "воплощение",
		"additionalType": "Магия Колец",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/circle_of_devastation",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Линия боли",
			"eng": "Afflict Line"
		},
		"level": 9,
		"school": "некромантия",
		"additionalType": "Высшая эльфийская магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/afflict_line",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Личина богов",
			"eng": "Form of the Gods"
		},
		"level": 9,
		"school": "преобразование",
		"additionalType": "Магия иероглифов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/form_of_the_gods",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Метеоритный дождь",
			"eng": "Meteor Swarm"
		},
		"level": 9,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/meteor_swarm",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мировоззрение космоса",
			"eng": "Cosmic Alignment"
		},
		"level": 9,
		"school": "воплощение",
		"additionalType": "Иллюминация",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"ritual": true,
		"url": "/spells/cosmic_alignment",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное полное исцеление",
			"eng": "Mass Heal"
		},
		"level": 9,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/mass_heal",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Множественное превращение",
			"eng": "Mass Polymorph"
		},
		"level": 9,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/mass_polymorph",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Неуязвимость",
			"eng": "Invulnerability"
		},
		"level": 9,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/invulnerability",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Остановка времени",
			"eng": "Time Stop"
		},
		"level": 9,
		"school": "преобразование",
		"components": {
			"v": true
		},
		"url": "/spells/time_stop",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пироклазм",
			"eng": "Pyroclasm"
		},
		"level": 9,
		"school": "вызов",
		"additionalType": "Стихийная магия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/pyroclasm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пламя феникса",
			"eng": "Phoenix Flames"
		},
		"level": 9,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/phoenix_flames",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Полное превращение",
			"eng": "Shapechange"
		},
		"level": 9,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/shapechange",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Предвидение",
			"eng": "Foresight"
		},
		"level": 9,
		"school": "прорицание",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/foresight",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Проекция в астрал",
			"eng": "Astral Projection"
		},
		"level": 9,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/astral_projection",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Психический крик",
			"eng": "Psychic Scream"
		},
		"level": 9,
		"school": "очарование",
		"components": {
			"s": true
		},
		"url": "/spells/psychic_scream",
		"source": {
			"shortName": "XGE",
			"name": "Руководство Занатара обо всем",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Радужная стена",
			"eng": "Prismatic Wall"
		},
		"level": 9,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/prismatic_wall",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ревущая бездна",
			"eng": "Ravenous Void"
		},
		"level": 9,
		"school": "вызов",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"concentration": true,
		"url": "/spells/ravenous_void",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сердце звезды",
			"eng": "Star's Heart"
		},
		"level": 9,
		"school": "преобразование",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/star's_heart",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Исцеление",
			"eng": "Power Word Heal"
		},
		"level": 9,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true
		},
		"url": "/spells/power_word_heal",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Слово силы: Смерть",
			"eng": "Power Word Kill"
		},
		"level": 9,
		"school": "очарование",
		"components": {
			"v": true
		},
		"url": "/spells/power_word_kill",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Смертный ужас",
			"eng": "Weird"
		},
		"level": 9,
		"school": "иллюзия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/weird",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Таинство падающего огня",
			"eng": "Sacrament of the Falling Fire"
		},
		"level": 9,
		"school": "ограждение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/sacrament_of_the_falling_fire",
		"source": {
			"shortName": "DoDk",
			"name": "Подземелья Драккенхайма",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Теневая буря",
			"eng": "Umbral Storm"
		},
		"level": 9,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/umbral_storm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Теогенез",
			"eng": "Theogenesis"
		},
		"level": 9,
		"school": "воплощение",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/theogenesis",
		"source": {
			"shortName": "ODL",
			"name": "Одиссея Повелителей драконов",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Украсть бессмертие",
			"eng": "Steal Immortality"
		},
		"level": 9,
		"school": "преобразование",
		"additionalType": "Сангромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/steal_immortality",
		"source": {
			"shortName": "GHtPG",
			"name": "Руководство игрока в Мрачной лощине",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Утрата времени",
			"eng": "Time Ravage"
		},
		"level": 9,
		"school": "некромантия",
		"components": {
			"v": true,
			"s": true,
			"m": "exist"
		},
		"url": "/spells/time_ravage",
		"source": {
			"shortName": "EGtW",
			"name": "Путеводитель исследователя по Дикогорью",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шторм Лей",
			"eng": "Ley Storm"
		},
		"level": 9,
		"school": "воплощение",
		"additionalType": "Лей-линии",
		"components": {
			"v": true,
			"s": true
		},
		"concentration": true,
		"url": "/spells/ley_storm",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	}
];
