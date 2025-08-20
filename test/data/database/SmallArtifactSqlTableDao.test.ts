import { expect } from 'vitest';
import { SmallArtifactSqlTableDao } from '../../../src/data/databse/SmallArtifactSqlTableDao';
import type { SmallArtifact } from '../../../src/domain/models/artifact/SmallArtifact';
import type { ArtifactoryFilters } from '../../../src/domain/models/artifact/ArtifactoryFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleArtifact: SmallArtifact = {
    name: { rus: 'Маленький артефакт', eng: 'Small Artifact' },
    type: { name: 'Wondrous Item', order: 1 },
    url: 'https://example.com/small-artifact',
    price: {
        dmg: '100gp',
        xge: '150gp',
    },
    rarity: {
        type: 'common',
        name: 'Common',
        short: 'C',
    },
    customization: true,
    source: {
        shortName: 'PHB',
        name: 'Player Handbook',
        group: { name: 'Core', shortName: 'C' },
        homebrew: false,
    },
};

const filters: ArtifactoryFilters = {
    types: ['Wondrous Item'],
    sources: ['PHB'],
    rarities: ['common'],
};

runSqlDaoBaseTests<SmallArtifact, ArtifactoryFilters>({
    title: 'SmallArtifactSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new SmallArtifactSqlTableDao(db, app, manifest),
    sample: sampleArtifact,
    filters: filters,
    expected: {
        table: 'small_artifactory',
        whereClausesCount: 3,
        filterParams: ['Wondrous Item', 'PHB', 'common'],
    },
    mutate: (a) => ({ ...a, customization: false }),
    mapCase: {
        sqlValues: [
            1,
            sampleArtifact.name.rus,
            sampleArtifact.name.eng,
            sampleArtifact.type.name,
            sampleArtifact.type.order,
            sampleArtifact.url,
            sampleArtifact.price.dmg,
            sampleArtifact.price.xge,
            sampleArtifact.rarity.type,
            sampleArtifact.rarity.name,
            sampleArtifact.rarity.short,
            sampleArtifact.customization,
            sampleArtifact.source.shortName,
            sampleArtifact.source.name,
            sampleArtifact.source.group.name,
            sampleArtifact.source.group.shortName,
            sampleArtifact.source.homebrew,
        ],
        assert: (artifact) => {
            expect(artifact.name.rus).toBe(sampleArtifact.name.rus);
            expect(artifact.name.eng).toBe(sampleArtifact.name.eng);
            expect(artifact.type.name).toBe(sampleArtifact.type.name);
            expect(artifact.type.order).toBe(sampleArtifact.type.order);
            expect(artifact.price.dmg).toBe(sampleArtifact.price.dmg);
            expect(artifact.price.xge).toBe(sampleArtifact.price.xge);
            expect(artifact.rarity.type).toBe(sampleArtifact.rarity.type);
            expect(artifact.rarity.name).toBe(sampleArtifact.rarity.name);
            expect(artifact.rarity.short).toBe(sampleArtifact.rarity.short);
            expect(artifact.customization).toBe(sampleArtifact.customization);
            expect(artifact.source.shortName).toBe(sampleArtifact.source.shortName);
            expect(artifact.source.name).toBe(sampleArtifact.source.name);
            expect(artifact.source.group.name).toBe(sampleArtifact.source.group.name);
            expect(artifact.source.group.shortName).toBe(sampleArtifact.source.group.shortName);
            expect(artifact.source.homebrew).toBe(sampleArtifact.source.homebrew);
        },
    },
});
