import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { BackgroundRepository } from "src/data/repositories/BackgroundRepository";
import type DndStatblockPlugin from "src/main";
import { BackgroundSidePanel } from "../sidepanel/BackgroundSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { BackgroundMdCodeBlockProcessor } from "../processor/BackgroundMdCodeBlockProcessor";
import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";

export class BackgroundFeature extends BaseFeature<SmallBackground, FullBackground, BackgroundsFilters> {

    createRepository(database: DB): Repository<SmallBackground, FullBackground, BackgroundsFilters> {
        return new BackgroundRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallBackground, FullBackground, BackgroundsFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallBackground, FullBackground, BackgroundsFilters> {
        return new BackgroundSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallBackground, FullBackground, BackgroundsFilters> {
        return new BackgroundMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [];
    }
}