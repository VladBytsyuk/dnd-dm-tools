import { describe, expect, it, vi } from "vitest";
import type DB from "src/data/database/DB";
import type { TtgService } from "src/data/services";
import {
	createArsenalRepository,
	createArmoryRepository,
	createArtifactoryRepository,
	createBackgroundRepository,
	createBestiaryRepository,
	createCharacterSheetRepository,
	createClassesRepository,
	createDmScreenRepository,
	createEquipmentRepository,
	createFeatsRepository,
	createRacesRepository,
	createSpellbookRepository,
} from "src/data/repositories/factories";
import { ArsenalRepository } from "src/data/repositories/ArsenalRepository";
import { ArmoryRepository } from "src/data/repositories/ArmoryRepository";
import { ArtifactoryRepository } from "src/data/repositories/ArtifactoryRepository";
import { BackgroundRepository } from "src/data/repositories/BackgroundRepository";
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import { CharacterSheetRepository } from "src/data/repositories/CharacterSheetRepository";
import { ClassesRepository } from "src/data/repositories/ClassesRepository";
import { DmScreenRepository } from "src/data/repositories/DmScreenRepository";
import { EquipmentRepository } from "src/data/repositories/EquipmentRepository";
import { FeatsRepository } from "src/data/repositories/FeatsRepository";
import { RacesRepository } from "src/data/repositories/RacesRepository";
import { SpellbookRepository } from "src/data/repositories/SpellbookRepository";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import { fullSpellFireball } from "../../__mocks__/domain/models/spell/full_spell_items";
import { fullClassBard } from "../../__mocks__/domain/models/class/full_class_items";
import { fullRace1, fullRace1Subrace } from "../../__mocks__/domain/models/race/full_race_items";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";

function createDao(overrides: Record<string, unknown> = {}) {
	return {
		readAllItems: vi.fn(async () => []),
		readAllItemsNames: vi.fn(async () => []),
		readItemByName: vi.fn(async () => null),
		readItemByUrl: vi.fn(async () => null),
		createItem: vi.fn(async () => undefined),
		updateItem: vi.fn(async () => undefined),
		deleteItemByUrl: vi.fn(async () => undefined),
		...overrides,
	};
}

function createDatabase(overrides: Record<string, unknown> = {}): DB {
	const db = {
		transaction: vi.fn(async (callback: () => Promise<void>) => {
			await callback();
		}),
		smallMonsterDao: createDao(),
		fullMonsterDao: createDao(),
		smallSpellDao: createDao(),
		fullSpellDao: createDao(),
		smallWeaponDao: createDao(),
		fullWeaponDao: createDao(),
		smallArmorDao: createDao(),
		fullArmorDao: createDao(),
		smallItemDao: createDao(),
		fullItemDao: createDao(),
		smallArtifactDao: createDao(),
		fullArtifactDao: createDao(),
		smallBackgroundDao: createDao(),
		fullBackgroundDao: createDao(),
		smallFeatDao: createDao(),
		fullFeatDao: createDao(),
		smallRaceDao: createDao({
			readAllItemsWithParentUrl: vi.fn(async () => []),
			readTopLevelRaces: vi.fn(async () => []),
			readSubracesByParentUrl: vi.fn(async () => []),
		}),
		fullRaceDao: createDao({
			createItemWithParent: vi.fn(async () => undefined),
			readSubracesByParentUrl: vi.fn(async () => []),
		}),
		smallClassDao: createDao({
			readArchetypesByParentUrl: vi.fn(async () => []),
		}),
		fullClassDao: createDao(),
		dmScreenGroupDao: createDao({
			readChildren: vi.fn(async () => []),
			readChildrenCount: vi.fn(async () => 0),
		}),
		characterSheetDao: createDao({
			readAllSmallItems: vi.fn(async () => []),
			readFullItemByUrl: vi.fn(async () => null),
		}),
		...overrides,
	};
	return db as unknown as DB;
}

describe("repository factories", () => {
	it("construct every feature repository from centralized factories", () => {
		const database = createDatabase();

		expect(createBestiaryRepository(database)).toBeInstanceOf(BestiaryRepository);
		expect(createSpellbookRepository(database)).toBeInstanceOf(SpellbookRepository);
		expect(createArsenalRepository(database)).toBeInstanceOf(ArsenalRepository);
		expect(createArmoryRepository(database)).toBeInstanceOf(ArmoryRepository);
		expect(createEquipmentRepository(database)).toBeInstanceOf(EquipmentRepository);
		expect(createArtifactoryRepository(database)).toBeInstanceOf(ArtifactoryRepository);
		expect(createBackgroundRepository(database)).toBeInstanceOf(BackgroundRepository);
		expect(createFeatsRepository(database)).toBeInstanceOf(FeatsRepository);
		expect(createClassesRepository(database)).toBeInstanceOf(ClassesRepository);
		expect(createRacesRepository(database)).toBeInstanceOf(RacesRepository);
		expect(createDmScreenRepository(database)).toBeInstanceOf(DmScreenRepository);
		expect(createCharacterSheetRepository(database)).toBeInstanceOf(CharacterSheetRepository);
	});

	it("wires simple repositories through read/write stores, TTG service, mapper, and projector", async () => {
		const service = {
			getFullItem: vi.fn(async () => ({ ok: true as const, value: { ...fullSpellFireball, url: undefined } })),
		} as unknown as TtgService;
		const database = createDatabase();
		const repository = createSpellbookRepository(database, { ttgService: service });

		await expect(repository.getFullItemByUrl(fullSpellFireball.url)).resolves.toEqual(fullSpellFireball);
		expect((service as any).getFullItem).toHaveBeenCalledWith(fullSpellFireball.url);
		expect(database.fullSpellDao.createItem).toHaveBeenCalledWith(fullSpellFireball);

		await repository.putItem(fullSpellFireball);
		expect(database.smallSpellDao.createItem).toHaveBeenCalledWith(
			smallItemProjectors.spell.project(fullSpellFireball),
		);
		expect(database.fullSpellDao.createItem).toHaveBeenCalledWith(fullSpellFireball);
	});

	it("wires class repositories with class store, class HTML service, mapper, and class projector", async () => {
		const service = {
			getClassWithHtml: vi.fn(async () => ({
				ok: true as const,
				value: {
					item: { ...fullClassBard, associatedUrl: undefined, associatedHtml: undefined },
					associatedUrl: fullClassBard.associatedUrl,
					associatedHtml: fullClassBard.associatedHtml,
				},
			})),
		} as unknown as TtgService;
		const database = createDatabase();
		const repository = createClassesRepository(database, { ttgService: service });

		await expect(repository.getFullItemByUrl(fullClassBard.url)).resolves.toEqual(fullClassBard);

		expect((service as any).getClassWithHtml).toHaveBeenCalledWith(fullClassBard.url, expect.objectContaining({
			sourceBooks: expect.any(Array),
		}));
		expect(database.fullClassDao.createItem).toHaveBeenCalledWith(fullClassBard);
	});

	it("wires race repositories with race tree store, race service, mapper, and race projector", async () => {
		const raceTree = { ...fullRace1, subraces: [fullRace1Subrace] };
		const service = {
			getRaceTree: vi.fn(async () => ({ ok: true as const, value: raceTree })),
		} as unknown as TtgService;
		const database = createDatabase();
		const repository = createRacesRepository(database, { ttgService: service });

		await expect(repository.getFullItemByUrl(fullRace1.url)).resolves.toEqual(raceTree);

		expect((service as any).getRaceTree).toHaveBeenCalledWith(fullRace1.url, expect.objectContaining({
			sourceBooks: expect.any(Array),
		}));
		expect(database.fullRaceDao.createItem).toHaveBeenCalledWith(raceTree);
		expect(database.fullRaceDao.createItemWithParent).toHaveBeenCalledWith(fullRace1Subrace, fullRace1.url);
	});

	it("wires DM screen repositories with DM screen store, description service, and mapper", async () => {
		const item: DmScreenItem = {
			name: { rus: "Атака", eng: "Attack" },
			url: "/screens/attack",
			order: 1,
			source: { shortName: "PHB", name: "Книга игрока", group: { name: "Core", shortName: "Basic" } },
		};
		const describedItem = { ...item, description: "<p>Описание</p>" };
		const service = {
			getDmScreenDescription: vi.fn(async () => ({ ok: true as const, value: describedItem })),
		} as unknown as TtgService;
		const database = createDatabase({
			dmScreenGroupDao: createDao({
				readChildren: vi.fn(async () => []),
				readChildrenCount: vi.fn(async () => 0),
				readItemByUrl: vi.fn(async () => item),
			}),
		});
		const repository = createDmScreenRepository(database, { ttgService: service });

		await expect(repository.getFullItemByUrl(item.url)).resolves.toEqual(describedItem);

		expect((service as any).getDmScreenDescription).toHaveBeenCalledWith(item.url);
		expect(database.dmScreenGroupDao.updateItem).toHaveBeenCalledWith(describedItem);
	});
});
