import { expect } from 'vitest';
import { SmallArmorSqlTableDao } from '../../src/data/databse/SmallArmorSqlTableDao';
import type { SmallArmor } from './../../src/domain/models/armor/SmallArmor';
import type { ArmoryFilters } from './../../src/domain/models/armor/ArmoryFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleArmor: SmallArmor = {
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
};

const filters: ArmoryFilters = {
    types: ['Medium', 'Heavy'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<SmallArmor, ArmoryFilters>({
    title: 'SmallArmorSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallArmorSqlTableDao(db, app, manifest),
    sample: sampleArmor,
    filters: filters,
    expected: {
        table: 'small_armory',
        whereClausesCount: 2,
        filterParams: ['Medium', 'Heavy', 'PHB'],
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
        },
    },
});
