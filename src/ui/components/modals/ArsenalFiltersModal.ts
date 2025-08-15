import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class ArsenalFiltersModal extends BaseFiltersModal<ArsenalFilters> {

    addBlocks() {
        this.addFilterBlock("Кости", "dices");
        this.addFilterBlock("Виды урона", "damageTypes");
        this.addFilterBlock("Типы", "types");
        this.addFilterBlock("Источники", "sources");
    }
}
