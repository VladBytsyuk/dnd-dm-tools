import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import { type ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { Artifactory } from "src/domain/repositories/Artifactory";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";
import { artifactMapper } from "src/data/mappers/sourceMappers";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import {
    createSimpleRepositoryDependencies,
    SimpleRepository,
    type SimpleRepositoryDatabase,
    type SimpleRepositoryDependencies,
} from "./SimpleRepository";
import type { Dao } from "src/domain/Dao";

type ArtifactoryRepositoryDatabase = SimpleRepositoryDatabase & {
    smallArtifactDao: Dao<SmallArtifact, ArtifactoryFilters>;
    fullArtifactDao: Dao<FullArtifact, unknown>;
};

export class ArtifactoryRepository
    extends SimpleRepository<SmallArtifact, FullArtifact, ArtifactoryFilters>
    implements Artifactory {

    constructor(
        dependencies: ArtifactoryRepositoryDatabase
            | SimpleRepositoryDependencies<SmallArtifact, FullArtifact, ArtifactoryFilters>
    ) {
        super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
            dependencies,
            dependencies.smallArtifactDao,
            dependencies.fullArtifactDao,
            artifactMapper,
            smallItemProjectors.artifact,
        ));
    }

    async collectFiltersFromAllItems(allSmallItems: SmallArtifact[]): Promise<ArtifactoryFilters | null> {
        const typesSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();
        const raritiesSet: Set<string> = new Set();
        for (const artifact of allSmallItems) {
            typesSet.add(artifact.type.name);
            raritiesSet.add(artifact.rarity.short);
            sourcesSet.add(artifact.source.shortName + (artifact.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<ArtifactoryFilters>({
            types: Array.from(typesSet),
            sources: sortSources(Array.from(sourcesSet)),
            rarities: Array.from(raritiesSet),
        });
    }

    async groupItems(smallItems: SmallArtifact[]): Promise<Group<SmallArtifact>[]> {
        const names = new Map<string, string>();
        const groups = smallItems.reduce((acc, artifact) => {
            names.set(artifact.rarity.short, this.capitalize(artifact.rarity.name));
            const type = artifact.rarity.short;
            (acc[type] ||= []).push(artifact);
            return acc;
        }, {} as { [key: string]: SmallArtifact[] });

        return Object.entries(groups)
            .sort(([typeA], [typeB]) => this.rarityOrderComparator(typeA, typeB))
            .map(([type, smallArtifacts]) => ({ sort: names.get(type), smallItems: smallArtifacts } as Group<SmallArtifact>));
    }

    private rarityOrderComparator(a: string, b: string): number {
        const order = ["O", "Н", "Р", "OР", "Л", "А", "~"];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    }

    private capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    protected override shouldPreloadSmallItems(): boolean {
        return false;
    }
}
