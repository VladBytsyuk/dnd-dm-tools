import type { SmallItem } from "./SmallItem";

export interface FullItem extends SmallItem {
    price?: string;
    weight?: number;
    description: string;
    categories: string[];
} 