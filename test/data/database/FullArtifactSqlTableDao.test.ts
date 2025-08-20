import { expect } from 'vitest';
import { FullArtifactSqlTableDao } from '../../../src/data/databse/FullArtifactSqlTableDao';
import type { FullArtifact } from '../../../src/domain/models/artifact/FullArtifact';
import type { ArtifactoryFilters } from '../../../src/domain/models/artifact/ArtifactoryFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleArtifact: FullArtifact = {
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
    description: 'Волшебныйы артефакт, который обладает особыми свойствами.',
    detailType: [ { name: 'кольцо', type: 'wear', url: 'https://example.com/wear' } ],
    cost: {
        dmg: '100gp',
        xge: '150gp',
    },
    images: ['httpss://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    detailCustomization: ['Customizable detail 1', 'Customizable detail 2'],
};

const filters: ArtifactoryFilters = {
    types: ['Wondrous Item'],
    sources: ['PHB'],
    rarities: ['common'],
};

runSqlDaoBaseTests<FullArtifact, any>({
    title: 'FullArtifactSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullArtifactSqlTableDao(db),
    sample: sampleArtifact,
    filters: filters,
    expected: {
        table: 'full_artifactory',
        whereClausesCount: 0,
        filterParams: [],
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
            sampleArtifact.customization ? 1 : 0,
            sampleArtifact.source.shortName,
            sampleArtifact.source.name,
            sampleArtifact.source.group.name,
            sampleArtifact.source.group.shortName,
            sampleArtifact.source.homebrew,
            sampleArtifact.description,
            JSON.stringify(sampleArtifact.detailType),
            sampleArtifact.cost?.dmg,
            sampleArtifact.cost?.xge,
            JSON.stringify(sampleArtifact.images),
            JSON.stringify(sampleArtifact.detailCustomization),
        ],
        assert: (artifact) => {
            expect(artifact.name.rus).toStrictEqual(sampleArtifact.name.rus);
            expect(artifact.name.eng).toStrictEqual(sampleArtifact.name.eng);
            expect(artifact.type.name).toStrictEqual(sampleArtifact.type.name);
            expect(artifact.type.order).toStrictEqual(sampleArtifact.type.order);
            expect(artifact.price.dmg).toStrictEqual(sampleArtifact.price.dmg);
            expect(artifact.price.xge).toStrictEqual(sampleArtifact.price.xge);
            expect(artifact.rarity.type).toStrictEqual(sampleArtifact.rarity.type);
            expect(artifact.rarity.name).toStrictEqual(sampleArtifact.rarity.name);
            expect(artifact.rarity.short).toStrictEqual(sampleArtifact.rarity.short);
            expect(artifact.customization).toStrictEqual(sampleArtifact.customization);
            expect(artifact.source.shortName).toStrictEqual(sampleArtifact.source.shortName);
            expect(artifact.source.name).toStrictEqual(sampleArtifact.source.name);
            expect(artifact.source.group.name).toStrictEqual(sampleArtifact.source.group.name);
            expect(artifact.source.group.shortName).toStrictEqual(sampleArtifact.source.group.shortName);
            expect(artifact.source.homebrew).toStrictEqual(sampleArtifact.source.homebrew);
            expect(artifact.description).toStrictEqual(sampleArtifact.description);
            expect(artifact.detailType).toStrictEqual(sampleArtifact.detailType);
            expect(artifact.cost?.dmg).toStrictEqual(sampleArtifact.cost?.dmg);
            expect(artifact.cost?.xge).toStrictEqual(sampleArtifact.cost?.xge);
            expect(artifact.images).toStrictEqual(sampleArtifact.images);
            expect(artifact.detailCustomization).toStrictEqual(sampleArtifact.detailCustomization);
        },
    },
});
