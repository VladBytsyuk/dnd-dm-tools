import { mount } from "svelte";
import FeatsSidePanelUi from "src/ui/layout/sidepanel/FeatsSidePanelUi.svelte";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import { FeatsFiltersModal } from "../modals/FeatsFiltersModal";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";

export class FeatsSidePanel extends BaseSidePanel<SmallFeat, FullFeat, FeatsFilters> {

    getKey(): string { return "feats"; }
    getRibbonIconName(): string { return "award"; }
    getTitle(): string { return "Черты"; }

    async mountSvelteComponent(element: Element) {
        mount(FeatsSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: FeatsFilters, filters: FeatsFilters, onApply: (newFilters: FeatsFilters) => Promise<void>) => {
                    new FeatsFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}
