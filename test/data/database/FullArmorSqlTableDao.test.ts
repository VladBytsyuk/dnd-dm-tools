import { expect } from 'vitest';
import { FullArmorSqlTableDao } from '../../../src/data/databse/FullArmorSqlTableDao';
import type { FullArmor } from '../../../src/domain/models/armor/FullArmor';
import { runSqlDaoBaseTests } from './Dao';
import { fullArmorRingMail } from '../../__mocks__/domain/models/armor/full_armor_items';
import { armoryFilters } from '../../__mocks__/domain/models/armor/small_armor_items';


runSqlDaoBaseTests<FullArmor, any>({
    title: 'Dao: Armory full',
    daoFactory: ({ app, db, manifest }) => new FullArmorSqlTableDao(db),
    sample: fullArmorRingMail,
    filters: armoryFilters,
    expected: {
        table: 'full_armory',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (a) => ({ ...a, price: '76gp' }),
    mapCase: {
        sqlValues: [
            1,
            fullArmorRingMail.name.rus,
            fullArmorRingMail.name.eng,
            fullArmorRingMail.type.name,
            fullArmorRingMail.type.order,
            fullArmorRingMail.url,
            fullArmorRingMail.armorClass,
            fullArmorRingMail.price,
            fullArmorRingMail.source.shortName,
            fullArmorRingMail.source.name,
            fullArmorRingMail.source.group.name,
            fullArmorRingMail.source.group.shortName,
            fullArmorRingMail.source.homebrew,
            fullArmorRingMail.weight,
            fullArmorRingMail.description,
            fullArmorRingMail.disadvantage,
            fullArmorRingMail.requirement,
            fullArmorRingMail.duration
        ],
        assert: (armor) => {
            expect(armor.name.rus).toStrictEqual(fullArmorRingMail.name.rus);
            expect(armor.name.eng).toStrictEqual(fullArmorRingMail.name.eng);
            expect(armor.type.name).toStrictEqual(fullArmorRingMail.type.name);
            expect(armor.type.order).toStrictEqual(fullArmorRingMail.type.order);
            expect(armor.armorClass).toStrictEqual(fullArmorRingMail.armorClass);
            expect(armor.price).toStrictEqual(fullArmorRingMail.price);
            expect(armor.source.shortName).toStrictEqual(fullArmorRingMail.source.shortName);
            expect(armor.source.name).toStrictEqual(fullArmorRingMail.source.name);
            expect(armor.source.group.name).toStrictEqual(fullArmorRingMail.source.group.name);
            expect(armor.source.group.shortName).toStrictEqual(fullArmorRingMail.source.group.shortName);
            expect(armor.source.homebrew).toStrictEqual(fullArmorRingMail.source.homebrew);
            expect(armor.weight).toStrictEqual(fullArmorRingMail.weight);
            expect(armor.description).toStrictEqual(fullArmorRingMail.description);
            expect(armor.disadvantage).toStrictEqual(fullArmorRingMail.disadvantage);
            expect(armor.requirement).toStrictEqual(fullArmorRingMail.requirement);
            expect(armor.duration).toStrictEqual(fullArmorRingMail.duration);
        },
    },
});
