import type { Database, SqlValue } from "sql.js";
import type { EntityKind, EntityOrigin } from "src/domain/models/common/EntityOrigin";

export interface EntityOriginRef {
	kind: EntityKind;
	url: string;
}

export class EntityOriginDao {
	constructor(private readonly database: Database) {}

	async initialize(): Promise<void> {
		this.database.exec(`
			CREATE TABLE IF NOT EXISTS entity_origins (
				entity_kind TEXT NOT NULL,
				url TEXT NOT NULL,
				origin TEXT NOT NULL CHECK(origin IN ('remote', 'manual')),
				PRIMARY KEY (entity_kind, url)
			);
		`);
	}

	async get(kind: EntityKind, url: string): Promise<EntityOrigin> {
		const result = this.database.exec(
			"SELECT origin FROM entity_origins WHERE entity_kind = ? AND url = ?;",
			[kind, url],
		);
		return result.length && result[0].values.length
			? result[0].values[0][0] as EntityOrigin
			: "remote";
	}

	async exists(kind: EntityKind, url: string): Promise<boolean> {
		const result = this.database.exec(
			"SELECT 1 FROM entity_origins WHERE entity_kind = ? AND url = ? LIMIT 1;",
			[kind, url],
		);
		return Boolean(result[0]?.values.length);
	}

	async getMany(kind: EntityKind, urls: string[]): Promise<Map<string, EntityOrigin>> {
		if (!urls.length) return new Map();
		const result = this.database.exec(
			`SELECT url, origin FROM entity_origins WHERE entity_kind = ? AND url IN (${urls.map(() => "?").join(", ")});`,
			[kind, ...urls] as SqlValue[],
		);
		return new Map((result[0]?.values ?? []).map(([url, origin]) => [url as string, origin as EntityOrigin]));
	}

	async ensureRemote(kind: EntityKind, url: string): Promise<void> {
		this.database.exec(
			"INSERT OR IGNORE INTO entity_origins (entity_kind, url, origin) VALUES (?, ?, 'remote');",
			[kind, url],
		);
	}

	async markManual(kind: EntityKind, url: string): Promise<void> {
		this.database.exec(
			"INSERT INTO entity_origins (entity_kind, url, origin) VALUES (?, ?, 'manual') ON CONFLICT(entity_kind, url) DO UPDATE SET origin = 'manual';",
			[kind, url],
		);
	}

	async delete(kind: EntityKind, url: string): Promise<void> {
		this.database.exec("DELETE FROM entity_origins WHERE entity_kind = ? AND url = ?;", [kind, url]);
	}

	async listManual(): Promise<EntityOriginRef[]> {
		const result = this.database.exec("SELECT entity_kind, url FROM entity_origins WHERE origin = 'manual' ORDER BY entity_kind, url;");
		return (result[0]?.values ?? []).map(([kind, url]) => ({ kind: kind as EntityKind, url: url as string }));
	}
}
