import { expect } from 'vitest';
import { SmallArtifactSqlTableDao } from '../../../src/data/database/SmallArtifactSqlTableDao';
import type { SmallArtifact } from '../../../src/domain/models/artifact/SmallArtifact';
import type { ArtifactoryFilters } from '../../../src/domain/models/artifact/ArtifactoryFilters';
import { runSqlDaoBaseTests } from './Dao';
import { artifactoryFilters, smallArtifactWand } from '../../__mocks__/domain/models/artifact/small_artifact_items';

runSqlDaoBaseTests<SmallArtifact, ArtifactoryFilters>({
    title: 'Dao: Artifactory small',
    daoFactory: ({ app, db, manifest }) => new SmallArtifactSqlTableDao(db, app, manifest),
    sample: smallArtifactWand,
    filters: artifactoryFilters,
    expected: {
        table: 'small_artifactory',
        fill: true,
        whereClausesCount: 3,
        filterParams: [ "чудесный предмет", "волшебная палочка", "XGE", "BMT", "DMG", "O", "Р", "А" ],
    },
    mutate: (a) => ({ ...a, customization: false }),
    mapCase: {
        sqlValues: [
            1,
            smallArtifactWand.name.rus,
            smallArtifactWand.name.eng,
            smallArtifactWand.type.name,
            smallArtifactWand.type.order,
            smallArtifactWand.url,
            smallArtifactWand.price.dmg,
            smallArtifactWand.price.xge,
            smallArtifactWand.rarity.type,
            smallArtifactWand.rarity.name,
            smallArtifactWand.rarity.short,
            smallArtifactWand.customization,
            smallArtifactWand.source.shortName,
            smallArtifactWand.source.name,
            smallArtifactWand.source.group.name,
            smallArtifactWand.source.group.shortName,
            smallArtifactWand.source.homebrew,
        ],
        assert: (artifact) => {
            expect(artifact.name.rus).toStrictEqual(smallArtifactWand.name.rus);
            expect(artifact.name.eng).toStrictEqual(smallArtifactWand.name.eng);
            expect(artifact.type.name).toStrictEqual(smallArtifactWand.type.name);
            expect(artifact.url).toStrictEqual(smallArtifactWand.url);
            expect(artifact.type.order).toStrictEqual(smallArtifactWand.type.order);
            expect(artifact.price.dmg).toStrictEqual(smallArtifactWand.price.dmg);
            expect(artifact.price.xge).toStrictEqual(smallArtifactWand.price.xge);
            expect(artifact.rarity.type).toStrictEqual(smallArtifactWand.rarity.type);
            expect(artifact.rarity.name).toStrictEqual(smallArtifactWand.rarity.name);
            expect(artifact.rarity.short).toStrictEqual(smallArtifactWand.rarity.short);
            expect(artifact.customization).toStrictEqual(smallArtifactWand.customization);
            expect(artifact.source.shortName).toStrictEqual(smallArtifactWand.source.shortName);
            expect(artifact.source.name).toStrictEqual(smallArtifactWand.source.name);
            expect(artifact.source.group.name).toStrictEqual(smallArtifactWand.source.group.name);
            expect(artifact.source.group.shortName).toStrictEqual(smallArtifactWand.source.group.shortName);
            expect(artifact.source.homebrew).toStrictEqual(smallArtifactWand.source.homebrew);
        },
    },
});
