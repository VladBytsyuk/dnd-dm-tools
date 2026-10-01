<script lang="ts">
	import DmScreenGroupUi from "../screen/DmScreenGroupUi.svelte";
	import { type DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
	import DmScreenItemUi from "../screen/DmScreenItemUi.svelte";
	import UiSearchToolbar from "../uikit/organisms/UiSearchToolbar.svelte";
	import UiEmptyState from "../uikit/organisms/UiEmptyState.svelte";
	import PanelTypeTint from "../uikit/PanelTypeTint.svelte";
	import HtmlBlock from "../uikit/HtmlBlock.svelte";
	import { TextBlock } from "@dnd-dm-tools/design-system";
	import { theme as appTheme, Theme } from "src/ui/theme";
	import { copyDmScreenItem } from "src/data/clipboard";

    // ---- Props ----
    let { item, children, redesignEnabled = false, uiEventListener, getFilteredItems, getChildrenCount, getChildren, getFullItem } = $props();
    const dsTheme: "dark" | "light" = $derived($appTheme === Theme.Dark ? "dark" : "light");

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

    function copyCurrentItem() {
        if (currentItem) void copyDmScreenItem(currentItem);
    }

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

<div class="side-panel-container" class:redesigned={redesignEnabled} data-theme={dsTheme}>
    <UiSearchToolbar
        onbackclick={itemsStack.length > 0 ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentItem}
        onclearclick={undefined}
        onfiltersclick={undefined}
        isfiltersapplied={undefined}
        onaddclick={undefined}
        oncopyclick={currentItem && currentChildren.length === 0 && currentItem.description ? copyCurrentItem : undefined}
        {redesignEnabled}
    />
    <div class="side-panel-spacer"></div>
    <div class="side-panel-content">
        {#if currentChildren.length === 0 && currentItem?.description}
            <DmScreenItemUi
                currentItem={currentItem}
                uiEventListener={uiEventListener}
                redesigned={redesignEnabled}
                theme={dsTheme}
                sectionName={itemsStack.length > 1 ? itemsStack.at(-2)?.name.rus : currentItem.group}
            />
        {:else if !currentItem && searchBarValue.length > 0}
            {#if filteredItems.length === 0}
                <UiEmptyState title="Результаты поиска" message="Ничего не найдено" />
            {:else}
                <div class="content dm-screen-grid" class:redesigned={redesignEnabled}>
                    {#each filteredItems as item}
                        {#if redesignEnabled}
                            <DmScreenGroupUi
                                icon={item.icon}
                                name={item.name}
                                source={item.source.shortName}
                                onclick={onItemClick(item)}
                                redesigned
                                theme={dsTheme}
                            />
                        {:else}
                            <PanelTypeTint panelKey="dm-screen">
                                <DmScreenGroupUi
                                    icon={item.icon}
                                    name={item.name}
                                    source={item.source.shortName}
                                    onclick={onItemClick(item)}
                                />
                            </PanelTypeTint>
                        {/if}
                    {/each}
                </div>
            {/if}
        {:else}
            {#if currentItem && redesignEnabled}
                <header class="dm-screen-section-header redesigned-header">
                    <TextBlock title={currentItem.name.rus} theme={dsTheme} />
                    {#if currentItem.description}
                        <div class="dm-screen-section-description">
                            <HtmlBlock htmlContent={currentItem.description} {uiEventListener} />
                        </div>
                    {/if}
                </header>
            {:else if currentItem}
                <h2>{currentItem.name.rus}</h2>
            {/if}
            {#if !redesignEnabled && currentItem && currentItem.description}
                <div class="group-description"><HtmlBlock htmlContent={currentItem.description} {uiEventListener} /></div>
            {/if}
            <div class:dm-screen-browser={redesignEnabled}>
                {#each (groupedChildren()) as childGroup}
                    {#if childGroup.subgroupName}
                        {#if redesignEnabled}
                            <TextBlock title={childGroup.subgroupName} theme={dsTheme} />
                        {:else}
                            <div class="group-header">{@html childGroup.subgroupName}</div>
                        {/if}
                    {/if}
                    <div class="content dm-screen-grid" class:redesigned={redesignEnabled}>
                        {#each childGroup.group as group}
                            {#if redesignEnabled}
                                <DmScreenGroupUi
                                    icon={group.icon}
                                    name={group.name}
                                    source={group.source.shortName}
                                    onclick={onItemClick(group)}
                                    redesigned
                                    theme={dsTheme}
                                />
                            {:else}
                                <PanelTypeTint panelKey="dm-screen">
                                    <DmScreenGroupUi
                                        icon={group.icon}
                                        name={group.name}
                                        source={group.source.shortName}
                                        onclick={onItemClick(group)}
                                    />
                                </PanelTypeTint>
                            {/if}
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

    .side-panel-container.redesigned .side-panel-content {
        padding: 0 var(--dnd-ui-space-8) var(--dnd-ui-space-16);
        background: var(--dnd-ui-surface-base);
        color: var(--dnd-ui-text-primary);
    }

    .dm-screen-grid.redesigned {
        grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr));
        gap: var(--dnd-ui-space-8);
        padding: var(--dnd-ui-space-8) 0;
        background: transparent;
    }

    .dm-screen-browser { display: grid; gap: var(--dnd-ui-space-8); }
    .dm-screen-section-header {
        margin: var(--dnd-ui-space-16) 0 var(--dnd-ui-space-8);
    }
    .dm-screen-section-description { margin-top: var(--dnd-ui-space-8); color: var(--dnd-ui-text-secondary); line-height: 1.5; }
    .dm-screen-section-description :global(p) { margin: 0; }
    .side-panel-container.redesigned :global(.empty-state) { padding: 0 var(--dnd-ui-space-8); }
</style>
