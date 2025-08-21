import { vi } from 'vitest';
import type { BaseItem } from "../../../src/domain/models/common/BaseItem";
import { Filters } from '../../../src/domain/models/common/Filters';
import { Dao } from '../../../src/domain/Dao';

export function mockDatabase<
    SmallItem extends BaseItem,
    FullItem extends SmallItem,
    Filter extends Filters,
>(
    smallItems: SmallItem[],
    fullItems: FullItem[],
) {
    return {
        transaction: vi.fn(),
        smallArmorDao: mockItemDao<SmallItem, Filter>(smallItems),
        fullArmorDao: mockItemDao<FullItem, Filter>(fullItems),
        smallWeaponDao: mockItemDao<SmallItem, Filter>(smallItems),
        fullWeaponDao: mockItemDao<FullItem, Filter>(fullItems),
    } as any
}

export function mockItemDao<
    Item extends BaseItem,
    Filter extends Filters,
>(items: Item[]): Dao<Item, Filter> {
    return {
        readAllItems: async (name) => items.filter(item => !name || item.name.rus === name),
        readAllItemsNames: async () => items.map(item => item.name.rus),
        readItemByName: async (name: string) => items.find(item => item.name.rus === name) || null,
        readItemByUrl: async (url: string) => items.find(item => item.url === url) || null,
        database: {} as any,
        app: null,
        manifest: null,
        preloadFileName: 'mock.json',
        initialize: vi.fn(),
        dispose: vi.fn(),
        getTableName: vi.fn().mockReturnValue('mock_table'),
        createTable: vi.fn(),
        createItem: vi.fn(),
        fillTableWithData: vi.fn(),
        loadDataFromLocalStorage: vi.fn().mockResolvedValue([]),
        dropTable: vi.fn(),
        isTableExists: vi.fn().mockResolvedValue(true),
        isTableEmpty: vi.fn().mockResolvedValue(false),
        checkItemExists: vi.fn().mockResolvedValue(false),
        filterByName: vi.fn().mockResolvedValue({ clause: '', params: [] }),
        filterByFilters: vi.fn().mockResolvedValue({ clause: '', params: [] }),
        readItem: vi.fn().mockResolvedValue(null),
        updateItem: vi.fn(),
        deleteItemByName: vi.fn(),
        deleteItemByUrl: vi.fn(),
        deleteItem: vi.fn(),
        mapSqlValues: vi.fn().mockResolvedValue({} as Item),
    } as Dao<Item, Filter>;
}
