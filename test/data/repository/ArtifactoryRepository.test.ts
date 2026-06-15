import { ArtifactoryRepository } from "../../../src/data/repositories/ArtifactoryRepository";
import type { SmallArtifact } from "../../../src/domain/models/artifact/SmallArtifact";
import type { FullArtifact } from "../../../src/domain/models/artifact/FullArtifact";
import type { ArtifactoryFilters } from "../../../src/domain/models/artifact/ArtifactoryFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { artifactoryFilters, smallArtifactAmulet, smallArtifactSphere, smallArtifactWand } from "../../__mocks__/domain/models/artifact/small_artifact_items";
import { fullArtifactAmulet, fullArtifactSphere, fullArtifactWand } from "../../__mocks__/domain/models/artifact/full_artifact_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import { describe, expect, it, vi } from "vitest";

runBaseRepositoryTests<SmallArtifact, FullArtifact, ArtifactoryFilters>({
    title: 'Repository: Arsenal',
    repoFactory: () => new ArtifactoryRepository(
        mockDatabase(
            [smallArtifactAmulet, smallArtifactSphere, smallArtifactWand],
            [fullArtifactAmulet, fullArtifactSphere, fullArtifactWand],
        )
    ),
    expectedAllFilters: artifactoryFilters,
    expectedAllSmallItems: [smallArtifactAmulet, smallArtifactSphere, smallArtifactWand],
    expectedFilteredByNameItems: {
        name: 'Амулет тёмного осколка',
        smallItems: [smallArtifactAmulet],
    },
    expectedSmallItemNames: ['Амулет тёмного осколка', 'Раскалывающая сфера Донжона', 'Палочка Оркуса'],
    expectedFullItemByName: {
        name: 'Раскалывающая сфера Донжона',
        item: fullArtifactSphere as FullArtifact,
    },
    expectedFullItemByUrl: {
        url: '/items/magic/wand_of_orcus',
        item: fullArtifactWand as FullArtifact,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallArtifactWand as SmallArtifact,
        fullItem: fullArtifactWand as FullArtifact,
    }
});

describe("ArtifactoryRepository pagination", () => {
    it("does not preload all artifacts during initialization", async () => {
        const database = mockDatabase(
            [smallArtifactAmulet, smallArtifactSphere, smallArtifactWand],
            [fullArtifactAmulet, fullArtifactSphere, fullArtifactWand],
        );
        const readAllSpy = vi.spyOn(database.smallArtifactDao, "readAllItems");
        const repository = new ArtifactoryRepository(database);

        await repository.initialize();

        expect(readAllSpy).not.toHaveBeenCalled();
    });

    it("returns the requested artifact page", async () => {
        const repository = new ArtifactoryRepository(mockDatabase(
            [smallArtifactAmulet, smallArtifactSphere, smallArtifactWand],
            [fullArtifactAmulet, fullArtifactSphere, fullArtifactWand],
        ));

        await expect(repository.getSmallItemsPage(null, { offset: 2, limit: 1 })).resolves.toEqual({
            items: [smallArtifactWand],
            hasMore: false,
        });
    });
});
