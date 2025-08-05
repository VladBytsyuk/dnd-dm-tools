<script lang="ts">
	import { EmptySpellbookFilters, isSpellbookFiltersEmpty, type SpellbookFilters } from "src/domain/spellbook_filters";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import { onMount } from "svelte";
	import SpellGroupUi from "../spell/SpellGroupUi.svelte";
	import SpellFullUi from "../spell/SpellFullUi.svelte";
	import { SpellbookFiltersModal } from "src/ui/components/modals/spellbook_filers_modal";
	import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
	import type { FullSpell } from "src/domain/models/spell/FullSpell";

    interface SpellGroupByLevel {
        level: number;
        smallSpells: SmallSpell[];
    }

    // ---- Props ----
    let { plugin, spellbook, initialFullSpell, uiEventListener } = $props();
    
    // ---- State ----
    let searchBarValue: string = $state('');
    let filters: SpellbookFilters = $state(EmptySpellbookFilters());
    let spellsStack: FullSpell[] = $state(initialFullSpell ? [initialFullSpell] : []);
    let currentFullSpell: FullSpell | undefined = $state(initialFullSpell || undefined);
    let spellsGroups: SpellGroupByLevel[] = $state([]);
    
    // ---- Lifecycle ----
    onMount(async () => {
        updateSpellsGroups();
    });

    // ---- Event Handlers ----
    function onSearchBarBackClick() {
        if (spellsStack.length >= 1) {
            spellsStack.pop();
            currentFullSpell = spellsStack.last() || undefined;
        }
    }

    function onSearchBarValueChanged(value: string) {
        searchBarValue = value;
        updateSpellsGroups();
    }

    async function onSearchBarFiltersClick() {
        const fullFilters = await spellbook.getAllFilters();
        if (!fullFilters) return;
        new SpellbookFiltersModal(
            plugin.app,
            fullFilters,
            filters,
            async (newFilters: SpellbookFilters) => {
                filters = newFilters;
                await updateSpellsGroups();
            },
        ).open();
    }

    const onSmallSpellClick = (smallSpell: SmallSpell) => async () => {
        currentFullSpell = await spellbook.getFullSpellBySmallSpell(smallSpell);
        if (currentFullSpell) {
            spellsStack.push(currentFullSpell);
        }
    }

    // ---- private methods ----
    async function updateSpellsGroups() {
        const searchValueNormalized = searchBarValue.trim().toLowerCase();
        const checkName = (name: string) => name.toLowerCase().includes(searchValueNormalized);
        const bySearchValue = (smallSpell: SmallSpell) => checkName(smallSpell.name.rus) || checkName(smallSpell.name.eng);

        const smallSpells: SmallSpell[] = await spellbook.getFilteredSmallSpells(filters);
        const filteredSmallSpells = searchBarValue.length === 0
            ? smallSpells
            : smallSpells.filter(bySearchValue);

        spellsGroups = groupByLevel(filteredSmallSpells);
    }

    function groupByLevel(smallSpells: SmallSpell[]): SpellGroupByLevel[] {
        const groups = smallSpells.reduce((acc, spell) => {
            const level = spell.level;
            (acc[level] ||= []).push(spell);
            return acc;
        }, {} as { [key: string]: SmallSpell[] });

        return Object.entries(groups)
            .map(([level, smallSpells]) => ({ level: +level, smallSpells:smallSpells} as SpellGroupByLevel))
            .sort((a, b) => a.level - b.level);
    }
</script>

<div>
    <SidePanelHeader
        onbackclick={currentFullSpell ? onSearchBarBackClick : undefined}
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentFullSpell}
        onclearclick={undefined}
        onfiltersclick={currentFullSpell ? undefined : onSearchBarFiltersClick}
        isfiltersapplied={() => !isSpellbookFiltersEmpty(filters)}
    />
    <div style="height:1em;"></div>
    {#if currentFullSpell}
        <SpellFullUi
            spell={currentFullSpell}
            uiEventListener={uiEventListener}
        />
    {:else if searchBarValue.length > 0 && spellsGroups.length === 0}
        <h2>Результаты поиска</h2>
        <div>Ничего не найдено</div>
    {:else}
        <div class="content">
            {#each spellsGroups as group (group.level)}
                <SpellGroupUi
                    level={group.level}
                    smallSpells={group.smallSpells}
                    onspellclick={onSmallSpellClick}
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
