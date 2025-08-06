export interface WeaponFilters {
    dices: string[],
    types: string[],
}

export function WeaponFilters(dices: string[], types: string[]): WeaponFilters {
    return {
        dices: dices,
        types: types,
    } as WeaponFilters;
}

export function EmptyWeaponFilters(): WeaponFilters {
    return WeaponFilters([], []);
}

export function isWeaponFiltersEmpty(filters: WeaponFilters): boolean {
    return filters.dices.length === 0 && filters.types.length === 0;
}
