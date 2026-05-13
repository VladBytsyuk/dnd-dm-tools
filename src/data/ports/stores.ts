import type { BaseItem } from "src/domain/models/common/BaseItem";

export interface ItemReadStore<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
> {
	readAllSmallItems(): Promise<TSmall[]>;
	readFilteredSmallItems(name: string | null, filter: TFilter | null): Promise<TSmall[]>;
	readAllSmallItemNames(): Promise<string[]>;
	readSmallItemByName(name: string): Promise<TSmall | null>;
	readFullItemByName(name: string): Promise<TFull | null>;
	readFullItemByUrl(url: string): Promise<TFull | null>;
}

export interface ItemWriteStore<TSmall extends BaseItem, TFull extends TSmall> {
	saveFetchedFull(fullItem: TFull): Promise<void>;
	upsertUserItem(smallItem: TSmall, fullItem: TFull): Promise<void>;
	deleteByUrl(url: string): Promise<void>;
}

export interface TransactionalStore {
	transaction<T>(callback: () => Promise<T>): Promise<T>;
}
