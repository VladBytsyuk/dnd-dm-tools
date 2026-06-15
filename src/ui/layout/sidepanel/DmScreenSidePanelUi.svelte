<script lang="ts">
	import DmScreenGroupUi from "../screen/DmScreenGroupUi.svelte";
	import { type DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
	import DmScreenItemUi from "../screen/DmScreenItemUi.svelte";
	import UiSearchToolbar from "../uikit/organisms/UiSearchToolbar.svelte";
	import UiEmptyState from "../uikit/organisms/UiEmptyState.svelte";
	import PanelTypeTint from "../uikit/PanelTypeTint.svelte";

    // ---- Props ----
    let { item, children, uiEventListener, getFilteredItems, getChildrenCount, getChildren, getFullItem } = $props();

    // ---- State ----
    function getInitialItem() {
        return item;
    }

    function getInitialChildren() {
        return getInitialItem() ? [] : children;
    }

    let itemsStack: DmScreenItem[] = $state(getInitialItem() ? [getInitialItem()] : []);
    let currentItem: DmScreenItem | undefined = $state(getInitialItem() ? getInitialItem() : undefined);
    let currentChildren: DmScreenItem[] = $state(getInitialChildren());
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

<div class="side-panel-container">
    <UiSearchToolbar
        onbackclick={itemsStack.length > 0 ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentItem}
        onclearclick={undefined}
        onfiltersclick={undefined}
        isfiltersapplied={undefined}
        onaddclick={undefined}
    />
    <div class="side-panel-spacer"></div>
    <div class="side-panel-content">
        {#if currentChildren.length === 0 && currentItem?.description}
            <DmScreenItemUi
                currentItem={currentItem}
                uiEventListener={uiEventListener}
            />
        {:else if !currentItem && searchBarValue.length > 0}
            {#if filteredItems.length === 0}
                <UiEmptyState title="Результаты поиска" message="Ничего не найдено" />
            {:else}
                <div class="content">
                    {#each filteredItems as item}
                        <PanelTypeTint panelKey="dm-screen">
                            <DmScreenGroupUi
                                icon={item.icon}
                                name={item.name}
                                source={item.source.shortName}
                                onclick={onItemClick(item)}
                            />
                        </PanelTypeTint>
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
                            <PanelTypeTint panelKey="dm-screen">
                                <DmScreenGroupUi
                                    icon={group.icon}
                                    name={group.name}
                                    source={group.source.shortName}
                                    onclick={onItemClick(group)}
                                />
                            </PanelTypeTint>
                        {/each}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .side-panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .side-panel-spacer {
        height: 1em;
        flex-shrink: 0;
    }

    .side-panel-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .content {
        background-color: var(--dnd-ui-surface-base);

        display: grid;
        grid-template-columns: repeat(
            auto-fit,
            minmax(min(20rem, 100%), 1fr)
        );
        gap: var(--dnd-ui-space-4);
    }

    .group-description {
        font-size: 0.875rem;
        color: var(--dnd-ui-text-secondary);
    }       

    .group-header {
        font-weight: var(--dnd-ui-font-weight-semibold);
        color: var(--dnd-ui-text-secondary);
        margin-top: var(--dnd-ui-space-16);
        margin-bottom: var(--dnd-ui-space-8);
    }
</style>
