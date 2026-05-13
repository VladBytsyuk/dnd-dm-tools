import { type ArmoryFilters } from "src/domain/models/armor/ArmoryFilters"
import type { SmallArmor } from "src/domain/models/armor/SmallArmor"
import type { FullArmor } from "src/domain/models/armor/FullArmor"
import type { Armory } from "src/domain/repositories/Armory"
import { createFilters } from "src/domain/models/common/Filters"
import type { Group } from "src/domain/repositories/Repository"
import { sortSources } from "src/domain/utils/SourceSorter"
import { armorMapper } from "src/data/mappers/sourceMappers"
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors"
import {
    createSimpleRepositoryDependencies,
    SimpleRepository,
    type SimpleRepositoryDatabase,
    type SimpleRepositoryDependencies,
} from "./SimpleRepository"
import type { Dao } from "src/domain/Dao"

type ArmoryRepositoryDatabase = SimpleRepositoryDatabase & {
    smallArmorDao: Dao<SmallArmor, ArmoryFilters>;
    fullArmorDao: Dao<FullArmor, unknown>;
};

export class ArmoryRepository
    extends SimpleRepository<SmallArmor, FullArmor, ArmoryFilters>
    implements Armory {

    constructor(
        dependencies: ArmoryRepositoryDatabase
            | SimpleRepositoryDependencies<SmallArmor, FullArmor, ArmoryFilters>
    ) {
        super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
            dependencies,
            dependencies.smallArmorDao,
            dependencies.fullArmorDao,
            armorMapper,
            smallItemProjectors.armor,
        ));
    }

    async collectFiltersFromAllItems(allSmallItems: SmallArmor[]): Promise<ArmoryFilters | null> {
        const typesSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();
        for (const armor of allSmallItems) {
            typesSet.add(armor.type.name);
            sourcesSet.add(armor.source.shortName + (armor.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<ArmoryFilters>({
            types: Array.from(typesSet),
            sources: sortSources(Array.from(sourcesSet)),
        });
    }

    async groupItems(smallItems: SmallArmor[]): Promise<Group<SmallArmor>[]> {
        const groups = smallItems.reduce((acc, armor) => {
            const type = armor.type.name;
            (acc[type] ||= []).push(armor);
            return acc;
        }, {} as { [key: string]: SmallArmor[] });

        return Object.entries(groups)
            .map(([type, smallArmors]) => ({ sort: type, smallItems: smallArmors } as Group<SmallArmor>))
            .sort((a, b) => a.sort.localeCompare(b.sort));
    }
}
