import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "svelte";
import { BestiaryMdCodeBlockProcessor } from "src/ui/components/processor/BestiaryMdCodeBlockProcessor";
import { SpellbookMdCodeBlockProcessor } from "src/ui/components/processor/SpellbookMdCodeBlockProcessor";
import { ArsenalMdCodeBlockProcessor } from "src/ui/components/processor/ArsenalMdCodeBlockProcessor";
import { ArmoryMdCodeBlockProcessor } from "src/ui/components/processor/ArmoryMdCodeBlockProcessor";
import { EquipmentMdCodeBlockProcessor } from "src/ui/components/processor/EquipmentMdCodeBlockProcessor";
import { ArtifactoryMdCodeBlockProcessor } from "src/ui/components/processor/ArtifactoryMdCodeBlockProcessor";
import { BackgroundMdCodeBlockProcessor } from "src/ui/components/processor/BackgroundMdCodeBlockProcessor";
import { FeatMdCodeBlockProcessor } from "src/ui/components/processor/FeatMdCodeBlockProcessor";
import { RaceMdCodeBlockProcessor } from "src/ui/components/processor/RaceMdCodeBlockProcessor";
import { ClassesMdCodeBlockProcessor } from "src/ui/components/processor/ClassesMdCodeBlockProcessor";
import { DmScreenMdCodeBlockProcessor } from "src/ui/components/processor/DmScreenMdCodeBlockProcessor";
import { CharacterSheetMdCodeBlockProcessor } from "src/ui/components/processor/CharacterSheetMdCodeBlockProcessor";
import RedesignedMarkdownCard from "src/ui/design-system/RedesignedMarkdownCard.svelte";
import DmScreenItemUi from "src/ui/layout/screen/DmScreenItemUi.svelte";
import CharacterSheetFullUi from "src/ui/layout/character/CharacterSheetFullUi.svelte";

vi.mock("svelte", async (importOriginal) => ({ ...await importOriginal<typeof import("svelte")>(), mount: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

const cases = [
	[new BestiaryMdCodeBlockProcessor(), "bestiary", RedesignedMarkdownCard],
	[new SpellbookMdCodeBlockProcessor(), "spellbook", RedesignedMarkdownCard],
	[new ArsenalMdCodeBlockProcessor(), "arsenal", RedesignedMarkdownCard],
	[new ArmoryMdCodeBlockProcessor(), "armory", RedesignedMarkdownCard],
	[new EquipmentMdCodeBlockProcessor(), "equipment", RedesignedMarkdownCard],
	[new ArtifactoryMdCodeBlockProcessor(), "artifactory", RedesignedMarkdownCard],
	[new BackgroundMdCodeBlockProcessor(), "backgrounds", RedesignedMarkdownCard],
	[new FeatMdCodeBlockProcessor(), "feats", RedesignedMarkdownCard],
	[new RaceMdCodeBlockProcessor(), "races", RedesignedMarkdownCard],
	[new ClassesMdCodeBlockProcessor(), "classes", RedesignedMarkdownCard],
	[new DmScreenMdCodeBlockProcessor(), "dm-screen", DmScreenItemUi],
	[new CharacterSheetMdCodeBlockProcessor(), undefined, CharacterSheetFullUi],
] as const;

describe("entity Markdown processors", () => {
	it.each(cases)("renders %s with its supported card without consulting settings", async (processor, panelKey, component) => {
		const handlers = new Map<string, (source: string, element: HTMLElement) => Promise<void>>();
		const plugin = { registerMarkdownCodeBlockProcessor: (kind: string, handler: any) => handlers.set(kind, handler) };
		const repository = { getFullItemByUrl: vi.fn() };
		const listener = {};
		processor.register(plugin as never, repository as never, listener as never);
		const element = document.createElement("div");
		const item = { name: { rus: "Сущность", eng: "Entity" }, url: "/entity" };

		await handlers.get(processor.getCodeBlockName())!(JSON.stringify(item), element);
		expect(mount).toHaveBeenLastCalledWith(component, {
			target: element,
			props: { currentItem: item, uiEventListener: listener, ...(panelKey ? { panelKey } : {}) },
		});
		expect(repository.getFullItemByUrl).not.toHaveBeenCalled();

		repository.getFullItemByUrl.mockResolvedValue(item);
		await handlers.get(processor.getCodeBlockName())!(JSON.stringify({ name: { rus: item.url } }), element);
		expect(repository.getFullItemByUrl).toHaveBeenCalledWith(item.url);
		expect(mount).toHaveBeenCalledTimes(2);
	});
});
