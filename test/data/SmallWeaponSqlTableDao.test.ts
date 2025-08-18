import { expect } from 'vitest';
import { SmallWeaponSqlTableDao } from '../../src/data/databse/SmallWeaponSqlTableDao';
import { SmallWeapon } from '../../src/domain/models/weapon/SmallWeapon';
import type { ArsenalFilters } from './../../src/domain/models/weapon/ArsenalFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleWeapon: SmallWeapon = {
    name: { rus: 'Меч', eng: 'Sword' },
    url: 'https://example.com/sword',
    type: { name: 'Melee', order: 1 },
    damage: { dice: '1d8', type: 'slashing' },
    price: '10gp',
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: ArsenalFilters = {
    dices: ['1d8'],
    damageTypes: ['slashing'],
    types: ['Melee'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<SmallWeapon, ArsenalFilters>({
    title: 'SmallWeaponSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallWeaponSqlTableDao(db, app, manifest),
    sample: sampleWeapon,
    filters: filters,
    expected: {
        table: 'small_arsenal',
        whereClausesCount: 4,
        filterParams: ['1d8', 'slashing', 'Melee', 'PHB'],
    },
    mutate: (w) => ({ ...w, price: '11gp' }),
    mapCase: {
        sqlValues: [
            1,
            sampleWeapon.name.rus,
            sampleWeapon.name.eng,
            sampleWeapon.type.name,
            sampleWeapon.type.order,
            sampleWeapon.url,
            sampleWeapon.damage.dice,
            sampleWeapon.damage.type,
            sampleWeapon.price,
            sampleWeapon.source.shortName,
            sampleWeapon.source.name,
            sampleWeapon.source.group.name,
            sampleWeapon.source.group.shortName,
            sampleWeapon.source.homebrew,
        ],
        assert: (weapon) => {
            expect(weapon.name.rus).toBe(sampleWeapon.name.rus);
            expect(weapon.name.eng).toBe(sampleWeapon.name.eng);
            expect(weapon.type.name).toBe(sampleWeapon.type.name);
            expect(weapon.type.order).toBe(sampleWeapon.type.order);
            expect(weapon.damage.dice).toBe(sampleWeapon.damage.dice);
            expect(weapon.damage.type).toBe(sampleWeapon.damage.type);
            expect(weapon.price).toBe(sampleWeapon.price);
            expect(weapon.source.shortName).toBe(sampleWeapon.source.shortName);
            expect(weapon.source.name).toBe(sampleWeapon.source.name);
            expect(weapon.source.group.name).toBe(sampleWeapon.source.group.name);
            expect(weapon.source.group.shortName).toBe(sampleWeapon.source.group.shortName);
            expect(weapon.source.homebrew).toBe(sampleWeapon.source.homebrew);
        },
    },
});
