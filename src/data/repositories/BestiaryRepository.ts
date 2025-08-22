import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import { type BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type DB from "../databse/DB";
import type { Bestiary } from 'src/domain/repositories/Bestiary';
import type { FullMonster } from 'src/domain/models/monster/FullMonster';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";


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
            typesSet.add(typeof monster.type === 'string' ? monster.type : JSON.stringify(monster.type));
            challengeRatingsSet.add(monster.challengeRating);
            sourcesSet.add(monster.source.shortName + (monster.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<BestiaryFilters>({
            types: Array.from(typesSet),
            challangeRatings: Array.from(challengeRatingsSet),
            sources: Array.from(sourcesSet)
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
}
