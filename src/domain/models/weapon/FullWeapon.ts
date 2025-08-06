import type { WeaponProperty } from "../common/WeaponProperty";
import type { SmallWeapon } from "./SmallWeapon";

export interface FullWeapon extends SmallWeapon {
    weight: number;
    special?: string;
    properties: WeaponProperty[];
}
