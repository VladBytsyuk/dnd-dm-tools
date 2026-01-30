import type { SmallClass } from "src/domain/models/class/SmallClass";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { ClassesRepository } from "src/data/repositories/ClassesRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import { ClassesSidePanel } from "../sidepanel/ClassesSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { ClassesMdCodeBlockProcessor } from "../processor/ClassesMdCodeBlockProcessor";

export class ClassesFeature extends BaseFeature<SmallClass, FullClass, ClassesFilters> {

    createRepository(database: DB): Repository<SmallClass, FullClass, ClassesFilters> {
        return new ClassesRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallClass, FullClass, ClassesFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallClass, FullClass, ClassesFilters> {
        return new ClassesSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallClass, FullClass, ClassesFilters> {
        return new ClassesMdCodeBlockProcessor();
    }

    getCommands(): FeatureCommand[] {
        return [];
    }
}
