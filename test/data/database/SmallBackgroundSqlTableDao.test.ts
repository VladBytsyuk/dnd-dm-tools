import { expect } from 'vitest';
import { SmallBackgroundSqlTableDao } from '../../../src/data/database/SmallBackgroundSqlTableDao';
import type { SmallBackground } from '../../../src/domain/models/background/SmallBackground';
import type { BackgroundsFilters } from '../../../src/domain/models/background/BackgroundsFilters';
import { runSqlDaoBaseTests } from './Dao';
import { backgroundsFilters, smallBackgroundGolgariAgent } from '../../__mocks__/domain/models/background/small_background_items';

runSqlDaoBaseTests<SmallBackground, BackgroundsFilters>({
    title: 'Dao: Backgrounds small',
    daoFactory: ({ app, db, manifest }) => new SmallBackgroundSqlTableDao(db, app, manifest),
    sample: smallBackgroundGolgariAgent,
    filters: backgroundsFilters,
    expected: {
        table: 'small_backgrounds',
        fill: true,
        whereClausesCount: 1,
        filterParams: ["GGR", "ToH", "ADLA"],
    },
    mutate: (b) => ({ ...b, source: { ...b.source, homebrew: false } }),
    mapCase: {
        sqlValues: [
            1,
            smallBackgroundGolgariAgent.name.rus,
            smallBackgroundGolgariAgent.name.eng,
            smallBackgroundGolgariAgent.url,
            smallBackgroundGolgariAgent.source.shortName,
            smallBackgroundGolgariAgent.source.name,
            smallBackgroundGolgariAgent.source.group.name,
            smallBackgroundGolgariAgent.source.group.shortName,
            smallBackgroundGolgariAgent.source.homebrew ? 1 : 0,
        ],
        assert: (background) => {
            expect(background.name.rus).toStrictEqual(smallBackgroundGolgariAgent.name.rus);
            expect(background.name.eng).toStrictEqual(smallBackgroundGolgariAgent.name.eng);
            expect(background.url).toStrictEqual(smallBackgroundGolgariAgent.url);
            expect(background.source.shortName).toStrictEqual(smallBackgroundGolgariAgent.source.shortName);
            expect(background.source.name).toStrictEqual(smallBackgroundGolgariAgent.source.name);
            expect(background.source.group.name).toStrictEqual(smallBackgroundGolgariAgent.source.group.name);
            expect(background.source.group.shortName).toStrictEqual(smallBackgroundGolgariAgent.source.group.shortName);
            expect(background.source.homebrew).toStrictEqual(Boolean(smallBackgroundGolgariAgent.source.homebrew));
        },
    },
});