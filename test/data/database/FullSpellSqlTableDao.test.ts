import { expect } from 'vitest';
import { FullSpellSqlTableDao } from '../../../src/data/databse/FullSpellSqlTableDao';
import type { FullSpell } from '../../../src/domain/models/spell/FullSpell';
import { runSqlDaoBaseTests } from './Dao';
import { spellbookFilters } from '../../__mocks__/domain/models/spell/small_spell_items';
import { fullSpellWish } from '../../__mocks__/domain/models/spell/full_spell_items';

runSqlDaoBaseTests<FullSpell, any>({
    title: 'Dao: Spellbook full',
    daoFactory: ({ app, db, manifest }) => new FullSpellSqlTableDao(db),
    sample: fullSpellWish,
    filters: spellbookFilters,
    expected: {
        table: 'full_spellbook',
        fill: false,
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
            fullSpellWish.name.rus,
            fullSpellWish.name.eng,
            fullSpellWish.level,
            fullSpellWish.school,
            fullSpellWish.additionalType || null,
            fullSpellWish.components.v ? 1 : 0,
            fullSpellWish.components.s ? 1 : 0,
            fullSpellWish.components.m || null,
            fullSpellWish.url,
            fullSpellWish.source?.shortName || null,
            fullSpellWish.source?.name || null,
            fullSpellWish.source?.group.name || null,
            fullSpellWish.source?.group.shortName || null,
            fullSpellWish.concentration ? 1 : 0,
            fullSpellWish.ritual ? 1 : 0,
            fullSpellWish.source.homebrew ? 1 : 0,
            fullSpellWish.range,
            fullSpellWish.duration,
            fullSpellWish.time,
            JSON.stringify(fullSpellWish.classes ?? []),
            JSON.stringify(fullSpellWish.subclasses ?? []),
            fullSpellWish.description,
            fullSpellWish.upper ?? null,
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(fullSpellWish.name.rus);
            expect(item.name.eng).toStrictEqual(fullSpellWish.name.eng);
            expect(item.level).toStrictEqual(fullSpellWish.level);
            expect(item.school).toStrictEqual(fullSpellWish.school);
            expect(item.additionalType).toStrictEqual(fullSpellWish.additionalType);
            expect(item.components.v).toStrictEqual(fullSpellWish.components.v);
            expect(item.components.s).toStrictEqual(fullSpellWish.components.s);
            expect(item.components.m).toStrictEqual(fullSpellWish.components.m);
            expect(item.url).toStrictEqual(fullSpellWish.url);
            expect(item.source.shortName).toStrictEqual(fullSpellWish.source.shortName);
            expect(item.source.name).toStrictEqual(fullSpellWish.source.name);
            expect(item.source.group.name).toStrictEqual(fullSpellWish.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(fullSpellWish.source.group.shortName);
            expect(item.concentration).toStrictEqual(fullSpellWish.concentration);
            expect(item.ritual).toStrictEqual(fullSpellWish.ritual);
            expect(item.source.homebrew).toStrictEqual(fullSpellWish.source.homebrew);
            expect(item.range).toStrictEqual(fullSpellWish.range);
            expect(item.duration).toStrictEqual(fullSpellWish.duration);
            expect(item.time).toStrictEqual(fullSpellWish.time);
            expect(item.classes).toStrictEqual(fullSpellWish.classes);
            expect(item.subclasses).toStrictEqual(fullSpellWish.subclasses);
            expect(item.description).toStrictEqual(fullSpellWish.description);
            expect(item.upper).toStrictEqual(fullSpellWish.upper);
        },
    },
});
