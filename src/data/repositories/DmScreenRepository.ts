import { DmScreenDescriptionMapper } from "src/data/mappers/sourceMappers";
import type { FullItemMapper, FullItemReadService } from "src/data/ports";
import { TtgService, type TtgJsonObject } from "src/data/services";
import { DbTransactionalStore, DmScreenStore } from "src/data/stores";
import { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { DmScreen } from "src/domain/repositories/DmScreen";

type DmScreenRepositoryDatabase = {
	transaction(callback: (...args: any[]) => Promise<void>): Promise<void> | void;
	dmScreenGroupDao: {
		readAllItems(name: string | null, filter: any | null): Promise<DmScreenItem[]>;
		readAllItemsNames(): Promise<string[]>;
		readChildren(parentUrl?: string): Promise<DmScreenItem[]>;
		readChildrenCount(parentUrl: string): Promise<number>;
		readItemByName(name: string): Promise<DmScreenItem | null>;
		readItemByUrl(url: string): Promise<DmScreenItem | null>;
		updateItem(item: DmScreenItem): Promise<void>;
	};
};

export interface DmScreenRepositoryDependencies {
	dao: DmScreenRepositoryDatabase["dmScreenGroupDao"];
	store: DmScreenStore;
	service: FullItemReadService<TtgJsonObject>;
	mapper: FullItemMapper<TtgJsonObject, DmScreenItem>;
}

class DmScreenDescriptionService implements FullItemReadService<TtgJsonObject> {
	constructor(private readonly service = new TtgService()) {}

	async getFullItem(url: string) {
		return await this.service.getDmScreenDescription(url);
	}
}

export class DmScreenRepository implements DmScreen {
	#rootItems: DmScreenItem[] | undefined = undefined;
	readonly #store: DmScreenStore;
	readonly #dao: DmScreenRepositoryDatabase["dmScreenGroupDao"];
	readonly #service: FullItemReadService<TtgJsonObject>;
	readonly #mapper: FullItemMapper<TtgJsonObject, DmScreenItem>;

	constructor(
		dependencies: DmScreenRepositoryDatabase | DmScreenRepositoryDependencies,
		service: FullItemReadService<TtgJsonObject> = new DmScreenDescriptionService(),
	) {
		if ("store" in dependencies) {
			this.#dao = dependencies.dao;
			this.#service = dependencies.service;
			this.#store = dependencies.store;
			this.#mapper = dependencies.mapper;
			return;
		}

		this.#dao = dependencies.dmScreenGroupDao;
		this.#service = service;
		this.#store = new DmScreenStore(
			dependencies.dmScreenGroupDao,
			new DbTransactionalStore(dependencies),
		);
		this.#mapper = new DmScreenDescriptionMapper();
	}

	async initialize() {
		this.#rootItems = await this.#store.readRootItems();
	}

	dispose(): void {
		this.#rootItems = undefined;
	}

	async getAllFilters(): Promise<any | null> {
		return null;
	}

	async getAllSmallItems(): Promise<DmScreenItem[]> {
		return await this.#dao.readAllItems(null, null) || [];
	}

	async getFilteredSmallItems(
		name: string | null = null,
		filter: any | null = null,
	): Promise<DmScreenItem[]> {
		let allSmallItems = await this.#dao.readAllItems(null, filter) || [];

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

	async getAllSmallItemNames(): Promise<string[]> {
		return await this.#store.readAllItemNames() || [];
	}

	async getAllRootItems(): Promise<DmScreenItem[]> {
		if (this.#rootItems) return this.#rootItems;
		await this.initialize();
		return this.#rootItems ?? [];
	}

	async getFilteredItems(searchValue: string): Promise<DmScreenItem[]> {
		return await this.getFilteredSmallItems(searchValue, null);
	}

	async getChildrenCount(item: DmScreenItem): Promise<number> {
		return await this.#store.readChildrenCount(item.url) || 0;
	}

	async getChildren(item: DmScreenItem): Promise<DmScreenItem[]> {
		return await this.#store.readChildren(item.url) || [];
	}

	async getFullItem(item: DmScreenItem): Promise<DmScreenItem | null> {
		return await this.getFullItemByUrl(item.url);
	}

	async getFullItemByName(name: string): Promise<DmScreenItem | null> {
		const cachedFullItem = await this.#store.readItemByName(name) || null;
		if (cachedFullItem && cachedFullItem.description) {
			console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
			return cachedFullItem;
		}
		if (!cachedFullItem) return null;
		return await this.getFullItemByUrl(cachedFullItem.url);
	}

	async getFullItemBySmallItem(smallItem: DmScreenItem): Promise<DmScreenItem | null> {
		if (!smallItem.url) return null;
		return await this.getFullItemByUrl(smallItem.url);
	}

	async getFullItemByUrl(url: string): Promise<DmScreenItem | null> {
		const cachedFullItem = await this.#store.readItemByUrl(url) || null;
		if (cachedFullItem && cachedFullItem.description) {
			console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
			return cachedFullItem;
		}
		console.log(`Item ${url} doesn't have a description in local storage.`);

		const response = await this.#service.getFullItem(url);
		if (!response.ok) return null;

		try {
			const fullItem = this.#mapper.map(response.value, url);
			await this.#store.updateItemDescription(fullItem);
			console.log(`Updated ${url} in local storage.`);
			return fullItem;
		} catch (error) {
			console.error("Failed to refresh DM screen description:", error);
			return null;
		}
	}

	async putItem(_fullItem: DmScreenItem): Promise<boolean> {
		return false;
	}

	async deleteItem(_url: string): Promise<boolean> {
		return false;
	}

	async collectFiltersFromAllItems(_allSmallItems: DmScreenItem[]): Promise<any | null> {
		return null;
	}

	async groupItems(_smallItems: DmScreenItem[]) {
		return [];
	}

	createEmptyFullItem(): DmScreenItem | undefined {
		return undefined;
	}
}
