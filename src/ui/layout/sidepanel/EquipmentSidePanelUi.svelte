<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallItem } from "src/domain/models/items/SmallItem";
	import type { FullItem } from "src/domain/models/items/FullItem";
	import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
	import type { Equipment } from "src/domain/repositories/Equipment";
	import EquipFullUi from "../equip/EquipFullUi.svelte";
	import EquipSmallUi from "../equip/EquipSmallUi.svelte";
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallItem, FullItem, EquipmentFilters, Equipment> = $props();

    const filterConfig: FilterConfig<EquipmentFilters>[] = [
        { key: 'sources', label: 'Источник' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<EquipmentFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={EquipFullUi}
    SmallItemSlot={EquipSmallUi}
/>