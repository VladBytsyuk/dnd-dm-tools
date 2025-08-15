import { type BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class BestiaryFiltersModal extends BaseFiltersModal<BestiaryFilters> {

    addBlocks() {
        this.addFilterBlock("Типы", "types");
        this.addFilterBlock("Опасность", "challangeRatings");
        this.addFilterBlock("Источник", "sources");
    }
}
