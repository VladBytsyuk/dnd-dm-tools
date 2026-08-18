import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, type RawData } from "ws";
import { OwlbearIntegrationServer } from "src/data/owlbear/OwlbearIntegrationServer";
import { createTokenVisualSvg } from "src/data/owlbear/OwlbearImageAssetStore";
import type { OwlbearEncounterSnapshot } from "src/domain/models/owlbear/OwlbearSync";
import type { OwlbearPreviewSnapshot } from "src/domain/models/owlbear/OwlbearPreview";

const temporaryDirectories: string[] = [];
const runningServers: OwlbearIntegrationServer[] = [];
const openClients: WebSocket[] = [];

afterEach(async () => {
	for (const client of openClients.splice(0)) client.terminate();
	await Promise.all(runningServers.splice(0).map((server) => server.stop()));
	await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function snapshot(overrides: Partial<OwlbearEncounterSnapshot> = {}): OwlbearEncounterSnapshot {
	return {
		schemaVersion: 1,
		snapshotId: "snapshot-1",
		encounterId: "encounter-1",
		encounterName: "Test",
		round: 1,
		activeParticipantId: null,
		nextParticipantId: null,
		createdAt: "2026-08-14T00:00:00.000Z",
		participants: [{
			participantId: 1,
			name: "Лесной Разбойник",
			initiative: 10,
			hpCurrent: 10,
			hpMax: 10,
			hpTemporary: 0,
			armorClass: 12,
			side: "enemy",
			colorHex: "#123456",
			isDead: false,
			conditions: [],
		}],
		tokenLinks: [],
		...overrides,
	};
}

async function createServer(): Promise<{ server: OwlbearIntegrationServer; cacheDirectory: string }> {
	const cacheDirectory = await mkdtemp(join(tmpdir(), "dnd-dm-tools-owlbear-cache-"));
	temporaryDirectories.push(cacheDirectory);
	return {
		cacheDirectory,
		server: new OwlbearIntegrationServer([], cacheDirectory, () => "token", () => undefined, () => undefined, async () => {}, () => {}),
	};
}

describe("Owlbear integration server snapshots", () => {
	it("wraps token assets in a native-label-safe visual SVG", () => {
		const visual = createTokenVisualSvg("image/png", Buffer.from("PNG"), "dead", 512, 256).toString("utf8");

		expect(visual).toContain('href="data:image/png;base64,UE5H"');
		expect(visual).toContain('<g opacity="0.5">');
		expect(visual).toContain('fill="#000000" fill-opacity="0.8"');
		expect(visual).toContain('mask="url(#alpha)"');
		expect(visual.indexOf('fill="#000000" fill-opacity="0.8"')).toBeLessThan(visual.indexOf('transform="translate(192 64)'));
		expect(visual).toContain('stroke="#f8fafc"');
		expect(visual).toContain('d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25');
		expect(visual).toContain('width="512" height="256"');
	});

	it("adds a centered bold zero after darkening for a down token", () => {
		const visual = createTokenVisualSvg("image/png", Buffer.from("PNG"), "down", 512, 256).toString("utf8");

		expect(visual).toContain('<g opacity="0.75">');
		expect(visual).toContain('fill="#000000" fill-opacity="0.5"');
		expect(visual).toContain('x="256" y="128"');
		expect(visual).toContain('font-size="128" font-weight="700"');
		expect(visual.indexOf('fill="#000000" fill-opacity="0.5"')).toBeLessThan(visual.indexOf('<text x="256" y="128"'));
	});

	it("materializes missing images as cached initials tokens without Base64", async () => {
		const { server, cacheDirectory } = await createServer();
		const prepared = await server.materializeSnapshot(snapshot());
		const participant = prepared.participants[0];

		expect(participant.imageAssetId).toMatch(/^[a-f0-9]{64}$/);
		expect(participant.imageFallback).toBe(true);
		expect(participant.imageDataUrl).toBeUndefined();
		expect(participant.imageUrl).toBeUndefined();
		expect((await readFile(join(cacheDirectory, participant.imageAssetId!))).toString("utf8")).toContain("ЛР");
	});

	it("reuses a previous asset when only combat state changes", async () => {
		const { server } = await createServer();
		const first = await server.materializeSnapshot(snapshot());
		const second = await server.materializeSnapshot(snapshot({ snapshotId: "snapshot-2", participants: [{ ...first.participants[0], hpCurrent: 4 }] }), first);

		expect(second.participants[0].imageAssetId).toBe(first.participants[0].imageAssetId);
	});

	it("replaces a cached fallback when the original image becomes available", async () => {
		const { server } = await createServer();
		const initialParticipant = { ...snapshot().participants[0], imageSource: "tokens/bandit.png" };
		const first = await server.materializeSnapshot(snapshot({ participants: [initialParticipant] }));
		const recoveredParticipant = {
			...initialParticipant,
			imageDataUrl: "data:image/png;base64,T1JJR0lOQUw=",
			imageWidth: 64,
			imageHeight: 64,
			imageFallback: false,
		};

		const second = await server.materializeSnapshot(snapshot({ snapshotId: "snapshot-2", participants: [recoveredParticipant] }), first);

		expect(second.participants[0].imageFallback).toBe(false);
		expect(second.participants[0].imageAssetId).not.toBe(first.participants[0].imageAssetId);
		expect(second.participants[0].imageUrl).toBeUndefined();
	});

	it("migrates a legacy Base64 image into the cache", async () => {
		const { server } = await createServer();
		const legacy = snapshot({
			participants: [{ ...snapshot().participants[0], imageUrl: "https://example.com/legacy.png", imageDataUrl: "data:image/png;base64,TEVHQUNZ" }],
		});

		const migrated = await server.materializeSnapshot(legacy);

		expect(migrated.participants[0].imageAssetId).toMatch(/^[a-f0-9]{64}$/);
		expect(migrated.participants[0].imageDataUrl).toBeUndefined();
		expect(migrated.participants[0].imageFallback).toBe(false);
	});
});

describe("Owlbear integration server transport", () => {
	it("requests managed scene cleanup and waits for acknowledgement", async () => {
		const { server, port } = await createRunningServer();
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" }));
		await ready;

		const command = waitForMessage(client, "scene.clear");
		const clearing = server.clearManagedScene();
		const message = await command;
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "scene-applied", type: "scene.applied", clearId: message.clearId }));
		await expect(clearing).resolves.toBeUndefined();
	});

	it("materializes and publishes a preview, then waits for its acknowledgement", async () => {
		const { server, port } = await createRunningServer();
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" }));
		await ready;
		const preview: OwlbearPreviewSnapshot = {
			schemaVersion: 1,
			previewId: "preview-1",
			name: "Handout",
			createdAt: "2026-08-17T00:00:00.000Z",
			imageMime: "image/png",
			imageWidth: 32,
			imageHeight: 16,
			imageDataUrl: "data:image/png;base64,UE5H",
		};
		const published = waitForMessage(client, "preview.publish");
		const publishing = server.publishPreview(preview);
		const message = await published;
		expect(message.preview.imageUrl).toMatch(/\/token-images\/[a-f0-9]{64}\/image%2Fpng$/);
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "preview-applied", type: "preview.applied", previewId: "preview-1" }));
		await expect(publishing).resolves.toMatchObject({ imageAssetId: expect.any(String), imageDataUrl: undefined });
	});

	it("accepts a fragmented authenticated message and returns server.ready", async () => {
		const { server, port } = await createRunningServer();
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		const hello = JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" });
		const middle = Math.floor(hello.length / 2);

		client.send(hello.slice(0, middle), { fin: false });
		client.send(hello.slice(middle), { fin: true });

		expect(await ready).toMatchObject({ protocolVersion: 2, type: "server.ready" });
		expect(server.getStatus().connected).toBe(true);
	});

	it("rejects an invalid pairing token with the authentication close code", async () => {
		const { port } = await createRunningServer();
		const client = await connectClient(port);
		const closed = new Promise<number>((resolve) => client.once("close", resolve));

		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "wrong" }));

		expect(await closed).toBe(4001);
	});

	it("keeps only the latest pending snapshot until the in-flight snapshot is acknowledged", async () => {
		const applied: string[] = [];
		const { server, port } = await createRunningServer(async (snapshotId) => { applied.push(snapshotId); });
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" }));
		await ready;

		const firstPublish = waitForMessage(client, "snapshot.publish");
		server.publishPrepared(snapshot({ snapshotId: "snapshot-1" }));
		expect((await firstPublish).snapshotId).toBe("snapshot-1");
		server.publishPrepared(snapshot({ snapshotId: "snapshot-2" }));
		server.publishPrepared(snapshot({ snapshotId: "snapshot-3" }));
		const latestPublish = waitForMessage(client, "snapshot.publish");
		client.send(JSON.stringify({
			protocolVersion: 2,
			messageId: "applied-1",
			type: "snapshot.applied",
			snapshotId: "snapshot-1",
			tokenLinks: [],
			diagnostics: diagnostics(),
		}));

		expect((await latestPublish).snapshotId).toBe("snapshot-3");
		expect(applied).toEqual(["snapshot-1"]);
	});

	it("rebinds a prepared cached image to the current Quick Tunnel URL", async () => {
		const { server, port } = await createRunningServer();
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" }));
		await ready;
		const published = waitForMessage(client, "snapshot.publish");
		server.publishPrepared(snapshot({
			participants: [{
				...snapshot().participants[0],
				imageAssetId: "a".repeat(64),
				imageUrl: "http://localhost:1/token-images/stale/image%2Fwebp",
				imageMime: "image/webp",
				imageWidth: 128,
				imageHeight: 128,
			}],
		}));

		const message = await published;
		expect(message.snapshot.assetBaseUrl).toMatch(/^https:\/\/test\.trycloudflare\.com\/assets\//);
		expect(message.snapshot.participants[0].imageUrl).toBe(`${message.snapshot.assetBaseUrl}/token-images/${"a".repeat(64)}/image%2Fwebp`);
		expect(message.snapshot.participants[0].imageUrl).not.toContain("localhost");
	});

	it("fails closed while the public tunnel is unavailable", async () => {
		const { server, port } = await createRunningServer();
		const client = await connectClient(port);
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-1", type: "client.hello", token: "token" }));
		await ready;
		server.clearPublicAssetOrigin();

		expect(() => server.publishPrepared(snapshot())).toThrow("Публичный туннель");
	});

	it("exposes only secret-scoped shared assets through the public server", async () => {
		const { server } = await createRunningServer();
		const prepared = await server.materializeSnapshot(snapshot());
		const port = server.getPublicAssetPort()!;
		const base = `http://127.0.0.1:${port}${server.getPublicAssetPath()}`;
		const tokenPath = `/token-images/${prepared.participants[0].imageAssetId}/${encodeURIComponent(prepared.participants[0].imageMime!)}`;

		const [health, token, visual, icon, manifest, main, websocket, wrongSecret] = await Promise.all([
			fetch(`${base}/health`),
			fetch(`${base}${tokenPath}`),
			fetch(`${base}${tokenPath}?visual=dead&width=256&height=256`),
			fetch(`${base}/status-icons/dead.svg`),
			fetch(`${base}/manifest.json`),
			fetch(`${base}/main.js`),
			fetch(`${base}/ws`),
			fetch(`http://127.0.0.1:${port}/assets/wrong/health`),
		]);

		expect(health.status).toBe(200);
		expect(token.status).toBe(200);
		expect(token.headers.get("access-control-allow-origin")).toBe("https://www.owlbear.rodeo");
		expect(token.headers.get("cache-control")).toContain("immutable");
		expect(visual.headers.get("content-type")).toContain("image/svg+xml");
		expect(icon.status).toBe(200);
		expect([manifest.status, main.status, websocket.status, wrongSecret.status]).toEqual([404, 404, 404, 404]);
	});

	it("accepts the stable GitHub Pages extension as the WebSocket origin", async () => {
		const { port } = await createRunningServer();
		const client = new WebSocket(`ws://127.0.0.1:${port}/ws`, { origin: "https://vladbytsyuk.github.io" });
		openClients.push(client);
		await new Promise<void>((resolve, reject) => {
			client.once("open", resolve);
			client.once("error", reject);
		});
		const ready = waitForMessage(client, "server.ready");
		client.send(JSON.stringify({ protocolVersion: 2, messageId: "hello-public", type: "client.hello", token: "token" }));
		expect(await ready).toMatchObject({ type: "server.ready" });
	});
});

function diagnostics() {
	return {
		sceneReady: true,
		snapshotLoaded: true,
		linkedCount: 0,
		participantCount: 0,
		staleTokenIds: [],
		missingParticipantIds: [],
		fallbackParticipantIds: [],
	};
}

async function createRunningServer(
	onApplied: (snapshotId: string) => Promise<void> = async () => {},
): Promise<{ server: OwlbearIntegrationServer; port: number }> {
	const root = await mkdtemp(join(tmpdir(), "dnd-dm-tools-owlbear-server-"));
	temporaryDirectories.push(root);
	const assets = join(root, "assets");
	const cache = join(root, "cache");
	await createExtensionAssets(assets);
	const server = new OwlbearIntegrationServer([assets], cache, () => "token", () => undefined, () => undefined, onApplied, () => {});
	runningServers.push(server);
	const port = await server.start(0);
	server.setPublicAssetOrigin("https://test.trycloudflare.com");
	return { server, port };
}

async function createExtensionAssets(directory: string): Promise<void> {
	await mkdir(join(directory, "status-icons"), { recursive: true });
	for (const name of ["manifest.json", "index.html", "background.html", "main.js", "background.js", "icon.svg", "icon-v2.svg"]) {
		await writeFile(join(directory, name), name === "manifest.json" ? JSON.stringify({
				icon: "./icon-v2.svg",
				background_url: "./background.html",
				action: { icon: "./icon-v2.svg", popover: "./index.html" },
		}) : name);
	}
	for (const name of [
		"bloodied", "concentration", "condition", "dead", "down", "unconscious", "frightened", "exhaustion", "invisible", "incapacitated",
		"deafened", "petrified", "restrained", "blinded", "poisoned", "charmed", "stunned", "paralyzed", "prone", "grappled",
	]) await writeFile(join(directory, "status-icons", `${name}.svg`), "<svg/>");
}

async function connectClient(port: number): Promise<WebSocket> {
	const client = new WebSocket(`ws://127.0.0.1:${port}/ws`, { origin: `http://localhost:${port}` });
	openClients.push(client);
	await new Promise<void>((resolve, reject) => {
		client.once("open", resolve);
		client.once("error", reject);
	});
	return client;
}

function waitForMessage(client: WebSocket, type: string): Promise<Record<string, any>> {
	return new Promise((resolve, reject) => {
		const onMessage = (data: RawData) => {
			const message = JSON.parse(data.toString()) as Record<string, any>;
			if (message.type !== type) return;
			cleanup();
			resolve(message);
		};
		const onError = (error: Error) => { cleanup(); reject(error); };
		const cleanup = () => {
			client.off("message", onMessage);
			client.off("error", onError);
		};
		client.on("message", onMessage);
		client.on("error", onError);
	});
}
