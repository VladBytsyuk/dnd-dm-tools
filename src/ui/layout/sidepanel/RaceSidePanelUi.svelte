<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
    import type { SmallRace } from "src/domain/models/race/SmallRace";
    import type { FullRace } from "src/domain/models/race/FullRace";
    import type { RaceFilters } from "src/domain/models/race/RaceFilters";
    import type { Races } from "src/domain/repositories/Races";
    import RaceFullUi from "../race/RaceFullUi.svelte";
    import RaceSmallUi from "../race/RaceSmallUi.svelte";
    import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallRace, FullRace, RaceFilters, Races> = $props();

    const filterConfig: FilterConfig<RaceFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'abilities', label: 'Способности' },
        { key: 'types', label: 'Типы' },
    ];

    // Ability key to Russian name mapping for display
    const abilityToRussian: Record<string, string> = {
        'STRENGTH': 'Сила',
        'DEXTERITY': 'Ловкость',
        'CONSTITUTION': 'Телосложение',
        'INTELLIGENCE': 'Интеллект',
        'WISDOM': 'Мудрость',
        'CHARISMA': 'Харизма',
        'ONE': 'к одной',
        'CHOICE': 'к другой',
        'CHOICE_DOUBLE': '+2 и +1 / +1 к трем',
        'CHOICE_UNIQUE': 'к 2 другим',
    };

    // Reverse mapping for applying filters
    const russianToAbility: Record<string, string> = {
        'Сила': 'STRENGTH',
        'Ловкость': 'DEXTERITY',
        'Телосложение': 'CONSTITUTION',
        'Интеллект': 'INTELLIGENCE',
        'Мудрость': 'WISDOM',
        'Харизма': 'CHARISMA',
        'к одной': 'ONE',
        'к другой': 'CHOICE',
        '+2 и +1 / +1 к трем': 'CHOICE_DOUBLE',
        'к 2 другим': 'CHOICE_UNIQUE',
    };

    // Display order for abilities
    const abilityDisplayOrder: string[] = [
        'Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма',
        'к одной', 'к другой', '+2 и +1 / +1 к трем', 'к 2 другим'
    ];

    function filterDisplayTransform(filters: RaceFilters): RaceFilters {
        const translated = filters.abilities.map(key => abilityToRussian[key] || key);
        const sorted = translated.sort((a, b) => {
            const aIndex = abilityDisplayOrder.indexOf(a);
            const bIndex = abilityDisplayOrder.indexOf(b);
            const aOrder = aIndex !== -1 ? aIndex : 999;
            const bOrder = bIndex !== -1 ? bIndex : 999;
            return aOrder - bOrder;
        });
        return {
            ...filters,
            abilities: sorted,
        };
    }

    function filterApplyTransform(filters: RaceFilters): RaceFilters {
        return {
            ...filters,
            abilities: filters.abilities.map(name => russianToAbility[name] || name),
        };
    }
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<RaceFilters>(['abilities', 'types', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={RaceFullUi}
    SmallItemSlot={RaceSmallUi}
    filterDisplayTransform={filterDisplayTransform}
    filterApplyTransform={filterApplyTransform}
/>
