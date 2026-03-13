import type { CharacterSheetDaoLike } from "./characterSheetTypes";
import type { CharacterSheet } from "src/domain/models/character/CharacterSheet";
import type { FullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import { parseCharacterData } from "src/domain/models/character/CharacterSheet";

export class CharacterSheetImportService {
	constructor(private readonly characterSheetDao: CharacterSheetDaoLike) {}

	async importFromJson(jsonContent: string): Promise<FullCharacterSheet> {
		if (!jsonContent || typeof jsonContent !== "string") {
			throw new Error("Invalid input: expected non-empty string");
		}

		let rawSheet: Partial<CharacterSheet>;
		try {
			rawSheet = JSON.parse(jsonContent) as Partial<CharacterSheet>;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`Failed to parse JSON: ${error.message}`);
			}
			throw error;
		}

		if (typeof rawSheet !== "object" || rawSheet === null) {
			throw new Error("Invalid character sheet: expected JSON object");
		}

		if (rawSheet.jsonType && rawSheet.jsonType !== "character") {
			throw new Error(`Invalid jsonType: expected "character", got "${rawSheet.jsonType}"`);
		}

		const completeSheet: CharacterSheet = {
			tags: Array.isArray(rawSheet.tags) ? rawSheet.tags : [],
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

		try {
			const parsedSheet = parseCharacterData(completeSheet);
			const charClass = parsedSheet.data.info.charClass?.value || "";
			const level = parsedSheet.data.info.level?.value || 1;
			const race = parsedSheet.data.info.race?.value || "";
			const name = parsedSheet.data.name?.value || "Unnamed Character";
			const playerName = parsedSheet.data.info.playerName?.value || "";

			if (!name.trim()) {
				throw new Error("Invalid character sheet: character name is required");
			}

			return {
				...parsedSheet,
				name: { rus: name, eng: name },
				url: await this.generateUniqueUrl(name),
				charClass,
				level,
				race,
				playerName,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to import character sheet: ${error.message}`);
			}
			throw new Error("Failed to import character sheet: Unknown error");
		}
	}

	private generateUrl(name: string): string {
		const normalized = name
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-zа-я0-9-]/gi, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		return normalized || "character";
	}

	private async generateUniqueUrl(name: string): Promise<string> {
		const baseUrl = this.generateUrl(name);
		let candidate = baseUrl;
		let suffix = 2;

		while (await this.characterSheetDao.readItemByUrl(candidate)) {
			candidate = `${baseUrl}-${suffix}`;
			suffix += 1;
		}

		return candidate;
	}
}
