export const OWLBEAR_SYNC_SCHEMA_VERSION = 1;
export const OWLBEAR_METADATA_NAMESPACE = "club.ttg.dnd-dm-tools";
export const OWLBEAR_PARTICIPANT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/participantId`;
export const OWLBEAR_ENCOUNTER_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/encounterId`;
export const OWLBEAR_SNAPSHOT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/snapshotId`;
export const OWLBEAR_MARKER_KIND_KEY = `${OWLBEAR_METADATA_NAMESPACE}/markerKind`;
export const OWLBEAR_TOKEN_RING_KEY = `${OWLBEAR_METADATA_NAMESPACE}/tokenRing`;
export const OWLBEAR_TURN_HIGHLIGHT_KEY = `${OWLBEAR_METADATA_NAMESPACE}/turnHighlight`;
export const OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY = `${OWLBEAR_METADATA_NAMESPACE}/turnHighlightRole`;
export const OWLBEAR_DEAD_OVERLAY_KEY = `${OWLBEAR_METADATA_NAMESPACE}/deadOverlay`;
export const OWLBEAR_MARKER_LAYOUT_KEY = `${OWLBEAR_METADATA_NAMESPACE}/markerLayout`;
export const OWLBEAR_PREVIEW_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/previewId`;
export const OWLBEAR_PREVIEW_KIND_KEY = `${OWLBEAR_METADATA_NAMESPACE}/previewKind`;
export const OWLBEAR_PUBLIC_INITIATIVE_KEY = `${OWLBEAR_METADATA_NAMESPACE}/publicInitiative`;

export interface OwlbearEncounterSnapshot {
	schemaVersion: 1;
	snapshotId: string;
	encounterId: string;
	encounterName: string;
	round: number;
	activeParticipantId: number | null;
	nextParticipantId: number | null;
	createdAt: string;
	assetBaseUrl?: string;
	participants: OwlbearParticipantSnapshot[];
	tokenLinks: OwlbearTokenLink[];
	diagnostics?: OwlbearSyncDiagnostics;
}

export interface OwlbearParticipantSnapshot {
	participantId: number;
	owlbearItemId?: string;
	name: string;
	imageSource?: string;
	imageUrl?: string;
	imageAssetId?: string;
	imageDataUrl?: string;
	imageFallback?: boolean;
	imageMime?: string;
	imageWidth?: number;
	imageHeight?: number;
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
	fallbackParticipantIds: number[];
}

export interface OwlbearPreviewSnapshot {
	schemaVersion: 1;
	previewId: string;
	name: string;
	createdAt: string;
	imageMime: string;
	imageWidth: number;
	imageHeight: number;
	imageAssetId?: string;
	imageUrl?: string;
}

export type MarkerKind = "bloodied" | "concentration" | "condition";
export type TurnHighlightRole = "active" | "next";

export interface TokenMarker {
	kind: MarkerKind;
	icon: string;
	conditionUrl?: string;
	remainingRounds?: number;
}

/**
 * The only encounter data shared through Owlbear scene metadata.
 * Keep this separate from OwlbearEncounterSnapshot: the latter is GM-local
 * and deliberately includes data that players must not receive.
 */
export interface PublicInitiativeState {
	schemaVersion: 1;
	round: number;
	participants: PublicInitiativeParticipant[];
}

export interface PublicInitiativeParticipant {
	name: string;
	color: string;
	portraitUrl?: string;
	initiative: number;
	isActive: boolean;
	statuses: PublicInitiativeStatus[];
}

export type PublicInitiativeStatusKind = "bloodied" | "concentration" | "condition" | "down" | "dead";

export interface PublicInitiativeStatus {
	kind: PublicInitiativeStatusKind;
	icon: string;
	remainingRounds?: number;
}
