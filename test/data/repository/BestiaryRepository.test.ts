import { BestiaryRepository } from "../../../src/data/repositories/BestiaryRepository";
import type { SmallMonster } from "../../../src/domain/models/monster/SmallMonster";
import type { FullMonster } from "../../../src/domain/models/monster/FullMonster";
import type { BestiaryFilters } from "../../../src/domain/models/monster/BestiaryFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { bestiaryFilters, smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat } from "../../__mocks__/domain/models/monster/small_monster_items";
import { fullMonsterSpirit, fullMonsterElemental, fullMonsterTiamat } from "../../__mocks__/domain/models/monster/full_monster_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallMonster, FullMonster, BestiaryFilters>({
    title: 'Repository: Bestiary',
    repoFactory: () => new BestiaryRepository(
        mockDatabase(
            [smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat],
            [fullMonsterSpirit, fullMonsterElemental, fullMonsterTiamat],
        )
    ),
    expectedAllFilters: bestiaryFilters,
    expectedAllSmallItems: [smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat],
    expectedFilteredByNameItems: {
        name: 'Дух воителя',
        smallItems: [smallMonsterSpirit],
    },
    expectedSmallItemNames: ['Дух воителя', 'Огненный элементаль', 'Тиамат'],
    expectedFullItemByName: {
        name: 'Огненный элементаль',
        item: fullMonsterElemental as FullMonster,
    },
    expectedFullItemByUrl: {
        url: '/bestiary/tiamat',
        item: fullMonsterTiamat as FullMonster,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallMonsterTiamat as SmallMonster,
        fullItem: fullMonsterTiamat as FullMonster,
    }
});
