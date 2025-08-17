import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class EquipmentFiltersModal extends BaseFiltersModal<EquipmentFilters> {

    addBlocks() {
        this.addFilterBlock("Источники", "sources");
    }
}
