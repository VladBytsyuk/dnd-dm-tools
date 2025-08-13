import type { Filters } from "../common/Filters";

export interface ArmoryFilters extends Filters {
    types: string[];
    sources: string[];
}
