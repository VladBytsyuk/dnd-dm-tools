import { expect, describe, it, beforeEach, vi } from 'vitest';
import { SmallRaceSqlTableDao } from '../../../src/data/databse/SmallRaceSqlTableDao';
import type { SmallRace } from '../../../src/domain/models/race/SmallRace';
import type { RaceFilters } from '../../../src/domain/models/race/RaceFilters';
import { runSqlDaoBaseTests } from './Dao';
import {
    smallRace1,
    smallRace1Subrace,
    smallRace1SubraceLevel2,
    singleRaceFilter,
} from '../../__mocks__/domain/models/race/small_race_items';

runSqlDaoBaseTests<SmallRace, RaceFilters>({
    title: 'SmallRaceSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallRaceSqlTableDao(db, app, manifest),
    sample: smallRace1,
    filters: singleRaceFilter,
    expected: {
        table: 'small_races',
        fill: false, // Disable fill test due to custom fillTableWithData implementation
        whereClausesCount: 3,
        filterParams: ['%"key":"dexterity"%', 'Базовая', 'PHB'],
    },
    mutate: (race) => ({
        ...race,
        name: { ...race.name, rus: 'Новое название' }
    }),
    mapCase: {
        sqlValues: [
            1, // id
            smallRace1.name.rus,
            smallRace1.name.eng,
            smallRace1.url,
            JSON.stringify(smallRace1.abilities),
            smallRace1.type.name,
            smallRace1.type.order,
            smallRace1.source.shortName,
            smallRace1.source.name,
            smallRace1.source.group.name,
            smallRace1.source.group.shortName,
            smallRace1.source.homebrew ? 1 : 0,
            smallRace1.image,
            smallRace1.group?.name,
            smallRace1.group?.order,
            null, // parent_url
        ],
        assert: (race) => {
            expect(race.name.rus).toBe(smallRace1.name.rus);
            expect(race.name.eng).toBe(smallRace1.name.eng);
            expect(race.url).toBe(smallRace1.url);
            expect(race.abilities).toEqual(smallRace1.abilities);
            expect(race.type.name).toBe(smallRace1.type.name);
            expect(race.type.order).toBe(smallRace1.type.order);
            expect(race.source.shortName).toBe(smallRace1.source.shortName);
            expect(race.source.name).toBe(smallRace1.source.name);
            expect(race.source.group.name).toBe(smallRace1.source.group.name);
            expect(race.source.group.shortName).toBe(smallRace1.source.group.shortName);
            expect(race.source.homebrew).toBe(smallRace1.source.homebrew);
            expect(race.image).toBe(smallRace1.image);
            expect(race.group?.name).toBe(smallRace1.group?.name);
            expect(race.group?.order).toBe(smallRace1.group?.order);
        }
    }
});

// Additional tests for hierarchy-specific functionality
describe('SmallRaceSqlTableDao - Hierarchy', () => {
    let dao: SmallRaceSqlTableDao;
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {
            exec: vi.fn().mockReturnValue([]),
        };
        dao = new SmallRaceSqlTableDao(mockDb, {} as any, {} as any);
    });

    describe('flattenRaces', () => {
        it('should flatten races with subraces', () => {
            const parentRace: SmallRace = {
                ...smallRace1,
                subraces: [smallRace1Subrace],
            };

            // Access private method via prototype
            const flattenRaces = (dao as any).flattenRaces.bind(dao);
            const result = flattenRaces([parentRace], null);

            expect(result).toHaveLength(2);
            expect(result[0].race.url).toBe(smallRace1.url);
            expect(result[0].parentUrl).toBeNull();
            expect(result[1].race.url).toBe(smallRace1Subrace.url);
            expect(result[1].parentUrl).toBe(smallRace1.url);
        });

        it('should handle deeply nested subraces', () => {
            const level1Subrace: SmallRace = {
                ...smallRace1Subrace,
                subraces: [smallRace1SubraceLevel2],
            };
            const parentRace: SmallRace = {
                ...smallRace1,
                subraces: [level1Subrace],
            };

            const flattenRaces = (dao as any).flattenRaces.bind(dao);
            const result = flattenRaces([parentRace], null);

            expect(result).toHaveLength(3);
            expect(result[0].parentUrl).toBeNull();
            expect(result[1].parentUrl).toBe(smallRace1.url);
            expect(result[2].parentUrl).toBe(smallRace1Subrace.url);
        });

        it('should handle races without subraces', () => {
            const flattenRaces = (dao as any).flattenRaces.bind(dao);
            const result = flattenRaces([smallRace1], null);

            expect(result).toHaveLength(1);
            expect(result[0].race.url).toBe(smallRace1.url);
            expect(result[0].parentUrl).toBeNull();
        });
    });

    describe('readAllItemsWithParentUrl', () => {
        it('should call database exec with correct query', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readAllItemsWithParentUrl(null, null);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('SELECT * FROM small_races');
        });

        it('should apply name filter when provided', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);
            // Mock filterByName to return actual where clause
            vi.spyOn(dao, 'filterByName').mockResolvedValue({
                whereClauses: ['rus_name LIKE ? OR eng_name LIKE ?'],
                params: ['%Эльф%', '%Эльф%'],
            });

            await dao.readAllItemsWithParentUrl('Эльф', null);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('WHERE');
        });

        it('should apply filters when provided', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readAllItemsWithParentUrl(null, singleRaceFilter);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('WHERE');
        });
    });

    describe('readTopLevelRaces', () => {
        it('should query for races with null parent_url', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readTopLevelRaces(null, null);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('parent_url IS NULL');
        });
    });

    describe('readSubracesByParentUrl', () => {
        it('should query for races with specific parent_url', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readSubracesByParentUrl(smallRace1.url);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('parent_url = ?');
            expect(mockDb.exec.mock.calls[0][1]).toContain(smallRace1.url);
        });
    });
});
