import { type EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import { BaseRepository } from "./BaseRepository";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { Equipment } from "src/domain/repositories/Equipment";
import type DB from "../databse/DB";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";

export class EquipmentRepository
    extends BaseRepository<SmallItem, FullItem, EquipmentFilters>
    implements Equipment {

    constructor(database: DB) {
        super(
            database,
            database.smallItemDao,
            database.fullItemDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallItem[]): Promise<EquipmentFilters | null> {
        const sourcesSet: Set<string> = new Set();
        for (const item of allSmallItems) {
            sourcesSet.add(item.source.shortName + (item.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<EquipmentFilters>({
            sources: Array.from(sourcesSet),
        });
    }

    async groupItems(smallItems: SmallItem[]): Promise<Group<SmallItem>[]> {
        const groups = smallItems.reduce((acc, equip) => {
            const type = equip.name.rus[0] ?? '—';
            (acc[type] ||= []).push(equip);
            return acc;
        }, {} as { [key: string]: SmallItem[] });

        return Object.entries(groups)
            .map(([type, smallEquips]) => ({ sort: type, smallItems: smallEquips } as Group<SmallItem>))
            .sort((a, b) => a.sort.localeCompare(b.sort));
    }
}
