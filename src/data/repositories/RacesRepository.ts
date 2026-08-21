import { RaceMapper } from "src/data/mappers/sourceMappers";
import type { FullItemMapper, FullItemReadService, ServiceResult } from "src/data/ports";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import type { TtgApiRequestOptions, TtgJsonObject } from "src/data/services";
import { TtgService } from "src/data/services";
import { DbTransactionalStore, RaceStore } from "src/data/stores";
import type { Dao } from "src/domain/Dao";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import { createFilters } from "src/domain/models/common/Filters";
import { baseRaces, collectSourceBooks } from "src/assets/data/races";
import { sortSources } from "src/domain/utils/SourceSorter";
import type { Races } from "src/domain/repositories/Races";
import type { Group } from "src/domain/repositories/Repository";
import type { ItemSaveContext, ItemSaveResult } from "src/domain/models/common/EntityOrigin";
import {
	createSimpleRepositoryDependencies,
	SimpleRepository,
	type SimpleRepositoryDatabase,
	type SimpleRepositoryDependencies,
} from "./SimpleRepository";

type RaceRepositoryDatabase = SimpleRepositoryDatabase & {
	smallRaceDao: Dao<SmallRace, RaceFilters> & {
		createItemWithParent(race: SmallRace, parentUrl: string | null): Promise<void>;
		readAllItemsWithParentUrl(
			name: string | null,
			filters: RaceFilters | null,
		): Promise<Array<{ race: SmallRace; parentUrl: string | null }>>;
		readTopLevelRaces(name: string | null, filters: RaceFilters | null): Promise<SmallRace[]>;
		readSubracesByParentUrl(parentUrl: string): Promise<SmallRace[]>;
	};
	fullRaceDao: Dao<FullRace, unknown> & {
		createItemWithParent(race: FullRace, parentUrl: string | null): Promise<void>;
		readParentUrl(url: string): Promise<string | null>;
		readSubracesByParentUrl(parentUrl: string): Promise<FullRace[]>;
	};
};

class RaceTreeService implements FullItemReadService<TtgJsonObject, TtgApiRequestOptions> {
	constructor(private readonly service = new TtgService()) {}

	async getFullItem(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		return await this.service.getRaceTree(url, options);
	}
}

export interface RacesRepositoryDependencies {
	simpleDependencies: SimpleRepositoryDependencies<SmallRace, FullRace, RaceFilters, TtgJsonObject>;
	raceStore: RaceStore;
	service: FullItemReadService<TtgJsonObject, TtgApiRequestOptions>;
	mapper: FullItemMapper<TtgJsonObject, FullRace>;
}

function createDependencies(
	database: RaceRepositoryDatabase,
	service: FullItemReadService<TtgJsonObject, TtgApiRequestOptions>,
): RacesRepositoryDependencies {
	const transactions = new DbTransactionalStore(database);
	const mapper = new RaceMapper();
	return {
		simpleDependencies: createSimpleRepositoryDependencies(
			database,
			database.smallRaceDao,
			database.fullRaceDao,
			mapper,
			smallItemProjectors.race,
			service,
		),
		raceStore: new RaceStore(database.smallRaceDao, database.fullRaceDao, transactions),
		service,
		mapper,
	};
}

export class RacesRepository
	extends SimpleRepository<SmallRace, FullRace, RaceFilters, TtgJsonObject>
	implements Races {

	private static readonly RACE_SOURCE_BOOKS = collectSourceBooks(baseRaces);

	readonly #raceStore: RaceStore;
	readonly #service: FullItemReadService<TtgJsonObject, TtgApiRequestOptions>;
	readonly #mapper: FullItemMapper<TtgJsonObject, FullRace>;

	constructor(
		dependencies: RaceRepositoryDatabase | RacesRepositoryDependencies,
		service: FullItemReadService<TtgJsonObject, TtgApiRequestOptions> = new RaceTreeService(),
	) {
		const assembled = "simpleDependencies" in dependencies
			? dependencies
			: createDependencies(dependencies, service);
		super(assembled.simpleDependencies);

		this.#raceStore = assembled.raceStore;
		this.#service = assembled.service;
		this.#mapper = assembled.mapper;
	}

	async collectFiltersFromAllItems(allSmallItems: SmallRace[]): Promise<RaceFilters | null> {
		const abilitiesSet: Set<string> = new Set();
		const typesSet: Set<string> = new Set();
		const sourcesSet: Set<string> = new Set();

		for (const race of allSmallItems) {
			for (const ability of race.abilities) {
				abilitiesSet.add(ability.key);
			}
			typesSet.add(race.type.name);
			sourcesSet.add(race.source.shortName + (race.source.group.shortName != "Basic" ? "*" : ""));
		}

		return createFilters<RaceFilters>({
			abilities: Array.from(abilitiesSet).sort(),
			types: Array.from(typesSet).sort(),
			sources: sortSources(Array.from(sourcesSet)),
		});
	}

	async groupItems(smallItems: SmallRace[]): Promise<Group<SmallRace>[]> {
		const groups = smallItems.reduce((acc, race) => {
			const type = race.type.name;
			(acc[type] ||= []).push(race);
			return acc;
		}, {} as { [key: string]: SmallRace[] });

		const typeOrder: Record<string, number> = {
			"Базовые": 1,
			"Приключения": 2,
			"Сеттинги": 3,
			"Unearthed Arcana": 4,
			"3rd party": 5,
			"Homebrew": 6,
		};

		return Object.entries(groups)
			.map(([type, races]) => ({
				sort: type,
				smallItems: races,
			} as Group<SmallRace>))
			.sort((a, b) => {
				const aOrder = typeOrder[a.sort] ?? 999;
				const bOrder = typeOrder[b.sort] ?? 999;
				if (aOrder !== bOrder) return aOrder - bOrder;
				return a.sort.localeCompare(b.sort, "ru-RU");
			});
	}

	override async getFullItemByUrl(url: string): Promise<FullRace | null> {
		const cachedRace = await this.#raceStore.readFullRaceByUrl(url);
		if (cachedRace) {
			console.log(`Loaded ${url} from local storage.`);
			return cachedRace;
		}

		const response = await this.#service.getFullItem(url, {
			sourceBooks: RacesRepository.RACE_SOURCE_BOOKS,
		});
		if (!response.ok) {
			console.warn(`Failed to load race ${url} from remote service: ${response.reason}`, response.error);
			return null;
		}

		try {
			const fullRace = this.#mapper.map(response.value, url);
			await this.#raceStore.saveRaceTree(fullRace);
			console.log(`Put ${url} into local storage.`);
			return fullRace;
		} catch (error) {
			console.error("Failed to load race from service response:", error);
			return null;
		}
	}

	override async putItem(fullItem: FullRace, context: ItemSaveContext = {}): Promise<ItemSaveResult> {
		if (!fullItem.url) return { ok: false, code: "url-required", message: "URL не должен быть пустым." };
		const originalUrl = context.originalUrl?.trim();
		const originalOrigin = context.originalOrigin ?? "remote";
		if (originalUrl && originalOrigin === "remote" && fullItem.url === originalUrl) {
			return { ok: false, code: "url-unchanged", message: "Для ручной копии укажите новый URL." };
		}
		if (originalUrl && originalOrigin === "manual" && fullItem.url !== originalUrl) {
			return { ok: false, code: "manual-url-immutable", message: "URL ручной сущности нельзя изменить после создания." };
		}
		try {
		const existing = await this.#raceStore.readSmallRaceByUrl(fullItem.url);
		const updatesSameManualItem = originalOrigin === "manual" && originalUrl === fullItem.url;
		if (existing && !updatesSameManualItem) {
				return { ok: false, code: "url-occupied", message: "Этот URL уже занят в данном справочнике." };
			}
			await this.#raceStore.saveManualRaceTree(fullItem, context.parentUrl ?? null);
			return { ok: true };
		} catch {
			return { ok: false, code: "save-failed", message: "Не удалось сохранить сущность." };
		}
	}

	async getParentUrl(url: string): Promise<string | null> {
		return this.#raceStore.readParentUrl(url);
	}

	async getRacesWithSubraces(): Promise<SmallRace[]> {
		return await this.#raceStore.readRacesWithSubraces();
	}

	async getTopLevelRaces(name: string | null, filters: RaceFilters | null): Promise<SmallRace[]> {
		return await this.#raceStore.readTopLevelRaces(name, filters);
	}

	async getSubraces(parentUrl: string): Promise<SmallRace[]> {
		return await this.#raceStore.readSubraces(parentUrl);
	}
}
