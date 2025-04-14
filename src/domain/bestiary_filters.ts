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
