import type { SmallWeapon } from 'src/domain/models/weapon/SmallWeapon';
import type { Arsenal } from 'src/domain/repositories/Arsenal';
import type DB from '../databse/DB';
import type { FullWeapon } from 'src/domain/models/weapon/FullWeapon';
import { type ArsenalFilters } from 'src/domain/models/weapon/ArsenalFilters';
import { BaseRepository } from './BaseRepository';
import { createFilters } from 'src/domain/models/common/Filters';
import type { Group } from 'src/domain/repositories/Repository';

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

    async groupItems(smallItems: SmallWeapon[]): Promise<Group<SmallWeapon>[]> {
        const groups = smallItems.reduce((acc, weapon) => {
            const type = weapon.type.name;
            (acc[type] ||= []).push(weapon);
            return acc;
        }, {} as { [key: string]: SmallWeapon[] });

        return Object.entries(groups)
            .map(([type, smallWeapons]) => ({ sort: type, smallItems: smallWeapons } as Group<SmallWeapon>))
            .sort((a, b) => a.sort.localeCompare(b.sort));
    }
}
