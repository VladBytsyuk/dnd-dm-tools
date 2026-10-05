import type { FavoritesDao } from "src/data/database/FavoritesDao";
import type { EntityKind } from "src/domain/models/common/EntityOrigin";
import type { TransactionalStore } from "src/data/ports";

export class FavoritesStore {
	constructor(
		private readonly dao: FavoritesDao,
		private readonly transactions: TransactionalStore,
	) {}

	has(kind: EntityKind, url: string): boolean {
		return this.dao.has(kind, url);
	}

	listUrls(kind: EntityKind): string[] {
		return this.dao.listUrls(kind);
	}

	async set(kind: EntityKind, url: string, favorite: boolean): Promise<void> {
		await this.transactions.transaction(async () => {
			if (favorite) this.dao.add(kind, url);
			else this.dao.delete(kind, url);
		});
	}
}
