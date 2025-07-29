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

export function EmptySpellbookFilters(): SpellbookFilters {
    return SpellbookFilters([], [], []);
}
export function isSpellbookFiltersEmpty(filters: SpellbookFilters): boolean {
    return filters.levels.length === 0 && filters.schools.length === 0 && filters.sources.length === 0;
}
