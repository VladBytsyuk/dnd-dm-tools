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
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

    // ---- Props ----
    interface Props<Small extends BaseItem, Full extends Small, F extends Filters> {
        panelKey: PanelKey;
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
        paginated?: boolean;
        pageSize?: number;
    }

    let {
        panelKey,
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
        paginated = false,
        pageSize = 50,
    }: Props<any, any, any> = $props();

    // ---- State ----
    function getInitialFullItem() {
        return initialFullItem;
    }

    function getInitialFilters() {
        return initialFilters;
    }

    function createEmptyFullItem() {
        return repository.createEmptyFullItem();
    }

    let searchBarValue: string = $state('');
    let filters: any = $state(getInitialFilters());
    let itemsStack: BaseItem[] = $state(getInitialFullItem() ? [getInitialFullItem()] : []);
    let currentItem: BaseItem | undefined = $state(getInitialFullItem() || undefined);
    let groups: Group<BaseItem>[] = $state([]);
    let emptyFullItem = createEmptyFullItem();
    let isFiltersOverlayOpen: boolean = $state(false);
    let fullFilters: any = $state(null);
    let loadedItems: BaseItem[] = $state([]);
    let nextOffset = $state(0);
    let hasMore = $state(false);
    let isLoading = $state(false);
    let loadError: string | null = $state(null);
    let requestGeneration = 0;

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
        isFiltersOverlayOpen = false;
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
        const generation = ++requestGeneration;
        const searchValueNormalized = searchBarValue.toLowerCase();
        loadError = null;
        isLoading = false;

        if (paginated && searchValueNormalized.length === 0 && repository.getSmallItemsPage) {
            loadedItems = [];
            nextOffset = 0;
            hasMore = true;
            groups = [];
            await loadNextPage(generation);
            return;
        }

        hasMore = false;
        isLoading = true;
        try {
            const smallItems: BaseItem[] = await repository.getFilteredSmallItems(searchValueNormalized, filters);
            if (generation !== requestGeneration) return;
            groups = await repository.groupItems(smallItems);
        } catch (error) {
            if (generation !== requestGeneration) return;
            groups = [];
            loadError = error instanceof Error ? error.message : "Не удалось загрузить список.";
        } finally {
            if (generation === requestGeneration) {
                isLoading = false;
            }
        }
    }

    async function loadNextPage(generation = requestGeneration) {
        if (
            !paginated
            || !repository.getSmallItemsPage
            || !hasMore
            || isLoading
            || searchBarValue.length > 0
        ) return;

        isLoading = true;
        loadError = null;
        try {
            const page = await repository.getSmallItemsPage(filters, {
                offset: nextOffset,
                limit: pageSize,
            });
            if (generation !== requestGeneration) return;

            loadedItems = [...loadedItems, ...page.items];
            nextOffset += page.items.length;
            hasMore = page.hasMore;
            groups = await repository.groupItems(loadedItems);
        } catch (error) {
            if (generation !== requestGeneration) return;
            loadError = error instanceof Error ? error.message : "Не удалось загрузить следующую страницу.";
        } finally {
            if (generation === requestGeneration) {
                isLoading = false;
            }
        }
    }

    function observePageEnd(node: HTMLElement) {
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                void loadNextPage();
            }
        }, { rootMargin: "200px" });
        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    function retryLoad() {
        if (paginated && searchBarValue.length === 0 && repository.getSmallItemsPage) {
            void loadNextPage();
        } else {
            void updateGroups();
        }
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
        <div class="content content-full">
            <FullItemSlot
                currentItem={currentItem}
                repository={repository}
                uiEventListener={uiEventListener}
                isEditable=true
                onClose={() => currentItem = undefined}
                onItemSave={async (item: any) => await repository.putItem(item)}
                onItemDelete={async (url: string) => await repository.deleteItem(url)}
            />
        </div>
    {:else if searchBarValue.length > 0 && groups.length === 0 && !isLoading && !loadError}
        <div class="content content-empty">
            <UiEmptyState title="Результаты поиска" message="Ничего не найдено" />
        </div>
    {:else}
        <div class="content">
            {#each groups as group (group.sort)}
                <UiItemGroup
                    {panelKey}
                    groupTitle={groupTitleBuilder(group)}
                    items={group.smallItems}
                    onItemClick={onSmallItemClick}
                    SmallItemSlot={SmallItemSlot}
                />
            {/each}
            {#if loadError}
                <div class="pagination-status pagination-status-error">
                    <span>{loadError}</span>
                    <button type="button" onclick={retryLoad}>Повторить</button>
                </div>
            {:else if isLoading}
                <div class="pagination-status" aria-live="polite">Загрузка...</div>
            {/if}
            {#if paginated && hasMore && !loadError && !isLoading}
                <div class="pagination-sentinel" use:observePageEnd aria-hidden="true"></div>
            {/if}
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

    .content-full {
        padding-bottom: var(--dnd-ui-space-16);
    }

    .pagination-status {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--dnd-ui-space-8);
        padding: var(--dnd-ui-space-8);
        color: var(--dnd-ui-text-secondary);
    }

    .pagination-status-error {
        color: var(--text-error);
    }

    .pagination-status button {
        cursor: pointer;
    }

    .pagination-sentinel {
        min-height: 1px;
    }
</style>
