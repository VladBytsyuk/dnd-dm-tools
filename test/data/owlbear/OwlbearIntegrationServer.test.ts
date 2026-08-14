import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { OwlbearIntegrationServer } from "src/data/owlbear/OwlbearIntegrationServer";
import { createTokenVisualSvg } from "src/data/owlbear/OwlbearImageAssetStore";
import type { OwlbearEncounterSnapshot } from "src/domain/models/owlbear/OwlbearSync";

const temporaryDirectories: string[] = [];

afterEach(async () => {
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
		expect(visual).toContain('width="512" height="256"');
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
