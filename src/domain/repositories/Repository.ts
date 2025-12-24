import type { Initializable } from "../Initializable";
import type { BaseItem } from "../models/common/BaseItem";

export interface Repository<SmallItem extends BaseItem, FullItem extends SmallItem, Filter> extends Initializable {

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

    putItem(fullItem: FullItem): Promise<boolean>;
    deleteItem(url: string): Promise<boolean>;

    createEmptyFullItem(): FullItem | undefined
}

export interface Group<SmallItem> {
    sort: string;
    smallItems: SmallItem[];
}
