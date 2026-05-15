import {
	armorMapper,
	artifactMapper,
	BackgroundMapper,
	ClassMapper,
	DmScreenDescriptionMapper,
	featMapper,
	itemMapper,
	monsterMapper,
	RaceMapper,
	spellMapper,
	weaponMapper,
} from "src/data/mappers/sourceMappers";
import { CharacterSheetImportMapper } from "src/data/mappers/characterSheetImportMapper";
import type { FullItemMapper, FullItemReadService, ServiceResult } from "src/data/ports";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import type { TtgApiRequestOptions, TtgItemWithHtml, TtgJsonObject } from "src/data/services";
import { TtgService } from "src/data/services";
import { CharacterSheetStore, ClassStore, DbTransactionalStore, DmScreenStore, RaceStore } from "src/data/stores";
import type DB from "src/data/database/DB";
import { createSimpleRepositoryDependencies, type SimpleRepositoryDependencies } from "./SimpleRepository";
import { ArsenalRepository } from "./ArsenalRepository";
import { ArmoryRepository } from "./ArmoryRepository";
import { ArtifactoryRepository } from "./ArtifactoryRepository";
import { BackgroundRepository } from "./BackgroundRepository";
import { BestiaryRepository } from "./BestiaryRepository";
import { CharacterSheetRepository, type CharacterSheetRepositoryDependencies } from "./CharacterSheetRepository";
import { ClassesRepository, type ClassesRepositoryDependencies, type ClassWithHtmlResponse } from "./ClassesRepository";
import { DmScreenRepository, type DmScreenRepositoryDependencies } from "./DmScreenRepository";
import { EquipmentRepository } from "./EquipmentRepository";
import { FeatsRepository } from "./FeatsRepository";
import { RacesRepository, type RacesRepositoryDependencies } from "./RacesRepository";
import { SpellbookRepository } from "./SpellbookRepository";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type { FullCharacterSheet, SmallCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { SmallItem } from "src/domain/models/items/SmallItem";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import type { BaseItem } from "src/domain/models/common/BaseItem";

type BackgroundWithHtmlResponse = TtgItemWithHtml<Record<string, unknown>>;

class BackgroundWithHtmlService implements FullItemReadService<BackgroundWithHtmlResponse> {
	constructor(private readonly service: TtgService) {}

	async getFullItem(url: string): Promise<ServiceResult<BackgroundWithHtmlResponse>> {
		return await this.service.getBackgroundWithHtml(url);
	}
}

class BackgroundWithHtmlMapper extends BackgroundMapper {
	override map(response: BackgroundWithHtmlResponse, url: string): FullBackground {
		return super.map({
			...response.item,
			associatedUrl: response.associatedUrl,
			associatedHtml: response.associatedHtml,
		}, url);
	}
}

class ClassWithHtmlService implements FullItemReadService<ClassWithHtmlResponse, TtgApiRequestOptions> {
	constructor(private readonly service: TtgService) {}

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

class RaceTreeService implements FullItemReadService<TtgJsonObject, TtgApiRequestOptions> {
	constructor(private readonly service: TtgService) {}

	async getFullItem(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		return await this.service.getRaceTree(url, options);
	}
}

class DmScreenDescriptionService implements FullItemReadService<TtgJsonObject> {
	constructor(private readonly service: TtgService) {}

	async getFullItem(url: string): Promise<ServiceResult<TtgJsonObject>> {
		return await this.service.getDmScreenDescription(url);
	}
}

export interface RepositoryFactoryServices {
	ttgService?: TtgService;
}

function serviceFrom(options: RepositoryFactoryServices = {}): TtgService {
	return options.ttgService ?? new TtgService();
}

function createSimpleDependencies<TSmall extends BaseItem, TFull extends TSmall, TFilter, TResponse = Partial<TFull>>(
	database: DB,
	smallDao: any,
	fullDao: any,
	mapper: FullItemMapper<TResponse, TFull>,
	projector: SimpleRepositoryDependencies<TSmall, TFull, TFilter, TResponse>["projector"],
	service?: FullItemReadService<TResponse>,
): SimpleRepositoryDependencies<TSmall, TFull, TFilter, TResponse> {
	return createSimpleRepositoryDependencies(database, smallDao, fullDao, mapper, projector, service);
}

export function createBestiaryRepository(database: DB, options: RepositoryFactoryServices = {}): BestiaryRepository {
	return new BestiaryRepository(createSimpleDependencies<SmallMonster, FullMonster, BestiaryFilters>(
		database,
		database.smallMonsterDao,
		database.fullMonsterDao,
		monsterMapper,
		smallItemProjectors.monster,
		serviceFrom(options),
	));
}

export function createSpellbookRepository(database: DB, options: RepositoryFactoryServices = {}): SpellbookRepository {
	return new SpellbookRepository(createSimpleDependencies<SmallSpell, FullSpell, SpellbookFilters>(
		database,
		database.smallSpellDao,
		database.fullSpellDao,
		spellMapper,
		smallItemProjectors.spell,
		serviceFrom(options),
	));
}

export function createArsenalRepository(database: DB, options: RepositoryFactoryServices = {}): ArsenalRepository {
	return new ArsenalRepository(createSimpleDependencies<SmallWeapon, FullWeapon, ArsenalFilters>(
		database,
		database.smallWeaponDao,
		database.fullWeaponDao,
		weaponMapper,
		smallItemProjectors.weapon,
		serviceFrom(options),
	));
}

export function createArmoryRepository(database: DB, options: RepositoryFactoryServices = {}): ArmoryRepository {
	return new ArmoryRepository(createSimpleDependencies<SmallArmor, FullArmor, ArmoryFilters>(
		database,
		database.smallArmorDao,
		database.fullArmorDao,
		armorMapper,
		smallItemProjectors.armor,
		serviceFrom(options),
	));
}

export function createEquipmentRepository(database: DB, options: RepositoryFactoryServices = {}): EquipmentRepository {
	return new EquipmentRepository(createSimpleDependencies<SmallItem, FullItem, EquipmentFilters>(
		database,
		database.smallItemDao,
		database.fullItemDao,
		itemMapper,
		smallItemProjectors.item,
		serviceFrom(options),
	));
}

export function createArtifactoryRepository(database: DB, options: RepositoryFactoryServices = {}): ArtifactoryRepository {
	return new ArtifactoryRepository(createSimpleDependencies<SmallArtifact, FullArtifact, ArtifactoryFilters>(
		database,
		database.smallArtifactDao,
		database.fullArtifactDao,
		artifactMapper,
		smallItemProjectors.artifact,
		serviceFrom(options),
	));
}

export function createBackgroundRepository(database: DB, options: RepositoryFactoryServices = {}): BackgroundRepository {
	return new BackgroundRepository(createSimpleDependencies<
		SmallBackground,
		FullBackground,
		BackgroundsFilters,
		BackgroundWithHtmlResponse
	>(
		database,
		database.smallBackgroundDao,
		database.fullBackgroundDao,
		new BackgroundWithHtmlMapper(),
		smallItemProjectors.background,
		new BackgroundWithHtmlService(serviceFrom(options)),
	));
}

export function createFeatsRepository(database: DB, options: RepositoryFactoryServices = {}): FeatsRepository {
	return new FeatsRepository(createSimpleDependencies<SmallFeat, FullFeat, FeatsFilters>(
		database,
		database.smallFeatDao,
		database.fullFeatDao,
		featMapper,
		smallItemProjectors.feat,
		serviceFrom(options),
	));
}

export function createClassesRepository(database: DB, options: RepositoryFactoryServices = {}): ClassesRepository {
	const transactions = new DbTransactionalStore(database);
	const service = new ClassWithHtmlService(serviceFrom(options));
	const mapper = new ClassWithHtmlMapper();
	const dependencies: ClassesRepositoryDependencies = {
		simpleDependencies: createSimpleDependencies<SmallClass, FullClass, ClassesFilters, ClassWithHtmlResponse>(
			database,
			database.smallClassDao,
			database.fullClassDao,
			mapper,
			smallItemProjectors.class,
			service,
		),
		classStore: new ClassStore(database.smallClassDao, database.fullClassDao, transactions),
		service,
		mapper,
	};
	return new ClassesRepository(dependencies);
}

export function createRacesRepository(database: DB, options: RepositoryFactoryServices = {}): RacesRepository {
	const transactions = new DbTransactionalStore(database);
	const service = new RaceTreeService(serviceFrom(options));
	const mapper = new RaceMapper();
	const dependencies: RacesRepositoryDependencies = {
		simpleDependencies: createSimpleDependencies<SmallRace, FullRace, RaceFilters, TtgJsonObject>(
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
	return new RacesRepository(dependencies);
}

export function createDmScreenRepository(database: DB, options: RepositoryFactoryServices = {}): DmScreenRepository {
	const dependencies: DmScreenRepositoryDependencies = {
		dao: database.dmScreenGroupDao,
		store: new DmScreenStore(database.dmScreenGroupDao, new DbTransactionalStore(database)),
		service: new DmScreenDescriptionService(serviceFrom(options)),
		mapper: new DmScreenDescriptionMapper(),
	};
	return new DmScreenRepository(dependencies);
}

export function createCharacterSheetRepository(database: DB): CharacterSheetRepository {
	const dependencies: CharacterSheetRepositoryDependencies = {
		database,
		store: new CharacterSheetStore(database.characterSheetDao, new DbTransactionalStore(database)),
		importMapper: new CharacterSheetImportMapper(),
	};
	return new CharacterSheetRepository(dependencies);
}
