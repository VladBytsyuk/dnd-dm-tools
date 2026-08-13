import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from "http";
import type { Duplex } from "stream";
import { randomBytes, createHash } from "crypto";
import { readFile } from "fs/promises";
import { join } from "path";
import type { OwlbearEncounterSnapshot, OwlbearSyncDiagnostics, OwlbearTokenLink } from "src/domain/models/owlbear/OwlbearSync";

const PROTOCOL_VERSION = 1;
const HANDSHAKE_TIMEOUT_MS = 5_000;
const ASSETS: Record<string, { filename: string; contentType: string }> = {
	"/manifest.json": { filename: "manifest.json", contentType: "application/json; charset=utf-8" },
	"/index.html": { filename: "index.html", contentType: "text/html; charset=utf-8" },
	"/main.js": { filename: "main.js", contentType: "text/javascript; charset=utf-8" },
	"/icon.svg": { filename: "icon.svg", contentType: "image/svg+xml" },
};

type IntegrationMessage = {
	protocolVersion: number;
	messageId: string;
	type: string;
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
	private tokenImages = new Map<string, { mime: string; bytes: Buffer }>();
	private authenticated = false;
	private handshakeTimeout: ReturnType<typeof setTimeout> | null = null;
	private status: OwlbearServerStatus = { running: false, port: null, connected: false };

	constructor(
		private readonly extensionDirectories: string[],
		private readonly getToken: () => string | null,
		private readonly getSnapshot: () => OwlbearEncounterSnapshot | undefined,
		private readonly onApplied: (links: OwlbearTokenLink[], diagnostics: OwlbearSyncDiagnostics) => Promise<void>,
		private readonly onStatus: (status: OwlbearServerStatus) => void,
	) {}

	getStatus(): OwlbearServerStatus { return this.status; }

	async start(port: number): Promise<number> {
		if (this.server) await this.stop();
		this.assetDirectory = await this.findAssetDirectory();
		if (!this.assetDirectory) {
			throw new Error("Файлы Owlbear-расширения не найдены. Установите полный release или укажите путь к dev bundle в настройках.");
		}
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
		if (this.server) {
			const server = this.server;
			this.server = null;
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
		this.setStatus({ running: false, port: null, connected: false });
	}

	publish(snapshot: OwlbearEncounterSnapshot): void {
		if (!this.authenticated || !this.client) throw new Error("Расширение Owlbear не подключено.");
		this.send({ type: "snapshot.publish", snapshot: this.prepareSnapshot(snapshot) });
	}

	private async handleHttp(request: IncomingMessage, response: ServerResponse): Promise<void> {
		response.setHeader("Access-Control-Allow-Origin", "https://www.owlbear.rodeo");
		response.setHeader("Vary", "Origin");
		const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
		const tokenImage = this.tokenImages.get(path);
		if (tokenImage && request.method === "GET") {
			response.writeHead(200, { "Content-Type": tokenImage.mime, "Cache-Control": "no-store" }).end(tokenImage.bytes);
			return;
		}
		const asset = ASSETS[path === "/" ? "/index.html" : path];
		if (!asset || request.method !== "GET") {
			response.writeHead(404).end("Not found");
			return;
		}
		try {
			const content = await readFile(join(this.assetDirectory!, asset.filename));
			response.writeHead(200, { "Content-Type": asset.contentType, "Cache-Control": "no-cache" }).end(content);
		} catch {
			response.writeHead(503).end("Owlbear extension assets are unavailable");
		}
	}

	private handleUpgrade(request: IncomingMessage, socket: Duplex): void {
		if (new URL(request.url ?? "/", "http://127.0.0.1").pathname !== "/ws" || request.headers.origin !== this.origin()) {
			socket.destroy();
			return;
		}
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
				length = Number(largeLength);
				offset = 10;
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
		if (message.protocolVersion !== PROTOCOL_VERSION || typeof message.type !== "string") { this.client?.destroy(); return; }
		if (!this.authenticated) {
			if (message.type !== "client.hello" || message.token !== this.getToken()) { this.client?.destroy(); return; }
			this.authenticated = true;
			if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
			this.setStatus({ ...this.status, connected: true });
			this.send({ type: "server.ready", snapshot: this.getSnapshot() ?? null });
			return;
		}
		if (message.type === "snapshot.request") {
			const snapshot = this.getSnapshot();
			this.send({ type: "snapshot.publish", snapshot: snapshot ? this.prepareSnapshot(snapshot) : null });
		}
		if (message.type === "ping") this.send({ type: "pong" });
		if (message.type === "snapshot.applied" && Array.isArray(message.tokenLinks) && message.diagnostics && typeof message.diagnostics === "object") {
			await this.onApplied(message.tokenLinks as OwlbearTokenLink[], message.diagnostics as OwlbearSyncDiagnostics);
		}
		if (message.type === "snapshot.failed" && typeof message.error === "string") {
			this.setStatus({ ...this.status, error: message.error });
		}
	}

	private send(payload: Record<string, unknown>): void {
		const body = Buffer.from(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, messageId: randomBytes(8).toString("hex"), ...payload }));
		let header: Buffer;
		if (body.length < 126) header = Buffer.from([0x81, body.length]);
		else if (body.length <= 0xffff) header = Buffer.from([0x81, 126, body.length >> 8, body.length & 0xff]);
		else {
			header = Buffer.alloc(10);
			header[0] = 0x81;
			header[1] = 127;
			header.writeBigUInt64BE(BigInt(body.length), 2);
		}
		this.client?.write(Buffer.concat([header, body]));
	}

	private disconnectClient(): void {
		if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
		this.handshakeTimeout = null;
		this.client?.destroy();
		this.client = null;
		this.authenticated = false;
		if (this.status.running) this.setStatus({ ...this.status, connected: false });
	}

	private origin(): string { return `http://localhost:${this.status.port}`; }
	private setStatus(status: OwlbearServerStatus): void { this.status = status; this.onStatus(status); }

	private async findAssetDirectory(): Promise<string | null> {
		for (const directory of this.extensionDirectories) {
			try {
				await Promise.all(Object.values(ASSETS).map((asset) => readFile(join(directory, asset.filename))));
				return directory;
			} catch {
				continue;
			}
		}
		return null;
	}

	private prepareSnapshot(snapshot: OwlbearEncounterSnapshot): OwlbearEncounterSnapshot {
		this.tokenImages.clear();
		return {
			...snapshot,
			participants: snapshot.participants.map((participant) => {
				const image = parseImageDataUrl(participant.imageDataUrl);
				if (!image) {
					throw new Error(`Obsidian не передал изображение для «${participant.name}».`);
				}
				const path = `/token-images/${encodeURIComponent(snapshot.snapshotId)}/${participant.participantId}`;
				this.tokenImages.set(path, image);
				return {
					...participant,
					imageUrl: `http://localhost:${this.status.port}${path}`,
					imageDataUrl: undefined,
					imageMime: image.mime,
				};
			}),
		};
	}
}

export function createOwlbearAuthToken(): string { return randomBytes(32).toString("base64url"); }

function parseImageDataUrl(value: string | undefined): { mime: string; bytes: Buffer } | null {
	const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(value ?? "");
	if (!match) return null;
	return { mime: match[1], bytes: Buffer.from(match[2], "base64") };
}
