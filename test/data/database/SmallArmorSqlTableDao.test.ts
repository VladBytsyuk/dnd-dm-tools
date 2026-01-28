import { expect } from 'vitest';
import { SmallArmorSqlTableDao } from '../../../src/data/database/SmallArmorSqlTableDao';
import type { SmallArmor } from '../../../src/domain/models/armor/SmallArmor';
import type { ArmoryFilters } from '../../../src/domain/models/armor/ArmoryFilters';
import { runSqlDaoBaseTests } from './Dao';
import { armoryFilters, smallArmorRingMail } from '../../__mocks__/domain/models/armor/small_armor_items';

runSqlDaoBaseTests<SmallArmor, ArmoryFilters>({
    title: 'Dao: Armory small',
    daoFactory: ({ app, db, manifest }) => new SmallArmorSqlTableDao(db, app, manifest),
    sample: smallArmorRingMail,
    filters: armoryFilters,
    expected: {
        table: 'small_armory',
        fill: true,
        whereClausesCount: 2,
        filterParams: ['Легкий доспех', 'Средний доспех', 'Тяжелый доспех', 'PHB'],
    },
    mutate: (a) => ({ ...a, price: '76gp' }),
    mapCase: {
        sqlValues: [
            1,
            smallArmorRingMail.name.rus,
            smallArmorRingMail.name.eng,
            smallArmorRingMail.type.name,
            smallArmorRingMail.type.order,
            smallArmorRingMail.url,
            smallArmorRingMail.armorClass,
            smallArmorRingMail.price,
            smallArmorRingMail.source.shortName,
            smallArmorRingMail.source.name,
            smallArmorRingMail.source.group.name,
            smallArmorRingMail.source.group.shortName,
            smallArmorRingMail.source.homebrew,
        ],
        assert: (armor) => {
            expect(armor.name.rus).toStrictEqual(smallArmorRingMail.name.rus);
            expect(armor.name.eng).toStrictEqual(smallArmorRingMail.name.eng);
            expect(armor.type.name).toStrictEqual(smallArmorRingMail.type.name);
            expect(armor.type.order).toStrictEqual(smallArmorRingMail.type.order);
            expect(armor.armorClass).toStrictEqual(smallArmorRingMail.armorClass);
            expect(armor.price).toStrictEqual(smallArmorRingMail.price);
            expect(armor.source.shortName).toStrictEqual(smallArmorRingMail.source.shortName);
            expect(armor.source.name).toStrictEqual(smallArmorRingMail.source.name);
            expect(armor.source.group.name).toStrictEqual(smallArmorRingMail.source.group.name);
            expect(armor.source.group.shortName).toStrictEqual(smallArmorRingMail.source.group.shortName);
            expect(armor.source.homebrew).toStrictEqual(smallArmorRingMail.source.homebrew);
        },
    },
});
