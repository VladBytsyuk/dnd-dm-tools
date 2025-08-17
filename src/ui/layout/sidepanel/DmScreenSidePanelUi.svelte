<script lang="ts">
	import DmScreenGroupUi from "../screen/DmScreenGroupUi.svelte";
	import { type DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import DmScreenItemUi from "../screen/DmScreenItemUi.svelte";

    // ---- Props ----
    let { item, children, uiEventListener, getFilteredItems, getChildrenCount, getChildren, getFullItem } = $props();

    // ---- State ----
    let itemsStack: DmScreenItem[] = $state(item ? [item] : []);
    let currentItem: DmScreenItem | undefined = $state(item ? item : undefined);
    let currentChildren: DmScreenItem[] = $state(item ? [] : children);
    let searchBarValue: string = $state('');
    
    let filteredItems: DmScreenItem[] = $state([]);

    async function filterItems() {
        if (searchBarValue.length === 0) {
            filteredItems = [];
            return 
        }

        filteredItems = await getFilteredItems(searchBarValue);
    }

    // ---- Event Handlers ----
    async function onSearchBarBackClick() {
        if (itemsStack.length > 0) {
            itemsStack.pop();
            const lastItem = itemsStack.last();
            currentChildren = lastItem ? await getChildren(lastItem) : children;
            currentItem = lastItem;
        }
    }

    function onSearchBarValueChanged(value: string) {
        searchBarValue = value;
        filterItems();
    }

    const onItemClick = (item: DmScreenItem) => async () => {
        currentItem = item;
        if (!item.description) {
            const loadedItem = await getFullItem(item);
            currentItem = loadedItem ?? item;
        }
        if (currentItem) {
            itemsStack.push(currentItem);
        }
        const childrenCount = await getChildrenCount(item);
        if (childrenCount > 0) {
            currentChildren = await getChildren(item);
        } else {
            currentChildren = [];
        }
    }

    // ---- Private utils ----
    function groupedChildren(): Array<{ subgroupName: string, group: DmScreenItem[] }> {
        const map = new Map<string, DmScreenItem[]>();
        if (currentChildren) {
            for (const child of currentChildren) {
                if (!map.has(child.group || '')) {
                    map.set(child.group || '', []);
                }
                map.get(child.group || '')!.push(child);
            }
        }
        const result: Array<{ subgroupName: string, group: DmScreenItem[] }> = [];         
        for (const [subgroupName, group] of map.entries()) {
            result.push({ subgroupName, group });
        }
        return result;
    }
</script>

<div>
    <SidePanelHeader
        onbackclick={itemsStack.length > 0 ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentItem}
        onclearclick={undefined}
        onfiltersclick={undefined}
        isfiltersapplied={undefined}
    />
    <div style="height:1em;"></div>
    {#if currentChildren.length === 0 && currentItem?.description}
        <DmScreenItemUi 
            currentItem={currentItem}
            uiEventListener={uiEventListener}
        />
    {:else if !currentItem && searchBarValue.length > 0}
        <h2>Результаты поиска</h2>
        {#if filteredItems.length === 0}
            <div class="group-description">Ничего не найдено</div>
        {:else}
            <div>
                {#each filteredItems as item}
                    <DmScreenGroupUi
                        icon={item.icon}
                        name={item.name}
                        source={item.source.shortName}
                        onclick={onItemClick(item)}        
                    />
                {/each}
            </div>
        {/if}
    {:else}
        {#if currentItem}
            <h2>{currentItem.name.rus}</h2>
        {/if}
        {#if currentItem && currentItem.description}
            <div class="group-description">{@html currentItem.description}</div>
        {/if}
        <div>
            {#each (groupedChildren()) as childGroup}
                <div class="group-header">{@html childGroup.subgroupName}</div>
                <div class="content">
                {#each childGroup.group as group}
                    <DmScreenGroupUi
                        icon={group.icon}
                        name={group.name}
                        source={group.source.shortName}
                        onclick={onItemClick(group)}        
                    />
                {/each}
                </div>
            {/each}
        </div>
    {/if}   
</div>

<style>
    .content {
        background-color: var(--color-background);

        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }

    .group-description {
        font-size: 0.875rem;
        color: var(--text-color);   
    }       

    .group-header {
        font-weight: 600;
        color: var(--text-color);
        margin-top: 16px;
        margin-bottom: 8px;
    }
</style>
