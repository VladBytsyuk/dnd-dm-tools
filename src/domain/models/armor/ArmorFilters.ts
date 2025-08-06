export interface ArmorFilters {
    types: string[];
    sources: string[];
}

export function ArmorFilters(
    types: string[],
    sources: string[],
): ArmorFilters {
    return {
        types: types,
        sources: sources,
    } as ArmorFilters;
}

export function EmptyArmorFilters(): ArmorFilters {
    return ArmorFilters([], []);
}

export function isArmorFiltersEmpty(filters: ArmorFilters): boolean {
    return filters.types.length === 0 &&
        filters.sources.length === 0;
}
