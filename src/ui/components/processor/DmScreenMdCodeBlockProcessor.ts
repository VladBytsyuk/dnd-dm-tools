import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import DmScreenItemUi from "src/ui/layout/screen/DmScreenItemUi.svelte";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class DmScreenMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<DmScreenItem, DmScreenItem, never> {

    getCodeBlockName() { return 'screen'; }
    getUi() { return DmScreenItemUi; }
}
