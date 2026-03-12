import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import type { Group, Repository } from "src/domain/repositories/Repository";
import type DB from "../database/DB";
import { BaseRepository } from "./BaseRepository";
import { createFilters } from "src/domain/models/common/Filters";
import { EmptyFullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import { CharacterSheetImportService } from "./CharacterSheetImportService";

export class CharacterSheetRepository
	extends BaseRepository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>
	implements Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>
{
	private readonly importService;

	constructor(database: DB) {
		// Pass the same DAO for both small and full items
		super(database, database.characterSheetDao, database.characterSheetDao);
		this.importService = new CharacterSheetImportService(database.characterSheetDao);
	}

	/**
	 * Gets the database instance for accessing DAOs.
	 * Needed for EntityLinkService to query races, classes, and backgrounds.
	 */
	getDatabase(): DB {
		return this.database;
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
		// Group by level (ascending)
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

	/**
	 * Override to fetch from local database only (no API).
	 */
	async getFullItemByUrl(url: string): Promise<FullCharacterSheet | null> {
		return await this.database.characterSheetDao.readFullItemByUrl(url);
	}

	/**
	 * Import character sheet from JSON file content.
	 * Parses the raw JSON, extracts fields, and saves to database.
	 * Supports both standard format and riardon.json format.
	 * @throws {Error} If JSON is malformed or required fields are missing
	 */
	async importFromJson(jsonContent: string): Promise<FullCharacterSheet> {
		const fullSheet = await this.importService.importFromJson(jsonContent);
		await this.putItem(fullSheet);
		return fullSheet;
	}

	/**
	 * Override to use Small items query for better performance.
	 */
	async getFilteredSmallItems(
		name: string | null = null,
		filter: CharacterSheetFilters | null = null
	): Promise<SmallCharacterSheet[]> {
		// Use the DAO's optimized small items query
		let allSmallItems =
			(await this.database.characterSheetDao.readAllSmallItems(null, filter)) || [];

		// Apply name search filter
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

	/**
	 * Override to use Small items query for better performance.
	 */
	async getAllSmallItems(): Promise<SmallCharacterSheet[]> {
		return (await this.database.characterSheetDao.readAllSmallItems(null, null)) || [];
	}

	/**
	 * Override initialize to use Small items.
	 */
	async initialize(): Promise<void> {
		const allSmallItems = await this.getAllSmallItems();
		// BaseRepository expects to call collectFiltersFromAllItems
		await this.collectFiltersFromAllItems(allSmallItems);
	}
}
