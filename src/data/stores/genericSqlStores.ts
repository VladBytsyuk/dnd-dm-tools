import type { ItemReadStore, ItemWriteStore, TransactionalStore } from "src/data/ports";
import type { Dao } from "src/domain/Dao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PageRequest, PageResult } from "src/domain/repositories/Repository";
import type { EntityKind, EntityOrigin } from "src/domain/models/common/EntityOrigin";
import type { EntityOriginDao } from "src/data/database/EntityOriginDao";

export class GenericSqlItemReadStore<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
> implements ItemReadStore<TSmall, TFull, TFilter> {
	constructor(
		private readonly smallItemDao: Dao<TSmall, TFilter>,
		private readonly fullItemDao: Dao<TFull, unknown>,
		private readonly entityKind?: EntityKind,
		private readonly origins?: EntityOriginDao,
	) {}

	async readAllSmallItems(): Promise<TSmall[]> {
		return this.withOrigins(await this.smallItemDao.readAllItems(null, null));
	}

	async readFilteredSmallItems(name: string | null, filter: TFilter | null): Promise<TSmall[]> {
		return this.withOrigins(await this.smallItemDao.readAllItems(name, filter));
	}

	async readSmallItemsPage(
		filter: TFilter | null,
		request: PageRequest,
	): Promise<PageResult<TSmall>> {
		const page = await this.smallItemDao.readItemsPage(filter, request);
		return { ...page, items: await this.withOrigins(page.items) };
	}

	async readAllSmallItemNames(): Promise<string[]> {
		return this.smallItemDao.readAllItemsNames();
	}

	async readSmallItemByName(name: string): Promise<TSmall | null> {
		return this.withOrigin(await this.smallItemDao.readItemByName(name));
	}

	async readSmallItemByUrl(url: string): Promise<TSmall | null> {
		return this.withOrigin(await this.smallItemDao.readItemByUrl(url));
	}

	async readFullItemByName(name: string): Promise<TFull | null> {
		return this.withOrigin(await this.fullItemDao.readItemByName(name));
	}

	async readFullItemByUrl(url: string): Promise<TFull | null> {
		return this.withOrigin(await this.fullItemDao.readItemByUrl(url));
	}

	private async withOrigins<T extends BaseItem>(items: T[]): Promise<T[]> {
		if (!this.entityKind || !this.origins) return items;
		const origins = await this.origins.getMany(this.entityKind, items.map((item) => item.url));
		return items.map((item) => ({ ...item, origin: origins.get(item.url) ?? "remote" }));
	}

	private async withOrigin<T extends BaseItem>(item: T | null): Promise<T | null> {
		if (!item || !this.entityKind || !this.origins) return item;
		return { ...item, origin: await this.origins.get(this.entityKind, item.url) };
	}
}

export class GenericSqlItemWriteStore<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TSmallFilter = unknown,
	TFullFilter = unknown,
>
	implements ItemWriteStore<TSmall, TFull>
{
	constructor(
		private readonly smallItemDao: Dao<TSmall, TSmallFilter>,
		private readonly fullItemDao: Dao<TFull, TFullFilter>,
		private readonly transactions: TransactionalStore,
		private readonly entityKind?: EntityKind,
		private readonly origins?: EntityOriginDao,
	) {}

	async saveFetchedFull(fullItem: TFull): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullItemDao.createItem(fullItem);
			if (this.entityKind && this.origins) await this.origins.ensureRemote(this.entityKind, fullItem.url);
		});
	}

	async upsertUserItem(smallItem: TSmall, fullItem: TFull): Promise<void> {
		await this.transactions.transaction(async () => {
			const existingSmallItem = await this.smallItemDao.readItemByUrl(smallItem.url);
			if (existingSmallItem) {
				await this.smallItemDao.updateItem(smallItem);
			} else {
				await this.smallItemDao.createItem(smallItem);
			}

			const existingFullItem = await this.fullItemDao.readItemByUrl(fullItem.url);
			if (existingFullItem) {
				await this.fullItemDao.updateItem(fullItem);
			} else {
				await this.fullItemDao.createItem(fullItem);
			}
			if (this.entityKind && this.origins) await this.origins.markManual(this.entityKind, fullItem.url);
		});
	}

	async deleteByUrl(url: string): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullItemDao.deleteItemByUrl(url);
			await this.smallItemDao.deleteItemByUrl(url);
			if (this.entityKind && this.origins) await this.origins.delete(this.entityKind, url);
		});
	}
}

interface TransactionalDatabase {
	transaction(callback: (...args: any[]) => Promise<void>): Promise<void> | void;
}

export class DbTransactionalStore implements TransactionalStore {
	constructor(private readonly database: TransactionalDatabase) {}

	async transaction<T>(callback: () => Promise<T>): Promise<T> {
		let result: T | undefined;
		await this.database.transaction(async () => {
			result = await callback();
		});
		return result as T;
	}
}
