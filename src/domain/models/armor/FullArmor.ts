import type { SmallArmor } from "./SmallArmor";

export interface FullArmor extends SmallArmor {
    weight: number;
    description: string;
    disadvantage?: boolean;
    requirement?: number;
    duration: string;
}
