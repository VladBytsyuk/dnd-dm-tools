import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseRepository } from "./BaseRepository";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import { type ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { Artifactory } from "src/domain/repositories/Artifactory";
import type DB from "../databse/DB";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";

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

    async groupItems(smallItems: SmallArtifact[]): Promise<Group<SmallArtifact>[]> {
        const groups = smallItems.reduce((acc, artifact) => {
            const type = this.capitalize(artifact.rarity.short);
            (acc[type] ||= []).push(artifact);
            return acc;
        }, {} as { [key: string]: SmallArtifact[] });

        return Object.entries(groups)
            .map(([type, smallArtifacts]) => ({ sort: type, smallItems: smallArtifacts } as Group<SmallArtifact>))
            .sort((a, b) => -a.sort.localeCompare(b.sort));
    }

    private capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
