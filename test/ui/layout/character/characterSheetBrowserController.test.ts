import { describe, expect, it, vi } from "vitest";
import { CharacterSheetBrowserController } from "../../../../src/ui/layout/character/characterSheetBrowserController";
import { EmptyFullCharacterSheet } from "../../../../src/domain/models/character/FullCharacterSheet";
import type { SmallCharacterSheet } from "../../../../src/domain/models/character/SmallCharacterSheet";

function createSmallItem(url: string, name: string): SmallCharacterSheet {
	return {
		name: { rus: name, eng: name },
		url,
		charClass: "Wizard",
		level: 3,
		race: "Elf",
		playerName: "Player",
	};
}

describe("CharacterSheetBrowserController", () => {
	it("should refresh groups when search changes", async () => {
		const smallItems = [createSmallItem("sheet-1", "A"), createSmallItem("sheet-2", "B")];
		const controller = new CharacterSheetBrowserController({
			getAllFilters: vi.fn().mockResolvedValue(null),
			getFilteredSmallItems: vi.fn().mockResolvedValue(smallItems),
			getFullItemBySmallItem: vi.fn(),
			groupItems: vi.fn().mockResolvedValue([{ sort: "Уровень 3", smallItems }]),
			importFromJson: vi.fn(),
			putItem: vi.fn(),
		});

		await controller.updateSearch("Test");

		expect(controller.getState().searchBarValue).toBe("Test");
		expect(controller.getState().groups).toHaveLength(1);
	});

	it("should push opened items onto navigation stack and go back", async () => {
		const opened = EmptyFullCharacterSheet();
		opened.url = "sheet-1";
		const controller = new CharacterSheetBrowserController({
			getAllFilters: vi.fn().mockResolvedValue(null),
			getFilteredSmallItems: vi.fn().mockResolvedValue([]),
			getFullItemBySmallItem: vi.fn().mockResolvedValue(opened),
			groupItems: vi.fn().mockResolvedValue([]),
			importFromJson: vi.fn(),
			putItem: vi.fn(),
		});

		await controller.openSmallItem(createSmallItem("sheet-1", "A"));
		expect(controller.getState().currentItem?.url).toBe("sheet-1");

		controller.goBack();
		expect(controller.getState().currentItem).toBeUndefined();
	});

	it("should surface import errors in state", async () => {
		const controller = new CharacterSheetBrowserController({
			getAllFilters: vi.fn().mockResolvedValue(null),
			getFilteredSmallItems: vi.fn().mockResolvedValue([]),
			getFullItemBySmallItem: vi.fn(),
			groupItems: vi.fn().mockResolvedValue([]),
			importFromJson: vi.fn().mockRejectedValue(new Error("bad import")),
			putItem: vi.fn(),
		});

		await controller.importFromText("{}");

		expect(controller.getState().status).toBe("error");
		expect(controller.getState().errorMessage).toBe("bad import");
	});
});
