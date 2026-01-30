import type { SmallWeapon } from 'src/domain/models/weapon/SmallWeapon';
import type { Arsenal } from 'src/domain/repositories/Arsenal';
import type DB from '../database/DB';
import type { FullWeapon } from 'src/domain/models/weapon/FullWeapon';
import { type ArsenalFilters } from 'src/domain/models/weapon/ArsenalFilters';
import { BaseRepository } from './BaseRepository';
import { createFilters } from 'src/domain/models/common/Filters';
import type { Group } from 'src/domain/repositories/Repository';
import { sortSources } from 'src/domain/utils/SourceSorter';

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
        const dicesSet: Set<string> = new Set();        
        const damageTypesSet: Set<string> = new Set();
        const typesSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();
        for (const weapon of allSmallItems) {
            if (weapon.damage.dice) dicesSet.add(weapon.damage.dice);
            damageTypesSet.add(weapon.damage.type);
            typesSet.add(weapon.type.name);
            sourcesSet.add(weapon.source.shortName + (weapon.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<ArsenalFilters>({
            dices: Array.from(dicesSet).sort((a, b) => {
                // Handle flat damage (just "1")
                if (a === '1' && b === '1') return 0;
                if (a === '1') return -1;
                if (b === '1') return 1;

                // Extract number of dice and dice size (e.g., "2к6" -> [2, 6])
                const [aCount, aSize] = a.split('к').map(n => parseInt(n));
                const [bCount, bSize] = b.split('к').map(n => parseInt(n));

                // Sort by number of dice first, then by dice size
                if (aCount !== bCount) {
                    return aCount - bCount;
                }
                return aSize - bSize;
            }),
            damageTypes: Array.from(damageTypesSet),
            types: Array.from(typesSet),
            sources: sortSources(Array.from(sourcesSet)),
        });
    }

    async groupItems(smallItems: SmallWeapon[]): Promise<Group<SmallWeapon>[]> {
        const groups = smallItems.reduce((acc, weapon) => {
            const type = weapon.type.name;
            (acc[type] ||= []).push(weapon);
            return acc;
        }, {} as { [key: string]: SmallWeapon[] });

        // Define priority order for weapon categories and range types
        const categoryOrder: Record<string, number> = {
            'Простое': 1,
            'Воинское': 2,
            'Экзотическое': 3,
        };

        const rangeOrder: Record<string, number> = {
            'рукопашное': 1,
            'дальнобойное': 2,
        };

        return Object.entries(groups)
            .map(([type, smallWeapons]) => ({ sort: type, smallItems: smallWeapons } as Group<SmallWeapon>))
            .sort((a, b) => {
                // Extract category and range type from the type name
                let aCategory = '';
                let aRange = '';
                let bCategory = '';
                let bRange = '';

                for (const cat of Object.keys(categoryOrder)) {
                    if (a.sort.includes(cat)) aCategory = cat;
                    if (b.sort.includes(cat)) bCategory = cat;
                }

                for (const range of Object.keys(rangeOrder)) {
                    if (a.sort.includes(range)) aRange = range;
                    if (b.sort.includes(range)) bRange = range;
                }

                // Sort by category first, then by range type
                const aCatOrder = categoryOrder[aCategory] ?? 999;
                const bCatOrder = categoryOrder[bCategory] ?? 999;

                if (aCatOrder !== bCatOrder) {
                    return aCatOrder - bCatOrder;
                }

                const aRangeOrder = rangeOrder[aRange] ?? 999;
                const bRangeOrder = rangeOrder[bRange] ?? 999;
                return aRangeOrder - bRangeOrder;
            });
    }
}
