import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import ArtifactorySidePanelUi from "src/ui/layout/sidepanel/ArtifactorySidePanelUi.svelte";
import { mount } from "svelte";
import { ArtifactoryFiltersModal } from "../modals/ArtifactoryFiltersModal";

export class ArtifactorySidePanel extends BaseSidePanel<SmallArtifact, FullArtifact, ArtifactoryFilters>{

    getKey() { return 'artifactory'; }
    getRibbonIconName() { return 'wand'; }
    getTitle() { return 'Магические предметы'; }

    async mountSvelteComponent(element: Element): Promise<void> {
        mount(ArtifactorySidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: ArtifactoryFilters, filters: ArtifactoryFilters, onApply: (newFilters: ArtifactoryFilters) => Promise<void>) => {
                    new ArtifactoryFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}
