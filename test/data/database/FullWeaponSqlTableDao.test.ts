import { expect } from 'vitest';
import { FullWeaponSqlTableDao } from '../../../src/data/databse/FullWeaponSqlTableDao';
import { FullWeapon } from '../../../src/domain/models/weapon/FullWeapon';
import type { ArsenalFilters } from '../../../src/domain/models/weapon/ArsenalFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleWeapon: FullWeapon = {
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
    weight: 3,
    special: 'Flaming',
    description: 'A sword engulfed in flames.',
    properties: [
        { name: 'Versatile', url: 'https://example.com/versatile', description: 'Can be used with two hands for more damage.' },
    ],
};

const filters: ArsenalFilters = {
    dices: ['1d8'],
    damageTypes: ['slashing'],
    types: ['Melee'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<FullWeapon, ArsenalFilters>({
    title: 'FullWeaponSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullWeaponSqlTableDao(db),
    sample: sampleWeapon,
    filters: filters,
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
            sampleWeapon.name.rus,
            sampleWeapon.name.eng,
            sampleWeapon.type.name,
            sampleWeapon.type.order ?? null,
            sampleWeapon.url,
            sampleWeapon.damage.dice ?? null,
            sampleWeapon.damage.type,
            sampleWeapon.price,
            sampleWeapon.source.shortName,
            sampleWeapon.source.name,
            sampleWeapon.source.group.name,
            sampleWeapon.source.group.shortName,
            sampleWeapon.source.homebrew ? 1 : 0,
            "" + sampleWeapon.weight,
            sampleWeapon.special ?? null,
            sampleWeapon.description ?? null,
            JSON.stringify(sampleWeapon.properties ?? []),
        ],
        assert: (weapon) => {
            expect(weapon.name.rus).toStrictEqual(sampleWeapon.name.rus);
            expect(weapon.name.eng).toStrictEqual(sampleWeapon.name.eng);
            expect(weapon.type.name).toStrictEqual(sampleWeapon.type.name);
            expect(weapon.type.order).toStrictEqual(sampleWeapon.type.order);
            expect(weapon.damage.dice).toStrictEqual(sampleWeapon.damage.dice);
            expect(weapon.damage.type).toStrictEqual(sampleWeapon.damage.type);
            expect(weapon.price).toStrictEqual(sampleWeapon.price);
            expect(weapon.source.shortName).toStrictEqual(sampleWeapon.source.shortName);
            expect(weapon.source.name).toStrictEqual(sampleWeapon.source.name);
            expect(weapon.source.group.name).toStrictEqual(sampleWeapon.source.group.name);
            expect(weapon.source.group.shortName).toStrictEqual(sampleWeapon.source.group.shortName);
            expect(weapon.source.homebrew).toStrictEqual(sampleWeapon.source.homebrew);
            expect(weapon.weight).toStrictEqual(sampleWeapon.weight);
            expect(weapon.special).toStrictEqual(sampleWeapon.special);
            expect(weapon.description).toStrictEqual(sampleWeapon.description);
            expect(weapon.properties).toStrictEqual(sampleWeapon.properties);
        },
    },
});
