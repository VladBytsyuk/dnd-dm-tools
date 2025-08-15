import { mount } from "svelte";
import BestiarySidePanelUi from "src/ui/layout/sidepanel/BestiarySidePanelUi.svelte";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import { BestiaryFiltersModal } from "../modals/BestiaryFiltersModal";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";

export class BestiarySidePanel extends BaseSidePanel<SmallMonster, FullMonster, BestiaryFilters> {

    getKey(): string { return "bestiary"; }
    getRibbonIconName(): string { return "skull"; }
    getTitle(): string { return "Бестиарий"; }

    async mountSvelteComponent(element: Element) {
        mount(BestiarySidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: BestiaryFilters, filters: BestiaryFilters, onApply: (newFilters: BestiaryFilters) => Promise<void>) => {
                    new BestiaryFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}
