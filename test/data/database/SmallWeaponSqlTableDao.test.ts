import { expect } from 'vitest';
import { SmallWeaponSqlTableDao } from '../../../src/data/database/SmallWeaponSqlTableDao';
import { SmallWeapon } from '../../../src/domain/models/weapon/SmallWeapon';
import type { ArsenalFilters } from '../../../src/domain/models/weapon/ArsenalFilters';
import { runSqlDaoBaseTests } from './Dao';
import { arsenalFilters, smallWeaponBlowgun } from '../../__mocks__/domain/models/weapon/small_weapon_items';

runSqlDaoBaseTests<SmallWeapon, ArsenalFilters>({
    title: 'Dao: Arsenal small',
    daoFactory: ({ app, db, manifest }) => new SmallWeaponSqlTableDao(db, app, manifest),
    sample: smallWeaponBlowgun,
    filters: arsenalFilters,
    expected: {
        table: 'small_arsenal',
        fill: true,
        whereClausesCount: 4,
        filterParams: ['1', '1к6', '1к10', 'рубящий', 'дробящий', 'колющий', 'Воинское рукопашное', 'Простое рукопашное', 'Воинское дальнобойное', 'PHB'],
    },
    mutate: (w) => ({ ...w, price: '11gp' }),
    mapCase: {
        sqlValues: [
            1,
            smallWeaponBlowgun.name.rus,
            smallWeaponBlowgun.name.eng,
            smallWeaponBlowgun.type.name,
            smallWeaponBlowgun.type.order,
            smallWeaponBlowgun.url,
            smallWeaponBlowgun.damage.dice,
            smallWeaponBlowgun.damage.type,
            smallWeaponBlowgun.price,
            smallWeaponBlowgun.source.shortName,
            smallWeaponBlowgun.source.name,
            smallWeaponBlowgun.source.group.name,
            smallWeaponBlowgun.source.group.shortName,
            smallWeaponBlowgun.source.homebrew,
        ],
        assert: (weapon) => {
            expect(weapon.name.rus).toStrictEqual(smallWeaponBlowgun.name.rus);
            expect(weapon.name.eng).toStrictEqual(smallWeaponBlowgun.name.eng);
            expect(weapon.type.name).toStrictEqual(smallWeaponBlowgun.type.name);
            expect(weapon.type.order).toStrictEqual(smallWeaponBlowgun.type.order);
            expect(weapon.damage.dice).toStrictEqual(smallWeaponBlowgun.damage.dice);
            expect(weapon.damage.type).toStrictEqual(smallWeaponBlowgun.damage.type);
            expect(weapon.price).toStrictEqual(smallWeaponBlowgun.price);
            expect(weapon.source.shortName).toStrictEqual(smallWeaponBlowgun.source.shortName);
            expect(weapon.source.name).toStrictEqual(smallWeaponBlowgun.source.name);
            expect(weapon.source.group.name).toStrictEqual(smallWeaponBlowgun.source.group.name);
            expect(weapon.source.group.shortName).toStrictEqual(smallWeaponBlowgun.source.group.shortName);
            expect(weapon.source.homebrew).toStrictEqual(smallWeaponBlowgun.source.homebrew);
        },
    },
});
