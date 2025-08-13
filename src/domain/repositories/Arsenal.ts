import type { FullWeapon } from "../models/weapon/FullWeapon";
import type { SmallWeapon } from "../models/weapon/SmallWeapon";
import type { ArsenalFilters } from "../models/weapon/ArsenalFilters";
import type { Repository } from "./Repository";

export interface Arsenal extends Repository<SmallWeapon, FullWeapon, ArsenalFilters> {}
