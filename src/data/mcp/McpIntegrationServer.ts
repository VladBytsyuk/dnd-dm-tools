import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { clearInterval, setInterval } from "node:timers";
import {
	McpServer, createMcpHandler, inputRequired, inputResponse, acceptedContent,
	isInitializeRequest, isLegacyRequest, CLIENT_CAPABILITIES_META_KEY, type ServerContext, type McpHttpHandler,
} from "@modelcontextprotocol/server";
import { NodeStreamableHTTPServerTransport, toNodeHandler, toWebRequest } from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import { McpEntities, MCP_ENTITY_KINDS, mcpEntityRevision, type PreparedMcpWrite } from "./McpEntities";

export type McpRuntimeStatus = { running: boolean; port: number | null; error?: string };
const MAX_BODY_BYTES = 1_048_576;
const CONFIRMATION_TTL_MS = 5 * 60_000;
const SESSION_IDLE_MS = 15 * 60_000;
const entityTypeNames: Record<typeof MCP_ENTITY_KINDS[number], string> = {
	bestiary: "Существо (статблок)", spellbook: "Заклинание", arsenal: "Оружие", armory: "Броня",
	equipment: "Снаряжение", artifactory: "Артефакт", backgrounds: "Предыстория", feats: "Черта", races: "Раса",
	adventure: "Приключение", scene: "Сцена", track: "Трек", playlist: "Плейлист",
};
function confirmationMessage(prepared: PreparedMcpWrite, undo = false): string {
	const name = prepared.data.name;
	const title = typeof name === "string" ? name : (name as { rus?: string; eng?: string }).rus || (name as { eng?: string }).eng || "Без имени";
	const compactTitle = title.replace(/\s+/g, " ").trim();
	const action = undo ? prepared.operation === "delete" ? "Отмена создания (удаление)" : "Откат изменения" : prepared.sourceUrl && prepared.sourceUrl !== prepared.url
		? "Создание ручной копии" : prepared.operation === "create" ? "Создание" : "Изменение";
	return `Тип сущности: ${entityTypeNames[prepared.kind]}\nИмя: ${compactTitle.length > 160 ? compactTitle.slice(0, 160) + "…" : compactTitle}\nТип изменения: ${action}`;
}
const confirmationSchema = z.object({ confirm: z.boolean().meta({ title: "Разрешить эти изменения" }) });
const kindSchema = z.enum(MCP_ENTITY_KINDS);
const dataSchema = z.record(z.string(), z.json());
const revisionSchema = z.string().regex(/^[a-f0-9]{64}$/);
const operationIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);
const pageSchema = { offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(20) };
const batchOperationSchema = z.discriminatedUnion("operation", [
	z.object({ operation: z.literal("create"), kind: kindSchema, data: dataSchema }).strict(),
	z.object({ operation: z.literal("update"), kind: kindSchema, url: z.string().min(1).max(2048), expectedRevision: revisionSchema, data: dataSchema }).strict(),
	z.object({ operation: z.literal("patch"), kind: kindSchema, url: z.string().min(1).max(2048), expectedRevision: revisionSchema, changes: dataSchema }).strict(),
]);
type WriteOperation = "create" | "update" | "patch" | "batch" | "undo";
type WriteArgs = { operationId?: string; kind?: z.infer<typeof kindSchema>; data?: Record<string, unknown>; changes?: Record<string, unknown>; url?: string; expectedRevision?: string; operations?: z.infer<typeof batchOperationSchema>[]; targetOperationId?: string };
type PendingWrite = { prepared: PreparedMcpWrite[]; argsHash: string; operationId: string; expires: number; sessionId?: string; undoTargetId?: string; cleanup?: () => void };
type LegacySession = { server: McpServer; transport: NodeStreamableHTTPServerTransport; lastActivity: number; activeRequests: number };
function operationError(code: string, message: string): Error & { code: string } { return Object.assign(new Error(message), { code }); }
function errorDetails(error: unknown) {
	const message = error instanceof Error ? error.message : "Не удалось выполнить MCP-запрос.";
	const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code
		: error && typeof error === "object" && "issues" in error && Array.isArray(error.issues) ? "validation"
		: /измени|конфликт|прочитайте.*заново/i.test(message) ? "conflict"
		: /не найден|не найдена/i.test(message) ? "not_found" : "operation_failed";
	return { code, message };
}

export function mcpUnavailableReason(desktop: boolean, nodeVersion = typeof process === "undefined" ? "" : process.versions?.node ?? ""): string | null {
	if (!desktop) return "MCP доступен только в настольном Obsidian.";
	if (Number.parseInt(nodeVersion, 10) < 20 || !/^\d+\./.test(nodeVersion)) return "MCP требует Obsidian со встроенным Node.js 20 или новее.";
	return null;
}
function result(value: unknown) {
	const structuredContent = { result: value };
	return { content: [{ type: "text" as const, text: JSON.stringify(structuredContent) }], structuredContent };
}
function toolError(error: unknown) {
	const detail = errorDetails(error);
	return { isError: true, content: [{ type: "text" as const, text: JSON.stringify(detail) }], structuredContent: { error: detail } };
}

/** Owns the loopback listener, SDK transports and per-operation user confirmations. */
export class McpIntegrationServer {
	private listener: Server | null = null;
	private modern: McpHttpHandler | null = null;
	private readonly sessions = new Map<string, LegacySession>();
	private initializingSessions = 0;
	private readonly pending = new Map<string, PendingWrite>();
	private accepting = false;
	private cleanupTimer: ReturnType<typeof setInterval> | null = null;
	private readonly reservedOperations = new Map<string, string>();
	private generation = 0;
	private port: number | null = null;
	private stopPromise: Promise<void> | null = null;
	private cancelStart: (() => void) | null = null;
	private readonly inFlightWrites = new Set<Promise<unknown>>();

	constructor(private readonly entities: McpEntities, private readonly version: string, private readonly token: string, private readonly readOnly = false) {
		if (token.length < 32) throw new Error("Некорректный токен MCP.");
	}

	async start(port = 0): Promise<number> {
		if (this.listener || this.stopPromise) throw new Error("MCP уже запущен или останавливается.");
		const generation = ++this.generation;
		this.modern = createMcpHandler(() => this.createSdkServer(), { legacy: "reject", maxRequestBodySize: MAX_BODY_BYTES });
		const listener = createServer((request, response) => {
			void this.handle(request, response).catch(() => {
				if (response.destroyed || response.writableEnded) return;
				if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
				response.end("Ошибка MCP-сервера.");
			});
		});
		this.listener = listener;
		try {
			await new Promise<void>((resolve, reject) => {
				const cleanup = () => {
					listener.off("error", onError);
					listener.off("listening", onListening);
					if (this.cancelStart === cancel) this.cancelStart = null;
				};
				const onError = (error: Error) => { cleanup(); reject(error); };
				const onListening = () => { cleanup(); resolve(); };
				const cancel = () => { cleanup(); reject(new Error("Запуск MCP отменён.")); };
				this.cancelStart = cancel;
				listener.once("error", onError);
				listener.once("listening", onListening);
				listener.listen(port, "127.0.0.1");
			});
			if (generation !== this.generation) throw new Error("Запуск MCP отменён.");
			const address = listener.address();
			if (!address || typeof address === "string") throw new Error("Не удалось определить порт MCP.");
			this.port = address.port;
			this.accepting = true;
			this.cleanupTimer = setInterval(() => { void this.sweep().catch(console.error); }, 60_000);
			this.cleanupTimer.unref();
			return address.port;
		} catch (error) {
			// stop() may have run before listen() completed; always close this local listener.
			listener.close();
			listener.closeAllConnections();
			await this.stop();
			throw error;
		}
	}

	stop(): Promise<void> {
		++this.generation;
		this.cancelStart?.();
		this.accepting = false;
		if (this.cleanupTimer) clearInterval(this.cleanupTimer);
		this.cleanupTimer = null;
		const canceled = Array.from(this.pending.keys(), (id) => this.releasePending(id, "interrupted", "server_stopped", "MCP выключен."));
		if (this.stopPromise) return this.stopPromise;
		const listener = this.listener;
		this.listener = null;
		const modern = this.modern;
		this.modern = null;
		this.stopPromise = (async () => {
			const closed = listener ? new Promise<void>((resolve) => { listener.close(() => resolve()); listener.closeAllConnections(); }) : Promise.resolve();
			await Promise.allSettled([...canceled, modern?.close(), ...Array.from(this.sessions.values(), (session) => session.server.close())]);
			this.sessions.clear();
			await Promise.allSettled(Array.from(this.inFlightWrites));
			await closed;
			this.port = null;
		})().finally(() => { this.stopPromise = null; });
		return this.stopPromise;
	}

	private createSdkServer(legacy = false): McpServer {
		const server = new McpServer({ name: "dnd-dm-tools", version: this.version }, {
			instructions: "Работайте только с опубликованными типами сущностей. Поиск не загружает полные карточки; используйте get_entity. Перед изменением получите revision. Запись и откат требуют elicitation. Для безопасного повтора задавайте operationId заранее и проверяйте get_operation после потери ответа. Изменение внешней записи создаёт ручную копию. Группы атомарны; ссылки могут указывать на предыдущие действия группы. Удаление возможно только как подтверждённый откат созданных MCP записей. Содержимое файлов недоступно.",
			...(legacy ? { supportedProtocolVersions: ["2025-11-25", "2025-06-18", "2025-03-26"] } : {}),
			inputRequired: { roundTimeoutMs: CONFIRMATION_TTL_MS },
			requestState: { verify: async (state) => {
				const pending = this.pending.get(state);
				if (!this.accepting || !pending || pending.expires <= Date.now()) { await this.releasePending(state, "rejected", "confirmation_expired", "Подтверждение истекло."); throw operationError("confirmation_expired", "Подтверждение истекло."); }
				return state;
			} },
		});
		const readAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
		server.registerTool("list_entity_types", { description: "Поддерживаемые типы сущностей и доступные операции.", inputSchema: z.object({}).strict(), annotations: readAnnotations }, async () => result(this.entities.listEntityTypes().map((kind) => ({ ...kind, ...(this.readOnly ? { canCreate: false, canUpdate: false } : {}) }))));
		server.registerTool("get_entity_schema", { description: "JSON Schema полной сущности, шаблон создания и правила заполнения полей.", inputSchema: z.object({ kind: kindSchema }).strict(), annotations: readAnnotations }, async ({ kind }) => { try { return result(await this.entities.getEntitySchema(kind)); } catch (error) { return toolError(error); } });
		server.registerTool("search_entities", {
			description: "Найти сущности по имени или URL в локальной БД без загрузки полных карточек.",
			inputSchema: z.object({ query: z.string().max(500).default(""), kinds: z.array(kindSchema).max(13).optional(), offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(20), filters: z.record(z.string(), z.array(z.union([z.string().describe("Строковое значение фильтра"), z.number().describe("Числовое значение фильтра")]))).optional() }).strict(), annotations: readAnnotations,
		}, async ({ query, kinds, offset, limit, filters }) => { try { return result(await this.entities.searchEntities(query, kinds, offset, limit, filters)); } catch (error) { return toolError(error); } });
		server.registerTool("get_entity", {
			description: "Прочитать полную карточку и revision. Если есть только краткая запись, загрузить полную из её источника и сохранить в локальный кеш.",
			inputSchema: z.object({ kind: kindSchema, url: z.string().min(1).max(2048) }).strict(),
			annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
		}, async ({ kind, url }) => { try { return result(await this.entities.getEntity(kind, url)); } catch (error) { return toolError(error); } });
		server.registerTool("list_audio_assets", { description: "Найти все поддерживаемые аудиофайлы в vault: ID, путь и название. id: null означает, что файл ещё не зарегистрирован; передайте его путь в normalAudioPath или combatAudioPath при создании/изменении трека. Содержимое файлов недоступно.", inputSchema: z.object({}).strict(), annotations: readAnnotations }, async () => result(this.entities.listAudioAssets()));
		server.registerTool("search_audio_assets", { description: "Поиск аудиоссылок по имени и пути с пагинацией и признаками регистрации и наличия файла. Содержимое файлов недоступно.", inputSchema: z.object({ query: z.string().max(500).default(""), ...pageSchema }).strict(), annotations: readAnnotations }, async ({ query, offset, limit }) => result(await this.entities.searchAudioAssets(query, offset, limit)));
		server.registerTool("list_operations", { description: "Журнал MCP: статусы и затронутые сущности без полных снимков карточек.", inputSchema: z.object(pageSchema).strict(), annotations: readAnnotations }, async ({ offset, limit }) => { try { return result(await this.entities.listOperations(offset, limit)); } catch (error) { return toolError(error); } });
		server.registerTool("get_operation", { description: "Результат операции по operationId. includeChanges включает снимки до/после. После потери ответа проверяйте статус перед повтором.", inputSchema: z.object({ operationId: operationIdSchema, includeChanges: z.boolean().default(false) }).strict(), annotations: readAnnotations }, async ({ operationId, includeChanges }) => { try { return result(await this.entities.getOperation(operationId, includeChanges)); } catch (error) { return toolError(error); } });
		if (this.readOnly) return server;
		const mutationAnnotations = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
		server.registerTool("create_entity", {
			description: "Создать одну сущность после elicitation. Прочитайте get_entity_schema. Задайте operationId заранее для безопасного повтора.",
			inputSchema: z.object({ kind: kindSchema, data: dataSchema, operationId: operationIdSchema.optional() }).strict(), annotations: { ...mutationAnnotations, destructiveHint: false },
		}, async (args, ctx) => this.trackWrite("create", args, ctx, server));
		server.registerTool("update_entity", {
			description: "Изменить полную карточку после elicitation, используя revision из get_entity. Внешняя запись копируется в ручную с новым URL.",
			inputSchema: z.object({ kind: kindSchema, url: z.string().min(1).max(2048), expectedRevision: revisionSchema, data: dataSchema, operationId: operationIdSchema.optional() }).strict(), annotations: mutationAnnotations,
		}, async (args, ctx) => this.trackWrite("update", args, ctx, server));
		server.registerTool("patch_entity", {
			description: "Изменить указанные поля карточки после elicitation. Объекты объединяются, массивы заменяются целиком. null допустим только по схеме. Требуется текущая revision.",
			inputSchema: z.object({ kind: kindSchema, url: z.string().min(1).max(2048), expectedRevision: revisionSchema, changes: dataSchema, operationId: operationIdSchema.optional() }).strict(), annotations: mutationAnnotations,
		}, async (args, ctx) => this.trackWrite("patch", args, ctx, server));
		server.registerTool("apply_entity_batch", {
			description: "Атомарно выполнить 1–50 действий после одного компактного подтверждения. Задавайте ID новых медиа заранее; ссылки разрешены на предыдущие действия группы. Одну запись можно менять только один раз.",
			inputSchema: z.object({ operationId: operationIdSchema, operations: z.array(batchOperationSchema).min(1).max(50) }).strict(), annotations: mutationAnnotations,
		}, async (args, ctx) => this.trackWrite("batch", args, ctx, server));
		server.registerTool("undo_operation", {
			description: "Атомарно откатить успешную MCP-операцию после нового подтверждения. Созданные ею записи могут быть удалены; откат отклоняется при изменениях или посторонних зависимостях.",
			inputSchema: z.object({ operationId: operationIdSchema, targetOperationId: operationIdSchema }).strict(), annotations: mutationAnnotations,
		}, async (args, ctx) => this.trackWrite("undo", args, ctx, server));
		return server;
	}

	private async releasePending(id: string, status: "rejected" | "interrupted", code: string, message: string): Promise<void> {
		const pending = this.pending.get(id);
		if (!pending) return;
		this.pending.delete(id); pending.cleanup?.(); this.reservedOperations.delete(pending.operationId);
		await this.entities.finishOperation(pending.operationId, status, { code, message });
	}

	private async sweep(): Promise<void> {
		const now = Date.now();
		await Promise.allSettled(Array.from(this.pending, ([id, pending]) => pending.expires <= now ? this.releasePending(id, "rejected", "confirmation_expired", "Подтверждение истекло.") : Promise.resolve()));
		for (const [id, session] of this.sessions) if (!session.activeRequests && session.lastActivity + SESSION_IDLE_MS <= now && !this.hasSessionPending(id)) await this.closeSession(id);
	}
	private hasSessionPending(id: string): boolean { return Array.from(this.pending.values()).some((pending) => pending.sessionId === id); }
	private async closeSession(id: string): Promise<void> {
		const session = this.sessions.get(id);
		if (!session) return;
		this.sessions.delete(id);
		await Promise.allSettled(Array.from(this.pending, ([key, pending]) => pending.sessionId === id ? this.releasePending(key, "interrupted", "session_closed", "Сессия MCP завершена.") : Promise.resolve()));
		await session.server.close();
	}
	private watchRequest(session: LegacySession, response: ServerResponse): void {
		session.activeRequests++; session.lastActivity = Date.now();
		let finished = false;
		const finish = () => { if (finished) return; finished = true; session.activeRequests--; session.lastActivity = Date.now(); response.off("finish", finish); response.off("close", finish); };
		response.once("finish", finish); response.once("close", finish);
	}

	private trackWrite(operation: WriteOperation, args: WriteArgs, ctx: ServerContext, server: McpServer) {
		const request = this.write(operation, args, ctx, server);
		this.inFlightWrites.add(request);
		return request.finally(() => this.inFlightWrites.delete(request));
	}

	private async write(operation: WriteOperation, args: WriteArgs, ctx: ServerContext, server: McpServer) {
		let operationId: string | undefined;
		let ownsOperation = false;
		let ownsReceipt = false;
		let pendingState: string | undefined;
		try {
			if (this.readOnly) throw operationError("read_only", "MCP работает в режиме только чтения.");
			if (!this.accepting || ctx.mcpReq.signal.aborted) throw operationError("canceled", "MCP-запрос отменён.");
			const argsHash = mcpEntityRevision({ operation, ...args });
			const state = ctx.mcpReq.requestState<string>();
			if (state) {
				const pending = this.pending.get(state);
				if (!pending || pending.expires <= Date.now() || pending.argsHash !== argsHash || pending.sessionId !== ctx.sessionId) {
					await this.releasePending(state, "rejected", "confirmation_mismatch", "Параметры операции изменились или подтверждение истекло.");
					throw operationError("confirmation_mismatch", "Параметры операции изменились или подтверждение истекло. Запросите подтверждение заново.");
				}
				this.pending.delete(state); pending.cleanup?.(); operationId = pending.operationId; ownsOperation = true; ownsReceipt = true;
				const response = inputResponse(ctx.mcpReq.inputResponses, "confirm");
				const content = acceptedContent(ctx.mcpReq.inputResponses, "confirm", confirmationSchema);
				if (response.kind !== "elicit" || response.action !== "accept" || content?.confirm !== true) {
					const code = response.kind === "elicit" && response.action === "cancel" ? "canceled" : "permission_denied";
					await this.entities.finishOperation(operationId, "rejected", { code, message: "Изменения не разрешены пользователем." });
					ownsReceipt = false;
					throw operationError(code, "Изменения не разрешены пользователем.");
				}
				const assertActive = () => { if (!this.accepting || ctx.mcpReq.signal.aborted || pending.expires <= Date.now()) throw operationError("canceled", "MCP-запрос отменён или подтверждение истекло."); };
				const writing = this.entities.commitOperation(operationId, pending.prepared, assertActive, pending.undoTargetId);
				this.inFlightWrites.add(writing);
				try { return result(await writing); } finally { this.inFlightWrites.delete(writing); }
			}
			if (ctx.mcpReq.inputResponses && Object.keys(ctx.mcpReq.inputResponses).length) throw operationError("confirmation_mismatch", "Подтверждение не связано с операцией сервера.");
			// Check the capability before preparing or reserving a confirmation: the SDK's later check cannot clean up application state.
			const envelope = ctx.mcpReq.envelope as Record<string, unknown> | undefined;
			const capabilities = (envelope?.[CLIENT_CAPABILITIES_META_KEY] as { elicitation?: Record<string, unknown> } | undefined) ?? server.server.getClientCapabilities();
			const elicitation = capabilities?.elicitation;
			if (!elicitation || (!("form" in elicitation) && (envelope?.[CLIENT_CAPABILITIES_META_KEY] !== undefined || Object.keys(elicitation).length > 0))) throw operationError("elicitation_unsupported", "Для записи клиент должен поддерживать elicitation с формой подтверждения.");
			await this.sweep();
			if (this.reservedOperations.size >= 100) throw operationError("confirmation_limit", "Слишком много ожидающих подтверждения операций.");
			operationId = args.operationId ?? randomUUID();
			const reservation = this.reservedOperations.get(operationId);
			if (reservation) throw operationError(reservation === argsHash ? "operation_busy" : "idempotency_conflict", reservation === argsHash ? "Операция уже ожидает подтверждения или выполняется. Проверьте get_operation." : "Этот operationId уже связан с другим содержимым запроса.");
			this.reservedOperations.set(operationId, argsHash); ownsOperation = true;
			const receipt = await this.entities.beginOperation(operationId, argsHash);
			if (receipt.status === "succeeded") return result(receipt.result);
			if (receipt.status !== "pending" || receipt.isNew === false) {
				ownsOperation = false; this.reservedOperations.delete(operationId);
				throw operationError(receipt.error?.code ?? "operation_finished", receipt.error?.message ?? "Операция уже завершена. Для нового подтверждения используйте новый operationId.");
			}
			ownsReceipt = true;
			const prepared = operation === "batch" ? await this.entities.prepareBatch(args.operations!) : operation === "undo" ? await this.entities.prepareUndo(args.targetOperationId!) : [operation === "create" ? await this.entities.prepareCreate(args.kind!, args.data!) : operation === "patch" ? await this.entities.preparePatch(args.kind!, args.url!, args.changes!, args.expectedRevision!) : await this.entities.prepareUpdate(args.kind!, args.url!, args.data!, args.expectedRevision!)];
			if (!this.accepting || ctx.mcpReq.signal.aborted) throw operationError("canceled", "MCP-запрос отменён.");
			const id = randomUUID();
			pendingState = id;
			const pending: PendingWrite = { prepared, operationId, argsHash, expires: Date.now() + CONFIRMATION_TTL_MS, sessionId: ctx.sessionId, undoTargetId: operation === "undo" ? args.targetOperationId : undefined };
			if (ctx.sessionId) {
				const canceled = () => { void this.releasePending(id, "interrupted", "canceled", "MCP-запрос отменён.").catch(console.error); };
				ctx.mcpReq.signal.addEventListener("abort", canceled, { once: true });
				pending.cleanup = () => ctx.mcpReq.signal.removeEventListener("abort", canceled);
			}
			this.pending.set(id, pending);
			ownsOperation = false;
			return inputRequired({ requestState: id, inputRequests: { confirm: inputRequired.elicit({ message: prepared.map((item) => confirmationMessage(item, operation === "undo")).join("\n\n"), requestedSchema: confirmationSchema }) } });
		} catch (error) {
			if (pendingState && this.pending.has(pendingState)) {
				try { await this.releasePending(pendingState, "rejected", "confirmation_failed", "Не удалось запросить подтверждение."); } catch (failure) { console.error("Не удалось сохранить статус MCP-подтверждения", failure); }
			}
			if (ownsReceipt && operationId) {
				try { await this.entities.finishOperation(operationId, "failed", errorDetails(error)); } catch (failure) { console.error("Не удалось сохранить статус MCP-операции", failure); }
			}
			return toolError(error);
		} finally { if (ownsOperation && operationId) this.reservedOperations.delete(operationId); }
	}

	private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
		const refuse = (status: number, message: string) => { response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }); response.end(message); request.resume(); };
		response.setHeader("Cache-Control", "no-store");
		if (!this.accepting || !this.modern) return refuse(503, "MCP выключен.");
		if (request.url !== "/mcp") return refuse(404, "Не найдено.");
		const allowedHosts = [`127.0.0.1:${this.port}`, `localhost:${this.port}`];
		if (!request.headers.host || !allowedHosts.includes(request.headers.host)) return refuse(403, "Недопустимый Host.");
		const origin = request.headers.origin;
		if (origin !== undefined && !allowedHosts.map((host) => `http://${host}`).includes(origin)) return refuse(403, "Недопустимый Origin.");
		const authorization = request.headers.authorization;
		const supplied = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
		const expected = Buffer.from(this.token);
		const actual = Buffer.from(supplied);
		if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
			response.setHeader("WWW-Authenticate", 'Bearer realm="dnd-dm-tools"');
			return refuse(401, "Требуется токен MCP.");
		}
		if (!["POST", "GET", "DELETE"].includes(request.method ?? "")) return refuse(405, "Метод не поддерживается.");
		let body: unknown;
		if (request.method === "POST") {
			if (!/^application\/json(?:\s*;|$)/i.test(request.headers["content-type"] ?? "")) return refuse(415, "Требуется application/json.");
			const chunks: Buffer[] = [];
			let bytes = 0;
			for await (const chunk of request.iterator({ destroyOnReturn: false })) {
				bytes += chunk.length;
				if (bytes > MAX_BODY_BYTES) return refuse(413, "Запрос слишком большой.");
				chunks.push(Buffer.from(chunk));
			}
			try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return refuse(400, "Некорректный JSON."); }
		}
		const webRequest = await toWebRequest(request, body);
		const legacy = await isLegacyRequest(webRequest, body, { maxRequestBodySize: MAX_BODY_BYTES });
		if (!this.accepting || !this.modern) return refuse(503, "MCP выключен.");
		if (!legacy) {
			await toNodeHandler(this.modern, { maxRequestBodySize: MAX_BODY_BYTES })(request, response, body);
			return;
		}
		const sessionId = request.headers["mcp-session-id"];
		if (typeof sessionId === "string") {
			const session = this.sessions.get(sessionId);
			if (!session) return refuse(404, "Сессия MCP завершена.");
			session.lastActivity = Date.now();
			this.watchRequest(session, response);
			await session.transport.handleRequest(request, response, body);
			return;
		}
		if (request.method !== "POST" || !isInitializeRequest(body)) return refuse(400, "Сначала инициализируйте сессию MCP.");
		await this.sweep();
		if (this.sessions.size + this.initializingSessions >= 64) {
			const candidate = [...this.sessions].filter(([id, session]) => !session.activeRequests && !this.hasSessionPending(id)).sort((a, b) => a[1].lastActivity - b[1].lastActivity)[0];
			if (candidate) await this.closeSession(candidate[0]);
		}
		if (this.sessions.size + this.initializingSessions >= 64) return refuse(503, "Слишком много активных сессий MCP.");
		if (!this.accepting || !this.modern) return refuse(503, "MCP выключен.");
		const generation = this.generation;
		this.initializingSessions++;
		const server = this.createSdkServer(true);
		let initialized = false;
		const transport = new NodeStreamableHTTPServerTransport({
			sessionIdGenerator: randomUUID,
			onsessioninitialized: (id) => {
				initialized = true; this.initializingSessions--;
				if (!this.accepting || generation !== this.generation) { void server.close().catch(console.error); return; }
				const session = { server, transport, lastActivity: Date.now(), activeRequests: 0 };
				this.sessions.set(id, session); this.watchRequest(session, response);
			},
			onsessionclosed: (id) => { void this.closeSession(id).catch(console.error); },
		});
		transport.onclose = () => { if (transport.sessionId) void this.closeSession(transport.sessionId).catch(console.error); };
		try {
			await server.connect(transport);
			if (!this.accepting) { await server.close(); return refuse(503, "MCP выключен."); }
			await transport.handleRequest(request, response, body);
		}
		catch (error) { await server.close(); throw error; }
		finally { if (!initialized) this.initializingSessions--; }
		if (!transport.sessionId) await server.close();
	}
}
