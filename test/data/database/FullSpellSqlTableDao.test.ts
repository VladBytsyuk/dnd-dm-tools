import { expect } from 'vitest';
import { FullSpellSqlTableDao } from '../../../src/data/databse/FullSpellSqlTableDao';
import type { FullSpell } from '../../../src/domain/models/spell/FullSpell';
import type { SpellbookFilters } from '../../../src/domain/models/spell/SpellbookFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleSpell: FullSpell = {
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
    range: "30 ft.",
    duration: "Instantaneous",
    time: "1 action",
    concentration: false,
    ritual: false,
    classes: [ { name: "Wizard", url: "https://example.com/wizard", class: "full" } ],
    subclasses: [ { name: "School of Evocation", url: "https://example.com/evocation", class: "subclass" } ],
    description: "A bright streak flashes from your pointing finger to a point you choose within range",
    upper: "At Higher Levels: When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
};

const filters: SpellbookFilters = {
    levels: [3],
    schools: ['Evocation'],
    sources: ['PHB'],
};

runSqlDaoBaseTests<FullSpell, SpellbookFilters>({
    title: 'FullSpellSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullSpellSqlTableDao(db),
    sample: sampleSpell,
    filters: filters,
    expected: {
        table: 'full_spellbook',
        whereClausesCount: 0,
        filterParams: [],
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
            sampleSpell.additionalType || null,
            sampleSpell.components.v ? 1 : 0,
            sampleSpell.components.s ? 1 : 0,
            sampleSpell.components.m || null,
            sampleSpell.url,
            sampleSpell.source?.shortName || null,
            sampleSpell.source?.name || null,
            sampleSpell.source?.group.name || null,
            sampleSpell.source?.group.shortName || null,
            sampleSpell.concentration ? 1 : 0,
            sampleSpell.ritual ? 1 : 0,
            sampleSpell.source.homebrew ? 1 : 0,
            sampleSpell.range,
            sampleSpell.duration,
            sampleSpell.time,
            JSON.stringify(sampleSpell.classes ?? []),
            JSON.stringify(sampleSpell.subclasses ?? []),
            sampleSpell.description,
            sampleSpell.upper ?? null,
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(sampleSpell.name.rus);
            expect(item.name.eng).toStrictEqual(sampleSpell.name.eng);
            expect(item.level).toStrictEqual(sampleSpell.level);
            expect(item.school).toStrictEqual(sampleSpell.school);
            expect(item.additionalType).toStrictEqual(sampleSpell.additionalType);
            expect(item.components.v).toStrictEqual(sampleSpell.components.v);
            expect(item.components.s).toStrictEqual(sampleSpell.components.s);
            expect(item.components.m).toStrictEqual(sampleSpell.components.m);
            expect(item.url).toStrictEqual(sampleSpell.url);
            expect(item.source.shortName).toStrictEqual(sampleSpell.source.shortName);
            expect(item.source.name).toStrictEqual(sampleSpell.source.name);
            expect(item.source.group.name).toStrictEqual(sampleSpell.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(sampleSpell.source.group.shortName);
            expect(item.concentration).toStrictEqual(sampleSpell.concentration);
            expect(item.ritual).toStrictEqual(sampleSpell.ritual);
            expect(item.source.homebrew).toStrictEqual(sampleSpell.source.homebrew);
            expect(item.range).toStrictEqual(sampleSpell.range);
            expect(item.duration).toStrictEqual(sampleSpell.duration);
            expect(item.time).toStrictEqual(sampleSpell.time);
            expect(item.classes).toStrictEqual(sampleSpell.classes);
            expect(item.subclasses).toStrictEqual(sampleSpell.subclasses);
            expect(item.description).toStrictEqual(sampleSpell.description);
            expect(item.upper).toStrictEqual(sampleSpell.upper);
        },
    },
});