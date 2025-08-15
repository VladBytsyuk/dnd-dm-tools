import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class SpellbookFiltersModal extends BaseFiltersModal<SpellbookFilters> {

    addBlocks(): void {
        this.addFilterBlock("Круги", "levels");
        this.addFilterBlock("Школы", "schools");
        this.addFilterBlock("Источник", "sources");
    }
}
