import { createHash, randomUUID } from "node:crypto";
import type { McpOperation, McpOperationAccess, McpOperationError, McpOperationStatus, McpChange } from "src/data/database/McpOperationsDao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { ItemSaveContext, ItemSaveResult } from "src/domain/models/common/EntityOrigin";
import type { AudioAsset, MediaState } from "src/domain/models/media/MediaState";
import { mediaItems, saveMediaRecord, type MediaKind, type MediaRecord } from "src/domain/models/media/MediaLibrary";
import { MCP_ENTITY_KINDS, MCP_REFERENCE_KINDS, MCP_ENTITY_URL_PREFIXES, getMcpEntitySchema, mcpEntitySchemas, normalizeMcpReadEntity, type McpEntityKind, type McpReferenceKind } from "./McpEntitySchemas";
export { MCP_ENTITY_KINDS, type McpEntityKind } from "./McpEntitySchemas";

export interface McpRepository {
	getAllSmallItems(): Promise<BaseItem[]>;
	getFilteredSmallItems?(name: string | null, filter: any): Promise<BaseItem[]>;
	getAllFilters?(): Promise<unknown>;
	getFullItemByUrl(url: string): Promise<BaseItem | null>;
	putItem(item: never, context?: ItemSaveContext): Promise<ItemSaveResult>;
	getParentUrl?(url: string): Promise<string | null>;
}
export interface McpEntitiesDependencies {
	repositories: Record<McpReferenceKind, McpRepository>;
	getMediaState(): MediaState;
	getVaultAudioPaths?(): string[];
	updateMedia(mutator: (state: MediaState) => void, beforeWrite?: () => void): Promise<void>;
	operations?: McpOperationAccess;
	readBarrier?(): Promise<void>;
	atomic?<T>(callback: (scope: McpEntitiesDependencies) => Promise<T>): Promise<T>;
	removeEntity?(kind: McpReferenceKind, url: string): Promise<void>;
	assertRemovable?(kind: McpEntityKind, data: Record<string, unknown>, removing: ReadonlySet<string>): void | Promise<void>;
	onEntitySaved?(kind: McpEntityKind, url: string): void | Promise<void>;
}
export interface PreparedMcpWrite {
	readonly id: string;
	readonly operation: "create" | "update" | "delete";
	readonly isUndo?: boolean;
	readonly kind: McpEntityKind;
	readonly url: string;
	readonly sourceUrl: string | null;
	readonly revision: string | null;
	readonly fingerprint: string;
	readonly data: Readonly<Record<string, unknown>>;
}
type EntityData = Record<string, unknown> & { url: string; origin?: "remote" | "manual"; subraces?: EntityData[] };
export type McpBatchAction = { operation: "create" | "update" | "patch"; kind: McpEntityKind; data?: Record<string, unknown>; changes?: Record<string, unknown>; url?: string; expectedRevision?: string };
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
	private readonly memoryOperations = new Map<string, McpOperation>();
	private operationQueue: Promise<unknown> = Promise.resolve();
	private readonly undoTargets = new WeakMap<PreparedMcpWrite[], string>();
	readonly #pending = new WeakMap<PreparedMcpWrite, WriteSnapshot>();
	#queue: Promise<unknown> = Promise.resolve();
	constructor(private readonly dependencies: McpEntitiesDependencies) {}
	listEntityTypes() { return MCP_ENTITY_KINDS.map((kind) => ({ kind, canCreate: true, canUpdate: true, canDelete: false })); }
	async getEntitySchema(kind: McpEntityKind) {
		await this.dependencies.readBarrier?.();
		this.assertKind(kind);
		const values = isReference(kind) ? await this.dependencies.repositories[kind].getAllFilters?.() ?? {} :
			(kind === "adventure" || kind === "scene") ? { campaignNames: [...new Set(mediaItems(this.dependencies.getMediaState()).filter(item => item.mediaRoute.kind === kind).map(item => (item.record as {campaignName:string}).campaignName))] } : {};
		const keys = FILTER_KEYS[kind];
		return { ...getMcpEntitySchema(kind), filterSchema: { type: "object", additionalProperties: false, properties: Object.fromEntries(keys.map(key => [key, { type: "array", items: { type: key === "levels" ? "number" : "string" } }])) }, filterValues: values };
	}
	listAudioAssets(): Array<{ id: string | null; path: string; alias: string; exists: boolean; registered: boolean }> {
		const registered = structuredClone(this.dependencies.getMediaState().audioFiles);
		const known = new Set(registered.map((asset) => asset.path));
		const available = [...new Set(this.dependencies.getVaultAudioPaths?.() ?? [])].filter((path) => isVaultAudioPath(path) && !known.has(path));
		const paths = new Set(this.dependencies.getVaultAudioPaths?.() ?? []);
		return [...registered, ...available.map((path) => ({ id: null, path, alias: audioAlias(path) }))].map(asset => ({ ...asset, exists: paths.has(asset.path), registered: asset.id !== null })).sort((a, b) => a.path.localeCompare(b.path, "ru"));
	}
	async searchEntities(query = "", kinds: readonly McpEntityKind[] = MCP_ENTITY_KINDS, offset = 0, limit = 20, filters?: Record<string, (string | number)[]>) {
		if (filters && Object.keys(filters).length && new Set(kinds).size !== 1) throw new Error("Фильтры требуют выбора одного типа сущности.");
		if (filters && Object.keys(filters).length) {
			validateFilters(kinds[0], filters);
			filters = { ...Object.fromEntries(FILTER_KEYS[kinds[0]].map(key => [key, []])), ...filters };
		} else filters = undefined;
		await this.dependencies.readBarrier?.();
		if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Параметры страницы: offset >= 0, limit от 1 до 100.");
		const needle = query.trim().toLocaleLowerCase("ru-RU");
		const entries = (await Promise.all([...new Set(kinds)].map(async (kind) => {
			this.assertKind(kind);
			if (isReference(kind)) return flatten(filters ? await this.dependencies.repositories[kind].getFilteredSmallItems?.(null, filters) ?? await this.smallItems(kind) : await this.smallItems(kind)).map((item) => ({ kind, url: item.url, name: item.name, origin: item.origin ?? "remote" }));
			return mediaItems(this.dependencies.getMediaState()).filter((item) => item.mediaRoute.kind === kind && (!filters?.campaignNames?.length || filters.campaignNames.includes((item.record as {campaignName?:string}).campaignName ?? ""))).map((item) => ({ kind, url: item.url, name: item.name, origin: "manual" }));
		}))).flat().filter((item) => `${item.name.rus}\n${item.name.eng}\n${item.url}`.toLocaleLowerCase("ru-RU").includes(needle));
		const seen = new Set<string>();
		const unique = entries.filter((item) => { const key = `${item.kind}:${item.url}`; if (seen.has(key)) return false; seen.add(key); return true; });
		return { items: structuredClone(unique.slice(offset, offset + limit)), total: unique.length, offset, limit, hasMore: offset + limit < unique.length };
	}
	async getEntity(kind: McpEntityKind, url: string) {
		await this.dependencies.readBarrier?.();
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
				if (existing.data.id !== undefined && data.id !== existing.data.id) throw new McpError("validation", "ID ручной сущности неизменяемый.");
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
			if (prepared.operation === "delete") throw new Error("Удаление разрешено только через подтверждённый откат операции.");
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
	searchAudioAssets(query = "", offset = 0, limit = 20) {
		validatePage(offset, limit);
		const needle = query.trim().toLocaleLowerCase("ru-RU");
		const items = this.listAudioAssets().filter(asset => `${asset.path}\n${asset.alias}`.toLocaleLowerCase("ru-RU").includes(needle));
		return { items: items.slice(offset, offset + limit), total: items.length, offset, limit, hasMore: offset + limit < items.length };
	}
	async preparePatch(kind: McpEntityKind, url: string, changes: Record<string, unknown>, expectedRevision: string) {
		const existing = await this.getEntity(kind, url);
		return this.prepareUpdate(kind, url, mergeChanges(existing.data, changes), expectedRevision);
	}
	async prepareBatch(operations: McpBatchAction[]): Promise<PreparedMcpWrite[]> {
		if (!operations.length || operations.length > 50) throw new McpError("validation", "Группа должна содержать от 1 до 50 действий.");
		if (!this.dependencies.atomic && operations.length > 1) throw new McpError("unavailable", "Атомарное сохранение недоступно.");
		const working = structuredClone(this.dependencies.getMediaState());
		const staged: PreparedMcpWrite[] = [];
		const repositories = { ...this.dependencies.repositories };
		for (const kind of MCP_REFERENCE_KINDS) {
			const original = repositories[kind];
			repositories[kind] = {
				getAllSmallItems: () => original.getAllSmallItems(),
				getFullItemByUrl: url => original.getFullItemByUrl(url),
				putItem: (item, context) => original.putItem(item, context),
				getParentUrl: original.getParentUrl?.bind(original),
				getAllFilters: original.getAllFilters?.bind(original),
				getFilteredSmallItems: async (name: string | null, filter: null) => [
					...await (original.getFilteredSmallItems?.(name, filter) ?? original.getAllSmallItems()),
					...staged.filter(item => item.kind === kind).map(item => item.data as unknown as BaseItem),
				],
			};
		}
		const preparer = new McpEntities({ ...this.dependencies, repositories, getMediaState: () => working });
		const targets = new Set<string>();
		for (const action of operations) {
			const write = action.operation === "create" ? await preparer.prepareCreate(action.kind, action.data)
				: action.operation === "patch" ? await preparer.preparePatch(action.kind, action.url!, action.changes!, action.expectedRevision!)
				: await preparer.prepareUpdate(action.kind, action.url!, action.data, action.expectedRevision!);
			const touched = isReference(write.kind) ? flattenData(write.data as EntityData).map(item => item.url) : [write.url];
			for (const url of [...new Set([...touched, ...(write.sourceUrl ? [write.sourceUrl] : [])])]) {
				const key = `${write.kind}:${url}`;
				if (targets.has(key)) throw new McpError("validation", "Нельзя повторно изменять одну запись внутри группы.");
				targets.add(key);
			}
			const snapshot = preparer.#pending.get(write)!;
			this.#pending.set(write, snapshot);
			if (!isReference(write.kind)) {
				for (const asset of snapshot.audioAssets) if (!working.audioFiles.some(item => item.path === asset.path)) working.audioFiles.push(structuredClone(asset));
				saveMediaRecord(working, write.kind, write.data as unknown as MediaRecord);
			}
			staged.push(write);
		}
		return staged;
	}
	private operationAccess(): McpOperationAccess {
		return this.dependencies.operations ?? {
			get: id => structuredClone(this.memoryOperations.get(id) ?? null),
			save: operation => { this.memoryOperations.set(operation.operationId, structuredClone(operation)); },
			list: (offset, limit) => { const items = [...this.memoryOperations.values()].sort((a,b) => b.createdAt-a.createdAt); return { items: structuredClone(items.slice(offset, offset+limit)), total: items.length }; },
		};
	}
	async beginOperation(operationId: string | undefined, requestHash: string) {
		const id = operationId ?? randomUUID();
		if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new McpError("validation", "Некорректный operationId.");
		const run = this.operationQueue.then(async () => {
			await this.dependencies.readBarrier?.();
			const access = this.operationAccess();
			const previous = await access.get(id);
			if (previous) {
				if (previous.requestHash !== requestHash) throw new McpError("idempotency_conflict", "operationId уже связан с другим содержимым.");
				return { ...previous, isNew: false };
			}
			const operation: McpOperation = { operationId: id, requestHash, status: "pending", createdAt: Date.now(), updatedAt: Date.now() };
			await access.save(operation);
			return { ...operation, isNew: true };
		});
		this.operationQueue = run.catch(() => {});
		return run;
	}
	async finishOperation(operationId: string, status: McpOperationStatus, error?: McpOperationError) {
		const access = this.operationAccess(), operation = await access.get(operationId);
		if (!operation || !["pending", "running"].includes(operation.status)) return;
		await access.save({ ...operation, status, updatedAt: Date.now(), ...(error ? { error } : {}) });
	}
	async listOperations(offset = 0, limit = 20) {
		await this.dependencies.readBarrier?.();
		validatePage(offset, limit);
		const page = await this.operationAccess().list(offset, limit);
		return { ...page, items: page.items.map(({ changes, ...operation }) => operation), offset, limit, hasMore: offset + limit < page.total };
	}
	async getOperation(id: string, includeChanges = false): Promise<McpOperation> {
		await this.dependencies.readBarrier?.();
		const operation = await this.operationAccess().get(id);
		if (!operation) throw new McpError("not_found", "Операция не найдена.");
		if (includeChanges) return operation;
		const { changes, ...metadata } = operation;
		return metadata;
	}
	async prepareUndo(targetId: string): Promise<PreparedMcpWrite[]> {
		if (!this.dependencies.atomic) throw new McpError("unavailable", "Атомарный откат недоступен.");
		const target = await this.getOperation(targetId, true);
		if (target.status !== "succeeded" || !target.changes?.length || target.undoneBy || target.undoTargetId) throw new McpError("undo_unavailable", "Эту операцию нельзя отменить.");
		const prepared: PreparedMcpWrite[] = [];
		for (const change of [...target.changes].reverse()) {
			const current = await this.getEntity(change.kind, change.url);
			if (mcpEntityRevision(current.data) !== mcpEntityRevision(change.after)) throw new McpError("conflict", "Запись изменилась после операции; откат недоступен.");
			const context: ItemSaveContext = { originalUrl: change.url, originalOrigin: "manual" };
			if (change.kind === "races") context.parentUrl = await this.dependencies.repositories.races.getParentUrl?.(change.url) ?? undefined;
			const base = this.prepare(change.before ? "update" : "delete", change.kind, structuredClone(change.before ?? change.after!) as EntityData, current.data, current.revision, context);
			const write = deepFreeze({ ...base, isUndo: true });
			this.#pending.set(write, this.#pending.get(base)!);
			prepared.push(write);
		}
		this.undoTargets.set(prepared, targetId);
		return prepared;
	}
	async commitOperation(operationId: string, prepared: PreparedMcpWrite[], assertActive: () => void = () => {}, undoTargetId?: string): Promise<unknown> {
		const boundTarget = this.undoTargets.get(prepared);
		if (undoTargetId && undoTargetId !== boundTarget) throw new McpError("invalid_operation", "Подтверждение связано с другим откатом.");
		const targetId = boundTarget;
		if (!prepared.length || prepared.some(write => !this.#pending.has(write) || this.#pending.get(write)!.used)) throw new McpError("invalid_operation", "Операция недействительна или уже использована.");
		const snapshots = prepared.map(write => this.#pending.get(write)!);
		for (const snapshot of snapshots) snapshot.used = true;
		const run = this.#queue.then(async () => {
			const access = this.operationAccess(), operation = await access.get(operationId);
			if (!operation || operation.status !== "pending") throw new McpError("invalid_operation", "Операция уже завершена или не зарегистрирована.");
			assertActive();
			await this.finishOperation(operationId, "running");
			const execute = async (scope: McpEntitiesDependencies) => {
				const gateway = new McpEntities({ ...scope, onEntitySaved: undefined });
				const changes: McpChange[] = [], results: unknown[] = [];
				const scopedAccess = scope.operations ?? access;
				const undoTarget = targetId ? await scopedAccess.get(targetId) : null;
				if (targetId && (!undoTarget || undoTarget.undoneBy || undoTarget.status !== "succeeded" || undoTarget.undoTargetId)) throw new McpError("undo_unavailable", "Операция уже отменена или недоступна.");
				const affected = new Set(prepared.flatMap(write => isReference(write.kind) ? flattenData(write.data as EntityData).map(item => `${write.kind}:${item.url}`) : [`${write.kind}:${write.url}`]));
				for (let index = 0; index < prepared.length; index++) {
					assertActive();
					const write = prepared[index], snapshot = snapshots[index];
					let before: EntityData | null = null;
					if (write.sourceUrl === write.url) before = (await gateway.getEntity(write.kind, write.url)).data;
					if (write.isUndo) {
						if (!targetId || !undoTarget?.changes?.some(change => change.kind === write.kind && change.url === write.url)) throw new McpError("invalid_operation", "Откат не связан с сохранённой операцией.");
						if (!before || mcpEntityRevision(before) !== write.revision) throw new McpError("conflict", "Запись изменилась после подтверждения отката.");
						if (write.operation === "delete") {
							await gateway.removeForUndo(write.kind, before, affected);
						} else if (isReference(write.kind)) {
							if (write.kind === "races") {
								const retained = new Set(flattenData(write.data as EntityData).map(item => item.url));
								for (const child of flattenData(before).slice(1).reverse()) if (!retained.has(child.url)) await gateway.removeForUndo("races", child, affected);
							}
							const saved = await scope.repositories[write.kind].putItem(structuredClone(write.data) as never, { ...snapshot.context, beforeWrite: async () => assertActive() });
							if (!saved.ok) throw new McpError("save_failed", saved.message);
						} else await scope.updateMedia(state => saveMediaRecord(state, write.kind as MediaKind, write.data as unknown as MediaRecord), assertActive);
						results.push({ kind: write.kind, url: write.url, undone: true });
					} else {
						gateway.#pending.set(write, { ...snapshot, used: false });
						results.push(await gateway.commit(write, assertActive));
					}
					const after = write.operation === "delete" ? null : (await gateway.getEntity(write.kind, write.url)).data;
					changes.push({ kind: write.kind, url: write.url, before, after });
				}
				assertActive();
				const result = results.length === 1 ? results[0] : { items: results };
				await scopedAccess.save({ ...operation, status: "succeeded", updatedAt: Date.now(), result, changes, summary: changes.map(change => ({ kind: change.kind, url: change.url, name: entityTitle(change.after ?? change.before!), action: targetId ? "undo" : change.before ? "update" : "create" })), ...(targetId ? { undoTargetId: targetId } : {}) });
				if (undoTarget) await scopedAccess.save({ ...undoTarget, undoneBy: operationId, updatedAt: Date.now() });
				return result;
			};
			try {
				if (!this.dependencies.atomic && (prepared.length > 1 || targetId)) throw new McpError("unavailable", "Атомарное сохранение недоступно.");
				const result = await (this.dependencies.atomic ? this.dependencies.atomic(execute) : execute(this.dependencies));
				for (const write of prepared) try { await this.dependencies.onEntitySaved?.(write.kind, write.url); } catch (error) { console.warn("MCP UI notification failed", error); }
				return result;
			} catch (error) {
				try { await this.finishOperation(operationId, "failed", { code: error instanceof McpError ? error.code : /измени|конфликт/i.test(String(error)) ? "conflict" : "save_failed", message: error instanceof Error ? error.message : String(error) }); } catch (saveError) { console.warn("MCP failed to persist failure status", saveError); }
				throw error;
			}
		});
		this.#queue = run.catch(() => {});
		return run;
	}
	private async removeForUndo(kind: McpEntityKind, data: EntityData, affected: ReadonlySet<string>) {
		await this.dependencies.assertRemovable?.(kind, data, affected);
		if (isReference(kind)) {
			if (!this.dependencies.removeEntity || !this.dependencies.assertRemovable) throw new McpError("undo_unavailable", "Безопасная проверка удаления недоступна.");
			for (const item of (kind === "races" ? flattenData(data) : [data]).reverse()) {
				await this.dependencies.assertRemovable(kind, item, affected);
				await this.dependencies.removeEntity(kind, item.url);
			}
		} else await this.dependencies.updateMedia(state => {
			const id = data.id;
			if (kind === "track" && (state.playlists.some(item => !affected.has(`playlist:${item.url}`) && item.items.some(entry => entry.trackId === id)) || state.scenes.some(item => !affected.has(`scene:${item.url}`) && item.trackId === id))) throw new McpError("dependency", "Трек используется другой записью.");
			if (kind === "playlist" && state.adventures.some(item => !affected.has(`adventure:${item.url}`) && item.playlistId === id)) throw new McpError("dependency", "Плейлист используется приключением.");
			if (kind === "scene" && (state.activeSceneId === id || state.adventures.some(item => !affected.has(`adventure:${item.url}`) && item.scenes.some(scene => scene.id === id)))) throw new McpError("dependency", "Сцена активна или используется приключением.");
			if (kind === "adventure" && state.activeAdventureId === id) throw new McpError("dependency", "Приключение активно.");
			const list = kind === "track" ? state.tracks : kind === "playlist" ? state.playlists : kind === "scene" ? state.scenes : state.adventures;
			list.splice(list.findIndex(item => item.id === id), 1);
		});
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
	private prepare(operation: "create" | "update" | "delete", kind: McpEntityKind, data: EntityData, before: EntityData | null, revision: string | null, context: ItemSaveContext, audioAssets: AudioAsset[] = []): PreparedMcpWrite {
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

export class McpError extends Error {
	constructor(readonly code: string, message: string) { super(message); }
}
const FILTER_KEYS: Record<McpEntityKind, string[]> = {
	bestiary: ["types", "challengeRatings", "sources"], spellbook: ["levels", "schools", "sources"],
	arsenal: ["dices", "damageTypes", "types", "sources"], armory: ["types", "sources"], equipment: ["sources"],
	artifactory: ["types", "sources", "rarities"], backgrounds: ["sources"], feats: ["sources"], races: ["abilities", "types", "sources"],
	adventure: ["campaignNames"], scene: ["campaignNames"], track: [], playlist: [],
};
function validateFilters(kind: McpEntityKind, filters: Record<string, (string | number)[]>) {
	for (const [key, values] of Object.entries(filters)) if (!FILTER_KEYS[kind]?.includes(key) || !Array.isArray(values) || values.some(value => key === "levels" ? !Number.isInteger(value) || Number(value) < 0 || Number(value) > 9 : typeof value !== "string")) throw new McpError("validation", "Некорректный фильтр: " + key);
}
function validatePage(offset: number, limit: number) {
	if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new McpError("validation", "offset >= 0, limit от 1 до 100.");
}
function entityTitle(data: Record<string, unknown>): string {
	return typeof data.name === "string" ? data.name : (data.name as {rus?:string,eng?:string})?.rus || (data.name as {eng?:string})?.eng || "Без имени";
}
function mergeChanges(original: Record<string, unknown>, changes: Record<string, unknown>): Record<string, unknown> {
	if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new McpError("validation", "changes должен быть объектом.");
	const result = structuredClone(original);
	for (const [key, value] of Object.entries(changes)) {
		if (["__proto__", "constructor", "prototype"].includes(key)) throw new McpError("validation", "Недопустимое поле.");
		result[key] = value && typeof value === "object" && !Array.isArray(value) ? mergeChanges(result[key] && typeof result[key] === "object" && !Array.isArray(result[key]) ? result[key] as Record<string, unknown> : {}, value as Record<string, unknown>) : structuredClone(value);
	}
	return result;
}
