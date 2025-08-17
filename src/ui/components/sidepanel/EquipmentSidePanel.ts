import type { SmallItem } from "src/domain/models/items/SmallItem";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import EquipmentSidePanelUi from "src/ui/layout/sidepanel/EquipmentSidePanelUi.svelte";
import { mount } from "svelte";
import { EquipmentFiltersModal } from "../modals/EquipmentFiltersModal";

export class EquipmentSidePanel extends BaseSidePanel<SmallItem, FullItem, EquipmentFilters> {

    getKey(): string { return "equipment"; }
    getRibbonIconName(): string { return "backpack"; }
    getTitle(): string { return "Экипировка"; }

    async mountSvelteComponent(element: Element) {
        mount(EquipmentSidePanelUi, { 
            target: element, 
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: EquipmentFilters, filters: EquipmentFilters, onApply: (newFilters: EquipmentFilters) => Promise<void>) => {
                    new EquipmentFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            } 
        });
    }
}
