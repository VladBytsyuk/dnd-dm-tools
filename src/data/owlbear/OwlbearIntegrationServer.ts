import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from "http";
import type { Duplex } from "stream";
import { randomBytes, createHash } from "crypto";
import { readFile } from "fs/promises";
import { join } from "path";
import { OwlbearImageAssetStore, createFallbackSvg, createTokenVisualSvg, type TokenVisualState } from "./OwlbearImageAssetStore";
import type { OwlbearEncounterSnapshot, OwlbearSyncDiagnostics, OwlbearTokenLink } from "src/domain/models/owlbear/OwlbearSync";

const PROTOCOL_VERSION = 2;
const HANDSHAKE_TIMEOUT_MS = 5_000;
const APPLY_TIMEOUT_MS = 30_000;
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
	"bloodied", "concentration", "condition", "dead",
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
	private assetDirectory: string | null = null;
	private client: Duplex | null = null;
	private clientBuffer = Buffer.alloc(0);
	private authenticated = false;
	private handshakeTimeout: ReturnType<typeof setTimeout> | null = null;
	private applyTimeout: ReturnType<typeof setTimeout> | null = null;
	private inFlightSnapshotId: string | null = null;
	private pendingSnapshot: OwlbearEncounterSnapshot | null = null;
	private status: OwlbearServerStatus = { running: false, port: null, connected: false };
	private readonly imageStore: OwlbearImageAssetStore;

	constructor(
		private readonly extensionDirectories: string[],
		private readonly imageCacheDirectory: string,
		private readonly getToken: () => string | null,
		private readonly getSnapshot: () => OwlbearEncounterSnapshot | undefined,
		private readonly onApplied: (snapshotId: string, links: OwlbearTokenLink[], diagnostics: OwlbearSyncDiagnostics) => Promise<void>,
		private readonly onStatus: (status: OwlbearServerStatus) => void,
	) {
		this.imageStore = new OwlbearImageAssetStore(imageCacheDirectory);
	}

	getStatus(): OwlbearServerStatus { return this.status; }

	async start(port: number): Promise<number> {
		if (this.server) await this.stop();
		this.assetDirectory = await this.findAssetDirectory();
		if (!this.assetDirectory) throw new Error("Файлы Owlbear-расширения не найдены. Укажите корректный dev bundle или установите полный release.");
		await this.imageStore.initialize();
		this.server = createServer((request, response) => void this.handleHttp(request, response));
		this.server.on("upgrade", (request, socket) => this.handleUpgrade(request, socket));
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
			throw error;
		}
		const address = this.server.address();
		if (!address || typeof address === "string") throw new Error("Не удалось определить порт Owlbear.");
		this.setStatus({ running: true, port: address.port, connected: false });
		return address.port;
	}

	async stop(): Promise<void> {
		this.disconnectClient();
		this.clearApplyTimeout();
		this.pendingSnapshot = null;
		this.inFlightSnapshotId = null;
		if (this.server) {
			const server = this.server;
			this.server = null;
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
		this.setStatus({ running: false, port: null, connected: false });
	}

	async materializeSnapshot(snapshot: OwlbearEncounterSnapshot, previousSnapshot?: OwlbearEncounterSnapshot): Promise<OwlbearEncounterSnapshot> {
		const previousParticipants = new Map(previousSnapshot?.participants.map((participant) => [participant.participantId, participant]));
		const protectedIds = snapshot.participants.map((participant) => participant.imageAssetId).filter((value): value is string => Boolean(value));
		const materializedAssetIds: string[] = [];
		const participants: OwlbearEncounterSnapshot["participants"] = [];
		for (const participant of snapshot.participants) {
			const previous = previousParticipants.get(participant.participantId);
			let assetId = participant.imageAssetId;
			let mime = participant.imageMime;
			let width = participant.imageWidth;
			let height = participant.imageHeight;
			let usedFallback = participant.imageFallback === true;
			if (previous?.imageSource && previous.imageSource === participant.imageSource && previous.imageAssetId) {
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
				const parsed = parseImageDataUrl(participant.imageDataUrl);
				if (parsed) {
					assetId = await this.imageStore.put(parsed.mime, parsed.bytes, protectedIds.concat(materializedAssetIds));
					mime = parsed.mime;
				} else {
					const fallback = createFallbackSvg(participant.name, participant.colorHex, participant.side);
					assetId = await this.imageStore.put(fallback.mime, fallback.bytes, protectedIds.concat(materializedAssetIds));
					mime = fallback.mime;
					width = 512;
					height = 512;
					usedFallback = true;
				}
			}
			const materializedParticipant = {
				...participant,
				imageAssetId: assetId,
				imageDataUrl: undefined,
				imageMime: mime ?? "image/png",
				imageWidth: width ?? 512,
				imageHeight: height ?? 512,
				imageFallback: usedFallback,
				imageUrl: this.assetUrl(assetId, mime ?? "image/png"),
			};
			participants.push(materializedParticipant);
			materializedAssetIds.push(assetId);
		}
		await this.imageStore.cleanup(participants.map((participant) => participant.imageAssetId).filter((value): value is string => Boolean(value)));
		return { ...snapshot, participants };
	}

	publishPrepared(snapshot: OwlbearEncounterSnapshot): void {
		if (!this.authenticated || !this.client) throw new Error("Расширение Owlbear не подключено.");
		this.enqueueSnapshot(this.rebindSnapshotUrls(snapshot));
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

	private handleUpgrade(request: IncomingMessage, socket: Duplex): void {
		if (new URL(request.url ?? "/", "http://127.0.0.1").pathname !== "/ws" || request.headers.origin !== this.origin()) { socket.destroy(); return; }
		const key = request.headers["sec-websocket-key"];
		if (typeof key !== "string") { socket.destroy(); return; }
		const accept = createHash("sha1").update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
		socket.write(["HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", `Sec-WebSocket-Accept: ${accept}`, "\r\n"].join("\r\n"));
		this.disconnectClient();
		this.client = socket;
		this.clientBuffer = Buffer.alloc(0);
		this.authenticated = false;
		this.setStatus({ ...this.status, connected: false });
		socket.on("data", (data: Buffer) => this.onSocketData(data));
		socket.on("close", () => { if (this.client === socket) this.disconnectClient(); });
		socket.on("error", () => { if (this.client === socket) this.disconnectClient(); });
		this.handshakeTimeout = setTimeout(() => { if (!this.authenticated) socket.destroy(); }, HANDSHAKE_TIMEOUT_MS);
	}

	private onSocketData(data: Buffer): void {
		this.clientBuffer = Buffer.concat([this.clientBuffer, data]);
		while (this.clientBuffer.length >= 2) {
			const first = this.clientBuffer[0];
			const second = this.clientBuffer[1];
			let length = second & 0x7f;
			let offset = 2;
			if (length === 126) { if (this.clientBuffer.length < 4) return; length = this.clientBuffer.readUInt16BE(2); offset = 4; }
			if (length === 127) {
				if (this.clientBuffer.length < 10) return;
				const largeLength = this.clientBuffer.readBigUInt64BE(2);
				if (largeLength > BigInt(1_000_000)) { this.client?.destroy(); return; }
				length = Number(largeLength); offset = 10;
			}
			if ((second & 0x80) === 0 || length > 1_000_000 || this.clientBuffer.length < offset + 4 + length) { this.client?.destroy(); return; }
			const mask = this.clientBuffer.subarray(offset, offset + 4);
			const payload = this.clientBuffer.subarray(offset + 4, offset + 4 + length);
			this.clientBuffer = this.clientBuffer.subarray(offset + 4 + length);
			if ((first & 0x0f) === 0x8) { this.client?.end(); return; }
			if ((first & 0x0f) !== 0x1) continue;
			for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
			try { void this.handleMessage(JSON.parse(payload.toString("utf8")) as IntegrationMessage); } catch { this.client?.destroy(); }
		}
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
				this.enqueueSnapshot(prepared);
			} catch (error) {
				this.setStatus({ ...this.status, error: error instanceof Error ? error.message : String(error) });
			}
			return;
		}
		if (message.type === "ping") { this.send({ type: "pong" }); return; }
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
		if (!this.client || !this.authenticated) return;
		const body = Buffer.from(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, messageId: randomBytes(8).toString("hex"), ...payload }));
		let header: Buffer;
		if (body.length < 126) header = Buffer.from([0x81, body.length]);
		else if (body.length <= 0xffff) header = Buffer.from([0x81, 126, body.length >> 8, body.length & 0xff]);
		else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 127; header.writeBigUInt64BE(BigInt(body.length), 2); }
		this.client.write(Buffer.concat([header, body]));
	}

	private disconnectClient(): void {
		if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
		this.handshakeTimeout = null;
		this.clearApplyTimeout();
		this.inFlightSnapshotId = null;
		this.pendingSnapshot = null;
		this.client?.destroy();
		this.client = null;
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
		if (this.status.running) this.setStatus({ ...this.status, connected: false });
		client?.end(createWebSocketCloseFrame(code, reason));
	}

	private clearApplyTimeout(): void {
		if (this.applyTimeout) clearTimeout(this.applyTimeout);
		this.applyTimeout = null;
	}

	private origin(): string { return `http://localhost:${this.status.port}`; }
	private assetUrl(assetId: string, mime = "image/png"): string { return `http://localhost:${this.status.port}/token-images/${assetId}/${encodeURIComponent(mime)}`; }
	private rebindSnapshotUrls(snapshot: OwlbearEncounterSnapshot): OwlbearEncounterSnapshot {
		return { ...snapshot, participants: snapshot.participants.map((participant) => ({ ...participant, imageUrl: participant.imageAssetId ? this.assetUrl(participant.imageAssetId, participant.imageMime) : participant.imageUrl, imageDataUrl: undefined })) };
	}
	private setStatus(status: OwlbearServerStatus): void { this.status = status; this.onStatus(status); }

	private async findAssetDirectory(): Promise<string | null> {
		for (const directory of this.extensionDirectories) {
			try { await Promise.all(Object.values(ASSETS).map((asset) => readFile(join(directory, asset.filename)))); return directory; } catch { /* try next candidate */ }
		}
		return null;
	}
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

function createWebSocketCloseFrame(code: number, reason: string): Buffer {
	const reasonBytes = Buffer.from(reason, "utf8").subarray(0, 123);
	const payload = Buffer.alloc(2 + reasonBytes.length);
	payload.writeUInt16BE(code, 0);
	reasonBytes.copy(payload, 2);
	return Buffer.concat([Buffer.from([0x88, payload.length]), payload]);
}

export function createOwlbearAuthToken(): string { return randomBytes(32).toString("base64url"); }
