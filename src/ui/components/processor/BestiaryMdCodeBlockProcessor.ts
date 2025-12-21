import MonsterFullUi from "src/ui/layout/monster/MonsterFullUi2.svelte";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class BestiaryMdCodeBlockProcessor 
    extends BaseMdCodeBlockProcessor<SmallMonster, FullMonster, BestiaryFilters> {

    getCodeBlockName() { return 'statblock'; }
    getUi() { return MonsterFullUi; }
}
