<script lang="ts">
	import DmScreenGroupUi from "./DmScreenGroupUi.svelte";
	import { allChildrenOfGroup, EmptyDmScreenGroup, groupedChildrenOf, type DmScreenGroup } from "src/domain/dm_screen_group";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import type { DmScreenItem } from "src/domain/dm_screen_item";
	import DmScreenItemUi from "./DmScreenItemUi.svelte";

    // ---- Props ----
    let { rootGroup, screenGroup, screenItem, htmlLinkListener, loadScreenItem } = $props();

    // ---- State ----
    let groupsStack: DmScreenGroup[] = $state(screenGroup ? [rootGroup, screenGroup] : [rootGroup]);
    let currentGroup: DmScreenGroup = $state(screenGroup || rootGroup);
    let searchBarValue: string = $state('');
    let filteredGroups: DmScreenGroup[] = $state([]);
    let currentScreenItem: DmScreenItem | null = $state(screenItem);

    function filterGroups() {
        if (searchBarValue.length === 0) {
            filteredGroups = [];
            return 
        }

        const searchValueNormalized = searchBarValue.toLowerCase();
        const checkName = (name: string) => name.toLowerCase().includes(searchValueNormalized);

        filteredGroups = allChildrenOfGroup(rootGroup).filter(item => checkName(item.name.rus) || checkName(item.name.eng));
    }

    // ---- Event Handlers ----
    function onSearchBarBackClick() {
        if (currentScreenItem) {
            currentScreenItem = null;
            return;
        }   
        if (groupsStack.length > 1) {
            groupsStack.pop();
            currentGroup = groupsStack.last() || EmptyDmScreenGroup();
        }
    }

    function onSearchBarValueChanged(value: string) {
        searchBarValue = value;
        filterGroups();
    }

    const onGroupClick = (group: DmScreenGroup) => async () => {
        if (group.children && group.children.length > 0) {
            groupsStack.push(group);
            currentGroup = group;
        } else {
            await handleGroupClick(group);
        }
    }

    async function handleGroupClick(group: DmScreenGroup) {
        const screenItem = await loadScreenItem(group);
        currentScreenItem = screenItem
    }
</script>

<div>
    <SidePanelHeader
        onbackclick={groupsStack.length > 1 || currentScreenItem ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        onclearclick={undefined}
        onfiltersclick={undefined}
    />
    <div style="height:1em;"></div>
    {#if currentScreenItem}
        <DmScreenItemUi 
            item={currentScreenItem}
            htmlLinkListener={htmlLinkListener}
        />
    {:else if searchBarValue.length > 0}
        <h2>Результаты поиска</h2>
        {#if filteredGroups.length === 0}
            <div class="group-description">Ничего не найдено</div>
        {:else}
            <div>
                {#each filteredGroups as group}
                    <DmScreenGroupUi
                        icon={group.icon}
                        name={group.name}
                        source={group.source.shortName}
                        onclick={onGroupClick(group)}        
                    />
                {/each}
            </div>
        {/if}
    {:else if currentGroup}
        <h2>{currentGroup.name.rus}</h2>
        {#if currentGroup.description}
            <div class="group-description">{@html currentGroup.description}</div>
        {/if}
        <div>
            {#each (groupedChildrenOf(currentGroup)) as childGroup}
                <div class="group-header">{@html childGroup.subgroupName}</div>
                <div class="content">
                {#each childGroup.group as group}
                    <DmScreenGroupUi
                        icon={group.icon}
                        name={group.name}
                        source={group.source.shortName}
                        onclick={onGroupClick(group)}        
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
