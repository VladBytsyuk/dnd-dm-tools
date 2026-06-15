import { SpellbookRepository } from "../../../src/data/repositories/SpellbookRepository";
import type { SmallSpell } from "../../../src/domain/models/spell/SmallSpell";
import type { FullSpell } from "../../../src/domain/models/spell/FullSpell";
import type { SpellbookFilters } from "../../../src/domain/models/spell/SpellbookFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { spellbookFilters, smallSpellFireball, smallSpellAwaken, smallSpellWish } from "../../__mocks__/domain/models/spell/small_spell_items";
import { fullSpellFireball, fullSpellAwaken, fullSpellWish } from "../../__mocks__/domain/models/spell/full_spell_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import { describe, expect, it, vi } from "vitest";

runBaseRepositoryTests<SmallSpell, FullSpell, SpellbookFilters>({
    title: 'Repository: Spellbook',
    repoFactory: () => new SpellbookRepository(
        mockDatabase(
            [smallSpellFireball, smallSpellAwaken, smallSpellWish],
            [fullSpellFireball, fullSpellAwaken, fullSpellWish],
        )
    ),
    expectedAllFilters: spellbookFilters,
    expectedAllSmallItems: [smallSpellFireball, smallSpellAwaken, smallSpellWish],
    expectedFilteredByNameItems: {
        name: 'Огненный шар',
        smallItems: [smallSpellFireball],
    },
    expectedSmallItemNames: ['Огненный шар', 'Пробуждение разума', 'Исполнение желаний'],
    expectedFullItemByName: {
        name: 'Пробуждение разума',
        item: fullSpellAwaken as FullSpell,
    },
    expectedFullItemByUrl: {
        url: '/spells/wish',
        item: fullSpellWish as FullSpell,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallSpellWish as SmallSpell,
        fullItem: fullSpellWish as FullSpell,
    }
});

describe("SpellbookRepository pagination", () => {
    it("does not preload the full spellbook during initialization", async () => {
        const database = mockDatabase(
            [smallSpellFireball, smallSpellAwaken, smallSpellWish],
            [fullSpellFireball, fullSpellAwaken, fullSpellWish],
        );
        const readAllSpy = vi.spyOn(database.smallSpellDao, "readAllItems");
        const repository = new SpellbookRepository(database);

        await repository.initialize();

        expect(readAllSpy).not.toHaveBeenCalled();
    });

    it("returns the requested spellbook page", async () => {
        const repository = new SpellbookRepository(mockDatabase(
            [smallSpellFireball, smallSpellAwaken, smallSpellWish],
            [fullSpellFireball, fullSpellAwaken, fullSpellWish],
        ));

        await expect(repository.getSmallItemsPage(null, { offset: 2, limit: 1 })).resolves.toEqual({
            items: [smallSpellWish],
            hasMore: false,
        });
    });
});
