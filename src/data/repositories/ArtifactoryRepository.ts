import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseRepository } from "./BaseRepository";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import { type ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { Artifactory } from "src/domain/repositories/Artifactory";
import type DB from "../databse/DB";
import { createFilters } from "src/domain/models/common/Filters";

export class ArtifactoryRepository
    extends BaseRepository<SmallArtifact, FullArtifact, ArtifactoryFilters>
    implements Artifactory {

    constructor(database: DB) {
        super(
            database,
            database.smallArtifactDao,
            database.fullArtifactDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallArtifact[]): Promise<ArtifactoryFilters | null> {
        let typesSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        let raritiesSet: Set<string> = new Set();
        for (const artifact of allSmallItems) {
            typesSet.add(artifact.type.name);
            raritiesSet.add(artifact.rarity.short);
            sourcesSet.add(artifact.source.shortName + (artifact.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<ArtifactoryFilters>({
            types: Array.from(typesSet), 
            sources: Array.from(sourcesSet),
            rarities: Array.from(raritiesSet),
        });
    }
}
