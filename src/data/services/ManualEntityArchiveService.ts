import type { EntityOriginDao } from "src/data/database/EntityOriginDao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import { ENTITY_KINDS, type EntityKind } from "src/domain/models/common/EntityOrigin";
import type { Repository } from "src/domain/repositories/Repository";

export const MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION = 1;

export interface ManualEntityArchiveEntry {
	kind: EntityKind;
	url: string;
	item: BaseItem;
	parentUrl?: string;
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

type ArchiveRepository = Repository<any, any, any> & {
	getParentUrl?: (url: string) => Promise<string | null>;
};

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
			const parentUrl = ref.kind === "races" && repository.getParentUrl
				? await repository.getParentUrl(ref.url)
				: undefined;
			entities.push({ kind: ref.kind, url: ref.url, item, ...(parentUrl ? { parentUrl } : {}) });
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
		const entries = sortEntriesByRaceParent(archive.entities);
		for (const entry of entries) {
			try {
				if (!isEntry(entry)) {
					report.skipped += 1;
					continue;
				}
				const repository = this.repositories[entry.kind];
				if (!repository) {
					report.skipped += 1;
					continue;
				}
				if (entry.kind === "races" && entry.parentUrl && !await this.origins.exists("races", entry.parentUrl)) {
					report.skipped += 1;
					continue;
				}
				const exists = await this.origins.exists(entry.kind, entry.url);
				const origin = exists ? await this.origins.get(entry.kind, entry.url) : undefined;
				if (origin === "remote") {
					report.skipped += 1;
					continue;
				}
				const context = {
					...(origin === "manual" ? { originalUrl: entry.url, originalOrigin: "manual" as const } : {}),
					...(entry.kind === "races" && entry.parentUrl ? { parentUrl: entry.parentUrl } : {}),
				};
				const result = await repository.putItem({ ...entry.item, origin: "manual" }, context);
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

function sortEntriesByRaceParent(entries: unknown[]): unknown[] {
	const raceEntries = new Map<string, ManualEntityArchiveEntry>();
	for (const entry of entries) {
		if (isEntry(entry) && entry.kind === "races") raceEntries.set(entry.url, entry);
	}
	const depths = new Map<string, number>();
	const getDepth = (entry: ManualEntityArchiveEntry, visited = new Set<string>()): number => {
		if (!entry.parentUrl || !raceEntries.has(entry.parentUrl) || visited.has(entry.url)) return 0;
		const known = depths.get(entry.url);
		if (known !== undefined) return known;
		visited.add(entry.url);
		const parent = raceEntries.get(entry.parentUrl)!;
		const depth = getDepth(parent, visited) + 1;
		depths.set(entry.url, depth);
		return depth;
	};
	return entries.map((entry, index) => ({ entry, index })).sort((left, right) => {
		const leftRace = isEntry(left.entry) && left.entry.kind === "races" ? left.entry : null;
		const rightRace = isEntry(right.entry) && right.entry.kind === "races" ? right.entry : null;
		if (!leftRace || !rightRace) return left.index - right.index;
		return getDepth(leftRace) - getDepth(rightRace) || left.index - right.index;
	}).map(({ entry }) => entry);
}

function validateArchive(value: unknown): ManualEntityArchive {
	if (!value || typeof value !== "object") throw new Error("Файл импорта должен содержать JSON-архив.");
	const archive = value as Partial<ManualEntityArchive>;
	if (archive.schemaVersion !== MANUAL_ENTITY_ARCHIVE_SCHEMA_VERSION) throw new Error("Неподдерживаемая версия архива ручных сущностей.");
	if (!Array.isArray(archive.entities)) throw new Error("В архиве отсутствует массив сущностей.");
	return archive as ManualEntityArchive;
}

function isEntry(entry: unknown): entry is ManualEntityArchiveEntry {
	if (!entry || typeof entry !== "object") return false;
	const candidate = entry as Partial<ManualEntityArchiveEntry>;
	return typeof candidate.kind === "string"
		&& ENTITY_KINDS.includes(candidate.kind as EntityKind)
		&& typeof candidate.url === "string"
		&& Boolean(candidate.url)
		&& Boolean(candidate.item)
		&& typeof candidate.item === "object"
		&& (candidate.item as BaseItem).url === candidate.url
		&& (candidate.parentUrl === undefined || typeof candidate.parentUrl === "string");
}
