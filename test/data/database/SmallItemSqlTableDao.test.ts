import { expect } from 'vitest';
import { SmallItemSqlTableDao } from '../../../src/data/databse/SmallItemSqlTableDao';
import type { SmallItem } from '../../../src/domain/models/items/SmallItem';
import type { EquipmentFilters } from '../../../src/domain/models/items/EquipmentFilters';
import { runSqlDaoBaseTests } from './Dao';
import { equipmentFilters, smallItemAbacus, smallItemPoison } from '../../__mocks__/domain/models/items/small_items_items';

runSqlDaoBaseTests<SmallItem, EquipmentFilters>({
    title: 'Dao: Equipment small',
    daoFactory: ({ app, db, manifest }) => new SmallItemSqlTableDao(db, app, manifest),
    sample: smallItemPoison,
    filters: equipmentFilters,
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
            smallItemPoison.name.rus,
            smallItemPoison.name.eng,
            smallItemPoison.url,
            smallItemPoison.source.shortName,
            smallItemPoison.source.name,
            smallItemPoison.source.group.name,
            smallItemPoison.source.group.shortName,
            smallItemPoison.source.homebrew,
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(smallItemPoison.name.rus);
            expect(item.name.eng).toStrictEqual(smallItemPoison.name.eng);
            expect(item.url).toStrictEqual(smallItemPoison.url);
            expect(item.source.shortName).toStrictEqual(smallItemPoison.source.shortName);
            expect(item.source.name).toStrictEqual(smallItemPoison.source.name);
            expect(item.source.group.name).toStrictEqual(smallItemPoison.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(smallItemPoison.source.group.shortName);
            expect(item.source.homebrew).toStrictEqual(smallItemPoison.source.homebrew);
        },
    },
});
