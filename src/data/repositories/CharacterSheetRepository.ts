import { CharacterSheetImportMapper } from "src/data/mappers/characterSheetImportMapper";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import { CharacterSheetStore, DbTransactionalStore } from "src/data/stores";
import { createFilters } from "src/domain/models/common/Filters";
import type {
	CharacterSheetFilters,
	FullCharacterSheet,
	SmallCharacterSheet,
} from "src/domain/models/character";
import { EmptyFullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import type { Group, Repository } from "src/domain/repositories/Repository";
import type { CharacterSheetGateway } from "./characterSheetTypes";

type SmallDaoLike<TSmall, TFilter> = {
	readAllItems(name: string | null, filter: TFilter | null): Promise<TSmall[]>;
};

type CharacterSheetRepositoryDatabase = {
	transaction(callback: (...args: any[]) => Promise<void>): Promise<void> | void;
	characterSheetDao: {
		createItem(item: FullCharacterSheet): Promise<void>;
		deleteItemByUrl(url: string): Promise<void>;
		readAllSmallItems(
			name: string | null,
			filter: CharacterSheetFilters | null,
		): Promise<SmallCharacterSheet[]>;
		readFullItemByUrl(url: string): Promise<FullCharacterSheet | null>;
		readItemByUrl(url: string): Promise<FullCharacterSheet | null>;
		updateItem(item: FullCharacterSheet): Promise<void>;
	};
	smallRaceDao?: SmallDaoLike<unknown, unknown>;
	smallBackgroundDao?: SmallDaoLike<unknown, unknown>;
	smallClassDao?: SmallDaoLike<unknown, unknown>;
	smallItemDao?: SmallDaoLike<unknown, unknown>;
	smallArtifactDao?: SmallDaoLike<unknown, unknown>;
	smallArmorDao?: SmallDaoLike<unknown, unknown>;
	smallSpellDao?: SmallDaoLike<unknown, unknown>;
	fullArmorDao?: unknown;
	fullArtifactDao?: unknown;
	fullItemDao?: unknown;
	fullSpellDao?: unknown;
};

export class CharacterSheetRepository
	implements Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>, CharacterSheetGateway
{
	#smallItems?: SmallCharacterSheet[];
	#filters?: CharacterSheetFilters;
	readonly #store: CharacterSheetStore;
	readonly #importMapper = new CharacterSheetImportMapper();

	constructor(private readonly database: CharacterSheetRepositoryDatabase) {
		this.#store = new CharacterSheetStore(
			database.characterSheetDao,
			new DbTransactionalStore(database),
		);
	}

	/**
	 * Kept for the character sheet editor/linking surface, which still reads related DAOs directly.
	 */
	getDatabase(): any {
		return this.database;
	}

	async initialize(): Promise<void> {
		const allSmallItems = await this.getAllSmallItems();
		this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
	}

	dispose(): void {
		this.#smallItems = undefined;
		this.#filters = undefined;
	}

	async getAllFilters(): Promise<CharacterSheetFilters | null> {
		if (this.#filters) return this.#filters;

		const allSmallItems = this.#smallItems ?? await this.getAllSmallItems();
		this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
		return this.#filters ?? null;
	}

	async collectFiltersFromAllItems(
		allSmallItems: SmallCharacterSheet[]
	): Promise<CharacterSheetFilters | null> {
		const classes = new Set<string>();
		const levels = new Set<number>();
		const races = new Set<string>();

		allSmallItems.forEach((sheet) => {
			if (sheet.charClass) classes.add(sheet.charClass);
			if (sheet.level) levels.add(sheet.level);
			if (sheet.race) races.add(sheet.race);
		});

		return createFilters<CharacterSheetFilters>({
			classes: Array.from(classes).sort(),
			levels: Array.from(levels).sort((a, b) => a - b),
			races: Array.from(races).sort(),
		});
	}

	async groupItems(smallItems: SmallCharacterSheet[]): Promise<Group<SmallCharacterSheet>[]> {
		const grouped = new Map<number, SmallCharacterSheet[]>();

		smallItems.forEach((sheet) => {
			const level = sheet.level || 0;
			if (!grouped.has(level)) {
				grouped.set(level, []);
			}
			grouped.get(level)!.push(sheet);
		});

		return Array.from(grouped.entries())
			.sort(([a], [b]) => a - b)
			.map(([level, items]) => ({
				sort: `Уровень ${level}`,
				smallItems: items,
			}));
	}

	createEmptyFullItem(): FullCharacterSheet {
		return EmptyFullCharacterSheet();
	}

	async getAllSmallItems(): Promise<SmallCharacterSheet[]> {
		if (this.#smallItems) return this.#smallItems;

		this.#smallItems = await this.#store.readAllSmallItems();
		return this.#smallItems;
	}

	async getFilteredSmallItems(
		name: string | null = null,
		filter: CharacterSheetFilters | null = null
	): Promise<SmallCharacterSheet[]> {
		return await this.#store.readFilteredSmallItems(name, filter);
	}

	async getAllSmallItemNames(): Promise<string[]> {
		return (await this.getAllSmallItems()).map((item) => item.name.rus);
	}

	async getFullItemByUrl(url: string): Promise<FullCharacterSheet | null> {
		return await this.#store.readFullItemByUrl(url);
	}

	async getFullItemByName(name: string): Promise<FullCharacterSheet | null> {
		const smallItem = (await this.getAllSmallItems()).find((item) =>
			item.name.rus === name || item.name.eng === name
		);

		return smallItem ? await this.getFullItemBySmallItem(smallItem) : null;
	}

	async getFullItemBySmallItem(smallItem: SmallCharacterSheet): Promise<FullCharacterSheet | null> {
		if (!smallItem.url) return null;
		return await this.getFullItemByUrl(smallItem.url);
	}

	async importFromJson(jsonContent: string): Promise<FullCharacterSheet> {
		const fullSheet = this.#importMapper.map(jsonContent);
		fullSheet.url = await this.#store.generateUniqueUrl(fullSheet.name.rus || fullSheet.name.eng);
		await this.#store.saveImportedSheet(fullSheet);
		await this.reloadCaches();
		return fullSheet;
	}

	async putItem(fullItem: FullCharacterSheet): Promise<boolean> {
		if (!fullItem.url) {
			console.warn("Cannot put character sheet without URL");
			return false;
		}

		try {
			smallItemProjectors.characterSheet.project(fullItem);
			await this.#store.saveSheet(fullItem);
			await this.reloadCaches();
			return true;
		} catch (error) {
			console.error("Failed to save character sheet:", error);
			return false;
		}
	}

	async deleteItem(url: string): Promise<boolean> {
		try {
			await this.#store.deleteByUrl(url);
			await this.reloadCaches();
			return true;
		} catch (error) {
			console.error("Failed to delete character sheet:", error);
			return false;
		}
	}

	private async reloadCaches(): Promise<void> {
		this.#smallItems = undefined;
		this.#filters = undefined;
		await this.initialize();
	}
}
