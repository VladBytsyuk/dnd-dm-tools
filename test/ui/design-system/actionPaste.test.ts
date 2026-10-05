import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionsBlock, ChevronRight, ChipsList, FullStatblock, TextBlock } from "@dnd-dm-tools/design-system";
import { toFullViewModel } from "src/ui/design-system/adapters";
import RedesignedFullItem from "src/ui/design-system/RedesignedFullItem.svelte";
import { EmptyFullMonster } from "src/domain/models/monster/FullMonster";
import { stringifyYaml } from "obsidian";

describe("redesigned statblock actions", () => {
	afterEach(() => { delete (HTMLElement.prototype as any).empty; });
	it("hides empty chips after leaving edit mode", async () => {
		const chips = [{ text: "  " }, { text: "Заполнен" }, { icon: ChevronRight, iconTooltip: "Свойство" }];
		const { container, rerender } = render(ChipsList, { chips, editable: true });
		expect(container.querySelectorAll(".chip")).toHaveLength(3);
		await rerender({ chips, editable: false });
		expect(container.querySelectorAll(".chip")).toHaveLength(2);
		expect(screen.getByText("Заполнен")).toBeTruthy();
	});
	it("offers clipboard insertion while editing", async () => {
		const onPasteBlock = vi.fn();
		render(ActionsBlock, { title: "Действия", blocks: [], editable: true, onPasteBlock });

		await fireEvent.click(screen.getByRole("button", { name: "Вставить действие из буфера обмена" }));
		await waitFor(() => expect(onPasteBlock).toHaveBeenCalledOnce());
	});

	it("opens a linked title separately from its collapse control", async () => {
		const onEntityLinkClick = vi.fn();
		render(TextBlock, {
			title: "Свет", entityUrl: "/spells/light", html: "<p>Описание</p>",
			icon: ChevronRight, onEntityLinkClick,
		});

		const link = screen.getByRole("link", { name: "Свет" });
		await fireEvent.click(link);
		expect(onEntityLinkClick).toHaveBeenCalledWith({ href: "/spells/light", label: "Свет" });
		expect(screen.getByText("Описание")).toBeTruthy();

		await fireEvent.click(screen.getByRole("button", { name: "Свернуть: Свет" }));
		expect(screen.queryByText("Описание")).toBeNull();
		expect(screen.getByRole("link", { name: "Свет" })).toBeTruthy();
	});

	it("routes insertion from each action section to the selected section", async () => {
		const onPasteAction = vi.fn();
		const statblock = toFullViewModel("bestiary", { name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster" });
		render(FullStatblock, {
			statblock, editable: true, onPasteAction,
			onCopyStatblock: vi.fn(), onCopySpellLink: vi.fn(),
		});

		const buttons = screen.getAllByRole("button", { name: "Вставить действие из буфера обмена" });
		expect(buttons).toHaveLength(5);
		for (const button of buttons) await fireEvent.click(button);
		expect(onPasteAction.mock.calls.map(([section]) => section)).toEqual([
			"actions", "bonusActions", "reactions", "legendaryActions", "mythicActions",
		]);
	});

	it("pastes four entity types, saves their links, and opens a linked title", async () => {
		(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
		const monster = {
			...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster", origin: "manual",
			ability: { str: 14, dex: 10, con: 10, int: 10, wiz: 10, cha: 10 }, proficiencyBonus: "2",
		};
		const onWeaponClick = vi.fn();
		const onItemSave = vi.fn(async () => ({ ok: true }));
		const uiEventListener = { onWeaponClick, onSpellClick: vi.fn(), onImageRequested: vi.fn() } as any;
		const props = { panelKey: "bestiary" as const, currentItem: monster, uiEventListener, onItemSave, actionRequest: { id: 1, command: "edit" as const } };
		const { rerender } = render(RedesignedFullItem, props);
		const entities = [
			["weapon", { name: { rus: "Меч" }, url: "/weapons/sword", type: { name: "Рукопашное" }, damage: { dice: "1к6", type: "рубящий" }, properties: [], description: "<p>Оружие</p>" }],
			["spell", { name: { rus: "Свет" }, url: "/spells/light", description: "<p>Заклинание</p>" }],
			["equip", { name: { rus: "Верёвка" }, url: "/items/rope", description: "<p>Предмет</p>" }],
			["artifact", { name: { rus: "Жезл" }, url: "/items/magic/wand", description: "<p>Артефакт</p>" }],
		] as const;
		const readText = vi.fn();
		Object.defineProperty(navigator, "clipboard", { value: { readText }, writable: true });
		await screen.findAllByRole("button", { name: "Вставить действие из буфера обмена" });
		for (let sectionIndex = 0; sectionIndex < 5; sectionIndex++) {
			for (const [kind, item] of entities) {
				readText.mockResolvedValue(`\`\`\`${kind}\n${kind === "spell" ? "spell: Свет\n" : ""}${stringifyYaml(item)}\n\`\`\``);
				const buttons = screen.getAllByRole("button", { name: "Вставить действие из буфера обмена" });
				await fireEvent.click(buttons[sectionIndex]);
				await waitFor(() => expect(screen.getAllByDisplayValue(item.name.rus)).toHaveLength(sectionIndex + 1));
			}
		}
		expect(readText).toHaveBeenCalledTimes(20);
		readText.mockResolvedValue("произвольный текст");
		await fireEvent.click(screen.getAllByRole("button", { name: "Вставить действие из буфера обмена" })[0]);
		await waitFor(() => expect(readText).toHaveBeenCalledTimes(21));
		expect(screen.getAllByDisplayValue("Меч")).toHaveLength(5);

		await rerender({ ...props, actionRequest: { id: 2, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledOnce());
		const saved = onItemSave.mock.calls[0][0] as any;
		for (const actions of [saved.actions, saved.bonusActions, saved.reactions, saved.legendary.list, saved.mythic.list]) {
			expect(actions).toHaveLength(4);
			expect(actions.map((action: { entityUrl: string }) => action.entityUrl)).toEqual(entities.map(([, item]) => item.url));
			expect(actions[0].value).toContain('formula="к20 + 4"');
			expect(actions[1].value).toBe("<p>Заклинание</p>");
			expect(actions[2].value).toBe("<p>Предмет</p>");
			expect(actions[3].value).toBe("<p>Артефакт</p>");
		}
		await fireEvent.click(screen.getAllByRole("link", { name: "Меч" })[0]);
		expect(onWeaponClick).toHaveBeenCalledWith("/weapons/sword");
	});

	it("drops untouched empty blocks when saving the editor", async () => {
		(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
		const monster = { ...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster", origin: "manual" };
		const onItemSave = vi.fn(async () => ({ ok: true }));
		const props = {
			panelKey: "bestiary" as const, currentItem: monster,
			uiEventListener: { onImageRequested: vi.fn() } as any, onItemSave,
			actionRequest: { id: 1, command: "edit" as const },
		};
		const { rerender } = render(RedesignedFullItem, props);
		await screen.findAllByRole("button", { name: "Добавить текстовый блок" });
		await fireEvent.click(screen.getAllByRole("button", { name: "Добавить текстовый блок" })[0]);
		await fireEvent.click(screen.getAllByRole("button", { name: "Добавить текстовый блок" })[1]);
		await rerender({ ...props, actionRequest: { id: 2, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledOnce());
		const saved = onItemSave.mock.calls[0][0] as any;
		expect(saved.feats).toEqual([]);
		expect(saved.actions).toEqual([]);
	});
});
