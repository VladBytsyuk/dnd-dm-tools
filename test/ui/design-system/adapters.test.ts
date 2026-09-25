import { describe, expect, it } from "vitest";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import { applyFullViewModel, createEmptyDomainItem, toFullViewModel, toSmallCardProps } from "src/ui/design-system/adapters";

const panelKeys: PanelKey[] = [
	"bestiary", "spellbook", "arsenal", "armory", "equipment", "artifactory",
	"backgrounds", "feats", "races", "classes",
];

describe("design system adapters", () => {
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
});
