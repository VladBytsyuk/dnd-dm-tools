import { expect } from 'vitest';
import { SmallFeatSqlTableDao } from '../../../src/data/databse/SmallFeatSqlTableDao';
import type { SmallFeat } from '../../../src/domain/models/feat/SmallFeat';
import type { FeatsFilters } from '../../../src/domain/models/feat/FeatsFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleFeat: SmallFeat = {
    name: { rus: 'Вдохновляющий лидер', eng: 'Inspiring Leader' },
    requirements: 'Харизма 13 или выше',
    url: 'https://example.com/inspiring-leader',
    source: {
        shortName: 'PHB',
        name: 'Player\'s Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: FeatsFilters = {
    sources: ['PHB'],
};

runSqlDaoBaseTests<SmallFeat, FeatsFilters>({
    title: 'SmallFeatSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallFeatSqlTableDao(db, app, manifest),
    sample: sampleFeat,
    filters: filters,
    expected: {
        table: 'small_feats',
        fill: true,
        whereClausesCount: 1,
        filterParams: ['PHB'],
    },
    mutate: (feat) => ({
        ...feat,
        name: { ...feat.name, rus: 'Новое название' }
    }),
    mapCase: {
        sqlValues: [
            1,
            sampleFeat.name.rus,
            sampleFeat.name.eng,
            sampleFeat.requirements,
            sampleFeat.url,
            sampleFeat.source.shortName,
            sampleFeat.source.name,
            sampleFeat.source.group.name,
            sampleFeat.source.group.shortName,
            sampleFeat.source.homebrew,
        ],
        assert: (feat) => {
            expect(feat.name.rus).toBe(sampleFeat.name.rus);
            expect(feat.name.eng).toBe(sampleFeat.name.eng);
            expect(feat.requirements).toBe(sampleFeat.requirements);
            expect(feat.url).toBe(sampleFeat.url);
            expect(feat.source.shortName).toBe(sampleFeat.source.shortName);
            expect(feat.source.name).toBe(sampleFeat.source.name);
            expect(feat.source.group.name).toBe(sampleFeat.source.group.name);
            expect(feat.source.group.shortName).toBe(sampleFeat.source.group.shortName);
            expect(feat.source.homebrew).toBe(sampleFeat.source.homebrew);
        }
    }
});
