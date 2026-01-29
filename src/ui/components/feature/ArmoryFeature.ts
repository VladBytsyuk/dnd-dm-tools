import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import { BaseFeature } from "./BaseFeature";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { ArmoryRepository } from "src/data/repositories/ArmoryRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { ArmoryMdCodeBlockProcessor } from "../processor/ArmoryMdCodeBlockProcessor";
import { ArmorySidePanel } from "../sidepanel/ArmorySidePanel";

export class ArmoryFeature extends BaseFeature<SmallArmor, FullArmor, ArmoryFilters> {

    createRepository(database: DB): Repository<SmallArmor, FullArmor, ArmoryFilters> | null {
        return new ArmoryRepository(database);
    }
    
    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallArmor, FullArmor, ArmoryFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallArmor, FullArmor, ArmoryFilters> | null {
        return new ArmorySidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallArmor, FullArmor, ArmoryFilters> | null {
        return new ArmoryMdCodeBlockProcessor();
    }
}
