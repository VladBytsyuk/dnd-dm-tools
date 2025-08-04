<script lang="ts">
	import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
	import SidePanelHeader from "../uikit/SidePanelHeader.svelte";
	import MonsterFullUi from "../monster/MonsterFullUi.svelte";
	import MonsterGroupUi from "../monster/MonsterGroupUi.svelte";
	import { onMount } from "svelte";
	import { BestiaryFilter, EmptyBestiaryFilter, isBestiaryFilterEmpty } from "src/domain/bestiary_filters";
	import { BestiaryFiltersModal } from "src/ui/components/modals/bestiary_filers_modal";
	import type { FullMonster } from "src/domain/models/monster/FullMonster";

    interface MonsterGroupByCr {
        challengeRating: string;
        smallMonsters: SmallMonster[];
    }

    // ---- Props ----
    let { plugin, bestiary, initialFullMonster, uiEventListener } = $props();

    // ---- State ----
    let searchBarValue: string = $state('');
    let filters: BestiaryFilter = $state(EmptyBestiaryFilter());
    let monstersStack: FullMonster[] = $state(initialFullMonster ? [initialFullMonster] : []);
    let currentFullMonster: FullMonster | undefined = $state(initialFullMonster || undefined);
    let monstersGroups: MonsterGroupByCr[] = $state([]);

    // ---- Lifecycle ----  
    onMount(() => {
        updateMonstersGroups();
    }); 

    // ---- Event Handlers ----
    function onSearchBarBackClick() {
        if (monstersStack.length >= 1) {
            monstersStack.pop();
            currentFullMonster = monstersStack.last() || undefined;
        }
    }

    function onSearchBarValueChanged(value: string) { 
        searchBarValue = value;
        updateMonstersGroups();
    }                       

    async function onSearchBarFiltersClick() {
        const fullFilters = await bestiary.getAllFilters();
        if (!fullFilters) return;
        new BestiaryFiltersModal(
            plugin.app, 
            fullFilters,
            filters, 
            async (newFilters: BestiaryFilter) => { 
                filters = newFilters;
                await updateMonstersGroups();
            },
        ).open();
    }

    const onSmallMonsterClick = (smallMonster: SmallMonster) => async () => {
        currentFullMonster = await bestiary.getFullMonsterBySmallMonster(smallMonster);
        if (currentFullMonster) {
            monstersStack.push(currentFullMonster);
        }
    }

    // ---- private functions ----
    async function updateMonstersGroups() {
        const searchValueNormalized = searchBarValue.toLowerCase();
        const checkName = (name: string) => name.toLowerCase().includes(searchValueNormalized);
        const bySearchValue = (monster: SmallMonster) => checkName(monster.name.rus) || checkName(monster.name.eng);

        const smallMonsters: SmallMonster[] = await bestiary.getFilteredSmallMonsters(filters);
        const filteredSmallMonsters = searchBarValue.length === 0 
            ? smallMonsters
            : smallMonsters.filter(bySearchValue);
            
        monstersGroups = groupByCr(filteredSmallMonsters);
    }

    function groupByCr(smallMonsters: SmallMonster[]): MonsterGroupByCr[] {
        const parseCR = (cr: string) => {
            if (cr === "—") return -1;
            if (cr.includes("/")) {
                const [numerator, denominator] = cr.split("/").map(Number);
                return numerator / denominator;
            }
            return parseFloat(cr);
        };

        const groups = smallMonsters.reduce((acc, monster) => {
            const cr = monster.challengeRating.toString();
            (acc[cr] ||= []).push(monster);
            return acc;
        }, {} as { [key: string]: SmallMonster[] });

        return Object.entries(groups)
            .map(([cr, smallMonsters]) => ({ challengeRating: cr, smallMonsters }))
            .sort((a, b) => parseCR(a.challengeRating) - parseCR(b.challengeRating));
    }
</script>

<div>
    <SidePanelHeader
        onbackclick={currentFullMonster ? onSearchBarBackClick : undefined}    
        onvaluechange={onSearchBarValueChanged}
        isvaluechangable={() => !currentFullMonster}
        onclearclick={undefined}
        onfiltersclick={currentFullMonster ? undefined : onSearchBarFiltersClick}
        isfiltersapplied={() => !isBestiaryFilterEmpty(filters)}
    />
    <div style="height:1em;"></div>
    {#if currentFullMonster}
        <MonsterFullUi
            monster={currentFullMonster}
            isTwoColumns={false}
            uiEventListener={uiEventListener}
        />
    {:else if searchBarValue.length > 0 && monstersGroups.length === 0}
        <h2>Результаты поиска</h2>
        <div>Ничего не найдено</div>
    {:else}
        <div class="content">
            {#each monstersGroups as crGroup (crGroup.challengeRating)}
                <MonsterGroupUi
                    challengeRating={crGroup.challengeRating}
                    smallMonsters={crGroup.smallMonsters}
                    onmonsterclick={onSmallMonsterClick}       
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
