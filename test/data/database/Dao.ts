import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApp, mockDatabase, mockManifest } from '../../__mocks__/data';
import { Dao } from '../../../src/domain/Dao';
import { BaseItem } from '../../../src/domain/models/common/BaseItem';

type Deps = { app: any; db: any; manifest: any };

export interface DaoTestConfig<TItem, TFilters> {
    title: string;
    daoFactory: (deps: Deps) => any;
    sample: TItem;
    filters: TFilters;
    expected: {
        table: string;
        fill: boolean;
        whereClausesCount: number;
        filterParams: any[];
    };
    mapCase: {
        sqlValues: any[];
        assert: (mapped: any) => void | Promise<void>;
    };
    mutate?: (item: TItem) => TItem;
}

export function runSqlDaoBaseTests<TItem extends BaseItem, TFilters>(cfg: DaoTestConfig<TItem, TFilters>) {
    describe(cfg.title, () => {
        let dao: Dao<TItem, TFilters>;

        beforeEach(() => {
            vi.clearAllMocks();
            dao = cfg.daoFactory({ app: mockApp, db: mockDatabase, manifest: mockManifest });
        });

        it('should initialize DAO without table', async () => {
            vi.spyOn(dao, 'isTableExists').mockResolvedValue(false);
            const createTableSpy = vi.spyOn(dao, 'createTable');
            await dao.initialize();
            expect(mockDatabase.exec).toHaveBeenCalledTimes(1);
            expect(createTableSpy).toHaveBeenCalled();
        });

        it('should not initialize DAO with table', async () => {
            vi.spyOn(dao, 'isTableExists').mockResolvedValue(true);
            const createTableSpy = vi.spyOn(dao, 'createTable');
            await dao.initialize();
            expect(mockDatabase.exec).toHaveBeenCalledTimes(0);
            expect(createTableSpy).toHaveBeenCalledTimes(0);
        });

        it('should dispose DAO without errors', async () => {
            await dao.dispose();
        });

        it ('should not fill table with data if it doesn\'t exists', async () => {
            if (cfg.expected.fill) {
                vi.spyOn(dao, 'isTableExists').mockResolvedValue(false);
                const loadDataFromLocalStorageSpy = vi.spyOn(dao, 'getLocalData');
                await dao.fillTableWithData();
                expect(loadDataFromLocalStorageSpy).toHaveBeenCalledTimes(0);
            }
        });

        it ('should not fill table with data if it exists and filled', async () => {
            if (cfg.expected.fill) {
                vi.spyOn(dao, 'isTableExists').mockResolvedValue(true);
                vi.spyOn(dao, 'isTableEmpty').mockResolvedValue(false);
                const loadDataFromLocalStorageSpy = vi.spyOn(dao, 'getLocalData');
                await dao.fillTableWithData();
                expect(loadDataFromLocalStorageSpy).toHaveBeenCalledTimes(0);
            }
        });

        it ('should fill table with data if it exists and empty', async () => {
            if (cfg.expected.fill) {
                vi.spyOn(dao, 'isTableExists').mockResolvedValue(true);
                vi.spyOn(dao, 'isTableEmpty').mockResolvedValue(true);
                vi.spyOn(dao, 'createItem').mockResolvedValue();
                const loadDataFromLocalStorageSpy = vi.spyOn(dao, 'getLocalData');
                await dao.fillTableWithData();
                expect(loadDataFromLocalStorageSpy).toHaveBeenCalled();
            }
        });

        it('should make sql query when table existance check', async () => {
            await dao.isTableExists();
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should make sql query when table empty check', async () => {
            await dao.isTableEmpty();
            expect(mockDatabase.exec).toHaveBeenCalled();
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

        it('should not call exec when creating item if checkItemExists returns true', async () => {
            vi.spyOn(dao, 'checkItemExists').mockResolvedValue(true);
            await dao.createItem(cfg.sample);
            expect(mockDatabase.exec).toHaveBeenCalledTimes(0);
        });

        it('should call exec when creating item if checkItemExists returns false', async () => {
            vi.spyOn(dao, 'checkItemExists').mockResolvedValue(false);
            await dao.createItem(cfg.sample);
            expect(mockDatabase.exec).toHaveBeenCalled();
            const sql = (mockDatabase.exec as any).mock.calls[0][0];
            expect(sql).toContain(`INSERT INTO ${cfg.expected.table}`);
        });

        it('should make sql query when request all items', async () => {
            await dao.readAllItems('name', cfg.filters);
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should make sql query when reading all items names', async () => {
            await dao.readAllItemsNames();
            expect(mockDatabase.exec).toHaveBeenCalled();
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

        it('should check item existence before creating', async () => {
            const checkItemExistsSpy = vi.spyOn(dao, 'checkItemExists').mockResolvedValue(false);
            await dao.createItem(cfg.sample);
            expect(checkItemExistsSpy).toHaveBeenCalledWith(cfg.sample);
        });

        it('should call exec when read item by name', async () => {
            await dao.readItemByName('test');
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should call exec when read item by url', async () => {
            await dao.readItemByUrl('test');
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should call exec when delete item by name', async () => {
            await dao.deleteItemByName('test');
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should call exec when delete item by url', async () => {
            await dao.deleteItemByUrl('test');
            expect(mockDatabase.exec).toHaveBeenCalled();
        });

        it('should map SQL values to domain object', async () => {
            const mapped = await dao.mapSqlValues(cfg.mapCase.sqlValues);
            await cfg.mapCase.assert(mapped);
        });

        it('should drop table without errors', async () => {
            await dao.dropTable();
            expect(mockDatabase.exec).toHaveBeenCalledTimes(1);
        });
    });
}
