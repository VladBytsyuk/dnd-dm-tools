<script lang="ts">
	import { onMount } from "svelte";
	import FiltersOverlay from "./FiltersOverlay.svelte";
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import type { Group, Repository } from "src/domain/repositories/Repository";
	import { isFiltersEmpty, type Filters } from "src/domain/models/common/Filters";
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FilterConfig } from "src/domain/utils/FilterConfig";
	import UiEmptyState from "./organisms/UiEmptyState.svelte";
	import UiSearchToolbar from "./organisms/UiSearchToolbar.svelte";
	import UiItemGroup from "./organisms/UiItemGroup.svelte";

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
        filterDisplayTransform?: (filters: F) => F;
        filterApplyTransform?: (filters: F) => F;
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
        filterDisplayTransform,
        filterApplyTransform,
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
        const rawFilters = await repository.getAllFilters();
        if (!rawFilters) return;
        fullFilters = filterDisplayTransform ? filterDisplayTransform(rawFilters) : rawFilters;
        isFiltersOverlayOpen = true;
    }

    async function handleFiltersApply(newFilters: any) {
        filters = filterApplyTransform ? filterApplyTransform(newFilters) : newFilters;
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
    <UiSearchToolbar
        onbackclick={currentItem ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentItem}
        onclearclick={undefined}
        onfiltersclick={currentItem ? undefined : onSearchBarFiltersClick}
        isfiltersapplied={() => !isFiltersEmpty(filters)}
        onaddclick={emptyFullItem ? () => { currentItem = emptyFullItem; itemsStack.push(emptyFullItem); } : undefined}
    />
    <div class="side-panel-spacer"></div>
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
        <div class="content content-empty">
            <UiEmptyState title="Результаты поиска" message="Ничего не найдено" />
        </div>
    {:else}
        <div class="content">
            {#each groups as group (group.sort)}
                <UiItemGroup
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
            initialFilters={filterDisplayTransform ? filterDisplayTransform(filters) : filters}
            filterConfig={filterConfig}
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
        position: relative;
    }

    .side-panel-spacer {
        height: 1em;
        flex-shrink: 0;
    }

    .content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        background-color: var(--dnd-ui-surface-base);
        gap: var(--dnd-ui-space-4);
        position: relative;
        z-index: 1;
    }

    .content-empty {
        justify-content: flex-start;
    }
</style>
