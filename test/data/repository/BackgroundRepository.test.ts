import { describe, it, expect } from 'vitest';
import { BackgroundRepository } from "../../../src/data/repositories/BackgroundRepository";
import type { SmallBackground } from "../../../src/domain/models/background/SmallBackground";
import type { FullBackground } from "../../../src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "../../../src/domain/models/background/BackgroundsFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import {
    backgroundsFilters,
    backgroundsFiltersWithAsterisks,
    smallBackgroundGolgariAgent,
    smallBackgroundOccultist,
    smallBackgroundHarborfolk
} from "../../__mocks__/domain/models/background/small_background_items";
import {
    fullBackgroundGolgariAgent,
    fullBackgroundOccultist,
    fullBackgroundHarborfolk
} from "../../__mocks__/domain/models/background/full_background_items";

runBaseRepositoryTests<SmallBackground, FullBackground, BackgroundsFilters>({
    title: 'Repository: Background',
    repoFactory: () => new BackgroundRepository(
        mockDatabase(
            [smallBackgroundGolgariAgent, smallBackgroundOccultist, smallBackgroundHarborfolk],
            [fullBackgroundGolgariAgent, fullBackgroundOccultist, fullBackgroundHarborfolk],
        )
    ),
    expectedAllFilters: backgroundsFiltersWithAsterisks,
    expectedAllSmallItems: [smallBackgroundGolgariAgent, smallBackgroundOccultist, smallBackgroundHarborfolk],
    expectedFilteredByNameItems: {
        name: 'Агент Голгари',
        smallItems: [smallBackgroundGolgariAgent],
    },
    expectedSmallItemNames: ['Агент Голгари', 'Оккультист', 'Человек Из Гавани'],
    expectedFullItemByName: {
        name: 'Оккультист',
        item: fullBackgroundOccultist as FullBackground,
    },
    expectedFullItemByUrl: {
        url: '/backgrounds/harborfolk',
        item: fullBackgroundHarborfolk as FullBackground,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallBackgroundHarborfolk as SmallBackground,
        fullItem: fullBackgroundHarborfolk as FullBackground,
    }
});

describe('BackgroundRepository - Source-based Grouping', () => {
    it('should group backgrounds by source instead of alphabetically', async () => {
        const backgrounds = [smallBackgroundGolgariAgent, smallBackgroundOccultist, smallBackgroundHarborfolk];
        const mockDb = mockDatabase(backgrounds, []);
        const repo = new BackgroundRepository(mockDb);

        const groups = await repo.groupItems(backgrounds);

        // Should be grouped by source name
        expect(groups.length).toBe(3);
        expect(groups.some(g => g.sort === 'Справочник гильдмастера по Равнике')).toBe(true);
        expect(groups.some(g => g.sort === 'Фолиант героев')).toBe(true);
    });

    it('should sort groups using source priority ordering', async () => {
        const backgrounds = [smallBackgroundHarborfolk, smallBackgroundOccultist, smallBackgroundGolgariAgent];
        const mockDb = mockDatabase(backgrounds, []);
        const repo = new BackgroundRepository(mockDb);

        const groups = await repo.groupItems(backgrounds);

        // GGR (Basic) should come first, then homebrew sorted alphabetically
        expect(groups[0].sort).toBe('Справочник гильдмастера по Равнике'); // GGR - Basic
        // Then ADLA* and ToH* alphabetically
        const homebrewGroups = groups.slice(1);
        const homebrewNames = homebrewGroups.map(g => g.sort).sort();
        expect(homebrewNames[0]).toBe('Дополнительные предыстории из ресурсов Лиги Авантюристов'); // ADLA*
        expect(homebrewNames[1]).toBe('Фолиант героев'); // ToH*
    });
});