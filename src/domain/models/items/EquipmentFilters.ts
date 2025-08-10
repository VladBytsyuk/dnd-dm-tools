export interface EquipmentFilters {
    sources: string[];
}

export function EquipmentFilters(
    sources: string[],
): EquipmentFilters {
    return {
        sources: sources,
    } as EquipmentFilters;
}

export function EmptyEquipmentFilters(): EquipmentFilters {
    return EquipmentFilters([]);
}

export function isEquipmentFiltersEmpty(filters: EquipmentFilters): boolean {
    return filters.sources.length === 0;
}
