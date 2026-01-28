import { BaseFeature } from "./BaseFeature";
import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { ArsenalRepository } from "src/data/repositories/ArsenalRepository";
import { ArsenalMdCodeBlockProcessor } from "../processor/ArsenalMdCodeBlockProcessor";
import { ArsenalSidePanel } from "../sidepanel/ArsenalSidePanel";

export class ArsenalFeature extends BaseFeature<SmallWeapon, FullWeapon, ArsenalFilters> {

    createRepository(database: DB): Repository<SmallWeapon, FullWeapon, ArsenalFilters> {
        return new ArsenalRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<SmallWeapon, FullWeapon, ArsenalFilters>, uiEventListener: IUiEventListener): BaseSidePanel<SmallWeapon, FullWeapon, ArsenalFilters> {
        return new ArsenalSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<SmallWeapon, FullWeapon, ArsenalFilters> {
        return new ArsenalMdCodeBlockProcessor();
    }
}
