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
import type { EntityKind } from "src/domain/models/common/EntityOrigin";
import type { EntityOriginDao } from "src/data/database/EntityOriginDao";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";

type RaceWithParent<T> = {
	race: T;
	parentUrl: string | null;
};

export class RaceStore {
	constructor(
		private readonly smallRaceDao: Pick<
			SmallRaceSqlTableDao,
			"createItemWithParent" | "readAllItemsWithParentUrl" | "readItemByUrl" | "readTopLevelRaces" | "readSubracesByParentUrl" | "updateItem"
		>,
		private readonly fullRaceDao: Pick<
			FullRaceSqlTableDao,
			"createItem" | "createItemWithParent" | "readItemByUrl" | "readParentUrl" | "readSubracesByParentUrl" | "updateItem"
		>,
		private readonly transactions: TransactionalStore,
		private readonly entityKind?: EntityKind,
		private readonly origins?: EntityOriginDao,
	) {}

	async saveRaceTree(race: FullRace): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.fullRaceDao.createItem(race);
			if (this.entityKind && this.origins) await this.origins.ensureRemote(this.entityKind, race.url);
			await this.saveSubraces(race.subraces ?? [], race.url);
		});
	}

	async saveManualRaceTree(race: FullRace, parentUrl: string | null = null): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.saveManualRaceAndSubraces(race, parentUrl);
		});
	}

	async readFullRaceByUrl(url: string): Promise<FullRace | null> {
		const race = await this.fullRaceDao.readItemByUrl(url);
		if (!race) return null;

		if (!race.subraces) {
			race.subraces = await this.readFullSubraces(url);
		}

		return this.withOrigin(race);
	}

	async readFullSubraces(parentUrl: string): Promise<FullRace[]> {
		const subraces = await this.fullRaceDao.readSubracesByParentUrl(parentUrl);

		for (const subrace of subraces) {
			if (!subrace.subraces) {
				subrace.subraces = await this.readFullSubraces(subrace.url);
			}
		}

		return Promise.all(subraces.map((race) => this.withOrigin(race)));
	}

	async readRacesWithSubraces(
		name: string | null = null,
		filters: RaceFilters | null = null,
	): Promise<SmallRace[]> {
		const flatRaces = await this.smallRaceDao.readAllItemsWithParentUrl(name, filters);
		return this.reconstructHierarchy(await Promise.all(flatRaces.map(async ({ race, parentUrl }) => ({ race: await this.withOrigin(race), parentUrl }))));
	}

	async readTopLevelRaces(
		name: string | null,
		filters: RaceFilters | null,
	): Promise<SmallRace[]> {
		return Promise.all((await this.smallRaceDao.readTopLevelRaces(name, filters)).map((race) => this.withOrigin(race)));
	}

	async readSubraces(parentUrl: string): Promise<SmallRace[]> {
		return Promise.all((await this.smallRaceDao.readSubracesByParentUrl(parentUrl)).map((race) => this.withOrigin(race)));
	}

	async readSmallRaceByUrl(url: string): Promise<SmallRace | null> {
		const race = await this.smallRaceDao.readItemByUrl(url);
		return race ? this.withOrigin(race) : null;
	}

	async readParentUrl(url: string): Promise<string | null> {
		return this.fullRaceDao.readParentUrl(url);
	}

	private async saveSubraces(subraces: FullRace[], parentUrl: string): Promise<void> {
		for (const subrace of subraces) {
			await this.fullRaceDao.createItemWithParent(subrace, parentUrl);
			if (this.entityKind && this.origins) await this.origins.ensureRemote(this.entityKind, subrace.url);
			await this.saveSubraces(subrace.subraces ?? [], subrace.url);
		}
	}

	private async saveManualRaceAndSubraces(race: FullRace, parentUrl: string | null): Promise<void> {
		const smallRace = smallItemProjectors.race.project(race);
		if (await this.smallRaceDao.readItemByUrl(race.url)) await this.smallRaceDao.updateItem(smallRace);
		else await this.smallRaceDao.createItemWithParent(smallRace, parentUrl);

		if (await this.fullRaceDao.readItemByUrl(race.url)) await this.fullRaceDao.updateItem(race);
		else await this.fullRaceDao.createItemWithParent(race, parentUrl);

		if (this.entityKind && this.origins) await this.origins.markManual(this.entityKind, race.url);
		for (const subrace of race.subraces ?? []) await this.saveManualRaceAndSubraces(subrace, race.url);
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

	private async withOrigin<T extends SmallRace | FullRace>(item: T): Promise<T> {
		if (!this.entityKind || !this.origins) return item;
		return { ...item, origin: await this.origins.get(this.entityKind, item.url) };
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
		private readonly entityKind?: EntityKind,
		private readonly origins?: EntityOriginDao,
	) {}

	async readBaseClasses(
		name: string | null = null,
		filters: ClassesFilters | null = null,
	): Promise<SmallClass[]> {
		let classes = await this.smallClassDao.readAllItems(null, filters);
		classes = classes.filter((item) => !item.isArchetype);

		if (!name) return Promise.all(classes.map((item) => this.withOrigin(item)));

		const searchLower = name.toLocaleLowerCase("ru-RU");
		return Promise.all(classes.filter((item) => {
			const rusNameLower = item.name.rus.toLocaleLowerCase("ru-RU");
			const engNameLower = item.name.eng.toLocaleLowerCase("ru-RU");

			return rusNameLower.includes(searchLower) || engNameLower.includes(searchLower);
		}).map((item) => this.withOrigin(item)));
	}

	async readArchetypesForClass(parentClassUrl: string): Promise<SmallClass[]> {
		return Promise.all((await this.smallClassDao.readArchetypesByParentUrl(parentClassUrl)).map((item) => this.withOrigin(item)));
	}

	async readSmallClassByName(name: string): Promise<SmallClass | null> {
		const item = await this.smallClassDao.readItemByName(name);
		return item ? this.withOrigin(item) : null;
	}

	async readFullClassByName(name: string): Promise<FullClass | null> {
		const item = await this.fullClassDao.readItemByName(name);
		return item ? this.withOrigin(item) : null;
	}

	async readFullClassByUrl(url: string): Promise<FullClass | null> {
		const item = await this.fullClassDao.readItemByUrl(url);
		return item ? this.withOrigin(item) : null;
	}

	async saveFullClass(fullClass: FullClass): Promise<void> {
		await this.transactions.transaction(async () => {
			const existing = await this.fullClassDao.readItemByUrl(fullClass.url);
			if (existing) {
				await this.fullClassDao.updateItem(fullClass);
			} else {
				await this.fullClassDao.createItem(fullClass);
			}
			if (this.entityKind && this.origins) await this.origins.ensureRemote(this.entityKind, fullClass.url);
		});
	}

	private async withOrigin<T extends SmallClass | FullClass>(item: T): Promise<T> {
		if (!this.entityKind || !this.origins) return item;
		return { ...item, origin: await this.origins.get(this.entityKind, item.url) };
	}
}

export class DmScreenStore {
	constructor(
		private readonly dmScreenDao: Pick<
			DmScreenGroupSqlTableDao,
			| "createItem"
			| "readAllItemsNames"
			| "readChildren"
			| "readChildrenCount"
			| "readItemByName"
			| "readItemByUrl"
			| "updateItem"
		>,
		private readonly transactions: TransactionalStore,
		private readonly entityKind?: EntityKind,
		private readonly origins?: EntityOriginDao,
	) {}

	async readRootItems(): Promise<DmScreenItem[]> {
		return this.withOrigins(await this.dmScreenDao.readChildren());
	}

	async readChildren(parentUrl: string): Promise<DmScreenItem[]> {
		return this.withOrigins(await this.dmScreenDao.readChildren(parentUrl));
	}

	async readChildrenCount(parentUrl: string): Promise<number> {
		return this.dmScreenDao.readChildrenCount(parentUrl);
	}

	async readAllItemNames(): Promise<string[]> {
		return this.dmScreenDao.readAllItemsNames();
	}

	async readItemByName(name: string): Promise<DmScreenItem | null> {
		const item = await this.dmScreenDao.readItemByName(name);
		return item ? this.withOrigin(item) : null;
	}

	async readItemByUrl(url: string): Promise<DmScreenItem | null> {
		const item = await this.dmScreenDao.readItemByUrl(url);
		return item ? this.withOrigin(item) : null;
	}

	async updateItemDescription(item: DmScreenItem): Promise<void> {
		await this.transactions.transaction(async () => {
			await this.dmScreenDao.updateItem(item);
			if (this.entityKind && this.origins) await this.origins.ensureRemote(this.entityKind, item.url);
		});
	}

	async saveManualItem(item: DmScreenItem): Promise<void> {
		await this.transactions.transaction(async () => {
			const existing = await this.dmScreenDao.readItemByUrl(item.url);
			if (existing) await this.dmScreenDao.updateItem(item);
			else await this.dmScreenDao.createItem(item);
			if (this.entityKind && this.origins) await this.origins.markManual(this.entityKind, item.url);
		});
	}

	private async withOrigins(items: DmScreenItem[]): Promise<DmScreenItem[]> {
		return Promise.all(items.map((item) => this.withOrigin(item)));
	}

	private async withOrigin(item: DmScreenItem): Promise<DmScreenItem> {
		if (!this.entityKind || !this.origins) return item;
		return { ...item, origin: await this.origins.get(this.entityKind, item.url) };
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
}
