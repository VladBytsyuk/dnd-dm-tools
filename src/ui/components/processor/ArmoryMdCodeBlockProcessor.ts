import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import ArmorFullUi from "src/ui/layout/armor/ArmorFullUi.svelte";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class ArmoryMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallArmor, FullArmor, ArmoryFilters> {
    
    getCodeBlockName() { return 'armor'; }
    getUi() { return ArmorFullUi; }
}
