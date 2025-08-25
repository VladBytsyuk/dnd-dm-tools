import { expect } from 'vitest';
import { FullBackgroundSqlTableDao } from '../../../src/data/databse/FullBackgroundSqlTableDao';
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
        },
    },
});