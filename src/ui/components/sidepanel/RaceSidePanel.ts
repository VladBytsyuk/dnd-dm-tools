import { mount } from "svelte";
import RaceSidePanelUi from "src/ui/layout/sidepanel/RaceSidePanelUi.svelte";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallRace } from "src/domain/models/race/SmallRace";

export class RaceSidePanel extends BaseSidePanel<SmallRace, FullRace, RaceFilters> {

    getKey(): string { return "races"; }
    getRibbonIconName(): string { return "users"; }
    getTitle(): string { return "Расы"; }

    async mountSvelteComponent(element: Element) {
        mount(RaceSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
            },
        });
    }
}
