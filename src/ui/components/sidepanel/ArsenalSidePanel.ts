import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import ArsenalSidePanelUi from "src/ui/layout/sidepanel/ArsenalSidePanelUi.svelte";
import { mount } from "svelte";

export class ArsenalSidePanel extends BaseSidePanel<SmallWeapon, FullWeapon, ArsenalFilters> {

    getKey(): string { return "arsenal"; }
    getRibbonIconName(): string { return "axe"; }
    getTitle(): string { return "Арсенал"; }

    async mountSvelteComponent(element: Element) {
        mount(ArsenalSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
            },
        });
    }
}
