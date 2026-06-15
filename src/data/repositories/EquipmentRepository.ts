import { type EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { Equipment } from "src/domain/repositories/Equipment";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";
import { itemMapper } from "src/data/mappers/sourceMappers";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import {
    createSimpleRepositoryDependencies,
    SimpleRepository,
    type SimpleRepositoryDatabase,
    type SimpleRepositoryDependencies,
} from "./SimpleRepository";
import type { Dao } from "src/domain/Dao";

type EquipmentRepositoryDatabase = SimpleRepositoryDatabase & {
    smallItemDao: Dao<SmallItem, EquipmentFilters>;
    fullItemDao: Dao<FullItem, unknown>;
};

export class EquipmentRepository
    extends SimpleRepository<SmallItem, FullItem, EquipmentFilters>
    implements Equipment {

    constructor(
        dependencies: EquipmentRepositoryDatabase
            | SimpleRepositoryDependencies<SmallItem, FullItem, EquipmentFilters>
    ) {
        super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
            dependencies,
            dependencies.smallItemDao,
            dependencies.fullItemDao,
            itemMapper,
            smallItemProjectors.item,
        ));
    }

    async collectFiltersFromAllItems(allSmallItems: SmallItem[]): Promise<EquipmentFilters | null> {
        const sourcesSet: Set<string> = new Set();
        for (const item of allSmallItems) {
            sourcesSet.add(item.source.shortName + (item.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<EquipmentFilters>({
            sources: sortSources(Array.from(sourcesSet)),
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

    protected override shouldPreloadSmallItems(): boolean {
        return false;
    }
}
