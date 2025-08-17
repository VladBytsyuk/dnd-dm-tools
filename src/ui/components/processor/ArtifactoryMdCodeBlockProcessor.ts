import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import ArtifactFullUi from "src/ui/layout/artifact/ArtifactFullUi.svelte";

export class ArtifactoryMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallArtifact, FullArtifact, ArtifactoryFilters> {

    getCodeBlockName() { return 'artifact'; }
    getUi() { return ArtifactFullUi; }
}
