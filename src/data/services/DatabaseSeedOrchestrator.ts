import {
	ClassSeedMapper,
	DmScreenSeedMapper,
	RaceSeedMapper,
} from "src/data/mappers/seedMappers";
import {
	ArmorySeedService,
	ArsenalSeedService,
	ArtifactorySeedService,
	BackgroundSeedService,
	BestiarySeedService,
	ClassesSeedService,
	DmScreenSeedService,
	EquipmentSeedService,
	FeatsSeedService,
	RacesSeedService,
	SpellbookSeedService,
} from "src/data/services/seedServices";
import type { SeedStore } from "src/data/stores/SeedStore";
import type { SmallArmorSqlTableDao } from "src/data/database/SmallArmorSqlTableDao";
import type { SmallArtifactSqlTableDao } from "src/data/database/SmallArtifactSqlTableDao";
import type { SmallBackgroundSqlTableDao } from "src/data/database/SmallBackgroundSqlTableDao";
import type { SmallClassSqlTableDao } from "src/data/database/SmallClassSqlTableDao";
import type { DmScreenGroupSqlTableDao } from "src/data/database/DmScreenGroupSqlTableDao";
import type { SmallFeatSqlTableDao } from "src/data/database/SmallFeatSqlTableDao";
import type { SmallItemSqlTableDao } from "src/data/database/SmallItemSqlTableDao";
import type { SmallMonsterSqlTableDao } from "src/data/database/SmallMonsterSqlTableDao";
import type { SmallRaceSqlTableDao } from "src/data/database/SmallRaceSqlTableDao";
import type { SmallSpellSqlTableDao } from "src/data/database/SmallSpellSqlTableDao";
import type { SmallWeaponSqlTableDao } from "src/data/database/SmallWeaponSqlTableDao";

export interface SeedDaos {
	smallMonsterDao: SmallMonsterSqlTableDao;
	smallSpellDao: SmallSpellSqlTableDao;
	dmScreenGroupDao: DmScreenGroupSqlTableDao;
	smallWeaponDao: SmallWeaponSqlTableDao;
	smallArmorDao: SmallArmorSqlTableDao;
	smallItemDao: SmallItemSqlTableDao;
	smallArtifactDao: SmallArtifactSqlTableDao;
	smallBackgroundDao: SmallBackgroundSqlTableDao;
	smallFeatDao: SmallFeatSqlTableDao;
	smallRaceDao: SmallRaceSqlTableDao;
	smallClassDao: SmallClassSqlTableDao;
}

export class DatabaseSeedOrchestrator {
	private readonly classSeedMapper = new ClassSeedMapper();
	private readonly dmScreenSeedMapper = new DmScreenSeedMapper();
	private readonly raceSeedMapper = new RaceSeedMapper();

	constructor(
		private readonly seedStore: SeedStore,
		private readonly daos: SeedDaos,
	) {}

	async seedAll(): Promise<void> {
		await this.seedSmallMonster();
		await this.seedSmallSpell();
		await this.seedDmScreen();
		await this.seedSmallWeapon();
		await this.seedSmallArmor();
		await this.seedSmallItem();
		await this.seedSmallArtifact();
		await this.seedSmallBackground();
		await this.seedSmallFeat();
		await this.seedSmallRace();
		await this.seedSmallClass();
	}

	async seedSmallClass(): Promise<void> {
		await this.seedStore.seedTable(
			this.daos.smallClassDao,
			new ClassesSeedService(),
			this.classSeedMapper,
		);
	}

	private async seedSmallMonster(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallMonsterDao, new BestiarySeedService());
	}

	private async seedSmallSpell(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallSpellDao, new SpellbookSeedService());
	}

	private async seedDmScreen(): Promise<void> {
		await this.seedStore.seedTable(
			this.daos.dmScreenGroupDao,
			new DmScreenSeedService(),
			this.dmScreenSeedMapper,
		);
	}

	private async seedSmallWeapon(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallWeaponDao, new ArsenalSeedService());
	}

	private async seedSmallArmor(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallArmorDao, new ArmorySeedService());
	}

	private async seedSmallItem(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallItemDao, new EquipmentSeedService());
	}

	private async seedSmallArtifact(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallArtifactDao, new ArtifactorySeedService());
	}

	private async seedSmallBackground(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallBackgroundDao, new BackgroundSeedService());
	}

	private async seedSmallFeat(): Promise<void> {
		await this.seedStore.seedTable(this.daos.smallFeatDao, new FeatsSeedService());
	}

	private async seedSmallRace(): Promise<void> {
		await this.seedStore.seedRaceTable(
			this.daos.smallRaceDao,
			new RacesSeedService(),
			this.raceSeedMapper,
		);
	}
}
