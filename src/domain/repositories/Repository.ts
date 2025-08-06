export interface Repository<SmallItem, FullItem, Filter> {

    initialize(): Promise<void>;
    dispose(): void;

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
}
