import type { Encounter } from "src/domain/models/encounter/Encounter";
import type { EncounterRuntimeState } from "src/domain/models/encounter/EncounterManager";

export const OWLBEAR_SYNC_SCHEMA_VERSION = 1;
export const OWLBEAR_METADATA_NAMESPACE = "club.ttg.dnd-dm-tools";
export const OWLBEAR_PARTICIPANT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/participantId`;
export const OWLBEAR_ENCOUNTER_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/encounterId`;
export const OWLBEAR_SNAPSHOT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/snapshotId`;

export interface OwlbearEncounterSnapshot {
	schemaVersion: 1;
	snapshotId: string;
	encounterId: string;
	encounterName: string;
	round: number;
	activeParticipantId: number | null;
	createdAt: string;
	participants: OwlbearParticipantSnapshot[];
	tokenLinks: OwlbearTokenLink[];
	diagnostics?: OwlbearSyncDiagnostics;
}

export interface OwlbearParticipantSnapshot {
	participantId: number;
	owlbearItemId?: string;
	name: string;
	imageUrl?: string;
	imageDataUrl?: string;
	initiative: number;
	hpCurrent: number;
	hpMax: number;
	hpTemporary: number;
	armorClass: number;
	side: "pc" | "enemy" | "neutral";
	colorHex?: string;
	isDead: boolean;
	isConcentrating?: boolean;
	conditions: OwlbearConditionSnapshot[];
}

export interface OwlbearConditionSnapshot {
	url: string;
	expiresOnRound: number | null;
}

export interface OwlbearTokenLink {
	participantId: number;
	owlbearItemId: string;
	position?: { x: number; y: number };
	lastSeenAt: string;
}

export interface OwlbearSyncDiagnostics {
	sceneReady: boolean;
	snapshotLoaded: boolean;
	linkedCount: number;
	participantCount: number;
	staleTokenIds: string[];
	missingParticipantIds: number[];
	lastSyncAt?: string;
	lastError?: string;
}

export function createOwlbearEncounterSnapshot(
	runtimeState: EncounterRuntimeState,
	encounterId: string,
	now = new Date(),
): OwlbearEncounterSnapshot {
	const activeParticipant = runtimeState.activeParticipantIndex == null
		? null
		: runtimeState.encounter.participants[runtimeState.activeParticipantIndex] ?? null;
	const createdAt = now.toISOString();

	return {
		schemaVersion: OWLBEAR_SYNC_SCHEMA_VERSION,
		snapshotId: createSnapshotId(now),
		encounterId,
		encounterName: runtimeState.encounter.name,
		round: runtimeState.round,
		activeParticipantId: activeParticipant?.id ?? null,
		createdAt,
		participants: runtimeState.encounter.participants.map((participant) => ({
			participantId: participant.id,
			owlbearItemId: participant.owlbearItemId,
			name: participant.name,
			imageUrl: participant.imageUrl || undefined,
			initiative: Number(participant.initiative ?? 0),
			hpCurrent: Number(participant.hpCurrent ?? 0),
			hpMax: Number(participant.hpMax ?? 0),
			hpTemporary: Number(participant.hpTemporary ?? 0),
			armorClass: Number(participant.armorClass ?? 10),
			side: normalizeSide(participant.side),
			colorHex: participant.colorHex,
			isDead: Boolean(participant.isDead),
			isConcentrating: Boolean(participant.isConcentrating),
			conditions: (participant.conditions ?? []).map((condition) => ({
				url: condition.url,
				expiresOnRound: condition.expiresOnRound ?? null,
			})),
		})),
		tokenLinks: runtimeState.encounter.participants
			.filter((participant) => Boolean(participant.owlbearItemId))
			.map((participant) => ({
				participantId: participant.id,
				owlbearItemId: participant.owlbearItemId!,
				lastSeenAt: createdAt,
			})),
	};
}

export function createEmptyOwlbearEncounterSnapshot(encounter: Encounter): OwlbearEncounterSnapshot {
	return createOwlbearEncounterSnapshot(
		{ encounter, activeParticipantIndex: null, round: 1 },
		createEncounterId(),
	);
}

export function createEncounterId(): string {
	return `encounter-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSnapshotId(now: Date): string {
	return `snapshot-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSide(side: unknown): "pc" | "enemy" | "neutral" {
	if (side === "pc" || side === "enemy" || side === "neutral") return side;
	return "neutral";
}
