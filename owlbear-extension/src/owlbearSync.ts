import OBR, { buildImage, buildShape, buildText } from "@owlbear-rodeo/sdk";
import { deriveMarkers, layoutMarkers } from "./overlays";
import {
	OWLBEAR_ENCOUNTER_ID_KEY,
	OWLBEAR_DEAD_OVERLAY_KEY,
	OWLBEAR_MARKER_KIND_KEY,
	OWLBEAR_MARKER_LAYOUT_KEY,
	OWLBEAR_PARTICIPANT_ID_KEY,
	OWLBEAR_SNAPSHOT_ID_KEY,
	OWLBEAR_TOKEN_RING_KEY,
	OWLBEAR_TURN_HIGHLIGHT_KEY,
	type MarkerKind,
	type OwlbearEncounterSnapshot,
	type OwlbearParticipantSnapshot,
	type OwlbearSyncDiagnostics,
} from "./types";

type SceneItem = {
	id: string;
	type?: string;
	name?: string;
	position?: { x: number; y: number };
	scale?: { x: number; y: number };
	metadata?: Record<string, unknown>;
	attachedTo?: string;
	image?: {
		url?: string;
		mime?: string;
		width?: number;
		height?: number;
	};
};

type SyncResult = {
	diagnostics: OwlbearSyncDiagnostics;
	tokenLinks: OwlbearEncounterSnapshot["tokenLinks"];
};

type ResolvedImage = {
	url: string;
	mime: string;
	width: number;
	height: number;
};

const DEFAULT_TOKEN_SIZE = 100;
const STATUS_ICON_SIZE = 100;
const TURN_HIGHLIGHT_Z_INDEX = -2;
const TOKEN_RING_Z_INDEX = 99;
const TOKEN_IMAGE_Z_INDEX = 100;
const MARKER_Z_INDEX = 2_000_000_000_000;
const MARKER_LAYOUT_VERSION = 11;
const LEGACY_TOKEN_LABEL_KEY = "club.ttg.dnd-dm-tools/tokenLabel";

export async function pushSnapshotToScene(
	snapshot: OwlbearEncounterSnapshot,
	previousSnapshot: OwlbearEncounterSnapshot | null = null,
): Promise<SyncResult> {
	const sceneReady = await OBR.scene.isReady();
	if (!sceneReady) {
		return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene."), tokenLinks: [] };
	}

	const sceneItems = await OBR.scene.items.getItems() as SceneItem[];
	const staleTokenIds = findStaleTokenIds(sceneItems, snapshot);
	if (staleTokenIds.length > 0) {
		const staleItems = await OBR.scene.items.getItems((item: SceneItem) =>
			staleTokenIds.includes(item.id) || staleTokenIds.includes(item.attachedTo ?? "")
		) as SceneItem[];
		await OBR.scene.items.deleteItems(staleItems.map((item) => item.id));
	}
	const currentSceneItems = staleTokenIds.length > 0
		? await OBR.scene.items.getItems() as SceneItem[]
		: sceneItems;
	const linkedTokens = findLinkedTokens(currentSceneItems, snapshot);
	const retainedTokenIds = new Set([...linkedTokens.values()].map((item) => item.id));
	const duplicateTokenIds = currentSceneItems
		.filter((item) => isManagedToken(item, snapshot.encounterId))
		.filter((item) => !retainedTokenIds.has(item.id))
		.map((item) => item.id);
	if (duplicateTokenIds.length > 0) {
		const duplicateItems = await OBR.scene.items.getItems((item: SceneItem) =>
			duplicateTokenIds.includes(item.id) || duplicateTokenIds.includes(item.attachedTo ?? "")
		) as SceneItem[];
		await OBR.scene.items.deleteItems(duplicateItems.map((item) => item.id));
	}
	const legacyLabelIds = currentSceneItems
		.filter((item) => item.metadata?.[LEGACY_TOKEN_LABEL_KEY] === true)
		.filter((item) => item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId)
		.map((item) => item.id);
	if (legacyLabelIds.length > 0) {
		await OBR.scene.items.deleteItems(legacyLabelIds);
	}
	const previousParticipants = new Map(previousSnapshot?.participants.map((participant) => [participant.participantId, participant]));
	const images = new Map<number, ResolvedImage>();
	for (const participant of snapshot.participants) {
		const image = resolveImage(participant.imageUrl, participant.imageMime, participant.imageWidth, participant.imageHeight);
		if (!image) throw new Error(`Не получен URL или MIME изображения токена для «${participant.name}».`);
		images.set(participant.participantId, image);
	}
	const itemsToCreate: unknown[] = [];
	const now = new Date().toISOString();
	const center = await OBR.viewport.getPosition();
	const gridDpi = await OBR.scene.grid.getDpi();
	const tokenSize = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
	let createdIndex = 0;

	for (const participant of snapshot.participants) {
		const existing = linkedTokens.get(participant.participantId);
		const previousParticipant = previousParticipants.get(participant.participantId);
		const resolvedImage = images.get(participant.participantId)!;
		if (existing) {
			if (existing.type !== "IMAGE") {
				const attachedItems = await OBR.scene.items.getItems((item: SceneItem) =>
					item.id === existing.id || item.attachedTo === existing.id
				) as SceneItem[];
				await OBR.scene.items.deleteItems(attachedItems.map((item) => item.id));
				const position = existing.position ?? center;
				itemsToCreate.push(...buildTokenItems(participant, snapshot, position, tokenSize, gridDpi, resolvedImage));
			} else {
				await updateImageToken(existing, participant, snapshot, resolvedImage, tokenSize);
				if (
					hasMarkerChange(participant, previousParticipant, snapshot.round, previousSnapshot?.round)
					|| await needsMarkerLayoutMigration(existing.id, snapshot.encounterId, participant, snapshot.round)
				) {
					const geometry = tokenGeometry(existing, tokenSize, gridDpi);
					await replaceMarkers(existing.id, participant, snapshot, geometry.center, geometry.diameter, gridDpi);
				}
				if (hasTurnHighlightChange(participant.participantId, snapshot, previousSnapshot)) {
					const geometry = tokenGeometry(existing, tokenSize, gridDpi);
					await replaceTurnHighlight(existing.id, participant, snapshot, geometry.center, geometry.diameter);
				}
			}
		} else {
			const position = clusterPosition(center, createdIndex, snapshot.participants.length, tokenSize);
			createdIndex += 1;
			itemsToCreate.push(...buildTokenItems(participant, snapshot, position, tokenSize, gridDpi, resolvedImage));
		}
	}

	if (itemsToCreate.length > 0) {
		await OBR.scene.items.addItems(itemsToCreate as never[]);
	}

	const refreshedItems = await OBR.scene.items.getItems() as SceneItem[];
	const diagnostics = createDiagnostics(snapshot, true, refreshedItems, findLinkedTokens(refreshedItems, snapshot), undefined, now);
	return { diagnostics, tokenLinks: createTokenLinks(refreshedItems, snapshot, now) };
}

function hasTokenVisualChange(
	participant: OwlbearParticipantSnapshot,
	previous: OwlbearParticipantSnapshot | undefined,
): boolean {
	return !previous
		|| participant.name !== previous.name
		|| participant.imageUrl !== previous.imageUrl
		|| participant.imageMime !== previous.imageMime
		|| participant.imageWidth !== previous.imageWidth
		|| participant.imageHeight !== previous.imageHeight
		|| participant.colorHex !== previous.colorHex;
}

function hasMarkerChange(
	participant: OwlbearParticipantSnapshot,
	previous: OwlbearParticipantSnapshot | undefined,
	round: number,
	previousRound: number | undefined,
): boolean {
	if (!previous || previousRound == null) return true;
	return JSON.stringify(deriveMarkers(participant, round)) !== JSON.stringify(deriveMarkers(previous, previousRound));
}

async function needsMarkerLayoutMigration(
	tokenId: string,
	encounterId: string,
	participant: OwlbearParticipantSnapshot,
	round: number,
): Promise<boolean> {
	const expectedMarkers = deriveMarkers(participant, round);
	const statusItems = await OBR.scene.items.getItems((item: SceneItem) =>
		item.attachedTo === tokenId
		&& item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId
		&& (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
	) as SceneItem[];
	if (expectedMarkers.length > 0 && statusItems.length === 0) return true;
	return statusItems.some((item) => item.metadata?.[OWLBEAR_MARKER_LAYOUT_KEY] !== MARKER_LAYOUT_VERSION);
}

function hasTurnHighlightChange(
	participantId: number,
	snapshot: OwlbearEncounterSnapshot,
	previous: OwlbearEncounterSnapshot | null,
): boolean {
	if (!previous) return true;
	const isHighlighted = snapshot.activeParticipantId === participantId || snapshot.nextParticipantId === participantId;
	const wasHighlighted = previous.activeParticipantId === participantId || previous.nextParticipantId === participantId;
	return isHighlighted !== wasHighlighted
		|| (isHighlighted && (snapshot.activeParticipantId === participantId) !== (previous.activeParticipantId === participantId));
}

export async function reconnectScene(snapshot: OwlbearEncounterSnapshot): Promise<SyncResult> {
	const sceneReady = await OBR.scene.isReady();
	if (!sceneReady) {
		return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene."), tokenLinks: [] };
	}

	const sceneItems = await OBR.scene.items.getItems() as SceneItem[];
	return {
		diagnostics: createDiagnostics(snapshot, true, sceneItems, findLinkedTokens(sceneItems, snapshot)),
		tokenLinks: createTokenLinks(sceneItems, snapshot, new Date().toISOString()),
	};
}

function createTokenLinks(items: SceneItem[], snapshot: OwlbearEncounterSnapshot, lastSeenAt: string): OwlbearEncounterSnapshot["tokenLinks"] {
	return [...findLinkedTokens(items, snapshot).entries()].map(([participantId, item]) => ({
		participantId,
		owlbearItemId: item.id,
		position: item.position,
		lastSeenAt,
	}));
}

function findLinkedTokens(items: SceneItem[], snapshot: OwlbearEncounterSnapshot): Map<number, SceneItem> {
	const linked = new Map<number, SceneItem>();
	const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
	const itemsById = new Map(items.map((item) => [item.id, item]));
	for (const link of snapshot.tokenLinks) {
		const item = itemsById.get(link.owlbearItemId);
		if (item && isManagedToken(item, snapshot.encounterId) && participantIds.has(link.participantId)) {
			linked.set(link.participantId, item);
		}
	}
	for (const item of items) {
		const metadata = item.metadata ?? {};
		if (!isManagedToken(item, snapshot.encounterId)) continue;
		const participantId = metadata[OWLBEAR_PARTICIPANT_ID_KEY];
		if (typeof participantId !== "number" || !participantIds.has(participantId) || linked.has(participantId)) continue;
		linked.set(participantId, item);
	}
	for (const item of items) {
		if (item.type !== "IMAGE" || linked.size === participantIds.size) break;
		const metadata = item.metadata ?? {};
		if (!isManagedToken(item, snapshot.encounterId)) continue;
		const participantId = metadata[OWLBEAR_PARTICIPANT_ID_KEY];
		if (typeof participantId !== "number" || !participantIds.has(participantId) || linked.has(participantId)) continue;
		linked.set(participantId, item);
	}
	return linked;
}

function isManagedToken(item: SceneItem, encounterId: string): boolean {
	const metadata = item.metadata ?? {};
	return item.type === "IMAGE"
		&& item.attachedTo == null
		&& metadata[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId
		&& metadata[OWLBEAR_PARTICIPANT_ID_KEY] != null
		&& !metadata[OWLBEAR_MARKER_KIND_KEY]
		&& metadata[OWLBEAR_DEAD_OVERLAY_KEY] !== true
		&& metadata[OWLBEAR_TOKEN_RING_KEY] !== true
		&& metadata[OWLBEAR_TURN_HIGHLIGHT_KEY] !== true;
}

function tokenGeometry(item: SceneItem, defaultDiameter: number, gridDpi: number): { center: { x: number; y: number }; diameter: number } {
	const scale = item.scale ? Math.max(Math.abs(item.scale.x), Math.abs(item.scale.y)) : 1;
	return {
		center: item.position ?? { x: 0, y: 0 },
		diameter: defaultDiameter * scale,
	};
}

export function findStaleTokenIds(items: SceneItem[], snapshot: OwlbearEncounterSnapshot): string[] {
	const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
	return items
		.filter((item) => isManagedToken(item, snapshot.encounterId))
		.filter((item) => {
			const participantId = item.metadata?.[OWLBEAR_PARTICIPANT_ID_KEY];
			return typeof participantId === "number" && !participantIds.has(participantId);
		})
		.map((item) => item.id);
}

async function updateImageToken(
	item: SceneItem,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	image: ResolvedImage,
	tokenSize: number,
) {
	await OBR.scene.items.updateItems([item] as never[], (items: any[]) => {
		for (const draft of items) {
			draft.name = participant.name;
			draft.zIndex = TOKEN_IMAGE_Z_INDEX;
			draft.disableAutoZIndex = true;
			draft.metadata = tokenMetadata(participant, snapshot);
			draft.text = { ...draft.text, plainText: participant.name, type: "PLAIN" };
			draft.textItemType = "LABEL";
			if (draft.image?.url !== image.url) {
				draft.image = {
					...draft.image,
					url: image.url,
					mime: image.mime,
					width: image.width,
					height: image.height,
				};
				draft.grid = {
					dpi: Math.max(image.width, image.height),
					offset: { x: image.width / 2, y: image.height / 2 },
				};
			}
		}
	});
	const attachments = await OBR.scene.items.getItems((candidate: SceneItem) =>
		candidate.attachedTo === item.id && candidate.metadata?.[OWLBEAR_TOKEN_RING_KEY] === true
	) as SceneItem[];
	if (attachments.length > 0) {
		await OBR.scene.items.updateItems(attachments as never[], (items: any[]) => {
			for (const draft of items) {
				draft.width = tokenSize;
				draft.height = tokenSize;
				draft.layer = "CHARACTER";
				draft.zIndex = TOKEN_RING_Z_INDEX;
				draft.disableAutoZIndex = true;
				if (draft.style) {
					draft.style.strokeColor = participantColor(participant);
				}
			}
		});
	}
}

async function replaceMarkers(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	center: { x: number; y: number },
	diameter: number,
	gridDpi: number,
) {
	const overlays = await OBR.scene.items.getItems((item: SceneItem) =>
		item.attachedTo === tokenId
		&& item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId
		&& (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
	) as SceneItem[];

	if (overlays.length > 0) {
		await OBR.scene.items.deleteItems(overlays.map((overlay) => overlay.id));
	}

	const statusItems = [
		...buildMarkerItems(tokenId, participant, snapshot, center, diameter, gridDpi),
	];
	if (statusItems.length > 0) await OBR.scene.items.addItems(statusItems as never[]);
}

function buildTokenItems(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number, gridDpi: number, image: ResolvedImage) {
	const token = buildTokenImage(participant, snapshot, position, tokenSize, image);
	return [
		token,
		buildTokenRing(participant, snapshot, position, token.id, tokenSize),
		...buildTurnHighlight(token.id, participant, snapshot, position, tokenSize),
		...buildMarkerItems(token.id, participant, snapshot, position, tokenSize, gridDpi),
	];
}

function buildTokenImage(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number, image: ResolvedImage) {
	return buildImage(
		{
			width: image.width,
			height: image.height,
			mime: image.mime,
			url: image.url,
		},
		{ dpi: Math.max(image.width, image.height), offset: { x: image.width / 2, y: image.height / 2 } },
	)
		.name(participant.name)
		.plainText(participant.name)
		.textItemType("LABEL")
		.position(position)
		.layer("CHARACTER")
		.zIndex(TOKEN_IMAGE_Z_INDEX)
		.disableAutoZIndex(true)
		.metadata(tokenMetadata(participant, snapshot))
		.build();
}

function buildTokenRing(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenId: string, tokenSize: number) {
	return buildShape()
		.shapeType("CIRCLE")
		.width(tokenSize)
		.height(tokenSize)
		.layer("CHARACTER")
		.zIndex(TOKEN_RING_Z_INDEX)
		.disableAutoZIndex(true)
		.position(position)
		.attachedTo(tokenId)
		.locked(true)
		.disableHit(true)
		.metadata({ ...tokenMetadata(participant, snapshot), [OWLBEAR_TOKEN_RING_KEY]: true })
		.style({
			fillColor: "#ffffff",
			fillOpacity: 0,
			strokeColor: participantColor(participant),
			strokeOpacity: 1,
			strokeWidth: 5,
			strokeDash: [],
		})
		.build();
}

async function replaceTurnHighlight(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	center: { x: number; y: number },
	diameter: number,
) {
	const highlights = await OBR.scene.items.getItems((item: SceneItem) =>
		item.attachedTo === tokenId && item.metadata?.[OWLBEAR_TURN_HIGHLIGHT_KEY] === true
	) as SceneItem[];
	if (highlights.length > 0) await OBR.scene.items.deleteItems(highlights.map((item) => item.id));
	const nextHighlight = buildTurnHighlight(tokenId, participant, snapshot, center, diameter);
	if (nextHighlight.length > 0) await OBR.scene.items.addItems(nextHighlight as never[]);
}

function buildTurnHighlight(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	position: { x: number; y: number },
	diameter: number,
) {
	const isActive = snapshot.activeParticipantId === participant.participantId;
	const isNext = !isActive && snapshot.nextParticipantId === participant.participantId;
	if (!isActive && !isNext) return [];
	const metadata = { ...tokenMetadata(participant, snapshot), [OWLBEAR_TURN_HIGHLIGHT_KEY]: true };
	return [buildShape()
		.shapeType("CIRCLE")
		.width(diameter + (isActive ? 32 : 20))
		.height(diameter + (isActive ? 32 : 20))
		.position(position)
		.attachedTo(tokenId)
		.layer("CHARACTER")
		.zIndex(TURN_HIGHLIGHT_Z_INDEX)
		.disableAutoZIndex(true)
		.locked(true)
		.disableHit(true)
		.metadata(metadata)
		.style({
			fillColor: "#000000",
			fillOpacity: 0,
			strokeColor: isActive ? "#fbbf24" : "#15803d",
			strokeOpacity: 1,
			strokeWidth: isActive ? 16 : 6,
			strokeDash: [],
		})
		.build()];
}

function buildMarkerItems(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	center: { x: number; y: number },
	diameter: number,
	gridDpi: number,
) {
	const iconSize = diameter * 0.2;
	const effectiveGridDpi = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
	const imageSize = Math.max(1, iconSize * 0.65);
	const iconDpi = STATUS_ICON_SIZE * effectiveGridDpi / imageSize;
	return layoutMarkers(deriveMarkers(participant, snapshot.round), diameter).flatMap(({ marker, x, y }, index) => {
		const position = { x: center.x + x, y: center.y + y };
		const metadata = {
			...tokenMetadata(participant, snapshot),
			[OWLBEAR_MARKER_KIND_KEY]: marker.kind satisfies MarkerKind,
			[OWLBEAR_MARKER_LAYOUT_KEY]: MARKER_LAYOUT_VERSION,
		};
		const zIndex = MARKER_Z_INDEX + index * 10;
		const background = buildShape()
			.shapeType("CIRCLE")
			.width(iconSize)
			.height(iconSize)
			.position(position)
			.attachedTo(tokenId)
			.layer("ATTACHMENT")
			.zIndex(zIndex)
			.disableAutoZIndex(true)
			.locked(true)
			.disableHit(true)
			.metadata(metadata)
			.style({ fillColor: "#111827", fillOpacity: 0.86, strokeColor: "#f8fafc", strokeOpacity: 0.9, strokeWidth: Math.max(1, diameter * 0.015), strokeDash: [] })
			.build();
		const icon = buildImage(
			{ width: STATUS_ICON_SIZE, height: STATUS_ICON_SIZE, mime: "image/svg+xml", url: statusIconUrl(marker.icon) },
			{ dpi: iconDpi, offset: { x: STATUS_ICON_SIZE / 2, y: STATUS_ICON_SIZE / 2 } },
		)
			.name(`${participant.name} ${marker.kind}`)
			.position(position)
			.attachedTo(tokenId)
			.layer("ATTACHMENT")
			.zIndex(zIndex + 1)
			.disableAutoZIndex(true)
			.locked(true)
			.disableHit(true)
			.metadata(metadata)
			.build();
		if (marker.remainingRounds == null) return [background, icon];
		const badgeSize = Math.max(10, iconSize * 0.55);
		const badgePosition = getConditionBadgePosition(position, iconSize);
		const badgeTextPosition = getConditionBadgeTextPosition(badgePosition, badgeSize);
		const badge = buildShape()
			.shapeType("CIRCLE")
			.width(badgeSize)
			.height(badgeSize)
			.position(badgePosition)
			.attachedTo(tokenId)
			.layer("ATTACHMENT")
			.zIndex(zIndex + 2)
			.disableAutoZIndex(true)
			.locked(true)
			.disableHit(true)
			.metadata(metadata)
			.style({ fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#eff6ff", strokeOpacity: 1, strokeWidth: 1, strokeDash: [] })
			.build();
		const text = String(marker.remainingRounds);
		const badgeText = buildText()
			.plainText(text)
			.textType("PLAIN")
			.width(badgeSize)
			.height(badgeSize)
			.padding(0)
			.fontSize(text.length > 2 ? 8 : 10)
			.fontWeight(700)
			.fillColor("#ffffff")
			.textAlign("CENTER")
			.textAlignVertical("MIDDLE")
			.position(badgeTextPosition)
			.attachedTo(tokenId)
			.layer("ATTACHMENT")
			.zIndex(zIndex + 3)
			.disableAutoZIndex(true)
			.locked(true)
			.disableHit(true)
			.metadata(metadata)
			.build();
		return [background, icon, badge, badgeText];
	});
}

export function getConditionBadgePosition(position: { x: number; y: number }, iconSize: number) {
	return { x: position.x + iconSize * 0.36, y: position.y + iconSize * 0.36 };
}

export function getConditionBadgeTextPosition(position: { x: number; y: number }, badgeSize: number) {
	return { x: position.x - badgeSize / 2, y: position.y - badgeSize / 2 };
}

function statusIconUrl(icon: string) {
	return new URL(`/status-icons/${icon}.svg`, window.location.origin).toString();
}

function tokenMetadata(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot) {
	return {
		[OWLBEAR_PARTICIPANT_ID_KEY]: participant.participantId,
		[OWLBEAR_ENCOUNTER_ID_KEY]: snapshot.encounterId,
		[OWLBEAR_SNAPSHOT_ID_KEY]: snapshot.snapshotId,
	};
}

function createDiagnostics(
	snapshot: OwlbearEncounterSnapshot,
	sceneReady: boolean,
	items: SceneItem[],
	linkedTokens: Map<number, SceneItem> | SceneItem[],
	lastError?: string,
	lastSyncAt?: string,
): OwlbearSyncDiagnostics {
	const linked = Array.isArray(linkedTokens) ? new Map<number, SceneItem>() : linkedTokens;
	const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
	const staleTokenIds = findStaleTokenIds(items, snapshot);
	const missingParticipantIds = snapshot.participants
		.filter((participant) => !linked.has(participant.participantId))
		.map((participant) => participant.participantId);

	return {
		sceneReady,
		snapshotLoaded: true,
		linkedCount: linked.size,
		participantCount: snapshot.participants.length,
		staleTokenIds,
		missingParticipantIds,
		fallbackParticipantIds: snapshot.participants.filter((participant) => participant.imageFallback).map((participant) => participant.participantId),
		lastSyncAt,
		lastError,
	};
}

function clusterPosition(center: { x: number; y: number }, index: number, total: number, tokenSize: number) {
	const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
	const row = Math.floor(index / columns);
	const column = index % columns;
	const rows = Math.ceil(total / columns);
	return {
		x: center.x + (column - (columns - 1) / 2) * tokenSize * 1.15,
		y: center.y + (row - (rows - 1) / 2) * tokenSize * 1.15,
	};
}

function participantColor(participant: OwlbearParticipantSnapshot) {
	return participant.colorHex ?? "#94a3b8";
}

function resolveImage(url: string | undefined, mime: string | undefined, width: number | undefined, height: number | undefined): ResolvedImage | null {
	if (!url || !mime || !mime.startsWith("image/") || !isImageDimension(width) || !isImageDimension(height)) return null;
	if (/^data:image\//i.test(url)) {
		return { url, mime, width, height };
	}
	return /^https?:\/\//i.test(url) ? { url, mime, width, height } : null;
}

function isImageDimension(value: number | undefined): value is number {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
