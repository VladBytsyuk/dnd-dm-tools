import type { SmallArtifact } from '../../domain/models/artifact/SmallArtifact';
import { baseArtifactsPart1 } from './artifacts-part-1';
import { baseArtifactsPart2 } from './artifacts-part-2';

export const baseArtifacts: SmallArtifact[] = [...baseArtifactsPart1, ...baseArtifactsPart2];