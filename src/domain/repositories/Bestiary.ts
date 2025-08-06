import type { BestiaryFilters } from "../models/monster/BestiaryFilters";
import type { FullMonster } from "../models/monster/FullMonster";
import type { SmallMonster } from "../models/monster/SmallMonster";
import type { Repository } from "./Repository";

export interface Bestiary extends Repository<SmallMonster, FullMonster, BestiaryFilters> {}
