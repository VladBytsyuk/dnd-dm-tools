import { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import { BaseRepository } from "./BaseRepository";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { Equipment } from "src/domain/repositories/Equipment";
import type DB from "../databse/DB";

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
        let sourcesSet: Set<string> = new Set();
        for (const item of allSmallItems) {
            sourcesSet.add(item.source.shortName + (item.source.group.shortName != "Basic" ? "*" : ""));
        }
        return EquipmentFilters(
            Array.from(sourcesSet),
        );
    }
}
