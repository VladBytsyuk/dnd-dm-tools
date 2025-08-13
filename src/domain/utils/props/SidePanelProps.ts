import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { WithUrl } from "src/domain/models/common/WithUrl";
import type { Repository } from "src/domain/repositories/Repository";

export interface SidePanelProps<ST extends WithUrl, FT extends ST, F extends Filters, R extends Repository<ST, FT, F>> {
    initialFullItem?: FT;
    repository: R;
    uiEventListener: IUiEventListener;
    openFiltersModal: (fullFilters: F, filters: F, onApply: (newFilters: F) => Promise<void>) => void;
}
