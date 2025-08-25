import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class BackgroundFiltersModal extends BaseFiltersModal<BackgroundsFilters> {
    
    addBlocks() {
        this.addFilterBlock("Источники", "sources");
    }
}