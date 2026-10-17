import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class ArsenalMdCodeBlockProcessor 
    extends BaseMdCodeBlockProcessor<SmallWeapon, FullWeapon, ArsenalFilters> {

    getCodeBlockName() { return 'weapon'; }
}
