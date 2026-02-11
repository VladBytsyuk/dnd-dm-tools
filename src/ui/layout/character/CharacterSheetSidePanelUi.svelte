<script lang="ts">
	import type { Repository } from "src/domain/repositories/Repository";
	import { emptyFilters, isFiltersEmpty } from "src/domain/models/common/Filters";
	import CharacterSheetFullUi from "./CharacterSheetFullUi.svelte";
	import CharacterSheetSmallUi from "./CharacterSheetSmallUi.svelte";
	import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { FilterConfig } from "src/domain/utils/FilterConfig";
	import type { SmallCharacterSheet } from "../../../domain/models/character/SmallCharacterSheet";
	import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
	import type { CharacterSheetFilters } from "../../../domain/models/character/CharacterSheetFilters";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import GroupBlockUi from "../uikit/GroupBlockUi.svelte";
	import FiltersOverlay from "../uikit/FiltersOverlay.svelte";
	import type { Group } from "src/domain/repositories/Repository";
	import { onMount } from "svelte";

	let {
		initialFullItem,
		repository,
		uiEventListener,
		plugin,
	}: SidePanelProps<
		SmallCharacterSheet,
		FullCharacterSheet,
		CharacterSheetFilters,
		Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>
	> & {
		plugin: any; // DndStatblockPlugin
	} = $props();

	const characterRepo = repository as CharacterSheetRepository;
	const filterConfig: FilterConfig<CharacterSheetFilters>[] = [
		{ key: "classes", label: "Класс" },
		{ key: "levels", label: "Уровень" },
		{ key: "races", label: "Раса" },
	];

	// ---- State ----
	let searchBarValue: string = $state("");
	let filters: CharacterSheetFilters = $state(
		emptyFilters<CharacterSheetFilters>(["classes", "levels", "races"])
	);
	let itemsStack: FullCharacterSheet[] = $state(initialFullItem ? [initialFullItem] : []);
	let currentItem: FullCharacterSheet | undefined = $state(initialFullItem || undefined);
	let groups: Group<SmallCharacterSheet>[] = $state([]);
	let isFiltersOverlayOpen: boolean = $state(false);
	let fullFilters: CharacterSheetFilters | null = $state(null);

	// ---- Lifecycle ----
	onMount(() => updateGroups());

	// ---- Event Handlers ----
	function onSearchBarBackClick() {
		if (itemsStack.length >= 1) {
			itemsStack.pop();
			currentItem = itemsStack.last() || undefined;
		}
	}

	function onSearchBarValueChanged(value: string) {
		searchBarValue = value;
		updateGroups();
	}

	async function onSearchBarFiltersClick() {
		const rawFilters = await repository.getAllFilters();
		if (!rawFilters) return;
		fullFilters = rawFilters;
		isFiltersOverlayOpen = true;
	}

	async function handleFiltersApply(newFilters: CharacterSheetFilters) {
		filters = newFilters;
		await updateGroups();
	}

	function handleFiltersClose() {
		isFiltersOverlayOpen = false;
	}

	async function onSmallItemClick(smallItem: SmallCharacterSheet) {
		currentItem = (await repository.getFullItemBySmallItem(smallItem)) ?? undefined;
		if (currentItem) {
			itemsStack.push(currentItem);
		}
	}

	async function onImportClick() {
		// Create a file input element
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.onchange = async (e: Event) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const importedCharacter = await characterRepo.importFromJson(text);

				// Refresh the list
				await updateGroups();

				// Open the imported character
				currentItem = importedCharacter;
				itemsStack.push(importedCharacter);
			} catch (error) {
				console.error("Failed to import character:", error);
				alert("Не удалось импортировать персонажа. Проверьте формат файла.");
			}
		};

		input.click();
	}

	// ---- Private functions ----
	async function updateGroups() {
		const searchValueNormalized = searchBarValue.toLowerCase();
		const smallItems: SmallCharacterSheet[] = await repository.getFilteredSmallItems(
			searchValueNormalized,
			filters
		);
		groups = await repository.groupItems(smallItems);
	}
</script>

<div class="side-panel-container">
	<SidePanelHeader
		onbackclick={currentItem ? onSearchBarBackClick : undefined}
		onvaluechange={onSearchBarValueChanged}
		isvaluechangable={() => !currentItem}
		onclearclick={undefined}
		onfiltersclick={currentItem ? undefined : onSearchBarFiltersClick}
		isfiltersapplied={() => !isFiltersEmpty(filters)}
		onaddclick={onImportClick}
	/>
	<div style="height:1em;"></div>
	{#if currentItem}
		<CharacterSheetFullUi {currentItem} {uiEventListener} repository={characterRepo} {plugin} />
	{:else if searchBarValue.length > 0 && groups.length === 0}
		<h2>Результаты поиска</h2>
		<div>Ничего не найдено</div>
	{:else}
		<div class="side-panel-content">
			{#each groups as group (group.sort)}
				<GroupBlockUi
					groupTitle={group.sort}
					items={group.smallItems}
					onItemClick={onSmallItemClick}
					SmallItemSlot={CharacterSheetSmallUi}
				/>
			{/each}
		</div>
	{/if}

	{#if isFiltersOverlayOpen && fullFilters}
		<FiltersOverlay
			{fullFilters}
			initialFilters={filters}
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

	h2 {
		margin: 0 0 0.5em 0;
		font-size: 1.2em;
	}
</style>
