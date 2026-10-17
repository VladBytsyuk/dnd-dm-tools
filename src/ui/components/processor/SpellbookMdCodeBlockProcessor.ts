import { type FullSpell } from "src/domain/models/spell/FullSpell";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class SpellbookMdCodeBlockProcessor 
    extends BaseMdCodeBlockProcessor<SmallSpell, FullSpell, SpellbookFilters> {

    getCodeBlockName() { return 'spell'; }
}
