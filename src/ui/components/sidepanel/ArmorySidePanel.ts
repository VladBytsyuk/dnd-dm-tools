import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import { ArmoryFiltersModal } from "../modals/ArmoryFiltersModal";
import { mount } from "svelte";
import ArmorySidePanelUi from "src/ui/layout/sidepanel/ArmorySidePanelUi.svelte";

export class ArmorySidePanel extends BaseSidePanel<SmallArmor, FullArmor, ArmoryFilters> {

    getKey() { return 'armor'; }
    getRibbonIconName() { return 'shield'; }
    getTitle() { return 'Броня'; }

    async mountSvelteComponent(element: Element): Promise<void> {
        mount(ArmorySidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: ArmoryFilters, filters: ArmoryFilters, onApply: (newFilters: ArmoryFilters) => Promise<void>) => {
                    new ArmoryFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}
