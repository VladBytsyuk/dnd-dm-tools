import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import type { Group, Repository } from "src/domain/repositories/Repository";
import type DB from "../database/DB";
import { BaseRepository } from "./BaseRepository";
import { createFilters } from "src/domain/models/common/Filters";
import { EmptyFullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import type { CharacterSheet } from "src/domain/models/character/CharacterSheet";
import { parseCharacterData } from "src/domain/models/character/CharacterSheet";

export class CharacterSheetRepository
	extends BaseRepository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>
	implements Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>
{
	constructor(database: DB) {
		// Pass the same DAO for both small and full items
		super(database, database.characterSheetDao, database.characterSheetDao);
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
	 */
	async importFromJson(jsonContent: string): Promise<FullCharacterSheet> {
		const rawSheet = JSON.parse(jsonContent) as Partial<CharacterSheet>;

		// Provide default disabledBlocks if missing (riardon.json format)
		const completeSheet: CharacterSheet = {
			tags: rawSheet.tags || [],
			disabledBlocks: rawSheet.disabledBlocks || {
				"info-left": [],
				"info-right": [],
				"subinfo-left": [],
				"subinfo-right": [],
				"notes-left": [],
				"notes-right": [],
				_id: "",
			},
			edition: rawSheet.edition || "2024",
			spells: rawSheet.spells || { mode: "cards", prepared: [], book: [] },
			data: rawSheet.data || "{}",
			jsonType: "character",
			version: rawSheet.version || "2",
		};

		const parsedSheet = parseCharacterData(completeSheet);

		// Extract fields for SmallCharacterSheet
		const charClass = parsedSheet.data.info.charClass?.value || "";
		const level = parsedSheet.data.info.level?.value || 1;
		const race = parsedSheet.data.info.race?.value || "";
		const name = parsedSheet.data.name?.value || "Unnamed Character";
		const playerName = parsedSheet.data.info.playerName?.value || "";

		const fullSheet: FullCharacterSheet = {
			...parsedSheet,
			name: { rus: name, eng: name },
			url: this.generateUrl(name),
			charClass,
			level,
			race,
			playerName,
		};

		await this.putItem(fullSheet);
		return fullSheet;
	}

	/**
	 * Generate URL from character name (lowercase with hyphens).
	 */
	private generateUrl(name: string): string {
		return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zа-я0-9-]/gi, "");
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
