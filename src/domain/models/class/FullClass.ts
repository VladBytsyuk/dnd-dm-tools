import type { SmallClass } from "./SmallClass";
import { EmptyName } from "../common/Name";
import { EmptySource } from "../common/Source";

export interface FullClass extends SmallClass {
    id: number;
    associatedUrl?: string;         // Fragment URL for HTML fetching
    associatedHtml?: string;        // Cached HTML content
    archetypeType?: {               // For archetypes only
        name: string;               // e.g., "Базовые", "Homebrew"
        order: number;              // Sort order
    };
}

export function EmptyFullClass(): FullClass {
    return {
        id: 0,
        name: EmptyName(),
        url: '',
        dice: '',
        source: EmptySource(),
        isArchetype: false,
        associatedUrl: undefined,
        associatedHtml: undefined,
        archetypeType: undefined,
    };
}
