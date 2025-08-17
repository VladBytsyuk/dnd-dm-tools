import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class ArmoryFiltersModal extends BaseFiltersModal<ArmoryFilters> {
    
    addBlocks() {
        this.addFilterBlock("Типы", "types");
        this.addFilterBlock("Источники", "sources");
    }
}
