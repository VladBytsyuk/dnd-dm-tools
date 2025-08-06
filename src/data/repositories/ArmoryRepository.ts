import { ArmorFilters } from "src/domain/models/armor/ArmorFilters"
import { BaseRepository } from "./BaseRepository"
import type { SmallArmor } from "src/domain/models/armor/SmallArmor"
import type { FullArmor } from "src/domain/models/armor/FullArmor"
import type { Armory } from "src/domain/repositories/Armory"
import type DB from "../databse/DB"

export class ArmoryRepository
    extends BaseRepository<SmallArmor, FullArmor, ArmorFilters>
    implements Armory {

    constructor(database: DB) {
        super(
            database,
            database.smallArmorDao,
            database.fullArmorDao,
        )
    }

    async collectFiltersFromAllItems(allSmallItems: SmallArmor[]): Promise<ArmorFilters | null> {
        let typesSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const armor of allSmallItems) {
            typesSet.add(armor.type.name);
            sourcesSet.add(armor.source.shortName + (armor.source.group.shortName != "Basic" ? "*" : ""))
        }
        return ArmorFilters(
            Array.from(typesSet), 
            Array.from(sourcesSet),
        );
    }
}
