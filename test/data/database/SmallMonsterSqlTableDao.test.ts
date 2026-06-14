import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SmallMonsterSqlTableDao } from '../../../src/data/database/SmallMonsterSqlTableDao';
import type { SmallMonster } from '../../../src/domain/models/monster/SmallMonster';
import type { BestiaryFilters } from '../../../src/domain/models/monster/BestiaryFilters';
import { runSqlDaoBaseTests } from './Dao';
import { mockApp, mockDatabase, mockManifest } from '../../__mocks__/data';

const sampleMonster: SmallMonster = {
    name: { rus: 'Гоблин', eng: 'Goblin' },
    type: 'Гуманоид',
    challengeRating: '1/4',
    url: 'https://example.com/goblin',
    source: {
        shortName: 'MM',
        name: 'Monster Manual',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: BestiaryFilters = {
    types: ['Гуманоид'],
    challengeRatings: ['1/4'],
    sources: ['MM'],
};

runSqlDaoBaseTests<SmallMonster, BestiaryFilters>({
    title: 'SmallMonsterSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallMonsterSqlTableDao(db, app, manifest),
    sample: sampleMonster,
    filters: filters,
    expected: {
        table: 'small_bestiary',
        fill: false,
        whereClausesCount: 3,
        filterParams: ['Гуманоид', '1/4', 'MM'],
    },
    mutate: (monster) => ({
        ...monster,
        name: { ...monster.name, rus: 'Гоблин-воин' }
    }),
    mapCase: {
        sqlValues: [
            1,
            sampleMonster.name.rus,
            sampleMonster.name.eng,
            sampleMonster.type,
            sampleMonster.challengeRating,
            sampleMonster.url,
            sampleMonster.source.shortName,
            sampleMonster.source.name,
            sampleMonster.source.group.name,
            sampleMonster.source.group.shortName,
            sampleMonster.source.homebrew,
        ],
        assert: (monster) => {
            expect(monster.name.rus).toBe(sampleMonster.name.rus);
            expect(monster.name.eng).toBe(sampleMonster.name.eng);
            expect(monster.type).toBe(sampleMonster.type);
            expect(monster.challengeRating).toBe(sampleMonster.challengeRating);
            expect(monster.url).toBe(sampleMonster.url);
            expect(monster.source.shortName).toBe(sampleMonster.source.shortName);
            expect(monster.source.name).toBe(sampleMonster.source.name);
            expect(monster.source.group.name).toBe(sampleMonster.source.group.name);
            expect(monster.source.group.shortName).toBe(sampleMonster.source.group.shortName);
            expect(monster.source.homebrew).toBe(sampleMonster.source.homebrew);
        }
    }
});

describe('SmallMonsterSqlTableDao structured type persistence', () => {
    let dao: SmallMonsterSqlTableDao;

    beforeEach(() => {
        vi.clearAllMocks();
        dao = new SmallMonsterSqlTableDao(mockDatabase as any, mockApp as any, mockManifest as any);
    });

    it('binds the type name when creating a monster with structured type data', async () => {
        vi.spyOn(dao, 'checkItemExists').mockResolvedValue(false);

        await dao.createItem({
            ...sampleMonster,
            type: { name: 'Гуманоид' },
        });

        const insertCall = (mockDatabase.exec as any).mock.calls.find(
            ([sql]: [string]) => sql.includes('INSERT INTO small_bestiary')
        );
        expect(insertCall[1][2]).toBe('Гуманоид');
    });

    it('binds the type name when updating a monster with structured type data', async () => {
        await dao.updateItem({
            ...sampleMonster,
            type: { name: 'Гуманоид' },
        });

        const updateCall = (mockDatabase.exec as any).mock.calls.find(
            ([sql]: [string]) => sql.includes('UPDATE small_bestiary SET')
        );
        expect(updateCall[1][2]).toBe('Гуманоид');
    });
});
