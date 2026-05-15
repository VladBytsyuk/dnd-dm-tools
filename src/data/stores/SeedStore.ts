import type { SeedReadService, ServiceResult, TransactionalStore } from "src/data/ports";
import type { RaceSeedItem } from "src/data/mappers/seedMappers";
import type { Dao } from "src/domain/Dao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { SmallRace } from "src/domain/models/race/SmallRace";

interface SeedMapper<TSeed, TItem> {
	mapSeeds(seeds: TSeed[]): TItem[];
}

interface RaceSeedDao {
	getTableName(): string;
	isTableExists(): Promise<boolean>;
	isTableEmpty(): Promise<boolean>;
	createItemWithParent(item: SmallRace, parentUrl: string | null): Promise<void>;
}

const identitySeedMapper = {
	mapSeeds<TItem>(seeds: TItem[]): TItem[] {
		return seeds;
	},
};

export class SeedStore {
	constructor(private readonly transactions: TransactionalStore) {}

	async seedTable<TSeed, TItem extends BaseItem, TFilter = unknown>(
		dao: Pick<Dao<TItem, TFilter>, "createItem" | "getTableName" | "isTableEmpty" | "isTableExists">,
		service: SeedReadService<TSeed>,
		mapper: SeedMapper<TSeed, TItem> = identitySeedMapper as unknown as SeedMapper<TSeed, TItem>,
	): Promise<void> {
		await this.seedIfEmpty(dao, async () => {
			const seeds = await this.readSeeds(service);
			for (const item of mapper.mapSeeds(seeds)) {
				await dao.createItem(item);
			}
		});
	}

	async seedRaceTable(
		dao: RaceSeedDao,
		service: SeedReadService<SmallRace>,
		mapper: SeedMapper<SmallRace, RaceSeedItem>,
	): Promise<void> {
		await this.seedIfEmpty(dao, async () => {
			const seeds = await this.readSeeds(service);
			for (const item of mapper.mapSeeds(seeds)) {
				await dao.createItemWithParent(item.item, item.parentUrl);
			}
		});
	}

	private async seedIfEmpty(
		dao: Pick<Dao<BaseItem, unknown>, "getTableName" | "isTableEmpty" | "isTableExists">,
		writeSeeds: () => Promise<void>,
	): Promise<void> {
		await this.transactions.transaction(async () => {
			const tableExists = await dao.isTableExists();
			if (!tableExists) {
				console.warn(`Table ${dao.getTableName()} does not exist. Cannot fill with seed data.`);
				return;
			}

			const tableEmpty = await dao.isTableEmpty();
			if (!tableEmpty) return;

			await writeSeeds();
		});
	}

	private async readSeeds<TSeed>(service: SeedReadService<TSeed>): Promise<TSeed[]> {
		const result: ServiceResult<TSeed[]> = await service.readSeeds();
		if (result.ok) return result.value;

		throw new Error(`Seed read failed: ${result.reason}`);
	}
}
