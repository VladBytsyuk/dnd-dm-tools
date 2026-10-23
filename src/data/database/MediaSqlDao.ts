import type { Database } from "sql.js";
import { createDefaultMediaState, loadMediaState, type MediaState } from "src/domain/models/media/MediaState";

const collections = ["adventures", "scenes", "tracks", "playlists"] as const;

/** SQL adapter for the media library; audio files themselves remain in the vault. */
export class MediaSqlDao {
	constructor(private readonly database: Database) {}

	initialize(): void {
		this.database.exec(`
			CREATE TABLE IF NOT EXISTS media_entities (
				kind TEXT NOT NULL, id TEXT NOT NULL, url TEXT NOT NULL, name TEXT NOT NULL,
				data TEXT NOT NULL, PRIMARY KEY (kind, id), UNIQUE (kind, url)
			);
			CREATE TABLE IF NOT EXISTS media_state (
				id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL
			);
		`);
	}

	read(): MediaState {
		const metadata = this.database.exec("SELECT data FROM media_state WHERE id = 1;")[0]?.values[0]?.[0];
		const state: MediaState = { ...createDefaultMediaState(), ...(metadata ? JSON.parse(String(metadata)) : {}) };
		for (const kind of collections) {
			const rows = this.database.exec("SELECT data FROM media_entities WHERE kind = ? ORDER BY rowid;", [kind]);
			(state[kind] as unknown[]) = (rows[0]?.values ?? []).map(([data]) => JSON.parse(String(data)));
		}
		return loadMediaState(state);
	}

	/** Caller owns the transaction, including persistence to disk. */
	write(state: MediaState): void {
		this.database.exec("DELETE FROM media_entities;");
		for (const kind of collections) for (const entity of state[kind]) {
			this.database.exec("INSERT INTO media_entities (kind, id, url, name, data) VALUES (?, ?, ?, ?, ?);",
				[kind, entity.id, entity.url, entity.name, JSON.stringify(entity)]);
		}
		const { adventures, scenes, tracks, playlists, ...metadata } = state;
		this.database.exec("INSERT INTO media_state (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data;",
			[JSON.stringify(metadata)]);
	}
}
