import type { ArtifactoryFilters } from "../models/artifact/ArtifactoryFilters";
import type { FullArtifact } from "../models/artifact/FullArtifact";
import type { SmallArtifact } from "../models/artifact/SmallArtifact";
import type { Repository } from "./Repository";

export interface Artifactory extends Repository<SmallArtifact, FullArtifact, ArtifactoryFilters> {}
