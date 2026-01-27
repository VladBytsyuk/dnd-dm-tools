import type { SmallRace } from "src/domain/models/race/SmallRace";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import type DB from "src/data/databse/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { RacesRepository } from "src/data/repositories/RacesRepository";
import type DndStatblockPlugin from "src/main";
import { RaceSidePanel } from "../sidepanel/RaceSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { RaceMdCodeBlockProcessor } from "../processor/RaceMdCodeBlockProcessor";
import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";

export class RaceFeature extends BaseFeature<SmallRace, FullRace, RaceFilters> {

    createRepository(database: DB): Repository<SmallRace, FullRace, RaceFilters> {
        return new RacesRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallRace, FullRace, RaceFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallRace, FullRace, RaceFilters> {
        return new RaceSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallRace, FullRace, RaceFilters> {
        return new RaceMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [];
    }
}
