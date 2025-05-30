export interface SpellbookFilters {
    levels: number[];
    schools: string[];
    sources: string[];
}

export function SpellbookFilters(
    levels: number[],
    schools: string[],
    sources: string[],
): SpellbookFilters {
    return {
        levels: levels,
        schools: schools,
        sources: sources,
    } as SpellbookFilters;
}
