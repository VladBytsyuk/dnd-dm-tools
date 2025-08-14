import type { FullSpell } from "src/domain/models/spell/FullSpell";
import { mount } from "svelte";
import SpellbookSidePanelUi from "src/ui/layout/sidepanel/SpellbookSidePanelUi.svelte";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import { SpellbookFiltersModal } from "../modals/spellbook_filers_modal";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";

export class SpellBookSidePanel extends BaseSidePanel<SmallSpell, FullSpell, SpellbookFilters> {

    getKey(): string { return "spellbook"; }
    getRibbonIconName(): string { return "sparkles"; }
    getTitle(): string { return "Книга заклинаний"; }

    async mountSvelteComponent(element: Element) {
        mount(SpellbookSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: SpellbookFilters, filters: SpellbookFilters, onApply: (newFilters: SpellbookFilters) => Promise<void>) => {
                    new SpellbookFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
} 
