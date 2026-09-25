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
	import { copyMonsterToClipboard, copySpellToClipboard, copyWeaponToClipboard, copyArmorToClipboard, copyEquipmentToClipboard, copyArtifactToClipboard, copyBackgroundToClipboard, copyFeatToClipboard, copyRaceToClipboard, copyClassToClipboard } from "src/data/clipboard";
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
	import { applyFullViewModel, cloneDesignData, entityUrlPrefix, toFullViewModel, type FullViewModel } from "./adapters";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import { onMount } from "svelte";
	import { DiceRollersManager } from "src/ui/layout/dice-roller/DiceRollersManager";

	type Props = {
		panelKey: PanelKey; currentItem: any; uiEventListener: IUiEventListener;
		actionRequest?: { id: number; command: "edit" | "save" | "cancel" | "copy" };
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
		<FullStatblock bind:statblock={draft as FullStatblockViewModel} onCopyStatblock={copyFullItem} onCopySpellLink={entityLinkHandler} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "spellbook"}
		<FullSpell bind:spell={draft as FullSpellViewModel} onCopySpell={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "arsenal"}
		<FullWeapon bind:weapon={draft as FullWeaponViewModel} onCopyWeapon={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "armory"}
		<FullArmor bind:armor={draft as FullArmorViewModel} onCopyArmor={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "equipment"}
		<FullEquipment bind:equipment={draft as FullEquipmentViewModel} onCopyEquipment={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "artifactory"}
		<FullArtifact bind:artifact={draft as FullArtifactViewModel} onCopyArtifact={copyFullItem} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "feats"}
		<FullFeat bind:feat={draft as FullFeatViewModel} onCopyFeat={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "backgrounds"}
		<FullBackground bind:background={draft as FullBackgroundViewModel} onCopyBackground={copyFullItem} onEntityLinkClick={entityLinkHandler} editable={editing} {theme} />
	{:else if panelKey === "races"}
		<FullRace bind:race={draft as FullRaceViewModel} onCopyRace={copyFullItem} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} editable={editing} {theme} />
	{:else if panelKey === "classes"}
		<FullClass characterClass={draft as FullClassViewModel} onCopyClass={copyFullItem} onEntityLinkClick={entityLinkHandler} onImageRequested={imageResolver} {theme} />
	{/if}
</div>

<style>
	.redesigned-full-item { display: grid; gap: 10px; padding: 8px; }
	.redesigned-full-item :global(input::placeholder),
	.redesigned-full-item :global(textarea::placeholder) { color: currentcolor !important; opacity: 0.65 !important; }
	.error { color: var(--text-error); margin: 0; }
</style>
