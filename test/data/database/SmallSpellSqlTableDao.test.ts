import { expect } from 'vitest';
import { SmallSpellSqlTableDao } from '../../../src/data/database/SmallSpellSqlTableDao';
import type { SmallSpell } from '../../../src/domain/models/spell/SmallSpell';
import type { SpellbookFilters } from '../../../src/domain/models/spell/SpellbookFilters';
import { runSqlDaoBaseTests } from './Dao';
import { spellbookFilters, smallSpellWish } from '../../__mocks__/domain/models/spell/small_spell_items';

runSqlDaoBaseTests<SmallSpell, SpellbookFilters>({
    title: 'Dao: Spellbook small',
    daoFactory: ({ app, db, manifest }) => new SmallSpellSqlTableDao(db, app, manifest),
    sample: smallSpellWish,
    filters: spellbookFilters,
    expected: {
        table: 'small_spellbook',
        fill: true,
        whereClausesCount: 3,
        filterParams: [3, 5, 9, "воплощение", "преобразование", "вызов", "PHB"],
    },
    mutate: (item) => ({
        ...item,
        name: { ...item.name, rus: 'Огненный шар (усиленный)' }
    }),
    mapCase: {
        sqlValues: [
            1,
            smallSpellWish.name.rus,
            smallSpellWish.name.eng,
            smallSpellWish.level,
            smallSpellWish.school,
            smallSpellWish.additionalType,
            smallSpellWish.components.v,
            smallSpellWish.components.s,
            smallSpellWish.components.m,
            smallSpellWish.url,
            smallSpellWish.source.shortName,
            smallSpellWish.source.name,
            smallSpellWish.source.group.name,
            smallSpellWish.source.group.shortName,
            smallSpellWish.concentration ? 1 : 0,
            smallSpellWish.ritual ? 1 : 0,
            smallSpellWish.source.homebrew,
        ],
        assert: (item) => {
            expect(item.name.rus).toStrictEqual(smallSpellWish.name.rus);
            expect(item.name.eng).toStrictEqual(smallSpellWish.name.eng);
            expect(item.level).toStrictEqual(smallSpellWish.level);
            expect(item.school).toStrictEqual(smallSpellWish.school);
            expect(item.additionalType).toStrictEqual(smallSpellWish.additionalType);
            expect(item.components.v).toStrictEqual(smallSpellWish.components.v);
            expect(item.components.s).toStrictEqual(smallSpellWish.components.s);
            expect(item.components.m).toStrictEqual(smallSpellWish.components.m);
            expect(item.url).toStrictEqual(smallSpellWish.url);
            expect(item.source.shortName).toStrictEqual(smallSpellWish.source.shortName);
            expect(item.source.name).toStrictEqual(smallSpellWish.source.name);
            expect(item.source.group.name).toStrictEqual(smallSpellWish.source.group.name);
            expect(item.source.group.shortName).toStrictEqual(smallSpellWish.source.group.shortName);
            expect(item.concentration).toStrictEqual(smallSpellWish.concentration);
            expect(item.ritual).toStrictEqual(smallSpellWish.ritual);
            expect(item.source.homebrew).toStrictEqual(smallSpellWish.source.homebrew);
        },
    },
});
