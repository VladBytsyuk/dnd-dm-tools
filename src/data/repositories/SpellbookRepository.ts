import { type SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type { Spellbook } from 'src/domain/repositories/Spellbook';
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from 'src/domain/models/spell/SmallSpell';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";
import { spellMapper } from "src/data/mappers/sourceMappers";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import {
    createSimpleRepositoryDependencies,
    SimpleRepository,
    type SimpleRepositoryDatabase,
    type SimpleRepositoryDependencies,
} from "./SimpleRepository";
import type { Dao } from "src/domain/Dao";

type SpellbookRepositoryDatabase = SimpleRepositoryDatabase & {
    smallSpellDao: Dao<SmallSpell, SpellbookFilters>;
    fullSpellDao: Dao<FullSpell, unknown>;
};

export class SpellbookRepository
    extends SimpleRepository<SmallSpell, FullSpell, SpellbookFilters> 
    implements Spellbook {

    constructor(
        dependencies: SpellbookRepositoryDatabase
            | SimpleRepositoryDependencies<SmallSpell, FullSpell, SpellbookFilters>
    ) {
        super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
            dependencies,
            dependencies.smallSpellDao,
            dependencies.fullSpellDao,
            spellMapper,
            smallItemProjectors.spell,
        ));
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

    protected override shouldPreloadSmallItems(): boolean {
        return false;
    }
}
