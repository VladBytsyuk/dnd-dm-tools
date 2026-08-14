import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, type RawData } from "ws";
import { OwlbearIntegrationServer } from "src/data/owlbear/OwlbearIntegrationServer";
import { createTokenVisualSvg } from "src/data/owlbear/OwlbearImageAssetStore";
import type { OwlbearEncounterSnapshot } from "src/domain/models/owlbear/OwlbearSync";

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
		server: new OwlbearIntegrationServer([], cacheDirectory, () => "token", () => undefined, async () => {}, () => {}),
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
		expect(participant.imageUrl).toContain(`/token-images/${participant.imageAssetId}/image%2Fsvg%2Bxml`);
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
		expect(second.participants[0].imageUrl).toContain(`/token-images/${second.participants[0].imageAssetId}/image%2Fpng`);
		expect(second.participants[0].imageUrl).not.toBe(first.participants[0].imageUrl);
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

	it("rebinds a prepared cached image to the current localhost port", async () => {
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
		expect(message.snapshot.participants[0].imageUrl).toBe(`http://localhost:${port}/token-images/${"a".repeat(64)}/image%2Fwebp`);
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
	const server = new OwlbearIntegrationServer([assets], cache, () => "token", () => undefined, onApplied, () => {});
	runningServers.push(server);
	return { server, port: await server.start(0) };
}

async function createExtensionAssets(directory: string): Promise<void> {
	await mkdir(join(directory, "status-icons"), { recursive: true });
	for (const name of ["manifest.json", "index.html", "background.html", "main.js", "background.js", "icon.svg", "icon-v2.svg"]) {
		await writeFile(join(directory, name), name === "manifest.json" ? "{}" : name);
	}
	for (const name of [
		"bloodied", "concentration", "condition", "dead", "unconscious", "frightened", "exhaustion", "invisible", "incapacitated",
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
