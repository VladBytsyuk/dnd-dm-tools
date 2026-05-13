import type { ItemReadStore, ItemWriteStore, TransactionalStore } from "src/data/ports";
import type DB from "src/data/database/DB";
import type { Dao } from "src/domain/Dao";
import type { BaseItem } from "src/domain/models/common/BaseItem";

export class GenericSqlItemReadStore<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
> implements ItemReadStore<TSmall, TFull, TFilter> {
	constructor(
		private readonly smallItemDao: Dao<TSmall, TFilter>,
		private readonly fullItemDao: Dao<TFull, unknown>,
	) {}

	async readAllSmallItems(): Promise<TSmall[]> {
		return this.smallItemDao.readAllItems(null, null);
	}

	async readFilteredSmallItems(name: string | null, filter: TFilter | null): Promise<TSmall[]> {
		return this.smallItemDao.readAllItems(name, filter);
	}

	async readAllSmallItemNames(): Promise<string[]> {
		return this.smallItemDao.readAllItemsNames();
	}

	async readSmallItemByName(name: string): Promise<TSmall | null> {
		return this.smallItemDao.readItemByName(name);
	}

	async readFullItemByName(name: string): Promise<TFull | null> {
		return this.fullItemDao.readItemByName(name);
	}

	async readFullItemByUrl(url: string): Promise<TFull | null> {
		return this.fullItemDao.readItemByUrl(url);
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
	) {}

	async saveFetchedFull(fullItem: TFull): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullItemDao.createItem(fullItem);
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
		});
	}

	async deleteByUrl(url: string): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullItemDao.deleteItemByUrl(url);
			await this.smallItemDao.deleteItemByUrl(url);
		});
	}
}

export class DbTransactionalStore implements TransactionalStore {
	constructor(private readonly database: Pick<DB, "transaction">) {}

	async transaction<T>(callback: () => Promise<T>): Promise<T> {
		let result: T | undefined;
		await this.database.transaction(async () => {
			result = await callback();
		});
		return result as T;
	}
}
