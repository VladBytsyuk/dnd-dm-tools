import type { SmallWeapon } from 'src/domain/models/weapon/SmallWeapon';
import type { Arsenal } from 'src/domain/repositories/Arsenal';
import type DB from '../databse/DB';
import type { FullWeapon } from 'src/domain/models/weapon/FullWeapon';
import { type ArsenalFilters } from 'src/domain/models/weapon/ArsenalFilters';
import { BaseRepository } from './BaseRepository';
import { createFilters } from 'src/domain/models/common/Filters';

export class ArsenalRepository 
    extends BaseRepository<SmallWeapon, FullWeapon, ArsenalFilters> 
    implements Arsenal {

    constructor(database: DB) {
        super(
            database,
            database.smallWeaponDao,
            database.fullWeaponDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallWeapon[]): Promise<ArsenalFilters | null> {
        let dicesSet: Set<string> = new Set();        
        let damageTypesSet: Set<string> = new Set();
        let typesSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const weapon of allSmallItems) {
            if (weapon.damage.dice) dicesSet.add(weapon.damage.dice);
            damageTypesSet.add(weapon.damage.type);
            typesSet.add(weapon.type.name);
            sourcesSet.add(weapon.source.shortName + (weapon.source.group.shortName != "Basic" ? "*" : ""))
        }
        return createFilters<ArsenalFilters>({
            dices: Array.from(dicesSet), 
            damageTypes: Array.from(damageTypesSet), 
            types: Array.from(typesSet), 
            sources: Array.from(sourcesSet),
        });
    }
}
