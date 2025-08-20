import { expect } from 'vitest';
import { SmallItemSqlTableDao } from '../../../src/data/databse/SmallItemSqlTableDao';
import type { SmallItem } from '../../../src/domain/models/items/SmallItem';
import type { EquipmentFilters } from '../../../src/domain/models/items/EquipmentFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleItem: SmallItem = {
    name: { rus: 'Верёвка', eng: 'Rope' },
    url: 'https://example.com/rope',
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: EquipmentFilters = {
    sources: ['PHB'],
};

runSqlDaoBaseTests<SmallItem, EquipmentFilters>({
    title: 'SmallItemSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallItemSqlTableDao(db, app, manifest),
    sample: sampleItem,
    filters: filters,
    expected: {
        table: 'small_equipment',
        fill: true,
        whereClausesCount: 1,
        filterParams: ['PHB'],
    },
    mutate: (item) => ({
        ...item,
        name: { ...item.name, rus: 'Верёвка 50 футов' }
    }),
    mapCase: {
        sqlValues: [
            1,
            sampleItem.name.rus,
            sampleItem.name.eng,
            sampleItem.url,
            sampleItem.source.shortName,
            sampleItem.source.name,
            sampleItem.source.group.name,
            sampleItem.source.group.shortName,
            sampleItem.source.homebrew,
        ],
        assert: (item) => {
            expect(item.name.rus).toBe(sampleItem.name.rus);
            expect(item.name.eng).toBe(sampleItem.name.eng);
            expect(item.url).toBe(sampleItem.url);
            expect(item.source.shortName).toBe(sampleItem.source.shortName);
            expect(item.source.name).toBe(sampleItem.source.name);
            expect(item.source.group.name).toBe(sampleItem.source.group.name);
            expect(item.source.group.shortName).toBe(sampleItem.source.group.shortName);
            expect(item.source.homebrew).toBe(sampleItem.source.homebrew);
        },
    },
});
