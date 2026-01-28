import { expect } from 'vitest';
import { FullFeatSqlTableDao } from '../../../src/data/database/FullFeatSqlTableDao';
import type { FullFeat } from '../../../src/domain/models/feat/FullFeat';
import { runSqlDaoBaseTests } from './Dao';

const sampleFeat: FullFeat = {
    name: { rus: 'Вдохновляющий лидер', eng: 'Inspiring Leader' },
    requirements: 'Харизма 13 или выше',
    url: 'https://example.com/inspiring-leader',
    source: {
        shortName: 'PHB',
        name: 'Player\'s Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
    description: 'Description of the feat',
};

runSqlDaoBaseTests<FullFeat, any>({
    title: 'FullFeatSqlTableDao',
    daoFactory: ({ db }) => new FullFeatSqlTableDao(db),
    sample: sampleFeat,
    filters: {},
    expected: {
        table: 'full_feats',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
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
            sampleFeat.description,
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
            expect(feat.description).toBe(sampleFeat.description);
        }
    }
});
