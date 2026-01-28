import { expect } from 'vitest';
import { FullItemSqlTableDao } from '../../../src/data/database/FullItemSqlTableDao';
import type { FullItem } from '../../../src/domain/models/items/FullItem';
import { runSqlDaoBaseTests } from './Dao';
import { fullItemPoison } from '../../__mocks__/domain/models/items/full_items_items';
import { equipmentFilters } from '../../__mocks__/domain/models/items/small_items_items';

runSqlDaoBaseTests<FullItem, any>({
    title: 'FullItemSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullItemSqlTableDao(db),
    sample: fullItemPoison,
    filters: equipmentFilters,
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
            fullItemPoison.name.rus,
            fullItemPoison.name.eng,
            fullItemPoison.url,
            fullItemPoison.source.shortName,
            fullItemPoison.source.name,
            fullItemPoison.source.group.name,
            fullItemPoison.source.group.shortName,
            fullItemPoison.source.homebrew,
            fullItemPoison.price,
            fullItemPoison.weight,
            fullItemPoison.description,
            JSON.stringify(fullItemPoison.categories),
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(fullItemPoison.name.rus);
            expect(item.name.eng).toStrictEqual(fullItemPoison.name.eng);
            expect(item.url).toStrictEqual(fullItemPoison.url);
            expect(item.source.shortName).toStrictEqual(fullItemPoison.source.shortName);
            expect(item.source.name).toStrictEqual(fullItemPoison.source.name);
            expect(item.source.group.name).toStrictEqual(fullItemPoison.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(fullItemPoison.source.group.shortName);
            expect(item.source.homebrew).toStrictEqual(fullItemPoison.source.homebrew);
            expect(item.price).toStrictEqual(fullItemPoison.price);
            expect(item.weight).toStrictEqual(fullItemPoison.weight);
            expect(item.description).toStrictEqual(fullItemPoison.description);
            expect(item.categories).toStrictEqual(fullItemPoison.categories);
        },
    },
});
