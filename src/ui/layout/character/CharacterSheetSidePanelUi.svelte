<script lang="ts">
	import { isFiltersEmpty } from "src/domain/models/common/Filters";
	import CharacterSheetFullUi from "./CharacterSheetFullUi.svelte";
	import CharacterSheetSmallUi from "./CharacterSheetSmallUi.svelte";
	import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { FilterConfig } from "src/domain/utils/FilterConfig";
	import type { SmallCharacterSheet } from "../../../domain/models/character/SmallCharacterSheet";
	import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
	import type { CharacterSheetFilters } from "../../../domain/models/character/CharacterSheetFilters";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import type DndStatblockPlugin from "../../../main";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import GroupBlockUi from "../uikit/GroupBlockUi.svelte";
	import FiltersOverlay from "../uikit/FiltersOverlay.svelte";
	import type { CharacterSheetBrowserState } from "../../../data/repositories/characterSheetTypes";
	import { onMount } from "svelte";
	import { CharacterSheetBrowserController } from "./characterSheetBrowserController";
	import { pickJsonFileText } from "./characterSheetFilePicker";

	let {
		initialFullItem,
		repository,
		uiEventListener,
		plugin,
	}: SidePanelProps<
		SmallCharacterSheet,
		FullCharacterSheet,
		CharacterSheetFilters,
		CharacterSheetRepository
	> & {
		plugin: DndStatblockPlugin;
		repository: CharacterSheetRepository;
	} = $props();

	const filterConfig: FilterConfig<CharacterSheetFilters>[] = [
		{ key: "classes", label: "Класс" },
		{ key: "levels", label: "Уровень" },
		{ key: "races", label: "Раса" },
	];

	const browserController = new CharacterSheetBrowserController(repository, {
		onStateChange: (state) => {
			browserState = state;
		},
	});

	let browserState = $state<CharacterSheetBrowserState>(browserController.getState());

	onMount(async () => {
		browserController.initialize(initialFullItem);
		await browserController.refreshGroups();
	});

	function onSearchBarBackClick() {
		browserController.goBack();
	}

	async function onSearchBarValueChanged(value: string) {
		await browserController.updateSearch(value);
	}

	async function onSearchBarFiltersClick() {
		await browserController.openFilters();
	}

	async function handleFiltersApply(newFilters: CharacterSheetFilters) {
		await browserController.applyFilters(newFilters);
	}

	function handleFiltersClose() {
		browserController.closeFilters();
	}

	async function onSmallItemClick(smallItem: SmallCharacterSheet) {
		await browserController.openSmallItem(smallItem);
	}

	async function onImportClick() {
		const text = await pickJsonFileText();
		if (!text) return;
		await browserController.importFromText(text);
	}
</script>

<div class="side-panel-container">
	<SidePanelHeader
		onbackclick={browserState.currentItem ? onSearchBarBackClick : undefined}
		onvaluechange={onSearchBarValueChanged}
		isvaluechangable={() => !browserState.currentItem}
		onclearclick={() => browserController.clearError()}
		onfiltersclick={browserState.currentItem ? undefined : onSearchBarFiltersClick}
		isfiltersapplied={() => !isFiltersEmpty(browserState.filters)}
		onaddclick={onImportClick}
	/>
	<div style="height:1em;"></div>

	{#if browserState.errorMessage}
		<div class="browser-status browser-status-error">{browserState.errorMessage}</div>
	{:else if browserState.status === "importing"}
		<div class="browser-status">Импорт персонажа...</div>
	{/if}

	{#if browserState.currentItem}
		<CharacterSheetFullUi
			currentItem={browserState.currentItem}
			{uiEventListener}
			{repository}
			{plugin}
		/>
	{:else if browserState.searchBarValue.length > 0 && browserState.groups.length === 0}
		<h2>Результаты поиска</h2>
		<div>Ничего не найдено</div>
	{:else}
		<div class="side-panel-content">
			{#each browserState.groups as group (group.sort)}
				<GroupBlockUi
					groupTitle={group.sort}
					items={group.smallItems}
					onItemClick={onSmallItemClick}
					SmallItemSlot={CharacterSheetSmallUi}
				/>
			{/each}
		</div>
	{/if}

	{#if browserState.isFiltersOverlayOpen && browserState.fullFilters}
		<FiltersOverlay
			fullFilters={browserState.fullFilters}
			initialFilters={browserState.filters}
			{filterConfig}
			onApply={handleFiltersApply}
			onClose={handleFiltersClose}
		/>
	{/if}
</div>

<style>
	.side-panel-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.side-panel-content {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.browser-status {
		margin-bottom: 12px;
		padding: 8px 12px;
		border-radius: 6px;
		background: var(--background-secondary);
		color: var(--text-muted);
	}

	.browser-status-error {
		background: var(--background-modifier-error);
		color: var(--text-on-accent);
	}

	h2 {
		margin: 0 0 0.5em 0;
		font-size: 1.2em;
	}
</style>
