<script lang="ts">
	import { Notice } from "obsidian";
	import {
		FullStatblock, FullSpell, FullWeapon, FullArmor, FullEquipment, FullArtifact,
		FullFeat, FullBackground, FullRace, FullClass,
		type FullStatblockViewModel,
		type FullSpellViewModel,
		type FullWeaponViewModel,
		type FullArmorViewModel,
		type FullEquipmentViewModel,
		type FullArtifactViewModel,
		type FullFeatViewModel,
		type FullBackgroundViewModel,
		type FullRaceViewModel,
		type FullClassViewModel,
	} from "@dnd-dm-tools/design-system";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	import type { ItemSaveContext, ItemSaveResult } from "src/domain/models/common/EntityOrigin";
	import { resolveDndEntityLink } from "src/domain/listeners/html_link_listener";
	import { copyMonsterToClipboard, copySpellToClipboard, copyWeaponToClipboard, copyArmorToClipboard, copyEquipmentToClipboard, copyArtifactToClipboard, copyBackgroundToClipboard, copyFeatToClipboard, copyRaceToClipboard, copyClassToClipboard, getMarkdownCodeBlockFromClipboard, showClipboardNotice } from "src/data/clipboard";
	import type { FullMonster } from "src/domain/models/monster/FullMonster";
	import type { FullSpell as FullSpellDomain } from "src/domain/models/spell/FullSpell";
	import type { FullWeapon as FullWeaponDomain } from "src/domain/models/weapon/FullWeapon";
	import type { FullArmor as FullArmorDomain } from "src/domain/models/armor/FullArmor";
	import type { FullItem } from "src/domain/models/items/FullItem";
	import type { FullArtifact as FullArtifactDomain } from "src/domain/models/artifact/FullArtifact";
	import type { FullBackground as FullBackgroundDomain } from "src/domain/models/background/FullBackground";
	import type { FullFeat as FullFeatDomain } from "src/domain/models/feat/FullFeat";
	import type { FullRace as FullRaceDomain } from "src/domain/models/race/FullRace";
	import type { FullClass as FullClassDomain } from "src/domain/models/class/FullClass";
	import { baseDmScreenItems } from "src/assets/data/dm_screen";
	import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
	import { applyFullViewModel, cloneDesignData, entityUrlPrefix, toFullViewModel, type FullViewModel } from "./adapters";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import { onMount } from "svelte";
	import { DiceRollersManager } from "src/ui/layout/dice-roller/DiceRollersManager";

	type Props = {
		panelKey: PanelKey; currentItem: any; uiEventListener: IUiEventListener;
		actionRequest?: { id: number; command: "edit" | "save" | "cancel" | "copy" | "paste" };
		onEditorStateChange?: (state: { editing: boolean; saving: boolean }) => void;
		onItemSave?: (item: any, context: ItemSaveContext) => ItemSaveResult | Promise<ItemSaveResult>;
	};
	let { panelKey, currentItem, uiEventListener, actionRequest = { id: 0, command: "edit" }, onEditorStateChange, onItemSave }: Props = $props();
	const theme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	let editing = $state(false);
	let saving = $state(false);
	function createDraft() { return toFullViewModel(panelKey, currentItem); }
	let draft = $state<FullViewModel>(createDraft());
	let validationError = $state("");
	let handledActionRequest = 0;
	const isClass = $derived(panelKey === "classes");
	const entityLinkHandler = async (link: { href: string; label: string }) => { const result = resolveDndEntityLink(uiEventListener, link.href); if (result) await result; };
	function findWeaponPropertyUrl(name: string): string | undefined {
		const find = (items: DmScreenItem[]): string | undefined => {
			for (const item of items) {
				if (item.group === "Свойства оружия" && (item.name.rus === name || item.name.eng === name)) return item.url;
				const nested = item.children && find(item.children);
				if (nested) return nested;
			}
			return undefined;
		};
		return find(baseDmScreenItems);
	}
	const imageResolver = (image: string) => uiEventListener.onImageRequested(image);
	let container: HTMLDivElement;
	onMount(() => {
		const diceRollers = DiceRollersManager.create(uiEventListener, container);
		diceRollers.onMount();
		const observer = new MutationObserver(() => diceRollers.onMount());
		observer.observe(container, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			diceRollers.onDestroy();
		};
	});
	$effect(() => {
		if (actionRequest.id <= handledActionRequest) return;
		handledActionRequest = actionRequest.id;
		if (actionRequest.command === "edit") beginEdit();
		else if (actionRequest.command === "cancel") cancelEdit();
		else if (actionRequest.command === "save") void save();
		else if (actionRequest.command === "paste") void pasteFromClipboard();
		else void copyFullItem();
	});

	function beginEdit() {
		if (editing || isClass) return;
		draft = cloneDesignData(toFullViewModel(panelKey, currentItem));
		if (!currentItem.url) draft.entityLink = entityUrlPrefix(panelKey);
		else if ((currentItem.origin ?? "remote") === "remote") draft.entityLink = `${currentItem.url}_`;
		validationError = "";
		editing = true;
		onEditorStateChange?.({ editing, saving });
	}
	function showCopyNotice(text: string) {
		showClipboardNotice(text);
	}
	const clipboardBlockNames: Partial<Record<PanelKey, string>> = {
		bestiary: "statblock", spellbook: "spell", arsenal: "weapon", armory: "armor",
		equipment: "equip", artifactory: "artifact", backgrounds: "background",
		feats: "feat", races: "race", classes: "dnd-class",
	};
	function isPasteableEntity(value: unknown): value is Record<string, any> {
		if (!value || typeof value !== "object" || Array.isArray(value)) return false;
		const item = value as Record<string, any>;
		return Boolean(item.name && typeof item.name === "object" && !Array.isArray(item.name)
			&& typeof item.name.rus === "string" && typeof item.name.eng === "string"
			&& typeof item.url === "string");
	}
	async function pasteFromClipboard() {
		if (!editing) return;
		const blockName = clipboardBlockNames[panelKey];
		if (!blockName) return;
		try {
			const item = await getMarkdownCodeBlockFromClipboard<Record<string, any>>(blockName);
			if (!isPasteableEntity(item)) {
				new Notice("В буфере нет корректного Markdown-блока этой сущности.");
				return;
			}
			const nextDraft = cloneDesignData(toFullViewModel(panelKey, item));
			if (currentItem.url && item.url === currentItem.url) nextDraft.entityLink = draft.entityLink;
			draft = nextDraft;
			validationError = "";
			new Notice("Данные вставлены из буфера обмена.");
		} catch (error) {
			console.error("Failed to paste entity from clipboard:", error);
			new Notice("Не удалось прочитать корректный Markdown-блок из буфера обмена.");
		}
	}
	function cancelEdit() {
		if (saving) return;
		editing = false;
		validationError = "";
		draft = cloneDesignData(toFullViewModel(panelKey, currentItem));
		onEditorStateChange?.({ editing, saving });
	}
	async function save() {
		if (saving || !editing) return;
		if (!draft.entityLink.trim()) { validationError = "Укажите URL сущности. Для внешней записи задайте новый URL ручной копии."; return; }
		if (currentItem.origin !== "manual" && draft.entityLink === currentItem.url) { validationError = "Для внешней записи укажите новый URL ручной копии."; return; }
		saving = true;
		onEditorStateChange?.({ editing, saving });
		try {
			const next = applyFullViewModel(panelKey, currentItem, draft);
			const result = await onItemSave?.(next, { originalUrl: currentItem.url || undefined, originalOrigin: currentItem.origin ?? "remote" });
			if (!result || result.ok) { currentItem = next; editing = false; validationError = ""; }
			else validationError = result.message;
		} catch (error) { validationError = error instanceof Error ? error.message : "Не удалось сохранить сущность."; }
		finally {
			saving = false;
			onEditorStateChange?.({ editing, saving });
		}
	}
	function copyFullItem() {
		if (panelKey === "classes") return copyClassToClipboard(currentItem as FullClassDomain);
		const item = applyFullViewModel(panelKey, currentItem, draft);
		switch (panelKey) {
			case "bestiary": return copyMonsterToClipboard(item as FullMonster);
			case "spellbook": return copySpellToClipboard(item as FullSpellDomain);
			case "arsenal": return copyWeaponToClipboard(item as FullWeaponDomain);
			case "armory": return copyArmorToClipboard(item as FullArmorDomain);
			case "equipment": return copyEquipmentToClipboard(item as FullItem);
			case "artifactory": return copyArtifactToClipboard(item as FullArtifactDomain);
			case "backgrounds": return copyBackgroundToClipboard(item as FullBackgroundDomain);
			case "feats": return copyFeatToClipboard(item as FullFeatDomain);
			case "races": return copyRaceToClipboard(item as FullRaceDomain);
			default: return Promise.resolve();
		}
	}
</script>

<div class="redesigned-full-item" bind:this={container}>
	{#if validationError}<p class="error" role="alert">{validationError}</p>{/if}
	{#if panelKey === "bestiary"}
		<FullStatblock bind:statblock={draft as FullStatblockViewModel} onCopyStatblock={copyFullItem} onCopyText={showCopyNotice} onCopySpellLink={entityLinkHandler} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "spellbook"}
		<FullSpell bind:spell={draft as FullSpellViewModel} onCopySpell={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "arsenal"}
		<FullWeapon bind:weapon={draft as FullWeaponViewModel} onCopyWeapon={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} resolvePropertyUrl={findWeaponPropertyUrl} editable={editing} {theme} />
	{:else if panelKey === "armory"}
		<FullArmor bind:armor={draft as FullArmorViewModel} onCopyArmor={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "equipment"}
		<FullEquipment bind:equipment={draft as FullEquipmentViewModel} onCopyEquipment={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "artifactory"}
		<FullArtifact bind:artifact={draft as FullArtifactViewModel} onCopyArtifact={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "feats"}
		<FullFeat bind:feat={draft as FullFeatViewModel} onCopyFeat={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "backgrounds"}
		<FullBackground bind:background={draft as FullBackgroundViewModel} onCopyBackground={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "races"}
		<FullRace bind:race={draft as FullRaceViewModel} onCopyRace={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "classes"}
		<FullClass characterClass={draft as FullClassViewModel} onCopyClass={copyFullItem} onCopyText={showCopyNotice} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} {theme} />
	{/if}
</div>

<style>
	.redesigned-full-item { display: grid; gap: 10px; padding: 8px; }
	.redesigned-full-item :global(input::placeholder),
	.redesigned-full-item :global(textarea::placeholder) { color: currentcolor !important; opacity: 0.65 !important; }
	.error { color: var(--text-error); margin: 0; }
</style>
