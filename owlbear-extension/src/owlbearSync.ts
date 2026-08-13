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
};

type ResolvedImage = {
	url: string;
	mime: string;
};

const DEFAULT_TOKEN_SIZE = 100;

export async function pushSnapshotToScene(snapshot: OwlbearEncounterSnapshot): Promise<SyncResult> {
	const sceneReady = await OBR.scene.isReady();
	if (!sceneReady) {
		return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene.") };
	}

	const sceneItems = await OBR.scene.items.getItems() as SceneItem[];
	const linkedTokens = findLinkedTokens(sceneItems, snapshot);
	const itemsToCreate: unknown[] = [];
	const now = new Date().toISOString();
	const center = await OBR.viewport.getPosition();
	const gridDpi = await OBR.scene.grid.getDpi();
	const tokenSize = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
	let createdIndex = 0;

	for (const participant of snapshot.participants) {
		const existing = linkedTokens.get(participant.participantId);
		const resolvedImage = await resolveImage(participant.imageDataUrl ?? participant.imageUrl);
		if (existing) {
			if ((existing.type !== "IMAGE" && resolvedImage) || (existing.type === "IMAGE" && !resolvedImage)) {
				const attachedItems = await OBR.scene.items.getItems((item: SceneItem) =>
					item.id === existing.id || item.attachedTo === existing.id
				) as SceneItem[];
				await OBR.scene.items.deleteItems(attachedItems.map((item) => item.id));
				const position = existing.position ?? center;
				itemsToCreate.push(...await buildTokenItems(participant, snapshot, position, tokenSize));
			} else if (existing.type === "IMAGE" && resolvedImage) {
				await updateImageToken(existing, participant, snapshot, resolvedImage, tokenSize);
				await replaceMarkers(existing.id, participant, snapshot);
			} else {
				await updateToken(existing, participant, snapshot);
				await replaceMarkers(existing.id, participant, snapshot);
			}
		} else {
			const position = clusterPosition(center, createdIndex, snapshot.participants.length, tokenSize);
			createdIndex += 1;
			itemsToCreate.push(...await buildTokenItems(participant, snapshot, position, tokenSize));
		}
	}

	if (itemsToCreate.length > 0) {
		await OBR.scene.items.addItems(itemsToCreate as never[]);
	}

	const refreshedItems = await OBR.scene.items.getItems() as SceneItem[];
	const diagnostics = createDiagnostics(snapshot, true, refreshedItems, findLinkedTokens(refreshedItems, snapshot), undefined, now);
	return { diagnostics };
}

export async function reconnectScene(snapshot: OwlbearEncounterSnapshot): Promise<SyncResult> {
	const sceneReady = await OBR.scene.isReady();
	if (!sceneReady) {
		return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene.") };
	}

	const sceneItems = await OBR.scene.items.getItems() as SceneItem[];
	return {
		diagnostics: createDiagnostics(snapshot, true, sceneItems, findLinkedTokens(sceneItems, snapshot)),
	};
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

async function updateToken(item: SceneItem, participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot) {
	await OBR.scene.items.updateItems([item] as never[], (items: any[]) => {
		for (const draft of items) {
			draft.name = participant.name;
			draft.metadata = {
				...(draft.metadata ?? {}),
				...tokenMetadata(participant, snapshot),
			};
			if (draft.style) {
				draft.style.fillColor = tokenInteriorColor();
				draft.style.strokeColor = participant.isDead || participant.hpCurrent <= 0 ? "#111827" : participantColor(participant);
				draft.style.strokeWidth = participant.isDead || participant.hpCurrent <= 0 ? 8 : 4;
			}
		}
	});
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
			draft.image = {
				...draft.image,
				url: image.url,
				mime: image.mime,
				width: tokenSize,
				height: tokenSize,
			};
			draft.grid = {
				dpi: tokenSize,
				offset: { x: tokenSize / 2, y: tokenSize / 2 },
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

	const labels = [
		buildNameLabel(tokenId, participant, snapshot),
		...buildMarkerLabels(tokenId, participant, snapshot),
	];
	await OBR.scene.items.addItems(labels as never[]);
}

async function buildTokenItems(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number) {
	const image = await resolveImage(participant.imageDataUrl ?? participant.imageUrl);
	const hasImage = Boolean(image);
	const token = hasImage
		? buildTokenImage(participant, snapshot, position, tokenSize, image!)
		: buildToken(participant, snapshot, position, tokenSize);
	return [
		token,
		...(hasImage ? [buildTokenRing(participant, position, token.id, tokenSize)] : []),
		buildNameLabel(token.id, participant, snapshot),
		...buildMarkerLabels(token.id, participant, snapshot),
	];
}

function buildToken(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number) {
	const defeated = participant.isDead || participant.hpCurrent <= 0;
	const builder: any = buildShape()
		.shapeType("CIRCLE")
		.width(tokenSize)
		.height(tokenSize)
		.layer("CHARACTER")
		.name(participant.name)
		.position(position)
		.metadata(tokenMetadata(participant, snapshot))
		.style({
			fillColor: tokenInteriorColor(),
			fillOpacity: defeated ? 0.45 : 0.75,
			strokeColor: defeated ? "#111827" : participantColor(participant),
			strokeOpacity: 1,
			strokeWidth: defeated ? 8 : 4,
			strokeDash: [],
		});

	return builder.build();
}

function buildTokenImage(participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot, position: { x: number; y: number }, tokenSize: number, image: ResolvedImage) {
	return buildImage(
		{
			width: tokenSize,
			height: tokenSize,
			mime: image.mime,
			url: image.url,
		},
		{ dpi: tokenSize, offset: { x: tokenSize / 2, y: tokenSize / 2 } },
	)
		.name(participant.name)
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
			fillColor: tokenInteriorColor(),
			fillOpacity: 0,
			strokeColor: participant.isDead || participant.hpCurrent <= 0 ? "#111827" : participantColor(participant),
			strokeOpacity: 1,
			strokeWidth: 5,
			strokeDash: [],
		})
		.build();
}

function buildNameLabel(tokenId: string, participant: OwlbearParticipantSnapshot, snapshot: OwlbearEncounterSnapshot) {
	return buildLabelItem(tokenId, participant, snapshot, {
		kind: "label",
		text: participant.name,
		color: "#111827",
	}, { x: 0, y: 48 });
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
		.backgroundColor(marker.kind === "label" ? sideColor(participant.side) : marker.color)
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

function sideColor(side: OwlbearParticipantSnapshot["side"]) {
	if (side === "pc") return "#22c55e";
	if (side === "enemy") return "#ef4444";
	return "#3b82f6";
}

function participantColor(participant: OwlbearParticipantSnapshot) {
	return participant.colorHex ?? "#94a3b8";
}

function tokenInteriorColor() {
	return "#f8fafc";
}

async function resolveImage(url: string | undefined): Promise<ResolvedImage | null> {
	if (!url || (!/^https:\/\//i.test(url) && !/^data:image\//i.test(url))) return null;
	if (/^data:image\//i.test(url)) {
		const mime = url.slice(5, url.indexOf(";"));
		return { url, mime };
	}
	try {
		const response = await fetch(url);
		if (!response.ok) return null;
		const blob = await response.blob();
		if (!blob.type.startsWith("image/")) return null;
		const bytes = new Uint8Array(await blob.arrayBuffer());
		let binary = "";
		for (let index = 0; index < bytes.length; index += 1) {
			binary += String.fromCharCode(bytes[index]);
		}
		return {
			url: `data:${blob.type};base64,${btoa(binary)}`,
			mime: blob.type,
		};
	} catch {
		return null;
	}
}
