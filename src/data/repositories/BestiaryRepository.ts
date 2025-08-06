import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type DB from "../databse/DB";
import type { Bestiary } from 'src/domain/repositories/Bestiary';
import type { FullMonster } from 'src/domain/models/monster/FullMonster';
import { BaseRepository } from './BaseRepository';


export class BestiaryRepository 
    extends BaseRepository<SmallMonster, FullMonster, BestiaryFilters> 
    implements Bestiary {

    constructor(database: DB) {
        super(
            database,
            database.smallMonsterDao,
            database.fullMonsterDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallMonster[]): Promise<BestiaryFilters | null> {
        let typesSet: Set<string> = new Set();
        let challengeRatingsSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const monster of allSmallItems) {
            typesSet.add(monster.type);
            challengeRatingsSet.add(monster.challengeRating);
            sourcesSet.add(monster.source.shortName + (monster.source.group.shortName != "Basic" ? "*" : ""));
        }
        return BestiaryFilters(Array.from(typesSet), Array.from(challengeRatingsSet), Array.from(sourcesSet));
    }
}
