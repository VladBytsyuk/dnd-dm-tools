import type { Filters } from "../common/Filters";

export interface ArtifactoryFilters extends Filters {
    types: string[];
    sources: string[];
    rarities: string[];
}
