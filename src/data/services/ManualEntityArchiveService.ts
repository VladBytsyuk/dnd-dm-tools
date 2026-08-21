import type { EntityOriginDao } from "src/data/database/EntityOriginDao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import { ENTITY_KINDS, type EntityKind } from "src/domain/models/common/EntityOrigin";
import type { Repository } from "src/domain/repositories/Repository";

export const MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION = 1;

export interface ManualEntityArchiveEntry {
	kind: EntityKind;
	url: string;
	item: BaseItem;
}

export interface ManualEntityArchive {
	schemaVersion: typeof MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION;
	exportedAt: string;
	pluginVersion: string;
	entities: ManualEntityArchiveEntry[];
}

export interface ManualEntityImportReport {
	created: number;
	updated: number;
	skipped: number;
	failed: number;
}

type ArchiveRepository = Repository<any, any, any>;

export class ManualEntityArchiveService {
	constructor(
		private readonly origins: EntityOriginDao,
		private readonly repositories: Partial<Record<EntityKind, ArchiveRepository>>,
		private readonly pluginVersion: string,
	) {}

	async exportArchive(): Promise<ManualEntityArchive> {
		const entities: ManualEntityArchiveEntry[] = [];
		for (const ref of await this.origins.listManual()) {
			const repository = this.repositories[ref.kind];
			if (!repository) throw new Error(`Справочник ${ref.kind} недоступен для экспорта.`);
			const item = await repository.getFullItemByUrl(ref.url);
			if (!item) throw new Error(`Не найдены данные ручной сущности ${ref.kind}: ${ref.url}.`);
			entities.push({ kind: ref.kind, url: ref.url, item });
		}
		return {
			schemaVersion: MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION,
			exportedAt: new Date().toISOString(),
			pluginVersion: this.pluginVersion,
			entities,
		};
	}

	async importArchive(value: unknown): Promise<ManualEntityImportReport> {
		const archive = validateArchive(value);
		const report: ManualEntityImportReport = { created: 0, updated: 0, skipped: 0, failed: 0 };
		for (const entry of archive.entities) {
			const repository = this.repositories[entry.kind];
			if (!repository || !isEntry(entry)) {
				report.skipped += 1;
				continue;
			}
			try {
				const exists = await this.origins.exists(entry.kind, entry.url);
				const origin = exists ? await this.origins.get(entry.kind, entry.url) : undefined;
				if (origin === "remote") {
					report.skipped += 1;
					continue;
				}
				const result = await repository.putItem({ ...entry.item, origin: "manual" }, origin === "manual"
					? { originalUrl: entry.url, originalOrigin: "manual" }
					: undefined);
				if (result.ok) {
					if (origin === "manual") report.updated += 1;
					else report.created += 1;
				} else report.failed += 1;
			} catch {
				report.failed += 1;
			}
		}
		return report;
	}
}

function validateArchive(value: unknown): ManualEntityArchive {
	if (!value || typeof value !== "object") throw new Error("Файл импорта должен содержать JSON-архив.");
	const archive = value as Partial<ManualEntityArchive>;
	if (archive.schemaVersion !== MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION) throw new Error("Неподдерживаемая версия архива ручных сущностей.");
	if (!Array.isArray(archive.entities)) throw new Error("В архиве отсутствует массив сущностей.");
	return archive as ManualEntityArchive;
}

function isEntry(entry: ManualEntityArchiveEntry): boolean {
	return ENTITY_KINDS.includes(entry.kind)
		&& typeof entry.url === "string"
		&& Boolean(entry.url)
		&& Boolean(entry.item)
		&& typeof entry.item === "object"
		&& entry.item.url === entry.url;
}
