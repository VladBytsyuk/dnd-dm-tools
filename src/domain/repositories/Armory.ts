import type { ArmorFilters } from "../models/armor/ArmorFilters";
import type { FullArmor } from "../models/armor/FullArmor";
import type { SmallArmor } from "../models/armor/SmallArmor";
import type { Repository } from "./Repository";

export interface Armory extends Repository<SmallArmor, FullArmor, ArmorFilters> {}
