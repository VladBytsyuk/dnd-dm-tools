import { type ClassesFilters } from "src/domain/models/class/ClassesFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class ClassesFiltersModal extends BaseFiltersModal<ClassesFilters> {

    addBlocks() {
        this.addFilterBlock("Хит-дайс", "diceTypes");
        this.addFilterBlock("Источник", "sources");
    }
}
