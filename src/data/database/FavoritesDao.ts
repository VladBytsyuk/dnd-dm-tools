import type { Database } from "sql.js";
import type { EntityKind } from "src/domain/models/common/EntityOrigin";

export class FavoritesDao {
	constructor(private readonly database: Database) {}

	initialize(): void {
		this.database.exec(`
			CREATE TABLE IF NOT EXISTS favorites (
				entity_kind TEXT NOT NULL,
				url TEXT NOT NULL,
				PRIMARY KEY (entity_kind, url)
			);
		`);
	}

	has(kind: EntityKind, url: string): boolean {
		return Boolean(this.database.exec(
			"SELECT 1 FROM favorites WHERE entity_kind = ? AND url = ? LIMIT 1;",
			[kind, url],
		)[0]?.values.length);
	}

	listUrls(kind: EntityKind): string[] {
		const rows = this.database.exec(
			"SELECT url FROM favorites WHERE entity_kind = ? ORDER BY url;",
			[kind],
		);
		return (rows[0]?.values ?? []).map(([url]) => url as string);
	}

	add(kind: EntityKind, url: string): void {
		this.database.exec(
			"INSERT OR IGNORE INTO favorites (entity_kind, url) VALUES (?, ?);",
			[kind, url],
		);
	}

	delete(kind: EntityKind, url: string): void {
		this.database.exec(
			"DELETE FROM favorites WHERE entity_kind = ? AND url = ?;",
			[kind, url],
		);
	}
}
