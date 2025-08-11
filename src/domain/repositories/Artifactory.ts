import type { ArtifactFilters } from "../models/artifact/ArtifactFilters";
import type { FullArtifact } from "../models/artifact/FullArtifact";
import type { SmallArtifact } from "../models/artifact/SmallArtifact";
import type { Repository } from "./Repository";

export interface Artifactory extends Repository<SmallArtifact, FullArtifact, ArtifactFilters> {}
