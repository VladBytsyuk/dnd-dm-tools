import type { Filters } from "../common/Filters";

export interface ArsenalFilters extends Filters {
    dices: string[],
    damageTypes: string[],
    types: string[],
    sources: string[];
}
