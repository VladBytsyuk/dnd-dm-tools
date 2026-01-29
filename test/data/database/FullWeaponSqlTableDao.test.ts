import { expect } from 'vitest';
import { FullWeaponSqlTableDao } from '../../../src/data/database/FullWeaponSqlTableDao';
import { FullWeapon } from '../../../src/domain/models/weapon/FullWeapon';
import type { ArsenalFilters } from '../../../src/domain/models/weapon/ArsenalFilters';
import { runSqlDaoBaseTests } from './Dao';
import { fullWeaponBlowgun } from '../../__mocks__/domain/models/weapon/full_weapon_items';
import { arsenalFilters } from '../../__mocks__/domain/models/weapon/small_weapon_items';

runSqlDaoBaseTests<FullWeapon, any>({
    title: 'Dao: Arsenal full',
    daoFactory: ({ app, db, manifest }) => new FullWeaponSqlTableDao(db),
    sample: fullWeaponBlowgun,
    filters: arsenalFilters,
    expected: {
        table: 'full_arsenal',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (w) => ({ ...w, price: '11gp' }),
    mapCase: {
        sqlValues: [
            1,
            fullWeaponBlowgun.name.rus,
            fullWeaponBlowgun.name.eng,
            fullWeaponBlowgun.type.name,
            fullWeaponBlowgun.type.order ?? null,
            fullWeaponBlowgun.url,
            fullWeaponBlowgun.damage.dice ?? null,
            fullWeaponBlowgun.damage.type,
            fullWeaponBlowgun.price,
            fullWeaponBlowgun.source.shortName,
            fullWeaponBlowgun.source.name,
            fullWeaponBlowgun.source.group.name,
            fullWeaponBlowgun.source.group.shortName,
            fullWeaponBlowgun.source.homebrew ? 1 : 0,
            "" + fullWeaponBlowgun.weight,
            fullWeaponBlowgun.special ?? null,
            fullWeaponBlowgun.description ?? null,
            JSON.stringify(fullWeaponBlowgun.properties ?? []),
        ],
        assert: (weapon) => {
            expect(weapon.name.rus).toStrictEqual(fullWeaponBlowgun.name.rus);
            expect(weapon.name.eng).toStrictEqual(fullWeaponBlowgun.name.eng);
            expect(weapon.type.name).toStrictEqual(fullWeaponBlowgun.type.name);
            expect(weapon.type.order).toStrictEqual(fullWeaponBlowgun.type.order);
            expect(weapon.damage.dice).toStrictEqual(fullWeaponBlowgun.damage.dice);
            expect(weapon.damage.type).toStrictEqual(fullWeaponBlowgun.damage.type);
            expect(weapon.price).toStrictEqual(fullWeaponBlowgun.price);
            expect(weapon.source.shortName).toStrictEqual(fullWeaponBlowgun.source.shortName);
            expect(weapon.source.name).toStrictEqual(fullWeaponBlowgun.source.name);
            expect(weapon.source.group.name).toStrictEqual(fullWeaponBlowgun.source.group.name);
            expect(weapon.source.group.shortName).toStrictEqual(fullWeaponBlowgun.source.group.shortName);
            expect(weapon.source.homebrew).toStrictEqual(fullWeaponBlowgun.source.homebrew);
            expect(weapon.weight).toStrictEqual(fullWeaponBlowgun.weight);
            expect(weapon.special).toStrictEqual(fullWeaponBlowgun.special);
            expect(weapon.description).toStrictEqual(fullWeaponBlowgun.description);
            expect(weapon.properties).toStrictEqual(fullWeaponBlowgun.properties);
        },
    },
});
