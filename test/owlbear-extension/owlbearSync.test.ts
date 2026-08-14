import { afterEach, describe, expect, it, vi } from "vitest";

const sdkMock = vi.hoisted(() => {
	let itemId = 0;
	const createBuilder = (type: string, initial: Record<string, unknown> = {}) => {
		const item: any = {
			id: `item-${itemId += 1}`,
			type,
			name: type,
			position: { x: 0, y: 0 },
			metadata: {},
			...initial,
		};
		const builder: any = { build: () => item };
		for (const property of [
			"name", "position", "layer", "zIndex", "disableAutoZIndex", "metadata", "attachedTo", "locked", "disableHit",
			"shapeType", "width", "height", "style", "padding", "fontSize", "fontWeight", "fillColor", "textAlign",
			"textAlignVertical",
		]) {
			builder[property] = (value: unknown) => {
				item[property] = value;
				return builder;
			};
		}
		builder.plainText = (value: string) => {
			item.text.plainText = value;
			return builder;
		};
		builder.textType = (value: string) => {
			item.text.type = value;
			return builder;
		};
		builder.textItemType = (value: string) => {
			item.textItemType = value;
			return builder;
		};
		return builder;
	};
	const obr = {
		scene: {
			isReady: vi.fn(),
			grid: { getDpi: vi.fn() },
			items: {
				getItems: vi.fn(),
				addItems: vi.fn(),
				deleteItems: vi.fn(),
				updateItems: vi.fn(),
			},
		},
		viewport: { getPosition: vi.fn() },
	};
	return {
		obr,
		buildImage: (image: unknown, grid: unknown) => createBuilder("IMAGE", {
			image,
			grid,
			text: { plainText: "", type: "PLAIN", style: {} },
			textItemType: "LABEL",
		}),
		buildShape: () => createBuilder("SHAPE"),
		buildText: () => createBuilder("TEXT", { text: { plainText: "", type: "PLAIN", style: {} } }),
	};
});

vi.mock("@owlbear-rodeo/sdk", () => ({
	default: sdkMock.obr,
	buildImage: sdkMock.buildImage,
	buildShape: sdkMock.buildShape,
	buildText: sdkMock.buildText,
}));

import { findStaleTokenIds, getConditionBadgePosition, getConditionBadgeTextPosition, pushSnapshotToScene } from "../../owlbear-extension/src/owlbearSync";
import {
	OWLBEAR_DEAD_OVERLAY_KEY,
	OWLBEAR_ENCOUNTER_ID_KEY,
	OWLBEAR_MARKER_KIND_KEY,
	OWLBEAR_PARTICIPANT_ID_KEY,
	OWLBEAR_TOKEN_RING_KEY,
	OWLBEAR_TURN_HIGHLIGHT_KEY,
	OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY,
} from "../../owlbear-extension/src/types";
import type { OwlbearEncounterSnapshot } from "../../owlbear-extension/src/types";

function snapshot(participantIds: number[], encounterId = "encounter-1"): OwlbearEncounterSnapshot {
	return {
		schemaVersion: 1,
		snapshotId: "snapshot-1",
		encounterId,
		encounterName: "Test",
		round: 1,
		activeParticipantId: null,
		nextParticipantId: null,
		createdAt: "2026-08-13T00:00:00.000Z",
		assetBaseUrl: "https://public-assets.trycloudflare.com/assets/session-secret",
		participants: participantIds.map((participantId) => ({
			participantId,
			name: `Participant ${participantId}`,
			imageUrl: "https://example.com/token.png",
			imageMime: "image/png",
			imageWidth: 100,
			imageHeight: 100,
			initiative: 10,
			hpCurrent: 10,
			hpMax: 10,
			hpTemporary: 0,
			armorClass: 10,
			side: "enemy",
			isDead: false,
			conditions: [],
		})),
		tokenLinks: [],
	};
}

function mockScene(initialItems: any[] = []) {
	const items = structuredClone(initialItems);
	const OBR = sdkMock.obr;
	OBR.scene.isReady.mockReset().mockResolvedValue(true);
	OBR.viewport.getPosition.mockReset().mockResolvedValue({ x: 0, y: 0 });
	OBR.scene.grid.getDpi.mockReset().mockResolvedValue(100);
	OBR.scene.items.getItems.mockReset().mockImplementation((filter?: any) => {
		if (typeof filter === "function") return Promise.resolve(items.filter(filter)) as any;
		if (Array.isArray(filter)) return Promise.resolve(items.filter((item: any) => filter.includes(item.id))) as any;
		return Promise.resolve(items) as any;
	});
	OBR.scene.items.addItems.mockReset().mockImplementation((addedItems: any[]) => {
		items.push(...addedItems);
		return Promise.resolve() as any;
	});
	OBR.scene.items.deleteItems.mockReset().mockImplementation((ids: string[]) => {
		for (let index = items.length - 1; index >= 0; index -= 1) {
			if (ids.includes(items[index].id)) items.splice(index, 1);
		}
		return Promise.resolve() as any;
	});
	OBR.scene.items.updateItems.mockReset().mockImplementation((filterOrItems: any, update: (drafts: any[]) => void) => {
		const drafts = typeof filterOrItems === "function"
			? items.filter(filterOrItems)
			: items.filter((item: any) => filterOrItems.some((candidate: any) => candidate.id === item.id));
		update(drafts);
		return Promise.resolve() as any;
	});
	return items;
}

function turnHighlights(items: any[], encounterId = "encounter-1") {
	return items.filter((item) =>
		item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId
		&& item.metadata?.[OWLBEAR_TURN_HIGHLIGHT_KEY] === true
	);
}

afterEach(() => {
	vi.clearAllMocks();
});

describe("Owlbear scene synchronization", () => {
	it("creates and updates active and next participant highlights", async () => {
		const items = mockScene();
		const initial = snapshot([1, 2, 3]);
		initial.activeParticipantId = 1;
		initial.nextParticipantId = 2;

		const firstSync = await pushSnapshotToScene(initial);

		expect(turnHighlights(items).map((item) => [
			item.metadata[OWLBEAR_PARTICIPANT_ID_KEY],
			item.metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY],
		])).toEqual([[1, "active"], [2, "next"]]);

		const next = snapshot([1, 2, 3]);
		next.activeParticipantId = 2;
		next.nextParticipantId = 3;
		next.tokenLinks = firstSync.tokenLinks;
		await pushSnapshotToScene(next, initial);

		expect(turnHighlights(items).map((item) => [
			item.metadata[OWLBEAR_PARTICIPANT_ID_KEY],
			item.metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY],
		])).toEqual([[2, "active"], [3, "next"]]);
	});

	it("removes a stale highlight even when consecutive snapshots agree that it is not expected", async () => {
		const items = mockScene();
		const current = snapshot([1]);
		const firstSync = await pushSnapshotToScene(current);
		const token = items.find((item) => item.type === "IMAGE" && item.attachedTo == null);
		items.push({
			id: "stale-highlight",
			type: "SHAPE",
			attachedTo: token.id,
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: current.encounterId,
				[OWLBEAR_PARTICIPANT_ID_KEY]: 1,
				[OWLBEAR_TURN_HIGHLIGHT_KEY]: true,
				[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY]: "active",
			},
		});
		current.tokenLinks = firstSync.tokenLinks;

		await pushSnapshotToScene(current, current);

		expect(turnHighlights(items)).toEqual([]);
	});

	it("recreates a missing highlight even when consecutive snapshots are identical", async () => {
		const items = mockScene();
		const current = snapshot([1]);
		current.activeParticipantId = 1;
		const firstSync = await pushSnapshotToScene(current);
		const existingHighlightIndex = items.findIndex((item) => item.metadata?.[OWLBEAR_TURN_HIGHLIGHT_KEY] === true);
		items.splice(existingHighlightIndex, 1);
		current.tokenLinks = firstSync.tokenLinks;

		await pushSnapshotToScene(current, current);

		expect(turnHighlights(items)).toHaveLength(1);
		expect(turnHighlights(items)[0].metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY]).toBe("active");
	});

	it("repairs legacy roles and removes duplicate and orphaned highlights in one reconciliation", async () => {
		const items = mockScene();
		const current = snapshot([1, 2]);
		current.activeParticipantId = 1;
		current.nextParticipantId = 2;
		const firstSync = await pushSnapshotToScene(current);
		const activeHighlight = turnHighlights(items).find((item) => item.metadata[OWLBEAR_PARTICIPANT_ID_KEY] === 1);
		activeHighlight.metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY] = "next";
		const legacyDuplicate = { ...structuredClone(activeHighlight), id: "duplicate-highlight" };
		delete legacyDuplicate.metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY];
		items.push(legacyDuplicate);
		items.push({
			id: "orphan-highlight",
			type: "SHAPE",
			attachedTo: "missing-token",
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: current.encounterId,
				[OWLBEAR_PARTICIPANT_ID_KEY]: 999,
				[OWLBEAR_TURN_HIGHLIGHT_KEY]: true,
				[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY]: "active",
			},
		});
		items.push({
			id: "other-encounter-highlight",
			type: "SHAPE",
			attachedTo: "other-token",
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-2",
				[OWLBEAR_TURN_HIGHLIGHT_KEY]: true,
			},
		});
		current.tokenLinks = firstSync.tokenLinks;

		await pushSnapshotToScene(current, current);

		expect(turnHighlights(items).map((item) => [
			item.metadata[OWLBEAR_PARTICIPANT_ID_KEY],
			item.metadata[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY],
		])).toEqual([[2, "next"], [1, "active"]]);
		expect(items.some((item) => item.id === "orphan-highlight")).toBe(false);
		expect(items.some((item) => item.id === "other-encounter-highlight")).toBe(true);
	});

	it("finds only stale token images in the current encounter", () => {
		const current = snapshot([1]);
		const items = [
			{ id: "current", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 1 } },
			{ id: "removed", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
			{ id: "marker", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 2, [OWLBEAR_MARKER_KIND_KEY]: "condition" } },
			{ id: "other-encounter", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-2", [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
			{ id: "manual", type: "IMAGE", metadata: { [OWLBEAR_PARTICIPANT_ID_KEY]: 2 } },
		];

		expect(findStaleTokenIds(items, current)).toEqual(["removed"]);
	});

	it("removes managed tokens when a new plugin session starts with an empty tracker", async () => {
		const previous = snapshot([1]);
		const empty = snapshot([]);
		const items = mockScene([
			{ id: "old-token", type: "IMAGE", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_PARTICIPANT_ID_KEY]: 1 } },
			{ id: "old-marker", type: "IMAGE", attachedTo: "old-token", metadata: { [OWLBEAR_ENCOUNTER_ID_KEY]: "encounter-1", [OWLBEAR_MARKER_KIND_KEY]: "condition" } },
		]);

		const result = await pushSnapshotToScene(empty, previous);

		expect(items).toEqual([]);
		expect(result.tokenLinks).toEqual([]);
		expect(result.diagnostics.participantCount).toBe(0);
	});

	it("places condition duration badges to the right and below the icon", () => {
		expect(getConditionBadgePosition({ x: 100, y: 200 }, 50)).toEqual({ x: 118, y: 218 });
		expect(getConditionBadgeTextPosition({ x: 118, y: 218 }, 20)).toEqual({ x: 108, y: 208 });
	});

	it("uses the native image label, updates it, and removes legacy labels without duplicating tokens", async () => {
		const items = mockScene();
		const initial = snapshot([1]);
		const firstSync = await pushSnapshotToScene(initial);
		const token = items.find((item) => item.type === "IMAGE" && item.attachedTo == null);
		const ring = items.find((item) => item.metadata?.[OWLBEAR_TOKEN_RING_KEY] === true);

		expect(token).toMatchObject({
			name: "Participant 1",
			text: { plainText: "Participant 1", type: "PLAIN" },
			textItemType: "LABEL",
		});
		expect(ring).toMatchObject({ layer: "CHARACTER", zIndex: 99 });
		expect(ring.zIndex).toBeLessThan(token.zIndex);
		expect(items.filter((item) => item.type === "IMAGE" && item.attachedTo == null)).toHaveLength(1);

		items.push({
			id: "legacy-label",
			type: "TEXT",
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: initial.encounterId,
				[OWLBEAR_PARTICIPANT_ID_KEY]: 1,
				"club.ttg.dnd-dm-tools/tokenLabel": true,
			},
		});
		const renamed = snapshot([1]);
		renamed.participants[0].name = "Renamed participant";
		renamed.tokenLinks = firstSync.tokenLinks;

		await pushSnapshotToScene(renamed, initial);

		expect(token).toMatchObject({
			name: "Renamed participant",
			text: { plainText: "Renamed participant", type: "PLAIN" },
			textItemType: "LABEL",
		});
		expect(items.some((item) => item.id === "legacy-label")).toBe(false);
		expect(items.filter((item) => item.type === "IMAGE" && item.attachedTo == null)).toHaveLength(1);

		await pushSnapshotToScene(renamed, renamed);

		expect(items.filter((item) => item.type === "IMAGE" && item.attachedTo == null)).toHaveLength(1);
	});

	it("removes legacy down and dead status markers from existing tokens", async () => {
		const items = mockScene();
		const initial = snapshot([1]);
		initial.participants[0].hpCurrent = 0;
		const firstSync = await pushSnapshotToScene(initial);
		const token = items.find((item) => item.type === "IMAGE" && item.attachedTo == null);

		items.push({
			id: "legacy-down",
			type: "IMAGE",
			attachedTo: token.id,
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: initial.encounterId,
				[OWLBEAR_PARTICIPANT_ID_KEY]: 1,
				[OWLBEAR_MARKER_KIND_KEY]: "down",
			},
		});
		items.push({
			id: "legacy-dead",
			type: "SHAPE",
			attachedTo: token.id,
			metadata: {
				[OWLBEAR_ENCOUNTER_ID_KEY]: initial.encounterId,
				[OWLBEAR_PARTICIPANT_ID_KEY]: 1,
				[OWLBEAR_DEAD_OVERLAY_KEY]: true,
			},
		});
		initial.tokenLinks = firstSync.tokenLinks;

		await pushSnapshotToScene(initial, initial);

		expect(items.some((item) => item.id === "legacy-down")).toBe(false);
		expect(items.some((item) => item.id === "legacy-dead")).toBe(false);
	});

	it("updates one token in place through normal, down, dead, down, and normal visuals", async () => {
		const items = mockScene();
		let previous = snapshot([1]);
		const firstSync = await pushSnapshotToScene(previous);
		const token = items.find((item) => item.type === "IMAGE" && item.attachedTo == null);
		const tokenId = token.id;
		const tokenPosition = token.position;
		expect(token.image.url).toBe("https://example.com/token.png");

		for (const state of [
			{ hpCurrent: 0, isDead: false, visual: "down" },
			{ hpCurrent: 0, isDead: true, visual: "dead" },
			{ hpCurrent: 0, isDead: false, visual: "down" },
			{ hpCurrent: 10, isDead: false, visual: null },
		]) {
			const next = snapshot([1]);
			next.participants[0].hpCurrent = state.hpCurrent;
			next.participants[0].isDead = state.isDead;
			next.tokenLinks = firstSync.tokenLinks;

			await pushSnapshotToScene(next, previous);

			expect(token.id).toBe(tokenId);
			expect(token.position).toEqual(tokenPosition);
			const tokenUrl = new URL(token.image.url);
			expect(tokenUrl.searchParams.get("visual")).toBe(state.visual);
			expect(tokenUrl.searchParams.get("visualVersion")).toBe(state.visual ? "3" : null);
			expect(items.some((item) => item.metadata?.["club.ttg.dnd-dm-tools/deadOverlay"] === true)).toBe(false);
			expect(items.filter((item) => item.type === "IMAGE" && item.attachedTo == null)).toHaveLength(1);
			previous = next;
		}
	});

	it("uses a constant number of scene reads for an unchanged encounter", async () => {
		mockScene();
		const current = snapshot([1, 2, 3, 4]);
		const firstSync = await pushSnapshotToScene(current);
		current.tokenLinks = firstSync.tokenLinks;
		sdkMock.obr.scene.items.getItems.mockClear();
		sdkMock.obr.scene.items.addItems.mockClear();
		sdkMock.obr.scene.items.deleteItems.mockClear();
		sdkMock.obr.scene.items.updateItems.mockClear();

		await pushSnapshotToScene(current, current);

		expect(sdkMock.obr.scene.items.getItems).toHaveBeenCalledTimes(2);
		expect(sdkMock.obr.scene.items.addItems).not.toHaveBeenCalled();
		expect(sdkMock.obr.scene.items.deleteItems).not.toHaveBeenCalled();
		expect(sdkMock.obr.scene.items.updateItems).not.toHaveBeenCalled();
	});

	it("recreates all missing token rings in one addItems call", async () => {
		const items = mockScene();
		const current = snapshot([1, 2, 3]);
		const firstSync = await pushSnapshotToScene(current);
		current.tokenLinks = firstSync.tokenLinks;
		for (let index = items.length - 1; index >= 0; index -= 1) {
			if (items[index].metadata?.[OWLBEAR_TOKEN_RING_KEY] === true) items.splice(index, 1);
		}
		sdkMock.obr.scene.items.addItems.mockClear();

		await pushSnapshotToScene(current, current);

		expect(sdkMock.obr.scene.items.addItems).toHaveBeenCalledTimes(1);
		expect(items.filter((item) => item.metadata?.[OWLBEAR_TOKEN_RING_KEY] === true)).toHaveLength(3);
	});

	it("batches visual and marker updates across all participants", async () => {
		const items = mockScene();
		const initial = snapshot([1, 2, 3, 4]);
		const firstSync = await pushSnapshotToScene(initial);
		const bloodied = snapshot([1, 2, 3, 4]);
		for (const participant of bloodied.participants) participant.hpCurrent = 4;
		bloodied.tokenLinks = firstSync.tokenLinks;
		sdkMock.obr.scene.items.getItems.mockClear();
		sdkMock.obr.scene.items.addItems.mockClear();
		sdkMock.obr.scene.items.deleteItems.mockClear();
		sdkMock.obr.scene.items.updateItems.mockClear();

		await pushSnapshotToScene(bloodied, initial);

		expect(sdkMock.obr.scene.items.getItems).toHaveBeenCalledTimes(2);
		expect(sdkMock.obr.scene.items.updateItems).toHaveBeenCalledTimes(2);
		expect(sdkMock.obr.scene.items.addItems).toHaveBeenCalledTimes(1);
		expect(sdkMock.obr.scene.items.deleteItems).not.toHaveBeenCalled();
		const markerIcon = items.find((item) => item.type === "IMAGE" && item.metadata?.[OWLBEAR_MARKER_KIND_KEY] === "bloodied");
		expect(markerIcon.image.url).toBe("https://public-assets.trycloudflare.com/assets/session-secret/status-icons/bloodied.svg");
	});

	it("rejects snapshots without a public asset base URL", async () => {
		mockScene();
		const current = snapshot([1]);
		delete current.assetBaseUrl;

		await expect(pushSnapshotToScene(current)).rejects.toThrow("публичный адрес ресурсов");
	});
});
