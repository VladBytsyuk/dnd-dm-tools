import type { SmallItem } from "src/domain/models/items/SmallItem";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";

export class EquipmentMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallItem, FullItem, EquipmentFilters> {

    getCodeBlockName() { return 'equip'; }
}