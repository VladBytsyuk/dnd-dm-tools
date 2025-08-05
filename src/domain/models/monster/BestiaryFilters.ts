export interface BestiaryFilters {
    types: string[],
    challangeRatings: string[],
    sources: string[],
}

export function BestiaryFilters(types: string[], challangeRatings: string[], sources: string[]): BestiaryFilters {
    return {
        types: types,
        challangeRatings : challangeRatings,
        sources: sources,
    } as BestiaryFilters;
}

export function EmptyBestiaryFilter(): BestiaryFilters {
    return BestiaryFilters([], [], []);
}

export function isBestiaryFilterEmpty(filter: BestiaryFilters): boolean {
    return filter.types.length === 0 && filter.challangeRatings.length === 0 && filter.sources.length === 0;
}
