import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import BackgroundSidePanelUi from "src/ui/layout/sidepanel/BackgroundSidePanelUi.svelte";
import { mount } from "svelte";
import { BackgroundFiltersModal } from "../modals/BackgroundFiltersModal";

export class BackgroundSidePanel extends BaseSidePanel<SmallBackground, FullBackground, BackgroundsFilters>{

    getKey() { return 'backgrounds'; }
    getRibbonIconName() { return 'book-a'; }
    getTitle() { return 'Предыстории'; }

    async mountSvelteComponent(element: Element): Promise<void> {
        mount(BackgroundSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: BackgroundsFilters, filters: BackgroundsFilters, onApply: (newFilters: BackgroundsFilters) => Promise<void>) => {
                    new BackgroundFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}