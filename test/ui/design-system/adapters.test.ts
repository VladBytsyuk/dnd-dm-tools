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
