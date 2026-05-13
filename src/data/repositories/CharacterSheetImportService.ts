import type { CharacterSheetDaoLike } from "./characterSheetTypes";
import type { FullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import { CharacterSheetImportMapper } from "src/data/mappers/characterSheetImportMapper";

export class CharacterSheetImportService {
	private readonly mapper = new CharacterSheetImportMapper();

	constructor(private readonly characterSheetDao: CharacterSheetDaoLike) {}

	async importFromJson(jsonContent: string): Promise<FullCharacterSheet> {
		const mappedSheet = this.mapper.map(jsonContent);
		return {
			...mappedSheet,
			url: await this.generateUniqueUrl(mappedSheet.name.rus),
		};
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
