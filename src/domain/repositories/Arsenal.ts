import type { FullWeapon } from "../models/weapon/FullWeapon";
import type { SmallWeapon } from "../models/weapon/SmallWeapon";
import type { WeaponFilters } from "../models/weapon/WeaponFilters";
import type { Repository } from "./Repository";

export interface Arsenal extends Repository<SmallWeapon, FullWeapon, WeaponFilters> {}
