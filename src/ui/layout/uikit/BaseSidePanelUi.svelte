<script lang="ts">
	import { onMount } from "svelte";
	import { Notice } from "obsidian";
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
	import RedesignedFullItem from "src/ui/design-system/RedesignedFullItem.svelte";
	import { createEmptyDomainItem } from "src/ui/design-system/adapters";
	import type { EntityKind } from "src/domain/models/common/EntityOrigin";

    // ---- Props ----
    interface Props<Small extends BaseItem, Full extends Small, F extends Filters> {
        panelKey: PanelKey;
        redesignEnabled?: boolean;
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
        redesignEnabled = false,
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
        return repository.createEmptyFullItem() ?? (redesignEnabled ? createEmptyDomainItem(panelKey) : undefined);
    }

    let searchBarValue: string = $state('');
    let filters: any = $state(getInitialFilters());
    let itemsStack: BaseItem[] = $state(getInitialFullItem() ? [getInitialFullItem()] : []);
    let currentItem: BaseItem | undefined = $state(getInitialFullItem() || undefined);
    let detailEditing = $state(false);
    let detailSaving = $state(false);
    let toolbarActionRequest = $state<{ id: number; command: "edit" | "save" | "cancel" | "copy" | "paste" }>({ id: 0, command: "edit" });
    let groups: Group<BaseItem>[] = $state([]);
    let favoriteGroupItems: BaseItem[] = $state([]);
    function initialFavoriteUrls() {
        return new Set(redesignEnabled ? repository.favorites?.listUrls(panelKey as EntityKind) ?? [] : []);
    }
    let favoriteUrls = $state<Set<string>>(initialFavoriteUrls());
    let favoriteBusy = $state(false);
    let emptyFullItem = createEmptyFullItem();
    let isFiltersOverlayOpen: boolean = $state(false);
    let fullFilters: any = $state(null);
    let loadedItems: BaseItem[] = $state([]);
    let nextOffset = $state(0);
    let hasMore = $state(false);
    let isLoading = $state(false);
    let loadError: string | null = $state(null);
    let requestGeneration = 0;
    let groupOpen = $state(new Map<string, boolean>());
    let groupVisibleCounts = $state(new Map<string, number>());
    let favoriteGroupOpen = $state(true);
    let pendingAdvanceFrom: string | null = $state(null);
    let pageRequest: Promise<boolean> | null = null;
    let advanceRequest: Promise<void> | null = null;
    const revealingGroups = new Set<string>();

    // ---- Lifecycle ----  
    onMount(() => updateGroups()); 

    // ---- Event Handlers ----
    function onSearchBarBackClick() {
        if (itemsStack.length >= 1) {
            itemsStack.pop();
            currentItem = itemsStack.last() || undefined;
            detailEditing = false;
            detailSaving = false;
            toolbarActionRequest = { id: toolbarActionRequest.id + 1, command: "cancel" };
            if (!currentItem) void updateGroups();
        }
    }

    function onSearchBarValueChanged(value: string) { 
        searchBarValue = value;
        updateGroups(true);
    }                       

    function requestToolbarAction(command: "edit" | "save" | "cancel" | "copy" | "paste") {
        toolbarActionRequest = { id: toolbarActionRequest.id + 1, command };
    }

    function onAddClick() {
        if (!emptyFullItem) return;
        currentItem = emptyFullItem;
        itemsStack.push(emptyFullItem);
        if (panelKey !== "classes") requestToolbarAction("edit");
    }

    function onRedesignedEditorStateChange(state: { editing: boolean; saving: boolean }) {
        detailEditing = state.editing;
        detailSaving = state.saving;
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
        await updateGroups(true);
    }

    function handleFiltersClose() {
        isFiltersOverlayOpen = false;
    }

    async function onSmallItemClick(smallItem: BaseItem) {
        isLoading = true;
        loadError = null;
        try {
            currentItem = await repository.getFullItemBySmallItem(smallItem) ?? undefined;
            if (currentItem) {
                itemsStack.push(currentItem);
            } else {
                loadError = "Не удалось загрузить элемент.";
                console.warn(`Failed to open item ${smallItem.url}.`);
            }
        } catch (error) {
            currentItem = undefined;
            loadError = error instanceof Error ? error.message : "Не удалось загрузить элемент.";
            console.error(`Failed to open item ${smallItem.url}.`, error);
        } finally {
            isLoading = false;
        }
    }

    async function onItemDelete(url: string): Promise<boolean> {
        const deleteSucceed = await repository.deleteItem(url);
        if (!deleteSucceed) return false;

        itemsStack = itemsStack.filter((item) => item.url !== url);
        currentItem = undefined;
        await updateGroups();
        return true;
    }

    async function toggleFavorite() {
        if (!redesignEnabled || !repository.favorites || !currentItem?.url || detailEditing || detailSaving || favoriteBusy) return;
        favoriteBusy = true;
        try {
            const url = currentItem.url;
            const nextFavorite = !favoriteUrls.has(url);
            await repository.favorites.set(panelKey as EntityKind, url, nextFavorite);
            const nextUrls = new Set(favoriteUrls);
            if (nextFavorite) nextUrls.add(url);
            else nextUrls.delete(url);
            favoriteUrls = nextUrls;
        } catch (error) {
            console.error("Failed to update favorite:", error);
            new Notice("Не удалось изменить избранное.");
        } finally {
            favoriteBusy = false;
        }
    }

    async function deleteCurrentManualItem() {
        if (currentItem?.origin !== "manual") return;
        await onItemDelete(currentItem.url);
    }

    async function onItemSave(item: any, context: any) {
        const result = await repository.putItem(item, context);
        if (result.ok) {
            currentItem = item;
            itemsStack = itemsStack.map((entry) => entry.url === context.originalUrl ? item : entry);
            await updateGroups();
        }
        return result;
    }

    // ---- private functions ----
    async function updateGroups(resetGroupState = false) {
        const generation = ++requestGeneration;
        const searchValueNormalized = searchBarValue.toLowerCase();
        loadError = null;
        isLoading = false;
        pendingAdvanceFrom = null;
        pageRequest = null;
        advanceRequest = null;
        if (resetGroupState) {
            groupOpen = new Map();
            groupVisibleCounts = new Map();
            favoriteGroupOpen = true;
        }
        favoriteUrls = new Set(redesignEnabled ? repository.favorites?.listUrls(panelKey as EntityKind) ?? [] : []);

        if (paginated && searchValueNormalized.length === 0 && repository.getSmallItemsPage) {
            loadedItems = [];
            nextOffset = 0;
            hasMore = true;
            groups = [];
            try {
                favoriteGroupItems = redesignEnabled && repository.getFavoriteSmallItems
                    ? await repository.getFavoriteSmallItems(filters)
                    : [];
            } catch (error) {
                if (generation !== requestGeneration) return;
                favoriteGroupItems = [];
                hasMore = false;
                loadError = error instanceof Error ? error.message : "Не удалось загрузить избранное.";
                return;
            }
            if (generation !== requestGeneration) return;
            await loadNextPage(generation);
            return;
        }

        hasMore = false;
        isLoading = true;
        try {
            const smallItems: BaseItem[] = await repository.getFilteredSmallItems(searchValueNormalized, filters);
            if (generation !== requestGeneration) return;
            groups = await repository.groupItems(smallItems);
            favoriteGroupItems = redesignEnabled ? smallItems.filter((item) => favoriteUrls.has(item.url)) : [];
        } catch (error) {
            if (generation !== requestGeneration) return;
            groups = [];
            favoriteGroupItems = [];
            loadError = error instanceof Error ? error.message : "Не удалось загрузить список.";
        } finally {
            if (generation === requestGeneration) {
                isLoading = false;
            }
        }
    }

    function isGroupOpen(sort: string): boolean {
        return groupOpen.get(sort) ?? true;
    }

    function visibleGroupItems(group: Group<BaseItem>): BaseItem[] {
        const count = groupVisibleCounts.get(group.sort);
        return count === undefined ? group.smallItems : group.smallItems.slice(0, count);
    }

    function hasOpenGroupAfter(sort: string): boolean {
        const index = groups.findIndex((group) => group.sort === sort);
        return index >= 0 && groups.slice(index + 1).some((group) => isGroupOpen(group.sort));
    }

    function onGroupOpenChange(sort: string, open: boolean) {
        if (isGroupOpen(sort) === open) return;
        groupOpen = new Map(groupOpen).set(sort, open);

        if (open) {
            if (pendingAdvanceFrom === sort) pendingAdvanceFrom = null;
            return;
        }

        const group = groups.find((entry) => entry.sort === sort);
        if (group) {
            const counts = new Map(groupVisibleCounts);
            counts.set(sort, Math.min(counts.get(sort) ?? group.smallItems.length, group.smallItems.length));
            groupVisibleCounts = counts;
        }
        if (paginated && !searchBarValue && hasMore && !hasOpenGroupAfter(sort)) {
            pendingAdvanceFrom = sort;
            void advanceToNextOpenGroup();
        }
    }

    async function advanceToNextOpenGroup() {
        if (advanceRequest) return advanceRequest;
        const generation = requestGeneration;
        const request = (async () => {
            while (
                generation === requestGeneration
                && pendingAdvanceFrom !== null
                && !hasOpenGroupAfter(pendingAdvanceFrom)
                && hasMore
                && !loadError
            ) {
                if (!await loadNextPage(generation)) break;
            }
            if (generation === requestGeneration && pendingAdvanceFrom !== null && (hasOpenGroupAfter(pendingAdvanceFrom) || !hasMore)) {
                pendingAdvanceFrom = null;
            }
        })();
        advanceRequest = request;
        try {
            await request;
        } finally {
            if (advanceRequest === request) advanceRequest = null;
        }
    }

    function showGroupLoadMore(group: Group<BaseItem>, index: number): boolean {
        const count = groupVisibleCounts.get(group.sort);
        return count !== undefined
            && !loadError
            && !isLoading
            && (count < group.smallItems.length || (hasMore && index === groups.length - 1));
    }

    async function revealGroupPage(sort: string) {
        if (revealingGroups.has(sort)) return;
        const count = groupVisibleCounts.get(sort);
        if (count === undefined || !isGroupOpen(sort)) return;
        revealingGroups.add(sort);
        try {
            let group = groups.find((entry) => entry.sort === sort);
            if (!group) return;
            if (count >= group.smallItems.length && hasMore && groups.at(-1)?.sort === sort) {
                if (!await loadNextPage()) return;
                group = groups.find((entry) => entry.sort === sort);
            }
            if (group && group.smallItems.length > count) {
                groupVisibleCounts = new Map(groupVisibleCounts).set(sort, Math.min(count + pageSize, group.smallItems.length));
            }
        } finally {
            revealingGroups.delete(sort);
        }
    }

    async function loadNextPage(generation = requestGeneration): Promise<boolean> {
        if (
            !paginated
            || !repository.getSmallItemsPage
            || !hasMore
            || generation !== requestGeneration
            || searchBarValue.length > 0
        ) return false;
        if (pageRequest) return pageRequest;
        if (isLoading) return false;

        const request = (async () => {
            isLoading = true;
            loadError = null;
            try {
                const page = await repository.getSmallItemsPage!(filters, {
                    offset: nextOffset,
                    limit: pageSize,
                });
                if (generation !== requestGeneration) return false;

                const nextItems = [...loadedItems, ...page.items];
                const nextGroups = await repository.groupItems(nextItems);
                if (generation !== requestGeneration) return false;
                loadedItems = nextItems;
                nextOffset += page.items.length;
                hasMore = page.hasMore;
                groups = nextGroups;
                return page.items.length > 0;
            } catch (error) {
                if (generation !== requestGeneration) return false;
                loadError = error instanceof Error ? error.message : "Не удалось загрузить следующую страницу.";
                return false;
            } finally {
                if (generation === requestGeneration) isLoading = false;
            }
        })();
        pageRequest = request;
        try {
            return await request;
        } finally {
            if (pageRequest === request) pageRequest = null;
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
            if (pendingAdvanceFrom !== null) {
                loadError = null;
                void advanceToNextOpenGroup();
            } else {
                void loadNextPage();
            }
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
        onaddclick={!currentItem && emptyFullItem ? onAddClick : undefined}
        oneditclick={redesignEnabled && currentItem && panelKey !== "classes" && !detailEditing ? () => requestToolbarAction("edit") : undefined}
        oncopyclick={redesignEnabled && currentItem ? () => requestToolbarAction("copy") : undefined}
        onfavoriteclick={redesignEnabled && repository.favorites && currentItem?.url && !detailEditing && !detailSaving ? toggleFavorite : undefined}
        isfavorite={Boolean(currentItem?.url && favoriteUrls.has(currentItem.url))}
        {favoriteBusy}
        onpasteclick={redesignEnabled && currentItem && detailEditing ? () => requestToolbarAction("paste") : undefined}
        ondeleteclick={redesignEnabled && !detailEditing && currentItem?.origin === "manual" ? deleteCurrentManualItem : undefined}
        onsaveclick={redesignEnabled && currentItem && detailEditing ? () => requestToolbarAction("save") : undefined}
        oncancelclick={redesignEnabled && currentItem && detailEditing ? () => requestToolbarAction("cancel") : undefined}
        actionBusy={detailSaving}
        {redesignEnabled}
    />
    <div class="side-panel-spacer"></div>
    {#if currentItem}
        <div class="content content-full">
            {#if redesignEnabled}
                {#key currentItem.url}
                    <RedesignedFullItem
                        {panelKey}
                        currentItem={currentItem}
                        actionRequest={toolbarActionRequest}
                        onEditorStateChange={onRedesignedEditorStateChange}
                        {uiEventListener}
                        {onItemSave}
                    />
                {/key}
            {:else}<FullItemSlot
                currentItem={currentItem}
                repository={repository}
                uiEventListener={uiEventListener}
                isEditable=true
                onClose={() => currentItem = undefined}
                {onItemSave}
                {onItemDelete}
            />{/if}
        </div>
    {:else if searchBarValue.length > 0 && groups.length === 0 && !isLoading && !loadError}
        <div class="content content-empty">
            <UiEmptyState title="Результаты поиска" message="Ничего не найдено" />
        </div>
    {:else}
        <div class="content">
            {#if redesignEnabled && favoriteGroupItems.length > 0}
                <UiItemGroup
                    {panelKey}
                    groupTitle="Избранное"
                    items={favoriteGroupItems}
                    onItemClick={onSmallItemClick}
                    {SmallItemSlot}
                    {redesignEnabled}
                    isFavorite={(url: string) => favoriteUrls.has(url)}
                    isOpen={favoriteGroupOpen}
                    onOpenChange={(open: boolean) => favoriteGroupOpen = open}
                />
            {/if}
            {#each groups as group, index (group.sort)}
                <UiItemGroup
                    {panelKey}
                    groupTitle={groupTitleBuilder(group)}
                    items={visibleGroupItems(group)}
                    onItemClick={onSmallItemClick}
	                    {SmallItemSlot}
	                    {redesignEnabled}
	                    isFavorite={(url: string) => favoriteUrls.has(url)}
                    isOpen={isGroupOpen(group.sort)}
                    onOpenChange={(open: boolean) => onGroupOpenChange(group.sort, open)}
                    showLoadMore={showGroupLoadMore(group, index)}
                    onLoadMore={() => void revealGroupPage(group.sort)}
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
            {#if paginated && hasMore && !loadError && !isLoading && pendingAdvanceFrom === null}
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
