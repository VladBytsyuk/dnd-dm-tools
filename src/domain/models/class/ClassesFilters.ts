import type { Filters } from "../common/Filters";

export interface ClassesFilters extends Filters {
    diceTypes: string[];    // "к6", "к8", "к10", "к12"
    sources: string[];      // Source book filters
}
