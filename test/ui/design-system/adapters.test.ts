import { describe, expect, it } from "vitest";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import { applyFullViewModel, createEmptyDomainItem, entityUrlPrefix, toFullViewModel, toSmallCardProps } from "src/ui/design-system/adapters";

const panelKeys: PanelKey[] = [
	"bestiary", "spellbook", "arsenal", "armory", "equipment", "artifactory",
	"backgrounds", "feats", "races", "classes",
];

describe("design system adapters", () => {
	it("maps every editable section to its URL prefix", () => {
		expect(panelKeys.map(entityUrlPrefix)).toEqual([
			"/bestiary/", "/spells/", "/weapons/", "/armors/", "/items/",
			"/items/magic/", "/backgrounds/", "/feats/", "/races/", "/classes/",
		]);
	});

	it("maps the small card details into their new base item slots", () => {
		const statblock = toSmallCardProps("bestiary", { source: { shortName: "PHB", group: { shortName: "BCM" } } });
		const spell = toSmallCardProps("spellbook", {
			level: 3,
			concentration: true,
			ritual: true,
			components: { v: true, s: true, m: "фосфор" },
		});
		const weapon = toSmallCardProps("arsenal", { price: "5 зм." });
		const armor = toSmallCardProps("armory", { price: "150 зм.", weight: 65 });
		const artifact = toSmallCardProps("artifactory", { customization: true });

		expect(statblock).not.toHaveProperty("secondarySource");
		expect(spell).toMatchObject({ concentration: true, ritual: true, components: { verbal: true, somatic: true, material: "фосфор" } });
		expect(weapon.price).toBe("5 зм.");
		expect(armor.weight).toBe("65");
		expect(toSmallCardProps("armory", { price: "150 зм." }).weight).toBe("");
		expect(artifact.customization).toBe(true);
	});

	it("colors very rare and unspecified artifact cards distinctly", () => {
		const color = (type?: string) => toSmallCardProps("artifactory", { rarity: { type } }).rarityColor;

		expect(color("rare")).toBe("var(--ds-artifact-rare)");
		expect(color("very-rare")).toBe("var(--ds-artifact-very-rare)");
		expect(color("very_rare")).toBe("var(--ds-artifact-very-rare)");
		for (const type of ["unknown", "varies", "", undefined]) {
			expect(color(type)).toBe("var(--ds-artifact-unspecified)");
		}
	});

	it.each(panelKeys)("maps small and full models for %s", (panelKey) => {
		const item = createEmptyDomainItem(panelKey) ?? {
			name: { rus: "Тест", eng: "Test" }, url: "/classes/test", dice: "к8", source: { shortName: "PHB", name: "PHB", group: { shortName: "Basic", name: "Основные" } }, isArchetype: false,
		};
		item.name = { rus: "Тест", eng: "Test" };
		item.url = `/${panelKey}/test`;
		item.source = { shortName: "PHB", name: "Player's Handbook", group: { shortName: "Basic", name: "Основные" } };
		item.unmappedField = "preserve me";

		const smallProps = toSmallCardProps(panelKey, item);
		const viewModel = toFullViewModel(panelKey, item);
		const updated = applyFullViewModel(panelKey, item, viewModel);

		expect(smallProps.title).toBe("Тест");
		expect(viewModel.russianName).toBe("Тест");
		expect(updated.unmappedField).toBe("preserve me");
	});

	it("creates a blank artifact with editable image and cost fields", () => {
		const item = createEmptyDomainItem("artifactory")!;
		const view = toFullViewModel("artifactory", item) as any;

		expect(view).toMatchObject({ cost: { dmg: "", xge: "" }, images: [], description: { html: "" } });
	});

	it("passes complete background details through the redesigned view model", () => {
		const item = {
			name: { rus: "Благородный", eng: "Noble" },
			url: "/backgrounds/noble",
			source: { shortName: "PHB", name: "Книга игрока", group: { shortName: "Basic", name: "Официальные источники" } },
			skills: ["История", "Убеждение"],
			toolOwnership: "Один игровой набор",
			equipments: [],
			startGold: 25,
			description: "<p>Описание</p>",
			language: "Один на ваш выбор",
			skillName: "Привилегированность",
			skillDescription: "<p>Вас принимают в высшем обществе.</p>",
			personalizationTables: [{ type: "TRAIT", name: "Черта характера", formula: "к8", thead: ["Черта характера"], tbody: [["1", "Пример"]] }],
		};
		const view = toFullViewModel("backgrounds", item) as any;

		expect(view).toMatchObject({
			language: item.language,
			skillName: item.skillName,
			skillDescription: { html: item.skillDescription },
			personalizationTables: item.personalizationTables,
		});
		expect(applyFullViewModel("backgrounds", item, view)).toMatchObject({
			language: item.language,
			skillName: item.skillName,
			skillDescription: item.skillDescription,
			personalizationTables: item.personalizationTables,
		});
	});

	it("normalizes missing artifact images for the editable image group", () => {
		const view = toFullViewModel("artifactory", { name: { rus: "Артефакт", eng: "Artifact" } }) as any;

		expect(view.images).toEqual([]);
	});

	it("persists weapon damage and edited properties from the full view model", () => {
		const weapon = {
			name: { rus: "Копьё", eng: "Spear" },
			url: "/weapons/spear",
			type: { name: "Простое рукопашное" },
			damage: { dice: "1к6", type: "колющий" },
			price: "1 зм",
			weight: 3,
			properties: [{ name: "Метательное", url: "/screens/thrown", distance: "20/60", description: "Описание" }],
		};
		const view = toFullViewModel("arsenal", weapon) as any;
		view.damage = "1к8 рубящий";
		view.properties = [
			{ name: "Двуручное", url: "/screens/two_handed", distance: undefined, description: { html: "" } },
		];

		const updated = applyFullViewModel("arsenal", weapon, view);
		expect(updated.damage).toEqual({ dice: "1к8", type: "рубящий" });
		expect(updated.properties).toEqual([
			{ name: "Двуручное", url: "/screens/two_handed", distance: undefined, description: "" },
		]);
	});

	it("splits armor donning and doffing durations and joins them when saving", () => {
		const armor = {
			name: { rus: "Кожаный доспех", eng: "Leather Armor" },
			url: "/armors/leather-armor",
			type: { name: "Легкий доспех" },
		duration: "5 минут/1 минута",
		};

		const view = toFullViewModel("armory", armor) as any;
		expect(view.donningTime).toBe("5 минут");
		expect(view.doffingTime).toBe("1 минута");

		view.doffingTime = "2 минуты";
		expect(applyFullViewModel("armory", armor, view).duration).toBe("5 минут/2 минуты");
	});

	it("preserves hidden nested race data and maps empty monster abilities", () => {
		const race = {
			name: { rus: "Раса", eng: "Race" }, url: "/races/example", abilities: [], type: { name: "Гуманоид" },
			subraces: [{ name: { rus: "Подраса", eng: "Subrace" }, url: "/races/example/subrace", abilities: [], type: { name: "Гуманоид" }, description: "", nestedOnly: true }],
		};
		const raceView = toFullViewModel("races", race);
		const updatedRace = applyFullViewModel("races", race, raceView);
		expect(updatedRace.subraces[0].nestedOnly).toBe(true);

		const monsterView = toFullViewModel("bestiary", { name: { rus: "Монстр", eng: "Monster" }, ability: undefined });
		expect((monsterView as any).abilities).toHaveLength(6);
	});

	it("preserves hidden fields from a pasted monster when applying editor changes", () => {
		const pastedMonster = {
			name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster",
			armor: [{ name: "Кольчуга", value: 16 }],
			hits: { average: 42, formula: "5к8+20", text: "42 (5к8+20)" },
			legendary: { count: 3, list: [{ name: "Действие", value: "Текст" }] },
		};
		const view = toFullViewModel("bestiary", pastedMonster);
		view.russianName = "Изменённый монстр";

		const updated = applyFullViewModel("bestiary", pastedMonster, view);
		expect(updated.name.rus).toBe("Изменённый монстр");
		expect(updated.armor).toEqual(pastedMonster.armor);
		expect(updated.hits.text).toBe("42 (5к8+20)");
		expect(updated.legendary.count).toBe(3);
	});

	it("maps monster action and trait text stored in named-value fields", () => {
		const monsterView = toFullViewModel("bestiary", {
			name: { rus: "Монстр", eng: "Monster" },
			feats: [{ name: "Особенность", value: "Описание особенности" }],
			actions: [{ name: "Короткий меч", value: "Атака коротким мечом." }],
			reactions: [{ name: "Парирование", value: "Добавляет 2 к КД." }],
		});

		expect((monsterView as any).traits[0].html).toBe("Описание особенности");
		expect((monsterView as any).actions.items[0]).toEqual({ title: "Короткий меч", html: "Атака коротким мечом." });
		expect((monsterView as any).reactions.items[0]).toEqual({ title: "Парирование", html: "Добавляет 2 к КД." });
	});

	it("preserves linked actions across all five statblock sections and legacy weapon links", () => {
		const monster = {
			name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster",
			actions: [{ name: "Меч", value: "<p>Атака</p>", weaponUrl: "/weapons/sword" }],
		};
		const view = toFullViewModel("bestiary", monster) as any;
		expect(view.actions.items[0].entityUrl).toBe("/weapons/sword");

		const sections = ["actions", "bonusActions", "reactions", "legendaryActions", "mythicActions"] as const;
		for (const section of sections) {
			view[section].items.push({ title: "Свет", html: "<p>Освещает.</p>", entityUrl: "/spells/light" });
		}
		const saved = applyFullViewModel("bestiary", monster, view);
		const reopened = toFullViewModel("bestiary", saved) as any;
		for (const section of sections) {
			expect(reopened[section].items.at(-1)).toEqual({ title: "Свет", html: "<p>Освещает.</p>", entityUrl: "/spells/light" });
		}
		expect(saved.actions[0].weaponUrl).toBe("/weapons/sword");
		expect(reopened.actions.items[0].entityUrl).toBe("/weapons/sword");
	});

	it("copies reactive proxy data when preparing an item for copy", () => {
		const source = new Proxy([{ name: "Вложенные данные" }], {});
		const original = new Proxy({
			name: { rus: "Монстр", eng: "Monster" },
			url: "/bestiary/monster",
			hidden: source,
		}, {});
		const view = toFullViewModel("bestiary", original);

		expect(() => applyFullViewModel("bestiary", original, view)).not.toThrow();
		expect(applyFullViewModel("bestiary", original, view).hidden).toEqual([{ name: "Вложенные данные" }]);
	});

	it("maps hit points as average and a formula with only a nonzero bonus", () => {
		const view = toFullViewModel("bestiary", {
			name: { rus: "Монстр", eng: "Monster" },
			hits: { average: 18, formula: "4к8", sign: "+", bonus: 0 },
		});
		expect((view as any).hitPoints).toBe("18");
		expect((view as any).hitPointsFormula).toBe("4к8");

		const withBonus = toFullViewModel("bestiary", {
			name: { rus: "Монстр", eng: "Monster" },
			hits: { average: 18, formula: "4к8", sign: "+", bonus: 2 },
		});
		expect((withBonus as any).hitPointsFormula).toBe("4к8+2");
	});

	it("maps monster save and skill modifiers to signed, clickable dice formulas", () => {
		const view = toFullViewModel("bestiary", {
			name: { rus: "Монстр", eng: "Monster" },
			savingThrows: [{ name: "Сила", value: 19 }],
			skills: [{ name: "Обман", value: 5 }, { name: "Скрытность", value: -2 }],
		});

		expect((view as any).savingThrowsHtml).toBe('<dice-roller label="Сила" formula="к20 +19">Сила +19</dice-roller>');
		expect((view as any).skillsHtml).toBe('<dice-roller label="Обман" formula="к20 +5">Обман +5</dice-roller>, <dice-roller label="Скрытность" formula="к20 -2">Скрытность −2</dice-roller>');
	});

	it("maps spell components from domain and API field names", () => {
		const legacy = toFullViewModel("spellbook", {
			name: { rus: "Тест", eng: "Test" }, components: { v: true, s: false, m: "перо" },
		});
		const api = toFullViewModel("spellbook", {
			name: { rus: "Тест", eng: "Test" }, components: { verbal: "true", somatic: "true", material: { description: "соль" } },
		});

		expect((legacy as any).components).toEqual({ verbal: true, somatic: false, material: "перо" });
		expect((api as any).components).toEqual({ verbal: true, somatic: true, material: "соль" });
	});
});
