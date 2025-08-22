import { expect } from 'vitest';
import { FullArtifactSqlTableDao } from '../../../src/data/databse/FullArtifactSqlTableDao';
import type { FullArtifact } from '../../../src/domain/models/artifact/FullArtifact';
import type { ArtifactoryFilters } from '../../../src/domain/models/artifact/ArtifactoryFilters';
import { runSqlDaoBaseTests } from './Dao';
import { fullArtifactWand } from '../../__mocks__/domain/models/artifact/full_artifact_items';
import { artifactoryFilters } from '../../__mocks__/domain/models/artifact/small_artifact_items';

runSqlDaoBaseTests<FullArtifact, any>({
    title: 'Dao: Artifactory full',
    daoFactory: ({ app, db, manifest }) => new FullArtifactSqlTableDao(db),
    sample: fullArtifactWand,
    filters: artifactoryFilters,
    expected: {
        table: 'full_artifactory',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (a) => ({ ...a, customization: false }),
    mapCase: {
        sqlValues: [
            1,
            fullArtifactWand.name.rus,
            fullArtifactWand.name.eng,
            fullArtifactWand.type.name,
            fullArtifactWand.type.order,
            fullArtifactWand.url,
            fullArtifactWand.price.dmg,
            fullArtifactWand.price.xge,
            fullArtifactWand.rarity.type,
            fullArtifactWand.rarity.name,
            fullArtifactWand.rarity.short,
            fullArtifactWand.customization ? 1 : 0,
            fullArtifactWand.source.shortName,
            fullArtifactWand.source.name,
            fullArtifactWand.source.group.name,
            fullArtifactWand.source.group.shortName,
            fullArtifactWand.source.homebrew,
            fullArtifactWand.description,
            JSON.stringify(fullArtifactWand.detailType),
            fullArtifactWand.cost?.dmg,
            fullArtifactWand.cost?.xge,
            JSON.stringify(fullArtifactWand.images),
            JSON.stringify(fullArtifactWand.detailCustomization),
        ],
        assert: (artifact) => {
            expect(artifact.name.rus).toStrictEqual(fullArtifactWand.name.rus);
            expect(artifact.name.eng).toStrictEqual(fullArtifactWand.name.eng);
            expect(artifact.type.name).toStrictEqual(fullArtifactWand.type.name);
            expect(artifact.type.order).toStrictEqual(fullArtifactWand.type.order);
            expect(artifact.price.dmg).toStrictEqual(fullArtifactWand.price.dmg);
            expect(artifact.price.xge).toStrictEqual(fullArtifactWand.price.xge);
            expect(artifact.rarity.type).toStrictEqual(fullArtifactWand.rarity.type);
            expect(artifact.rarity.name).toStrictEqual(fullArtifactWand.rarity.name);
            expect(artifact.rarity.short).toStrictEqual(fullArtifactWand.rarity.short);
            expect(artifact.customization).toStrictEqual(fullArtifactWand.customization);
            expect(artifact.source.shortName).toStrictEqual(fullArtifactWand.source.shortName);
            expect(artifact.source.name).toStrictEqual(fullArtifactWand.source.name);
            expect(artifact.source.group.name).toStrictEqual(fullArtifactWand.source.group.name);
            expect(artifact.source.group.shortName).toStrictEqual(fullArtifactWand.source.group.shortName);
            expect(artifact.source.homebrew).toStrictEqual(fullArtifactWand.source.homebrew);
            expect(artifact.description).toStrictEqual(fullArtifactWand.description);
            expect(artifact.detailType).toStrictEqual(fullArtifactWand.detailType);
            expect(artifact.cost?.dmg).toStrictEqual(fullArtifactWand.cost?.dmg);
            expect(artifact.cost?.xge).toStrictEqual(fullArtifactWand.cost?.xge);
            expect(artifact.images).toStrictEqual(fullArtifactWand.images);
            expect(artifact.detailCustomization).toStrictEqual(fullArtifactWand.detailCustomization);
        },
    },
});
