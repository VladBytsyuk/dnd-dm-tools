import { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type DB from "../databse/DB";
import type { Spellbook } from 'src/domain/repositories/Spellbook';
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from 'src/domain/models/spell/SmallSpell';
import { BaseRepository } from './BaseRepository';

export class SpellbookRepository
    extends BaseRepository<SmallSpell, FullSpell, SpellbookFilters> 
    implements Spellbook {

    constructor(database: DB) {
        super(
            database,
            database.smallSpellDao,
            database.fullSpellDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallSpell[]): Promise<SpellbookFilters | null> {
        let levelsSet: Set<string> = new Set();
        let schoolsSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const spell of allSmallItems) {
            levelsSet.add(spell.level.toString());
            schoolsSet.add(spell.school);
            sourcesSet.add(spell.source.shortName);
        }
        return SpellbookFilters(Array.from(levelsSet).map(value => +value), Array.from(schoolsSet), Array.from(sourcesSet));
    }
}
