import { expect, describe, it, beforeEach, vi } from 'vitest';
import { FullRaceSqlTableDao } from '../../../src/data/databse/FullRaceSqlTableDao';
import type { FullRace } from '../../../src/domain/models/race/FullRace';
import { runSqlDaoBaseTests } from './Dao';
import { fullRace1, fullRace1Subrace } from '../../__mocks__/domain/models/race/full_race_items';

runSqlDaoBaseTests<FullRace, any>({
    title: 'FullRaceSqlTableDao',
    daoFactory: ({ db }) => new FullRaceSqlTableDao(db),
    sample: fullRace1,
    filters: {},
    expected: {
        table: 'full_races',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (race) => ({
        ...race,
        name: { ...race.name, rus: 'Новое название' }
    }),
    mapCase: {
        sqlValues: [
            1, // id
            fullRace1.name.rus,
            fullRace1.name.eng,
            fullRace1.url,
            JSON.stringify(fullRace1.abilities),
            fullRace1.type.name,
            fullRace1.type.order,
            fullRace1.source.shortName,
            fullRace1.source.name,
            fullRace1.source.group.name,
            fullRace1.source.group.shortName,
            fullRace1.source.homebrew ? 1 : 0,
            fullRace1.image,
            fullRace1.group?.name,
            fullRace1.group?.order,
            null, // parent_url
            fullRace1.description,
            fullRace1.size,
            JSON.stringify(fullRace1.speed),
            JSON.stringify(fullRace1.skills),
        ],
        assert: (race) => {
            expect(race.name.rus).toBe(fullRace1.name.rus);
            expect(race.name.eng).toBe(fullRace1.name.eng);
            expect(race.url).toBe(fullRace1.url);
            expect(race.abilities).toEqual(fullRace1.abilities);
            expect(race.type.name).toBe(fullRace1.type.name);
            expect(race.type.order).toBe(fullRace1.type.order);
            expect(race.source.shortName).toBe(fullRace1.source.shortName);
            expect(race.source.name).toBe(fullRace1.source.name);
            expect(race.source.group.name).toBe(fullRace1.source.group.name);
            expect(race.source.group.shortName).toBe(fullRace1.source.group.shortName);
            expect(race.source.homebrew).toBe(fullRace1.source.homebrew);
            expect(race.image).toBe(fullRace1.image);
            expect(race.group?.name).toBe(fullRace1.group?.name);
            expect(race.group?.order).toBe(fullRace1.group?.order);
            expect(race.description).toBe(fullRace1.description);
            expect(race.size).toBe(fullRace1.size);
            expect(race.speed).toEqual(fullRace1.speed);
            expect(race.skills).toEqual(fullRace1.skills);
        }
    }
});

// Additional tests for hierarchy-specific functionality
describe('FullRaceSqlTableDao - Hierarchy', () => {
    let dao: FullRaceSqlTableDao;
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {
            exec: vi.fn().mockReturnValue([]),
        };
        dao = new FullRaceSqlTableDao(mockDb);
    });

    describe('readAllItemsWithParentUrl', () => {
        it('should call database exec with correct query', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readAllItemsWithParentUrl();

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('SELECT * FROM full_races');
        });

        it('should return empty array when no results', async () => {
            mockDb.exec.mockReturnValue([]);

            const result = await dao.readAllItemsWithParentUrl();

            expect(result).toEqual([]);
        });
    });

    describe('readSubracesByParentUrl', () => {
        it('should query for races with specific parent_url', async () => {
            mockDb.exec.mockReturnValue([{ values: [] }]);

            await dao.readSubracesByParentUrl(fullRace1.url);

            expect(mockDb.exec).toHaveBeenCalled();
            const query = mockDb.exec.mock.calls[0][0];
            expect(query).toContain('parent_url = ?');
            expect(mockDb.exec.mock.calls[0][1]).toContain(fullRace1.url);
        });

        it('should return empty array when no subraces found', async () => {
            mockDb.exec.mockReturnValue([]);

            const result = await dao.readSubracesByParentUrl(fullRace1.url);

            expect(result).toEqual([]);
        });
    });

    describe('createItemWithParent', () => {
        it('should insert item with parent_url', async () => {
            vi.spyOn(dao, 'checkItemExists').mockResolvedValue(false);

            await dao.createItemWithParent(fullRace1Subrace, fullRace1.url);

            expect(mockDb.exec).toHaveBeenCalled();
            const sql = mockDb.exec.mock.calls[0][0];
            expect(sql).toContain('INSERT INTO full_races');
            const params = mockDb.exec.mock.calls[0][1];
            expect(params).toContain(fullRace1.url); // parent_url
        });

        it('should not insert if item already exists', async () => {
            vi.spyOn(dao, 'checkItemExists').mockResolvedValue(true);

            await dao.createItemWithParent(fullRace1Subrace, fullRace1.url);

            // Only checkItemExists call, no insert
            expect(mockDb.exec).not.toHaveBeenCalled();
        });
    });
});
