import type { SmallRace } from "src/domain/models/race/SmallRace";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import RaceFullUi from "src/ui/layout/race/RaceFullUi.svelte";

export class RaceMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallRace, FullRace, RaceFilters> {

    getCodeBlockName() { return 'race'; }
    getUi() { return RaceFullUi; }
}
