import { expect } from 'vitest';
import { FullArmorSqlTableDao } from '../../../src/data/databse/FullArmorSqlTableDao';
import type { FullArmor } from '../../../src/domain/models/armor/FullArmor';
import type { ArmoryFilters } from '../../../src/domain/models/armor/ArmoryFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleArmor: FullArmor = {
    name: { rus: 'Кольчуга', eng: 'Chainmail' },
    type: { name: 'Medium', order: 2 },
    url: 'https://example.com/chainmailq',
    armorClass: '16',
    price: '75gp',
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
    weight: 55,
    description: 'A suit of chainmail armor offering solid protection.',
    duration: '1 min',
    disadvantage: true,
    requirement: 13
};

const filters: ArmoryFilters = {
    types: ['Medium', 'Heavy'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<FullArmor, any>({
    title: 'FullArmorSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullArmorSqlTableDao(db),
    sample: sampleArmor,
    filters: filters,
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
            sampleArmor.name.rus,
            sampleArmor.name.eng,
            sampleArmor.type.name,
            sampleArmor.type.order,
            sampleArmor.url,
            sampleArmor.armorClass,
            sampleArmor.price,
            sampleArmor.source.shortName,
            sampleArmor.source.name,
            sampleArmor.source.group.name,
            sampleArmor.source.group.shortName,
            sampleArmor.source.homebrew,
            sampleArmor.weight,
            sampleArmor.description,
            sampleArmor.disadvantage,
            sampleArmor.requirement,
            sampleArmor.duration
        ],
        assert: (armor) => {
            expect(armor.name.rus).toBe(sampleArmor.name.rus);
            expect(armor.name.eng).toBe(sampleArmor.name.eng);
            expect(armor.type.name).toBe(sampleArmor.type.name);
            expect(armor.type.order).toBe(sampleArmor.type.order);
            expect(armor.armorClass).toBe(sampleArmor.armorClass);
            expect(armor.price).toBe(sampleArmor.price);
            expect(armor.source.shortName).toBe(sampleArmor.source.shortName);
            expect(armor.source.name).toBe(sampleArmor.source.name);
            expect(armor.source.group.name).toBe(sampleArmor.source.group.name);
            expect(armor.source.group.shortName).toBe(sampleArmor.source.group.shortName);
            expect(armor.source.homebrew).toBe(sampleArmor.source.homebrew);
            expect(armor.weight).toBe(sampleArmor.weight);
            expect(armor.description).toBe(sampleArmor.description);
            expect(armor.disadvantage).toBe(sampleArmor.disadvantage);
            expect(armor.requirement).toBe(sampleArmor.requirement);
            expect(armor.duration).toBe(sampleArmor.duration);
        },
    },
});
