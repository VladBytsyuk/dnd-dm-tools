import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import { type BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type { Bestiary } from 'src/domain/repositories/Bestiary';
import { EmptyFullMonster, type FullMonster } from 'src/domain/models/monster/FullMonster';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";
import { monsterMapper } from "src/data/mappers/sourceMappers";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import {
	createSimpleRepositoryDependencies,
	SimpleRepository,
	type SimpleRepositoryDatabase,
	type SimpleRepositoryDependencies,
} from "./SimpleRepository";
import type { Dao } from "src/domain/Dao";

type BestiaryRepositoryDatabase = SimpleRepositoryDatabase & {
	smallMonsterDao: Dao<SmallMonster, BestiaryFilters>;
	fullMonsterDao: Dao<FullMonster, unknown>;
};

export class BestiaryRepository 
    extends SimpleRepository<SmallMonster, FullMonster, BestiaryFilters> 
    implements Bestiary {

    constructor(
        dependencies: BestiaryRepositoryDatabase
            | SimpleRepositoryDependencies<SmallMonster, FullMonster, BestiaryFilters>    
    ) {
        super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
            dependencies,
            dependencies.smallMonsterDao,
            dependencies.fullMonsterDao,
            monsterMapper,
            smallItemProjectors.monster,
        ));
    }

    async collectFiltersFromAllItems(allSmallItems: SmallMonster[]): Promise<BestiaryFilters | null> {
        const typesSet: Set<string> = new Set();
        const challengeRatingsSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();
        for (const monster of allSmallItems) {
            typesSet.add(typeof monster.type === 'string' ? monster.type : JSON.stringify(monster.type));
            challengeRatingsSet.add(monster.challengeRating);
            sourcesSet.add(monster.source.shortName + (monster.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<BestiaryFilters>({
            types: Array.from(typesSet),
            challengeRatings: Array.from(challengeRatingsSet),
            sources: sortSources(Array.from(sourcesSet))
        });
    }

    async groupItems(smallItems: SmallMonster[]): Promise<Group<SmallMonster>[]> {
        const parseCR = (cr: string) => {
            if (cr === "—") return -1;
            if (cr.includes("/")) {
                const [numerator, denominator] = cr.split("/").map(Number);
                return numerator / denominator;
            }
            return parseFloat(cr);
        };

        const groups = smallItems.reduce((acc, monster) => {
            const cr = monster.challengeRating.toString();
            (acc[cr] ||= []).push(monster);
            return acc;
        }, {} as { [key: string]: SmallMonster[] });

        return Object.entries(groups)
            .map(([cr, smallMonsters]) => ({ sort: cr, smallItems: smallMonsters } as Group<SmallMonster>))
            .sort((a, b) => parseCR(a.sort) - parseCR(b.sort));
    }

    createEmptyFullItem(): FullMonster | undefined {
        return EmptyFullMonster();
    }

    protected override shouldPreloadSmallItems(): boolean {
        return false;
    }
}
