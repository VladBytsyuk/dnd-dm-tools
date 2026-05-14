import type DB from "src/data/database/DB";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { Repository } from "src/domain/repositories/Repository";
import { BaseFeature } from "./BaseFeature";
import { createDmScreenRepository } from "src/data/repositories/factories";
import type DndStatblockPlugin from "src/main";
import { DmScreenSidePanel } from "../sidepanel/DmScreenSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { DmScreenMdCodeBlockProcessor } from "../processor/DmScreenMdCodeBlockProcessor";
import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";

export class DmScreenFeature extends BaseFeature<DmScreenItem, DmScreenItem, any> {

    createRepository(database: DB): Repository<DmScreenItem, DmScreenItem, any> {
        return createDmScreenRepository(database);
    }

    createSidePanel(plugin: DndStatblockPlugin, repository: Repository<DmScreenItem, DmScreenItem, any>, uiEventListener: IUiEventListener): BaseSidePanel<any, any, any> {
        return new DmScreenSidePanel(plugin, repository, uiEventListener);
    }

    createCodeBlockProcessor(): BaseMdCodeBlockProcessor<DmScreenItem, DmScreenItem, any> {
        return new DmScreenMdCodeBlockProcessor();
    }
}
