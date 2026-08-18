import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from "http";
import type { Duplex } from "stream";
import { randomBytes } from "crypto";
import { readFile } from "fs/promises";
import { join } from "path";
import { WebSocket, WebSocketServer, type RawData } from "ws";
import { OwlbearImageAssetStore, createFallbackSvg, createTokenVisualSvg, type TokenVisualState } from "./OwlbearImageAssetStore";
import type { OwlbearEncounterSnapshot, OwlbearSyncDiagnostics, OwlbearTokenLink } from "src/domain/models/owlbear/OwlbearSync";
import type { OwlbearPreviewSnapshot } from "src/domain/models/owlbear/OwlbearPreview";
import { isAllowedOwlbearExtensionOrigin } from "./OwlbearExtensionHosting";

const PROTOCOL_VERSION = 2;
const HANDSHAKE_TIMEOUT_MS = 5_000;
const APPLY_TIMEOUT_MS = 30_000;
const PREVIEW_TIMEOUT_MS = 30_000;
const SCENE_CLEAR_TIMEOUT_MS = 3_000;
const AUTH_ERROR_CLOSE_CODE = 4001;
const PROTOCOL_ERROR_CLOSE_CODE = 4002;
const ASSETS: Record<string, { filename: string; contentType: string }> = {
	"/manifest.json": { filename: "manifest.json", contentType: "application/json; charset=utf-8" },
	"/index.html": { filename: "index.html", contentType: "text/html; charset=utf-8" },
	"/background.html": { filename: "background.html", contentType: "text/html; charset=utf-8" },
	"/main.js": { filename: "main.js", contentType: "text/javascript; charset=utf-8" },
	"/background.js": { filename: "background.js", contentType: "text/javascript; charset=utf-8" },
	"/icon.svg": { filename: "icon.svg", contentType: "image/svg+xml" },
	"/icon-v2.svg": { filename: "icon-v2.svg", contentType: "image/svg+xml" },
};
const STATUS_ICON_NAMES = [
	"bloodied", "concentration", "condition", "dead", "down",
	"unconscious", "frightened", "exhaustion", "invisible", "incapacitated", "deafened", "petrified", "restrained", "blinded", "poisoned", "charmed", "stunned", "paralyzed", "prone", "grappled",
];
for (const name of STATUS_ICON_NAMES) ASSETS[`/status-icons/${name}.svg`] = { filename: `status-icons/${name}.svg`, contentType: "image/svg+xml" };

type IntegrationMessage = {
	protocolVersion: number;
	messageId: string;
	type: string;
	snapshotId?: string;
	[key: string]: unknown;
};

export type OwlbearServerStatus = {
	running: boolean;
	port: number | null;
	connected: boolean;
	error?: string;
};

export class OwlbearIntegrationServer {
	private server: HttpServer | null = null;
	private publicAssetServer: HttpServer | null = null;
	private publicAssetPort: number | null = null;
	private publicAssetOrigin: string | null = null;
	private publicAssetSecret = randomBytes(24).toString("base64url");
	private websocketServer: WebSocketServer | null = null;
	private assetDirectory: string | null = null;
	private client: WebSocket | null = null;
	private messageQueue: Promise<void> = Promise.resolve();
	private authenticated = false;
	private handshakeTimeout: ReturnType<typeof setTimeout> | null = null;
	private applyTimeout: ReturnType<typeof setTimeout> | null = null;
	private inFlightSnapshotId: string | null = null;
	private pendingSnapshot: OwlbearEncounterSnapshot | null = null;
	private previewOperation: {
		previewId: string;
		resolve: () => void;
		reject: (error: Error) => void;
		timeout: ReturnType<typeof setTimeout>;
	} | null = null;
	private sceneClearOperation: {
		clearId: string;
		resolve: () => void;
		reject: (error: Error) => void;
		timeout: ReturnType<typeof setTimeout>;
	} | null = null;
	private status: OwlbearServerStatus = { running: false, port: null, connected: false };
	private readonly imageStore: OwlbearImageAssetStore;

	constructor(
		private readonly extensionDirectories: string[],
		private readonly imageCacheDirectory: string,
		private readonly getToken: () => string | null,
		private readonly getSnapshot: () => OwlbearEncounterSnapshot | undefined,
		private readonly getPreview: () => OwlbearPreviewSnapshot | undefined,
		private readonly onApplied: (snapshotId: string, links: OwlbearTokenLink[], diagnostics: OwlbearSyncDiagnostics) => Promise<void>,
		private readonly onStatus: (status: OwlbearServerStatus) => void,
	) {
		this.imageStore = new OwlbearImageAssetStore(imageCacheDirectory);
	}

	getStatus(): OwlbearServerStatus { return this.status; }
	getPublicAssetPort(): number | null { return this.publicAssetPort; }
	getPublicAssetPath(): string { return `/assets/${this.publicAssetSecret}`; }
	getAssetBaseUrl(): string | null { return this.publicAssetOrigin ? `${this.publicAssetOrigin}${this.getPublicAssetPath()}` : null; }
	setPublicAssetOrigin(origin: string): void {
		const url = new URL(origin);
		if (url.protocol !== "https:" || !/^[a-z0-9-]+\.trycloudflare\.com$/i.test(url.hostname) || url.pathname !== "/") throw new Error("cloudflared вернул недопустимый публичный адрес.");
		this.publicAssetOrigin = url.origin;
	}
	clearPublicAssetOrigin(): void {
		this.publicAssetOrigin = null;
		this.clearApplyTimeout();
		this.inFlightSnapshotId = null;
		this.pendingSnapshot = null;
	}

	async start(port: number): Promise<number> {
		if (this.server) await this.stop();
		this.assetDirectory = await this.findAssetDirectory();
		if (!this.assetDirectory) throw new Error("Файлы Owlbear-расширения не найдены. Укажите корректный dev bundle или установите полный release.");
		await this.imageStore.initialize();
		this.publicAssetSecret = randomBytes(24).toString("base64url");
		this.publicAssetOrigin = null;
		this.publicAssetServer = createServer((request, response) => void this.handlePublicAssetHttp(request, response));
		await listen(this.publicAssetServer, 0);
		const publicAddress = this.publicAssetServer.address();
		if (!publicAddress || typeof publicAddress === "string") throw new Error("Не удалось определить порт публичных Owlbear-ресурсов.");
		this.publicAssetPort = publicAddress.port;
		this.websocketServer = new WebSocketServer({
			noServer: true,
			clientTracking: false,
			perMessageDeflate: false,
			maxPayload: 1_000_000,
		});
		this.server = createServer((request, response) => void this.handleHttp(request, response));
		this.server.on("upgrade", (request, socket, head) => this.handleUpgrade(request, socket, head));
		try {
			await new Promise<void>((resolve, reject) => {
				this.server!.once("error", reject);
				this.server!.listen(port, "127.0.0.1", () => {
					this.server!.off("error", reject);
					resolve();
				});
			});
		} catch (error) {
			this.server.close();
			this.server = null;
			this.websocketServer.close();
			this.websocketServer = null;
			await this.stopPublicAssetServer();
			throw error;
		}
		const address = this.server.address();
		if (!address || typeof address === "string") throw new Error("Не удалось определить порт Owlbear.");
		this.setStatus({ running: true, port: address.port, connected: false });
		return address.port;
	}

	async stop(): Promise<void> {
		this.rejectPreviewOperation(new Error("Интеграция Owlbear остановлена."));
		this.rejectSceneClearOperation(new Error("Интеграция Owlbear остановлена."));
		this.disconnectClient();
		this.clearApplyTimeout();
		this.pendingSnapshot = null;
		this.inFlightSnapshotId = null;
		this.publicAssetOrigin = null;
		if (this.server) {
			const server = this.server;
			this.server = null;
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
		this.websocketServer?.close();
		this.websocketServer = null;
		await this.stopPublicAssetServer();
		this.setStatus({ running: false, port: null, connected: false });
	}

	async materializeSnapshot(snapshot: OwlbearEncounterSnapshot, previousSnapshot?: OwlbearEncounterSnapshot): Promise<OwlbearEncounterSnapshot> {
		const previousParticipants = new Map(previousSnapshot?.participants.map((participant) => [participant.participantId, participant]));
		const protectedIds = snapshot.participants.map((participant) => participant.imageAssetId).filter((value): value is string => Boolean(value));
		const activePreviewAssetId = this.getPreview()?.imageAssetId;
		if (activePreviewAssetId) protectedIds.push(activePreviewAssetId);
		const materializedAssetIds: string[] = [];
		const participants: OwlbearEncounterSnapshot["participants"] = [];
		for (const participant of snapshot.participants) {
			const previous = previousParticipants.get(participant.participantId);
			const freshImage = parseImageDataUrl(participant.imageDataUrl);
			let assetId = participant.imageAssetId;
			let mime = participant.imageMime;
			let width = participant.imageWidth;
			let height = participant.imageHeight;
			let usedFallback = participant.imageFallback === true;
			if (freshImage) {
				assetId = await this.imageStore.put(freshImage.mime, freshImage.bytes, protectedIds.concat(materializedAssetIds));
				mime = freshImage.mime;
				usedFallback = false;
			}
			if (!assetId && previous?.imageSource && previous.imageSource === participant.imageSource && previous.imageAssetId) {
				const previousBytes = await this.imageStore.get(previous.imageAssetId);
				if (previousBytes) {
					assetId = previous.imageAssetId;
					mime = mime ?? previous.imageMime;
					width = width ?? previous.imageWidth;
					height = height ?? previous.imageHeight;
					usedFallback = previous.imageFallback === true;
				}
			}
			if (!assetId || !(await this.imageStore.has(assetId))) {
				if (!freshImage) {
					const fallback = createFallbackSvg(participant.name, participant.colorHex, participant.side);
					assetId = await this.imageStore.put(fallback.mime, fallback.bytes, protectedIds.concat(materializedAssetIds));
					mime = fallback.mime;
					width = 512;
					height = 512;
					usedFallback = true;
				}
			}
			if (!assetId) throw new Error(`Не удалось подготовить изображение токена «${participant.name}».`);
			const materializedParticipant = {
				...participant,
				imageAssetId: assetId,
				imageDataUrl: undefined,
				imageMime: mime ?? "image/png",
				imageWidth: width ?? 512,
				imageHeight: height ?? 512,
				imageFallback: usedFallback,
				imageUrl: undefined,
			};
			participants.push(materializedParticipant);
			materializedAssetIds.push(assetId);
		}
		const protectedAssetIds = participants.map((participant) => participant.imageAssetId).filter((value): value is string => Boolean(value));
		if (activePreviewAssetId) protectedAssetIds.push(activePreviewAssetId);
		await this.imageStore.cleanup(protectedAssetIds);
		return { ...snapshot, participants };
	}

	async materializePreview(preview: OwlbearPreviewSnapshot): Promise<OwlbearPreviewSnapshot> {
		const freshImage = parseImageDataUrl(preview.imageDataUrl);
		let assetId = preview.imageAssetId;
		if (freshImage) {
			const protectedIds = this.getSnapshot()?.participants
				.map((participant) => participant.imageAssetId)
				.filter((value): value is string => Boolean(value)) ?? [];
			assetId = await this.imageStore.put(freshImage.mime, freshImage.bytes, protectedIds);
		}
		if (!assetId || !(await this.imageStore.has(assetId))) {
			throw new Error("Не удалось подготовить изображение превью Owlbear.");
		}
		await this.imageStore.cleanup([
			...(this.getSnapshot()?.participants.map((participant) => participant.imageAssetId).filter((value): value is string => Boolean(value)) ?? []),
			assetId,
		]);
		return { ...preview, imageAssetId: assetId, imageDataUrl: undefined, imageUrl: undefined };
	}

	publishPrepared(snapshot: OwlbearEncounterSnapshot): void {
		if (!this.authenticated || !this.client) throw new Error("Расширение Owlbear не подключено.");
		this.enqueueSnapshot(this.rebindSnapshotUrls(snapshot));
	}

	async clearManagedScene(): Promise<void> {
		if (!this.authenticated || !this.client || this.client.readyState !== WebSocket.OPEN) return;
		if (this.sceneClearOperation) throw new Error("Очистка сцены Owlbear уже выполняется.");
		const clearId = randomBytes(8).toString("hex");
		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				if (this.sceneClearOperation?.clearId !== clearId) return;
				this.sceneClearOperation = null;
				reject(new Error("Расширение Owlbear не подтвердило очистку сцены за 3 секунды."));
			}, SCENE_CLEAR_TIMEOUT_MS);
			this.sceneClearOperation = { clearId, resolve, reject, timeout };
			this.send({ type: "scene.clear", clearId });
		});
	}

	async publishPreview(preview: OwlbearPreviewSnapshot): Promise<OwlbearPreviewSnapshot> {
		if (!this.authenticated || !this.client) throw new Error("Расширение Owlbear не подключено.");
		if (!this.getAssetBaseUrl()) throw new Error("Публичный туннель изображений Owlbear ещё не готов.");
		const prepared = await this.materializePreview(preview);
		await this.sendPreviewCommand("preview.publish", this.rebindPreviewUrl(prepared));
		return prepared;
	}

	async clearPreview(previewId: string): Promise<void> {
		if (!this.authenticated || !this.client) throw new Error("Расширение Owlbear не подключено.");
		await this.sendPreviewCommand("preview.clear", undefined, previewId);
	}

	private async handleHttp(request: IncomingMessage, response: ServerResponse): Promise<void> {
		response.setHeader("Access-Control-Allow-Origin", "https://www.owlbear.rodeo");
		response.setHeader("Vary", "Origin");
		const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
		const path = requestUrl.pathname;
		const assetMatch = /^\/token-images\/([a-f0-9]{64})(?:\/([^/]+))?$/.exec(path);
		const assetId = assetMatch?.[1];
		if (assetId && request.method === "GET") {
			const bytes = await this.imageStore.get(assetId);
			if (!bytes) { response.writeHead(404).end("Not found"); return; }
			const encodedMime = assetMatch?.[2];
			let mime = "application/octet-stream";
			try {
				const decodedMime = encodedMime ? decodeURIComponent(encodedMime) : "";
				if (/^image\/[a-z0-9.+-]+$/i.test(decodedMime)) mime = decodedMime;
			} catch { /* use generic content type */ }
			const visual = requestUrl.searchParams.get("visual");
			if (visual === "down" || visual === "dead") {
				const width = parseVisualDimension(requestUrl.searchParams.get("width"));
				const height = parseVisualDimension(requestUrl.searchParams.get("height"));
				response.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "private, max-age=31536000, immutable" })
					.end(createTokenVisualSvg(mime, bytes, visual satisfies TokenVisualState, width, height));
				return;
			}
			response.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" }).end(bytes);
			return;
		}
		const asset = ASSETS[path === "/" ? "/index.html" : path];
		if (!asset || request.method !== "GET") { response.writeHead(404).end("Not found"); return; }
		try {
			const content = await readFile(join(this.assetDirectory!, asset.filename));
			response.writeHead(200, { "Content-Type": asset.contentType, "Cache-Control": "no-cache" }).end(content);
		} catch {
			response.writeHead(503).end("Owlbear extension assets are unavailable");
		}
	}

	private async handlePublicAssetHttp(request: IncomingMessage, response: ServerResponse): Promise<void> {
		const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
		const prefix = this.getPublicAssetPath();
		if (request.method !== "GET" || !requestUrl.pathname.startsWith(`${prefix}/`)) { response.writeHead(404).end("Not found"); return; }
		const path = requestUrl.pathname.slice(prefix.length);
		response.setHeader("Access-Control-Allow-Origin", "https://www.owlbear.rodeo");
		response.setHeader("Vary", "Origin");
		if (path === "/health") {
			response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }).end("ok");
			return;
		}
		const assetMatch = /^\/token-images\/([a-f0-9]{64})(?:\/([^/]+))?$/.exec(path);
		if (assetMatch?.[1]) {
			await this.serveTokenImage(requestUrl, response, assetMatch[1], assetMatch[2], true);
			return;
		}
		const iconMatch = /^\/status-icons\/([a-z0-9-]+)\.svg$/.exec(path);
		if (iconMatch && STATUS_ICON_NAMES.includes(iconMatch[1])) {
			try {
				const content = await readFile(join(this.assetDirectory!, "status-icons", `${iconMatch[1]}.svg`));
				response.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" }).end(content);
			} catch { response.writeHead(503).end("Asset unavailable"); }
			return;
		}
		response.writeHead(404).end("Not found");
	}

	private async serveTokenImage(requestUrl: URL, response: ServerResponse, assetId: string, encodedMime: string | undefined, publicCache: boolean): Promise<void> {
		const bytes = await this.imageStore.get(assetId);
		if (!bytes) { response.writeHead(404).end("Not found"); return; }
		let mime = "application/octet-stream";
		try {
			const decodedMime = encodedMime ? decodeURIComponent(encodedMime) : "";
			if (/^image\/[a-z0-9.+-]+$/i.test(decodedMime)) mime = decodedMime;
		} catch { /* use generic content type */ }
		const cacheControl = publicCache ? "public, max-age=31536000, immutable" : "no-store";
		const visual = requestUrl.searchParams.get("visual");
		if (visual === "down" || visual === "dead") {
			const width = parseVisualDimension(requestUrl.searchParams.get("width"));
			const height = parseVisualDimension(requestUrl.searchParams.get("height"));
			response.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": cacheControl })
				.end(createTokenVisualSvg(mime, bytes, visual satisfies TokenVisualState, width, height));
			return;
		}
		response.writeHead(200, { "Content-Type": mime, "Cache-Control": cacheControl }).end(bytes);
	}

	private handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
		if (new URL(request.url ?? "/", "http://127.0.0.1").pathname !== "/ws" || !this.isAllowedWebSocketOrigin(request.headers.origin)) { socket.destroy(); return; }
		const websocketServer = this.websocketServer;
		if (!websocketServer) { socket.destroy(); return; }
		websocketServer.handleUpgrade(request, socket, head, (client) => this.handleConnection(client));
	}

	private handleConnection(client: WebSocket): void {
		this.disconnectClient();
		this.client = client;
		this.messageQueue = Promise.resolve();
		this.authenticated = false;
		this.setStatus({ ...this.status, connected: false });
		client.on("message", (data, isBinary) => this.enqueueClientMessage(client, data, isBinary));
		client.on("close", () => { if (this.client === client) this.disconnectClient(); });
		client.on("error", () => { if (this.client === client) this.disconnectClient(); });
		this.handshakeTimeout = setTimeout(() => { if (!this.authenticated && this.client === client) client.terminate(); }, HANDSHAKE_TIMEOUT_MS);
	}

	private enqueueClientMessage(client: WebSocket, data: RawData, isBinary: boolean): void {
		this.messageQueue = this.messageQueue.then(async () => {
			if (client !== this.client) return;
			if (isBinary) { this.closeClient(PROTOCOL_ERROR_CLOSE_CODE, "Ожидалось текстовое сообщение."); return; }
			let message: IntegrationMessage;
			try { message = JSON.parse(data.toString()) as IntegrationMessage; } catch {
				this.closeClient(PROTOCOL_ERROR_CLOSE_CODE, "Некорректное сообщение протокола.");
				return;
			}
			await this.handleMessage(message);
		}).catch((error) => {
			if (client !== this.client) return;
			this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
			this.closeClient(PROTOCOL_ERROR_CLOSE_CODE, "Ошибка обработки сообщения.");
		});
	}

	private async handleMessage(message: IntegrationMessage): Promise<void> {
		if (message.protocolVersion !== PROTOCOL_VERSION || typeof message.type !== "string") { this.closeClient(PROTOCOL_ERROR_CLOSE_CODE, "Несовместимая версия протокола."); return; }
		if (!this.authenticated) {
			if (message.type !== "client.hello" || message.token !== this.getToken()) { this.closeClient(AUTH_ERROR_CLOSE_CODE, "Неверный код сопряжения."); return; }
			this.authenticated = true;
			if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
			this.handshakeTimeout = null;
			this.setStatus({ ...this.status, connected: true, error: undefined });
			this.send({ type: "server.ready" });
			return;
		}
		if (message.type === "snapshot.request") {
			const snapshot = this.getSnapshot();
			if (!snapshot) { this.send({ type: "snapshot.empty" }); return; }
			try {
				const prepared = await this.materializeSnapshot(snapshot);
				this.enqueueSnapshot(this.rebindSnapshotUrls(prepared));
			} catch (error) {
				this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
			}
			return;
		}
		if (message.type === "preview.request") {
			const preview = this.getPreview();
			if (!preview) {
				this.send({ type: "preview.empty" });
				return;
			}
			try {
				const prepared = await this.materializePreview(preview);
				void this.sendPreviewCommand("preview.publish", this.rebindPreviewUrl(prepared)).catch((error) => {
					this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
				});
			} catch (error) {
				this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
			}
			return;
		}
		if (message.type === "ping") { this.send({ type: "pong" }); return; }
		if (message.type === "preview.applied" && typeof message.previewId === "string") {
			if (message.previewId === this.previewOperation?.previewId) this.resolvePreviewOperation();
			return;
		}
		if (message.type === "preview.failed" && typeof message.previewId === "string" && typeof message.error === "string") {
			if (message.previewId === this.previewOperation?.previewId) this.rejectPreviewOperation(new Error(message.error));
			return;
		}
		if (message.type === "scene.applied" && typeof message.clearId === "string") {
			if (message.clearId === this.sceneClearOperation?.clearId) this.resolveSceneClearOperation();
			return;
		}
		if (message.type === "scene.failed" && typeof message.clearId === "string" && typeof message.error === "string") {
			if (message.clearId === this.sceneClearOperation?.clearId) this.rejectSceneClearOperation(new Error(message.error));
			return;
		}
		if (message.type === "snapshot.applied" && typeof message.snapshotId === "string" && Array.isArray(message.tokenLinks) && message.diagnostics && typeof message.diagnostics === "object") {
			if (message.snapshotId !== this.inFlightSnapshotId) return;
			const snapshotId = this.inFlightSnapshotId;
			this.inFlightSnapshotId = null;
			this.clearApplyTimeout();
			this.setStatus({ ...this.status, error: undefined });
			try {
				await this.onApplied(snapshotId, message.tokenLinks as OwlbearTokenLink[], message.diagnostics as OwlbearSyncDiagnostics);
			} catch (error) {
				this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
			} finally {
				this.drainPending();
			}
			return;
		}
		if (message.type === "snapshot.failed" && typeof message.snapshotId === "string" && typeof message.error === "string") {
			if (message.snapshotId !== this.inFlightSnapshotId) return;
			this.setStatus({ ...this.status, error: message.error });
			this.inFlightSnapshotId = null;
			this.clearApplyTimeout();
			this.drainPending();
		}
	}

	private enqueueSnapshot(snapshot: OwlbearEncounterSnapshot): void {
		if (this.inFlightSnapshotId) { this.pendingSnapshot = snapshot; return; }
		this.sendSnapshot(snapshot);
	}

	private sendSnapshot(snapshot: OwlbearEncounterSnapshot): void {
		if (!this.authenticated || !this.client) return;
		this.inFlightSnapshotId = snapshot.snapshotId;
		this.send({ type: "snapshot.publish", snapshotId: snapshot.snapshotId, snapshot });
		this.clearApplyTimeout();
		this.applyTimeout = setTimeout(() => {
			if (this.inFlightSnapshotId !== snapshot.snapshotId) return;
			this.setStatus({ ...this.status, error: "Расширение Owlbear не подтвердило применение снапшота за 30 секунд." });
			this.inFlightSnapshotId = null;
			this.drainPending();
		}, APPLY_TIMEOUT_MS);
	}

	private drainPending(): void {
		const pending = this.pendingSnapshot;
		this.pendingSnapshot = null;
		if (pending) this.sendSnapshot(pending);
	}

	private send(payload: Record<string, unknown>): void {
		if (!this.client || !this.authenticated || this.client.readyState !== WebSocket.OPEN) return;
		this.client.send(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, messageId: randomBytes(8).toString("hex"), ...payload }));
	}

	private sendPreviewCommand(type: "preview.publish" | "preview.clear", preview?: OwlbearPreviewSnapshot, previewId?: string): Promise<void> {
		if (this.previewOperation) return Promise.reject(new Error("Предыдущее превью Owlbear ещё применяется."));
		const id = preview?.previewId ?? previewId;
		if (!id) return Promise.reject(new Error("Не указан идентификатор превью Owlbear."));
		return new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				if (this.previewOperation?.previewId !== id) return;
				this.previewOperation = null;
				reject(new Error("Расширение Owlbear не подтвердило изменение превью за 30 секунд."));
			}, PREVIEW_TIMEOUT_MS);
			this.previewOperation = { previewId: id, resolve, reject, timeout };
			this.send(type === "preview.publish"
				? { type, previewId: id, preview }
				: { type, previewId: id });
		});
	}

	private resolvePreviewOperation(): void {
		const operation = this.previewOperation;
		if (!operation) return;
		this.previewOperation = null;
		clearTimeout(operation.timeout);
		operation.resolve();
	}

	private rejectPreviewOperation(error: Error): void {
		const operation = this.previewOperation;
		if (!operation) return;
		this.previewOperation = null;
		clearTimeout(operation.timeout);
		operation.reject(error);
	}

	private resolveSceneClearOperation(): void {
		const operation = this.sceneClearOperation;
		if (!operation) return;
		this.sceneClearOperation = null;
		clearTimeout(operation.timeout);
		operation.resolve();
	}

	private rejectSceneClearOperation(error: Error): void {
		const operation = this.sceneClearOperation;
		if (!operation) return;
		this.sceneClearOperation = null;
		clearTimeout(operation.timeout);
		operation.reject(error);
	}

	private disconnectClient(): void {
		if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
		this.handshakeTimeout = null;
		this.clearApplyTimeout();
		this.inFlightSnapshotId = null;
		this.pendingSnapshot = null;
		this.rejectPreviewOperation(new Error("Расширение Owlbear отключено."));
		this.rejectSceneClearOperation(new Error("Расширение Owlbear отключено."));
		const client = this.client;
		this.client = null;
		client?.terminate();
		this.authenticated = false;
		if (this.status.running) this.setStatus({ ...this.status, connected: false });
	}

	private closeClient(code: number, reason: string): void {
		if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
		this.handshakeTimeout = null;
		this.clearApplyTimeout();
		const client = this.client;
		this.client = null;
		this.authenticated = false;
		this.inFlightSnapshotId = null;
		this.pendingSnapshot = null;
		this.rejectPreviewOperation(new Error(reason));
		this.rejectSceneClearOperation(new Error(reason));
		if (this.status.running) this.setStatus({ ...this.status, connected: false });
		client?.close(code, reason);
	}

	private clearApplyTimeout(): void {
		if (this.applyTimeout) clearTimeout(this.applyTimeout);
		this.applyTimeout = null;
	}

	private origin(): string { return `http://localhost:${this.status.port}`; }
	private isAllowedWebSocketOrigin(origin: string | undefined): boolean {
		return isAllowedOwlbearExtensionOrigin(origin, this.origin());
	}
	private assetUrl(assetId: string, mime = "image/png"): string {
		const baseUrl = this.getAssetBaseUrl();
		if (!baseUrl) throw new Error("Публичный туннель изображений Owlbear ещё не готов.");
		return `${baseUrl}/token-images/${assetId}/${encodeURIComponent(mime)}`;
	}
	private rebindSnapshotUrls(snapshot: OwlbearEncounterSnapshot): OwlbearEncounterSnapshot {
		const assetBaseUrl = this.getAssetBaseUrl();
		if (!assetBaseUrl) throw new Error("Публичный туннель изображений Owlbear ещё не готов.");
		return { ...snapshot, assetBaseUrl, participants: snapshot.participants.map((participant) => ({ ...participant, imageUrl: participant.imageAssetId ? this.assetUrl(participant.imageAssetId, participant.imageMime) : participant.imageUrl, imageDataUrl: undefined })) };
	}
	private rebindPreviewUrl(preview: OwlbearPreviewSnapshot): OwlbearPreviewSnapshot {
		if (!preview.imageAssetId) throw new Error("У превью Owlbear отсутствует подготовленный asset.");
		return { ...preview, imageUrl: this.assetUrl(preview.imageAssetId, preview.imageMime), imageDataUrl: undefined };
	}
	private setStatus(status: OwlbearServerStatus): void { this.status = status; this.onStatus(status); }

	private async findAssetDirectory(): Promise<string | null> {
		for (const directory of this.extensionDirectories) {
			try { await Promise.all(Object.values(ASSETS).map((asset) => readFile(join(directory, asset.filename)))); return directory; } catch { /* try next candidate */ }
		}
		return null;
	}

	private async stopPublicAssetServer(): Promise<void> {
		const server = this.publicAssetServer;
		this.publicAssetServer = null;
		this.publicAssetPort = null;
		if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
	}
}

function listen(server: HttpServer, port: number): Promise<void> {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, "127.0.0.1", () => { server.off("error", reject); resolve(); });
	});
}

function parseVisualDimension(value: string | null): number {
	const dimension = Number(value);
	return Number.isInteger(dimension) && dimension >= 1 && dimension <= 512 ? dimension : 512;
}

function parseImageDataUrl(value: string | undefined): { mime: string; bytes: Buffer } | null {
	const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(value ?? "");
	if (!match) return null;
	return { mime: match[1], bytes: Buffer.from(match[2], "base64") };
}

export function createOwlbearAuthToken(): string { return randomBytes(32).toString("base64url"); }
