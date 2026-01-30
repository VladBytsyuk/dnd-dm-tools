import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import BackgroundSidePanelUi from "src/ui/layout/sidepanel/BackgroundSidePanelUi.svelte";
import { mount } from "svelte";

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
            },
        });
    }
}