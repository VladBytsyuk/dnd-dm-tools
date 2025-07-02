export interface BestiaryFilter {
    types: string[],
    challangeRatings: string[],
    sources: string[],
}

export function BestiaryFilter(types: string[], challangeRatings: string[], sources: string[]): BestiaryFilter {
    return {
        types: types,
        challangeRatings : challangeRatings,
        sources: sources,
    } as BestiaryFilter;
}

export function EmptyBestiaryFilter(): BestiaryFilter {
    return BestiaryFilter([], [], []);
}

export function isBestiaryFilterEmpty(filter: BestiaryFilter): boolean {
    return filter.types.length === 0 && filter.challangeRatings.length === 0 && filter.sources.length === 0;
}
