export interface WeaponFilters {
    dices: string[],
    damageTypes: string[],
    types: string[],
    sources: string[];
}

export function WeaponFilters(
    dices: string[],
    damageTypes: string[],
    types: string[],
    sources: string[],
): WeaponFilters {
    return {
        dices: dices,
        damageTypes: damageTypes,
        types: types,
        sources: sources,
    } as WeaponFilters;
}

export function EmptyWeaponFilters(): WeaponFilters {
    return WeaponFilters([], [], [], []);
}

export function isWeaponFiltersEmpty(filters: WeaponFilters): boolean {
    return filters.dices.length === 0 && 
        filters.damageTypes.length === 0 &&
        filters.types.length === 0 &&
        filters.sources.length === 0;
}
