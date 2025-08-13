import type { ArmoryFilters } from "../models/armor/ArmoryFilters";
import type { FullArmor } from "../models/armor/FullArmor";
import type { SmallArmor } from "../models/armor/SmallArmor";
import type { Repository } from "./Repository";

export interface Armory extends Repository<SmallArmor, FullArmor, ArmoryFilters> {}
