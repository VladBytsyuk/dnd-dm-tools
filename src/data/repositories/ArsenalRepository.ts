import type { SmallWeapon } from 'src/domain/models/weapon/SmallWeapon';
import type { Arsenal } from 'src/domain/repositories/Arsenal';
import type DB from '../databse/DB';
import type { FullWeapon } from 'src/domain/models/weapon/FullWeapon';
import { WeaponFilters } from 'src/domain/models/weapon/WeaponFilters';
import { BaseRepository } from './BaseRepository';

export class ArsenalRepository 
    extends BaseRepository<SmallWeapon, FullWeapon, WeaponFilters> 
    implements Arsenal {

    constructor(database: DB) {
        super(
            database,
            database.smallWeaponDao,
            database.fullWeaponDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallWeapon[]): Promise<WeaponFilters | null> {
        let dicesSet: Set<string> = new Set();
        let typesSet: Set<string> = new Set();
        for (const weapon of allSmallItems) {
            if (weapon.damage.dice) dicesSet.add(weapon.damage.dice);
            typesSet.add(weapon.damage.type);
        }
        return WeaponFilters(Array.from(dicesSet), Array.from(typesSet));
    }
}
