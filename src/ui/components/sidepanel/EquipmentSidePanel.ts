import type { SmallItem } from "src/domain/models/items/SmallItem";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import { mount } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import EquipFullUi from "src/ui/layout/equip/EquipFullUi.svelte";
import EquipSmallUi from "src/ui/layout/equip/EquipSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class EquipmentSidePanel extends BaseSidePanel<SmallItem, FullItem, EquipmentFilters> {

    getKey(): string { return "equipment"; }
    getRibbonIconName(): string { return "backpack"; }
    getTitle(): string { return "Экипировка"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<EquipmentFilters>[] = [
            { key: 'sources', label: 'Источник' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<EquipmentFilters>(['sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: EquipFullUi,
                SmallItemSlot: EquipSmallUi,
            }
        });
    }
}
