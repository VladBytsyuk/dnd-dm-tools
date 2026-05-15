import type { CharacterSheetSqlTableDao } from "src/data/database/CharacterSheetSqlTableDao";
import type { DmScreenGroupSqlTableDao } from "src/data/database/DmScreenGroupSqlTableDao";
import type { FullClassSqlTableDao } from "src/data/database/FullClassSqlTableDao";
import type { FullRaceSqlTableDao } from "src/data/database/FullRaceSqlTableDao";
import type { SmallClassSqlTableDao } from "src/data/database/SmallClassSqlTableDao";
import type { SmallRaceSqlTableDao } from "src/data/database/SmallRaceSqlTableDao";
import type { TransactionalStore } from "src/data/ports";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import type {
	CharacterSheetFilters,
	FullCharacterSheet,
	SmallCharacterSheet,
} from "src/domain/models/character";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import type { SmallRace } from "src/domain/models/race/SmallRace";

type RaceWithParent<T> = {
	race: T;
	parentUrl: string | null;
};

export class RaceStore {
	constructor(
		private readonly smallRaceDao: Pick<
			SmallRaceSqlTableDao,
			"readAllItemsWithParentUrl" | "readTopLevelRaces" | "readSubracesByParentUrl"
		>,
		private readonly fullRaceDao: Pick<
			FullRaceSqlTableDao,
			"createItem" | "createItemWithParent" | "readItemByUrl" | "readSubracesByParentUrl"
		>,
		private readonly transactions: TransactionalStore,
	) {}

	async saveRaceTree(race: FullRace): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullRaceDao.createItem(race);
			await this.saveSubraces(race.subraces ?? [], race.url);
		});
	}

	async readFullRaceByUrl(url: string): Promise<FullRace | null> {
		const race = await this.fullRaceDao.readItemByUrl(url);
		if (!race) return null;

		if (!race.subraces) {
			race.subraces = await this.readFullSubraces(url);
		}

		return race;
	}

	async readFullSubraces(parentUrl: string): Promise<FullRace[]> {
		const subraces = await this.fullRaceDao.readSubracesByParentUrl(parentUrl);

		for (const subrace of subraces) {
			if (!subrace.subraces) {
				subrace.subraces = await this.readFullSubraces(subrace.url);
			}
		}

		return subraces;
	}

	async readRacesWithSubraces(
		name: string | null = null,
		filters: RaceFilters | null = null,
	): Promise<SmallRace[]> {
		const flatRaces = await this.smallRaceDao.readAllItemsWithParentUrl(name, filters);
		return this.reconstructHierarchy(flatRaces);
	}

	async readTopLevelRaces(
		name: string | null,
		filters: RaceFilters | null,
	): Promise<SmallRace[]> {
		return this.smallRaceDao.readTopLevelRaces(name, filters);
	}

	async readSubraces(parentUrl: string): Promise<SmallRace[]> {
		return this.smallRaceDao.readSubracesByParentUrl(parentUrl);
	}

	private async saveSubraces(subraces: FullRace[], parentUrl: string): Promise<void> {
		for (const subrace of subraces) {
			await this.fullRaceDao.createItemWithParent(subrace, parentUrl);
			await this.saveSubraces(subrace.subraces ?? [], subrace.url);
		}
	}

	private reconstructHierarchy(flatRaces: RaceWithParent<SmallRace>[]): SmallRace[] {
		const raceMap = new Map<string, SmallRace>();

		for (const item of flatRaces) {
			raceMap.set(item.race.url, { ...item.race, subraces: [] });
		}

		const topLevel: SmallRace[] = [];
		for (const item of flatRaces) {
			const race = raceMap.get(item.race.url);
			if (!race) continue;

			if (item.parentUrl) {
				const parent = raceMap.get(item.parentUrl);
				parent?.subraces?.push(race);
			} else {
				topLevel.push(race);
			}
		}

		return topLevel;
	}
}

export class ClassStore {
	constructor(
		private readonly smallClassDao: Pick<
			SmallClassSqlTableDao,
			"readAllItems" | "readArchetypesByParentUrl" | "readItemByName"
		>,
		private readonly fullClassDao: Pick<
			FullClassSqlTableDao,
			"createItem" | "readItemByName" | "readItemByUrl" | "updateItem"
		>,
		private readonly transactions: TransactionalStore,
	) {}

	async readBaseClasses(
		name: string | null = null,
		filters: ClassesFilters | null = null,
	): Promise<SmallClass[]> {
		let classes = await this.smallClassDao.readAllItems(null, filters);
		classes = classes.filter((item) => !item.isArchetype);

		if (!name) return classes;

		const searchLower = name.toLocaleLowerCase("ru-RU");
		return classes.filter((item) => {
			const rusNameLower = item.name.rus.toLocaleLowerCase("ru-RU");
			const engNameLower = item.name.eng.toLocaleLowerCase("ru-RU");

			return rusNameLower.includes(searchLower) || engNameLower.includes(searchLower);
		});
	}

	async readArchetypesForClass(parentClassUrl: string): Promise<SmallClass[]> {
		return this.smallClassDao.readArchetypesByParentUrl(parentClassUrl);
	}

	async readSmallClassByName(name: string): Promise<SmallClass | null> {
		return this.smallClassDao.readItemByName(name);
	}

	async readFullClassByName(name: string): Promise<FullClass | null> {
		return this.fullClassDao.readItemByName(name);
	}

	async readFullClassByUrl(url: string): Promise<FullClass | null> {
		return this.fullClassDao.readItemByUrl(url);
	}

	async saveFullClass(fullClass: FullClass): Promise<void> {
		await this.transactions.transaction(async () => {
			const existing = await this.fullClassDao.readItemByUrl(fullClass.url);
			if (existing) {
				await this.fullClassDao.updateItem(fullClass);
			} else {
				await this.fullClassDao.createItem(fullClass);
			}
		});
	}
}

export class DmScreenStore {
	constructor(
		private readonly dmScreenDao: Pick<
			DmScreenGroupSqlTableDao,
			| "readAllItemsNames"
			| "readChildren"
			| "readChildrenCount"
			| "readItemByName"
			| "readItemByUrl"
			| "updateItem"
		>,
		private readonly transactions: TransactionalStore,
	) {}

	async readRootItems(): Promise<DmScreenItem[]> {
		return this.dmScreenDao.readChildren();
	}

	async readChildren(parentUrl: string): Promise<DmScreenItem[]> {
		return this.dmScreenDao.readChildren(parentUrl);
	}

	async readChildrenCount(parentUrl: string): Promise<number> {
		return this.dmScreenDao.readChildrenCount(parentUrl);
	}

	async readAllItemNames(): Promise<string[]> {
		return this.dmScreenDao.readAllItemsNames();
	}

	async readItemByName(name: string): Promise<DmScreenItem | null> {
		return this.dmScreenDao.readItemByName(name);
	}

	async readItemByUrl(url: string): Promise<DmScreenItem | null> {
		return this.dmScreenDao.readItemByUrl(url);
	}

	async updateItemDescription(item: DmScreenItem): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.dmScreenDao.updateItem(item);
		});
	}
}

export class CharacterSheetStore {
	constructor(
		private readonly characterSheetDao: Pick<
			CharacterSheetSqlTableDao,
			| "createItem"
			| "deleteItemByUrl"
			| "readAllSmallItems"
			| "readFullItemByUrl"
			| "readItemByUrl"
			| "updateItem"
		>,
		private readonly transactions: TransactionalStore,
	) {}

	async readAllSmallItems(): Promise<SmallCharacterSheet[]> {
		return this.characterSheetDao.readAllSmallItems(null, null);
	}

	async readFilteredSmallItems(
		name: string | null,
		filters: CharacterSheetFilters | null,
	): Promise<SmallCharacterSheet[]> {
		return this.characterSheetDao.readAllSmallItems(name, filters);
	}

	async readFullItemByUrl(url: string): Promise<FullCharacterSheet | null> {
		return this.characterSheetDao.readFullItemByUrl(url);
	}

	async isUrlAvailable(url: string): Promise<boolean> {
		return (await this.characterSheetDao.readItemByUrl(url)) === null;
	}

	async generateUniqueUrl(name: string): Promise<string> {
		const baseUrl = this.generateUrl(name);
		let candidate = baseUrl;
		let suffix = 2;

		while (!(await this.isUrlAvailable(candidate))) {
			candidate = `${baseUrl}-${suffix}`;
			suffix += 1;
		}

		return candidate;
	}

	async saveImportedSheet(sheet: FullCharacterSheet): Promise<void> {
		await this.saveSheet(sheet);
	}

	async saveSheet(sheet: FullCharacterSheet): Promise<void> {
		await this.transactions.transaction(async () => {
			const existing = await this.characterSheetDao.readItemByUrl(sheet.url);
			if (existing) {
				await this.characterSheetDao.updateItem(sheet);
			} else {
				await this.characterSheetDao.createItem(sheet);
			}
		});
	}

	async deleteByUrl(url: string): Promise<void> {
		await this.transactions.transaction(async () => {
			const existing = await this.characterSheetDao.readItemByUrl(url);
			if (existing) {
				await this.characterSheetDao.deleteItemByUrl(url);
			}
		});
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
}
