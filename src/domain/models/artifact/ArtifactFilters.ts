export interface ArtifactFilters {
    types: string[];
    sources: string[];
    rarities: string[];
}

export function ArtifactFilters(
    types: string[],
    sources: string[],
    rarities: string[],
): ArtifactFilters {
    return {
        types: types,
        sources: sources,
        rarities: rarities,
    } as ArtifactFilters;
}

export function EmptyArtifactFilters(): ArtifactFilters {
    return ArtifactFilters([], [], []);
}

export function isArtifactFiltersEmpty(filters: ArtifactFilters): boolean {
    return filters.types.length === 0 &&
        filters.sources.length === 0 &&
        filters.rarities.length === 0;
}
