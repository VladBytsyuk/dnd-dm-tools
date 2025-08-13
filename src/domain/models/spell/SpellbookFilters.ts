import type { Filters } from "../common/Filters";

export interface SpellbookFilters extends Filters {
    levels: number[];
    schools: string[];
    sources: string[];
}
