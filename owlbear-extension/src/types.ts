export const OWLBEAR_SYNC_SCHEMA_VERSION = 1;
export const OWLBEAR_METADATA_NAMESPACE = "club.ttg.dnd-dm-tools";
export const OWLBEAR_PARTICIPANT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/participantId`;
export const OWLBEAR_ENCOUNTER_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/encounterId`;
export const OWLBEAR_SNAPSHOT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/snapshotId`;
export const OWLBEAR_MARKER_KIND_KEY = `${OWLBEAR_METADATA_NAMESPACE}/markerKind`;

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

export type MarkerKind = "label" | "bloodied" | "defeated" | "concentration" | "condition-duration";

export interface TokenMarker {
	kind: MarkerKind;
	text: string;
	color: string;
}
