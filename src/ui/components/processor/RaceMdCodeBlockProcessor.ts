import type { SmallRace } from "src/domain/models/race/SmallRace";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";

export class RaceMdCodeBlockProcessor
    extends BaseMdCodeBlockProcessor<SmallRace, FullRace, RaceFilters> {

    getCodeBlockName() { return 'race'; }
}
