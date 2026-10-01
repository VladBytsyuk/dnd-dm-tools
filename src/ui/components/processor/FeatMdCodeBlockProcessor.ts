import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import FeatFullUi from "src/ui/layout/feat/FeatFullUi.svelte";

export class FeatMdCodeBlockProcessor extends BaseMdCodeBlockProcessor<SmallFeat, FullFeat, FeatsFilters> {
	getCodeBlockName() { return "feat"; }
	getUi() { return FeatFullUi; }
}
