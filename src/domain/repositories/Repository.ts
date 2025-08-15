import type { Initializable } from "../Initializable";
import type { WithUrl } from "../models/common/WithUrl";

export interface Repository<SmallItem extends WithUrl, FullItem extends SmallItem, Filter> extends Initializable {

    getAllFilters(): Promise<Filter | null>;

    getAllSmallItems(): Promise<SmallItem[]>;
    getFilteredSmallItems(
        name: string | null, 
        filter: Filter | null,
    ): Promise<SmallItem[]>;

    getAllSmallItemNames(): Promise<string[]>;

    getFullItemByUrl(url: string): Promise<FullItem | null>;
    getFullItemByName(name: string): Promise<FullItem | null>;
    getFullItemBySmallItem(smallItem: SmallItem): Promise<FullItem | null>;

    groupItems(smallItems: SmallItem[]): Promise<Group<SmallItem>[]>;
}

export interface Group<SmallItem> {
    sort: string;
    smallItems: SmallItem[];
}
