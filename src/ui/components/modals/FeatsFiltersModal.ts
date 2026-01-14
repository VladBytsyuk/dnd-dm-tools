import { type FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class FeatsFiltersModal extends BaseFiltersModal<FeatsFilters> {

    addBlocks() {
        this.addFilterBlock("Источник", "sources");
    }
}
