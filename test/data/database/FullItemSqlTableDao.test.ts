import { expect } from 'vitest';
import { FullItemSqlTableDao } from '../../../src/data/databse/FullItemSqlTableDao';
import type { FullItem } from '../../../src/domain/models/items/FullItem';
import type { EquipmentFilters } from '../../../src/domain/models/items/EquipmentFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleItem: FullItem = {
    name: { rus: 'Верёвка', eng: 'Rope' },
    url: 'https://example.com/rope',
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
    price: '10gp',
    weight: 5,
    description: 'Длинная пеньковая веревка.',
    categories: ['Equipment', 'Tools'],
};

const filters: EquipmentFilters = {
    sources: ['PHB'],
};

runSqlDaoBaseTests<FullItem, any>({
    title: 'FullItemSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullItemSqlTableDao(db),
    sample: sampleItem,
    filters: filters,
    expected: {
        table: 'full_equipment',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
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
            sampleItem.price,
            sampleItem.weight,
            sampleItem.description,
            JSON.stringify(sampleItem.categories),
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(sampleItem.name.rus);
            expect(item.name.eng).toStrictEqual(sampleItem.name.eng);
            expect(item.url).toStrictEqual(sampleItem.url);
            expect(item.source.shortName).toStrictEqual(sampleItem.source.shortName);
            expect(item.source.name).toStrictEqual(sampleItem.source.name);
            expect(item.source.group.name).toStrictEqual(sampleItem.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(sampleItem.source.group.shortName);
            expect(item.source.homebrew).toStrictEqual(sampleItem.source.homebrew);
            expect(item.price).toStrictEqual(sampleItem.price);
            expect(item.weight).toStrictEqual(sampleItem.weight);
            expect(item.description).toStrictEqual(sampleItem.description);
            expect(item.categories).toStrictEqual(sampleItem.categories);
        },
    },
});
