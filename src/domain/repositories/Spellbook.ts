import type { FullSpell } from "../models/spell/FullSpell";
import type { SmallSpell } from "../models/spell/SmallSpell";
import type { SpellbookFilters } from "../models/spell/SpellbookFilters";
import type { Repository } from "./Repository";

export interface Spellbook extends Repository<SmallSpell, FullSpell, SpellbookFilters> {}
