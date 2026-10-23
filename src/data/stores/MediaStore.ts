import type { MediaSqlDao } from "src/data/database/MediaSqlDao";
import type { TransactionalStore } from "src/data/ports";
import type { MediaState } from "src/domain/models/media/MediaState";

export class MediaStore {
	constructor(private readonly dao: MediaSqlDao, private readonly transactions: TransactionalStore) {}

	read(): MediaState {
		return this.dao.read();
	}

	async save(state: MediaState, beforeWrite?: () => void): Promise<void> {
		// Detach the candidate before queueing so callers cannot change a pending write.
		const candidate: MediaState = JSON.parse(JSON.stringify(state));
		await this.transactions.transaction(async () => { beforeWrite?.(); this.dao.write(candidate); });
	}
}
