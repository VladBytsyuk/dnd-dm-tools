import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import initSqlJs from 'sql.js';
import { FullBackgroundSqlTableDao } from '../../../src/data/database/FullBackgroundSqlTableDao';
import type { FullBackground } from '../../../src/domain/models/background/FullBackground';
import type { BackgroundsFilters } from '../../../src/domain/models/background/BackgroundsFilters';
import { runSqlDaoBaseTests } from './Dao';
import { fullBackgroundGolgariAgent } from '../../__mocks__/domain/models/background/full_background_items';
import { backgroundsFilters } from '../../__mocks__/domain/models/background/small_background_items';

runSqlDaoBaseTests<FullBackground, any>({
    title: 'Dao: Backgrounds full',
    daoFactory: ({ app, db, manifest }) => new FullBackgroundSqlTableDao(db),
    sample: fullBackgroundGolgariAgent,
    filters: backgroundsFilters,
    expected: {
        table: 'full_backgrounds',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (b) => ({ ...b, source: { ...b.source, homebrew: false } }),
    mapCase: {
        sqlValues: [
            1,
            fullBackgroundGolgariAgent.name.rus,
            fullBackgroundGolgariAgent.name.eng,
            fullBackgroundGolgariAgent.url,
            fullBackgroundGolgariAgent.associatedUrl,
            fullBackgroundGolgariAgent.associatedHtml,
            fullBackgroundGolgariAgent.source.shortName,
            fullBackgroundGolgariAgent.source.name,
            fullBackgroundGolgariAgent.source.group.name,
            fullBackgroundGolgariAgent.source.group.shortName,
            fullBackgroundGolgariAgent.source.homebrew ? 1 : 0,
            JSON.stringify(fullBackgroundGolgariAgent.skills),
            fullBackgroundGolgariAgent.toolOwnership,
            JSON.stringify(fullBackgroundGolgariAgent.equipments),
            fullBackgroundGolgariAgent.startGold,
            fullBackgroundGolgariAgent.description,
            fullBackgroundGolgariAgent.personalization,
            'Один на ваш выбор',
            'Особенность',
            '<p>Текст особенности.</p>',
            JSON.stringify([{ type: 'TRAIT', name: 'Черта характера', formula: 'к8', thead: ['Черта характера'], tbody: [['1', 'Пример']] }]),
        ],
        assert: (background) => {
            expect(background.name.rus).toStrictEqual(fullBackgroundGolgariAgent.name.rus);
            expect(background.name.eng).toStrictEqual(fullBackgroundGolgariAgent.name.eng);
            expect(background.url).toStrictEqual(fullBackgroundGolgariAgent.url);
            expect(background.associatedUrl).toStrictEqual(fullBackgroundGolgariAgent.associatedUrl);
            expect(background.associatedHtml).toStrictEqual(fullBackgroundGolgariAgent.associatedHtml);
            expect(background.source.shortName).toStrictEqual(fullBackgroundGolgariAgent.source.shortName);
            expect(background.source.name).toStrictEqual(fullBackgroundGolgariAgent.source.name);
            expect(background.source.group.name).toStrictEqual(fullBackgroundGolgariAgent.source.group.name);
            expect(background.source.group.shortName).toStrictEqual(fullBackgroundGolgariAgent.source.group.shortName);
            expect(background.source.homebrew).toStrictEqual(Boolean(fullBackgroundGolgariAgent.source.homebrew));
            expect(background.skills).toStrictEqual(fullBackgroundGolgariAgent.skills);
            expect(background.toolOwnership).toStrictEqual(fullBackgroundGolgariAgent.toolOwnership);
            expect(background.equipments).toStrictEqual(fullBackgroundGolgariAgent.equipments);
            expect(background.startGold).toStrictEqual(fullBackgroundGolgariAgent.startGold);
            expect(background.description).toStrictEqual(fullBackgroundGolgariAgent.description);
            expect(background.personalization).toStrictEqual(fullBackgroundGolgariAgent.personalization);
            expect(background.language).toBe('Один на ваш выбор');
            expect(background.skillName).toBe('Особенность');
            expect(background.skillDescription).toBe('<p>Текст особенности.</p>');
            expect(background.personalizationTables).toEqual([{ type: 'TRAIT', name: 'Черта характера', formula: 'к8', thead: ['Черта характера'], tbody: [['1', 'Пример']] }]);
        },
    },
});

describe('Dao: Background detail fields', () => {
    const wasmBinary = readFileSync(resolve('node_modules/sql.js/dist/sql-wasm.wasm'));

    it('persists the feature, language, and personalization tables', async () => {
        const SQL = await initSqlJs({ wasmBinary });
        const db = new SQL.Database();
        const dao = new FullBackgroundSqlTableDao(db);
        await dao.createTable();
        const item: FullBackground = {
            ...fullBackgroundGolgariAgent,
            language: 'Один на ваш выбор',
            skillName: 'Привилегированность',
            skillDescription: '<p>Описание особенности</p>',
            personalizationTables: [{ type: 'TRAIT', name: 'Черта характера', formula: 'к8', thead: ['Черта характера'], tbody: [['1', '<strong>Пример</strong>']] }],
        };

        await dao.createItem(item);
        const loaded = await dao.readItemByUrl(item.url);
        expect(loaded).toMatchObject({
            language: item.language,
            skillName: item.skillName,
            skillDescription: item.skillDescription,
            personalizationTables: item.personalizationTables,
        });
        db.close();
    });

    it('refreshes old remote details while preserving manual entries', async () => {
        const SQL = await initSqlJs({ wasmBinary });
        const db = new SQL.Database();
        db.exec("CREATE TABLE full_backgrounds (url TEXT); INSERT INTO full_backgrounds VALUES ('/backgrounds/noble'), ('/backgrounds/custom');");
        db.exec("CREATE TABLE entity_origins (entity_kind TEXT, url TEXT, origin TEXT); INSERT INTO entity_origins VALUES ('backgrounds', '/backgrounds/custom', 'manual');");
        const dao = new FullBackgroundSqlTableDao(db);

        dao.ensureDetailColumns();

        expect(db.exec('SELECT url FROM full_backgrounds')[0].values).toEqual([['/backgrounds/custom']]);
        expect(db.exec('PRAGMA table_info(full_backgrounds)')[0].values.map((column) => column[1])).toContain('personalization_tables');
        db.close();
    });
});
