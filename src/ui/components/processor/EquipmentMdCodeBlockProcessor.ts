import type { SmallItem } from "src/domain/models/items/SmallItem";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullItem } from "src/domain/models/items/FullItem";
import EquipFullUi from "src/ui/layout/equip/EquipFullUi.svelte";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";

export class EquipmentMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallItem, FullItem, EquipmentFilters> {

    getCodeBlockName() { return 'equip'; }
    getUi() { return EquipFullUi; }
}