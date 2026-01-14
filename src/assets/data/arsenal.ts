import type { SmallWeapon } from "../../domain/models/weapon/SmallWeapon";

export const baseArsenal: SmallWeapon[] = [
	{
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
	},
	{
		"name": {
			"rus": "Арбалет, лёгкий",
			"eng": "Crossbow, light"
		},
		"url": "/weapons/crossbow,_light",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Арбалет, ручной",
			"eng": "Crossbow, hand"
		},
		"url": "/weapons/crossbow,_hand",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "75 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Арбалет, тяжёлый",
			"eng": "Crossbow, heavy"
		},
		"url": "/weapons/crossbow,_heavy",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Баржевое весло",
			"eng": "Barge Pole"
		},
		"url": "/weapons/barge_pole",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "дробящий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Боевая кирка",
			"eng": "War Pick"
		},
		"url": "/weapons/war_pick",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
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
	},
	{
		"name": {
			"rus": "Боевая коса",
			"eng": "Battle Scythe"
		},
		"url": "/weapons/battle_scythe",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "1 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Боевой молот",
			"eng": "Warhammer"
		},
		"url": "/weapons/warhammer",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "дробящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Боевой посох",
			"eng": "Quarterstaff"
		},
		"url": "/weapons/quarterstaff",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "дробящий"
		},
		"price": "2 см.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Боевой топор",
			"eng": "Battleaxe"
		},
		"url": "/weapons/battleaxe",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Бола",
			"eng": "Bola"
		},
		"url": "/weapons/bola",
		"homebrew": true,
		"type": {
			"name": "Экзотическое дальнобойное оружие",
			"order": 5
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Болас",
			"eng": "Bolas"
		},
		"url": "/weapons/bolas",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"type": "без урона"
		},
		"price": "5 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Большой длинный лук",
			"eng": "Oversized Longbow"
		},
		"url": "/weapons/oversized_longbow",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "2к6",
			"type": "колющий"
		},
		"price": "300 зм.",
		"source": {
			"shortName": "WDH",
			"name": "Глубоководье: Драконий Куш",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
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
	},
	{
		"name": {
			"rus": "Бумеранг",
			"eng": "Boomerang"
		},
		"url": "/weapons/boomerang",
		"homebrew": true,
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "3 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Гарпун",
			"eng": "Harpoon"
		},
		"url": "/weapons/harpoon",
		"homebrew": true,
		"type": {
			"name": "Экзотическое рукопашное оружие",
			"order": 4
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
		},
		"price": "8 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Глефа",
			"eng": "Glaive"
		},
		"url": "/weapons/glaive",
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
	},
	{
		"name": {
			"rus": "Гранитная перчатка",
			"eng": "Granite First"
		},
		"url": "/weapons/granite_first",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дварфийский тижино",
			"eng": "Dwarven Tijino"
		},
		"url": "/weapons/dwarven_tijino",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Двойной топор",
			"eng": "Double Axe"
		},
		"url": "/weapons/double_axe",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дворфийская аркебуза",
			"eng": "Dwarven Arquebus"
		},
		"url": "/weapons/dwarven_arquebus",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "2к6",
			"type": "колющий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дворфийский револьверный мушкет",
			"eng": "Dwarven Revolving Musket"
		},
		"url": "/weapons/dwarven_revolving_musket",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "200 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Дворфийский топор",
			"eng": "Dwarven Axe"
		},
		"url": "/weapons/dwarven_axe",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Двуручная Секира Норманш",
			"eng": "Nordmansch Greataxe"
		},
		"url": "/weapons/nordmansch_greataxe",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к12",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Двуручный меч",
			"eng": "Greatsword"
		},
		"url": "/weapons/greatsword",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к6",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Джитте",
			"eng": "Jitte"
		},
		"url": "/weapons/jitte",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "5 см.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Дикама",
			"eng": "Dikama Fang Blade"
		},
		"url": "/weapons/dikama_fang_blade",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Длинное копьё",
			"eng": "Lance"
		},
		"url": "/weapons/lance",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к12",
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
		}
	},
	{
		"name": {
			"rus": "Длинный лук",
			"eng": "Longbow"
		},
		"url": "/weapons/longbow",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Длинный меч",
			"eng": "Longsword"
		},
		"url": "/weapons/longsword",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дротик",
			"eng": "Dart"
		},
		"url": "/weapons/dart",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "5 мм.",
		"source": {
			"shortName": "PHB",
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
			"eng": "Club"
		},
		"url": "/weapons/club",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Дубинчатый щит",
			"eng": "Club Shield"
		},
		"url": "/weapons/club_shield",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
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
			}
		}
	},
	{
		"name": {
			"rus": "Заводной арбалет",
			"eng": "Clockwork Crossbow"
		},
		"url": "/weapons/clockwork_crossbow",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Каменные грабли",
			"eng": "Stone Rake"
		},
		"url": "/weapons/stone_rake",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "5 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Катана",
			"eng": "Katana"
		},
		"url": "/weapons/katana",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Катар",
			"eng": "Qatar"
		},
		"url": "/weapons/qatar",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "7 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Кинжал",
			"eng": "Dagger"
		},
		"url": "/weapons/dagger",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Кинжал, в носке ботинка",
			"eng": "Dagger, in the toe of a boot"
		},
		"url": "/weapons/dagger,_in_the_toe_of_a_boot",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Кинжал, на запястье",
			"eng": "Dagger, on the wrist"
		},
		"url": "/weapons/dagger,_on_the_wrist",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Кнут",
			"eng": "Whip"
		},
		"url": "/weapons/whip",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Когти",
			"eng": "Claws"
		},
		"url": "/weapons/claws",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "5 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Композитный лук",
			"eng": "Composite Bow"
		},
		"url": "/weapons/composite_bow",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к12",
			"type": "колющий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Копьё",
			"eng": "Spear"
		},
		"url": "/weapons/spear",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "1 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Короткий лук",
			"eng": "Shortbow"
		},
		"url": "/weapons/shortbow",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Короткий меч",
			"eng": "Shortsword"
		},
		"url": "/weapons/shortsword",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
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
		}
	},
	{
		"name": {
			"rus": "Коса",
			"eng": "Scythe"
		},
		"url": "/weapons/scythe",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к10",
			"type": "рубящий"
		},
		"price": "20 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Кусаригама",
			"eng": "Kusarigama"
		},
		"url": "/weapons/kusarigama",
		"homebrew": true,
		"type": {
			"name": "Экзотическое рукопашное оружие",
			"order": 4
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Легкая кирка",
			"eng": "Light Pick"
		},
		"url": "/weapons/light_pick",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "3 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Лёгкий молот",
			"eng": "Light Hammer"
		},
		"url": "/weapons/light_hammer",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Метательное копьё",
			"eng": "Javelin"
		},
		"url": "/weapons/javelin",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "5 см.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Меч, с двумя клинками",
			"eng": "Sword, with Two Blades"
		},
		"url": "/weapons/sword,_with_two_blades",
		"homebrew": true,
		"type": {
			"name": "Экзотическое рукопашное оружие",
			"order": 4
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Меч, трость",
			"eng": "Sword, cane"
		},
		"url": "/weapons/sword,_cane",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "20 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Многозарядный арбалет (ручной)",
			"eng": "Multi-shot Crossbow (manual)"
		},
		"url": "/weapons/multi-shot_crossbow_(manual)",
		"homebrew": true,
		"type": {
			"name": "Экзотическое дальнобойное оружие",
			"order": 5
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Многозарядный арбалет (тяжелый)",
			"eng": "Repeating Crossbow (Heavy)"
		},
		"url": "/weapons/repeating_crossbow_(heavy)",
		"homebrew": true,
		"type": {
			"name": "Экзотическое дальнобойное оружие",
			"order": 5
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
		},
		"price": "75 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Молот",
			"eng": "Maul"
		},
		"url": "/weapons/maul",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к6",
			"type": "дробящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Моргенштерн",
			"eng": "Morningstar"
		},
		"url": "/weapons/morningstar",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Мушкет",
			"eng": "Musket ToH"
		},
		"url": "/weapons/musket_toh",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Мушкет",
			"eng": "Musket"
		},
		"url": "/weapons/musket",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к12",
			"type": "колющий"
		},
		"price": "500 зм.",
		"source": {
			"shortName": "DMG",
			"name": "Руководство мастера",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Нож на запястье",
			"eng": "Wrist Knife"
		},
		"url": "/weapons/wrist_knife",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "4 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Нунчаки",
			"eng": "Nunchucks"
		},
		"url": "/weapons/nunchucks",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "дробящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Нурианский крюк",
			"eng": "Nurian Hook"
		},
		"url": "/weapons/nurian_hook",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "6 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Палица",
			"eng": "Greatclub"
		},
		"url": "/weapons/greatclub",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к8",
			"type": "дробящий"
		},
		"price": "2 см.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Перчатки САП",
			"eng": "SAP Gloves"
		},
		"url": "/weapons/sap_gloves",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Пика",
			"eng": "Pike"
		},
		"url": "/weapons/pike",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
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
	},
	{
		"name": {
			"rus": "Пистолет, автоматический",
			"eng": "Pistol, automatic"
		},
		"url": "/weapons/pistol,_automatic",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "2к6",
			"type": "колющий"
		},
		"price": "0 зм.",
		"source": {
			"shortName": "DMG",
			"name": "Руководство мастера",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пистоль",
			"eng": "Pistol"
		},
		"url": "/weapons/pistol",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к10",
			"type": "колющий"
		},
		"price": "250 зм.",
		"source": {
			"shortName": "DMG",
			"name": "Руководство мастера",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Пистоль",
			"eng": "Pistol ToH"
		},
		"url": "/weapons/pistol_toh",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Пневматическая боевая кирка",
			"eng": "Pneumatic War Pick"
		},
		"url": "/weapons/pneumatic_war_pick",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "колющий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Полноценный клинок",
			"eng": "Full Blade"
		},
		"url": "/weapons/full_blade",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к8",
			"type": "рубящий"
		},
		"price": "150 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Полуторный меч",
			"eng": "Bastard Sword"
		},
		"url": "/weapons/bastard_sword",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к10",
			"type": "рубящий"
		},
		"price": "125 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Праща",
			"eng": "Sling"
		},
		"url": "/weapons/sling",
		"type": {
			"name": "Простое дальнобойное",
			"order": 1
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Рапира",
			"eng": "Rapier"
		},
		"url": "/weapons/rapier",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Ротхенианский поньерд",
			"eng": "Rothenian Poniard"
		},
		"url": "/weapons/rothenian_poniard",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "колющий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Ручной топор",
			"eng": "Handaxe"
		},
		"url": "/weapons/handaxe",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
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
	},
	{
		"name": {
			"rus": "Секира",
			"eng": "Greataxe"
		},
		"url": "/weapons/greataxe",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к12",
			"type": "рубящий"
		},
		"price": "30 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Серп",
			"eng": "Sickle"
		},
		"url": "/weapons/sickle",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "1 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Сеть",
			"eng": "Net"
		},
		"url": "/weapons/net",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"type": "без урона"
		},
		"price": "1 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Скалолазное тесло",
			"eng": "Climbing Adze"
		},
		"url": "/weapons/climbing_adze",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "6 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Скимитар",
			"eng": "Scimitar"
		},
		"url": "/weapons/scimitar",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Скимитар с двумя лезвиями",
			"eng": "Double-Bladed Scimitar"
		},
		"url": "/weapons/double-bladed_scimitar",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "рубящий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "ERLW",
			"name": "Эберрон. Из пепла Последней войны",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Соединённые клинки",
			"eng": "Joining Dirks"
		},
		"url": "/weapons/joining_dirks",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Стилет скорпиона",
			"eng": "Scorpion Stiletto"
		},
		"url": "/weapons/scorpion_stiletto",
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "0 зм.",
		"source": {
			"shortName": "MHH",
			"name": "Мидгард Справочник героя",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Сюрикен",
			"eng": "Shuriken"
		},
		"url": "/weapons/shuriken",
		"homebrew": true,
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Томагавк",
			"eng": "Tomahawk"
		},
		"url": "/weapons/tomahawk",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Тонфа",
			"eng": "Tonfa"
		},
		"url": "/weapons/tonfa",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "дробящий"
		},
		"price": "7 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Топоркопье",
			"eng": "Axespear"
		},
		"url": "/weapons/axespear",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Трезубец",
			"eng": "Trident"
		},
		"url": "/weapons/trident",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
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
	},
	{
		"name": {
			"rus": "Тычковый нож",
			"eng": "Push Knife"
		},
		"url": "/weapons/push_knife",
		"homebrew": true,
		"type": {
			"name": "Простое рукопашное",
			"order": 0
		},
		"damage": {
			"dice": "1к4",
			"type": "колющий"
		},
		"price": "2 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Тяжёлый цеп",
			"eng": "Heavy Flail"
		},
		"url": "/weapons/heavy_flail",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к6",
			"type": "дробящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Фальшион",
			"eng": "Falchion"
		},
		"url": "/weapons/falchion",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "рубящий"
		},
		"price": "75 зм.",
		"source": {
			"shortName": "DMGi",
			"name": "Гильдия Мастеров Подземелья",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Хлыст из шелка",
			"eng": "Wormsilk Whip"
		},
		"url": "/weapons/wormsilk_whip",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хлыстовая пила",
			"eng": "Whipsaw"
		},
		"url": "/weapons/whipsaw",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хопеш",
			"eng": "Khopesh"
		},
		"url": "/weapons/khopesh",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "рубящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Хопеш",
			"eng": "Khopesh ToH"
		},
		"url": "/weapons/khopesh_toh",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "25 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Храмовый меч",
			"eng": "Temple Sword"
		},
		"url": "/weapons/temple_sword",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "35 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Хупак",
			"eng": "Hoopak"
		},
		"url": "/weapons/hoopak",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "1 см.",
		"source": {
			"shortName": "DSotDQ",
			"name": "Драконье копье: Тень Королевы Драконов",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Цеп",
			"eng": "Flail"
		},
		"url": "/weapons/flail",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "дробящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "PHB",
			"name": "Книга игрока",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Цепной крюк",
			"eng": "Chain Hook"
		},
		"url": "/weapons/chain_hook",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Цепь, с шипами",
			"eng": "Chain with Spikes"
		},
		"url": "/weapons/chain_with_spikes",
		"homebrew": true,
		"type": {
			"name": "Экзотическое рукопашное оружие",
			"order": 4
		},
		"damage": {
			"dice": "2к4",
			"type": "колющий"
		},
		"price": "30 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Цзянь, меч",
			"eng": "Jian, sword"
		},
		"url": "/weapons/jian,_sword",
		"homebrew": true,
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "15 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Чакрам",
			"eng": "Chakram Exotic"
		},
		"url": "/weapons/chakram_exotic",
		"homebrew": true,
		"type": {
			"name": "Экзотическое рукопашное оружие",
			"order": 4
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "EEW",
			"name": "Расширенное и экзотическое оружие",
			"group": {
				"name": "Хомбрю ",
				"shortName": "HB"
			},
			"homebrew": true
		}
	},
	{
		"name": {
			"rus": "Шакрам",
			"eng": "Chakram"
		},
		"url": "/weapons/chakram",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "10 зм.",
		"source": {
			"shortName": "MOT",
			"name": "Мифические одиссеи Тероса",
			"group": {
				"name": "Официальные источники",
				"shortName": "Basic"
			}
		}
	},
	{
		"name": {
			"rus": "Шарф с лезвиями",
			"eng": "Bladed Scarf"
		},
		"url": "/weapons/bladed_scarf",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к4",
			"type": "рубящий"
		},
		"price": "100 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шашка",
			"eng": "Shashka"
		},
		"url": "/weapons/shashka",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к8",
			"type": "рубящий"
		},
		"price": "20 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шелковая сеть",
			"eng": "Wormsilk Net"
		},
		"url": "/weapons/wormsilk_net",
		"type": {
			"name": "Воинское дальнобойное",
			"order": 3
		},
		"damage": {
			"type": "без урона"
		},
		"price": "60 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Шотель",
			"eng": "Shotel"
		},
		"url": "/weapons/shotel",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Эльфийский дуэльный клинок",
			"eng": "Elven Dueling Blade"
		},
		"url": "/weapons/elven_dueling_blade",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "2к4",
			"type": "рубящий"
		},
		"price": "50 зм.",
		"source": {
			"shortName": "ToH",
			"name": "Фолиант героев",
			"group": {
				"name": "Контент от третьих лиц",
				"shortName": "3rd"
			}
		}
	},
	{
		"name": {
			"rus": "Эсток северянина",
			"eng": "Northlands Estoc"
		},
		"url": "/weapons/northlands_estoc",
		"type": {
			"name": "Воинское рукопашное",
			"order": 2
		},
		"damage": {
			"dice": "1к6",
			"type": "колющий"
		},
		"price": "40 зм.",
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
