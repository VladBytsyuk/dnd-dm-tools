import type {
	FullItemMapper,
	FullItemReadService,
	ItemReadStore,
	ItemWriteStore,
	SmallItemProjector,
} from "src/data/ports";
import { TtgService } from "src/data/services/TtgService";
import {
	DbTransactionalStore,
	GenericSqlItemReadStore,
	GenericSqlItemWriteStore,
} from "src/data/stores";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Dao } from "src/domain/Dao";
import type {
	Group,
	PageRequest,
	PageResult,
	Repository,
} from "src/domain/repositories/Repository";

export interface SimpleRepositoryDependencies<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
	TResponse = Partial<TFull>,
> {
	readStore: ItemReadStore<TSmall, TFull, TFilter>;
	writeStore: ItemWriteStore<TSmall, TFull>;
	service: FullItemReadService<TResponse>;
	mapper: FullItemMapper<TResponse, TFull>;
	projector: SmallItemProjector<TFull, TSmall>;
}

export interface SimpleRepositoryDatabase {
	transaction(callback: (...args: any[]) => Promise<void>): Promise<void> | void;
}

export function createSimpleRepositoryDependencies<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
	TResponse = Partial<TFull>,
>(
	database: SimpleRepositoryDatabase,
	smallItemDao: Dao<TSmall, TFilter>,
	fullItemDao: Dao<TFull, unknown>,
	mapper: FullItemMapper<TResponse, TFull>,
	projector: SmallItemProjector<TFull, TSmall>,
	service: FullItemReadService<TResponse> = new TtgService() as FullItemReadService<TResponse>,
): SimpleRepositoryDependencies<TSmall, TFull, TFilter, TResponse> {
	const transactions = new DbTransactionalStore(database);

	return {
		readStore: new GenericSqlItemReadStore<TSmall, TFull, TFilter>(smallItemDao, fullItemDao),
		writeStore: new GenericSqlItemWriteStore<TSmall, TFull, TFilter, unknown>(
			smallItemDao,
			fullItemDao,
			transactions,
		),
		service,
		mapper,
		projector,
	};
}

export abstract class SimpleRepository<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
	TResponse = Partial<TFull>,
> implements Repository<TSmall, TFull, TFilter> {
	#smallItems?: TSmall[];
	#filters?: TFilter;

	constructor(
		private readonly dependencies: SimpleRepositoryDependencies<TSmall, TFull, TFilter, TResponse>,
	) {}

	async initialize(): Promise<void> {
		if (!this.shouldPreloadSmallItems()) return;
		const allSmallItems = await this.dependencies.readStore.readAllSmallItems();
		this.#smallItems = allSmallItems;
		this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
	}

	dispose(): void {
		this.#smallItems = undefined;
		this.#filters = undefined;
	}

	async getAllFilters(): Promise<TFilter | null> {
		if (this.#filters) return this.#filters;

		const allSmallItems = this.#smallItems ?? await this.dependencies.readStore.readAllSmallItems();
		this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
		return this.#filters ?? null;
	}

	async getAllSmallItems(): Promise<TSmall[]> {
		if (this.#smallItems) return this.#smallItems;

		this.#smallItems = await this.dependencies.readStore.readAllSmallItems() ?? [];
		return this.#smallItems;
	}

	async getFilteredSmallItems(
		name: string | null = null,
		filter: TFilter | null = null,
	): Promise<TSmall[]> {
		let allSmallItems = await this.dependencies.readStore.readFilteredSmallItems(null, filter) ?? [];

		if (name) {
			const searchLower = name.toLocaleLowerCase("ru-RU");
			allSmallItems = allSmallItems.filter((item) => {
				const rusNameLower = item.name.rus.toLocaleLowerCase("ru-RU");
				const engNameLower = item.name.eng.toLocaleLowerCase("ru-RU");

				return rusNameLower.includes(searchLower) || engNameLower.includes(searchLower);
			});
		}

		return allSmallItems;
	}

	async getSmallItemsPage(
		filter: TFilter | null,
		request: PageRequest,
	): Promise<PageResult<TSmall>> {
		return this.dependencies.readStore.readSmallItemsPage(filter, request);
	}

	async getAllSmallItemNames(): Promise<string[]> {
		return await this.dependencies.readStore.readAllSmallItemNames() ?? [];
	}

	async getFullItemByUrl(url: string): Promise<TFull | null> {
		const cachedFullItem = await this.dependencies.readStore.readFullItemByUrl(url) ?? null;
		if (cachedFullItem) {
			console.log(`Loaded ${url} from local storage.`);
			return cachedFullItem;
		}

		const response = await this.dependencies.service.getFullItem(url);
		if (!response.ok) return null;

		try {
			const fullItem = this.dependencies.mapper.map(response.value, url);
			if (!fullItem.url) {
				fullItem.url = url;
			}

			await this.dependencies.writeStore.saveFetchedFull(fullItem);
			console.log(`Put ${url} into local storage.`);
			return fullItem;
		} catch (error) {
			console.error("Failed to load item from service response:", error);
			return null;
		}
	}

	async getFullItemByName(name: string): Promise<TFull | null> {
		const cachedFullItem = await this.dependencies.readStore.readFullItemByName(name) ?? null;
		if (cachedFullItem) return cachedFullItem;

		const smallItem = await this.dependencies.readStore.readSmallItemByName(name) ?? null;
		if (!smallItem) return null;

		return await this.getFullItemBySmallItem(smallItem);
	}

	async getFullItemBySmallItem(smallItem: TSmall): Promise<TFull | null> {
		if (!smallItem.url) return null;
		return await this.getFullItemByUrl(smallItem.url);
	}

	async putItem(fullItem: TFull): Promise<boolean> {
		if (!fullItem.url) {
			console.warn("Cannot put item without URL");
			return false;
		}

		try {
			const smallItem = this.dependencies.projector.project(fullItem);
			await this.dependencies.writeStore.upsertUserItem(smallItem, fullItem);
			await this.reloadCaches();
			return true;
		} catch (error) {
			console.error("Failed to put item:", error);
			return false;
		}
	}

	async deleteItem(url: string): Promise<boolean> {
		try {
			await this.dependencies.writeStore.deleteByUrl(url);
			await this.reloadCaches();
			return true;
		} catch (error) {
			console.error("Failed to delete item:", error);
			return false;
		}
	}

	async collectFiltersFromAllItems(_allSmallItems: TSmall[]): Promise<TFilter | null> {
		return null;
	}

	async groupItems(_smallItems: TSmall[]): Promise<Group<TSmall>[]> {
		return [];
	}

	createEmptyFullItem(): TFull | undefined {
		return undefined;
	}

	protected shouldPreloadSmallItems(): boolean {
		return true;
	}

	private async reloadCaches(): Promise<void> {
		this.#smallItems = undefined;
		this.#filters = undefined;
		if (this.shouldPreloadSmallItems()) {
			await this.initialize();
		}
	}
}
