import type { SmallItem } from "src/domain/models/items/SmallItem";
import { BaseFeature } from "./BaseFeature";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import type DB from "src/data/databse/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { EquipmentRepository } from "src/data/repositories/EquipmentRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { EquipmentMdCodeBlockProcessor } from "../processor/EquipmentMdCodeBlockProcessor";
import { EquipmentSidePanel } from "../sidepanel/EquipmentSidePanel";

export class EquipmentFeature extends BaseFeature<SmallItem, FullItem, EquipmentFilters> {

    createRepository(database: DB): Repository<SmallItem, FullItem, EquipmentFilters> | null {
        return new EquipmentRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallItem, FullItem, EquipmentFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallItem, FullItem, EquipmentFilters> | null {
        return new EquipmentSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallItem, FullItem, EquipmentFilters> | null {
        return new EquipmentMdCodeBlockProcessor();
    }
}
