import { type RaceFilters } from "src/domain/models/race/RaceFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class RaceFiltersModal extends BaseFiltersModal<RaceFilters> {

    addBlocks() {
        this.addFilterBlock("Характеристики", "abilities");
        this.addFilterBlock("Тип", "types");
        this.addFilterBlock("Источник", "sources");
    }
}
