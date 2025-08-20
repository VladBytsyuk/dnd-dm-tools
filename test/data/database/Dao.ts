import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApp, mockDatabase, mockManifest } from '../../__mocks__/data';
import { Dao } from '../../../src/domain/Dao';

type Deps = { app: any; db: any; manifest: any };

export interface DaoTestConfig<TItem, TFilters> {
    title: string;
    daoFactory: (deps: Deps) => any;
    sample: TItem;
    filters: TFilters;
    expected: {
        table: string;
        whereClausesCount: number;
        filterParams: any[];
    };
    mapCase: {
        sqlValues: any[];
        assert: (mapped: any) => void | Promise<void>;
    };
    mutate?: (item: TItem) => TItem;
}

export function runSqlDaoBaseTests<TItem extends WithUrl, TFilters>(cfg: DaoTestConfig<TItem, TFilters>) {
    describe(cfg.title, () => {
        let dao: Dao<TItem, TFilters>;

        beforeEach(() => {
            vi.clearAllMocks();
            dao = cfg.daoFactory({ app: mockApp, db: mockDatabase, manifest: mockManifest });
        });

        it('should return correct table name', () => {
            expect(dao.getTableName()).toBe(cfg.expected.table);
        });

        it('should create table with correct SQL', async () => {
            await dao.createTable();
            expect(mockDatabase.exec).toHaveBeenCalledTimes(1);
            const sql = (mockDatabase.exec as any).mock.calls[0][0];
            expect(sql).toContain(`CREATE TABLE ${dao.getTableName()}`);
            expect(sql).toContain('PRIMARY KEY');
        });

        it('should call exec when creating item if checkItemExists returns false', async () => {
            vi.spyOn(dao, 'checkItemExists').mockResolvedValue(false);
            await dao.createItem(cfg.sample);
            expect(mockDatabase.exec).toHaveBeenCalled();
            const sql = (mockDatabase.exec as any).mock.calls[0][0];
            expect(sql).toContain(`INSERT INTO ${cfg.expected.table}`);
        });

        it('should build correct where clause for filters', async () => {
            const result = await dao.filterByFilters(cfg.filters);
            expect(result.whereClauses.length).toBe(cfg.expected.whereClausesCount);
            expect(result.params).toEqual(cfg.expected.filterParams);
        });

        it('should call exec when updating item', async () => {
            const updated = cfg.mutate ? cfg.mutate(cfg.sample) : cfg.sample;
            await dao.updateItem(updated);
            expect(mockDatabase.exec).toHaveBeenCalled();
            const sql = (mockDatabase.exec as any).mock.calls[0][0];
            expect(sql).toContain(`UPDATE ${cfg.expected.table} SET`);
        });

        it('should map SQL values to domain object', async () => {
            const mapped = await dao.mapSqlValues(cfg.mapCase.sqlValues);
            await cfg.mapCase.assert(mapped);
        });
    });
}
