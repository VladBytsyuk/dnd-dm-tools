import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { FeatsRepository } from "src/data/repositories/FeatsRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import { FeatsSidePanel } from "../sidepanel/FeatsSidePanel";

export class FeatFeature extends BaseFeature<SmallFeat, FullFeat, FeatsFilters> {

    createRepository(database: DB): Repository<SmallFeat, FullFeat, FeatsFilters> {
        return new FeatsRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallFeat, FullFeat, FeatsFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallFeat, FullFeat, FeatsFilters> {
        return new FeatsSidePanel(plugin, repository, uiEventListener);
    }
}
