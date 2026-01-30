<script lang="ts">
	import SidePanelHeader from "./SidePanelHeader.svelte";
	import { onMount } from "svelte";
	import GroupBlockUi from "./GroupBlockUi.svelte";
	import FiltersOverlay from "./FiltersOverlay.svelte";
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import type { Group, Repository } from "src/domain/repositories/Repository";
	import { isFiltersEmpty, type Filters } from "src/domain/models/common/Filters";
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    // ---- Props ----
    interface Props<Small extends BaseItem, Full extends Small, F extends Filters> {
        initialFullItem?: Full;
        initialFilters: F;
        uiEventListener: IUiEventListener;
        repository: Repository<Small, Full, F>;
        filterConfig: FilterConfig<F>[];
        groupTitleBuilder: (group: Group<Small>) => string;
        FullItemSlot: any;
        SmallItemSlot: any;
    }

    let {
        initialFullItem,
        initialFilters,
        uiEventListener,
        repository,
        filterConfig,
        groupTitleBuilder,
        FullItemSlot,
        SmallItemSlot,
    }: Props<any, any, any> = $props();

    // ---- State ----
    let searchBarValue: string = $state('');
    let filters: any = $state(initialFilters);
    let itemsStack: BaseItem[] = $state(initialFullItem ? [initialFullItem] : []);
    let currentItem: BaseItem | undefined = $state(initialFullItem || undefined);
    let groups: Group<BaseItem>[] = $state([]);
    let emptyFullItem = repository.createEmptyFullItem();
    let isFiltersOverlayOpen: boolean = $state(false);
    let fullFilters: any = $state(null);

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
        fullFilters = await repository.getAllFilters();
        if (!fullFilters) return;
        isFiltersOverlayOpen = true;
    }

    async function handleFiltersApply(newFilters: any) {
        filters = newFilters;
        await updateGroups();
    }

    function handleFiltersClose() {
        isFiltersOverlayOpen = false;
    }

    async function onSmallItemClick(smallItem: BaseItem) {
        currentItem = await repository.getFullItemBySmallItem(smallItem) ?? undefined;
        if (currentItem) {
            itemsStack.push(currentItem);
        }
    }

    // ---- private functions ----
    async function updateGroups() {
        const searchValueNormalized = searchBarValue.toLowerCase();
        const smallItems: BaseItem[] = await repository.getFilteredSmallItems(searchValueNormalized, filters);
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
        onaddclick={emptyFullItem ? () => { currentItem = emptyFullItem; itemsStack.push(emptyFullItem); } : undefined}
    />
    <div style="height:1em;"></div>
    {#if currentItem}
        <FullItemSlot
            currentItem={currentItem}
            repository={repository}
            uiEventListener={uiEventListener}
            isEditable=true
            onClose={() => currentItem = undefined}
            onItemSave={async (item: any) => await repository.putItem(item)}
            onItemDelete={async (url: string) => await repository.deleteItem(url)}
        />
    {:else if searchBarValue.length > 0 && groups.length === 0}
        <h2>Результаты поиска</h2>
        <div>Ничего не найдено</div>
    {:else}
        <div class="content">
            {#each groups as group (group.sort)}
                <GroupBlockUi
                    groupTitle={groupTitleBuilder(group)}
                    items={group.smallItems}
                    onItemClick={onSmallItemClick}
                    SmallItemSlot={SmallItemSlot}
                />
            {/each}
        </div>
    {/if}

    {#if isFiltersOverlayOpen && fullFilters}
        <FiltersOverlay
            fullFilters={fullFilters}
            initialFilters={filters}
            filterConfig={filterConfig}
            onApply={handleFiltersApply}
            onClose={handleFiltersClose}
        />
    {/if}
</div>

<style>
    .side-panel-container {
        position: relative;
    }

    .content {
        background-color: var(--color-background);
        gap: 4px;
    }
</style>
