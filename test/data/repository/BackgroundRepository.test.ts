import { describe, it, expect, vi } from 'vitest';
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

describe('BackgroundRepository - Associated HTML Characterization', () => {
    it('should fetch associated HTML from returned background URL and persist the requested URL', async () => {
        const remoteBackground: FullBackground = {
            ...fullBackgroundOccultist,
            url: "/backgrounds/fragment/199",
            associatedUrl: undefined,
            associatedHtml: undefined,
        };
        const createItem = vi.fn();
        const mockDb = {
            smallBackgroundDao: {
                readAllItems: vi.fn().mockResolvedValue([smallBackgroundOccultist]),
                readAllItemsNames: vi.fn().mockResolvedValue(["Оккультист"]),
                readItemByName: vi.fn().mockResolvedValue(smallBackgroundOccultist),
                readItemByUrl: vi.fn().mockResolvedValue(smallBackgroundOccultist),
            },
            fullBackgroundDao: {
                readItemByUrl: vi.fn().mockResolvedValue(null),
                readItemByName: vi.fn().mockResolvedValue(null),
                createItem,
            },
            transaction: vi.fn(async (callback: () => Promise<void>) => {
                await callback();
            }),
        };
        const repo = new BackgroundRepository(mockDb as any);
        (repo as any).fetchFromAPI = vi.fn().mockResolvedValue({ ...remoteBackground });
        (repo as any).fetchHtmlFromAPI = vi.fn().mockResolvedValue("<section>Оккультист</section>");

        const result = await repo.getFullItemByUrl("/backgrounds/occultist");

        expect((repo as any).fetchFromAPI).toHaveBeenCalledWith("/backgrounds/occultist");
        expect((repo as any).fetchHtmlFromAPI).toHaveBeenCalledWith("/backgrounds/fragment/199");
        expect(result).toEqual({
            ...remoteBackground,
            url: "/backgrounds/occultist",
            associatedUrl: "/backgrounds/fragment/199",
            associatedHtml: "<section>Оккультист</section>",
        });
        expect(createItem).toHaveBeenCalledWith(result);
        expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    });

    it('should return cached background without fetching associated HTML', async () => {
        const mockDb = mockDatabase([smallBackgroundOccultist], [fullBackgroundOccultist]);
        const repo = new BackgroundRepository(mockDb);
        (repo as any).fetchFromAPI = vi.fn();
        (repo as any).fetchHtmlFromAPI = vi.fn();

        const result = await repo.getFullItemByUrl("/backgrounds/occultist");

        expect(result).toEqual(fullBackgroundOccultist);
        expect((repo as any).fetchFromAPI).not.toHaveBeenCalled();
        expect((repo as any).fetchHtmlFromAPI).not.toHaveBeenCalled();
    });
});
