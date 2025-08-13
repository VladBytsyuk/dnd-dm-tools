<script lang="ts">
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import { onMount } from "svelte";
	import GroupBlockUi from "../uikit/GroupBlockUi.svelte";
	import type { WithUrl } from "src/domain/models/common/WithUrl";
	import type { Group, Repository } from "src/domain/repositories/Repository";
	import { isFiltersEmpty, type Filters } from "src/domain/models/common/Filters";
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';

    // ---- Props ----
    interface Props<Small extends WithUrl, Full extends Small, F extends Filters> {
        initialFullItem?: Full;
        initialFilters: F;
        uiEventListener: IUiEventListener;
        repository: Repository<Small, Full, F>;
        openFiltersModal: (fullFilters: F, filters: F, onApply: (newFilters: F) => Promise<void>) => void;
        FullItemSlot: any;
        SmallItemSlot: any;
    }

    let { 
        initialFullItem,
        initialFilters,
        uiEventListener,
        repository,
        openFiltersModal,
        FullItemSlot,
        SmallItemSlot,
    }: Props<any, any, any> = $props();

    // ---- State ----
    let searchBarValue: string = $state('');
    let filters: any = $state(initialFilters);
    let itemsStack: WithUrl[] = $state(initialFullItem ? [initialFullItem] : []);
    let currentItem: WithUrl | undefined = $state(initialFullItem || undefined);
    let groups: Group<WithUrl>[] = $state([]);

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
        const fullFilters = await repository.getAllFilters();
        if (!fullFilters) return;
        openFiltersModal(
            fullFilters,
            filters,
            async (newFilters: any) => { 
                filters = newFilters;
                await updateGroups();
            },
        )
    }

    async function onSmallItemClick(smallItem: WithUrl) {
        currentItem = await repository.getFullItemBySmallItem(smallItem) ?? undefined;
        if (currentItem) {
            itemsStack.push(currentItem);
        }
    }

    // ---- private functions ----
    async function updateGroups() {
        const searchValueNormalized = searchBarValue.toLowerCase();
        const smallItems: WithUrl[] = await repository.getFilteredSmallItems(searchValueNormalized, filters);
        groups = await repository.groupItems(smallItems);
    }
</script>

<div>
    <SidePanelHeader
        onbackclick={currentItem ? onSearchBarBackClick : undefined}    
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentItem}
        onclearclick={undefined}
        onfiltersclick={currentItem ? undefined : onSearchBarFiltersClick}
        isfiltersapplied={() => !isFiltersEmpty(filters)}
    />
    <div style="height:1em;"></div>
    {#if currentItem}
        <FullItemSlot
            currentItem={currentItem}
            uiEventListener={uiEventListener}
        />
    {:else if searchBarValue.length > 0 && groups.length === 0}
        <h2>Результаты поиска</h2>
        <div>Ничего не найдено</div>
    {:else}
        <div class="content">
            {#each groups as group (group.sort)}
                <GroupBlockUi
                    groupTitle="Опасность {group.sort}"
                    items={group.smallItems}
                    onItemClick={onSmallItemClick}
                    SmallItemSlot={SmallItemSlot}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .content {
        background-color: var(--color-background);
        gap: 4px;
    }
</style>
