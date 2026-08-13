import OBR, { buildImage, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { deriveMarkers } from "./overlays";
import {
	OWLBEAR_ENCOUNTER_ID_KEY,
	OWLBEAR_MARKER_KIND_KEY,
	OWLBEAR_PARTICIPANT_ID_KEY,
	OWLBEAR_SNAPSHOT_ID_KEY,
	type MarkerKind,
	type OwlbearEncounterSnapshot,
	type OwlbearParticipantSnapshot,
	type OwlbearSyncDiagnostics,
	type TokenMarker,
} from "./types";

type SceneItem = {
	id: string;
	type?: string;
	name?: string;
	position?: { x: number; y: number };
	metadata?: Record<string, unknown>;
	attachedTo?: string;
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

export async function pushSnapshotToScene(snapshot: OwlbearEncounterSnapshot): Promise<SyncResult> {
	const sceneReady = await OBR.scene.isReady();
	if (!sceneReady) {
		return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene."), tokenLinks: [] };
	}

	const sceneItems = await OBR.scene.items.getItems() as SceneItem[];
	const linkedTokens = findLinkedTokens(sceneItems, snapshot);
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
		const resolvedImage = images.get(participant.participantId)!;
		if (existing) {
			if (existing.type !== "IMAGE") {
				const attachedItems = await OBR.scene.items.getItems((item: SceneItem) =>
					item.id === existing.id || item.attachedTo === existing.id
				) as SceneItem[];
				await OBR.scene.items.deleteItems(attachedItems.map((item) => item.id));
				const position = existing.position ?? center;
				itemsToCreate.push(...await buildTokenItems(participant, snapshot, position, tokenSize, resolvedImage));
			} else {
				await updateImageToken(existing, participant, snapshot, resolvedImage, tokenSize);
				await replaceMarkers(existing.id, participant, snapshot);
			}
		} else {
			const position = clusterPosition(center, createdIndex, snapshot.participants.length, tokenSize);
			createdIndex += 1;
			itemsToCreate.push(...await buildTokenItems(participant, snapshot, position, tokenSize, resolvedImage));
		}
	}

	if (itemsToCreate.length > 0) {
		await OBR.scene.items.addItems(itemsToCreate as never[]);
	}

	const refreshedItems = await OBR.scene.items.getItems() as SceneItem[];
	const diagnostics = createDiagnostics(snapshot, true, refreshedItems, findLinkedTokens(refreshedItems, snapshot), undefined, now);
	return { diagnostics, tokenLinks: createTokenLinks(refreshedItems, snapshot, now) };
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
	for (const item of items) {
		const metadata = item.metadata ?? {};
		if (metadata[OWLBEAR_MARKER_KIND_KEY]) continue;
		if (metadata[OWLBEAR_ENCOUNTER_ID_KEY] !== snapshot.encounterId) continue;
		const participantId = metadata[OWLBEAR_PARTICIPANT_ID_KEY];
		if (typeof participantId !== "number") continue;
		linked.set(participantId, item);
	}
	return linked;
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
			draft.metadata = tokenMetadata(participant, snapshot);
			draft.text = { ...draft.text, plainText: participant.name, type: "PLAIN" };
			draft.textItemType = "LABEL";
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
	});

	const attachments = await OBR.scene.items.getItems((candidate: SceneItem) =>
		candidate.attachedTo === item.id && candidate.type === "SHAPE"
	) as SceneItem[];
	if (attachments.length > 0) {
		await OBR.scene.items.updateItems(attachments as never[], (items: any[]) => {
			for (const draft of items) {
				draft.width = tokenSize + 8;
				draft.height = tokenSize + 8;
				if (draft.style) {
					draft.style.strokeColor = participant.isDead || participant.hpCurrent <= 0
						? "#111827"
						: participantColor(participant);
				}
			}
		});
	}
}

async function replaceMarkers(tokenId: string, participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot) {
	const overlays = await OBR.scene.items.getItems((item: SceneItem) =>
		item.attachedTo === tokenId
		&& item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId
		&& Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY])
	) as SceneItem[];

	if (overlays.length > 0) {
		await OBR.scene.items.deleteItems(overlays.map((overlay) => overlay.id));
	}

	const markers = buildMarkerLabels(tokenId, participant, snapshot);
	if (markers.length > 0) await OBR.scene.items.addItems(markers as never[]);
}

async function buildTokenItems(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number, image: ResolvedImage) {
	const token = buildTokenImage(participant, snapshot, position, tokenSize, image);
	return [
		token,
		buildTokenRing(participant, position, token.id, tokenSize),
		...buildMarkerLabels(token.id, participant, snapshot),
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
		.textAlign("CENTER")
		.textAlignVertical("BOTTOM")
		.position(position)
		.layer("CHARACTER")
		.metadata(tokenMetadata(participant, snapshot))
		.build();
}

function buildTokenRing(participant: OwlbearParticipantSnapshot, position: { x: number; y: number }, tokenId: string, tokenSize: number) {
	return buildShape()
		.shapeType("CIRCLE")
		.width(tokenSize + 8)
		.height(tokenSize + 8)
		.layer("CHARACTER")
		.position(position)
		.attachedTo(tokenId)
		.style({
			fillColor: "#ffffff",
			fillOpacity: 0,
			strokeColor: participant.isDead || participant.hpCurrent <= 0 ? "#111827" : participantColor(participant),
			strokeOpacity: 1,
			strokeWidth: 5,
			strokeDash: [],
		})
		.build();
}

function buildMarkerLabels(tokenId: string, participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot) {
	return deriveMarkers(participant, snapshot.round).map((marker, index) =>
		buildLabelItem(tokenId, participant, snapshot, marker, { x: -32 + index * 22, y: -42 })
	);
}

function buildLabelItem(
	tokenId: string,
	participant: OwlbearParticipantSnapshot,
	snapshot: OwlbearEncounterSnapshot,
	marker: TokenMarker,
	position: { x: number; y: number },
) {
	const builder: any = buildLabel()
		.plainText(marker.text)
		.attachedTo(tokenId)
		.position(position)
		.layer("ATTACHMENT")
		.name(`${participant.name} ${marker.kind}`)
		.metadata({
			...tokenMetadata(participant, snapshot),
			[OWLBEAR_MARKER_KIND_KEY]: marker.kind satisfies MarkerKind,
		})
		.fillColor("#ffffff")
		.backgroundColor(marker.color)
		.backgroundOpacity(0.9);

	return builder.build();
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
	const staleTokenIds = items
		.filter((item) => item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId)
		.filter((item) => !item.metadata?.[OWLBEAR_MARKER_KIND_KEY])
		.filter((item) => {
			const participantId = item.metadata?.[OWLBEAR_PARTICIPANT_ID_KEY];
			return typeof participantId === "number" && !participantIds.has(participantId);
		})
		.map((item) => item.id);
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
