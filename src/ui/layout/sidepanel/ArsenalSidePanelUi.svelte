<script lang="ts">
	import WeaponFullUi from './../weapon/WeaponFullUi.svelte';
	import WeaponSmallUi from './../weapon/WeaponSmallUi.svelte';
    import type { Arsenal } from "src/domain/repositories/Arsenal";
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
	import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
	import type { ArsenalFilters } from 'src/domain/models/weapon/ArsenalFilters';
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallWeapon, FullWeapon, ArsenalFilters, Arsenal> = $props();

    const filterConfig: FilterConfig<ArsenalFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'dices', label: 'Кости' },
        { key: 'damageTypes', label: 'Типы урона' },
        { key: 'types', label: 'Типы' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ArsenalFilters>(['types', 'sources', 'dices', 'damageTypes'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={WeaponFullUi}
    SmallItemSlot={WeaponSmallUi}
/>