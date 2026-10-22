import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import {
	McpServer, createMcpHandler, inputRequired, inputResponse, acceptedContent,
	isInitializeRequest, isLegacyRequest, type ServerContext, type McpHttpHandler,
} from "@modelcontextprotocol/server";
import { NodeStreamableHTTPServerTransport, toNodeHandler, toWebRequest } from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import { McpEntities, MCP_ENTITY_KINDS, mcpEntityRevision, type PreparedMcpWrite } from "./McpEntities";

export type McpRuntimeStatus = { running: boolean; port: number | null; error?: string };
const MAX_BODY_BYTES = 1_048_576;
const CONFIRMATION_TTL_MS = 5 * 60_000;
const entityTypeNames: Record<typeof MCP_ENTITY_KINDS[number], string> = {
	bestiary: "Существо (статблок)", spellbook: "Заклинание", arsenal: "Оружие", armory: "Броня",
	equipment: "Снаряжение", artifactory: "Артефакт", backgrounds: "Предыстория", feats: "Черта", races: "Раса",
	adventure: "Приключение", scene: "Сцена", track: "Трек", playlist: "Плейлист",
};
function confirmationMessage(prepared: PreparedMcpWrite): string {
	const name = prepared.data.name;
	const title = typeof name === "string" ? name : (name as { rus?: string; eng?: string }).rus || (name as { eng?: string }).eng || "Без имени";
	const compactTitle = title.replace(/\s+/g, " ").trim();
	const action = prepared.sourceUrl && prepared.sourceUrl !== prepared.url
		? "Создание ручной копии" : prepared.operation === "create" ? "Создание" : "Изменение";
	return `Тип сущности: ${entityTypeNames[prepared.kind]}\nИмя: ${compactTitle.length > 160 ? compactTitle.slice(0, 160) + "…" : compactTitle}\nТип изменения: ${action}`;
}
const confirmationSchema = z.object({ confirm: z.boolean().meta({ title: "Разрешить эти изменения" }) });
const kindSchema = z.enum(MCP_ENTITY_KINDS);
const dataSchema = z.record(z.string(), z.unknown());
type WriteArgs = { kind: z.infer<typeof kindSchema>; data: Record<string, unknown>; url?: string; expectedRevision?: string };
type PendingWrite = { prepared: PreparedMcpWrite; argsHash: string; expires: number; sessionId?: string };
type LegacySession = { server: McpServer; transport: NodeStreamableHTTPServerTransport };

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
	return { isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Не удалось выполнить MCP-запрос." }] };
}

/** Owns the loopback listener, SDK transports and per-operation user confirmations. */
export class McpIntegrationServer {
	private listener: Server | null = null;
	private modern: McpHttpHandler | null = null;
	private readonly sessions = new Map<string, LegacySession>();
	private readonly pending = new Map<string, PendingWrite>();
	private accepting = false;
	private generation = 0;
	private port: number | null = null;
	private stopPromise: Promise<void> | null = null;
	private cancelStart: (() => void) | null = null;
	private readonly inFlightWrites = new Set<Promise<unknown>>();

	constructor(private readonly entities: McpEntities, private readonly version: string, private readonly token: string) {
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
		this.pending.clear();
		if (this.stopPromise) return this.stopPromise;
		const listener = this.listener;
		this.listener = null;
		const modern = this.modern;
		this.modern = null;
		this.stopPromise = (async () => {
			const closed = listener ? new Promise<void>((resolve) => { listener.close(() => resolve()); listener.closeAllConnections(); }) : Promise.resolve();
			await Promise.allSettled([modern?.close(), ...Array.from(this.sessions.values(), (session) => session.server.close())]);
			this.sessions.clear();
			await Promise.allSettled(Array.from(this.inFlightWrites));
			await closed;
			this.port = null;
		})().finally(() => { this.stopPromise = null; });
		return this.stopPromise;
	}

	private createSdkServer(legacy = false): McpServer {
		const server = new McpServer({ name: "dnd-dm-tools", version: this.version }, {
			instructions: "Работайте только с опубликованными типами сущностей. Поиск не загружает полные карточки; используйте get_entity. Перед update_entity получите revision. Создание и изменение требуют отдельного подтверждения пользователя через elicitation. Изменение внешней записи создаёт ручную копию. Удаление и доступ к содержимому файлов отсутствуют.",
			...(legacy ? { supportedProtocolVersions: ["2025-11-25", "2025-06-18", "2025-03-26"] } : {}),
			inputRequired: { roundTimeoutMs: CONFIRMATION_TTL_MS },
			requestState: { verify: (state) => {
				const pending = this.pending.get(state);
				if (!this.accepting || !pending || pending.expires <= Date.now()) { this.pending.delete(state); throw new Error("Подтверждение истекло."); }
				return state;
			} },
		});
		const readAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
		server.registerTool("list_entity_types", { description: "Поддерживаемые типы сущностей и доступные операции.", inputSchema: z.object({}).strict(), annotations: readAnnotations }, async () => result(this.entities.listEntityTypes()));
		server.registerTool("get_entity_schema", { description: "JSON Schema полной сущности, шаблон создания и правила заполнения полей.", inputSchema: z.object({ kind: kindSchema }).strict(), annotations: readAnnotations }, async ({ kind }) => result(this.entities.getEntitySchema(kind)));
		server.registerTool("search_entities", {
			description: "Найти сущности по имени или URL в локальной БД без загрузки полных карточек.",
			inputSchema: z.object({ query: z.string().max(500).default(""), kinds: z.array(kindSchema).max(13).optional(), offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(20) }).strict(), annotations: readAnnotations,
		}, async ({ query, kinds, offset, limit }) => result(await this.entities.searchEntities(query, kinds, offset, limit)));
		server.registerTool("get_entity", {
			description: "Прочитать полную карточку и revision. Если есть только краткая запись, загрузить полную из её источника и сохранить в локальный кеш.",
			inputSchema: z.object({ kind: kindSchema, url: z.string().min(1).max(2048) }).strict(),
			annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
		}, async ({ kind, url }) => { try { return result(await this.entities.getEntity(kind, url)); } catch (error) { return toolError(error); } });
		server.registerTool("list_audio_assets", { description: "Найти все поддерживаемые аудиофайлы в vault: ID, путь и название. id: null означает, что файл ещё не зарегистрирован; передайте его путь в normalAudioPath или combatAudioPath при создании/изменении трека. Содержимое файлов недоступно.", inputSchema: z.object({}).strict(), annotations: readAnnotations }, async () => result(this.entities.listAudioAssets()));
		server.registerTool("create_entity", {
			description: "Создать одну сущность. Сначала прочитайте get_entity_schema. Сохранение только после отдельного подтверждения пользователя через elicitation.",
			inputSchema: z.object({ kind: kindSchema, data: dataSchema }).strict(), annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
		}, async (args, ctx) => this.write("create", args, ctx));
		server.registerTool("update_entity", {
			description: "Изменить одну сущность после elicitation. Передайте полную новую карточку и revision из get_entity. Внешняя запись будет скопирована в ручную с новым URL.",
			inputSchema: z.object({ kind: kindSchema, url: z.string().min(1).max(2048), expectedRevision: z.string().regex(/^[a-f0-9]{64}$/), data: dataSchema }).strict(), annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
		}, async (args, ctx) => this.write("update", args, ctx));
		return server;
	}

	private async write(operation: "create" | "update", args: WriteArgs, ctx: ServerContext) {
		try {
			if (!this.accepting || ctx.mcpReq.signal.aborted) throw new Error("MCP-запрос отменён.");
			const argsHash = mcpEntityRevision({ operation, ...args });
			const state = ctx.mcpReq.requestState<string>();
			if (state) {
				const pending = this.pending.get(state);
				// Consume the challenge even on a refusal or a changed payload.
				this.pending.delete(state);
				if (!pending || pending.expires <= Date.now() || pending.argsHash !== argsHash || pending.sessionId !== ctx.sessionId) throw new Error("Параметры операции изменились или подтверждение истекло. Запросите подтверждение заново.");
				const response = inputResponse(ctx.mcpReq.inputResponses, "confirm");
				const content = acceptedContent(ctx.mcpReq.inputResponses, "confirm", confirmationSchema);
				if (response.kind !== "elicit" || response.action !== "accept" || content?.confirm !== true) return toolError(new Error("Изменения не разрешены пользователем."));
				const assertActive = () => {
					if (!this.accepting || ctx.mcpReq.signal.aborted || pending.expires <= Date.now()) throw new Error("MCP-запрос отменён или подтверждение истекло.");
				};
				const write = this.entities.commit(pending.prepared, assertActive);
				this.inFlightWrites.add(write);
				try { return result(await write); } finally { this.inFlightWrites.delete(write); }
			}
			if (ctx.mcpReq.inputResponses && Object.keys(ctx.mcpReq.inputResponses).length) throw new Error("Подтверждение не связано с операцией сервера.");
			for (const [id, pending] of this.pending) if (pending.expires <= Date.now()) this.pending.delete(id);
			if (this.pending.size >= 100) throw new Error("Слишком много ожидающих подтверждения операций.");
			const prepared = operation === "create"
				? await this.entities.prepareCreate(args.kind, args.data)
				: await this.entities.prepareUpdate(args.kind, args.url!, args.data, args.expectedRevision!);
			if (!this.accepting || ctx.mcpReq.signal.aborted) throw new Error("MCP-запрос отменён.");
			const id = randomUUID();
			this.pending.set(id, { prepared, argsHash, expires: Date.now() + CONFIRMATION_TTL_MS, sessionId: ctx.sessionId });
			try {
				return inputRequired({
					requestState: id,
					inputRequests: { confirm: inputRequired.elicit({
						message: confirmationMessage(prepared),
						requestedSchema: confirmationSchema,
					}) },
				});
			} catch (error) { this.pending.delete(id); throw error; }
		} catch (error) { return toolError(error); }
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
			await session.transport.handleRequest(request, response, body);
			return;
		}
		if (request.method !== "POST" || !isInitializeRequest(body)) return refuse(400, "Сначала инициализируйте сессию MCP.");
		if (this.sessions.size >= 64) return refuse(503, "Слишком много сессий MCP.");
		const server = this.createSdkServer(true);
		const transport = new NodeStreamableHTTPServerTransport({
			sessionIdGenerator: randomUUID,
			onsessioninitialized: (id) => { this.sessions.set(id, { server, transport }); },
			onsessionclosed: (id) => { this.sessions.delete(id); },
		});
		transport.onclose = () => { if (transport.sessionId) this.sessions.delete(transport.sessionId); };
		try {
			await server.connect(transport);
			if (!this.accepting) { await server.close(); return refuse(503, "MCP выключен."); }
			await transport.handleRequest(request, response, body);
		}
		catch (error) { await server.close(); throw error; }
		if (!transport.sessionId) await server.close();
	}
}
