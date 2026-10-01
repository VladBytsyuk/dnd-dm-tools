import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import DmScreenItemUi from "src/ui/layout/screen/DmScreenItemUi.svelte";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { Component } from "svelte";

export class DmScreenMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<DmScreenItem, DmScreenItem, never> {

    getCodeBlockName() { return 'screen'; }
    getUi() { return DmScreenItemUi; }

    protected getRedesignedUi(): { component: Component<any, any, any>; props: Record<string, unknown> } {
        return { component: DmScreenItemUi, props: { redesigned: true } };
    }
}
