import { type SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type DB from "../database/DB";
import type { Spellbook } from 'src/domain/repositories/Spellbook';
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from 'src/domain/models/spell/SmallSpell';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";

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
        const levelsSet: Set<string> = new Set();
        const schoolsSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();
        for (const spell of allSmallItems) {
            levelsSet.add(spell.level.toString());
            schoolsSet.add(spell.school);
            sourcesSet.add(spell.source.shortName);
        }
        return createFilters<SpellbookFilters>({
            levels: Array.from(levelsSet).map(value => +value),
            schools: Array.from(schoolsSet),
            sources: sortSources(Array.from(sourcesSet))
        });
    }

    async groupItems(smallItems: SmallSpell[]): Promise<Group<SmallSpell>[]> {
        const groups = smallItems.reduce((acc, spell) => {
            const level = spell.level;
            (acc[level] ||= []).push(spell);
            return acc;
        }, {} as { [key: string]: SmallSpell[] });

        return Object.entries(groups)
            .map(([level, smallSpells]) => ({ level: +level, smallSpells: smallSpells}))
            .sort((a, b) => a.level - b.level)
            .map(({ level, smallSpells }) => ({ sort: ""+level, smallItems: smallSpells} as Group<SmallSpell>));
    }
}
