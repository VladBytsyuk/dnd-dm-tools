<script lang="ts">
	import DmScreenGroupUi from "./DmScreenGroupUi.svelte";
	import { EmptyDmScreenGroup, groupedChildrenOf, type DmScreenGroup } from "src/domain/dm_screen_group";
	import SidePanelHeader from "../SidePanelHeader.svelte";
	import type { DmScreenItem } from "src/domain/dm_screen_item";
	import DmScreenItemUi from "./DmScreenItemUi.svelte";

    // ---- Props ----
    let { rootGroup, loadScreenItem } = $props();

    // ---- State ----
    let groupsStack: DmScreenGroup[] = $state([rootGroup]);
    let currentGroup: DmScreenGroup = $state(rootGroup);
    let searchBarValue: string = $state('');
    let currentScreenItem: DmScreenItem | null = $state(null);

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
        onbackclick={groupsStack.length > 1 ? onSearchBarBackClick : undefined}
        onvaluechange={(value: string) => searchBarValue = value}
        onclearclick={undefined}
        onfiltersclick={undefined}
    />
    {#if currentScreenItem}
        <DmScreenItemUi item={currentScreenItem} />
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
