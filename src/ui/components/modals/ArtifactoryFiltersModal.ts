import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import { BaseFiltersModal } from "./FiltersModal";

export class ArtifactoryFiltersModal extends BaseFiltersModal<ArtifactoryFilters> {
    
    addBlocks() {
        this.addFilterBlock("Типы", "types");
        this.addFilterBlock("Источники", "sources");
        this.addFilterBlock("Редкости", "rarities");
    }
}
