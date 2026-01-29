import type { SmallClass } from "./SmallClass";
import { EmptyName } from "../common/Name";
import { EmptySource } from "../common/Source";

export interface Archetype {
    name: { rus: string; eng: string };
    type: { name: string; order: number };
    source: { shortName: string; name: string; group: { name: string; shortName: string }; homebrew?: boolean };
    url: string;
}

export interface FullClass extends SmallClass {
    id: number;
    archetypes: Archetype[];
}

export function EmptyFullClass(): FullClass {
    return { id: 0, name: EmptyName(), url: '', dice: '', source: EmptySource(), archetypes: [] };
}
