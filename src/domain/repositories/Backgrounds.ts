import type { BackgroundsFilters } from "../models/background/BackgroundsFilters";
import type { FullBackground } from "../models/background/FullBackground";
import type { SmallBackground } from "../models/background/SmallBackground";
import type { Repository } from "./Repository";

export interface Backgrounds extends Repository<SmallBackground, FullBackground, BackgroundsFilters> {}