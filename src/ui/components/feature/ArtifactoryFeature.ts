import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseFeature } from "./BaseFeature";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { Repository } from "src/domain/repositories/Repository";
import type DB from "src/data/databse/DB";
import { ArtifactoryRepository } from "src/data/repositories/ArtifactoryRepository";
import type DndStatblockPlugin from "src/main";
import { ArtifactorySidePanel } from "../sidepanel/ArtifactorySidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { ArtifactoryMdCodeBlockProcessor } from "../processor/ArtifactoryMdCodeBlockProcessor";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";

export class ArtifactoryFeature extends BaseFeature<SmallArtifact, FullArtifact, ArtifactoryFilters> {

    createRepository(database: DB): Repository<SmallArtifact, FullArtifact, ArtifactoryFilters> | null {
        return new ArtifactoryRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallArtifact, FullArtifact, ArtifactoryFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallArtifact, FullArtifact, ArtifactoryFilters> | null {
        return new ArtifactorySidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallArtifact, FullArtifact, ArtifactoryFilters> | null {
        return new ArtifactoryMdCodeBlockProcessor();
    }
}
