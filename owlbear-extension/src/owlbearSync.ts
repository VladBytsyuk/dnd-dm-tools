import OBR, { buildImage, buildShape, buildText } from "@owlbear-rodeo/sdk";
import { deriveMarkers, layoutMarkers } from "./overlays";
import { resolveTokenVisualImage, type TokenImage } from "./tokenVisuals";
import {
	OWLBEAR_ENCOUNTER_ID_KEY,
	OWLBEAR_DEAD_OVERLAY_KEY,
	OWLBEAR_METADATA_NAMESPACE,
	OWLBEAR_MARKER_KIND_KEY,
	OWLBEAR_MARKER_LAYOUT_KEY,
	OWLBEAR_PARTICIPANT_ID_KEY,
	OWLBEAR_SNAPSHOT_ID_KEY,
	OWLBEAR_TOKEN_RING_KEY,
	OWLBEAR_TURN_HIGHLIGHT_KEY,
	OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY,
	type MarkerKind,
	type OwlbearEncounterSnapshot,
	type OwlbearParticipantSnapshot,
	type OwlbearSyncDiagnostics,
	type TurnHighlightRole,
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

type ResolvedImage = TokenImage;

const DEFAULT_TOKEN_SIZE = 100;
const STATUS_ICON_SIZE = 100;
const TURN_HIGHLIGHT_Z_INDEX = -2;
const TOKEN_RING_Z_INDEX = 99;
const TOKEN_IMAGE_Z_INDEX = 100;
const MARKER_Z_INDEX = 2_000_000_000_000;
const MARKER_LAYOUT_VERSION = 12;
const LEGACY_TOKEN_LABEL_KEY = "club.ttg.dnd-dm-tools/tokenLabel";

export async function pushSnapshotToScene(
	snapshot: OwlbearEncounterSnapshot,
	previousSnapshot: OwlbearEncounterSnapshot | null = null,
): Promise<SyncResult> {
	const assetBaseUrl = resolveAssetBaseUrl(snapshot.assetBaseUrl);
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
		images.set(participant.participantId, resolveTokenVisualImage(participant, image));
	}
	const itemsToCreate: unknown[] = [];
	const markerIdsToDelete = new Set<string>();
	const tokenUpdates = new Map<string, { participant: OwlbearParticipantSnapshot; image: ResolvedImage }>();
	const now = new Date().toISOString();
	const [viewportWidth, viewportHeight] = await Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]);
	const center = await OBR.viewport.inverseTransformPoint({ x: viewportWidth / 2, y: viewportHeight / 2 });
	const gridDpi = await OBR.scene.grid.getDpi();
	const tokenSize = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
	let createdIndex = 0;

	for (const participant of snapshot.participants) {
		const existing = linkedTokens.get(participant.participantId);
		const previousParticipant = previousParticipants.get(participant.participantId);
		const resolvedImage = images.get(participant.participantId)!;
		if (existing) {
			if (hasTokenVisualChange(participant, previousParticipant)) {
				tokenUpdates.set(existing.id, { participant, image: resolvedImage });
			}
			if (
				hasMarkerChange(participant, previousParticipant, snapshot.round, previousSnapshot?.round)
				|| needsMarkerLayoutMigration(currentSceneItems, existing.id, snapshot.encounterId, participant, snapshot.round)
			) {
				const geometry = tokenGeometry(existing, tokenSize, gridDpi);
				queueMarkerReplacement(
					currentSceneItems,
					existing.id,
					participant,
					snapshot,
					geometry.center,
					geometry.diameter,
					gridDpi,
					assetBaseUrl,
					markerIdsToDelete,
					itemsToCreate,
				);
			}
		} else {
			const position = clusterPosition(center, createdIndex, snapshot.participants.length, tokenSize);
			createdIndex += 1;
			itemsToCreate.push(...buildTokenItems(participant, snapshot, position, tokenSize, gridDpi, resolvedImage, assetBaseUrl));
		}
	}
	if (markerIdsToDelete.size > 0) {
		await OBR.scene.items.deleteItems([...markerIdsToDelete]);
	}
	await updateImageTokens(currentSceneItems, linkedTokens, tokenUpdates, snapshot, tokenSize, itemsToCreate);

	if (itemsToCreate.length > 0) {
		await OBR.scene.items.addItems(itemsToCreate as never[]);
	}

	const refreshedItems = await OBR.scene.items.getItems() as SceneItem[];
	await reconcileTurnHighlights(snapshot, refreshedItems, tokenSize, gridDpi);
	await focusActiveParticipant(snapshot, previousSnapshot, refreshedItems);
	const diagnostics = createDiagnostics(snapshot, true, refreshedItems, findLinkedTokens(refreshedItems, snapshot), undefined, now);
	return { diagnostics, tokenLinks: createTokenLinks(refreshedItems, snapshot, now) };
}

async function focusActiveParticipant(
	snapshot: OwlbearEncounterSnapshot,
	previousSnapshot: OwlbearEncounterSnapshot | null,
	items: SceneItem[],
): Promise<void> {
	if (snapshot.activeParticipantId == null || snapshot.activeParticipantId === previousSnapshot?.activeParticipantId) return;
	const token = findLinkedTokens(items, snapshot).get(snapshot.activeParticipantId);
	if (!token?.position) return;
	try {
		const [viewportPosition, scale, viewportWidth, viewportHeight] = await Promise.all([
			OBR.viewport.getPosition(),
			OBR.viewport.getScale(),
			OBR.viewport.getWidth(),
			OBR.viewport.getHeight(),
		]);
		const viewportCenter = await OBR.viewport.inverseTransformPoint({ x: viewportWidth / 2, y: viewportHeight / 2 });
		await OBR.viewport.animateTo({
			position: {
				x: viewportPosition.x + viewportCenter.x - token.position.x,
				y: viewportPosition.y + viewportCenter.y - token.position.y,
			},
			scale,
		});
	} catch {
		// The scene changes are still valid if Owlbear cannot move the local viewport.
	}
}

export async function clearManagedSceneItems(): Promise<void> {
	if (!(await OBR.scene.isReady())) return;
	const items = await OBR.scene.items.getItems() as SceneItem[];
	const managedIds = items
		.filter((item) => Object.keys(item.metadata ?? {}).some((key) => key.startsWith(`${OWLBEAR_METADATA_NAMESPACE}/`)))
		.map((item) => item.id);
	if (managedIds.length > 0) await OBR.scene.items.deleteItems(managedIds);
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
		|| participant.colorHex !== previous.colorHex
		|| participant.hpCurrent !== previous.hpCurrent
		|| participant.isDead !== previous.isDead;
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

function needsMarkerLayoutMigration(
	items: SceneItem[],
	tokenId: string,
	encounterId: string,
	participant: OwlbearParticipantSnapshot,
	round: number,
): boolean {
	const expectedMarkers = deriveMarkers(participant, round);
	const statusItems = items.filter((item) =>
		item.attachedTo === tokenId
		&& item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId
		&& (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
	);
	if (statusItems.some((item) => item.metadata?.[OWLBEAR_MARKER_KIND_KEY] === "dead" || item.metadata?.[OWLBEAR_MARKER_KIND_KEY] === "down" || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)) return true;
	if (expectedMarkers.length > 0 && statusItems.length === 0) return true;
	return statusItems.some((item) => item.metadata?.[OWLBEAR_MARKER_LAYOUT_KEY] !== MARKER_LAYOUT_VERSION);
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

async function updateImageTokens(
	items: SceneItem[],
	linkedTokens: Map<number, SceneItem>,
	updates: Map<string, { participant: OwlbearParticipantSnapshot; image: ResolvedImage }>,
	snapshot: OwlbearEncounterSnapshot,
	tokenSize: number,
	itemsToCreate: unknown[],
) {
	if (updates.size > 0) {
		const tokens = items.filter((item) => updates.has(item.id));
		await OBR.scene.items.updateItems(tokens as never[], (drafts: any[]) => {
			for (const draft of drafts) {
				const update = updates.get(draft.id);
				if (!update) continue;
				const { participant, image } = update;
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
	}

	const participantsByTokenId = new Map<string, OwlbearParticipantSnapshot>();
	for (const participant of snapshot.participants) {
		const token = linkedTokens.get(participant.participantId);
		if (token) participantsByTokenId.set(token.id, participant);
	}
	const rings = items.filter((item) => item.metadata?.[OWLBEAR_TOKEN_RING_KEY] === true && item.attachedTo && participantsByTokenId.has(item.attachedTo));
	const ringTokenIds = new Set(rings.map((ring) => ring.attachedTo!));
	const ringsToUpdate = rings.filter((ring) => ring.attachedTo && updates.has(ring.attachedTo));
	if (ringsToUpdate.length > 0) {
		await OBR.scene.items.updateItems(ringsToUpdate as never[], (drafts: any[]) => {
			for (const draft of drafts) {
				const participant = participantsByTokenId.get(draft.attachedTo);
				if (!participant) continue;
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
	for (const [participantId, token] of linkedTokens) {
		if (ringTokenIds.has(token.id)) continue;
		const participant = snapshot.participants.find((candidate) => candidate.participantId === participantId);
		if (!participant) continue;
		itemsToCreate.push(buildTokenRing(participant, snapshot, token.position ?? { x: 0, y: 0 }, token.id, tokenSize));
	}
}

function queueMarkerReplacement(
	items: SceneItem[],
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	center: { x: number; y: number },
	diameter: number,
	gridDpi: number,
	assetBaseUrl: string,
	markerIdsToDelete: Set<string>,
	itemsToCreate: unknown[],
): void {
	const overlays = items.filter((item) =>
		item.attachedTo === tokenId
		&& item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId
		&& (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
	);

	for (const overlay of overlays) markerIdsToDelete.add(overlay.id);
	itemsToCreate.push(...buildMarkerItems(tokenId, participant, snapshot, center, diameter, gridDpi, assetBaseUrl));
}

function buildTokenItems(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number, gridDpi: number, image: ResolvedImage, assetBaseUrl: string) {
	const token = buildTokenImage(participant, snapshot, position, tokenSize, image);
	return [
		token,
		buildTokenRing(participant, snapshot, position, token.id, tokenSize),
		...buildTurnHighlight(token.id, participant, snapshot, position, tokenSize),
		...buildMarkerItems(token.id, participant, snapshot, position, tokenSize, gridDpi, assetBaseUrl),
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

async function reconcileTurnHighlights(
	snapshot: OwlbearEncounterSnapshot,
	items: SceneItem[],
	defaultDiameter: number,
	gridDpi: number,
): Promise<void> {
	const linkedTokens = findLinkedTokens(items, snapshot);
	const linkedTokenIds = new Set([...linkedTokens.values()].map((item) => item.id));
	const highlights = items.filter((item) =>
		item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId
		&& item.metadata?.[OWLBEAR_TURN_HIGHLIGHT_KEY] === true
	);
	const highlightsByTokenId = new Map<string, SceneItem[]>();
	const idsToDelete = new Set<string>();
	const itemsToAdd: unknown[] = [];

	for (const highlight of highlights) {
		if (!highlight.attachedTo || !linkedTokenIds.has(highlight.attachedTo)) {
			idsToDelete.add(highlight.id);
			continue;
		}
		const tokenHighlights = highlightsByTokenId.get(highlight.attachedTo) ?? [];
		tokenHighlights.push(highlight);
		highlightsByTokenId.set(highlight.attachedTo, tokenHighlights);
	}

	for (const participant of snapshot.participants) {
		const token = linkedTokens.get(participant.participantId);
		if (!token) continue;
		const expectedRole = getTurnHighlightRole(participant.participantId, snapshot);
		const tokenHighlights = highlightsByTokenId.get(token.id) ?? [];
		if (expectedRole === null) {
			for (const highlight of tokenHighlights) idsToDelete.add(highlight.id);
			continue;
		}
		if (
			tokenHighlights.length === 1
			&& tokenHighlights[0].metadata?.[OWLBEAR_PARTICIPANT_ID_KEY] === participant.participantId
			&& tokenHighlights[0].metadata?.[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY] === expectedRole
		) {
			continue;
		}
		for (const highlight of tokenHighlights) idsToDelete.add(highlight.id);
		const geometry = tokenGeometry(token, defaultDiameter, gridDpi);
		itemsToAdd.push(...buildTurnHighlight(token.id, participant, snapshot, geometry.center, geometry.diameter));
	}

	if (idsToDelete.size > 0) await OBR.scene.items.deleteItems([...idsToDelete]);
	if (itemsToAdd.length > 0) await OBR.scene.items.addItems(itemsToAdd as never[]);
}

function buildTurnHighlight(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	position: { x: number; y: number },
	diameter: number,
) {
	const role = getTurnHighlightRole(participant.participantId, snapshot);
	if (role === null) return [];
	const isActive = role === "active";
	const metadata = {
		...tokenMetadata(participant, snapshot),
		[OWLBEAR_TURN_HIGHLIGHT_KEY]: true,
		[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY]: role,
	};
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

function getTurnHighlightRole(participantId: number, snapshot: OwlbearEncounterSnapshot): TurnHighlightRole | null {
	if (snapshot.activeParticipantId === participantId) return "active";
	if (snapshot.nextParticipantId === participantId) return "next";
	return null;
}

function buildMarkerItems(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	center: { x: number; y: number },
	diameter: number,
	gridDpi: number,
	assetBaseUrl: string,
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
			{ width: STATUS_ICON_SIZE, height: STATUS_ICON_SIZE, mime: "image/svg+xml", url: statusIconUrl(marker.icon, assetBaseUrl) },
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

function statusIconUrl(icon: string, assetBaseUrl: string) {
	return `${assetBaseUrl}/status-icons/${icon}.svg`;
}

function resolveAssetBaseUrl(value: string | undefined): string {
	if (!value) throw new Error("Не получен публичный адрес ресурсов Owlbear.");
	const url = new URL(value);
	if (url.protocol !== "https:" || !/\.trycloudflare\.com$/i.test(url.hostname)) throw new Error("Получен недопустимый публичный адрес ресурсов Owlbear.");
	return url.toString().replace(/\/$/, "");
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
	return /^https:\/\//i.test(url) ? { url, mime, width, height } : null;
}

function isImageDimension(value: number | undefined): value is number {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
