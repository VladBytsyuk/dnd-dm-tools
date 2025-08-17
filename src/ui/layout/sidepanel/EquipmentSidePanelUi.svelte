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

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallItem, FullItem, EquipmentFilters, Equipment> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<EquipmentFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={EquipFullUi}
    SmallItemSlot={EquipSmallUi}
/>