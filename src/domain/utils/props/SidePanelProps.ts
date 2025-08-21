import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";

export interface SidePanelProps<ST extends BaseItem, FT extends ST, F extends Filters, R extends Repository<ST, FT, F>> {
    initialFullItem?: FT;
    repository: R;
    uiEventListener: IUiEventListener;
    openFiltersModal: (fullFilters: F, filters: F, onApply: (newFilters: F) => Promise<void>) => void;
}
