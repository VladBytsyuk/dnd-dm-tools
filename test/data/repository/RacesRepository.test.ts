import { describe, it, expect, vi } from 'vitest';
import { RacesRepository } from "../../../src/data/repositories/RacesRepository";
import type { SmallRace } from "../../../src/domain/models/race/SmallRace";
import type { FullRace } from "../../../src/domain/models/race/FullRace";
import type { RaceFilters } from "../../../src/domain/models/race/RaceFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { smallRace1, smallRace2, smallRace3, raceFilters } from "../../__mocks__/domain/models/race/small_race_items";
import { fullRace1, fullRace2, fullRace3, fullRace1Subrace } from "../../__mocks__/domain/models/race/full_race_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallRace, FullRace, RaceFilters>({
    title: 'Repository: Races',
    repoFactory: () => new RacesRepository(
        mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        )
    ),
    expectedAllFilters: raceFilters,
    expectedAllSmallItems: [smallRace1, smallRace2, smallRace3],
    expectedFilteredByNameItems: {
        name: 'Дварф',
        smallItems: [smallRace2],
    },
    expectedSmallItemNames: ['Эльф', 'Дварф', 'Тифлинг'],
    expectedFullItemByName: {
        name: 'Тифлинг',
        item: fullRace3 as FullRace,
    },
    expectedFullItemByUrl: {
        url: '/races/elf',
        item: fullRace1 as FullRace,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallRace2 as SmallRace,
        fullItem: fullRace2 as FullRace,
    }
});

// Additional tests for hierarchy reconstruction
describe('RacesRepository - Hierarchy Reconstruction', () => {
    it('should reconstruct hierarchy from flat data', async () => {
        const flatRaces = [
            { race: smallRace1, parentUrl: null },
            { race: { ...smallRace2, url: '/races/subrace1' }, parentUrl: smallRace1.url },
        ];

        const mockSmallDao = {
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue(flatRaces),
            readTopLevelRaces: vi.fn().mockResolvedValue([smallRace1]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
            readAllItems: vi.fn().mockResolvedValue([smallRace1, smallRace2]),
            readAllItemsNames: vi.fn().mockResolvedValue(['Эльф', 'Дварф']),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([fullRace1]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn(),
        };

        const repo = new RacesRepository(mockDb as any);
        const result = await repo.getRacesWithSubraces();

        expect(result).toHaveLength(1);
        expect(result[0].url).toBe(smallRace1.url);
        expect(result[0].subraces).toHaveLength(1);
        expect(result[0].subraces![0].url).toBe('/races/subrace1');
    });

    it('should handle races without subraces', async () => {
        const flatRaces = [
            { race: smallRace1, parentUrl: null },
            { race: smallRace2, parentUrl: null },
        ];

        const mockSmallDao = {
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue(flatRaces),
            readTopLevelRaces: vi.fn().mockResolvedValue([smallRace1, smallRace2]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
            readAllItems: vi.fn().mockResolvedValue([smallRace1, smallRace2]),
            readAllItemsNames: vi.fn().mockResolvedValue(['Эльф', 'Дварф']),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([fullRace1, fullRace2]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn(),
        };

        const repo = new RacesRepository(mockDb as any);
        const result = await repo.getRacesWithSubraces();

        expect(result).toHaveLength(2);
        expect(result[0].subraces).toEqual([]);
        expect(result[1].subraces).toEqual([]);
    });

    it('should get top level races', async () => {
        const mockSmallDao = {
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([smallRace1, smallRace2]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
            readAllItems: vi.fn().mockResolvedValue([smallRace1, smallRace2]),
            readAllItemsNames: vi.fn().mockResolvedValue(['Эльф', 'Дварф']),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([fullRace1, fullRace2]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn(),
        };

        const repo = new RacesRepository(mockDb as any);
        const result = await repo.getTopLevelRaces(null, null);

        expect(mockSmallDao.readTopLevelRaces).toHaveBeenCalledWith(null, null);
        expect(result).toHaveLength(2);
    });

    it('should get subraces for a parent', async () => {
        const subrace = { ...smallRace2, url: '/races/hill-dwarf' };
        const mockSmallDao = {
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([subrace]),
            readAllItems: vi.fn().mockResolvedValue([]),
            readAllItemsNames: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn(),
        };

        const repo = new RacesRepository(mockDb as any);
        const result = await repo.getSubraces('/races/dwarf');

        expect(mockSmallDao.readSubracesByParentUrl).toHaveBeenCalledWith('/races/dwarf');
        expect(result).toHaveLength(1);
        expect(result[0].url).toBe('/races/hill-dwarf');
    });
});

// Tests for filter collection
describe('RacesRepository - Filter Collection', () => {
    it('should collect unique abilities from all races', async () => {
        const db = mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        );
        const repo = new RacesRepository(db);

        const filters = await repo.getAllFilters();

        expect(filters?.abilities).toContain('dexterity');
        expect(filters?.abilities).toContain('constitution');
        expect(filters?.abilities).toContain('charisma');
        expect(filters?.abilities).toContain('intelligence');
    });

    it('should collect unique types from all races', async () => {
        const db = mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        );
        const repo = new RacesRepository(db);

        const filters = await repo.getAllFilters();

        expect(filters?.types).toContain('Базовая');
        expect(filters?.types).toContain('Редкая');
    });

    it('should collect unique sources with markers', async () => {
        const db = mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        );
        const repo = new RacesRepository(db);

        const filters = await repo.getAllFilters();

        // PHB is from Basic group, so no marker
        expect(filters?.sources).toContain('PHB');
        // XGE is from Supplements group, so has marker
        expect(filters?.sources).toContain('XGE*');
    });
});

// Tests for subrace persistence when loading from remote
describe('RacesRepository - Subrace Persistence', () => {
    it('should save subraces to database when loading race from remote', async () => {
        const subraceWithUrl: FullRace = {
            ...fullRace1Subrace,
            url: '/races/elf/subrace-0',
        };
        const raceWithSubraces: FullRace = {
            ...fullRace1,
            subraces: [subraceWithUrl],
        };

        const createItemMock = vi.fn();
        const createItemWithParentMock = vi.fn();
        const readItemByUrlMock = vi.fn().mockResolvedValue(null); // Not in cache

        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: readItemByUrlMock,
            createItem: createItemMock,
            createItemWithParent: createItemWithParentMock,
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockSmallDao = {
            readAllItems: vi.fn().mockResolvedValue([smallRace1]),
            readAllItemsNames: vi.fn().mockResolvedValue(['Эльф']),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn().mockImplementation(async (fn) => await fn()),
        };

        const repo = new RacesRepository(mockDb as any);
        // Mock the fetchFromAPI method to return race with subraces
        (repo as any).fetchFromAPI = vi.fn().mockResolvedValue(raceWithSubraces);

        const result = await repo.getFullItemByUrl('/races/elf');

        // Verify the main race was saved
        expect(createItemMock).toHaveBeenCalledWith(raceWithSubraces);

        // Verify subraces were saved with parent URL
        expect(createItemWithParentMock).toHaveBeenCalledTimes(1);
        expect(createItemWithParentMock).toHaveBeenCalledWith(subraceWithUrl, '/races/elf');

        // Verify the result contains subraces
        expect(result?.subraces).toHaveLength(1);
        expect(result?.subraces?.[0].url).toBe('/races/elf/subrace-0');
    });

    it('should save nested subraces recursively', async () => {
        const nestedSubrace: FullRace = {
            ...fullRace1Subrace,
            name: { rus: 'Вложенная подраса', eng: 'Nested Subrace' },
            url: '/races/elf/subrace-0/subrace-0',
        };
        const subrace: FullRace = {
            ...fullRace1Subrace,
            url: '/races/elf/subrace-0',
            subraces: [nestedSubrace],
        };
        const raceWithNestedSubraces: FullRace = {
            ...fullRace1,
            subraces: [subrace],
        };

        const createItemMock = vi.fn();
        const createItemWithParentMock = vi.fn();

        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            createItem: createItemMock,
            createItemWithParent: createItemWithParentMock,
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockSmallDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readAllItemsNames: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn().mockImplementation(async (fn) => await fn()),
        };

        const repo = new RacesRepository(mockDb as any);
        (repo as any).fetchFromAPI = vi.fn().mockResolvedValue(raceWithNestedSubraces);

        await repo.getFullItemByUrl('/races/elf');

        // Verify both levels of subraces were saved
        expect(createItemWithParentMock).toHaveBeenCalledTimes(2);
        expect(createItemWithParentMock).toHaveBeenCalledWith(subrace, '/races/elf');
        expect(createItemWithParentMock).toHaveBeenCalledWith(nestedSubrace, '/races/elf/subrace-0');
    });

    it('should load subraces from database when race is cached', async () => {
        const cachedSubrace: FullRace = {
            ...fullRace1Subrace,
            url: '/races/elf/subrace-0',
        };
        const cachedRace: FullRace = {
            ...fullRace1,
            subraces: undefined, // Subraces not populated in cached object
        };

        const readSubracesByParentUrlMock = vi.fn().mockResolvedValue([cachedSubrace]);

        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([cachedRace]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(cachedRace),
            createItem: vi.fn(),
            createItemWithParent: vi.fn(),
            readSubracesByParentUrl: readSubracesByParentUrlMock,
        };
        const mockSmallDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readAllItemsNames: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn(),
        };

        const repo = new RacesRepository(mockDb as any);
        const result = await repo.getFullItemByUrl('/races/elf');

        // Verify subraces were loaded from database
        expect(readSubracesByParentUrlMock).toHaveBeenCalledWith('/races/elf');
        expect(result?.subraces).toHaveLength(1);
        expect(result?.subraces?.[0].url).toBe('/races/elf/subrace-0');
    });

    it('should not save subraces when race has no subraces', async () => {
        const raceWithoutSubraces: FullRace = {
            ...fullRace1,
            subraces: undefined,
        };

        const createItemMock = vi.fn();
        const createItemWithParentMock = vi.fn();

        const mockFullDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            createItem: createItemMock,
            createItemWithParent: createItemWithParentMock,
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockSmallDao = {
            readAllItems: vi.fn().mockResolvedValue([]),
            readAllItemsNames: vi.fn().mockResolvedValue([]),
            readItemByName: vi.fn().mockResolvedValue(null),
            readItemByUrl: vi.fn().mockResolvedValue(null),
            readAllItemsWithParentUrl: vi.fn().mockResolvedValue([]),
            readTopLevelRaces: vi.fn().mockResolvedValue([]),
            readSubracesByParentUrl: vi.fn().mockResolvedValue([]),
        };
        const mockDb = {
            smallRaceDao: mockSmallDao,
            fullRaceDao: mockFullDao,
            transaction: vi.fn().mockImplementation(async (fn) => await fn()),
        };

        const repo = new RacesRepository(mockDb as any);
        (repo as any).fetchFromAPI = vi.fn().mockResolvedValue(raceWithoutSubraces);

        await repo.getFullItemByUrl('/races/elf');

        // Verify main race was saved but no subraces
        expect(createItemMock).toHaveBeenCalledWith(raceWithoutSubraces);
        expect(createItemWithParentMock).not.toHaveBeenCalled();
    });
});

// Tests for grouping
describe('RacesRepository - Grouping', () => {
    it('should group races by type', async () => {
        const db = mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        );
        const repo = new RacesRepository(db);

        const items = await repo.getAllSmallItems();
        const groups = await repo.groupItems(items);

        expect(groups.length).toBe(2);

        const basicGroup = groups.find(g => g.sort === 'Базовая');
        expect(basicGroup).toBeDefined();
        expect(basicGroup?.smallItems).toHaveLength(2);

        const rareGroup = groups.find(g => g.sort === 'Редкая');
        expect(rareGroup).toBeDefined();
        expect(rareGroup?.smallItems).toHaveLength(1);
    });

    it('should sort groups alphabetically', async () => {
        const db = mockDatabase(
            [smallRace1, smallRace2, smallRace3],
            [fullRace1, fullRace2, fullRace3],
        );
        const repo = new RacesRepository(db);

        const items = await repo.getAllSmallItems();
        const groups = await repo.groupItems(items);

        // "Базовая" should come before "Редкая" alphabetically
        expect(groups[0].sort).toBe('Базовая');
        expect(groups[1].sort).toBe('Редкая');
    });
});
