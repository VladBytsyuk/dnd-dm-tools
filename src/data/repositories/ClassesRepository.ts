import { ClassMapper } from "src/data/mappers/sourceMappers";
import type { FullItemReadService, ServiceResult } from "src/data/ports";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import type { TtgApiRequestOptions, TtgItemWithHtml } from "src/data/services";
import { TtgService } from "src/data/services";
import { ClassStore, DbTransactionalStore } from "src/data/stores";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import { createFilters } from "src/domain/models/common/Filters";
import { baseClasses, collectSourceBooks } from "src/assets/data/classes";
import { sortSources } from "src/domain/utils/SourceSorter";
import type { Dao } from "src/domain/Dao";
import type { Group, Repository } from "src/domain/repositories/Repository";
import {
	createSimpleRepositoryDependencies,
	SimpleRepository,
	type SimpleRepositoryDatabase,
} from "./SimpleRepository";

type ClassWithHtmlResponse = TtgItemWithHtml<Record<string, unknown>>;

type ClassRepositoryDatabase = SimpleRepositoryDatabase & {
	smallClassDao: Dao<SmallClass, ClassesFilters> & {
		readArchetypesByParentUrl(parentClassUrl: string): Promise<SmallClass[]>;
	};
	fullClassDao: Dao<FullClass, unknown>;
};

class ClassWithHtmlService implements FullItemReadService<ClassWithHtmlResponse, TtgApiRequestOptions> {
	constructor(private readonly service = new TtgService()) {}

	async getFullItem(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<ClassWithHtmlResponse>> {
		return await this.service.getClassWithHtml(url, options);
	}
}

class ClassWithHtmlMapper extends ClassMapper {
	override map(response: ClassWithHtmlResponse, url: string): FullClass {
		return super.map({
			...response.item,
			associatedUrl: response.associatedUrl,
			associatedHtml: response.associatedHtml,
		}, url);
	}
}

export class ClassesRepository
	extends SimpleRepository<SmallClass, FullClass, ClassesFilters, ClassWithHtmlResponse>
	implements Repository<SmallClass, FullClass, ClassesFilters> {

	private static readonly CLASS_SOURCE_BOOKS = collectSourceBooks(baseClasses);

	#baseClassesCache?: SmallClass[];
	#filtersCache?: ClassesFilters;
	readonly #classStore: ClassStore;
	readonly #service: FullItemReadService<ClassWithHtmlResponse, TtgApiRequestOptions>;
	readonly #mapper = new ClassWithHtmlMapper();

	constructor(
		database: ClassRepositoryDatabase,
		service: FullItemReadService<ClassWithHtmlResponse, TtgApiRequestOptions> = new ClassWithHtmlService(),
	) {
		const transactions = new DbTransactionalStore(database);
		super(createSimpleRepositoryDependencies(
			database,
			database.smallClassDao,
			database.fullClassDao,
			new ClassWithHtmlMapper(),
			smallItemProjectors.class,
			service,
		));

		this.#classStore = new ClassStore(database.smallClassDao, database.fullClassDao, transactions);
		this.#service = service;
	}

	async initialize(): Promise<void> {
		this.#baseClassesCache = await this.#classStore.readBaseClasses(null, null);
		this.#filtersCache = await this.collectFiltersFromAllItems(this.#baseClassesCache) ?? undefined;
	}

	dispose(): void {
		this.#baseClassesCache = undefined;
		this.#filtersCache = undefined;
		super.dispose();
	}

	async getAllFilters(): Promise<ClassesFilters | null> {
		if (this.#filtersCache) return this.#filtersCache;

		const baseClasses = this.#baseClassesCache ?? await this.getAllSmallItems();
		this.#filtersCache = await this.collectFiltersFromAllItems(baseClasses) ?? undefined;
		return this.#filtersCache ?? null;
	}

	async getArchetypesForClass(parentClassUrl: string): Promise<SmallClass[]> {
		return await this.#classStore.readArchetypesForClass(parentClassUrl);
	}

	async getAllSmallItems(): Promise<SmallClass[]> {
		if (this.#baseClassesCache) return this.#baseClassesCache;

		this.#baseClassesCache = await this.#classStore.readBaseClasses(null, null);
		return this.#baseClassesCache;
	}

	async getFilteredSmallItems(
		name: string | null = null,
		filter: ClassesFilters | null = null,
	): Promise<SmallClass[]> {
		return await this.#classStore.readBaseClasses(name, filter);
	}

	async getAllSmallItemNames(): Promise<string[]> {
		return (await this.getAllSmallItems()).map((item) => item.name.rus);
	}

	override async getFullItemByUrl(url: string): Promise<FullClass | null> {
		const cachedFullItem = await this.#classStore.readFullClassByUrl(url);
		if (cachedFullItem) {
			console.log(`Loaded ${url} from local storage.`);
			return cachedFullItem;
		}

		const response = await this.#service.getFullItem(url, {
			sourceBooks: ClassesRepository.CLASS_SOURCE_BOOKS,
		});
		if (!response.ok) return null;

		try {
			const fullItem = this.#mapper.map(response.value, url);
			await this.#classStore.saveFullClass(fullItem);
			console.log(`Put ${url} into local storage.`);
			return fullItem;
		} catch (error) {
			console.error("Failed to load class from service response:", error);
			return null;
		}
	}

	override async getFullItemByName(name: string): Promise<FullClass | null> {
		const cachedFullItem = await this.#classStore.readFullClassByName(name);
		if (cachedFullItem) return cachedFullItem;

		const search = name.toLocaleLowerCase("ru-RU");
		const smallItem = (await this.getAllSmallItems()).find((item) =>
			item.name.rus.toLocaleLowerCase("ru-RU") === search
			|| item.name.eng.toLocaleLowerCase("ru-RU") === search
		);

		return smallItem ? await this.getFullItemBySmallItem(smallItem) : null;
	}

	async collectFiltersFromAllItems(allSmallItems: SmallClass[]): Promise<ClassesFilters | null> {
		const diceTypesSet = new Set<string>();
		const sourcesSet = new Set<string>();

		for (const classItem of allSmallItems) {
			diceTypesSet.add(classItem.dice);
			sourcesSet.add(classItem.source.shortName + (classItem.source.group.shortName != "Basic" ? "*" : ""));
		}

		return createFilters<ClassesFilters>({
			diceTypes: Array.from(diceTypesSet).sort((a, b) => {
				const aValue = parseInt(a.substring(1));
				const bValue = parseInt(b.substring(1));
				return aValue - bValue;
			}),
			sources: sortSources(Array.from(sourcesSet)),
		});
	}

	async groupItems(smallItems: SmallClass[]): Promise<Group<SmallClass>[]> {
		const groups = smallItems.reduce((acc, classItem) => {
			const sourceKey = classItem.source.shortName;
			(acc[sourceKey] ||= []).push(classItem);
			return acc;
		}, {} as { [key: string]: SmallClass[] });

		const priorityOrder = ["PHB", "XGE", "TCE"];

		return Object.entries(groups)
			.map(([sourceShortName, smallClasses]) => ({ sort: sourceShortName, smallItems: smallClasses }))
			.sort((a, b) => {
				const aIndex = priorityOrder.indexOf(a.sort);
				const bIndex = priorityOrder.indexOf(b.sort);

				if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;
				return a.sort.localeCompare(b.sort);
			});
	}
}
