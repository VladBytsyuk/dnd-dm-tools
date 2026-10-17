import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";

export class BackgroundMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallBackground, FullBackground, BackgroundsFilters> {

    getCodeBlockName() { return 'background'; }
}