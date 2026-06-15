import { BestiaryRepository } from "../../../src/data/repositories/BestiaryRepository";
import type { SmallMonster } from "../../../src/domain/models/monster/SmallMonster";
import type { FullMonster } from "../../../src/domain/models/monster/FullMonster";
import type { BestiaryFilters } from "../../../src/domain/models/monster/BestiaryFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { bestiaryFilters, smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat } from "../../__mocks__/domain/models/monster/small_monster_items";
import { fullMonsterSpirit, fullMonsterElemental, fullMonsterTiamat } from "../../__mocks__/domain/models/monster/full_monster_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import { describe, expect, it, vi } from "vitest";

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

describe("BestiaryRepository pagination", () => {
    it("does not preload the full bestiary during initialization", async () => {
        const database = mockDatabase(
            [smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat],
            [fullMonsterSpirit, fullMonsterElemental, fullMonsterTiamat],
        );
        const readAllSpy = vi.spyOn(database.smallMonsterDao, "readAllItems");
        const repository = new BestiaryRepository(database);

        await repository.initialize();

        expect(readAllSpy).not.toHaveBeenCalled();
    });

    it("returns the requested bestiary page", async () => {
        const repository = new BestiaryRepository(mockDatabase(
            [smallMonsterSpirit, smallMonsterElemental, smallMonsterTiamat],
            [fullMonsterSpirit, fullMonsterElemental, fullMonsterTiamat],
        ));

        await expect(repository.getSmallItemsPage(null, { offset: 1, limit: 1 })).resolves.toEqual({
            items: [smallMonsterElemental],
            hasMore: true,
        });
    });
});
