import type { RaceFilters } from "../models/race/RaceFilters";
import type { FullRace } from "../models/race/FullRace";
import type { SmallRace } from "../models/race/SmallRace";
import type { Repository } from "./Repository";

export interface Races extends Repository<SmallRace, FullRace, RaceFilters> {}
