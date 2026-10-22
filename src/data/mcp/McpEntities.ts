import { createHash, randomUUID } from "node:crypto";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { ItemSaveContext, ItemSaveResult } from "src/domain/models/common/EntityOrigin";
import type { AudioAsset, MediaState } from "src/domain/models/media/MediaState";
import { mediaItems, saveMediaRecord, type MediaKind, type MediaRecord } from "src/domain/models/media/MediaLibrary";
import { MCP_ENTITY_KINDS, MCP_REFERENCE_KINDS, MCP_ENTITY_URL_PREFIXES, getMcpEntitySchema, mcpEntitySchemas, normalizeMcpReadEntity, type McpEntityKind, type McpReferenceKind } from "./McpEntitySchemas";
export { MCP_ENTITY_KINDS, type McpEntityKind } from "./McpEntitySchemas";

export interface McpRepository {
	getAllSmallItems(): Promise<BaseItem[]>;
	getFilteredSmallItems?(name: string | null, filter: null): Promise<BaseItem[]>;
	getFullItemByUrl(url: string): Promise<BaseItem | null>;
	putItem(item: never, context?: ItemSaveContext): Promise<ItemSaveResult>;
	getParentUrl?(url: string): Promise<string | null>;
}
export interface McpEntitiesDependencies {
	repositories: Record<McpReferenceKind, McpRepository>;
	getMediaState(): MediaState;
	getVaultAudioPaths?(): string[];
	updateMedia(mutator: (state: MediaState) => void, beforeWrite?: () => void): Promise<void>;
	onEntitySaved?(kind: McpEntityKind, url: string): void | Promise<void>;
}
export interface PreparedMcpWrite {
	readonly id: string;
	readonly operation: "create" | "update";
	readonly kind: McpEntityKind;
	readonly url: string;
	readonly sourceUrl: string | null;
	readonly revision: string | null;
	readonly fingerprint: string;
	readonly data: Readonly<Record<string, unknown>>;
}
type EntityData = Record<string, unknown> & { url: string; origin?: "remote" | "manual"; subraces?: EntityData[] };
type WriteSnapshot = { context: ItemSaveContext; used: boolean; audioAssets: AudioAsset[] };
const audioVariants = ["normal", "combat"] as const;
function isVaultAudioPath(path: string): boolean {
	return /\.(mp3|ogg|wav|m4a|flac|aac|opus)$/i.test(path) && !path.startsWith("/") && !path.includes("\\")
		&& !path.split("/").some((part) => !part || part === "." || part === "..");
}
function audioAlias(path: string): string { return path.split("/").pop()!.replace(/\.[^.]+$/, "") || path.split("/").pop()!; }

/** Stable representation binds confirmation to data, including nested fields and array order. */
function canonical(value: unknown): string {
	if (value === undefined) return "null";
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	const record = value as Record<string, unknown>;
	return `{${Object.keys(record).filter((key) => record[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
}
export function mcpEntityRevision(value: unknown): string { return createHash("sha256").update(canonical(value)).digest("hex"); }
function deepFreeze<T>(value: T): T {
	if (value && typeof value === "object") { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); }
	return value;
}
function isReference(kind: McpEntityKind): kind is McpReferenceKind { return (MCP_REFERENCE_KINDS as readonly string[]).includes(kind); }
function flatten(items: BaseItem[]): BaseItem[] {
	return items.flatMap((item) => [item, ...flatten((item as BaseItem & { subraces?: BaseItem[] }).subraces ?? [])]);
}
function flattenData(item: EntityData): EntityData[] { return [item, ...(item.subraces ?? []).flatMap(flattenData)]; }
function setManual(item: EntityData): void { item.origin = "manual"; for (const child of item.subraces ?? []) setManual(child); }

export class McpEntities {
	readonly #pending = new WeakMap<PreparedMcpWrite, WriteSnapshot>();
	#queue: Promise<unknown> = Promise.resolve();
	constructor(private readonly dependencies: McpEntitiesDependencies) {}
	listEntityTypes() { return MCP_ENTITY_KINDS.map((kind) => ({ kind, canCreate: true, canUpdate: true, canDelete: false })); }
	getEntitySchema(kind: McpEntityKind) { this.assertKind(kind); return getMcpEntitySchema(kind); }
	listAudioAssets(): Array<{ id: string | null; path: string; alias: string }> {
		const registered = structuredClone(this.dependencies.getMediaState().audioFiles);
		const known = new Set(registered.map((asset) => asset.path));
		const available = [...new Set(this.dependencies.getVaultAudioPaths?.() ?? [])].filter((path) => isVaultAudioPath(path) && !known.has(path));
		return [...registered, ...available.map((path) => ({ id: null, path, alias: audioAlias(path) }))].sort((a, b) => a.path.localeCompare(b.path, "ru"));
	}
	async searchEntities(query = "", kinds: readonly McpEntityKind[] = MCP_ENTITY_KINDS, offset = 0, limit = 20) {
		if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Параметры страницы: offset >= 0, limit от 1 до 100.");
		const needle = query.trim().toLocaleLowerCase("ru-RU");
		const entries = (await Promise.all([...new Set(kinds)].map(async (kind) => {
			this.assertKind(kind);
			if (isReference(kind)) return flatten(await this.smallItems(kind)).map((item) => ({ kind, url: item.url, name: item.name, origin: item.origin ?? "remote" }));
			return mediaItems(this.dependencies.getMediaState()).filter((item) => item.mediaRoute.kind === kind).map((item) => ({ kind, url: item.url, name: item.name, origin: "manual" }));
		}))).flat().filter((item) => `${item.name.rus}\n${item.name.eng}\n${item.url}`.toLocaleLowerCase("ru-RU").includes(needle));
		const seen = new Set<string>();
		const unique = entries.filter((item) => { const key = `${item.kind}:${item.url}`; if (seen.has(key)) return false; seen.add(key); return true; });
		return { items: structuredClone(unique.slice(offset, offset + limit)), total: unique.length, offset, limit, hasMore: offset + limit < unique.length };
	}
	async getEntity(kind: McpEntityKind, url: string) {
		this.assertKind(kind);
		let entity: object;
		if (isReference(kind)) {
			const repository = this.dependencies.repositories[kind];
			if (!flatten(await this.smallItems(kind)).some((item) => item.url === url)) throw new Error("Сущность не найдена в локальном справочнике.");
			const full = await repository.getFullItemByUrl(url);
			if (!full) throw new Error("Не удалось загрузить полную сущность.");
			entity = { ...full, origin: full.origin ?? "remote" };
		} else {
			const item = mediaItems(this.dependencies.getMediaState()).find((item) => item.mediaRoute.kind === kind && item.url === url);
			if (!item) throw new Error("Сущность не найдена.");
			entity = item.record;
		}
		const data = normalizeMcpReadEntity(kind, entity) as EntityData;
		return { kind, url, revision: mcpEntityRevision(data), data };
	}
	async prepareCreate(kind: McpEntityKind, input: unknown): Promise<PreparedMcpWrite> {
		const data = this.parse(kind, input);
		const audioAssets = this.prepareAudio(kind, data);
		if (await this.exists(kind, data.url)) throw new Error("Этот URL уже занят.");
		if (isReference(kind)) { setManual(data); await this.validateRaceTree(kind, data); }
		else this.validateMedia(kind, data, audioAssets);
		return this.prepare("create", kind, data, null, null, {}, audioAssets);
	}
	async prepareUpdate(kind: McpEntityKind, url: string, input: unknown, expectedRevision: string): Promise<PreparedMcpWrite> {
		const existing = await this.getEntity(kind, url);
		if (!expectedRevision || existing.revision !== expectedRevision) throw new Error("Сущность изменилась: прочитайте её заново перед подтверждением.");
		const data = this.parse(kind, input, isReference(kind) && existing.data.origin === "manual" ? existing.data : undefined);
		const audioAssets = this.prepareAudio(kind, data);
		const context: ItemSaveContext = {};
		if (isReference(kind)) {
			context.originalUrl = url;
			context.originalOrigin = existing.data.origin ?? "remote";
			if (context.originalOrigin === "manual") {
				if (data.url !== url) throw new Error("URL ручной сущности неизменяемый.");
				if (kind === "races") context.parentUrl = await this.dependencies.repositories[kind].getParentUrl?.(url) ?? undefined;
			} else {
				data.url = `${MCP_ENTITY_URL_PREFIXES[kind]}manual-${randomUUID()}`;
				// A remote race tree must be copied with fresh descendant URLs too.
				for (const child of flattenData(data).slice(1)) child.url = `${MCP_ENTITY_URL_PREFIXES.races}manual-${randomUUID()}`;
			}
			setManual(data);
			await this.validateRaceTree(kind, data, context.originalOrigin === "manual" ? existing.data : undefined);
		} else {
			if (data.url !== url || data.id !== existing.data.id) throw new Error("ID и URL медиасущности неизменяемые.");
			this.validateMedia(kind, data, audioAssets);
		}
		return this.prepare("update", kind, data, existing.data, existing.revision, context, audioAssets);
	}
	/** The transport calls this only after explicit user confirmation of this exact object. */
	async commit(prepared: PreparedMcpWrite, assertActive: () => void = () => {}): Promise<{ kind: McpEntityKind; url: string; revision: string | null; copied: boolean; readRequired?: boolean }> {
		const snapshot = this.#pending.get(prepared);
		if (!snapshot || snapshot.used) throw new Error("Операция недействительна или уже использована.");
		snapshot.used = true;
		const run = this.#queue.then(async () => {
			assertActive();
			const data = structuredClone(prepared.data) as EntityData;
			const checkRevision = async () => {
				assertActive();
				let current: EntityData | undefined;
				if (prepared.sourceUrl) {
					const read = await this.getEntity(prepared.kind, prepared.sourceUrl);
					if (read.revision !== prepared.revision) throw new Error("Сущность изменилась после подтверждения. Прочитайте её заново.");
					if (prepared.url === prepared.sourceUrl) current = read.data;
				}
				if ((!prepared.sourceUrl || prepared.url !== prepared.sourceUrl) && await this.exists(prepared.kind, prepared.url)) throw new Error("Этот URL уже занят.");
				if (isReference(prepared.kind)) await this.validateRaceTree(prepared.kind, data, current);
				assertActive();
			};
			await checkRevision();
			if (isReference(prepared.kind)) {
				// Repositories execute this guard inside the same serialized DB transaction as the write.
				const result = await this.dependencies.repositories[prepared.kind].putItem(data as never, { ...snapshot.context, beforeWrite: checkRevision });
				if (!result.ok) throw new Error(result.message);
			} else {
				const beforeWrite = () => { assertActive(); this.assertAudioAvailable(snapshot.audioAssets); };
				await this.dependencies.updateMedia((state) => {
					assertActive();
					const item = mediaItems(state).find((item) => item.mediaRoute.kind === prepared.kind && item.url === prepared.url);
					if (prepared.sourceUrl ? !item || mcpEntityRevision(item.record) !== prepared.revision : !!item || mediaItems(state).some((entry) => entry.mediaRoute.kind === prepared.kind && entry.record.id === data.id)) throw new Error("Медиатека изменилась. Прочитайте сущность заново.");
					this.assertAudioAvailable(snapshot.audioAssets);
					for (const asset of snapshot.audioAssets) {
						const existing = state.audioFiles.find((entry) => entry.path === asset.path);
						if (!existing && state.audioFiles.some((entry) => entry.id === asset.id)) throw new Error("Медиатека изменилась. Повторите добавление аудиофайла.");
						if (!existing) state.audioFiles.push(structuredClone(asset));
						for (const variant of audioVariants) if (data[`${variant}AudioId`] === asset.id) data[`${variant}AudioId`] = existing?.id ?? asset.id;
					}
					saveMediaRecord(state, prepared.kind as MediaKind, data as unknown as MediaRecord);
				}, beforeWrite);
			}
			try { await this.dependencies.onEntitySaved?.(prepared.kind, prepared.url); }
			catch (error) { console.warn("MCP entity saved, but UI refresh failed:", error); }
			let revision: string | null = null;
			try { revision = (await this.getEntity(prepared.kind, prepared.url)).revision; }
			catch (error) { console.warn("MCP entity saved, but reading its persisted revision failed:", error); }
			return { kind: prepared.kind, url: prepared.url, revision, copied: !!prepared.sourceUrl && prepared.url !== prepared.sourceUrl, ...(revision === null ? { readRequired: true } : {}) };
		});
		this.#queue = run.catch(() => {});
		return run;
	}
	private parse(kind: McpEntityKind, input: unknown, existingManual?: EntityData): EntityData {
		this.assertKind(kind);
		const candidate = structuredClone(input);
		const preserved = new Map<string, string>();
		const visitUrls = (record: unknown, transform: (url: string) => string): void => {
			if (!record || typeof record !== "object" || Array.isArray(record)) return;
			const value = record as Record<string, unknown>;
			if (typeof value.url === "string") value.url = transform(value.url);
			if (kind === "races" && Array.isArray(value.subraces)) for (const child of value.subraces) visitUrls(child, transform);
		};
		if (existingManual) {
			const existingUrls = new Set(flattenData(existingManual).map((entry) => entry.url));
			// Old manually authored cards may have arbitrary URLs. Permit only exact persisted
			// identities on update; the strict model schema still validates every other field.
			visitUrls(candidate, (url) => {
				if (!existingUrls.has(url)) return url;
				const placeholder = `${MCP_ENTITY_URL_PREFIXES[kind]}manual-${randomUUID()}`;
				preserved.set(placeholder, url);
				return placeholder;
			});
		}
		const data = mcpEntitySchemas[kind].parse(candidate) as unknown as EntityData;
		visitUrls(data, (url) => preserved.get(url) ?? url);
		if (isReference(kind) && !(data.name as { rus: string }).rus.trim()) throw new Error("Укажите русское название.");
		return data;
	}
	private prepare(operation: "create" | "update", kind: McpEntityKind, data: EntityData, before: EntityData | null, revision: string | null, context: ItemSaveContext, audioAssets: AudioAsset[] = []): PreparedMcpWrite {
		const prepared = deepFreeze({ id: randomUUID(), operation, kind, url: data.url, sourceUrl: before?.url ?? null, revision, fingerprint: mcpEntityRevision({ operation, kind, data, revision, audioAssets }), data });
		this.#pending.set(prepared, { context, used: false, audioAssets: structuredClone(audioAssets) });
		return prepared;
	}
	private async exists(kind: McpEntityKind, url: string): Promise<boolean> {
		return isReference(kind) ? flatten(await this.smallItems(kind)).some((item) => item.url === url) : mediaItems(this.dependencies.getMediaState()).some((item) => item.mediaRoute.kind === kind && item.url === url);
	}
	private smallItems(kind: McpReferenceKind): Promise<BaseItem[]> {
		const repository = this.dependencies.repositories[kind];
		// Filtered reads bypass the repository's list cache, including inside a transaction guard.
		return repository.getFilteredSmallItems ? repository.getFilteredSmallItems(null, null) : repository.getAllSmallItems();
	}
	private validateMedia(kind: MediaKind, data: EntityData, audioAssets: AudioAsset[] = []): void {
		const state = structuredClone(this.dependencies.getMediaState());
		for (const asset of audioAssets) if (!state.audioFiles.some((entry) => entry.id === asset.id)) state.audioFiles.push(structuredClone(asset));
		const collision = mediaItems(state).find((item) => item.mediaRoute.kind === kind && item.record.id === data.id);
		if (collision && collision.url !== data.url) throw new Error("Этот ID уже занят.");
		saveMediaRecord(state, kind, data as unknown as MediaRecord);
	}
	private assertAudioAvailable(assets: AudioAsset[]): void {
		if (!assets.length) return;
		const paths = new Set(this.dependencies.getVaultAudioPaths?.() ?? []);
		for (const asset of assets) if (!isVaultAudioPath(asset.path) || !paths.has(asset.path)) throw new Error(`Аудиофайл не найден в хранилище или формат не поддерживается: ${asset.path}`);
	}
	private prepareAudio(kind: McpEntityKind, data: EntityData): AudioAsset[] {
		if (kind !== "track") return [];
		const assets = new Map<string, AudioAsset>();
		for (const variant of audioVariants) {
			const key = `${variant}AudioPath`;
			const path = data[key] as string | undefined;
			if (path === undefined) continue;
			const asset = assets.get(path) ?? this.dependencies.getMediaState().audioFiles.find((entry) => entry.path === path)
				?? { id: randomUUID(), path, alias: audioAlias(path) };
			assets.set(path, asset);
			data[`${variant}AudioId`] = asset.id;
			delete data[key];
		}
		const result = [...assets.values()];
		this.assertAudioAvailable(result);
		return result;
	}
	private async validateRaceTree(kind: McpReferenceKind, data: EntityData, existing?: EntityData): Promise<void> {
		if (kind !== "races") return;
		const known = new Map(flatten(await this.smallItems("races")).map((item) => [item.url, item]));
		const allowed = new Set(existing ? flattenData(existing).map((item) => item.url) : []);
		const entries = flattenData(data), urls = new Set(entries.map((item) => item.url));
		if (urls.size !== entries.length) throw new Error("URL рас и подрас должны быть уникальны.");
		for (const entry of entries) {
			if (known.has(entry.url) && (!allowed.has(entry.url) || known.get(entry.url)?.origin !== "manual")) throw new Error("Нельзя перезаписать другую расу или подрасу.");
		}
		for (const url of allowed) if (!urls.has(url)) throw new Error("Удаление подрас через MCP недоступно.");
		// Existing descendants cannot silently be reparented by a tree update.
		const parents = (root: EntityData): Map<string, string> => new Map(flattenData(root).flatMap((parent) => (parent.subraces ?? []).map((child) => [child.url, parent.url] as [string, string])));
		if (existing) { const before = parents(existing), after = parents(data); for (const [url, parent] of before) if (after.get(url) !== parent) throw new Error("Нельзя переносить существующую подрасу через MCP."); }
	}
	private assertKind(kind: McpEntityKind): void { if (!(MCP_ENTITY_KINDS as readonly string[]).includes(kind)) throw new Error("Неподдерживаемый тип сущности."); }
}
