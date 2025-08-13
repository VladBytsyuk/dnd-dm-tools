import type { Filters } from "../common/Filters";

export interface BestiaryFilters extends Filters {
    types: string[],
    challangeRatings: string[],
    sources: string[],
}
