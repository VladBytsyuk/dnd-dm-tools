import { expect } from 'vitest';
import { SmallSpellSqlTableDao } from '../../../src/data/databse/SmallSpellSqlTableDao';
import type { SmallSpell } from '../../../src/domain/models/spell/SmallSpell';
import type { SpellbookFilters } from '../../../src/domain/models/spell/SpellbookFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleSpell: SmallSpell = {
    name: { rus: 'Огненный шар', eng: 'Fireball' },
    level: 3,
    school: 'Evocation',
    url: 'https://example.com/fireball',
    components: {
        v: true,
        s: true,
        m: "falcon feather",
    },
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: SpellbookFilters = {
    levels: [3],
    schools: ['Evocation'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<SmallSpell, SpellbookFilters>({
    title: 'SmallSpellSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallSpellSqlTableDao(db, app, manifest),
    sample: sampleSpell,
    filters: filters,
    expected: {
        table: 'small_spellbook',
        fill: true,
        whereClausesCount: 3,
        filterParams: [3, 'Evocation', 'PHB'],
    },
    mutate: (item) => ({
        ...item,
        name: { ...item.name, rus: 'Огненный шар (усиленный)' }
    }),
    mapCase: {
        sqlValues: [
            1,
            sampleSpell.name.rus,
            sampleSpell.name.eng,
            sampleSpell.level,
            sampleSpell.school,
            sampleSpell.additionalType,
            sampleSpell.components.v,
            sampleSpell.components.s,
            sampleSpell.components.m,
            sampleSpell.url,
            sampleSpell.source.shortName,
            sampleSpell.source.name,
            sampleSpell.source.group.name,
            sampleSpell.source.group.shortName,
            sampleSpell.concentration ? 1 : 0,
            sampleSpell.ritual ? 1 : 0,
            sampleSpell.source.homebrew,
        ],
        assert: (item) => {
            expect(item.name.rus).toBe(sampleSpell.name.rus);
            expect(item.name.eng).toBe(sampleSpell.name.eng);
            expect(item.level).toBe(sampleSpell.level);
            expect(item.school).toBe(sampleSpell.school);
            expect(item.additionalType).toBe(sampleSpell.additionalType);
            expect(item.components.v).toBe(sampleSpell.components.v);
            expect(item.components.s).toBe(sampleSpell.components.s);
            expect(item.components.m).toBe(sampleSpell.components.m);
            expect(item.url).toBe(sampleSpell.url);
            expect(item.source.shortName).toBe(sampleSpell.source.shortName);
            expect(item.source.name).toBe(sampleSpell.source.name);
            expect(item.source.group.name).toBe(sampleSpell.source.group.name);
            expect(item.source.group.shortName).toBe(sampleSpell.source.group.shortName);
            expect(item.concentration).toBe(sampleSpell.concentration);
            expect(item.ritual).toBe(sampleSpell.ritual);
            expect(item.source.homebrew).toBe(sampleSpell.source.homebrew);
        },
    },
});